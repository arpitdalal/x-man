import { NavLink, type NavLinkProps } from "@remix-run/react";

export default function MyNavLink({
  children,
  className,
  ...rest
}: NavLinkProps) {
  return (
    <NavLink
      {...rest}
      className={({ isActive }) =>
        `transition-colors rounded-sm py-2 px-5 hover:bg-accent-purple dark:hover:bg-accent-purple ${
          isActive
            ? "bg-accent-purple text-day-100"
            : "bg-day-300 dark:bg-night-400 text-night-700 dark:text-day-100 hover:text-day-100"
        } ${className}`
      }
    >
      {children}
    </NavLink>
  );
}
