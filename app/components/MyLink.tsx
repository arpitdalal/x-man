import { Link, type LinkProps } from "@remix-run/react";

export default function MyLink({ children, className, ...rest }: LinkProps) {
  return (
    <Link
      {...rest}
      className={`transition-colors underline hover:text-accent-purple ${className}`}
    >
      {children}
    </Link>
  );
}
