import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ShinyCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
}

export const ShinyCard: React.FC<ShinyCardProps> = ({
  children,
  style,
  gradientColors = ["rgba(211, 246, 96, 0.6)", "rgba(211, 246, 96, 0.05)", "rgba(211, 246, 96, 0.3)"],
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientBorder, style]}
    >
      <View style={styles.innerContainer}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 1.5, // The thickness of the shiny stroke
    borderRadius: 24,
    marginBottom: 20,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#1C1C1E", // Dark card background
    borderRadius: 23, // Slightly less than outer to fit
    padding: 20,
    overflow: "hidden",
  },
});
