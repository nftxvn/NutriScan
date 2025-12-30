import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  TrendingDown,
  Activity,
  TrendingUp,
  Camera,
  Plus,
  AlertCircle,
  Check, // Added Check icon
} from "lucide-react-native";
import { AvatarPicker } from "../../components/AvatarPicker"; // Added AvatarPicker import
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { CustomDatePicker } from "../../components/CustomDatePicker";

export default function ProfileSetup() {
  const router = useRouter();
  const { signIn, refreshProfile } = useAuth();
  
  // Get account data from Step 1
  const params = useLocalSearchParams<{ name: string; email: string; password: string }>();
  
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDobDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const goals = [
    { id: "lose", title: "Lose Weight", subtitle: "Burn fat and get lean", icon: TrendingDown },
    { id: "maintain", title: "Maintain Weight", subtitle: "Stay healthy and fit", icon: Activity },
    { id: "gain", title: "Gain Weight", subtitle: "Build muscle mass", icon: TrendingUp },
  ];

  const handleContinue = async () => {
    if (!gender || !dob || !weight || !height || !goal) {
      setError("Please fill in all fields.");
      return;
    }

    if (!params.name || !params.email || !params.password) {
      setError("Missing account information. Please go back and fill in your details.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Parse date assuming DD/MM/YYYY format
      const dateParts = dob.split("/");
      if (dateParts.length !== 3) throw new Error("Invalid date format");
      const [day, month, year] = dateParts;
      const isoDate = new Date(`${year}-${month}-${day}`).toISOString();

      // Step 1: Register user
      console.log("Registration: Creating account...");
      const registerResponse = await api.post("/auth/register", {
        name: params.name,
        email: params.email,
        password: params.password,
      });
      
      const { user, token } = registerResponse.data.data;
      console.log("Registration: Account created, token received");

      // Step 2: Create profile (use token directly to ensure it's attached)
      // Step 2: Create profile (use token directly to ensure it's attached)
      console.log("Registration: Creating profile...");
      const profilePayload = {
        gender,
        dateOfBirth: isoDate,
        height: parseFloat(height),
        weight: parseFloat(weight),
        mainGoal: goal,
        avatar: avatar || undefined, // Send if present
      };

      console.log("Registration: Profile Payload being sent:", JSON.stringify(profilePayload, null, 2));

      try {
        await api.put("/users/profile", profilePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Registration: Profile created successfully!");
      } catch (profileError) {
        console.error("Registration: Error creating profile:", profileError);
        // Continue anyway to log the user in, they can update profile later
      }
      
      // Save token for future authenticated requests
      // Pass empty string for redirectPath to prevent auto-redirect
      console.log("Registration: Setting token globally...");
      const { setAuthToken } = require("../../api/client");
      await setAuthToken(token);
      
      // Fetch the complete profile data we just created
      console.log("Registration: Fetching complete profile...");
      const fullProfileResponse = await api.get("/users/profile");
      const profileData = fullProfileResponse.data.data;
      
      console.log("Registration: Full Profile Data fetched:", JSON.stringify(profileData, null, 2));
      
      console.log("Registration: Constructing full user object...");
      const fullUser = {
        ...profileData.user, // name, email
        id: profileData.userId,
        profile: profileData
      };
      
      console.log("Registration: Final User Object for SignIn:", JSON.stringify(fullUser, null, 2));
      
      // SignIn with the COMPLETE user object
      console.log("Registration: Signing in with full user data...");
      await signIn(token, fullUser, "");
      
      console.log("Registration: Complete! Navigating to tabs...");
      router.replace("/(tabs)");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create account.";
      setError(errorMessage);
      console.log("Registration error:", err);
      if (err.response) {
        console.log("Server Error Data:", JSON.stringify(err.response.data, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressSegment, styles.progressActive]} />
              <View style={[styles.progressSegment, styles.progressActive]} />
              <View style={styles.progressSegment} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Let's get to know you</Text>
          <Text style={styles.subtitle}>We need some data to calculate your personalized plan.</Text>

          {error ? (
             <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginTop: 16 }}>
                <AlertCircle size={20} color="#ef4444" />
                <Text style={{ color: '#ef4444', marginLeft: 8, fontSize: 13 }}>{error}</Text>
             </View>
          ) : null}

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <AvatarPicker
              currentImage={avatar}
              onImageSelected={(uri: string) => setAvatar(uri)}
              size={100}
            />
            <Text style={styles.avatarHint}>Tap to choose or upload photo</Text>
          </View>

          {/* Personal Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            {/* Gender */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderButton, gender === "male" && styles.genderSelected]}
                onPress={() => setGender("male")}
              >
                <Text style={styles.genderIcon}>♂</Text>
                <Text style={[styles.genderText, gender === "male" && styles.genderTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === "female" && styles.genderSelected]}
                onPress={() => setGender("female")}
              >
                <Text style={styles.genderIcon}>♀</Text>
                <Text style={[styles.genderText, gender === "female" && styles.genderTextSelected]}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !dob && { color: "#555" }]}>
                {dob || "__/__/____"}
              </Text>
              <Calendar size={20} color="#666" />
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                setDobDate(date);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                setDob(`${day}/${month}/${year}`);
              }}
              initialDate={dobDate}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          </View>

          {/* Body Metrics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Body Metrics</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricContainer}>
                <Text style={styles.label}>Weight (kg)</Text>
                <View style={styles.metricInput}>
                  <TextInput
                    style={styles.metricValue}
                    placeholder="0"
                    placeholderTextColor="#555"
                    value={weight}
                    onChangeText={(text) => setWeight(text.replace(/[^0-9]/g, "").slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.metricUnit}>kg</Text>
                </View>
              </View>
              <View style={styles.metricContainer}>
                <Text style={styles.label}>Height (cm)</Text>
                <View style={styles.metricInput}>
                  <TextInput
                    style={styles.metricValue}
                    placeholder="0"
                    placeholderTextColor="#555"
                    value={height}
                    onChangeText={(text) => setHeight(text.replace(/[^0-9]/g, "").slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.metricUnit}>cm</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Your Main Goal</Text>
            </View>

            <View style={styles.goalsContainer}>
              {goals.map((g) => {
                const IconComponent = g.icon;
                const isSelected = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.goalCard, isSelected && styles.goalSelected]}
                    onPress={() => setGoal(g.id as "lose" | "maintain" | "gain")}
                  >
                    <View style={[styles.goalIcon, isSelected && styles.goalIconSelected]}>
                      <IconComponent size={20} color={isSelected ? "#000" : "#d3f660"} />
                    </View>
                    <View style={styles.goalText}>
                      <Text style={styles.goalTitle}>{g.title}</Text>
                      <Text style={styles.goalSubtitle}>{g.subtitle}</Text>
                    </View>
                    <View style={[styles.goalRadio, isSelected && styles.goalRadioSelected]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? "Saving..." : "Create Account"}</Text>
            {!loading && <ArrowRight size={20} color="#000" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2C2C2E",
  },
  progressActive: {
    backgroundColor: "#d3f660",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginTop: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 8,
    lineHeight: 22,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 32,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2C2C2E",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d3f660",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionBar: {
    width: 4,
    height: 20,
    backgroundColor: "#d3f660",
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: 2,
    borderColor: "#2C2C2E",
  },
  genderSelected: {
    borderColor: "#d3f660",
    backgroundColor: "#1a1f14",
  },
  genderIcon: {
    fontSize: 18,
    color: "#d3f660",
  },
  genderText: {
    fontSize: 15,
    color: "white",
    fontWeight: "600",
  },
  genderTextSelected: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "white",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  metricContainer: {
    flex: 1,
  },
  metricInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  metricValue: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  metricUnit: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2C2C2E",
    gap: 14,
  },
  goalSelected: {
    borderColor: "#d3f660",
    backgroundColor: "#1a1f14",
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  goalIconSelected: {
    backgroundColor: "#d3f660",
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  goalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  goalRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#555",
  },
  goalRadioSelected: {
    borderColor: "#d3f660",
    backgroundColor: "#d3f660",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: "#0A0A0A",
  },
  button: {
    backgroundColor: "#d3f660",
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  avatarHint: {
    color: "#888",
    marginTop: 12,
    fontSize: 14,
  },
  presetAvatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  presetAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  presetAvatarSelected: {
    borderColor: "#d3f660",
    borderWidth: 3,
  },
  presetAvatarImage: {
    width: "100%",
    height: "100%",
  },
  presetAvatarCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#d3f660",
    alignItems: "center",
    justifyContent: "center",
  },
});
