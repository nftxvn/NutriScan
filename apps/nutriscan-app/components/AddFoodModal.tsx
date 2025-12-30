import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { X, Utensils, Flame, Droplets, Wheat, Check } from "lucide-react-native";

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (food: FoodData) => Promise<void>;
}

export interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
}

const MEAL_TYPES = [
  { key: "BREAKFAST", label: "Breakfast", emoji: "🌅" },
  { key: "LUNCH", label: "Lunch", emoji: "☀️" },
  { key: "DINNER", label: "Dinner", emoji: "🌙" },
  { key: "SNACK", label: "Snack", emoji: "🍿" },
] as const;

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState<FoodData["mealType"]>("BREAKFAST");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setMealType("BREAKFAST");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError("Please enter food name");
      return;
    }
    if (!calories || parseFloat(calories) <= 0) {
      setError("Please enter valid calories");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        name: name.trim(),
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fats: parseFloat(fats) || 0,
        mealType,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save food");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Food</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Food Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Name</Text>
              <View style={styles.inputContainer}>
                <Utensils size={18} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Nasi Goreng"
                  placeholderTextColor="#555"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Calories */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calories (kcal)</Text>
              <View style={styles.inputContainer}>
                <Flame size={18} color="#f97316" />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
            </View>

            {/* Macros Row */}
            <View style={styles.macroRow}>
              {/* Protein */}
              <View style={styles.macroInput}>
                <Text style={styles.macroLabel}>Protein (g)</Text>
                <View style={styles.inputContainerSmall}>
                  <Droplets size={16} color="#3b82f6" />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={protein}
                    onChangeText={setProtein}
                  />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroInput}>
                <Text style={styles.macroLabel}>Carbs (g)</Text>
                <View style={styles.inputContainerSmall}>
                  <Wheat size={16} color="#eab308" />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={setCarbs}
                  />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.macroInput}>
                <Text style={styles.macroLabel}>Fats (g)</Text>
                <View style={styles.inputContainerSmall}>
                  <Flame size={16} color="#ef4444" />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="0"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={fats}
                    onChangeText={setFats}
                  />
                </View>
              </View>
            </View>

            {/* Meal Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Type</Text>
              <View style={styles.mealTypeRow}>
                {MEAL_TYPES.map((meal) => (
                  <TouchableOpacity
                    key={meal.key}
                    style={[
                      styles.mealTypeButton,
                      mealType === meal.key && styles.mealTypeSelected,
                    ]}
                    onPress={() => setMealType(meal.key)}
                  >
                    <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                    <Text
                      style={[
                        styles.mealLabel,
                        mealType === meal.key && styles.mealLabelSelected,
                      ]}
                    >
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Food</Text>
                <Check size={20} color="#000" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#d3f660", // Lime green when typing
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  macroInput: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainerSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  inputSmall: {
    flex: 1,
    fontSize: 14,
    color: "#d3f660", // Lime green when typing
  },
  mealTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    borderWidth: 2,
    borderColor: "transparent",
  },
  mealTypeSelected: {
    borderColor: "#d3f660",
    backgroundColor: "rgba(211, 246, 96, 0.1)",
  },
  mealEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  mealLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
  },
  mealLabelSelected: {
    color: "#d3f660",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#d3f660",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddFoodModal;
