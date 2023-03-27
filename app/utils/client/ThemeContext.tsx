import { createContext } from "react";
import type { Mode } from "~/root";

export const ThemeContext = createContext<{
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}>({
  mode: "system",
  setMode: () => {},
});
