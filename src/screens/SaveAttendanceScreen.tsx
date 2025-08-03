import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Save } from 'lucide-react-native'
import { Course, Student } from '../types'
import { getStudent, addStudent, addAttendance } from '../database'

interface SaveAttendanceScreenProps {
    course: Course
    studentId: string
    onBack: () => void
    onSave: () => void
}

export const SaveAttendanceScreen: React.FC<SaveAttendanceScreenProps> = ({
    course,
    studentId,
    onBack,
    onSave,
}) => {
    const [studentName, setStudentName] = useState('')
    const [sponsor, setSponsor] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const insets = useSafeAreaInsets()

    useEffect(() => {
        loadStudentData()
    }, [studentId])

    useEffect(() => {
        setIsFormValid(studentName.trim() !== '' && sponsor.trim() !== '')
    }, [studentName, sponsor])

    const loadStudentData = async () => {
        try {
            const existingStudent = await getStudent(studentId)
            if (existingStudent) {
                setStudentName(existingStudent.studentName)
                setSponsor(existingStudent.sponsor)
            }
        } catch (error) {
            console.error('Error loading student data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!isFormValid) return

        setSaving(true)
        try {
            // Save student data (upsert)
            await addStudent({
                studentId,
                studentName: studentName.trim(),
                sponsor: sponsor.trim(),
            })

            // Record attendance
            await addAttendance({
                studentId,
                studentName: studentName.trim(),
                sponsor: sponsor.trim(),
                datetime: new Date().toISOString(),
                courseCode: course.courseCode,
                leaderName: course.leaderName,
            })

            onSave()
        } catch (error) {
            Alert.alert('Error', 'Failed to save attendance')
            console.error('Error saving attendance:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
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
                    <Text style={styles.title}>Loading...</Text>
                    <View style={styles.placeholder} />
                </View>
            </View>
        )
    }

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
                <Text style={styles.title}>Save Attendance</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Student ID</Text>
                    <View style={styles.readOnlyInput}>
                        <Text style={styles.readOnlyText}>{studentId}</Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Student Name</Text>
                    <TextInput
                        style={styles.input}
                        value={studentName}
                        onChangeText={setStudentName}
                        placeholder="Enter student name"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sponsor</Text>
                    <TextInput
                        style={styles.input}
                        value={sponsor}
                        onChangeText={setSponsor}
                        placeholder="Enter sponsor name"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="words"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!isFormValid || saving) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!isFormValid || saving}
                >
                    <Save color="#FFFFFF" size={20} />
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </Text>
                </TouchableOpacity>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    placeholder: {
        width: 40,
    },
    form: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    readOnlyInput: {
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
    },
    readOnlyText: {
        fontSize: 16,
        color: '#8E8E93',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#8E8E93',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
})
