import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import { AppFontStyle } from "../constants/fonts";

export type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  themeMode: "light" | "dark";
  toggleThemeMode: (mode: ThemeMode) => void;
  fontStyle: AppFontStyle;
  lightFont: string;
  regularFont: string;
  heavyFont: string;
  changeFontStyle: (newFontStyle: AppFontStyle) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: "light",
  toggleThemeMode: (mode: ThemeMode) => {},
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
  const [fontStyle, setFontStyle] = useState<AppFontStyle>("Bauhaus");
  const [lightFont, setLightFont] = useState<string>("Bauhaus-Light");
  const [regularFont, setRegularFont] = useState<string>("Bauhaus-Medium");
  const [heavyFont, setHeavyFont] = useState<string>("Bauhaus-Heavy");

  const toggleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
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
