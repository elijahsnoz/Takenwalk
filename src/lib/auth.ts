import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "@auth/core/errors";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { verifyAndTrackPinAttempt } from "@/lib/pinAuth";

type Role = "ADMIN" | "CUSTOMER";

// Distinct code so the login/register forms can show "try again in 15
// minutes" instead of the generic wrong-PIN message — plain thrown Errors
// get collapsed into a generic "CredentialsSignin" by Auth.js, but a
// CredentialsSignin subclass's `code` survives to the client's signIn() result.
export class PinLockedError extends CredentialsSignin {
  code = "pin-locked";
}

declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // Two separate, lower-trust session types share this one auth config
    // (admin email+password vs. customer phone+PIN) — this is the one place
    // that decides who gets into /admin vs /account, so it checks role, not
    // just "is anyone logged in".
    authorized: ({ auth, request }) => {
      const { pathname, origin } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        if (auth?.user?.role === "ADMIN") return true;
        const url = new URL("/login", origin);
        url.searchParams.set("callbackUrl", pathname);
        return Response.redirect(url);
      }

      if (pathname.startsWith("/account")) {
        if (auth?.user?.role === "CUSTOMER") return true;
        const url = new URL("/account/login", origin);
        url.searchParams.set("callbackUrl", pathname);
        return Response.redirect(url);
      }

      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin || !admin.isActive) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return { id: admin.id, email: admin.email, name: admin.name, role: "ADMIN" };
      },
    }),
    Credentials({
      id: "customer-pin",
      name: "Customer PIN",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        pin: { label: "PIN", type: "password" },
      },
      authorize: async (credentials) => {
        const phone = credentials?.phone;
        const pin = credentials?.pin;
        if (typeof phone !== "string" || typeof pin !== "string") return null;

        const customer = await prisma.customer.findUnique({ where: { phone } });
        if (!customer || !customer.pinHash) return null;

        const { success, lockedOut } = await verifyAndTrackPinAttempt(customer, pin);
        if (lockedOut) throw new PinLockedError();
        if (!success) return null;

        return { id: customer.id, name: customer.name, role: "CUSTOMER" };
      },
    }),
  ],
});
