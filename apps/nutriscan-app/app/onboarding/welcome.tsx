import React, { useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Droplets } from "lucide-react-native";
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

const { width, height } = Dimensions.get("window");

// Reusable Radial Gradient Component (Same as Onboarding)
const GlowGradient = ({ size, color }: { size: number; color: string }) => (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient
          id="grad-welcome"
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
      <SvgCircle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad-welcome)" />
    </Svg>
);

export default function Welcome() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse loop (Smooth)
    Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
        ])
    ).start();

    // Bounce loops
    const createBounce = (anim: Animated.Value, duration: number) => {
         Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: -10, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(anim, { toValue: 0, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();
    };

    createBounce(bounce1, 3000); // 3s duration (Protein)
    setTimeout(() => createBounce(bounce2, 4000), 1000); // 1s delay (Calories)
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={["rgba(195, 245, 60, 0.05)", "transparent"]}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Main Image Section */}
      <View style={styles.imageSection}>
        {/* Glow Background (Animated Gradient) */}
        <Animated.View style={{ position: 'absolute', transform: [{ scale: pulseAnim }], zIndex: -1, top: 60 }}>
            <GlowGradient size={350} color="#c3ff00ff" />
        </Animated.View>
        
        {/* Image Container */}
        <View style={styles.imageWrapper}>
            <View style={styles.imageBorder}>
                <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPSUJ9tPSzUhyzbKSacOuOg8-bBGXr38DlDlPTFXxkLyZuyZhWkmwj8obx13hg7uUPbW6S8K7-Hj7uYCUxjQCGFkebB0NS8kmnhqCbzvip_2LCHtZqb43PlJ3zBLZ2QfQQj7y8_8h1fcUx9hQcGXp4aOp2CAhHuSewHSm66Oipc0dsOCsWjFSI58Yof2W0ErAV0GnME_yMFobi_tmdZPBk6kL1vcYXR0Cl_1xZUIXCFLGZyaBgGKg5eDAGuIoS5jchUNjxKikPmE13" }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
                 {/* Inner Shadow Gradient */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Floating Badge: Calories (Bottom Left) */}
            <Animated.View style={[
                styles.floatingBadge, 
                styles.badgeLeft, 
                { transform: [{ translateY: bounce2 }] }
            ]}>
                <View style={[styles.iconBox, { backgroundColor: "rgba(249, 115, 22, 0.2)" }]}>
                    <Flame size={20} color="#f97316" fill="#f97316" />
                </View>
                <View>
                    <Text style={styles.badgeLabel}>Calories</Text>
                    <Text style={styles.badgeValue}>450 kCal</Text>
                </View>
            </Animated.View>

            {/* Floating Badge: Protein (Top Right) - ANIMATED */}
            <Animated.View style={[
                styles.floatingBadge, 
                styles.badgeRight, 
                { transform: [{ translateY: bounce1 }] }
            ]}>
                <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                    <Droplets size={20} color="#60a5fa" fill="#60a5fa" />
                </View>
                <View>
                    <Text style={styles.badgeLabel}>Protein</Text>
                    <Text style={styles.badgeValue}>32g</Text>
                </View>
            </Animated.View>
        </View>
      </View>


      {/* Content Section with Gradient Background */}
      <LinearGradient
        colors={["transparent", "#101010", "#101010"]}
        locations={[0, 0.4, 1]}
        style={styles.contentSection}
      >
        <View style={styles.textContainer}>
            <Text style={styles.title}>
                Start Your 
                <Text style={styles.highlight}> Healthy Life</Text> Today With
                Nutri<Text style={styles.highlight}>Scan</Text>
            </Text>
            <Text style={styles.subtitle}>
                Track nutrition, reach ideal goals, and build positive habits every day.
            </Text>
        </View>

        <View style={styles.buttonContainer}>
             {/* Create Account Button */}
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/auth/account-setup")}
                activeOpacity={0.9}
            >
                <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/auth/login")}
                activeOpacity={0.9}
            >
                <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
             By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </LinearGradient>
      
      {/* Bottom Home Indicator Falsification */}
      <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010", // background-dark
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 0,
  },
  imageSection: {
    height: height * 0.45, // 45vh
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 68, // pt-12
    zIndex: 10,
    position: 'relative',
  },
  // glowBlob removed, replaced by animated component
  imageWrapper: {
      width: 288, // w-72 approximated
      height: 288,
      position: 'relative',
  },
  imageBorder: {
      width: '100%',
      height: '100%',
      borderRadius: 144, // rounded-full
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)", // border-white/5
      elevation: 20, // shadow-2xl equivalent
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      backgroundColor: '#000',
  },
  heroImage: {
      width: '100%',
      height: '100%',
      transform: [{ scale: 1.05 }], // scale-105
  },
  floatingBadge: {
      position: 'absolute',
      backgroundColor: "rgba(30, 30, 30, 0.9)", // #1E1E1E with slight transparency
      padding: 12,
      paddingRight: 20,
      borderRadius: 16, // rounded-2xl
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)", // border-white/10
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
  },
  badgeLeft: {
      bottom: -16, // -bottom-4
      left: -16, // -left-4
  },
  badgeRight: {
      top: 48, // top-12
      right: -24, // -right-6
  },
  iconBox: {
      padding: 8,
      borderRadius: 12, // rounded-xl
  },
  badgeLabel: {
      fontSize: 10,
      color: "#9ca3af", // text-gray-400
      fontWeight: '500',
      textTransform: "uppercase",
      letterSpacing: 0.5,
  },
  badgeValue: {
      fontSize: 14,
      fontWeight: '700',
      color: "white",
  },
  contentSection: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
  },
  textContainer: {
      alignItems: 'center',
      marginBottom: 32,
  },
  title: {
      fontSize: 34,
      fontWeight: '800', // font-extrabold
      color: 'white',
      textAlign: 'center',
      lineHeight: 38, // leading-[1.1]
      letterSpacing: -0.5, // tracking-tight
  },
  highlight: {
      color: "#C3F53C", // primary
      textShadowColor: "rgba(195, 245, 60, 0.15)",
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20, // text-glow
  },
  subtitle: {
      fontSize: 16,
      color: "#9ca3af", // text-gray-400
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 24, // leading-relaxed
      maxWidth: '90%',
  },
  buttonContainer: {
      gap: 16,
      marginBottom: 24,
  },
  primaryButton: {
      backgroundColor: "#C3F53C", // primary
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "rgba(195, 245, 60, 0.1)",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
  },
  primaryButtonText: {
      color: "#000",
      fontSize: 17,
      fontWeight: '700',
  },
  secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: "#C3F53C", // primary
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  secondaryButtonText: {
      color: "#C3F53C", // primary
      fontSize: 17,
      fontWeight: '700',
  },
  footerText: {
      fontSize: 11,
      color: "#6b7280", // text-gray-500
      textAlign: 'center',
      lineHeight: 14,
      paddingHorizontal: 16,
  },
  linkText: {
      color: "#9ca3af", // text-gray-400
      textDecorationLine: 'underline',
  },
  homeIndicatorContainer: {
      position: 'absolute',
      bottom: 8,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 20,
  },
  homeIndicator: {
      width: 128, // w-32
      height: 6, // h-1.5
      backgroundColor: "#1f2937", // bg-gray-800
      borderRadius: 3,
  },
});
