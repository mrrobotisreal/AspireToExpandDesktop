import React, { FC, useState, useEffect } from "react";
import {
  Button,
  FormHelperText,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

import { useThemeContext } from "../context/themeContext";
import { useStudentContext } from "../context/studentContext";
import { useMessagesContext } from "../context/messagesContext";
import { MAIN_SERVER_URL } from "../constants/urls";
import useEncryption from "../hooks/useEncryption";

import CircularLoading from "./loading/circular";
import Text from "./text/text";

const Login: FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    theme,
    toggleThemeMode,
    changeFontStyle,
    lightFont,
    regularFont,
    heavyFont,
  } = useThemeContext();
  const { getInfo, updateInfo, updateInfoOnServer } = useStudentContext();
  const { changeLocale } = useMessagesContext();
  const { generateKeyPair } = useEncryption();
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = async () => {
    setIsLoading(true);
    try {
      if (registrationCode === "") {
        console.error("Registration code is required"); // TODO: localize; add toast
        setIsLoading(false);
        return;
      } else {
        const response = await fetch(
          `${MAIN_SERVER_URL}/validate/registration`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ registration_code: registrationCode }),
          }
        );

        if (response.status === 200) {
          const body = await response.json();
          updateInfo({
            firstName: body.first_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            themeMode: "light",
            fontStyle: "Bauhaus",
          });
          navigate("/student-form", {
            state: {
              firstName: body.first_name,
              lastName: body.last_name,
              email: body.email_address,
            },
          });
        } else {
          console.error("Registration code is invalid!"); // TODO: localize; add toast
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error registering user:", error); // TODO: localize; add toast
      setIsLoading(false);
      throw error;
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (emailAddress === "" || password === "") {
        console.error("Email address and password are required"); // TODO: localize; add toast
        setIsLoading(false);
        return;
      } else {
        const salt = window.electronAPI.getSalt();
        const hashedPassword = bcrypt.hashSync(password, salt);
        const shortenedHash = hashedPassword.slice(0, 32);
        const response = await fetch(`${MAIN_SERVER_URL}/validate/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=UTF-8" },
          body: JSON.stringify({
            email_address: emailAddress,
            password: shortenedHash,
          }),
        });

        if (response.status === 200) {
          const body = await response.json();

          updateInfo({
            studentId: body.student_id,
            firstName: body.first_name,
            preferredName: body.preferred_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            nativeLanguage: body.native_language,
            preferredLanguage: body.preferred_language,
            themeMode: body.theme_mode,
            fontStyle: body.font_style,
            profilePictureURL: body.profile_picture_url,
            profilePicturePath: body.profile_picture_path,
            timeZone: body.time_zone,
          });
          toggleThemeMode(
            !body.theme_mode || body.theme_mode === ""
              ? "light"
              : body.theme_mode
          );
          if (body.preferred_language) {
            changeLocale(body.preferred_language);
          }
          if (body.font_style) {
            changeFontStyle(body.font_style);
          }
          if (body.student_id) {
            window.electronAPI.connectChatWebSocket(body.student_id);
          } else {
            console.error(
              "Student ID not found in response, cannot connect to chat server!"
            ); // TODO: localize; add toast
          }
          if (!body.public_key) {
            const keyPair = await generateKeyPair();
            if (keyPair) {
              updateInfoOnServer({
                student_id: body.student_id,
                email_address: emailAddress,
                public_key: keyPair.publicKey,
              });
            } else {
              console.error(
                "Error generating key pair, data not being encrypted!"
              ); // TODO: localize; add toast
            }
          }
          navigate("/home");
        } else {
          console.error("Invalid email address or password!"); // TODO: localize; add toast
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error logging in:", error); // TODO: localize; add toast
      setIsLoading(false);
      throw error;
    }
  };

  const handleLoginWithGoogle = async () => {
    const result = await window.electronAPI.loginWithGoogle();
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${result.id_token}`
    );
    const data = await verifyResponse.json();

    if (data.error) {
      console.error("Error verifying Google login:", data.error);
    }

    const response = await fetch(`${MAIN_SERVER_URL}/validate/login/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        email: data.email,
        email_verified: data.email_verified,
      }),
    });
    const resData = await response.json();

    if (response.status === 200) {
      updateInfo({
        studentId: resData.student_id,
        firstName: resData.first_name,
        preferredName: resData.preferred_name,
        lastName: resData.last_name,
        emailAddress: resData.email_address,
        nativeLanguage: resData.native_language,
        preferredLanguage: resData.preferred_language,
        themeMode: resData.theme_mode,
        fontStyle: resData.font_style,
        profilePictureURL: resData.profile_picture_url,
        profilePicturePath: resData.profile_picture_path,
        timeZone: resData.time_zone,
      });
      toggleThemeMode(
        !resData.theme_mode || resData.theme_mode === ""
          ? "light"
          : resData.theme_mode
      );
      if (resData.preferred_language) {
        changeLocale(resData.preferred_language);
      }
      if (resData.font_style) {
        changeFontStyle(resData.font_style);
      }
      if (resData.student_id) {
        window.electronAPI.connectChatWebSocket(resData.student_id);
      } else {
        console.error(
          "Student ID not found in response, cannot connect to chat server!"
        );
      }
      navigate("/home");
    }
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();

    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
      navigate("/home");
    }
  }, []);

  return (
    <Paper
      sx={{
        p: 4,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        borderRadius: "12px",
        minWidth: 400,
        backgroundColor: theme.palette.common.white,
      }}
    >
      <Text
        variant="subtitle1"
        textAlign="center"
        fontFamily={regularFont}
        color="textPrimary"
      >
        {intl.formatMessage({
          id: isLoginVisible
            ? "welcomeScreen_loginTitle"
            : "welcomeScreen_welcomeTitle",
        })}
      </Text>
      <Text
        variant="h4"
        fontFamily={heavyFont}
        textAlign="center"
        color="textPrimary"
      >
        {intl.formatMessage({ id: "appTitle" })}!
      </Text>
      <br />
      {isLoginVisible ? (
        <Stack direction="column" alignContent="space-evenly" spacing={4}>
          <div>
            <Text
              variant="body1"
              fontWeight="bold"
              fontFamily={regularFont}
              color="textPrimary"
            >
              {intl.formatMessage({ id: "welcomeScreen_inputEmail" })}:
            </Text>
            <TextField
              fullWidth
              variant="outlined"
              label={
                <Text
                  variant="body1"
                  fontFamily={regularFont}
                  color="textPrimary"
                >
                  {intl.formatMessage({ id: "common_emailAddress" })}
                </Text>
              }
              value={emailAddress}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmailAddress(event.target.value)
              }
              color="primary"
            />
          </div>
          <div>
            <Text
              variant="body1"
              fontWeight="bold"
              fontFamily={regularFont}
              color="textPrimary"
            >
              {intl.formatMessage({ id: "welcomeScreen_inputPassword" })}:
            </Text>
            <TextField
              fullWidth
              variant="outlined"
              label={
                <Text
                  variant="body1"
                  fontFamily={regularFont}
                  color="textPrimary"
                >
                  {intl.formatMessage({ id: "common_passwordTitle" })}
                </Text>
              }
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
              color="primary"
            />
          </div>
        </Stack>
      ) : (
        <>
          <Text
            variant="body1"
            fontWeight="bold"
            fontFamily={regularFont}
            color="textPrimary"
          >
            {intl.formatMessage({ id: "registrationCodeInputLabel" })}:
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text
                variant="body1"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "registrationCodeInputHint" })}
              </Text>
            }
            value={registrationCode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRegistrationCode(event.target.value)
            }
            color="primary"
          />
          <FormHelperText>
            <Text
              variant="caption"
              fontFamily={lightFont}
              color="textSecondary"
            >
              {intl.formatMessage({ id: "registrationCodeInputHelperText" })}
            </Text>
          </FormHelperText>
        </>
      )}
      <br />
      <Stack direction="row" justifyContent="space-between">
        <Button
          variant="text"
          onClick={() => setIsLoginVisible(!isLoginVisible)}
          sx={{ color: theme.palette.secondary.dark }}
        >
          <Text variant="body2" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({
              id: isLoginVisible
                ? "welcomeScreen_notRegisteredYetButton"
                : "welcomeScreen_alreadyRegisteredButton",
            })}
          </Text>
        </Button>
        {isLoginVisible && (
          <Tooltip title="Sign in with Google" placement="bottom" arrow>
            <IconButton onClick={handleLoginWithGoogle}>
              <SvgIcon>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{
                    display: "block",
                  }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </SvgIcon>
            </IconButton>
          </Tooltip>
        )}
        <Button
          variant="contained"
          sx={{ minWidth: 120, backgroundColor: theme.palette.secondary.light }}
          onClick={() => {
            if (isLoginVisible) {
              handleLogin();
            } else {
              console.log("Handling registration...");
              handleRegistration();
            }
          }}
        >
          {isLoading ? (
            <CircularLoading />
          ) : (
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: isLoginVisible
                  ? "common_login"
                  : "registrationCodeSubmitButton",
              })}
            </Text>
          )}
        </Button>
      </Stack>
    </Paper>
  );
};

export default Login;
