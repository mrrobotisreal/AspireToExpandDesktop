import React, { FC, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
  Stack,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useStudentContext } from "../../context/studentContext";
import { useMessagesContext } from "../../context/messagesContext";
import { useThemeContext } from "../../context/themeContext";
import {
  usePaymentContext,
  LessonPackageId,
} from "../../context/paymentContext";
import useGetStudentInfo from "../../hooks/useGetStudentInfo";
import useUploadImage from "../../hooks/useUploadImage";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";
import { LessonPackage, lessonPackages } from "../../constants/prices";

const ProfileSettings: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo, updateInfoOnServer } = useStudentContext();
  // const { studentInfo } = useGetStudentInfo(info.student_id!);
  const { changeLocale } = useMessagesContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const { selectedPackageId, changeSelectedPackageId } = usePaymentContext();
  const navigate = useNavigate();
  const { uploadImage } = useUploadImage();
  const [profilePictureURL, setProfilePictureURL] = useState(
    info.profile_picture_url ?? ""
  );
  const [profilePicturePath, setProfilePicturePath] = useState(
    info.profile_picture_path ?? ""
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    info.preferred_language ?? "en"
  );
  const [avatarSrc, setAvatarSrc] = useState(
    info.profile_picture_url ?? info.profile_picture_path ?? ""
  );
  const [timeZone, setTimeZone] = useState(
    info.time_zone ?? "timeZone_us_pacific"
  );
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({ id: "common_settingsSaved_success" })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [lessonPackageSelected, setLessonPackageSelected] =
    useState<LessonPackage>({
      id: "3_lessons",
      name: "3 Lessons",
      price: 114,
    });
  const [lessonsRemaining, setLessonsRemaining] = useState(
    info.lessons_remaining || 0
  );

  const handleChooseImage = async () => {
    const filePath = await window.electronAPI.selectImage();

    if (filePath) {
      const fileExtension = filePath.split(".").pop();
      console.log(`File extension: ${fileExtension}`);

      if (!fileExtension) {
        console.error("File extension is required to upload image");
        return;
      }

      if (!info.student_id || info.student_id === "") {
        console.error("Student ID is required to upload image");
        return;
      }

      try {
        const uploadedImage = await uploadImage(
          filePath,
          fileExtension,
          info.student_id
        );

        if (uploadedImage) {
          setProfilePictureURL(uploadedImage.imageURL);
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };

  const handlePreferredLanguage = (event: SelectChangeEvent) => {
    setPreferredLanguage(event.target.value as string);
    changeLocale(event.target.value as string);
  };

  const handleUpdateSettingsOnServer = async () => {
    if (!info.student_id || info.student_id === "") {
      console.error("Student ID is required to update settings on server");
      return;
    }
    if (!info.email_address || info.email_address === "") {
      console.error("Email address is required to update settings on server");
      return;
    }

    try {
      await updateInfoOnServer({
        student_id: info.student_id,
        email_address: info.email_address,
        preferred_language: preferredLanguage,
        profile_picture_url: profilePictureURL,
        profile_picture_path: profilePicturePath,
        time_zone: timeZone,
      });
    } catch (error) {
      console.error("Error updating settings on server: ", error);
    }
  };

  const handleUpdateSettings = async () => {
    console.log("Student ID: ", info.student_id);
    const url = `https://aspirewithalina.com:8888/student?studentID=${info.student_id}`;
    console.log(`URL: ${url}`);
    const getInfoRes = await fetch(url);
    const getInfoData = await getInfoRes.json();
    console.log(`Get info response: ${JSON.stringify(getInfoData, null, 2)}`);
    updateInfo({
      ...info,
      preferred_language: preferredLanguage,
      profile_picture_url: profilePictureURL,
      profile_picture_path: profilePicturePath,
      time_zone: timeZone,
      lessons_remaining: lessonsRemaining,
    });
    // handleUpdateSettingsOnServer();
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

  const handleOpenPaymentDialog = () => setIsPaymentDialogOpen(true);
  const handleClosePaymentDialog = () => setIsPaymentDialogOpen(false);
  const handleClickBuy = () => {
    let lessonCost: string;
    if (lessonPackageSelected.id === "1_lesson") {
      lessonCost = "$40";
    } else if (lessonPackageSelected.id === "3_lessons") {
      lessonCost = "$38";
    } else if (lessonPackageSelected.id === "6_lessons") {
      lessonCost = "$35";
    } else {
      lessonCost = "$30";
    }
    setIsPaymentDialogOpen(false);
    navigate("/payment", {
      state: {
        packageId: lessonPackageSelected.id,
        packageLabel: lessonPackageSelected.name,
        packagePrice: lessonPackageSelected.price,
        lessonPrice: lessonCost,
      },
    });
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    if (info.profile_picture_url) {
      setProfilePictureURL(info.profile_picture_url);
    }

    if (info.profile_picture_path) {
      setProfilePicturePath(info.profile_picture_path);
    }

    if (info.preferred_language) {
      setPreferredLanguage(info.preferred_language);
    }

    if (info.time_zone) {
      setTimeZone(info.time_zone);
    }

    console.log("Info: ", JSON.stringify(info, null, 2));
    if (info.lessons_remaining) {
      setLessonsRemaining(info.lessons_remaining);
    }
  }, [info]);

  useEffect(() => {
    if (profilePictureURL && profilePictureURL !== "") {
      setAvatarSrc(profilePictureURL);
    } else if (profilePicturePath && profilePicturePath !== "") {
      setAvatarSrc(profilePicturePath);
    } else {
      setAvatarSrc("");
    }
  }, [profilePictureURL, profilePicturePath]);

  return (
    <Layout title={intl.formatMessage({ id: "common_account" })}>
      <Text variant="h4" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "account_profileSettings" })}
      </Text>
      <Text variant="body1" fontFamily={regularFont} color="textPrimary">
        {intl.formatMessage({ id: "account_profileSettings_description" })}
      </Text>
      <br />
      <br />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2}>
            <Text
              variant="h6"
              fontWeight="bold"
              fontFamily={heavyFont}
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_profileSettings_profilePicture",
              })}
              :
            </Text>
            <Avatar
              src={avatarSrc}
              sx={{
                width: 160,
                height: 160,
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleChooseImage}
              sx={{ maxWidth: 300 }}
            >
              <Text
                variant="body1"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "common_chooseImage" })}
              </Text>
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2}>
            <Text
              variant="h6"
              fontWeight="bold"
              fontFamily={heavyFont}
              color="textPrimary"
            >
              {intl.formatMessage({ id: "common_preferredLanguage" })}:
            </Text>
            <FormControl sx={{ minWidth: 300, maxWidth: 400 }}>
              <Select
                id="preferredLanguage"
                value={preferredLanguage}
                onChange={handlePreferredLanguage}
              >
                <MenuItem value="en">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "common_language_en" })}
                  </Text>
                </MenuItem>
                <MenuItem value="uk">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "common_language_uk" })}
                  </Text>
                </MenuItem>
                <MenuItem value="ru">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "common_language_ru" })}
                  </Text>
                </MenuItem>
                <MenuItem value="de">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "common_language_de" })}
                  </Text>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2}>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {/* {intl.formatMessage(
              { id: "account_profileSettings_totalLessonsRemaining" },
              {
                lessonsRemaining,
              }
            )} */}
              Total lessons remaining:
            </Text>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {lessonsRemaining}
            </Text>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleOpenPaymentDialog}
              sx={{ maxWidth: 300 }}
            >
              <Text
                variant="button"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({
                  id: "account_profileSettings_buyMoreLessons",
                })}
              </Text>
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2}>
            <Text
              variant="h6"
              fontWeight="bold"
              fontFamily={heavyFont}
              color="textPrimary"
            >
              {intl.formatMessage({ id: "common_timeZone" })}:
            </Text>
            <FormControl sx={{ minWidth: 300, maxWidth: 400 }}>
              <Select
                id="timeZone"
                value={timeZone}
                onChange={handleSetTimeZone}
              >
                <MenuItem value="timeZone_us_pacific">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_us_pacific" })}
                  </Text>
                </MenuItem>
                <MenuItem value="timeZone_us_mountain">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_us_mountain" })}
                  </Text>
                </MenuItem>
                <MenuItem value="timeZone_us_central">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_us_central" })}
                  </Text>
                </MenuItem>
                <MenuItem value="timeZone_us_eastern">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_us_eastern" })}
                  </Text>
                </MenuItem>
                <MenuItem value="timeZone_at_vienna">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_at_vienna" })}
                  </Text>
                </MenuItem>
                <MenuItem value="timeZone_ua_kyiv">
                  <Text
                    variant="body1"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {intl.formatMessage({ id: "timeZone_ua_kyiv" })}
                  </Text>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
      <br />
      <br />
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{ backgroundColor: theme.palette.secondary.light }}
          onClick={handleUpdateSettings}
        >
          <Text variant="body1" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({ id: "common_settings_save" })}
          </Text>
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
      <Dialog open={isPaymentDialogOpen} onClose={handleClosePaymentDialog}>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            fontFamily: heavyFont,
          }}
        >
          {intl.formatMessage({ id: "account_profileSettings_buyMoreLessons" })}
        </DialogTitle>
        <DialogContent>
          <FormControl sx={{ minWidth: 300, mt: 2, mb: 2 }}>
            <FormLabel>
              <Text variant="h6" fontFamily={heavyFont}>
                {intl.formatMessage({
                  id: "account_profileSettings_selectLessonPackage",
                })}
                :
              </Text>
            </FormLabel>
            <Select
              id="lessonPackage"
              value={lessonPackageSelected.id}
              onChange={(event: SelectChangeEvent) => {
                const selectedPackage = lessonPackages.find(
                  (pkg) => pkg.id === event.target.value
                );
                setLessonPackageSelected(
                  selectedPackage ?? lessonPackageSelected
                );
                changeSelectedPackageId(event.target.value! as LessonPackageId);
              }}
            >
              <MenuItem value="1_lesson">
                {intl.formatMessage({
                  id: "account_profileSettings_lessonPackage1",
                })}
              </MenuItem>
              <MenuItem value="3_lessons">
                {intl.formatMessage({
                  id: "account_profileSettings_lessonPackage3",
                })}
              </MenuItem>
              <MenuItem value="6_lessons">
                {intl.formatMessage({
                  id: "account_profileSettings_lessonPackage6",
                })}
              </MenuItem>
              <MenuItem value="12_lessons">
                {intl.formatMessage({
                  id: "account_profileSettings_lessonPackage12",
                })}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClosePaymentDialog}
          >
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_cancel" })}
            </Text>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClickBuy}
          >
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "account_profileSettings_buyLessons" })}
            </Text>
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProfileSettings;
