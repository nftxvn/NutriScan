import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

const NutriTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0A0A0A",
  },
};

import { AuthProvider } from "../context/AuthContext";
import { EditModeProvider } from "../context/EditModeContext";

export default function Layout() {
  return (
    <ThemeProvider value={NutriTheme}>
      <AuthProvider>
        <EditModeProvider>
          <View style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                animationDuration: 400,
                contentStyle: { backgroundColor: "#0A0A0A" },
              }}
            />
          </View>
          <StatusBar style="light" />
        </EditModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
