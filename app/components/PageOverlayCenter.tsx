import { cn } from "~/utils/client";

export default function PageOverlayCenter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
