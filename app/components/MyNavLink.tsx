import { NavLink, type NavLinkProps } from "@remix-run/react";
import { cn } from "~/utils/client";

export default function MyNavLink({
  children,
  className,
  stringClassName = "",
  ...rest
}: { stringClassName?: string } & NavLinkProps) {
  return (
    <NavLink
      {...rest}
      className={({ isActive }) =>
        cn(
          `rounded-sm py-2 px-5 transition-colors hover:bg-accent-purple dark:hover:bg-accent-purple ${
            isActive
              ? "bg-accent-purple text-day-100"
              : "bg-day-300 text-night-700 hover:text-day-100 dark:bg-night-400 dark:text-day-100"
          }`,
          stringClassName
        )
      }
    >
      {children}
    </NavLink>
  );
}
