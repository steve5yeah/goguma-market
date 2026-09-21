"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-goguma-500 px-4 py-3 text-[0.95rem] font-semibold text-white transition hover:bg-goguma-600 active:bg-goguma-700 disabled:cursor-not-allowed disabled:bg-goguma-300"
    >
      {pending ? pendingText : children}
    </button>
  );
}
