import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Heart,
  Clock,
  Check,
  AlertCircle,
  Flame,
  Droplets,
  Wheat,
  X,
  Target,
  History,
  Square,
  CheckSquare,
  Trash2,
  Plus,
  ChevronLeft,
} from "lucide-react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { GlowBackground } from "../../components/GlowBackground";
import { FoodItem } from "../../components/FoodItem";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { ShinyCard } from "../../components/ShinyCard";
import { WaterWave } from "../../components/WaterWave";
import Animated, { FadeInUp, FadeIn, SlideInDown, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";

// Custom entering animation that starts completely invisible
const createEntranceAnim = (delay: number) => 
  FadeInUp.delay(delay).duration(500).withInitialValues({ opacity: 0, transform: [{ translateY: 30 }] });

// Exit animation - instant fade out
const exitAnim = FadeOut.duration(150);

const { width } = Dimensions.get("window");

const MacroCircle = ({ color, value, max, label }: { color: string; value: number; max: number; label: string }) => {
  const size = 36;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <View style={styles.macroItem}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2C2C2E"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.macroTextContainer}>
        <Text style={styles.macroValue}>
          {value}/<Text style={styles.macroMax}>{max}g</Text>
        </Text>
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
    </View>
  );
};

// Updated DayCircle with 3 statuses + none
const DayCircle = ({ day, status }: { day: string; status: 'success' | 'warning' | 'failed' | 'none' }) => (
  <View style={styles.dayContainer}>
    <View style={[
      styles.dayCircle,
      status === 'success' && styles.dayCompleted,
      status === 'warning' && styles.dayWarning,
      status === 'failed' && styles.dayFailed,
    ]}>
      {status === 'success' && <Check size={14} color="#000" />}
      {status === 'warning' && <Text style={{ fontSize: 14, fontWeight: '900', color: '#000' }}>!</Text>}
      {status === 'failed' && <X size={14} color="#fff" />}
      {/* 'none' status has no icon, just neutral circle */}
    </View>
    <Text style={styles.dayLabel}>{day}</Text>
  </View>
);



export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [totals, setTotals] = useState({ calories: 0, protein: 0, fats: 0, carbs: 0 });
   const [logs, setLogs] = useState<any[]>([]);
   const [weeklyProgress, setWeeklyProgress] = useState<{ day: string; status: 'success' | 'warning' | 'failed' | 'none' }[]>([]);
   const [refreshing, setRefreshing] = useState(false);
   const [isSelectionMode, setIsSelectionMode] = useState(false);
   const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState("");
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

   // Auto-scroll to top on focus and trigger animation
   useFocusEffect(
      useCallback(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        setFocusKey(k => k + 1);
      }, [])
   );

  const fetchData = useCallback(async () => {
    try {
      // Fetch Today's Logs
      const logsRes = await api.get("/logs/today");
      console.log("Recently logs response:", JSON.stringify(logsRes.data, null, 2));
      setTotals(logsRes.data.data.totals);
      setLogs(logsRes.data.data.logs);

          // Fetch Weekly Progress for Daily Goal
          const analyticsRes = await api.get("/analytics/summary?days=7");
          const chartData = analyticsRes.data.data.chartData; // Array of percentages [oldest...today]
          
          // 1. Map chartData to Dates
          const dataMap = new Map<string, number>();
          const today = new Date();
          today.setHours(0,0,0,0); // Normalize today

          chartData.forEach((pct: number, index: number) => {
               // chartData is [oldest ... newest], length 7.
               // newest (index = length-1) is Today.
               const d = new Date(today);
               d.setDate(d.getDate() - (chartData.length - 1 - index));
               const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
               dataMap.set(dateStr, pct);
          });

          // 2. Generate This Week (Sun - Sat)
          const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const currentWeekProgress = [];

          // Find Sunday of this week
          const startOfWeek = new Date(today);
          const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
          const diff = startOfWeek.getDate() - day; 
          startOfWeek.setDate(diff); // Rewind to Sunday

          for (let i = 0; i < 7; i++) {
              const d = new Date(startOfWeek);
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
              
              let status: 'success' | 'warning' | 'failed' | 'none' = 'none';
              
              if (d > today) {
                  // Future days -> No status
                  status = 'none';
              } else {
                  // Past or Today
                  const pct = dataMap.get(dateStr);
                  if (pct !== undefined) {
                       if (pct >= 100) status = 'success';
                       else if (pct >= 50) status = 'warning';
                       else status = 'failed';
                  } else {
                      // No data found for this past day (e.g. before account creation or out of fetched range)
                      // Treat as failed or keep as none? "User not doing it" -> failed.
                      // If it's within the week but we don't have data, it's failed/0.
                      status = 'failed'; 
                  }
              }
              
              currentWeekProgress.push({
                  day: weekDays[i], // i aligns with Sun=0
                  status
              });
          }
          setWeeklyProgress(currentWeekProgress);

    } catch (e) {
      console.log("Error fetching home data", e);
    }
  }, []);

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Enter selection mode on long press
  const enterSelectionMode = useCallback((logId: string) => {
    setIsSelectionMode(true);
    setSelectedLogs(new Set([logId]));
  }, []);

  // Toggle item selection
  const toggleSelectLog = useCallback((logId: string) => {
    setSelectedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  // Cancel selection mode
  const cancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedLogs(new Set());
  }, []);

  // Bulk delete selected logs - show modal instead of alert
  const handleBulkDelete = useCallback(() => {
    const count = selectedLogs.size;
    if (count === 0) return;
    setShowDeleteModal(true);
  }, [selectedLogs]);

  // Confirm delete action
  const confirmDelete = useCallback(async () => {
    const deleteCount = selectedLogs.size;
    try {
      await Promise.all(
        Array.from(selectedLogs).map(logId => api.delete(`/logs/${logId}`))
      );
      setIsSelectionMode(false);
      setSelectedLogs(new Set());
      setShowDeleteModal(false);
      fetchData();
      // Show toast
      setToastMessage(`${deleteCount} item${deleteCount > 1 ? 's' : ''} deleted!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (e) {
      console.log("Error deleting logs", e);
      Alert.alert("Error", "Failed to delete some logs. Please try again.");
      setShowDeleteModal(false);
    }
  }, [selectedLogs, fetchData]);

  // Get user info and computed targets from profile
  const userName = user?.user?.name || user?.name || "Guest";
  const profile = user?.profile;
  const userAvatar = user?.avatar || profile?.user?.avatar || "https://i.pravatar.cc/100";
  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 150;
  const targetCarbs = profile?.targetCarbs || 250;
  const targetFats = profile?.targetFats || 70;

  const proteinLeft = Math.max(0, targetProtein - totals.protein);
  const carbsLeft = Math.max(0, targetCarbs - totals.carbs);
  const fatsLeft = Math.max(0, targetFats - totals.fats);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const navigateToSettings = useDebouncedCallback(() => router.push("/settings"));
  const navigateToHistory = useDebouncedCallback(() => router.push("/history"));
  const navigateToFoodCatalog = useDebouncedCallback(() => router.push("/food-catalog"));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d3f660"
            colors={["#d3f660"]}
          />
        }
      >
        <Animated.View key={focusKey} style={pageAnimatedStyle}>
        {/* Header */}
        <Animated.View entering={createEntranceAnim(0)} style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
              <Text style={styles.date}>{todayDate}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Activity Card */}
        <Animated.View entering={createEntranceAnim(100)}>
        <ShinyCard>
          <View style={styles.cardHeader}>
            <Heart size={18} color="#d3f660" />
            <Text style={styles.cardTitle}>Your Activity</Text>
          </View>

          <View style={styles.activityContent}>
            {/* Water Fill Chart */}
            <View style={styles.waterChartContainer}>
              <View style={styles.waterChartBox}>
                {/* Shadow Wave */}
                <WaterWave
                  fillPercentage={Math.min(100, (totals.calories / targetCalories) * 100)}
                  width={190}
                  height={120}
                  color="#9ab84a"
                  initialPhase={Math.PI / 2}
                  amplitude={6}
                />
                {/* Main Wave */}
                <WaterWave
                  fillPercentage={Math.min(100, (totals.calories / targetCalories) * 100)}
                  width={190}
                  height={120}
                  color="#d3f660"
                />
                <View style={styles.waterChartContent}>
                  <Text style={[
                    styles.waterChartValue,
                    (totals.calories / targetCalories) >= 0.5 && { color: "#0A0A0A", textShadowColor: "transparent" }
                  ]}>{totals.calories}</Text>
                  <Text style={[
                    styles.waterChartLabel,
                    (totals.calories / targetCalories) >= 0.5 && { color: "#0A0A0A", textShadowColor: "transparent" }
                  ]}>/{targetCalories} kcal</Text>
                </View>
              </View>
            </View>

            {/* Macros */}
            <View style={styles.macrosContainer}>
              <MacroCircle color="#ef4444" value={totals.protein} max={targetProtein} label="Protein" />
              <MacroCircle color="#f59e0b" value={totals.carbs} max={targetCarbs} label="Carbs" />
              <MacroCircle color="#3b82f6" value={totals.fats} max={targetFats} label="Fats" />
            </View>
          </View>
        </ShinyCard>
        </Animated.View>

        {/* Daily Goal */}
        <Animated.View entering={createEntranceAnim(200)}>
        <ShinyCard>
          <View style={styles.cardHeader}>
            <Target size={18} color="#d3f660" />
            <Text style={styles.cardTitle}>Daily Goal</Text>
          </View>

          <View style={styles.daysRow}>
             {weeklyProgress.length > 0 ? (
                weeklyProgress.map((p, i) => (
                  <DayCircle key={i} day={p.day} status={p.status} />
                ))
             ) : (
                // Fallback while loading
                ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                   <DayCircle key={i} day={d} status="none" />
                ))
             )}
          </View>
        </ShinyCard>
        </Animated.View>

        {/* Recently Consumed */}
        <Animated.View entering={createEntranceAnim(300)}>
        <View style={styles.card}>
          <View style={[styles.cardHeader, { justifyContent: "space-between" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Clock size={18} color="#d3f660" />
              <Text style={styles.cardTitle}>Recently</Text>
            </View>
            {isSelectionMode && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelSelection}>
                  <X size={16} color="#888" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.deleteButton, selectedLogs.size === 0 && { opacity: 0.5 }]} 
                  onPress={handleBulkDelete}
                  disabled={selectedLogs.size === 0}
                >
                  <Trash2 size={16} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete ({selectedLogs.size})</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.recentList}>
            {logs.length === 0 ? (
              <>
                <View style={{ height: 3, backgroundColor: '#2C2C2E', marginBottom: 5 }} />
                <Text style={{ color: "#666", textAlign: "center", }}>No logs today yet.</Text>
              </>
            ) : (
                <>
                {logs.slice(0, 3).map((log: any) => (
                  <FoodItem
                    key={log.id}
                    name={log.food.name}
                    calories={log.macros.calories}
                    maxCalories={log.food.calories}
                    protein={log.macros.protein}
                    carbs={log.macros.carbs}
                    fats={log.macros.fats}
                    mealType={log.mealType}
                    onLongPress={() => enterSelectionMode(log.id)}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedLogs.has(log.id)}
                    onSelect={() => toggleSelectLog(log.id)}
                  />
                ))}
                
                <TouchableOpacity style={styles.showAllButton} onPress={navigateToHistory}>
                    <Text style={styles.showAllText}>Show All</Text>
                    <ChevronLeft size={16} color="#888" style={{ transform: [{rotate: '180deg'}] }} />
                </TouchableOpacity>
                </>
            )}
          </View>
        </View>
        </Animated.View>

        {/* Food Catalog Banner */}
        <Animated.View entering={createEntranceAnim(400)}>
        <TouchableOpacity 
          style={styles.catalogBanner} 
          activeOpacity={0.9}
          onPress={navigateToFoodCatalog}
        >
          {/* Text on left */}
          <View style={styles.catalogTextContainer}>
            <Text style={styles.catalogTitle}>FOOD{"\n"}CATALOG</Text>
          </View>
          
          {/* Image container on right with gradient fade */}
          <View style={styles.catalogImageContainer}>
            <Image
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVAgji-LW6NcOlwdCtVkYt9ik4FpPqm3OmBHiFbB1OTc_KpKFQSMh43JdbrIOjxgek3cNTQYaqqECTgGFyszNAIWRewWy-8Qk1RWQgBDZ32uHAxeFcVDfKqcdLra1MESp86FBUXits3mtFwspoqjuMh_eQBmUHqVwRAAtFVBpnFB_DKSmSBj1b8WWyEudI3i4O4dV6p7ki21Y_gqX5At1HRzI3keMK1HjqhcdRqSxg_7j4O5jVkFafrzleOW7vrcI7k7MPjIfUn0qS" }}
              style={styles.catalogImage}
              resizeMode="cover"
            />
            {/* Gradient overlay for fade effect */}
            <LinearGradient
              colors={['#1C1C1E', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.5, y: 0.5 }}
              style={styles.catalogGradient}
            />
          </View>
        </TouchableOpacity>
        </Animated.View>
        </Animated.View>
        
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Items</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedLogs.size} item{selectedLogs.size > 1 ? 's' : ''}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          style={styles.toast}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    height: 48,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#2C2C2E",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  date: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
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
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  goalIcon: {
    fontSize: 16,
  },
  activityContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 27,
  },
  waterChartContainer: {
    alignItems: "center",
  },
  waterChartBox: {
    width: 190,
    height: 120,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#d3f660",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  waterChartContent: {
    alignItems: "center",
    zIndex: 1,
  },
  waterChartValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  waterChartLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  macrosContainer: {
    flex: 1,
    gap: 12,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  macroTextContainer: {
    flex: 1,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
  },
  macroMax: {
    color: "#666",
    fontWeight: "400",
  },
  macroLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 1,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayContainer: {
    alignItems: "center",
    gap: 8,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCompleted: {
    backgroundColor: "#d3f660",
  },
  dayWarning: {
    backgroundColor: "#f59e0b",
  },
  dayFailed: {
    backgroundColor: "#ef4444",
  },
  dayLabel: {
    fontSize: 11,
    color: "#666",
  },
  catalogBanner: {
    backgroundColor: "#1C1C1E",
    borderRadius: 32,
    height: 160,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  catalogTextContainer: {
    paddingLeft: 24,
    width: "50%",
    zIndex: 10,
  },
  catalogTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    lineHeight: 32,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  catalogImageContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "66%",
    height: "100%",
  },
  catalogImage: {
    width: "100%",
    height: "100%",
  },
  catalogGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "60%",
    height: "100%",
  },
  recentSection: {
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  recentList: {
    gap: 12,
  },
  foodItem: {
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    padding: 16,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  foodCalories: {
    fontSize: 13,
    color: "#666",
  },
  foodCaloriesValue: {
    color: "white",
    fontWeight: "700",
  },
  foodMacros: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  foodMacro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  foodMacroText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  foodMacroLabel: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
  },
  mealTypeBadge: {
    backgroundColor: "rgba(211, 246, 96, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(211, 246, 96, 0.3)",
  },
  mealTypeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d3f660",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#2C2C2E",
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  showAllText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  recentHeaderActions: {
    flexDirection: "row",
    gap: 8,
  },
  foodItemSelected: {
    borderWidth: 2,
    borderColor: "#d3f660",
  },
  checkbox: {
    marginRight: 4,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#2C2C2E",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
    borderColor: "#ef4444",
  },
  toastText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
});
