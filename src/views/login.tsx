import React, { FC, useState } from "react";
import { Button, FormHelperText, Stack, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

import { useStudentContext } from "../context/studentContext";
import { MAIN_SERVER_URL } from "../constants/urls";

import CircularLoading from "./loading/circular";
import Text from "./text/text";

const Login: FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { updateInfo } = useStudentContext();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
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
            emailAddress: body.email,
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
            email: emailAddress,
            password: shortenedHash,
          }),
        });

        if (response.status === 200) {
          const body = await response.json();
          updateInfo({
            firstName: body.first_name,
            preferredName: body.preferred_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            nativeLanguage: body.native_language,
            preferredLanguage: body.preferred_language,
          });
          navigate("/settings");
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

  return (
    <div className="login-container">
      <Text variant="subtitle1" textAlign="center">
        {intl.formatMessage({
          id: isLoginVisible
            ? "welcomeScreen_loginTitle"
            : "welcomeScreen_welcomeTitle",
        })}
      </Text>
      <Text variant="h1" fontFamily="Bauhaus-Heavy" textAlign="center">
        {intl.formatMessage({ id: "appTitle" })}!
      </Text>
      <br />
      {isLoginVisible ? (
        <Stack direction="column" alignContent="space-evenly" spacing={4}>
          <div>
            <Text variant="body1" fontWeight="bold">
              {intl.formatMessage({ id: "welcomeScreen_inputEmail" })}:
            </Text>
            <TextField
              fullWidth
              variant="outlined"
              label={
                <Text variant="body1">
                  {intl.formatMessage({ id: "common_emailAddress" })}
                </Text>
              }
              value={emailAddress}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmailAddress(event.target.value)
              }
            />
          </div>
          <div>
            <Text variant="body1" fontWeight="bold">
              {intl.formatMessage({ id: "welcomeScreen_inputPassword" })}:
            </Text>
            <TextField
              fullWidth
              variant="outlined"
              label={
                <Text variant="body1">
                  {intl.formatMessage({ id: "common_passwordTitle" })}
                </Text>
              }
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </div>
        </Stack>
      ) : (
        <>
          <Text variant="body1" fontWeight="bold">
            {intl.formatMessage({ id: "registrationCodeInputLabel" })}:
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text variant="body1">
                {intl.formatMessage({ id: "registrationCodeInputHint" })}
              </Text>
            }
            value={registrationCode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRegistrationCode(event.target.value)
            }
          />
          <FormHelperText>
            <Text variant="caption" fontFamily="Bauhaus-Light">
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
        >
          <Text variant="body2">
            {intl.formatMessage({
              id: isLoginVisible
                ? "welcomeScreen_notRegisteredYetButton"
                : "welcomeScreen_alreadyRegisteredButton",
            })}
          </Text>
        </Button>
        <Button
          variant="contained"
          sx={{ minWidth: 120 }}
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
            <Text variant="button">
              {intl.formatMessage({
                id: isLoginVisible
                  ? "common_login"
                  : "registrationCodeSubmitButton",
              })}
            </Text>
          )}
        </Button>
      </Stack>
    </div>
  );
};

export default Login;
