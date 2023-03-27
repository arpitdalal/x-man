import { Link, type LinkProps } from "@remix-run/react";
import {
  OutlineBtnLgClassName,
  OutlineBtnMdClassName,
  OutlineBtnSmClassName,
  SolidBtnLgClassName,
  SolidBtnMdClassName,
  SolidBtnSmClassName,
  type BtnAndLinkProps,
} from "~/components/Button";

export default function MyLinkBtn({
  children,
  size = "md",
  btnType = "solid",
  ...rest
}: LinkProps & BtnAndLinkProps) {
  let customClassName = SolidBtnMdClassName;
  if (size === "sm" && btnType === "solid") {
    customClassName = SolidBtnSmClassName;
  }
  if (size === "lg" && btnType === "solid") {
    customClassName = SolidBtnLgClassName;
  }
  if (size === "sm" && btnType === "outline") {
    customClassName = OutlineBtnSmClassName;
  }
  if (size === "md" && btnType === "outline") {
    customClassName = OutlineBtnMdClassName;
  }
  if (size === "lg" && btnType === "outline") {
    customClassName = OutlineBtnLgClassName;
  }

  return (
    <Link {...rest} className={customClassName}>
      {children}
    </Link>
  );
}
