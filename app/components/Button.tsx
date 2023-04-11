import { cn } from "~/utils/client";
export interface BtnAndLinkProps {
  size?: "lg" | "md" | "sm";
  btnType?: "outline" | "solid";
  as?: "a" | "button";
}

interface ButtonProps extends BtnAndLinkProps {
  children: React.ReactNode;
}

export default function Button({
  children,
  size = "md",
  className,
  btnType = "solid",
  as = "button",
  ...rest
}: ButtonProps & JSX.IntrinsicElements["button"]) {
  let customClassName = cn(getTypeClassNames(btnType), getSizeClassNames(size));

  return (
    <button className={cn(customClassName, className)} {...rest}>
      {children}
    </button>
  );
}

export function getTypeClassNames(type: BtnAndLinkProps["btnType"]) {
  switch (type) {
    case "solid": {
      return "transition-colors py-2 bg-accent-purple text-day-100 rounded-lg hover:bg-accent-dark-purple disabled:bg-opacity-30 disabled:hover:bg-accent-purple disabled:hover:bg-opacity-30";
    }
    case "outline": {
      return "py-2 border transition-colors border-accent-purple text-night-700 dark:text-day-100 hover:text-day-100 rounded-lg hover:bg-accent-purple disabled:border-opacity-30 disabled:hover:text-night-700 disabled:hover:dark:text-day-100 disabled:hover:bg-transparent";
    }
    default: {
      return "";
    }
  }
}

export function getSizeClassNames(size: BtnAndLinkProps["size"]) {
  switch (size) {
    case "md": {
      return "text-xl px-7";
    }
    case "lg": {
      return "text-2xl px-8";
    }
    default: {
      return "px-6";
    }
  }
}
