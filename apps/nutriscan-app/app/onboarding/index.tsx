import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Scan,
  Soup,
  WifiOff,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react-native";
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import PagerView from "react-native-pager-view";
import { GlowBackground } from "../../components/GlowBackground";

// Reusable Radial Gradient Component
const GlowGradient = ({ size, color }: { size: number; color: string }) => (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient
          id="grad"
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          fx="50%"
          fy="50%"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color} stopOpacity="0.6" />
          <Stop offset="0.5" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad)" />
    </Svg>
);

const ScanVisual = () => {
    // Rotation animation
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current; // Pulse for glow
    
    // Bounce animations
    const bounce1 = useRef(new Animated.Value(0)).current;
    const bounce2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Spin loop
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 12000, // 12s linear infinite
                useNativeDriver: true,
                easing: Easing.linear
            })
        ).start();

        // Pulse loop (Smooth)
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();

        // Bounce loops
        const createBounce = (anim: Animated.Value, delay: number, duration: number) => {
             Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: -10, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                    Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
                ])
            ).start();
        };

        createBounce(bounce1, 0, 3000); // 3s duration
        setTimeout(() => createBounce(bounce2, 0, 3500), 1500); // 1.5s delay, 3.5s duration
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
      <View style={styles.cardVisual}>
        <View style={styles.scanWrapper}>
            {/* Pulse Glow Gradient */}
             <Animated.View style={{ position: 'absolute', transform: [{ scale: pulseAnim }] }}>
                <GlowGradient size={300} color="#d3f660" />
             </Animated.View>

            {/* Spinning Dashed Border */}
            <Animated.View style={[styles.scanCircleOuter, { transform: [{ rotate: spin }] }]} />
            
            {/* Inner Static Border */}
            <View style={styles.scanCircleInner} />

            {/* Main Icon Card */}
            <View style={styles.scanIconCard}>
               <Scan size={64} color="#d3f660" />
            </View>

            {/* Scan Badge (Top Right) */}
            <Animated.View style={[styles.floatingBadge, styles.scanBadge, { transform: [{ translateY: bounce1 }] }]}>
                <View style={styles.recordingDot} />
                <Text style={styles.badgeText}>Scan</Text>
            </Animated.View>

            {/* Identified Badge (Bottom Left) */}
            <Animated.View style={[styles.floatingBadge, styles.identifiedBadge, { transform: [{ translateY: bounce2 }] }]}>
                <CheckCircle2 size={14} color="#22c55e" />
                <Text style={styles.badgeText}>Identified</Text>
            </Animated.View>
        </View>
      </View>
    );
};

const DatabaseVisual = () => {
    const bounce1 = useRef(new Animated.Value(0)).current;
    const bounce2 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current; // Pulse for blob

    useEffect(() => {
        // Pulse loop for Blob
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();

        const createBounce = (anim: Animated.Value, duration: number) => {
             Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: -15, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                    Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
                ])
            ).start();
        };

        createBounce(bounce1, 3000);
        setTimeout(() => createBounce(bounce2, 4000), 500); 
    }, []);

    return (
      <View style={styles.cardVisual}>
        <View style={styles.dbWrapper}>
            {/* Background Blob (Pulsing Gradient) */}
            <Animated.View style={{ position: 'absolute', transform: [{ scale: pulseAnim }] }}>
                 <GlowGradient size={280} color="#D2FF55" />
            </Animated.View>

            {/* Main Card */}
            <View style={styles.dbCard}>
               <Soup size={80} color="#D2FF55" style={{ shadowColor: '#D2FF55', shadowRadius: 15, shadowOpacity: 0.4 }} />
            </View>

            {/* Fire Badge */}
            <Animated.View style={[styles.dbBadge, styles.dbFireBadge, { transform: [{ translateY: bounce1 }] }]}>
                 <Flame size={24} color="#f97316" fill="#f97316" />
            </Animated.View>

            {/* Calorie Badge */}
            <Animated.View style={[styles.dbBadge, styles.dbCalorieBadge, { transform: [{ translateY: bounce2 }] }]}>
                 <Text style={styles.dbCalorieValue}>120</Text>
                 <Text style={styles.dbCalorieLabel}>kcal</Text>
            </Animated.View>
        </View>
      </View>
    );
};

const SonarVisual = () => {
    // Create 3 rings for sonar effect
    const rings = [0, 1, 2];
    const anims = useRef(rings.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animateRing = (index: number) => {
            // Reset to 0
            anims[index].setValue(0);
            
            Animated.loop(
                Animated.timing(anims[index], {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ).start();
        };

        // Stagger start for sonar effect
        anims.forEach((_, i) => {
            setTimeout(() => animateRing(i), i * 800);
        });
    }, []);

    return (
      <View style={styles.cardVisual}>
        <View style={styles.offlineWrapper}>
           {/* Sonar Rings */}
           {anims.map((anim, i) => {
               const scale = anim.interpolate({
                   inputRange: [0, 1],
                   outputRange: [0.8, 2.2] // Expand from slightly smaller to much larger
               });
               const opacity = anim.interpolate({
                   inputRange: [0, 0.5, 1],
                   outputRange: [0.6, 0.3, 0] // Fade out as it expands
               });
               
               return (
                   <Animated.View 
                        key={i}
                        style={[
                            styles.offlineGlow, 
                            { 
                                transform: [{ scale }], 
                                opacity 
                            }
                        ]} 
                   />
               );
           })}
           
           {/* Main Circle */}
           <View style={styles.offlineCard}>
              <WifiOff size={80} color="#BEF264" />
           </View>
        </View>
      </View>
    );
};

const slides = [
  {
    id: 1,
    title: "Scan Instant Food",
    description: "Simply point your camera at any food item to instantly get nutritional breakdowns and calorie counts.",
    Icon: ScanVisual,
  },
  {
    id: 2,
    title: "Local Food Database",
    description: "Discover thousands of local food nutritional information accurately and easily.",
    Icon: DatabaseVisual,
  },
  {
    id: 3,
    title: "Offline Mode",
    description: "No internet? No problem.\nLog your meals anytime, anywhere without interruption.",
    Icon: SonarVisual,
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
       pagerRef.current?.setPage(currentSlide + 1);
    } else {
      router.replace("/onboarding/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/onboarding/welcome");
  };

  const handleLogin = () => {
    router.replace("/auth/login");
  };

  const onPageSelected = (e: any) => {
      setCurrentSlide(e.nativeEvent.position);
  };

  return (
    <GlowBackground style={styles.container} intensity={0.2} glowPosition="center">
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content - PagerView */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {slides.map((slide, index) => {
           const SlideVisual = slide.Icon;
           return (
            <View key={slide.id} style={styles.slidePage}>
                 <View style={styles.visualContainer}>
                    <SlideVisual />
                </View>

                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>
           );
        })}
      </PagerView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
            {slides.map((_, idx) => (
            <View
                key={idx}
                style={[
                styles.paginationDot,
                idx === currentSlide
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
            />
            ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>

        <View style={styles.loginContainer}>
             <Text style={styles.loginText}>Already have an account? </Text>
             <TouchableOpacity onPress={handleLogin}>
                 <Text style={styles.loginLink}>Log in</Text>
             </TouchableOpacity>
        </View>
      </View>
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  pagerView: {
    flex: 1,
  },
  slidePage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: -40,
  },
  visualContainer: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardVisual: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanWrapper: {
      width: 320,
      height: 320,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  },
  scanCircleOuter: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 1,
      borderColor: "rgba(190, 242, 100, 0.5)", // primary/50
      borderStyle: 'dashed',
  },
  scanCircleInner: {
      position: 'absolute',
      width: 250, // scale-90 approx
      height: 250,
      borderRadius: 125,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)", // dark:border-white/10
  },
  scanIconCard: {
      width: 160, // w-40
      height: 160, // h-40
      borderRadius: 24, // rounded-3xl
      backgroundColor: "#1C1C1E", // card-dark
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      transform: [{ rotate: '3deg' }], // rotate-3
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
  },
  floatingBadge: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: "#1C1C1E", // card-dark
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
  },
  scanBadge: {
      top: 40,
      right: 40,
  },
  identifiedBadge: {
      bottom: 64,
      left: 16,
  },
  recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ef4444", // red-500
  },
  badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'white',
  },
  bowlContainer: {
    width: 180,
    height: 180,
    backgroundColor: "#111",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    borderWidth: 1,
    borderColor: "#222",
  },
  calorieBadge: {
      position: 'absolute',
      left: -20,
      bottom: 40,
      backgroundColor: "#d3f660",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#d3f660",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
  },
  calorieValue: {
      fontSize: 16,
      fontWeight: '800',
      color: '#000',
  },
  calorieLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#000',
  },
  flameBadge: {
      position: 'absolute',
      right: -10,
      top: -10,
      backgroundColor: "#1f2937",
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: "#374151",
  },
  wifiContainer: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "#111",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#222",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#d3f660",
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: "#333",
  },
  button: {
    backgroundColor: "#d3f660",
    paddingVertical: 18,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: '100%',
    marginBottom: 24,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  loginContainer: {
      flexDirection: 'row',
  },
  loginText: {
      color: '#666',
      fontSize: 14,
  },
  loginLink: {
      color: '#d3f660',
      fontSize: 14,
      fontWeight: '700',
  },
  dbWrapper: {
      width: 280,
      height: 280,
      alignItems: 'center',
      justifyContent: 'center',
  },
  dbCard: {
      width: 192, // w-48
      height: 192, // h-48
      borderRadius: 40, // rounded-[2.5rem]
      backgroundColor: "#1C1C1E",
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: "#1f2937", // border-gray-800
      transform: [{ rotate: '3deg' }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
  },
  dbBadge: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  },
  dbFireBadge: {
      top: 0,
      right: 10,
      width: 64,
      height: 64,
      backgroundColor: "rgba(31, 41, 55, 0.8)", // gray-800/80
      borderWidth: 1,
      borderColor: "#374151",
  },
  dbCalorieBadge: {
      bottom: 20,
      left: 10,
      width: 56,
      height: 56,
      backgroundColor: "#D2FF55",
      borderRadius: 16,
  },
  dbCalorieValue: {
      fontSize: 14,
      fontWeight: '900',
      color: 'black',
  },
  dbCalorieLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: 'black',
      textTransform: 'uppercase',
  },
  offlineWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: 280,
      height: 280,
  },
  offlineGlow: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: "rgba(190, 242, 100, 0.15)", // primary/15 approx
  },
  offlineCard: {
      width: 180, 
      height: 180,
      borderRadius: 90, // rounded-full
      backgroundColor: "#1C1C1C", // surface-dark
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: "rgba(31, 41, 55, 0.3)", // border-gray-800/30
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2, 
      shadowRadius: 20,
      elevation: 5,
  },
});
