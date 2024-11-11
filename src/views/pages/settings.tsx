import React, { FC, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
} from "@mui/material";
import { useIntl } from "react-intl";

import { AppFontStyle } from "../../constants/fonts";
import { AppThemeMode } from "../../constants/theme";
import { useStudentContext } from "../../context/studentContext";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";

const Settings: FC = () => {
  const intl = useIntl();
  const { info, updateInfo } = useStudentContext();
  const [selectedThemeMode, setSelectedThemeMode] =
    useState<AppThemeMode>("system");
  const [selectedFontFamily, setSelectedFontFamily] =
    useState<AppFontStyle>("Bauhaus");
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({ id: "common_settingsSaved_success" })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSelectThemeMode = (event: SelectChangeEvent) =>
    setSelectedThemeMode(event.target.value as AppThemeMode);

  const handleSelectFontStyle = (event: SelectChangeEvent) =>
    setSelectedFontFamily(event.target.value as AppFontStyle);

  const handleUpdateSettings = () => {
    updateInfo({
      ...info,
      themeMode: selectedThemeMode,
      fontStyle: selectedFontFamily,
    });
    setToastIsOpen(true);
  };

  const handleCloseToast = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToastIsOpen(false);
  };

  return (
    <Layout title={intl.formatMessage({ id: "common_settingsTitle" })}>
      <Text variant="h4" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "account_appSettings" })}
      </Text>
      <Text variant="body1">
        {intl.formatMessage({ id: "account_appSettings_description" })}
      </Text>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "account_appSettings_themeMode" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="themeMode"
          value={selectedThemeMode}
          onChange={handleSelectThemeMode}
        >
          <MenuItem value="system">
            <Text variant="body1">
              {intl.formatMessage({
                id: "account_appSettings_themeMode_systemTheme",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="light">
            <Text variant="body1">
              {intl.formatMessage({
                id: "account_appSettings_themeMode_lightTheme",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="dark">
            <Text variant="body1">
              {intl.formatMessage({
                id: "account_appSettings_themeMode_darkTheme",
              })}
            </Text>
          </MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "account_appSettings_fontStyle" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="fontStyle"
          value={selectedFontFamily}
          onChange={handleSelectFontStyle}
        >
          <MenuItem value="Bauhaus">
            <Text variant="body1">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_bauhaus",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Hummingbird">
            <Text variant="body1" fontFamily="Hummingbird">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_hummingbird",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="LobsterTwo">
            <Text variant="body1" fontFamily="LobsterTwo-Regular">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_lobsterTwo",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="NexaScript">
            <Text variant="body1" fontFamily="NexaScript-Light">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_nexaScript",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="NotoSerif">
            <Text variant="body1" fontFamily="NotoSerif">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_notoSerif",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Roboto">
            <Text variant="body1" fontFamily="Roboto-Regular">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_roboto",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Ubuntu">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_ubuntu",
              })}
            </Text>
          </MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateSettings}
        >
          {intl.formatMessage({ id: "common_settings_save" })}
        </Button>
      </Box>
      <Toast
        message={toastMessage}
        alertProps={{
          severity: toastSeverity,
          onClose: handleCloseToast,
        }}
        snackbarProps={{
          open: toastIsOpen,
          onClose: handleCloseToast,
        }}
      />
    </Layout>
  );
};

export default Settings;
