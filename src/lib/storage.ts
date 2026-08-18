import { put } from "@vercel/blob";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { hasBlobStorage } from "@/lib/env";

export interface UploadedFile {
  url: string;
}

/**
 * Vercel Blob when configured; local disk otherwise. The local path only
 * makes sense in development — Vercel's own filesystem is ephemeral, so a
 * production deploy without BLOB_READ_WRITE_TOKEN would silently lose files
 * on the next redeploy.
 */
export async function uploadPhoto(file: File, folder: string): Promise<UploadedFile> {
  if (hasBlobStorage) {
    const blob = await put(`${folder}/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    return { url: blob.url };
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "BLOB_READ_WRITE_TOKEN is not set — saving upload to local disk, which will NOT persist across deploys."
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  const localName = `${crypto.randomUUID()}-${file.name}`;
  await writeFile(path.join(uploadsDir, localName), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${folder}/${localName}` };
}
