import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Save, Upload, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react-native";
import { api, getAuthToken } from "../../api/client";
import { GlowBackground } from "../../components/GlowBackground";
import * as ImagePicker from "expo-image-picker";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";

export default function FoodForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  const foodId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [imageSourceType, setImageSourceType] = useState<"link" | "upload">("link");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Shake animation for calorie input
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));
  
  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(-6, { duration: 70 }),
      withTiming(6, { duration: 70 }),
      withTiming(-3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };
  
  // Shake animation for food name input
  const nameShakeX = useSharedValue(0);
  const nameShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nameShakeX.value }],
  }));
  
  const triggerNameShake = () => {
    nameShakeX.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 80 }),
      withTiming(-6, { duration: 70 }),
      withTiming(6, { duration: 70 }),
      withTiming(-3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "local",
    servingSize: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    image: "",
  });

  useEffect(() => {
    if (isEditing) {
      fetchFoodDetails();
    }
  }, [isEditing]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get("/foods");
      const food = res.data.data.find((f: any) => f.id === foodId);
      if (food) {
        setFormData({
            name: food.name,
            brand: food.brand || "",
            type: food.type || "local",
            servingSize: food.servingSize || "",
            calories: String(food.calories),
            protein: String(food.protein),
            carbs: String(food.carbs),
            fats: String(food.fats),
            image: food.image || "",
        });
        
        // Auto-detect source type
        if (food.image && food.image.includes("/uploads/")) {
            setImageSourceType("upload");
        } else {
            setImageSourceType("link");
        }
      }
    } catch (e) {
      console.log("Error fetching food details", e);
      Alert.alert("Error", "Could not load food details");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }
    }

    try {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadImage(result.assets[0].uri);
        }
    } catch (e) {
        console.log("Error picking image", e);
        Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
        const token = await getAuthToken();
        if (!token) return;

        const formData = new FormData();
        const filename = uri.split('/').pop() || 'food.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('food', {
            uri: uri,
            name: filename,
            type: type,
        } as any);

        const res = await api.post('/upload/food', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
             transformRequest: (data) => data,
        });

        if (res.data.status === 'success') {
            setFormData(prev => ({ ...prev, image: res.data.data.url }));
        } else {
            Alert.alert("Error", "Failed to upload image");
        }
    } catch (e) {
        console.log("Error uploading image", e);
        Alert.alert("Error", "Failed to upload image");
    } finally {
        setUploadingImage(false);
    }
  };


  const [selectedMealType, setSelectedMealType] = useState("SNACK");
  
  // Smart guess meal type on mount if autoLog is enabled
  useEffect(() => {
    if (params.autoLog === "true") {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) setSelectedMealType("BREAKFAST");
      else if (hour >= 11 && hour < 16) setSelectedMealType("LUNCH");
      else if (hour >= 16 && hour < 22) setSelectedMealType("DINNER");
      else setSelectedMealType("SNACK");
    }
  }, [params.autoLog]);


  const handleSubmit = async () => {
    if (!formData.name || !formData.calories) {
        Alert.alert("Validation Error", "Name and Calories are required");
        return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fats: Number(formData.fats),
        image: formData.image,
      };

      if (isEditing) {
        await api.patch(`/foods/${foodId}`, payload);
        Alert.alert("Success", "Food updated successfully");
      } else {
        const res = await api.post("/foods", payload);
        const newFoodId = res.data.data.id;
        
        // Auto-log with SELECTED meal type
        if (params.autoLog === "true") {
             await api.post("/logs", {
                 foodId: newFoodId,
                 mealType: selectedMealType,
                 quantity: 1,
                 date: new Date().toISOString()
             });
        }
      }
      
      router.back();
    } catch (e: any) {
      console.log("Error saving food", JSON.stringify(e.response?.data || e.message, null, 2));
      alert(`Failed: ${JSON.stringify(e.response?.data || e.message)}`);
      Alert.alert("Error", "Failed to save food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowBackground glowPosition="top-right" intensity={0.15} style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - animated */}
      <Animated.View 
        entering={FadeInUp.duration(400).delay(100)} 
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Food" : "Add Food"}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <Text style={styles.saveButtonText}>...</Text> : <Save size={20} color="black" />}
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <Animated.ScrollView 
          entering={FadeInUp.duration(500).delay(200)}
          contentContainerStyle={styles.formContent} 
          showsVerticalScrollIndicator={false}
        >
            
            {/* Meal Type Selection (Only if AutoLog) */}
            {params.autoLog === "true" && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Meal Time</Text>
                    <View style={styles.typeSelector}>
                        {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(type => (
                            <TouchableOpacity 
                                key={type} 
                                style={[styles.typeOption, selectedMealType === type && styles.activeTypeOption]}
                                onPress={() => setSelectedMealType(type)}
                            >
                                <Text style={[styles.typeText, selectedMealType === type && styles.activeTypeText, { fontSize: 12 }]}>
                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Basic Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Info</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Food Name</Text>
                    <Animated.View style={nameShakeStyle}>
                      <TextInput 
                          style={styles.input} 
                          placeholder="e.g. Nasi Goreng" 
                          placeholderTextColor="#666"
                          value={formData.name}
                          onChangeText={(t) => {
                            if (t.length > 16) {
                              triggerNameShake();
                              setFormData({...formData, name: t.slice(0, 16)});
                            } else {
                              setFormData({...formData, name: t});
                            }
                          }}
                          maxLength={17}
                      />
                    </Animated.View>
                    <Text style={{ color: "#666", fontSize: 11 }}>Max: 16 characters ({formData.name.length}/16)</Text>
                </View>
                {/* ... Rest of form ... */}

                <View style={styles.row}>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>Brand/Source</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. Generic" 
                            placeholderTextColor="#666"
                            value={formData.brand}
                            onChangeText={(t) => setFormData({...formData, brand: t.slice(0, 16)})}
                            maxLength={16}
                        />
                    </View>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>Serving Size</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="e.g. 1 porsi" 
                            placeholderTextColor="#666"
                            value={formData.servingSize}
                            onChangeText={(t) => setFormData({...formData, servingSize: t.slice(0, 10)})}
                            maxLength={10}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.typeSelector}>
                        {["local", "fastfood", "snack"].map(type => (
                            <TouchableOpacity 
                                key={type} 
                                style={[styles.typeOption, formData.type === type && styles.activeTypeOption]}
                                onPress={() => setFormData({...formData, type})}
                            >
                                <Text style={[styles.typeText, formData.type === type && styles.activeTypeText]}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Macros */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Calories (kcal)</Text>
                    <Animated.View style={shakeStyle}>
                      <TextInput 
                          style={[styles.input, styles.highlightInput]} 
                          placeholder="0" 
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={formData.calories}
                          onChangeText={(t) => {
                            const num = parseInt(t) || 0;
                            if (num > 3000) {
                              triggerShake();
                              setFormData({...formData, calories: "3000"});
                            } else {
                              setFormData({...formData, calories: t.replace(/[^0-9]/g, "")});
                            }
                          }}
                          maxLength={4}
                      />
                    </Animated.View>
                    <Text style={{ color: "#666", fontSize: 11 }}>Max: 3000 kcal</Text>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>Protein (g)</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="0" 
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={formData.protein}
                            onChangeText={(t) => setFormData({...formData, protein: t.replace(/[^0-9]/g, "").slice(0, 3)})}
                            maxLength={3}
                        />
                    </View>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>Carbs (g)</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="0" 
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={formData.carbs}
                            onChangeText={(t) => setFormData({...formData, carbs: t.replace(/[^0-9]/g, "").slice(0, 3)})}
                            maxLength={3}
                        />
                    </View>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>Fats (g)</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="0" 
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={formData.fats}
                            onChangeText={(t) => setFormData({...formData, fats: t.replace(/[^0-9]/g, "").slice(0, 3)})}
                            maxLength={3}
                        />
                    </View>
                </View>
            </View>

            {/* Image */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Image</Text>
                
                {/* Source Toggle */}
                <View style={styles.sourceToggle}>
                    <TouchableOpacity 
                        style={[styles.sourceOption, imageSourceType === "link" && styles.activeSourceOption]} 
                        onPress={() => setImageSourceType("link")}
                    >
                        <LinkIcon size={16} color={imageSourceType === "link" ? "#d3f660" : "#666"} />
                        <Text style={[styles.sourceText, imageSourceType === "link" && styles.activeSourceText]}>Image Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.sourceOption, imageSourceType === "upload" && styles.activeSourceOption]} 
                        onPress={() => setImageSourceType("upload")}
                    >
                        <Upload size={16} color={imageSourceType === "upload" ? "#d3f660" : "#666"} />
                        <Text style={[styles.sourceText, imageSourceType === "upload" && styles.activeSourceText]}>Upload Image</Text>
                    </TouchableOpacity>
                </View>

                {imageSourceType === "link" ? (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Image URL</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="https://..." 
                            placeholderTextColor="#666"
                            value={formData.image}
                            onChangeText={(t) => setFormData({...formData, image: t})}
                        />
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage} disabled={uploadingImage}>
                        {uploadingImage ? (
                            <ActivityIndicator color="#d3f660" />
                        ) : (
                            <View style={{alignItems: 'center', gap: 8}}>
                                <Upload size={32} color="#666" />
                                <Text style={styles.uploadText}>Tap to upload image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {formData.image ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: formData.image }} style={styles.previewImage} />
                        <TouchableOpacity 
                            style={styles.clearImageButton} 
                            onPress={() => setFormData(prev => ({ ...prev, image: "" }))}
                        >
                            <X size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>

        </Animated.ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#d3f660",
    minWidth: 44,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: 'black'
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d3f660",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  highlightInput: {
    borderColor: "rgba(211, 246, 96, 0.3)",
    backgroundColor: "rgba(211, 246, 96, 0.05)",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    padding: 4,
    borderRadius: 16,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTypeOption: {
    backgroundColor: "#2C2C2E",
  },
  typeText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTypeText: {
    color: "#d3f660",
  },
  previewContainer: {
    marginTop: 8,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
  },
  clearImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 12,
  },
  sourceToggle: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    padding: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  sourceOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeSourceOption: {
    backgroundColor: "#2C2C2E",
  },
  sourceText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  activeSourceText: {
    color: "#d3f660",
  },
  uploadArea: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    color: "#666",
    fontSize: 14,
  }
});
