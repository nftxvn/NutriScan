import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Flame, Wheat, Droplets } from "lucide-react-native";

export const MEAL_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  BREAKFAST: { label: "Breakfast", emoji: "🌅" },
  LUNCH: { label: "Lunch", emoji: "☀️" },
  DINNER: { label: "Dinner", emoji: "🌙" },
  SNACK: { label: "Snack", emoji: "🍿" },
};

interface FoodItemProps {
  name: string;
  calories: number;
  maxCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const FoodItem = ({ 
  name, 
  calories, 
  maxCalories, 
  protein, 
  carbs, 
  fats, 
  mealType, 
  onLongPress, 
  isSelectionMode, 
  isSelected, 
  onSelect 
}: FoodItemProps) => (
  <TouchableOpacity 
    style={[styles.foodItem, isSelected && styles.foodItemSelected]} 
    onLongPress={onLongPress}
    onPress={isSelectionMode ? onSelect : undefined}
    delayLongPress={500}
    activeOpacity={0.7}
  >
    <View style={styles.foodHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>

        <Text style={styles.foodName}>{name}</Text>
        {mealType && MEAL_TYPE_LABELS[mealType] && (
          <View style={styles.mealTypeBadge}>
            <Text style={styles.mealTypeBadgeText}>
              {MEAL_TYPE_LABELS[mealType].emoji} {MEAL_TYPE_LABELS[mealType].label}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.foodCalories}>
        <Text style={styles.foodCaloriesValue}>{calories}</Text>/{maxCalories}kcal
      </Text>
    </View>
    <View style={styles.foodMacros}>
      <View style={styles.foodMacro}>
        <Flame size={12} color="#ef4444" />
        <Text style={styles.foodMacroText}>{protein}g</Text>
        <Text style={styles.foodMacroLabel}>Protein</Text>
      </View>
      <View style={styles.foodMacro}>
        <Wheat size={12} color="#f59e0b" />
        <Text style={styles.foodMacroText}>{carbs}g</Text>
        <Text style={styles.foodMacroLabel}>Carbs</Text>
      </View>
      <View style={styles.foodMacro}>
        <Droplets size={12} color="#3b82f6" />
        <Text style={styles.foodMacroText}>{fats}g</Text>
        <Text style={styles.foodMacroLabel}>Fats</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  foodItem: {
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    padding: 16,
  },
  foodItemSelected: {
    borderWidth: 2,
    borderColor: "#d3f660",
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
});
