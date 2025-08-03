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
import { addCourse, checkCourseExists } from '../database'

interface CreateCourseScreenProps {
    onBack: () => void
}

export const CreateCourseScreen: React.FC<CreateCourseScreenProps> = ({
    onBack,
}) => {
    const [courseCode, setCourseCode] = useState('')
    const [leaderName, setLeaderName] = useState('')
    const [saving, setSaving] = useState(false)
    const [courseExists, setCourseExists] = useState(false)
    const insets = useSafeAreaInsets()

    // Check if form is valid
    const isFormValid = courseCode.trim() !== '' && leaderName.trim() !== '' && !courseExists && !saving

    // Check if course exists whenever courseCode changes
    useEffect(() => {
        const checkCourse = async () => {
            if (courseCode.trim()) {
                try {
                    const exists = await checkCourseExists(courseCode.trim())
                    setCourseExists(exists)
                } catch (error) {
                    setCourseExists(false)
                }
            } else {
                setCourseExists(false)
            }
        }

        const timeoutId = setTimeout(checkCourse, 300) // Debounce
        return () => clearTimeout(timeoutId)
    }, [courseCode])

    const handleSave = async () => {
        if (!isFormValid) return

        setSaving(true)

        try {
            // Add the course
            await addCourse({
                courseCode: courseCode.trim(),
                leaderName: leaderName.trim(),
            })

            // Redirect immediately without confirmation
            onBack()
        } catch (error) {
            console.error('Error creating course:', error)
        } finally {
            setSaving(false)
        }
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
                <Text style={styles.title}>Create Course</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Course Code</Text>
                    <TextInput
                        style={[
                            styles.input,
                            courseExists && styles.inputError
                        ]}
                        value={courseCode}
                        onChangeText={setCourseCode}
                        placeholder="Enter course code"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                    {courseExists && (
                        <Text style={styles.errorText}>Course code already exists</Text>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Leader Name</Text>
                    <TextInput
                        style={styles.input}
                        value={leaderName}
                        onChangeText={setLeaderName}
                        placeholder="Enter leader name"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="words"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!isFormValid}
                >
                    <Save color="#FFFFFF" size={20} />
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Creating...' : 'Create Course'}
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
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 4,
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
