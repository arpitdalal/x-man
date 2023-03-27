import { Link, type LinkProps } from "@remix-run/react";

export default function MyLink({ children, className, ...rest }: LinkProps) {
  return (
    <Link {...rest} className="underline hover:text-accent-purple">
      {children}
    </Link>
  );
}
