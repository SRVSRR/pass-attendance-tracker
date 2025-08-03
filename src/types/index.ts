export interface Course {
    courseCode: string;
    leaderName: string;
}

export interface Student {
    studentId: string;
    studentName: string;
    sponsor: string;
}

export interface Attendance {
    id?: number;
    studentId: string;
    studentName: string;
    sponsor: string;
    datetime: string;
    courseCode: string;
    leaderName: string;
}

export type Screen =
    | "Home"
    | "CreateCourse"
    | "Course"
    | "Scan"
    | "SaveAttendance";

export interface NavigationState {
    currentScreen: Screen;
    selectedCourse: Course | null;
    scannedStudentId?: string;
}
