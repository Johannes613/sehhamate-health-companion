import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../components/ui/ScreenContainer';
import { ScreenHeaderWithBack } from '../components/ui/ScreenHeaderWithBack';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'phosphor-react-native';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUserProfile } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            return Alert.alert("Invalid Name", "Please enter a valid name.");
        }
        setLoading(true);
        try {
            await updateUserProfile(name);
            Alert.alert("Success", "Your profile has been updated.", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert("Update Failed", "An error occurred while updating your profile.");
            console.error(error);
        }
        setLoading(false);
    };

    const initial = (name || 'U').charAt(0).toUpperCase();

    return (
        <ScreenContainer>
            <ScreenHeaderWithBack title="Edit Profile" navigation={navigation} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profilePicContainer}>
                    <View style={styles.initialCircle}>
                        <Text style={styles.initialText}>{initial}</Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                            <User color="#6C757D" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#6C757D"
          value={name}
          onChangeText={setName}
        />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  profilePicContainer: { alignItems: 'center', marginBottom: 32 },
  initialCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#8A63D2", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: 'rgba(138, 99, 210, 0.5)' },
  initialText: { color: "#FFFFFF", fontSize: 60, fontWeight: "bold" },
  inputContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 20,
  },
  inputIcon: { marginHorizontal: 16 },
  input: { flex: 1, color: '#212529', fontSize: 16, paddingVertical: 16 },
  button: { backgroundColor: '#8A63D2', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 16, minHeight: 58 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;
