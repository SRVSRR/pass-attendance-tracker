import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Attendance } from "../types";

export const exportToExcel = async (
    attendanceData: Attendance[],
    courseCode: string,
    leaderName: string
): Promise<void> => {
    try {
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();

        // Prepare data for Excel
        const excelData = attendanceData.map((record) => {
            const date = new Date(record.datetime);
            return {
                "Student ID": record.studentId,
                "Student Name": record.studentName,
                Sponsor: record.sponsor,
                Date: date.toLocaleDateString(),
                Time: date.toLocaleTimeString(),
                "Course Code": record.courseCode,
                "Leader Name": record.leaderName,
            };
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, {
            type: "base64",
            bookType: "xlsx",
        });

        // Create file name with hyphenated leader name
        const hyphenatedLeaderName = leaderName.replace(/\s+/g, "-");
        const fileName = `${courseCode}-${hyphenatedLeaderName}.xlsx`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        // Write file to device
        await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dialogTitle: "Export Attendance Data",
            });
        } else {
            console.log("Sharing is not available on this device");
        }
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        throw error;
    }
};
