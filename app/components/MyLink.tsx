import { Link, type LinkProps } from "@remix-run/react";
import { twMerge } from "tailwind-merge";

export default function MyLink({ children, className, ...rest }: LinkProps) {
  return (
    <Link
      {...rest}
      className={twMerge(
        "underline transition-colors hover:text-accent-purple",
        className
      )}
    >
      {children}
    </Link>
  );
}
