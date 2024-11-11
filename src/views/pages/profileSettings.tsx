import React, { FC, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
} from "@mui/material";
import { useIntl } from "react-intl";

import { useStudentContext } from "../../context/studentContext";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";

const ProfileSettings: FC = () => {
  const intl = useIntl();
  const { info, updateInfo } = useStudentContext();
  const [profilePicturePath, setProfilePicturePath] = useState(
    info.profilePicturePath ?? ""
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    info.preferredLanguage ?? "en"
  );
  const [timeZone, setTimeZone] = useState(
    info.timeZone ?? "US Pacific (GMT-8/GMT-7)"
  );
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({ id: "common_settingsSaved_success" })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleChooseImage = async () => {
    const filePath = await window.electronAPI.selectImage();

    console.log("File path: ", `file://${filePath}`);

    if (filePath) {
      setProfilePicturePath(`file://${filePath}`);
    }
  };

  const handlePreferredLanguage = (event: SelectChangeEvent) =>
    setPreferredLanguage(event.target.value as string);

  const handleUpdateSettings = () => {
    updateInfo({
      ...info,
      preferredLanguage,
      profilePicturePath,
      timeZone,
    });
    setToastIsOpen(true);
  };

  const handleSetTimeZone = (event: SelectChangeEvent) =>
    setTimeZone(event.target.value as string);

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
    <Layout title={intl.formatMessage({ id: "common_account" })}>
      <Text variant="h4" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "account_profileSettings" })}
      </Text>
      <Text variant="body1">
        {intl.formatMessage({ id: "account_profileSettings_description" })}
      </Text>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "account_profileSettings_profilePicture" })}:
      </Text>
      <Avatar
        src={profilePicturePath}
        sx={{
          width: 160,
          height: 160,
        }}
      />
      <br />
      <Button variant="outlined" color="inherit" onClick={handleChooseImage}>
        {intl.formatMessage({ id: "common_chooseImage" })}
      </Button>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "common_preferredLanguage" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="preferredLanguage"
          value={preferredLanguage}
          onChange={handlePreferredLanguage}
        >
          <MenuItem value="en">
            <Text variant="body1">
              {intl.formatMessage({ id: "common_language_en" })}
            </Text>
          </MenuItem>
          <MenuItem value="uk">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              {intl.formatMessage({ id: "common_language_uk" })}
            </Text>
          </MenuItem>
          <MenuItem value="ru">
            <Text variant="body1" fontFamily="Ubuntu-Regular">
              {intl.formatMessage({ id: "common_language_ru" })}
            </Text>
          </MenuItem>
          <MenuItem value="de">
            <Text variant="body1">
              {intl.formatMessage({ id: "common_language_de" })}
            </Text>
          </MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontWeight="bold" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "common_timeZone" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select id="timeZone" value={timeZone} onChange={handleSetTimeZone}>
          <MenuItem value="US Pacific (GMT-8/GMT-7)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_us_pacific" })}
            </Text>
          </MenuItem>
          <MenuItem value="US Mountain (GMT-7/GMT-6)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_us_mountain" })}
            </Text>
          </MenuItem>
          <MenuItem value="US Central (GMT-6/GMT-5)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_us_central" })}
            </Text>
          </MenuItem>
          <MenuItem value="US Eastern (GMT-5/GMT-4)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_us_eastern" })}
            </Text>
          </MenuItem>
          <MenuItem value="Austria (GMT+1/GMT+2)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_at_vienna" })}
            </Text>
          </MenuItem>
          <MenuItem value="Ukraine (GMT+2/GMT+3)">
            <Text variant="body1">
              {intl.formatMessage({ id: "timeZone_ua_kyiv" })}
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

export default ProfileSettings;
