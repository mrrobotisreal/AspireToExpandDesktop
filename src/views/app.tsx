import React, { FC, useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { validateLocale } from "../utilities/locales";
import en_US from "../../locales/en_US.json";
import StudentContextProvider from "../context/studentContext";
import { useThemeContext } from "../context/themeContext";

import Login from "./login";
import Home from "./pages/home";
import ProfileSettings from "./pages/profileSettings";
import Settings from "./pages/settings";
import StudentInfoForm from "./pages/studentInfoForm";

const defaultLocale = "en";
let initialLocale = defaultLocale;

async function getLocale(): Promise<string> {
  console.log("Getting locale...");
  const locale = await window.electronAPI.getLocale();
  initialLocale = locale;
  console.log(`Initial locale: ${initialLocale}`);

  return locale;
}
getLocale();

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007bff", light: "#8dd0ff" },
    secondary: { main: "#edff00", dark: "#ff8600" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#bb86fc", dark: "#3700b3" },
    secondary: { main: "#03dac6", dark: "#00796B" },
  },
});

const App: FC = () => {
  const { themeMode } = useThemeContext();
  const [locale, setLocale] = useState<string>(initialLocale);
  const [messages, setMessages] = useState<typeof en_US>(en_US);

  const changeLocale = (newLocale: string) => {
    const isValidLocale = validateLocale(newLocale);

    if (isValidLocale) {
      setLocale(newLocale);
    } else {
      console.error(`Invalid locale: ${newLocale}`);
    }
  };

  const changeMessages = (locale: string) => {
    switch (locale) {
      case "en":
        setMessages(en_US);
        break;
      case "en-US":
        setMessages(en_US);
        break;
      case "ru":
        setMessages(en_US); // TODO replace with ru_RU
        break;
      case "ru-RU":
        setMessages(en_US); // TODO replace with ru_RU
        break;
      case "uk":
        setMessages(en_US); // TODO replace with uk_UA
        break;
      case "uk-UA":
        setMessages(en_US); // TODO replace with uk_UA
        break;
      default:
        setMessages(en_US);
    }
  };

  useEffect(() => {
    changeLocale(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    changeMessages(locale);
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
        <StudentContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/student-form" element={<StudentInfoForm />} />
              <Route path="/home" element={<Home />} />
              {/* <Route path="/classroom" element={} /> */}
              {/* <Route path="/chat" element={} /> */}
              {/* <Route path="/lessons" element={} /> */}
              {/* <Route path="/assignments" element={} /> */}
              {/* <Route path="/games" element={} /> */}
              {/* <Route path="/profile" element={} /> */}
            </Routes>
          </Router>
        </StudentContextProvider>
      </ThemeProvider>
    </IntlProvider>
  );
};

export default App;
