import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  themeMode: "light" | "dark";
  toggleThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "light",
  toggleThemeMode: (mode: ThemeMode) => {},
});

export const useThemeContext = () =>
  useContext<ThemeContextProps>(ThemeContext);

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const toggleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const values = {
    themeMode,
    toggleThemeMode,
  };

  return (
    <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
