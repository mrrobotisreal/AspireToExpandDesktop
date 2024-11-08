import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

interface StudentInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  // TODO: Add more fields
}

interface StudentInfoContext {
  info: StudentInfo;
  updateInfo: (newInfo: StudentInfo) => void;
}

const StudentContext = createContext<StudentInfoContext>({
  info: {},
  updateInfo: () => {},
});

export const useStudentContext = () =>
  useContext<StudentInfoContext>(StudentContext);

interface StudentProviderProps {
  children: ReactNode;
}

const StudentProvider: FC<StudentProviderProps> = ({ children }) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({});

  const updateInfo = (newInfo: StudentInfo) => setStudentInfo(newInfo);

  const values = {
    info: studentInfo,
    updateInfo,
  };

  return (
    <StudentContext.Provider value={values}>{children}</StudentContext.Provider>
  );
};

export default StudentProvider;
