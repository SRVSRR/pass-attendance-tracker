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
import { Plus } from 'lucide-react-native'
import { Course } from '../types'
import { getCourses } from '../database'

interface HomeScreenProps {
    onCreateCourse: () => void
    onCourseSelect: (course: Course) => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onCreateCourse,
    onCourseSelect,
}) => {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const insets = useSafeAreaInsets()

    const loadCourses = async () => {
        try {
            const coursesData = await getCourses()
            setCourses(coursesData)
        } catch (error) {
            Alert.alert('Error', 'Failed to load courses')
            console.error('Error loading courses:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCourses()
    }, [])

    // Refresh courses when component becomes visible
    useEffect(() => {
        const interval = setInterval(loadCourses, 1000)
        return () => clearInterval(interval)
    }, [])

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.courseItem}
            onPress={() => onCourseSelect(item)}
        >
            <View style={styles.courseInfo}>
                <Text style={styles.courseCode}>{item.courseCode}</Text>
                <Text style={styles.leaderName}>{item.leaderName}</Text>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={[styles.container, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }]}>
            <View style={styles.header}>
                <Text style={styles.title}>PASS Attendance Tracker</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.createButton} onPress={onCreateCourse}>
                    <Plus color="#FFFFFF" size={24} />
                    <Text style={styles.createButtonText}>Create Course</Text>
                </TouchableOpacity>

                {loading ? (
                    <Text style={styles.loadingText}>Loading courses...</Text>
                ) : courses.length === 0 ? (
                    <Text style={styles.emptyText}>No courses created yet</Text>
                ) : (
                    <FlatList
                        data={courses}
                        renderItem={renderCourseItem}
                        keyExtractor={(item) => item.courseCode}
                        style={styles.coursesList}
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
        alignItems: 'center',
        padding: 20,
        paddingTop: 20, // Remove extra top padding since SafeAreaView handles it
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 0,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        marginTop: 20,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    coursesList: {
        flex: 1,
    },
    courseItem: {
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    courseInfo: {
        flexDirection: 'column',
    },
    courseCode: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    leaderName: {
        color: '#8E8E93',
        fontSize: 14,
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
