import { NavLink, type NavLinkProps } from "@remix-run/react";

export default function MobileNavLink({
  children,
  className,
  ...rest
}: NavLinkProps) {
  return (
    <NavLink
      {...rest}
      // className={({ isActive }) =>
      //   `relative py-2 px-5 transition-colors hover:bg-accent-purple dark:hover:bg-accent-purple ${
      //     isActive ? "bg-accent-purple text-day-100" : ""
      //   }`
      className="relative flex items-center justify-center py-2 px-5 transition-colors"
    >
      {children}
    </NavLink>
  );
}
