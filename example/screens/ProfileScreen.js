import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenHeader from "../components/ui/ScreenHeader";
import { useAuth } from "../contexts/AuthContext";
import {
  UserCircle,
  Key,
  CaretRight,
  SignOut,
} from "phosphor-react-native";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const settings = [
    { icon: UserCircle, text: "Edit Profile", screen: "EditProfile" },
    { icon: Key, text: "Change Password", screen: "ChangePassword" },
  ];

  const displayName = user?.displayName || "CyberSense User";
  const email = user?.email || "No email provided";
  const initial = displayName.charAt(0).toUpperCase();

  const handlePress = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    } else {
      Alert.alert("Feature Coming Soon", "This feature is currently under development.");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profile" />

        <View style={profileStyles.profileHeader}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={profileStyles.profilePic}
            />
          ) : (
            <View style={profileStyles.initialCircle}>
              <Text style={profileStyles.initialText}>{initial}</Text>
            </View>
          )}
          <Text style={profileStyles.name}>{displayName}</Text>
          <Text style={profileStyles.email}>{email}</Text>
        </View>

        <Text style={profileStyles.sectionTitle}>Account Settings</Text>
        <View style={profileStyles.settingsContainer}>
          {settings.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={profileStyles.settingItem}
              onPress={() => handlePress(item.screen)}
            >
              <View style={profileStyles.settingItemLeft}>
                <item.icon color="#8A63D2" size={24} weight="bold" />
                <Text style={profileStyles.settingText}>{item.text}</Text>
              </View>
              <CaretRight color="#6C757D" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={profileStyles.logoutButton} onPress={logout}>
          <SignOut color="#D73A49" size={24} weight="bold" />
          <Text style={profileStyles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const profileStyles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#8A63D2",
    marginBottom: 16,
  },
  initialCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#8A63D2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(138, 99, 210, 0.5)",
  },
  initialText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
  },
  email: {
    fontSize: 16,
    color: "#6C757D",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  settingsContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    color: "#212529",
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 40,
    padding: 16,
  },
  logoutText: {
    color: "#D73A49",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
