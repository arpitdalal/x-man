import { useState } from "react";
import { ChipsClassName } from "~/components/Chip";
import { cn } from "~/utils/client";

type FilterChipProps = {
  name: string;
  value: string;
  className: (checked: boolean) => string;
  children: React.ReactNode;
  selected?: boolean;
};
export default function FilterChip({
  children,
  className,
  name,
  value,
  selected = false,
}: FilterChipProps) {
  const [checked, setChecked] = useState(selected);

  return (
    <>
      <label className={cn(ChipsClassName, className(checked))}>
        {children}
        <input
          type="checkbox"
          name={name}
          value={value}
          className="hidden"
          aria-hidden="true"
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
      </label>
    </>
  );
}
