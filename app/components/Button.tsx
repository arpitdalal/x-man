import { twMerge } from "tailwind-merge";

export const SolidBtnSmClassName =
  "transition-colors py-2 px-6 bg-accent-purple text-day-100 rounded-lg hover:bg-accent-dark-purple disabled:bg-opacity-30 disabled:hover:bg-accent-purple disabled:hover:bg-opacity-30";
export const SolidBtnMdClassName =
  "transition-colors py-2 px-7 bg-accent-purple text-day-100 rounded-lg hover:bg-accent-dark-purple text-xl disabled:bg-opacity-30 disabled:hover:bg-accent-purple disabled:hover:bg-opacity-30";
export const SolidBtnLgClassName =
  "transition-colors py-2 px-8 bg-accent-purple text-day-100 rounded-lg hover:bg-accent-dark-purple text-2xl disabled:bg-opacity-30 disabled:hover:bg-accent-purple disabled:hover:bg-opacity-30";
export const OutlineBtnSmClassName =
  "py-2 px-6 border transition-colors border-accent-purple text-night-700 dark:text-day-100 hover:text-day-100 rounded-lg hover:bg-accent-purple disabled:border-opacity-30 disabled:hover:text-night-700 disabled:hover:dark:text-day-100 disabled:hover:bg-transparent";
export const OutlineBtnMdClassName =
  "py-2 px-7 border transition-colors border-accent-purple text-night-700 dark:text-day-100 hover:text-day-100 rounded-lg hover:bg-accent-purple text-xl disabled:border-opacity-30 disabled:hover:text-night-700 disabled:hover:dark:text-day-100 disabled:hover:bg-transparent";
export const OutlineBtnLgClassName =
  "py-2 px-8 border transition-colors border-accent-purple text-night-700 dark:text-day-100 hover:text-day-100 rounded-lg hover:bg-accent-purple text-2xl disabled:border-opacity-30 disabled:hover:text-night-700 disabled:hover:dark:text-day-100 disabled:hover:bg-transparent";
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
    <button className={twMerge(customClassName, className)} {...rest}>
      {children}
    </button>
  );
}
