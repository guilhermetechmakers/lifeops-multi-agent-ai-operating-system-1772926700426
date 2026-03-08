/**
 * ErrorIcon — Visual cue for 500 server error with accessible alt text.
 */

import { ServerCrash } from "lucide-react";

export function ErrorIcon() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-destructive/20"
      aria-hidden
    >
      <ServerCrash
        className="h-10 w-10 text-destructive"
        aria-hidden
      />
    </div>
  );
}
