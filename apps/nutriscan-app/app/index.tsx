import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 2000);

    // Failsafe: If auth is stuck for 5 seconds, force redirect to onboarding
    const failsafe = setTimeout(() => {
       if (isLoading) {
         console.log("Splash: Failsafe triggered");
         router.replace("/onboarding"); 
       }
    }, 5000);

    return () => { clearTimeout(timer); clearTimeout(failsafe); };
  }, []);

  useEffect(() => {
    if (animationDone && !isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [animationDone, isLoading, user]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🥗</Text>
        </View>
        <Text style={styles.title}>
          Nutri<Text style={styles.highlight}>Scan</Text>
        </Text>
        <Text style={styles.subtitle}>Track your nutrition, transform your life</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
  },
  logoContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#d3f660",
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "white",
    letterSpacing: -1,
  },
  highlight: {
    color: "#d3f660",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
});
