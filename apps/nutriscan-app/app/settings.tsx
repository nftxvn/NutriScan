import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Trash2, LogOut, ChevronRight, Shield, Bell } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { api, clearAuthToken } from "../api/client";
import { ConfirmationModal } from "../components/ConfirmationModal";

export default function Settings() {
  const router = useRouter();
  const { signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    try {
      setShowDeleteModal(false); // Close modal first
      setLoading(true);
      console.log("[Delete Account] Deleting...");
      await api.delete("/users/profile");
      
      console.log("[Delete Account] Success, clearing data...");
      await clearAuthToken();
      
      if (Platform.OS !== 'web') {
          Alert.alert("Account Deleted", "Your account has been successfully deleted.");
      } else {
          window.alert("Your account has been successfully deleted.");
      }
      router.replace("/onboarding/welcome");
    } catch (error) {
      console.error("[Delete Account] Error:", error);
      if (Platform.OS !== 'web') {
          Alert.alert("Error", "Failed to delete account. Please try again.");
      } else {
          window.alert("Failed to delete account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };
  
  const performLogout = () => {
    setShowLogoutModal(false);
    signOut();
  };

  const menuItems = [
    {
       title: "Notifications",
       icon: Bell,
       color: "#d3f660",
       action: () => Alert.alert("Coming Soon", "Notification settings will be available soon!")
    },
    {
       title: "Privacy & Security",
       icon: Shield,
       color: "#d3f660",
       action: () => Alert.alert("Coming Soon", "Privacy settings will be available soon!")
    }
  ];

  const handleToggleRole = async () => {
    try {
      setLoading(true);
      const res = await api.post("/dev/toggle-role");
      const newRole = res.data.data.role;
      Alert.alert("Dev Mode", `You are now an ${newRole.toUpperCase()}`);
      
      // Refresh auth context to update UI immediately
      await refreshProfile();
      
    } catch (e) {
      console.log("Error toggling role", e);
      Alert.alert("Error", "Failed to toggle role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Modals */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        cancelText="Cancel"
        confirmText="Log out"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={performLogout}
        isDestructive={false}
      />
      
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete account?"
        message="This action is permanent. All your data will be permanently deleted and cannot be recovered."
        cancelText="Cancel"
        confirmText="Delete account"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={performDelete}
        isDestructive={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.menuContainer}>
           {menuItems.map((item, index) => (
             <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(211, 246, 96, 0.1)' }]}>
                   <item.icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                <ChevronRight size={20} color="#666" />
             </TouchableOpacity>
           ))}
        </View>

        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                   <LogOut size={20} color="#fff" />
                </View>
                <Text style={styles.menuText}>Log Out</Text>
                <ChevronRight size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                   <Trash2 size={20} color="#ef4444" />
                </View>
                <Text style={[styles.menuText, { color: '#ef4444' }]}>Delete Account</Text>
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity onLongPress={handleToggleRole} delayLongPress={2000} activeOpacity={1}>
            <Text style={styles.versionText}>NutriScan v1.0.0 (Long press for Dev)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginTop: 12,
    textTransform: "uppercase",
  },
  menuContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    color: "#444",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  }
});
