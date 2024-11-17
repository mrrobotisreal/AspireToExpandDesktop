import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { Theme, createTheme } from "@mui/material/styles";

import { AppFontStyle } from "../constants/fonts";

export type ThemeMode = "light" | "dark";

interface ThemeCustom {
  palette: {
    mode: ThemeMode;
    primary: { main: string; dark?: string; light?: string };
    secondary: { main: string; dark?: string; light?: string };
    background: { main: string; border: string };
  };
}

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007bff", light: "#8dd0ff" },
    secondary: { main: "#edff00", dark: "#ff8600" },
  },
});

const lightThemeCustom: ThemeCustom = {
  palette: {
    mode: "light",
    primary: { main: "#007bff", light: "#8dd0ff" },
    secondary: { main: "#edff00", dark: "#ff8600" },
    background: { main: "#f7f7f7", border: "#ddd" },
  },
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#bb86fc", dark: "#3700b3" },
    secondary: { main: "#03dac6", dark: "#00796B" },
  },
});

const darkThemeCustom: ThemeCustom = {
  palette: {
    mode: "dark",
    primary: { main: "#bb86fc", dark: "#3700b3" },
    secondary: { main: "#03dac6", dark: "#00796B" },
    background: { main: "#121212", border: "#333" },
  },
};

interface ThemeContextProps {
  themeMode: "light" | "dark";
  toggleThemeMode: (mode: ThemeMode) => void;
  theme: Theme;
  themeCustom: ThemeCustom;
  fontStyle: AppFontStyle;
  lightFont: string;
  regularFont: string;
  heavyFont: string;
  changeFontStyle: (newFontStyle: AppFontStyle) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "light",
  toggleThemeMode: (mode: ThemeMode) => {},
  theme: lightTheme,
  themeCustom: lightThemeCustom,
  fontStyle: "Bauhaus",
  lightFont: "Bauhaus-Light",
  regularFont: "Bauhaus-Medium",
  heavyFont: "Bauhaus-Heavy",
  changeFontStyle: (newFontStyle: AppFontStyle) => {},
});

export const useThemeContext = () =>
  useContext<ThemeContextProps>(ThemeContext);

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [themeCustom, setThemeCustom] = useState<ThemeCustom>(lightThemeCustom);
  const [fontStyle, setFontStyle] = useState<AppFontStyle>("Bauhaus");
  const [lightFont, setLightFont] = useState<string>("Bauhaus-Light");
  const [regularFont, setRegularFont] = useState<string>("Bauhaus-Medium");
  const [heavyFont, setHeavyFont] = useState<string>("Bauhaus-Heavy");

  const toggleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    setTheme(mode === "light" ? lightTheme : darkTheme);
    setThemeCustom(mode === "light" ? lightThemeCustom : darkThemeCustom);
  };

  const changeFontStyle = (newFontStyle: AppFontStyle) => {
    setFontStyle(newFontStyle);

    switch (newFontStyle) {
      case "Bauhaus":
        setLightFont("Bauhaus-Light");
        setRegularFont("Bauhaus-Medium");
        setHeavyFont("Bauhaus-Heavy");
        break;
      case "Hummingbird":
        setLightFont("Hummingbird");
        setRegularFont("Hummingbird");
        setHeavyFont("Hummingbird");
        break;
      case "LobsterTwo":
        setLightFont("LobsterTwo-Regular");
        setRegularFont("LobsterTwo-Regular");
        setHeavyFont("LobsterTwo-Bold");
        break;
      case "NexaScript":
        setLightFont("NexaScript-Light");
        setRegularFont("NexaScript-Light");
        setHeavyFont("NexaScript-Heavy");
        break;
      case "NotoSerif":
        setLightFont("NotoSerif");
        setRegularFont("NotoSerif");
        setHeavyFont("NotoSerif");
        break;
      case "Roboto":
        setLightFont("Roboto-Regular");
        setRegularFont("Roboto-Regular");
        setHeavyFont("Roboto-Bold");
        break;
      case "Ubuntu":
        setLightFont("Ubuntu-Regular");
        setRegularFont("Ubuntu-Regular");
        setHeavyFont("Ubuntu-Bold");
        break;
      default:
        setLightFont("Bauhaus-Light");
        setRegularFont("Bauhaus-Medium");
        setHeavyFont("Bauhaus-Heavy");
    }
  };

  const values = {
    themeMode,
    toggleThemeMode,
    theme,
    themeCustom,
    fontStyle,
    lightFont,
    regularFont,
    heavyFont,
    changeFontStyle,
  };

  return (
    <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
