import React, { FC, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { IntlProvider } from "react-intl";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import StudentContextProvider from "../context/studentContext";
import ChatContextProvider from "../context/chatContext";
import PaymentProvider from "../context/paymentContext";
import { useThemeContext } from "../context/themeContext";
import { useMessagesContext } from "../context/messagesContext";

import Login from "./login";
import Chat from "./pages/chat";
import _Chat from "./pages/_chat";
import Classroom from "./pages/classroom";
import _Classroom from "./pages/_classroom";
import Home from "./pages/home";
import Payment from "./pages/payment";
import ProfileSettings from "./pages/profileSettings";
import Settings from "./pages/settings";
import StudentInfoForm from "./pages/studentInfoForm";

const queryClient = new QueryClient();

const defaultLocale = "en";
let initialLocale = defaultLocale;

async function getLocale(): Promise<string> {
  const locale = await window.electronAPI.getLocale();
  initialLocale = locale;

  return locale;
}
getLocale();

const App: FC = () => {
  const { themeMode, theme } = useThemeContext();
  const { locale, messages, changeLocale } = useMessagesContext();

  useEffect(() => {
    changeLocale(initialLocale);
  }, [initialLocale]);

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={messages}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={theme}>
            <StudentContextProvider>
              <PaymentProvider>
                <ChatContextProvider>
                  <Router>
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<ProfileSettings />} />
                      <Route
                        path="/student-form"
                        element={<StudentInfoForm />}
                      />
                      <Route path="/home" element={<Home />} />
                      {/* <Route path="/classroom" element={<_Classroom />} /> */}
                      <Route path="/classroom" element={<Classroom />} />
                      <Route path="/chat" element={<_Chat />} />
                      {/* <Route path="/chat" element={<Chat />} /> */}
                      <Route path="/payment" element={<Payment />} />
                      {/* <Route path="/lessons" element={} /> */}
                      {/* <Route path="/assignments" element={} /> */}
                      {/* <Route path="/games" element={} /> */}
                    </Routes>
                  </Router>
                </ChatContextProvider>
              </PaymentProvider>
            </StudentContextProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

export default App;
