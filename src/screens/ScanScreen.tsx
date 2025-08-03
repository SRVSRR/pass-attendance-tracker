import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { ArrowLeft } from 'lucide-react-native'
import { Course } from '../types'

interface ScanScreenProps {
    course: Course
    onBack: () => void
    onStudentScanned: (studentId: string) => void
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ course, onBack, onStudentScanned }) => {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const [processing, setProcessing] = useState(false)
    const insets = useSafeAreaInsets()

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || processing) return

        // Validate student ID format: 'S' followed by exactly 8 numbers
        const studentIdRegex = /^S\d{8}$/
        if (!studentIdRegex.test(data)) {
            // Just ignore invalid IDs, don't show any message
            return
        }

        setScanned(true)
        setProcessing(true)

        try {
            // Vibrate device to confirm scan
            Vibration.vibrate(200)

            // Navigate to save attendance page with scanned student ID
            onStudentScanned(data)
        } catch (error) {
            Alert.alert('Error', 'Failed to process scan')
            console.error('Error processing scan:', error)
            setScanned(false)
        } finally {
            setProcessing(false)
        }
    }

    if (!permission) {
        return (
            <View style={[styles.container, {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            }]}>
                <Text style={styles.messageText}>Requesting camera permission...</Text>
            </View>
        )
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            }]}>
                <Text style={styles.messageText}>No access to camera</Text>
                <TouchableOpacity style={styles.backButton} onPress={requestPermission}>
                    <Text style={styles.backButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
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
                <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Scan Student ID</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr', 'pdf417', 'aztec', 'ean13', 'ean8', 'upc_e', 'code39', 'code93', 'code128', 'codabar'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />

                <View style={styles.overlay}>
                    <View style={styles.scanArea} />
                </View>
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
    headerBackButton: {
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
    cameraContainer: {
        flex: 1,
        margin: 20,
        marginBottom: 40, // Add bottom margin to avoid navigation overlap
        borderRadius: 12,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
        margin: 20,
    },
    backButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        margin: 20,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
})
