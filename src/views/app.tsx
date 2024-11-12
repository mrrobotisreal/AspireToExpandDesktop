import React, { FC, useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import StudentContextProvider from "../context/studentContext";
import { useThemeContext } from "../context/themeContext";
import { useMessagesContext } from "../context/messagesContext";

import Login from "./login";
import Home from "./pages/home";
import ProfileSettings from "./pages/profileSettings";
import Settings from "./pages/settings";
import StudentInfoForm from "./pages/studentInfoForm";

const defaultLocale = "en";
let initialLocale = defaultLocale;

async function getLocale(): Promise<string> {
  const locale = await window.electronAPI.getLocale();
  initialLocale = locale;

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
  const { locale, messages, changeLocale } = useMessagesContext();

  useEffect(() => {
    changeLocale(initialLocale);
  }, [initialLocale]);

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
