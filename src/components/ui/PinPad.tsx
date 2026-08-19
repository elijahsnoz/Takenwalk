"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PIN_LENGTH = 4;

/**
 * Big-button numeric keypad instead of a text input — no keyboard to fight
 * with, just tap digits. Built for first-time phone users, not power users.
 */
export function PinPad({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  function press(digit: string) {
    if (value.length < PIN_LENGTH) onChange(value + digit);
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4" aria-hidden="true">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-ink ${i < value.length ? "bg-ink" : "bg-transparent"}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => press(digit)}
            className="h-16 w-16 rounded-full border-[1.5px] border-ink/20 bg-paper text-2xl font-semibold text-ink active:bg-ink/10"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press("0")}
          className="h-16 w-16 rounded-full border-[1.5px] border-ink/20 bg-paper text-2xl font-semibold text-ink active:bg-ink/10"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          aria-label="Delete last digit"
          className="h-16 w-16 rounded-full border-[1.5px] border-ink/20 bg-paper text-xl text-ink active:bg-ink/10"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
