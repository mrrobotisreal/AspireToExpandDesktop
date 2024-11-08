import React, { FC, useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { validateLocale } from "../utilities/locales";
import en_US from "../../locales/en_US.json";

import Login from "./login";
import Settings from "./pages/settings";
import StudentInfoForm from "./pages/studentInfoForm";

const defaultLocale = "en";
let initialLocale = defaultLocale;

async function getLocale(): Promise<string> {
  const locale = await window.electron.getLocale();
  initialLocale = locale;

  return locale;
}
getLocale();

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007bff" },
    secondary: { main: "#f44336" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff0000" },
    secondary: { main: "#fff" },
  },
});

type ThemeMode = "light" | "dark";

const App: FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [locale, setLocale] = useState<string>(initialLocale);
  const [messages, setMessages] = useState<typeof en_US>(en_US);

  const toggleTheme = () =>
    setThemeMode(themeMode === "light" ? "dark" : "light");

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
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/student-form" element={<StudentInfoForm />} />
            {/* <Route path="/home" element={} /> */}
            {/* <Route path="/classroom" element={} /> */}
            {/* <Route path="/chat" element={} /> */}
            {/* <Route path="/lessons" element={} /> */}
            {/* <Route path="/assignments" element={} /> */}
            {/* <Route path="/games" element={} /> */}
            {/* <Route path="/profile" element={} /> */}
          </Routes>
        </Router>
      </ThemeProvider>
    </IntlProvider>
  );
};

export default App;
