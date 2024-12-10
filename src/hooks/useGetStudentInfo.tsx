import { QueryKey, useQuery, UseQueryResult } from "@tanstack/react-query";

import { AppFontStyle } from "../constants/fonts";
import { MAIN_SERVER_URL } from "../constants/urls";
import { ThemeMode } from "../context/themeContext";

interface GetStudentInfoResponse {
  student_id: string;
  first_name: string;
  preferred_name: string;
  last_name: string;
  email_address: string;
  native_language: string;
  preferred_language: string;
  student_since: number;
  theme_mode: ThemeMode;
  profile_picture_url: string;
  profile_picture_path: string;
  font_style: AppFontStyle;
  time_zone: string;
  lessons_remaining: number;
  lessons_completed: number;
}

interface UseGetStudentInfoReturns {
  studentInfo?: GetStudentInfoResponse;
  isLoading: boolean;
  isError: boolean;
}

const getStudentInfo = async (
  studentID: string
): Promise<GetStudentInfoResponse> => {
  try {
    const response = await fetch(
      `${MAIN_SERVER_URL}/student?studentID=${studentID}`
    );
    const data: GetStudentInfoResponse = await response.json();

    return data;
  } catch (error) {
    throw new Error("Failed to fetch student info");
  }
};

const useGetStudentInfo = (studentID: string): UseGetStudentInfoReturns => {
  const { data, isLoading, isError } = useQuery<GetStudentInfoResponse>({
    queryKey: ["getStudentInfo"],
    queryFn: () => getStudentInfo(studentID),
  });

  return {
    studentInfo: data,
    isLoading,
    isError,
  };
};

export default useGetStudentInfo;
