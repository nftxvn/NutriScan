import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Settings, TrendingDown, Droplets, Moon, Award, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react-native";
import Svg, { Circle, Path, Line, Text as SvgText } from "react-native-svg";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { GlowBackground } from "../../components/GlowBackground";
import { ShinyCard } from "../../components/ShinyCard";
import Animated, { FadeInUp, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// Custom entering animation that starts completely invisible
const createEntranceAnim = (delay: number) => 
  FadeInUp.delay(delay).duration(500).withInitialValues({ opacity: 0, transform: [{ translateY: 30 }] });

// Exit animation - instant fade out
const exitAnim = FadeOut.duration(150);

const { width } = Dimensions.get("window");

const periods = [{ label: "7 Days", days: 7 }, { label: "30 Days", days: 30 }, { label: "90 Days", days: 90 }];

const MacroCard = ({ label, percentage, value, color }: { label: string; percentage: number; value: string; color: string }) => {
  const size = 60;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <View style={styles.macroCard}>
      <View style={styles.macroCircleContainer}>
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
        <Text style={styles.macroPercentage}>{percentage}%</Text>
      </View>
      <Text style={styles.macroCardLabel}>{label}</Text>
      <Text style={styles.macroCardValue}>{value}</Text>
    </View>
  );
};

export default function Analytics() {
  const router = useRouter(); // Initialize router
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [focusKey, setFocusKey] = useState(0);
  const isFocused = useIsFocused();
  const [chartZoom, setChartZoom] = useState(1); // 1x to 5x zoom
  const baseZoomRef = useRef(1); // Track base zoom when pinch starts
  
  // Pinch gesture handler
  const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
    const scale = event.nativeEvent.scale;
    const newZoom = Math.min(5, Math.max(1, baseZoomRef.current * scale));
    setChartZoom(Math.round(newZoom)); // Round to nearest integer for cleaner labels
  };
  
  const onPinchHandlerStateChange = (event: PinchGestureHandlerGestureEvent) => {
    // When pinch ends, save the current zoom as the new base
    if (event.nativeEvent.state === 5) { // State.END
      baseZoomRef.current = chartZoom;
    } else if (event.nativeEvent.state === 2) { // State.BEGAN
      baseZoomRef.current = chartZoom;
    }
  };
  
  // Animated opacity based on focus
  const pageOpacity = useSharedValue(0);
  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
  }));
  
  // Update opacity when focus changes
  useEffect(() => {
    pageOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 500 });
  }, [isFocused]);

  // Constants / Targets
  const targetCalories = user?.profile?.targetCalories || 2000;
  const targetProtein = user?.profile?.targetProtein || 150;
  const targetCarbs = user?.profile?.targetCarbs || 250;
  const targetFats = user?.profile?.targetFats || 70;

  const fetchAnalytics = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/summary?days=${days}`);
      setAnalyticsData(res.data.data);
    } catch (e) {
      console.log("Error fetching analytics:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics(periods[selectedPeriod].days);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setFocusKey(k => k + 1);
    }, [selectedPeriod, fetchAnalytics])
  );

  const handlePeriodChange = (idx: number) => {
    setSelectedPeriod(idx);
    fetchAnalytics(periods[idx].days);
  };

  // Data Extraction
  const avgCalories = analyticsData?.averages?.calories || 0;
  const avgProtein = analyticsData?.averages?.protein || 0;
  const avgCarbs = analyticsData?.averages?.carbs || 0;
  const avgFats = analyticsData?.averages?.fats || 0;
  
  const macroPercents = analyticsData?.macroPercentages || { protein: 0, carbs: 0, fats: 0 };
  const currentWeight = Number(analyticsData?.weight?.current || user?.profile?.weight || 0).toFixed(2);
  const goalWeight = Number(analyticsData?.weight?.goal || currentWeight).toFixed(2);
  
  const chartData = analyticsData?.chartData || [0, 0, 0, 0, 0, 0, 0];

  // --- Smart Feedback Logic ---
  const insight = React.useMemo(() => {
    // Current vs Target
    const calDiff = Math.abs(avgCalories - targetCalories);
    const calRatio = avgCalories / targetCalories;
    const proteinRatio = avgProtein / targetProtein;
    const carbsRatio = avgCarbs / targetCarbs;
    const fatsRatio = avgFats / targetFats;

    // 1. Perfect Day
    if (calDiff <= 150 && proteinRatio >= 0.9) {
      return {
        title: "Perfect Execution!",
        message: "You hit your calorie and protein goals. Great balance!",
        status: "success",
        Icon: CheckCircle,
        color: "#d3f660" // Theme Green
      };
    }

    // 2. High Carb Warning
    if (calRatio > 1.1 && carbsRatio > 1.1) {
      return {
        title: "Carb Spike Detected",
        message: "High carb intake pushed you over your calorie limit today.",
        status: "warning",
        Icon: AlertTriangle,
        color: "#f59e0b" // Orange
      };
    }

    // 3. High Fat Warning
    if (calRatio > 1.1 && fatsRatio > 1.1) {
      return {
        title: "Calorie Surplus",
        message: "Be careful with high-fat foods, they quickly add up calories.",
        status: "warning",
        Icon: AlertTriangle,
        color: "#f59e0b" // Orange
      };
    }

    // 4. Protein Low
    // "Calories are OK" => implies not over limit? Assumed <= 110% per context of other rules
    if (calRatio <= 1.1 && proteinRatio < 0.70) {
      return {
        title: "Missed Protein Goal",
        message: "You stayed within calories, but missed your protein target. Muscle needs fuel!",
        status: "warning",
        Icon: AlertCircle,
        color: "#f59e0b" // Orange
      };
    }

    // 5. Dangerous Lows (Fat)
    if (avgFats < 30) {
      return {
        title: "Fat Intake Too Low",
        message: "Don't avoid fats completely. Your body needs them for hormones.",
        status: "danger",
        Icon: AlertCircle,
        color: "#ef4444" // Red
      };
    }

    // Default
    if (calRatio >= 0.8 && calRatio <= 1.1) {
       return {
        title: "On Track",
        message: "You're consistently hitting your calorie targets. Keep it up!",
        status: "success",
        Icon: Award,
        color: "#d3f660"
      };
    }
    
    return {
      title: "Keep Going",
      message: "Consistency is key. Try to get closer to your daily targets to see results.",
      status: "info",
      Icon: TrendingDown, // Generic
      color: "#ffffff"
    };

  }, [avgCalories, avgProtein, avgCarbs, avgFats, targetCalories, targetProtein, targetCarbs, targetFats]);


  // Generate smooth chart path using cubic bezier curves
  const chartWidth = width - 64;
  const chartHeight = 120;
  const xStep = chartWidth / (chartData.length - 1 || 1);
  
  // Convert data points to coordinates
  const points = chartData.map((y: number, i: number) => ({
    x: i * xStep,
    y: chartHeight - (y / 100) * chartHeight,
  }));
  
  // Generate smooth bezier path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    
    let path = `M ${pts[0].x} ${pts[0].y}`;
    
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      
      // Control points for smooth curve
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };
  
  const pathD = generateSmoothPath(points);
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Generate chart labels based on selected period and zoom level
  const getChartLabels = () => {
    const today = new Date();
    const daysInPeriod = periods[selectedPeriod].days;
    
    if (daysInPeriod === 7) {
      // Show weekdays for 7 days
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
      }
      return labels;
    } else if (daysInPeriod === 30) {
      // At max zoom (5x), show all 30 days as numbers
      // At lower zoom, show fewer labels
      const maxLabels = 30;
      const labelCount = Math.min(maxLabels, Math.round(7 * chartZoom));
      const labels = [];
      
      if (chartZoom >= 4) {
        // Show all days as day numbers: 1, 2, 3, ... 30
        for (let i = 1; i <= 30; i++) {
          labels.push(String(i));
        }
      } else {
        const step = 30 / (labelCount - 1);
        for (let i = 0; i < labelCount; i++) {
          const dayNum = Math.round(1 + i * step);
          labels.push(String(Math.min(dayNum, 30)));
        }
      }
      return labels;
    } else {
      // At max zoom (5x+), show all 90 days as numbers
      const maxLabels = 90;
      const labelCount = Math.min(maxLabels, Math.round(7 * chartZoom));
      const labels = [];
      
      if (chartZoom >= 5) {
        // Show all days as day numbers: 1, 2, 3, ... 90
        for (let i = 1; i <= 90; i++) {
          labels.push(String(i));
        }
      } else {
        const step = 90 / (labelCount - 1);
        for (let i = 0; i < labelCount; i++) {
          const dayNum = Math.round(1 + i * step);
          labels.push(String(Math.min(dayNum, 90)));
        }
      }
      return labels;
    }
  };
  
  const chartLabels = getChartLabels();

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
          <Text style={styles.title}>Your Progress</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/settings")}>
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Period Selector */}
        <Animated.View entering={createEntranceAnim(100)} style={styles.periodSelector}>
          {periods.map((period, idx) => (
            <TouchableOpacity
              key={period.label}
              style={[styles.periodButton, selectedPeriod === idx && styles.periodSelected]}
              onPress={() => handlePeriodChange(idx)}
            >
              <Text style={[styles.periodText, selectedPeriod === idx && styles.periodTextSelected]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Calorie Chart */}
        <Animated.View entering={createEntranceAnim(200)}>
        <ShinyCard>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Avg. Calorie Intake</Text>
              <Text style={styles.chartValue}>
                {avgCalories.toLocaleString()} <Text style={styles.chartUnit}>kcal</Text>
              </Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingDown size={12} color="#22c55e" />
              <Text style={styles.trendText}>-5%</Text>
            </View>
          </View>
          <Text style={styles.trendSubtext}>vs last week</Text>

          {/* Chart with Zoom */}
          <View style={styles.chartContainer}>
            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity 
                style={[styles.zoomButton, chartZoom >= 5 && styles.zoomButtonDisabled]} 
                onPress={() => setChartZoom(Math.min(5, chartZoom + 1))}
                disabled={chartZoom >= 5}
              >
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.zoomLevel}>{chartZoom}x</Text>
              <TouchableOpacity 
                style={[styles.zoomButton, chartZoom <= 1 && styles.zoomButtonDisabled]} 
                onPress={() => setChartZoom(Math.max(1, chartZoom - 1))}
                disabled={chartZoom <= 1}
              >
                <Text style={styles.zoomButtonText}>−</Text>
              </TouchableOpacity>
            </View>
            
            {/* Pinch to Zoom + Scrollable Chart Area */}
            <GestureHandlerRootView>
              <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  <View>
                    <Svg width={chartWidth * chartZoom} height={chartHeight + 30}>
                      {/* Area gradient fill */}
                      <Path d={areaD} fill="rgba(211, 246, 96, 0.1)" transform={`scale(${chartZoom}, 1)`} />
                      {/* Line */}
                      <Path d={pathD} stroke="#d3f660" strokeWidth={2} fill="none" transform={`scale(${chartZoom}, 1)`} />
                      {/* Dots */}
                      {points.map((pt: { x: number; y: number }, i: number) => (
                        <Circle key={i} cx={pt.x * chartZoom} cy={pt.y} r={4} fill="#d3f660" />
                      ))}
                    </Svg>
                    <View style={[styles.chartLabels, { width: chartWidth * chartZoom }]}>
                      {chartLabels.map((label, idx) => (
                        <Text key={idx} style={styles.chartDayLabel}>{label}</Text>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </PinchGestureHandler>
          </GestureHandlerRootView>
          </View>
        </ShinyCard>
        </Animated.View>

        {/* Macro Breakdown */}
        <Animated.View entering={createEntranceAnim(300)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Macro Breakdown</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Daily Avg</Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MacroCard label="Protein" percentage={macroPercents.protein} value={`${avgProtein}g`} color="#d3f660" />
          <MacroCard label="Carbs" percentage={macroPercents.carbs} value={`${avgCarbs}g`} color="#a78bfa" />
          <MacroCard label="Fats" percentage={macroPercents.fats} value={`${avgFats}g`} color="#f472b6" />
        </View>
        </Animated.View>

        {/* Body Weight */}
        <Animated.View entering={createEntranceAnim(400)}>
        <ShinyCard>
          <View style={styles.weightHeader}>
            <View style={styles.weightIcon}>
              <Text style={styles.weightEmoji}>⚖️</Text>
            </View>
            <View style={styles.weightText}>
              <Text style={styles.weightLabel}>Body Weight</Text>
              <Text style={styles.weightGoal}>Goal: {goalWeight}kg</Text>
            </View>
            <View style={styles.weightValue}>
              <Text style={styles.weightNumber}>{currentWeight} <Text style={styles.weightUnit}>kg</Text></Text>
              <View style={styles.weightChange}>
                <TrendingDown size={12} color="#22c55e" />
                <Text style={styles.weightChangeText}>0.5kg</Text>
              </View>
            </View>
          </View>
          <View style={styles.weightChart}>
            <Svg width={width - 80} height={40}>
              <Path
                d="M 0 30 Q 50 10 100 25 T 200 15 T 280 20"
                stroke="#d3f660"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
          </View>
        </ShinyCard>
        </Animated.View>


        {/* Smart Insight Card (Dynamic) */}
        <Animated.View entering={createEntranceAnim(500)} style={[styles.achievementCard, { borderColor: insight.color }]}>
          <View style={[styles.achievementIcon, { backgroundColor: `${insight.color}20` }]}> 
             {/* Opacity 20% hex approximation */}
            <insight.Icon size={24} color={insight.color} />
          </View>
          <View style={styles.achievementText}>
            <Text style={[styles.achievementTitle, { color: insight.color }]}>{insight.title}</Text>
            <Text style={styles.achievementDesc}>
              {insight.message}
            </Text>
          </View>
        </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  periodSelected: {
    backgroundColor: "#2C2C2E",
  },
  periodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  periodTextSelected: {
    color: "white",
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chartLabel: {
    fontSize: 13,
    color: "#888",
  },
  chartValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginTop: 4,
  },
  chartUnit: {
    fontSize: 16,
    fontWeight: "400",
    color: "#888",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  trendSubtext: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  chartContainer: {
    marginTop: 20,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartDayLabel: {
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  badge: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#888",
  },
  macroRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  macroCircleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  macroPercentage: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  macroCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  macroCardValue: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  weightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  weightEmoji: {
    fontSize: 18,
  },
  weightText: {
    flex: 1,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  weightGoal: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  weightValue: {
    alignItems: "flex-end",
  },
  weightNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  weightUnit: {
    fontSize: 14,
    color: "#888",
  },
  weightChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weightChangeText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
  },
  weightChart: {
    marginTop: 16,
    alignItems: "center",
  },

  achievementCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(211, 246, 96, 0.2)",
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(211, 246, 96, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#d3f660",
  },
  achievementDesc: {
    fontSize: 12,
    color: "#888",
    lineHeight: 18,
    marginTop: 4,
  },
  // Zoom controls
  zoomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3C3C3E",
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomButtonText: {
    color: "#d3f660",
    fontSize: 18,
    fontWeight: "700",
  },
  zoomLevel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    minWidth: 25,
    textAlign: "center",
  },
});
