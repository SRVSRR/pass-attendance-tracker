import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Scan, Download } from 'lucide-react-native'
import { Course, Attendance } from '../types'
import { getAttendanceForCourse } from '../database'
import { exportToExcel } from '../utils/exportUtils'

interface CourseScreenProps {
    course: Course
    onBack: () => void
    onScan: () => void
}

export const CourseScreen: React.FC<CourseScreenProps> = ({
    course,
    onBack,
    onScan,
}) => {
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const insets = useSafeAreaInsets()

    const loadAttendance = async () => {
        try {
            const attendanceData = await getAttendanceForCourse(course.courseCode)
            setAttendance(attendanceData)
        } catch (error) {
            Alert.alert('Error', 'Failed to load attendance data')
            console.error('Error loading attendance:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAttendance()
    }, [course.courseCode])

    // Auto-refresh attendance data
    useEffect(() => {
        const interval = setInterval(loadAttendance, 2000)
        return () => clearInterval(interval)
    }, [course.courseCode])

    const handleExport = async () => {
        setExporting(true)
        try {
            await exportToExcel(attendance, course.courseCode, course.leaderName)
            // No success message - just export silently
        } catch (error) {
            Alert.alert('Error', 'Failed to export attendance data')
            console.error('Error exporting:', error)
        } finally {
            setExporting(false)
        }
    }

    const renderAttendanceItem = ({ item }: { item: Attendance }) => (
        <View style={styles.attendanceItem}>
            <View style={styles.attendanceInfo}>
                <View style={styles.studentDetails}>
                    <Text style={styles.studentId}>{item.studentId}</Text>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                </View>
                <Text style={styles.datetime}>
                    {new Date(item.datetime).toLocaleDateString()}
                </Text>
            </View>
        </View>
    )

    return (
        <View style={[styles.container, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft color="#007AFF" size={24} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{course.courseCode}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.scanButton} onPress={onScan}>
                    <Scan color="#FFFFFF" size={20} />
                    <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.exportButton,
                        (exporting || attendance.length === 0) && styles.exportButtonDisabled
                    ]}
                    onPress={handleExport}
                    disabled={exporting || attendance.length === 0}
                >
                    <Download color="#FFFFFF" size={20} />
                    <Text style={styles.buttonText}>
                        {exporting ? 'Exporting...' : 'Export'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.attendanceSection}>
                <Text style={styles.sectionTitle}>
                    Attendance Records ({attendance.length})
                </Text>

                {loading ? (
                    <Text style={styles.loadingText}>Loading attendance...</Text>
                ) : attendance.length === 0 ? (
                    <Text style={styles.emptyText}>No attendance records yet</Text>
                ) : (
                    <FlatList
                        data={attendance}
                        renderItem={renderAttendanceItem}
                        keyExtractor={(item) => `${item.id}`}
                        style={styles.attendanceList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 20, // Remove extra top padding since SafeAreaView handles it
    },
    backButton: {
        padding: 8,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    scanButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButton: {
        flex: 1,
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButtonDisabled: {
        backgroundColor: '#8E8E93',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    attendanceSection: {
        flex: 1,
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    attendanceList: {
        flex: 1,
    },
    attendanceItem: {
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    attendanceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    studentDetails: {
        flex: 1,
    },
    studentId: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    studentName: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 2,
    },
    datetime: {
        color: '#8E8E93',
        fontSize: 16,
        textAlign: 'right',
    },
    loadingText: {
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    emptyText: {
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
})
