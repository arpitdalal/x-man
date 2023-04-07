import type { Option, Options } from "react-tailwindcss-select/dist/components/type";
import type {Category} from "~/types/index";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptionsFromArray(array: Array<string>) {
  if (!array || (array.length === 1 && !array[0])) {
    return [] satisfies Options;
  }
  return array.map((str) => {
    return {
      label: str,
      value: str,
    };
  }) satisfies Options
}

export function getStringFromOptions(options: Array<Option>) {
  if (!options || options.length === 0) {
    return "";
  }
  return options.map(option => option.value).sort().toString();
}

export const IN_TEN_PERCENT_CATEGORY = {
    created_at: "",
    expense: false,
    id: "",
    name: "In Ten Percent",
    updated_at: "",
    user_id: "*",
} satisfies Category;
