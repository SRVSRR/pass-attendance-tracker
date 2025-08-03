import * as SQLite from "expo-sqlite";
import { Course, Attendance, Student } from "../types";

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
    try {
        db = await SQLite.openDatabaseAsync("attendance.db");

        // Create courses table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS courses (
        courseCode TEXT PRIMARY KEY,
        leaderName TEXT NOT NULL
      );
    `);

        // Create students table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS students (
        studentId TEXT PRIMARY KEY,
        studentName TEXT NOT NULL,
        sponsor TEXT NOT NULL
      );
    `);

        // Check if attendance table exists and get its structure
        const tableInfo = await db.getAllAsync(
            "PRAGMA table_info(attendance);"
        );

        if (tableInfo.length === 0) {
            // Table doesn't exist, create new one with all columns
            await db.execAsync(`
        CREATE TABLE attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId TEXT NOT NULL,
          studentName TEXT NOT NULL,
          sponsor TEXT NOT NULL,
          datetime TEXT NOT NULL,
          courseCode TEXT NOT NULL,
          leaderName TEXT NOT NULL,
          FOREIGN KEY (courseCode) REFERENCES courses (courseCode),
          FOREIGN KEY (studentId) REFERENCES students (studentId)
        );
      `);
        } else {
            // Check if new columns exist
            const hasStudentName = tableInfo.some(
                (col: any) => col.name === "studentName"
            );
            const hasSponsor = tableInfo.some(
                (col: any) => col.name === "sponsor"
            );

            if (!hasStudentName || !hasSponsor) {
                // Migrate existing table
                console.log("Migrating attendance table...");

                // Create new table with updated schema
                await db.execAsync(`
          CREATE TABLE attendance_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT NOT NULL,
            studentName TEXT NOT NULL,
            sponsor TEXT NOT NULL,
            datetime TEXT NOT NULL,
            courseCode TEXT NOT NULL,
            leaderName TEXT NOT NULL,
            FOREIGN KEY (courseCode) REFERENCES courses (courseCode),
            FOREIGN KEY (studentId) REFERENCES students (studentId)
          );
        `);

                // Copy existing data with default values for new columns
                await db.execAsync(`
          INSERT INTO attendance_new (id, studentId, studentName, sponsor, datetime, courseCode, leaderName)
          SELECT id, studentId, 'Unknown Student' as studentName, 'Unknown Sponsor' as sponsor, datetime, courseCode, leaderName
          FROM attendance;
        `);

                // Drop old table and rename new one
                await db.execAsync(`DROP TABLE attendance;`);
                await db.execAsync(
                    `ALTER TABLE attendance_new RENAME TO attendance;`
                );

                console.log("Database migration completed successfully");
            }
        }

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};

export const addCourse = async (course: Course): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
        await db.runAsync(
            "INSERT INTO courses (courseCode, leaderName) VALUES (?, ?)",
            [course.courseCode, course.leaderName]
        );
    } catch (error) {
        console.error("Error adding course:", error);
        throw error;
    }
};

export const getCourses = async (): Promise<Course[]> => {
    if (!db) throw new Error("Database not initialized");

    try {
        const result = await db.getAllAsync(
            "SELECT * FROM courses ORDER BY courseCode"
        );
        return result as Course[];
    } catch (error) {
        console.error("Error getting courses:", error);
        throw error;
    }
};

export const checkCourseExists = async (
    courseCode: string
): Promise<boolean> => {
    if (!db) throw new Error("Database not initialized");

    try {
        const result = await db.getFirstAsync(
            "SELECT courseCode FROM courses WHERE courseCode = ?",
            [courseCode]
        );
        return result !== null;
    } catch (error) {
        console.error("Error checking course existence:", error);
        throw error;
    }
};

export const addAttendance = async (
    attendance: Omit<Attendance, "id">
): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
        await db.runAsync(
            "INSERT INTO attendance (studentId, studentName, sponsor, datetime, courseCode, leaderName) VALUES (?, ?, ?, ?, ?, ?)",
            [
                attendance.studentId,
                attendance.studentName,
                attendance.sponsor,
                attendance.datetime,
                attendance.courseCode,
                attendance.leaderName,
            ]
        );
    } catch (error) {
        console.error("Error adding attendance:", error);
        throw error;
    }
};

export const getAttendanceForCourse = async (
    courseCode: string
): Promise<Attendance[]> => {
    if (!db) throw new Error("Database not initialized");

    try {
        const result = await db.getAllAsync(
            "SELECT * FROM attendance WHERE courseCode = ? ORDER BY datetime DESC",
            [courseCode]
        );
        return result as Attendance[];
    } catch (error) {
        console.error("Error getting attendance:", error);
        throw error;
    }
};

export const addStudent = async (student: Student): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
        await db.runAsync(
            "INSERT OR REPLACE INTO students (studentId, studentName, sponsor) VALUES (?, ?, ?)",
            [student.studentId, student.studentName, student.sponsor]
        );
    } catch (error) {
        console.error("Error adding student:", error);
        throw error;
    }
};

export const getStudent = async (
    studentId: string
): Promise<Student | null> => {
    if (!db) throw new Error("Database not initialized");

    try {
        const result = await db.getFirstAsync(
            "SELECT * FROM students WHERE studentId = ?",
            [studentId]
        );
        return result as Student | null;
    } catch (error) {
        console.error("Error getting student:", error);
        throw error;
    }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
    if (!db) throw new Error("Database not initialized");
    return db;
};
