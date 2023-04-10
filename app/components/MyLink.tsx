import { Link, type LinkProps } from "@remix-run/react";
import { cn } from "~/utils/client";

export default function MyLink({ children, className, ...rest }: LinkProps) {
  return (
    <Link
      {...rest}
      className={cn(
        "underline transition-colors hover:text-accent-purple",
        className
      )}
    >
      {children}
    </Link>
  );
}
