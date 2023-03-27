import { createContext } from "react";

export const DateContext = createContext<{
  date: string;
  month: string;
  year: string;
}>({
  date: "",
  month: "",
  year: "",
});
