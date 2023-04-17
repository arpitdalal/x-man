import { NavLink, type NavLinkProps } from "@remix-run/react";

export default function MobileNavLink({
  children,
  className,
  ...rest
}: NavLinkProps) {
  return (
    <NavLink
      className="relative flex items-center justify-center py-2 px-5 transition-colors"
      {...rest}
    >
      {children}
    </NavLink>
  );
}
