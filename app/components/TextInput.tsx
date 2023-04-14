import { DollarSignIcon } from "lucide-react";
import MyLink from "~/components/MyLink";
import { cn } from "~/utils/client";

type TextInputProps = {
  label: string;
  id: string;
  type: string;
  name: string;
  inputClassName?: string;
  labelClassName?: string;
} & Omit<
  JSX.IntrinsicElements["input"],
  "id" | "className" | "children" | "type" | "name"
>;

export default function TextInput({
  label,
  id,
  required,
  inputMode,
  type,
  inputClassName = "",
  labelClassName = "",
  ...rest
}: TextInputProps) {
  if (inputMode === "decimal") {
    return (
      <>
        <label
          htmlFor={id}
          className={cn("flex flex-row gap-1", labelClassName)}
        >
          {label} {required ? <span className="text-accent-red">*</span> : null}
        </label>
        <p className="flex flex-row">
          <span className="pointer-events-none flex w-8 items-center rounded-r-none rounded-l-md border border-r-0 border-[#6b7280] bg-day-200 dark:bg-night-300">
            <DollarSignIcon size="32" />
          </span>
          <input
            id={id}
            required={required}
            inputMode={inputMode}
            className={cn(
              "w-full rounded-md rounded-l-none border-l-0 focus:border-night-700 focus:outline-none focus:ring-0 dark:bg-night-700 dark:text-day-100 dark:focus:border-day-100",
              inputClassName
            )}
            type={type}
            {...rest}
          />
        </p>
      </>
    );
  }
  return (
    <>
      {type === "password" ? (
        <div className="flex w-full flex-row justify-between">
          <label
            htmlFor={id}
            className={cn("flex flex-row gap-1", labelClassName)}
          >
            {label}{" "}
            {required ? <span className="text-accent-red">*</span> : null}
          </label>
          <div className="flex w-full items-center justify-end">
            <MyLink to="?">Forgot password?</MyLink>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn("flex flex-row gap-1", labelClassName)}
        >
          {label} {required ? <span className="text-accent-red">*</span> : null}
        </label>
      )}
      <input
        id={id}
        required={required}
        inputMode={inputMode}
        className={cn(
          "w-full rounded-md focus:border-night-700 focus:outline-none focus:ring-0 dark:bg-night-700 dark:text-day-100 dark:focus:border-day-100",
          inputClassName
        )}
        type={type}
        {...rest}
      />
    </>
  );
}

// function DollarIcon({ size }: { size: string }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={`${size}px`}
//       height={`${size}px`}
//       viewBox="0 0 1024 1024"
//       className="fill-night-700 dark:fill-day-100"
//     >
//       <path d="M541.7 768v-45.3c46.3-2.4 81.5-15 108.7-37.8 27.2-22.8 40.8-53.1 40.8-88.2 0-37.8-11-65.7-35.3-83.4-24.6-20.1-59.8-35.4-111.6-45.3h-2.6V351.8c35.3 5.1 65.3 15 95.1 35.4l43.6-55.5c-43.6-27.9-89.9-42.9-138.8-45.3V256h-40.8v30.3c-40.8 2.4-76.3 15-103.5 37.8-27.2 22.8-40.8 53.1-40.8 88.2s11 63 35.3 80.7c21.7 17.7 59.8 32.7 108.7 42.9v118.5c-38.2-5.1-76.3-22.8-114.2-53.1l-48.9 53.1c48.9 40.5 103.5 63 163.3 68.1V768h41zm2.6-219.6c27.2 7.5 43.6 15 54.4 22.8 8.1 10.2 13.6 20.1 13.6 35.4s-5.5 25.2-19.1 35.4c-13.6 10.2-30.1 15-48.9 17.7V548.4zM449.2 440c-8.1-7.5-13.6-20.1-13.6-32.7 0-15 5.5-25.2 16.2-35.4 13.6-10.2 27.2-15 48.9-17.7v108.6c-27.2-7.8-43.4-15.3-51.5-22.8z" />
//     </svg>
//   );
// }
