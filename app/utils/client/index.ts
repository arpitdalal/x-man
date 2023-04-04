import type { Option, Options } from "react-tailwindcss-select/dist/components/type";

export function getOptionsFromArray(array: Array<string>) {
  if (!array || (array.length === 1 && !array[0])) {
    return [] satisfies Options;
  }
  return array.map((arr) => {
    return {
      label: capitalize(arr),
      value: arr.toLocaleLowerCase(),
    };
  }) satisfies Options
}

export function capitalize(string: string) {
  const arr = string.split(" ");
  for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }

  return arr.join(" ");
}

export function getStringFromOptions(options: Array<Option>) {
  if (!options || options.length === 0) {
    return "";
  }
  return options.map(option => option.value).join(",")
}
