import React, { FC, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

import Layout from "../layout/layout";
import Text from "../text/text";

const StudentInfoForm: FC = () => {
  const intl = useIntl();
  const { state } = useLocation();
  const { firstName, lastName, email } = state;
  const [nativeLanguage, setNativeLanguage] = useState("uk");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [emailAddress, setEmailAddress] = useState(email);
  const [isEmailAddressValid, setIsEmailAddressValid] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  const handleSelectNativeLanguage = (event: SelectChangeEvent) =>
    setNativeLanguage(event.target.value);
  const handleSelectPreferredLanguage = (event: SelectChangeEvent) =>
    setPreferredLanguage(event.target.value);

  const handleEmailAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(event.target.value);
    validateEmailAddress(event.target.value);
  };
  const validateEmailAddress = (email: string) => {
    if (!emailRegex.test(email)) {
      setIsEmailAddressValid(false);
      setEmailError(
        intl.formatMessage({ id: "studentInfoForm_emailErrorText_invalid" })
      );
    } else {
      setIsEmailAddressValid(true);
      setEmailError(null);
    }
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    validatePassword(event.target.value);
  };
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lengthTooShort",
        })
      );
    } else if (password.length > 16) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lengthTooLong",
        })
      );
    } else if (!password.match(/[a-z]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lowercase",
        })
      );
    } else if (!password.match(/[A-Z]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_uppercase",
        })
      );
    } else if (!password.match(/[0-9]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({ id: "studentInfoForm_passwordErrorText_number" })
      );
    } else if (!password.match(/[!@#$%^&*]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_specialCharacter",
        })
      );
    } else {
      setIsPasswordValid(true);
      setPasswordError(null);
    }
  };

  return (
    <Layout title={intl.formatMessage({ id: "studentInfoForm_title" })}>
      <Text variant="h4" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage(
          { id: "studentInfoForm_welcomeStudent" },
          { firstName }
        )}
      </Text>
      <Text variant="body1">
        {intl.formatMessage({ id: "studentInfoForm_description" })}
      </Text>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "studentInfoForm_nativeLanguageLabel" })}:
      </Text>
      <FormControl sx={{ maxWidth: 375 }}>
        <Select
          id="nativeLanguage"
          value={nativeLanguage}
          onChange={handleSelectNativeLanguage}
        >
          <MenuItem value="uk">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              Українська мова
            </Text>
          </MenuItem>
          <MenuItem value="ru">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              Русский язык
            </Text>
          </MenuItem>
          <MenuItem value="de">
            <Text variant="body1">Deutsche</Text>
          </MenuItem>
        </Select>
        <FormHelperText>
          <Text variant="caption">
            {intl.formatMessage({
              id: "studentInfoForm_nativeLanguageHelperText",
            })}
          </Text>
        </FormHelperText>
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "studentInfoForm_preferredLanguageLabel" })}:
      </Text>
      <FormControl sx={{ maxWidth: 375 }}>
        <Select
          id="preferredLanguage"
          value={preferredLanguage}
          onChange={handleSelectPreferredLanguage}
        >
          <MenuItem value="en">
            <Text variant="body1">English</Text>
          </MenuItem>
          <MenuItem value="uk">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              Українська мова
            </Text>
          </MenuItem>
          <MenuItem value="ru">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              Русский язык
            </Text>
          </MenuItem>
          <MenuItem value="de">
            <Text variant="body1">Deutsche</Text>
          </MenuItem>
        </Select>
        <FormHelperText>
          <Text variant="caption">
            {intl.formatMessage({
              id: "studentInfoForm_preferredLanguageHelperText",
            })}
          </Text>
        </FormHelperText>
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "studentInfoForm_emailInputLabel" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1">
              {intl.formatMessage({
                id: isEmailAddressValid
                  ? "common_emailAddress"
                  : "common_errorTitle",
              })}
            </Text>
          }
          type="email"
          value={emailAddress}
          onChange={handleEmailAddress}
          error={!isEmailAddressValid}
          helperText={
            <Text
              variant="caption"
              color={isEmailAddressValid ? "textPrimary" : "error"}
            >
              {isEmailAddressValid
                ? intl.formatMessage({ id: "studentInfoForm_emailHelperText" })
                : emailError}
            </Text>
          }
        />
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "studentInfoForm_passwordInputLabel" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1">
              {intl.formatMessage({
                id: isPasswordValid
                  ? "common_passwordTitle"
                  : "common_errorTitle",
              })}
            </Text>
          }
          type="password"
          value={password}
          onChange={handlePassword}
          error={!isPasswordValid}
          helperText={
            <Text
              variant="caption"
              color={isPasswordValid ? "textPrimary" : "error"}
            >
              {isPasswordValid
                ? intl.formatMessage({
                    id: "studentInfoForm_passwordHelperText",
                  })
                : passwordError}
            </Text>
          }
        />
      </FormControl>
      <br />
      <br />
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary">
          <Text variant="button">
            {intl.formatMessage({ id: "common_submit" })}
          </Text>
        </Button>
      </Box>
    </Layout>
  );
};

export default StudentInfoForm;
