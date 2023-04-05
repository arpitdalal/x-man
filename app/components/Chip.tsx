import { twMerge } from "tailwind-merge";

export const ChipsClassName = "rounded-md bg-dark-muted-100 px-3 py-1 text-sm";
type ChipProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
export default function Chip({ children, className, ...rest }: ChipProps) {
  return (
    <div className={twMerge(ChipsClassName, className)} {...rest}>
      {children}
    </div>
  );
}
