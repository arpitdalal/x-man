import Select from "react-tailwindcss-select";
import { useState } from "react";
import type {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import type { Category } from "~/types";
import { getOptionsFromArray } from "~/utils/client";

type MyMultiSelectedProps = {
  categories: Array<Category["name"]>;
  selectedCategories: SelectValue;
  setSelectedCategories: React.Dispatch<React.SetStateAction<SelectValue>>;
  label: string;
  required?: boolean;
};
export default function MyMultiSelect({
  categories,
  selectedCategories,
  setSelectedCategories,
  label,
  required = false,
}: MyMultiSelectedProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleChange = (value: SelectValue) => {
    setSelectedCategories(value);
  };

  const categoryOptions = getOptionsFromArray(categories);

  let selectedCategoriesString = "";
  if (selectedCategories) {
    selectedCategoriesString = (selectedCategories as Option[])
      .map((selectedCategory) => selectedCategory.value)
      .join(",");
  }

  return (
    <>
      <label onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {label} {required ? <span className="text-accent-red">*</span> : null}
      </label>
      <Select
        primaryColor={"purple"}
        value={selectedCategories}
        onChange={handleChange}
        options={categoryOptions}
        menuIsOpen={isMenuOpen}
        isMultiple
        isSearchable
        isClearable
        noOptionsMessage="No more categories to select"
        placeholder="Select categories..."
        searchInputPlaceholder="Search categories..."
        classNames={{
          menu: "bg-day-100 dark:bg-night-500 border border-night-700 dark:border-day-100 rounded-lg py-2 mt-1.5 text-sm text-night-700 dark:text-day-100",
          menuButton: () =>
            `flex text-sm text-night-700 dark:text-day-100 border border-[#6b7280] focus:border-night-700 dark:focus:border-day-100 rounded shadow-sm transition-all duration-300 focus:outline-none bg-day-100 dark:bg-night-700`,
          tagItem: () =>
            `bg-accent-purple rounded-md flex pl-2 pr-1 py-1 gap-1 items-center`,
          tagItemText: `text-day-100 truncate cursor-default select-none`,
          tagItemIconContainer: `flex transition-colors items-center p-0.5 cursor-pointer hover:bg-red-500 rounded-full`,
          tagItemIcon: `w-3 h-3 text-white`,
          searchBox: `w-full py-2 pl-8 text-sm text-gray-500 bg-day-100 dark:bg-night-700 border border-gray-200 rounded-md focus:border-gray-200 focus:ring-0 focus:outline-none`,
          listItem: () =>
            `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded-md hover:bg-dark-muted-100 hover:dark:bg-dark-muted-300`,
        }}
      />
      <input type="hidden" name="categories" value={selectedCategoriesString} />
    </>
  );
}
