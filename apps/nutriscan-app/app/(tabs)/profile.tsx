import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Camera,
  Calendar,
  TrendingDown,
  Activity,
  TrendingUp,
  Check,
  LogOut,
  Pencil,
  RefreshCcw,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react-native";
import { AvatarPicker } from "../../components/AvatarPicker";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { CustomDatePicker } from "../../components/CustomDatePicker";
import { GlowBackground } from "../../components/GlowBackground";
import { useEditMode } from "../../context/EditModeContext";
import { ShinyCard } from "../../components/ShinyCard";
import Animated, { FadeInUp, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// Custom entering animation that starts completely invisible
const createEntranceAnim = (delay: number) => 
  FadeInUp.delay(delay).duration(500).withInitialValues({ opacity: 0, transform: [{ translateY: 30 }] });

// Exit animation - instant fade out
const exitAnim = FadeOut.duration(150);

export default function Profile() {
  const router = useRouter();
  const { user, refreshProfile, signOut } = useAuth();
  
  // Store original values to detect changes
  const [initialValues, setInitialValues] = useState({
    name: "",
    gender: "male" as "male" | "female",
    dob: "",
    weight: "",
    height: "",
    goal: "maintain",
    avatar: "https://i.pravatar.cc/100",
  });
  
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("maintain");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/100");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const { isEditing, setIsEditing } = useEditMode(); // Use context for edit mode state
  const hasLoadedRef = useRef(false); // Track if initial data has been loaded
  const scrollRef = useRef<ScrollView>(null);
  const [focusKey, setFocusKey] = useState(0);
  const isFocused = useIsFocused();
  
  // Animated opacity based on focus
  const pageOpacity = useSharedValue(0);
  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
  }));
  
  // Update opacity when focus changes
  useEffect(() => {
    pageOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 500 });
  }, [isFocused]);
  
  // Format date for display
  const getDisplayDate = () => {
    if (!dob) return "__/__/____";
    return dob;
  };
  
  // Handle date picker change
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
  
  // Load user profile data
  // Refresh profile when screen comes into focus (only once per mount)
  useFocusEffect(
    React.useCallback(() => {
      if (!hasLoadedRef.current) {
        console.log("Profile: Initial load, fetching data...");
        refreshProfile();
        hasLoadedRef.current = true;
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setFocusKey(k => k + 1);
    }, [])
  );

  useEffect(() => {
    // Strict parsing based on user-provided JSON structure
    // We STRICTLY access user.profile for metrics
    if (!user || !user.profile) return;

    try {
        const profile = user.profile;
        
        // Extract Name (User specific)
        // User object name is at the top level or inside nested user object in profile
        // Extract Name - Try top level user first, then nested profile user, then default
        const nameValue = user?.name || user?.user?.name || profile?.user?.name || "User";
        
        // Extract Metrics - STRICTLY from profile object
        const weightValue = profile?.weight;
        const heightValue = profile?.height;
        const genderValue = profile?.gender || "male";
        const goalValue = profile?.mainGoal || "maintain";
        
        // Extract Avatar - STRICTLY Check all possible locations
        // 1. user.avatar (Top level from AuthContext)
        // 2. profile.user.avatar (Nested from backend)
        // 3. Fallback to placeholder
        const avatarValue = user?.avatar || profile?.user?.avatar;

        // Extract Date - STRICTLY from profile
        let dobString = "";
        let dobDateObj = new Date(2000, 0, 1);
        
        if (profile?.dateOfBirth) {
            const rawDate = new Date(profile.dateOfBirth);
            if (!isNaN(rawDate.getTime())) {
                dobDateObj = rawDate;
                const d = String(rawDate.getDate()).padStart(2, '0');
                const m = String(rawDate.getMonth() + 1).padStart(2, '0');
                const y = rawDate.getFullYear();
                dobString = `${d}/${m}/${y}`;
            }
        }
        
        // Set Values
        const newValues = {
            name: nameValue,
            gender: genderValue as "male" | "female",
            dob: dobString,
            weight: weightValue !== undefined && weightValue !== null ? String(weightValue) : "",
            height: heightValue !== undefined && heightValue !== null ? String(heightValue) : "",
            goal: goalValue,
            avatar: avatarValue
        };
        
        // Only update if values actually changed (prevent infinite loop)
        const valuesChanged = 
          newValues.name !== initialValues.name ||
          newValues.gender !== initialValues.gender ||
          newValues.dob !== initialValues.dob ||
          newValues.weight !== initialValues.weight ||
          newValues.height !== initialValues.height ||
          newValues.goal !== initialValues.goal ||
          newValues.avatar !== initialValues.avatar;
        
        if (valuesChanged) {
          console.log("Profile: Data changed, updating state...");
          setInitialValues(newValues);
          
          // Individual States
          setName(newValues.name);
          setGender(newValues.gender);
          setDob(newValues.dob);
          setDobDate(dobDateObj);
          setWeight(newValues.weight);
          setHeight(newValues.height);
          setGoal(newValues.goal);
          setAvatar(newValues.avatar);
        }
        
    } catch (parseError) {
        console.error("Profile: Error parsing user data", parseError);
    }

  }, [user]);
  
  // Check if any value has changed from initial
  const hasChanges = useMemo(() => {
    return (
      name !== initialValues.name ||
      gender !== initialValues.gender ||
      dob !== initialValues.dob ||
      weight !== initialValues.weight ||
      height !== initialValues.height ||
      goal !== initialValues.goal ||
      avatar !== initialValues.avatar
    );
  }, [name, gender, dob, weight, height, goal, avatar, initialValues]);

  const bmi = weight && height ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : "0";
  const bmiValue = parseFloat(bmi);

  const goals = [
    { id: "lose", title: "Lose Weight", subtitle: "Burn fat and get lean", icon: TrendingDown },
    { id: "maintain", title: "Maintain Weight", subtitle: "Stay healthy and fit", icon: Activity },
    { id: "gain", title: "Gain Weight", subtitle: "Build muscle mass", icon: TrendingUp },
  ];
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse date from dd/mm/yyyy to ISO
      const dateParts = dob.split("/");
      const isoDate = dateParts.length === 3 
        ? new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`).toISOString()
        : undefined;
      
      // Build profile data, only include valid values
      const profileData: any = {};
      
      // Add name to payload so backend can update User model
      if (name) profileData.name = name;
      if (gender) profileData.gender = gender;
      if (isoDate) profileData.dateOfBirth = isoDate;
      if (weight && !isNaN(parseFloat(weight))) profileData.weight = parseFloat(weight);
      if (height && !isNaN(parseFloat(height))) profileData.height = parseFloat(height);
      if (goal) profileData.mainGoal = goal;
      
      console.log("Saving profile with data:", profileData);
      await api.put("/users/profile", {
        name,
        avatar, // Send the avatar URI
        gender,
        dateOfBirth: isoDate, // Use isoDate for backend
        weight: parseFloat(weight),
        height: parseFloat(height),
        mainGoal: goal,
      });
      
      await refreshProfile();
      
      // Update initial values to current (so Save button hides)
      setInitialValues({ name, gender, dob, weight, height, goal, avatar });
      
      // Turn off edit mode after successful save
      setIsEditing(false);
      
      // Show success toast
      setToastMessage("Profil berhasil disimpan!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.log("Error saving profile:", err);
      setToastMessage("Gagal menyimpan profil");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing and revert to original values
  const handleCancelEdit = () => {
    setName(initialValues.name);
    setGender(initialValues.gender);
    setDob(initialValues.dob);
    setWeight(initialValues.weight);
    setHeight(initialValues.height);
    setGoal(initialValues.goal);
    setAvatar(initialValues.avatar);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              console.log("[Delete Account] Deleting...");
              await api.delete("/users/profile");
              console.log("[Delete Account] Success, signing out...");
              const { clearAuthToken } = require("../../api/client");
              await clearAuthToken();
              router.replace("/onboarding/welcome");
            } catch (error) {
              console.error("[Delete Account] Error:", error);
              Alert.alert("Error", "Failed to delete account");
            }
          }
        }
      ]
    );
  };

  // Auto-reload data if missing
  const [retryCount, setRetryCount] = useState(0);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!user && !initialValues.name) {
       console.log("Profile: Auto-reloading data... Attempt:", retryCount + 1);
       refreshProfile();
       
       // If still loading after 8 seconds (gave it more time), show error
       const timer = setTimeout(() => {
          if (!user) setShowError(true);
       }, 8000);
       
       return () => clearTimeout(timer);
    } else {
        setShowError(false);
    }
  }, [retryCount, user]);

  if (!user && !initialValues.name) {
      if (showError) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Activity size={48} color="#ef4444" style={{ marginBottom: 20 }} />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Connection Failed</Text>
                <Text style={{ color: '#888', marginBottom: 24, textAlign: 'center' }}>
                    Unable to load profile data based on current connection settings.
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity 
                        style={{ backgroundColor: '#d3f660', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                        onPress={() => { setShowError(false); setRetryCount(c => c + 1); }}
                    >
                        <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{ backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                        onPress={signOut}
                    >
                        <Text style={{ color: 'white', fontWeight: '700' }}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
      }
      
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#d3f660" style={{ marginBottom: 20 }} />
            <Text style={{ color: 'white', marginBottom: 8 }}>Syncing Profile...</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>This usually takes a second</Text>
        </View>
      );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={focusKey} style={pageAnimatedStyle}>
        {/* Header */}
        <Animated.View entering={createEntranceAnim(0)} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity 
              style={[styles.backButton, isEditing && { backgroundColor: "#d3f660" }]} 
              onPress={() => setIsEditing(!isEditing)}
            >
               <Pencil size={20} color={isEditing ? "#000" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")} style={styles.backButton}>
               <SettingsIcon size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
        {/* Avatar */}
        <Animated.View entering={createEntranceAnim(100)} style={styles.avatarSection}>
          <AvatarPicker 
            currentImage={avatar}
            onImageSelected={async (uri: string) => {
              setAvatar(uri);
              // Save avatar to server immediately
              try {
                await api.put("/users/profile", { avatar: uri });
                // Refresh to sync across all screens
                await refreshProfile();
                // Update initial values
                setInitialValues(prev => ({ ...prev, avatar: uri }));
              } catch (err) {
                console.log("Error saving avatar:", err);
              }
            }}
            size={100}
            editable={true}
          />
        </Animated.View>

        {/* Personal Info Card */}
        <Animated.View entering={createEntranceAnim(200)}>
        <ShinyCard>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Info</Text>
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputContainer, !isEditing && { opacity: 0.6 }]}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your username"
              placeholderTextColor="#555"
              editable={isEditing}
            />
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={[styles.genderRow, !isEditing && { opacity: 0.6 }]} pointerEvents={isEditing ? "auto" : "none"}>
            <TouchableOpacity
              style={[styles.genderButton, gender === "male" && styles.genderSelected]}
              onPress={() => setGender("male")}
              disabled={!isEditing}
            >
              <Text style={styles.genderIcon}>♂</Text>
              <Text style={[styles.genderText, gender === "male" && styles.genderTextSelected]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === "female" && styles.genderSelected]}
              onPress={() => setGender("female")}
              disabled={!isEditing}
            >
              <Text style={styles.genderIcon}>♀</Text>
              <Text style={[styles.genderText, gender === "female" && styles.genderTextSelected]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, !isEditing && { opacity: 0.6 }]}
            onPress={() => isEditing && setShowDatePicker(true)}
            activeOpacity={isEditing ? 0.7 : 1}
            disabled={!isEditing}
          >
            <Text style={styles.input}>{getDisplayDate()}</Text>
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
        </ShinyCard>
        </Animated.View>

        {/* Body Metrics Card */}
        <Animated.View entering={createEntranceAnim(300)}>
        <ShinyCard>
          <Text style={styles.cardTitle}>Body Metrics</Text>

          <View style={[styles.metricsRow, !isEditing && { opacity: 0.6 }]} pointerEvents={isEditing ? "auto" : "none"}>
            <View style={styles.metricContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.metricInput}>
                <TextInput
                  style={styles.metricValue}
                  value={weight}
                  onChangeText={(text) => setWeight(text.replace(/[^0-9]/g, "").slice(0, 3))}
                  keyboardType="numeric"
                  maxLength={3}
                  editable={isEditing}
                />
                <Text style={styles.metricUnit}>kg</Text>
              </View>
            </View>
            <View style={styles.metricContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <View style={styles.metricInput}>
                <TextInput
                  style={styles.metricValue}
                  value={height}
                  onChangeText={(text) => setHeight(text.replace(/[^0-9]/g, "").slice(0, 3))}
                  keyboardType="numeric"
                  maxLength={3}
                  editable={isEditing}
                />
                <Text style={styles.metricUnit}>cm</Text>
              </View>
            </View>
          </View>

          {/* BMI */}
          <View style={styles.bmiSection}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiLabel}>Current BMI</Text>
              <Text style={[styles.bmiValue, 
                bmiValue < 18.5 && { color: "#60a5fa" },
                bmiValue >= 18.5 && bmiValue < 25 && { color: "#22c55e" },
                bmiValue >= 25 && bmiValue < 30 && { color: "#f59e0b" },
                bmiValue >= 30 && bmiValue < 40 && { color: "#ef4444" },
                bmiValue >= 40 && { color: "#7c2d12" },
              ]}>{bmi}</Text>
            </View>
            
            {/* BMI Category Label */}
            <Text style={[styles.bmiCategoryText, 
              bmiValue < 18.5 && { color: "#60a5fa" },
              bmiValue >= 18.5 && bmiValue < 25 && { color: "#22c55e" },
              bmiValue >= 25 && bmiValue < 30 && { color: "#f59e0b" },
              bmiValue >= 30 && bmiValue < 40 && { color: "#ef4444" },
              bmiValue >= 40 && { color: "#7c2d12" },
            ]}>
              {bmiValue < 18.5 ? "Underweight" : 
               bmiValue < 25 ? "Ideal Weight" : 
               bmiValue < 30 ? "Overweight" : 
               bmiValue < 40 ? "Obese" : "Morbidly Obese"}
            </Text>

            {/* Arrow Indicator Container */}
            <View style={styles.bmiArrowContainer}>
              <View style={[styles.bmiArrow, { 
                left: `${Math.min(Math.max(((bmiValue - 15) / 30) * 100, 2), 98)}%` 
              }]}>
                <View style={styles.bmiArrowTriangle} />
              </View>
            </View>
            
            {/* BMI Bar with 5 Segments */}
            <View style={styles.bmiBar}>
              <View style={[styles.bmiSegment, { backgroundColor: "#60a5fa", flex: 3.5 }]} />
              <View style={[styles.bmiSegment, { backgroundColor: "#22c55e", flex: 6.5 }]} />
              <View style={[styles.bmiSegment, { backgroundColor: "#f59e0b", flex: 5 }]} />
              <View style={[styles.bmiSegment, { backgroundColor: "#ef4444", flex: 10 }]} />
              <View style={[styles.bmiSegment, { backgroundColor: "#7c2d12", flex: 5 }]} />
            </View>
            
            {/* BMI Range Labels */}
            <View style={styles.bmiLabels}>
              <Text style={[styles.bmiLabelText, { flex: 3.5, color: "#60a5fa" }]}>{"<18.5"}</Text>
              <Text style={[styles.bmiLabelText, { flex: 6.5, color: "#22c55e" }]}>18.5-25</Text>
              <Text style={[styles.bmiLabelText, { flex: 5, color: "#f59e0b" }]}>25-30</Text>
              <Text style={[styles.bmiLabelText, { flex: 10, color: "#ef4444" }]}>30-40</Text>
              <Text style={[styles.bmiLabelText, { flex: 5, color: "#7c2d12" }]}>{">40"}</Text>
            </View>
            
            {/* BMI Category Names */}
            <View style={styles.bmiCategoryLabels}>
              <Text style={[styles.bmiCategoryLabel, { flex: 3.5, color: "#60a5fa" }]}>Underweight</Text>
              <Text style={[styles.bmiCategoryLabel, { flex: 6.5, color: "#22c55e" }]}>Ideal</Text>
              <Text style={[styles.bmiCategoryLabel, { flex: 5, color: "#f59e0b" }]}>Overweight</Text>
              <Text style={[styles.bmiCategoryLabel, { flex: 10, color: "#ef4444" }]}>Obese</Text>
              <Text style={[styles.bmiCategoryLabel, { flex: 5, color: "#7c2d12" }]}>Morbid</Text>
            </View>
          </View>
        </ShinyCard>
        </Animated.View>

        {/* Goals Card */}
        <Animated.View entering={createEntranceAnim(400)}>
        <ShinyCard>
          <Text style={styles.cardTitle}>Your Goal</Text>

          <View style={[styles.goalsContainer, !isEditing && { opacity: 0.6 }]} pointerEvents={isEditing ? "auto" : "none"}>
            {goals.map((g) => {
              const IconComponent = g.icon;
              const isSelected = goal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCard, isSelected && styles.goalSelected]}
                  onPress={() => setGoal(g.id)}
                  disabled={!isEditing}
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
        </ShinyCard>
        </Animated.View>



        <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      {isEditing && (
        <View style={styles.floatingActionBar}>
          <TouchableOpacity 
            style={[styles.saveButton, (!hasChanges || saving) && { opacity: 0.5 }]} 
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Profile</Text>
                <Check size={20} color="#000" />
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.cancelButton]} 
            activeOpacity={0.8}
            onPress={handleCancelEdit}
          >
            <Text style={styles.cancelButtonText}>Cancel Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Animated.View 
          entering={FadeInUp.duration(200)} 
          exiting={FadeOut.duration(200)}
          style={[
            styles.toast, 
            { borderColor: toastType === "success" ? "#22c55e" : "#ef4444" }
          ]}
        >
          <Text style={[
            styles.toastText, 
            { color: toastType === "success" ? "#22c55e" : "#ef4444" }
          ]}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Push items (buttons) to the right
    marginBottom: 24,
    height: 48,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 1, // Ensure title is behind buttons if overlapping
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2C2C2E",
  },
  avatarEditButton: {
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
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonActive: {
    backgroundColor: "#d3f660",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d3f660",
  },
  editButtonTextActive: {
    color: "#000",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    paddingBottom: 12,
  },
  label: {
    fontSize: 12,
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
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2C2C2E",
    borderWidth: 2,
    borderColor: "transparent",
  },
  genderSelected: {
    borderColor: "#d3f660",
    backgroundColor: "#1a1f14",
  },
  genderIcon: {
    fontSize: 16,
    color: "#d3f660",
  },
  genderText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  genderTextSelected: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#d3f660", // Lime green when typing
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
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    minWidth: 40,
  },
  metricUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  bmiSection: {
    marginTop: 8,
  },
  bmiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bmiLabel: {
    fontSize: 13,
    color: "#888",
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
  },
  bmiBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
  },
  bmiSegment: {
    flex: 1,
    borderRadius: 4,
  },
  bmiLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  bmiLabelText: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  bmiCategoryText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  bmiArrowContainer: {
    height: 16,
    position: "relative",
    marginBottom: 4,
  },
  bmiArrow: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -6 }],
  },
  bmiArrowTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#d3f660",
  },
  bmiCategoryLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
  },
  bmiCategoryLabel: {
    fontSize: 8,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
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
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  goalRadioSelected: {
    borderColor: "#d3f660",
  },
  goalRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d3f660",
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  goalSubtitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 16,
    backgroundColor: "#0A0A0A",
  },
  floatingActionBar: {
    position: "absolute",
    bottom: 100,
    left: 40,
    right: 40,
    flexDirection: "row",
    gap: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#d3f660",
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    marginTop: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 8,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  // Preset Avatar styles
  presetAvatarHint: {
    color: "#888",
    marginTop: 16,
    marginBottom: 12,
    fontSize: 13,
  },
  presetAvatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  presetAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#d3f660",
    alignItems: "center",
    justifyContent: "center",
  },
  // Toast styles
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#2C2C2E",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "600",
  },

});
