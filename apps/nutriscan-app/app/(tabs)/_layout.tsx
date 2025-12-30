import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator, Alert, Animated, Easing, Platform, ToastAndroid } from "react-native";
import { Redirect, withLayoutContext, usePathname, useRouter } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StatusBar } from "expo-status-bar";
import { Home, BarChart3, User, Plus } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useEditMode } from "../../context/EditModeContext";
import { api } from "../../api/client";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { GlowBackground } from "../../components/GlowBackground";
import { LinearGradient } from "expo-linear-gradient";
import ReAnimated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

// Animated Tab Icon Component
const AnimatedTabIcon = ({ IconComponent, focused, color }: { IconComponent: any, focused: boolean, color: string }) => {
  const scale = useSharedValue(focused ? 1.2 : 1);
  const opacity = useSharedValue(focused ? 1 : 0.7);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(focused ? 1 : 0.7, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <ReAnimated.View style={[focused ? styles.glowIconContainer : undefined, animatedStyle]}>
      <IconComponent size={22} color={color} />
    </ReAnimated.View>
  );
};

// Animated Tab Label Component
const AnimatedTabLabel = ({ label, focused, color }: { label: string, focused: boolean, color: string }) => {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const opacity = useSharedValue(focused ? 1 : 0.7);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(focused ? 1 : 0.7, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <ReAnimated.View style={animatedStyle}>
      <Text style={[styles.tabLabel, { color }, focused && styles.activeTabLabel]}>{label}</Text>
    </ReAnimated.View>
  );
};

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const { isEditing } = useEditMode();
  const pathname = usePathname();
  const router = useRouter();
  
  // FAB Animation
  const fabTranslateY = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const isOnProfile = pathname === "/profile";
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Intro animation - scale up and slight rotation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fabRotation, {
        toValue: 0,
        duration: 400,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate FAB based on current page
  useEffect(() => {
    Animated.timing(fabTranslateY, {
      toValue: isOnProfile ? 200 : 0, // Slide down 200 when on profile
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // Ease out
      useNativeDriver: true,
    }).start();
  }, [isOnProfile]);

  // Outro animation function
  const animateFabOuto = (callback: () => void) => {
    setIsAnimatingOut(true);
    Animated.parallel([
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fabRotation, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      // Reset for next time
      setTimeout(() => {
        fabScale.setValue(0);
        fabRotation.setValue(0);
        setIsAnimatingOut(false);
        Animated.spring(fabScale, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }, 500);
    });
  };

  const fabRotationInterpolate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Prevent back button from going to auth screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Return true to prevent default back behavior (going to auth screens)
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // FAB press handler - MUST be before early returns (hooks rule)
  const handleFabPress = useDebouncedCallback(() => {
    animateFabOuto(() => {
      router.push({ pathname: "/food-catalog/form", params: { autoLog: "true" } });
    });
  });

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#d3f660" />
      </View>
    );
  }

  // Redirect to welcome if not authenticated
  if (!user) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return (
    <GlowBackground glowPosition="dual-corner" intensity={0.3}>
      <StatusBar style="light" />
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarStyle: styles.tabBarInner,
          tabBarActiveTintColor: "#d3f660",
          tabBarInactiveTintColor: "#666",
          tabBarIndicatorStyle: { height: 0 }, // Hide material underlined indicator
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: { paddingVertical: 5, justifyContent: 'center' },
          swipeEnabled: !isEditing, // Disable swipe during edit mode
          animationEnabled: true,
          tabBarPressColor: 'transparent', // Remove ripple on Android if creating custom feel
          tabBarShowIcon: true,
          sceneStyle: { backgroundColor: 'transparent' }, // Important: Transparent scenes
          tabBarContentContainerStyle: { flex: 1 },
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabIcon IconComponent={Home} focused={focused} color={color} />
            ),
            tabBarLabel: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabLabel label="Home" focused={focused} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e: any) => {
              if (isEditing) {
                e.preventDefault();
                Alert.alert("Edit Mode Aktif", "Anda masih dalam mode edit. Simpan atau batalkan perubahan terlebih dahulu.");
              }
            },
          }}
        />
        <MaterialTopTabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabIcon IconComponent={BarChart3} focused={focused} color={color} />
            ),
            tabBarLabel: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabLabel label="Analytics" focused={focused} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e: any) => {
              if (isEditing) {
                e.preventDefault();
                Alert.alert("Edit Mode Aktif", "Anda masih dalam mode edit. Simpan atau batalkan perubahan terlebih dahulu.");
              }
            },
          }}
        />
        <MaterialTopTabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabIcon IconComponent={User} focused={focused} color={color} />
            ),
            tabBarLabel: ({ color, focused }: { color: string, focused: boolean }) => (
              <AnimatedTabLabel label="Profile" focused={focused} color={color} />
            ),
          }}
        />
      </MaterialTopTabs>

      {/* FAB - Animated with intro/outro effects */}
      <Animated.View style={[
        styles.fab, 
        { 
          transform: [
            { translateY: fabTranslateY },
            { scale: fabScale },
            { rotate: fabRotationInterpolate }
          ] 
        }
      ]}>
        <TouchableOpacity 
            style={styles.fabButton} 
            activeOpacity={0.8} 
            onPress={handleFabPress}
            disabled={isAnimatingOut}
        >
          <Plus size={28} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  tabBarInner: {
    backgroundColor: "#1C1C1E",
    borderTopWidth: 0,
    height: 70,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
    borderRadius: 24,
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    elevation: 10,
    zIndex: 1,
    // Shiny border effect
    borderWidth: 1.5,
    borderColor: "rgba(211, 246, 96, 0.4)",
    // Glow shadow
    shadowColor: "#d3f660",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: 'capitalize', // Material default is upper
  },
  activeTabLabel: {
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(211, 246, 96, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  glowIconContainer: {
    shadowColor: '#d3f660',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: "absolute",
    bottom: 120, // Above navbar when visible
    right: 24,
    zIndex: 2, // Lower than navbar so FAB slides UNDER it
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#d3f660",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#d3f660",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
