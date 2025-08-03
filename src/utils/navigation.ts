import { NavigationState, Screen, Course } from "../types";

export const createNavigationActions = (
    setNavigationState: React.Dispatch<React.SetStateAction<NavigationState>>
) => {
    const navigateToHome = () => {
        setNavigationState({
            currentScreen: "Home",
            selectedCourse: null,
        });
    };

    const navigateToCreateCourse = () => {
        setNavigationState((prev) => ({
            ...prev,
            currentScreen: "CreateCourse",
        }));
    };

    const navigateToCourse = (course: Course) => {
        setNavigationState({
            currentScreen: "Course",
            selectedCourse: course,
        });
    };

    const navigateToScan = (course: Course) => {
        setNavigationState({
            currentScreen: "Scan",
            selectedCourse: course,
        });
    };

    const navigateToSaveAttendance = (course: Course, studentId: string) => {
        setNavigationState({
            currentScreen: "SaveAttendance",
            selectedCourse: course,
            scannedStudentId: studentId,
        });
    };

    return {
        navigateToHome,
        navigateToCreateCourse,
        navigateToCourse,
        navigateToScan,
        navigateToSaveAttendance,
    };
};
