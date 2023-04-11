import { cn } from "~/utils/client";

export default function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-night-400 border-opacity-20 dark:border-night-300",
        className
      )}
    ></div>
  );
}
