type TextInputProps = {
  label: string;
  id: string;
  type: string;
  name: string;
} & Omit<
  JSX.IntrinsicElements["input"],
  "id" | "className" | "children" | "type" | "name"
>;

export default function TextInput({
  label,
  id,
  required,
  ...rest
}: TextInputProps) {
  return (
    <>
      <label htmlFor={id}>
        {label} {required ? <span className="text-accent-red">*</span> : null}
      </label>
      <input
        {...rest}
        id={id}
        required={required}
        className="rounded-md dark:text-day-100 dark:bg-night-700"
      />
    </>
  );
}
