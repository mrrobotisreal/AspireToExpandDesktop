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

interface ServerStudentInfo {
  student_id: string;
  first_name: string;
  preferred_name: string;
  last_name: string;
  email_address: string;
  native_language: string;
  preferred_language: string;
  student_since: string;
  theme_mode: ThemeMode;
  profile_picture_url: string;
  profile_picture_path: string;
  font_style: AppFontStyle;
  time_zone: string;
  lessons_remaining: number;
  lessons_completed: number;
}

interface StudentInfo {
  student_id?: string;
  first_name?: string;
  preferred_name?: string;
  last_name?: string;
  email_address?: string;
  native_language?: string;
  preferred_language?: string;
  student_since?: string;
  theme_mode?: ThemeMode;
  font_style?: AppFontStyle;
  profile_picture_url?: string;
  profile_picture_path?: string;
  time_zone?: string;
  lessons_remaining?: number;
  lessons_completed?: number;
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
  getInfoFromServer: (studentID: string) => Promise<ServerStudentInfo>;
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

const getInfoFromServer = async (
  studentID: string
): Promise<ServerStudentInfo> => {
  try {
    const response = await fetch(
      `${MAIN_SERVER_URL}/student?studentID=${studentID}`
    );
    const data = await response.json();
    const { student } = data;

    return student;
  } catch (error) {
    console.error("Error fetching student info:", error); // TODO: localize
    throw error;
  }
};

const StudentContext = createContext<StudentInfoContext>({
  info: {},
  getInfo,
  getInfoFromServer,
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

  const checkIsInfoInSyncWithServer = (
    newInfo: StudentInfo,
    serverInfo: ServerStudentInfo
  ) => {
    const newInfoKeys = Object.keys(newInfo);
    const serverInfoKeys = Object.keys(serverInfo);

    if (newInfoKeys.length !== serverInfoKeys.length) return false;

    for (const key of serverInfoKeys) {
      // @ts-ignore
      if (newInfo[key] !== serverInfo[key]) return false;
    }

    return true;
  };

  const updateInfo = async (newInfo: StudentInfo) => {
    const infoOnServer = await getInfoFromServer(newInfo.student_id!);
    const isInfoInSync = checkIsInfoInSyncWithServer(newInfo, infoOnServer);
    if (isInfoInSync) {
      setStudentInfo(newInfo);
      localStorage.setItem("studentInfo", JSON.stringify(newInfo));
    } else {
      setStudentInfo(infoOnServer);
      localStorage.setItem("studentInfo", JSON.stringify(infoOnServer));
    }
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
    getInfoFromServer,
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
