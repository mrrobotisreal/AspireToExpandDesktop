import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import { AppFontStyle } from "../constants/fonts";
import { MAIN_SERVER_URL } from "../constants/urls";
import { ThemeMode } from "./themeContext";

interface StudentInfo {
  studentId?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  emailAddress?: string;
  nativeLanguage?: string;
  preferredLanguage?: string;
  themeMode?: ThemeMode;
  fontStyle?: AppFontStyle;
  profilePictureURL?: string;
  profilePicturePath?: string;
  timeZone?: string;
  lessonsRemaining?: number;
  lessonsCompleted?: number;
  // TODO: Add more fields
}

interface UpcomingClass {
  dateAndTime: string;
  preferredName: string;
  profilePicURL: string;
  room: string;
  teacherID: string;
  subject: string;
}

interface StudentInfoContext {
  info: StudentInfo;
  getInfo: () => StudentInfo | null;
  removeInfo: () => void;
  updateInfo: (newInfo: StudentInfo) => void;
  updateInfoOnServer: (newInfo: UpdateStudentInfoRequest) => Promise<void>;
  classes: UpcomingClass[];
  fetchClasses: () => Promise<void>;
}

const getInfo = () => {
  const info = localStorage.getItem("studentInfo");

  return info ? JSON.parse(info) : null;
};

const removeInfo = () => localStorage.removeItem("studentInfo");

const StudentContext = createContext<StudentInfoContext>({
  info: {},
  getInfo,
  removeInfo,
  updateInfo: () => {},
  updateInfoOnServer: async () => {},
  classes: [],
  fetchClasses: async () => {},
});

export const useStudentContext = () =>
  useContext<StudentInfoContext>(StudentContext);

interface UpdateStudentInfoRequest {
  student_id: string;
  email_address?: string;
  preferred_name?: string;
  preferred_language?: string;
  theme_mode?: ThemeMode;
  font_style?: AppFontStyle;
  profile_picture_url?: string;
  profile_picture_path?: string;
  time_zone?: string;
  public_key?: string;
  lessons_remaining?: number;
  lessons_completed?: number;
}

const updateInfoOnServer = async (newInfo: UpdateStudentInfoRequest) => {
  try {
    const response = await fetch(`${MAIN_SERVER_URL}/students/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(newInfo),
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Student info updated successfully on the server");
    }
  } catch (error) {
    console.error("Error updating student info:", error); // TODO: localize
    throw error;
  }
};

interface StudentProviderProps {
  children: ReactNode;
}

const StudentProvider: FC<StudentProviderProps> = ({ children }) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({});
  const [classes, setClasses] = useState<UpcomingClass[]>([]);

  const updateInfo = (newInfo: StudentInfo) => {
    setStudentInfo(newInfo);
    localStorage.setItem("studentInfo", JSON.stringify(newInfo));
  };

  const fetchClasses = async () => {
    setClasses([
      {
        dateAndTime: "2024-12-02T10:00:00",
        preferredName: "Alina",
        profilePicURL:
          "file:///Users/mitchwintrow/Pictures/alinaProfilePic.png",
        room: "123",
        teacherID: "alina-123-abc",
        subject: "Punctuation",
      },
      {
        dateAndTime: "2024-12-02T11:00:00",
        preferredName: "Alina",
        profilePicURL:
          "file:///Users/mitchwintrow/Pictures/alinaProfilePic.png",
        room: "123",
        teacherID: "alina-123-abc",
        subject: "Critical Thinking",
      },
      {
        dateAndTime: "2024-12-02T12:00:00",
        preferredName: "Alina",
        profilePicURL:
          "file:///Users/mitchwintrow/Pictures/alinaProfilePic.png",
        room: "123",
        teacherID: "alina-123-abc",
        subject: "Grammar",
      },
    ]);
  };

  const values = {
    info: studentInfo,
    getInfo,
    removeInfo,
    updateInfo,
    updateInfoOnServer,
    classes,
    fetchClasses,
  };

  return (
    <StudentContext.Provider value={values}>{children}</StudentContext.Provider>
  );
};

export default StudentProvider;
