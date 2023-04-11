import { Link, type LinkProps } from "@remix-run/react";
import {
  getSizeClassNames,
  getTypeClassNames,
  type BtnAndLinkProps,
} from "~/components/Button";
import { cn } from "~/utils/client";

export default function MyLinkBtn({
  children,
  size = "md",
  btnType = "solid",
  className,
  ...rest
}: LinkProps & BtnAndLinkProps) {
  let customClassName = cn(getTypeClassNames(btnType), getSizeClassNames(size));

  return (
    <Link {...rest} className={cn(customClassName, className)}>
      {children}
    </Link>
  );
}
