export const SolidBtnSmClassName =
  "py-2 px-6 bg-accent-purple text-day-100 rounded-lg hover:bg-day-600";
export const SolidBtnMdClassName =
  "py-2 px-7 bg-accent-purple text-day-100 rounded-lg hover:bg-day-600 text-xl";
export const SolidBtnLgClassName =
  "py-2 px-8 bg-accent-purple text-day-100 rounded-lg hover:bg-day-600 text-2xl";
export const OutlineBtnSmClassName =
  "py-2 px-6 border-1 transition-colors border-accent-purple text-day-100 rounded-lg hover:bg-accent-purple";
export const OutlineBtnMdClassName =
  "py-2 px-7 border-1 transition-colors border-accent-purple text-day-100 rounded-lg hover:bg-accent-purple text-xl";
export const OutlineBtnLgClassName =
  "py-2 px-8 border-1 transition-colors border-accent-purple text-day-100 rounded-lg hover:bg-accent-purple text-2xl";
export interface BtnAndLinkProps {
  size?: "lg" | "md" | "sm";
  btnType?: "outline" | "solid";
}

interface ButtonProps extends BtnAndLinkProps {
  children: React.ReactNode;
}

export default function Button({
  children,
  size = "md",
  className,
  btnType = "solid",
  ...rest
}: ButtonProps & JSX.IntrinsicElements["button"]) {
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
    <button className={`${customClassName} ${className}`} {...rest}>
      {children}
    </button>
  );
}
