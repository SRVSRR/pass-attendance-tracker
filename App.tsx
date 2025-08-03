import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Alert, BackHandler } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { initDatabase } from './src/database'
import { NavigationState, Course } from './src/types'
import { createNavigationActions } from './src/utils/navigation'
import {
    HomeScreen,
    CreateCourseScreen,
    CourseScreen,
    ScanScreen,
    SaveAttendanceScreen,
} from './src/screens'

export default function App() {
    const [navigationState, setNavigationState] = useState<NavigationState>({
        currentScreen: 'Home',
        selectedCourse: null,
        scannedStudentId: undefined,
    })
    const [databaseReady, setDatabaseReady] = useState(false)

    const navigation = createNavigationActions(setNavigationState)

    useEffect(() => {
        const setupDatabase = async () => {
            try {
                await initDatabase()
                setDatabaseReady(true)
            } catch (error) {
                Alert.alert('Database Error', 'Failed to initialize database')
                console.error('Database initialization error:', error)
            }
        }

        setupDatabase()
    }, [])

    // Handle hardware back button
    useEffect(() => {
        const backAction = () => {
            switch (navigationState.currentScreen) {
                case 'Home':
                    return false // Let system handle exit
                case 'CreateCourse':
                    navigation.navigateToHome()
                    return true
                case 'Course':
                    navigation.navigateToHome()
                    return true
                case 'Scan':
                    if (navigationState.selectedCourse) {
                        navigation.navigateToCourse(navigationState.selectedCourse)
                    } else {
                        navigation.navigateToHome()
                    }
                    return true
                case 'SaveAttendance':
                    if (navigationState.selectedCourse) {
                        navigation.navigateToScan(navigationState.selectedCourse)
                    } else {
                        navigation.navigateToHome()
                    }
                    return true
                default:
                    return false
            }
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
        return () => backHandler.remove()
    }, [navigationState.currentScreen, navigationState.selectedCourse, navigation])

    if (!databaseReady) {
        return null // Show loading screen in production
    }

    const renderCurrentScreen = () => {
        switch (navigationState.currentScreen) {
            case 'Home':
                return (
                    <HomeScreen
                        onCreateCourse={navigation.navigateToCreateCourse}
                        onCourseSelect={navigation.navigateToCourse}
                    />
                )

            case 'CreateCourse':
                return <CreateCourseScreen onBack={navigation.navigateToHome} />

            case 'Course':
                if (!navigationState.selectedCourse) {
                    navigation.navigateToHome()
                    return null
                }
                return (
                    <CourseScreen
                        course={navigationState.selectedCourse}
                        onBack={navigation.navigateToHome}
                        onScan={() => navigation.navigateToScan(navigationState.selectedCourse!)}
                    />
                )

            case 'Scan':
                if (!navigationState.selectedCourse) {
                    navigation.navigateToHome()
                    return null
                }
                return (
                    <ScanScreen
                        course={navigationState.selectedCourse}
                        onBack={() => navigation.navigateToCourse(navigationState.selectedCourse!)}
                        onStudentScanned={(studentId) =>
                            navigation.navigateToSaveAttendance(navigationState.selectedCourse!, studentId)
                        }
                    />
                )

            case 'SaveAttendance':
                if (!navigationState.selectedCourse || !navigationState.scannedStudentId) {
                    navigation.navigateToHome()
                    return null
                }
                return (
                    <SaveAttendanceScreen
                        course={navigationState.selectedCourse}
                        studentId={navigationState.scannedStudentId}
                        onBack={() => navigation.navigateToScan(navigationState.selectedCourse!)}
                        onSave={() => navigation.navigateToScan(navigationState.selectedCourse!)}
                    />
                )

            default:
                return (
                    <HomeScreen
                        onCreateCourse={navigation.navigateToCreateCourse}
                        onCourseSelect={navigation.navigateToCourse}
                    />
                )
        }
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="light" backgroundColor="#000000" />
            {renderCurrentScreen()}
        </SafeAreaProvider>
    )
}
