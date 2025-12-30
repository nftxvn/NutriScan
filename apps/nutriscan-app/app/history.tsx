import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { api } from "../api/client";
import { GlowBackground } from "../components/GlowBackground";
import { FoodItem } from "../components/FoodItem";

export default function History() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      // Using /logs/today for now as it matches "Recently Consumed" context.
      // If we want FULL history, we might need a different endpoint or pagination.
      const res = await api.get("/logs/today");
      setLogs(res.data.data.logs);
    } catch (e) {
      console.log("Error fetching history", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
        fetchLogs();
    }, [fetchLogs])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  return (
    <GlowBackground glowPosition="top-left" intensity={0.15} style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#d3f660"
            />
        }
      >
        {logs.length === 0 && !loading ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No logs found for today.</Text>
            </View>
        ) : (
            <View style={styles.list}>
                {logs.map((log) => (
                    <FoodItem
                        key={log.id}
                        name={log.food.name}
                        calories={log.macros.calories}
                        maxCalories={log.food.calories}
                        protein={log.macros.protein}
                        carbs={log.macros.carbs}
                        fats={log.macros.fats}
                        mealType={log.mealType}
                    />
                ))}
            </View>
        )}
      </ScrollView>
    </GlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  }
});
