import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, Plus, Trash2, Edit2, ChevronLeft } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { GlowBackground } from "../../components/GlowBackground";

export default function FoodCatalog() {
  const router = useRouter();
  const { user } = useAuth();
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, local, fastfood, snack
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/foods", {
        params: {
          type: filter === "all" ? undefined : filter,
          search: search || undefined
        }
      });
      setFoods(res.data.data);
    } catch (e) {
      console.log("Error fetching foods", e);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [fetchFoods])
  );

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      "Delete Food",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/foods/${id}`);
              fetchFoods();
            } catch (e) {
              Alert.alert("Error", "Failed to delete food");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={styles.foodItem} 
        activeOpacity={0.7}
        onPress={() => (isAdmin || item.createdBy === user?.id) ? router.push({ pathname: "/food-catalog/form", params: { id: item.id } }) : null}
    >
      <Image 
        source={{ uri: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" }} 
        style={styles.foodImage} 
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodBrand}>{item.brand || "Generic"} • {item.servingSize}</Text>
        <View style={styles.macrosRow}>
            <Text style={styles.macroText}><Text style={{color: "#ef4444"}}>P: {item.protein}g</Text></Text>
            <Text style={styles.macroText}><Text style={{color: "#f59e0b"}}>C: {item.carbs}g</Text></Text>
            <Text style={styles.macroText}><Text style={{color: "#3b82f6"}}>F: {item.fats}g</Text></Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.caloriesText}>{item.calories}</Text>
        <Text style={styles.kcalLabel}>kcal</Text>
        
        {(isAdmin || item.createdBy === user?.id) && (
            <View style={styles.adminActions}>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionButton}>
                    <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push({ pathname: "/food-catalog/form", params: { id: item.id } })} style={[styles.actionButton, { backgroundColor: "rgba(211, 246, 96, 0.1)", marginLeft: 8 }]}>
                    <Edit2 size={16} color="#d3f660" />
                </TouchableOpacity>
            </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <GlowBackground glowPosition="top-center" intensity={0.2} style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Catalog</Text>
        {isAdmin && (
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/food-catalog/form")}>
                <Plus size={24} color="black" />
            </TouchableOpacity>
        )}
      </View>

      {/* Search & Filter */}
      <View style={styles.controls}>
        <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search foods..."
                placeholderTextColor="#666"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={fetchFoods}
            />
        </View>
        
        <View style={styles.tabs}>
             {["all", "local", "fastfood", "snack"].map((t) => (
                 <TouchableOpacity 
                    key={t} 
                    style={[styles.tab, filter === t && styles.activeTab]}
                    onPress={() => setFilter(t)}
                 >
                     <Text style={[styles.tabText, filter === t && styles.activeTabText]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                     </Text>
                 </TouchableOpacity>
             ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            !loading ? (
                <Text style={styles.emptyText}>No food items found.</Text>
            ) : (
                <ActivityIndicator color="#d3f660" style={{marginTop: 50}} />
            )
        }
      />
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
  addButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#d3f660", // Primary
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  activeTab: {
    backgroundColor: "rgba(211, 246, 96, 0.1)",
    borderColor: "#d3f660",
  },
  tabText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#d3f660",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  foodItem: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  macrosRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroText: {
    fontSize: 11,
    fontWeight: "500",
  },
  rightContent: {
    alignItems: "flex-end",
    gap: 4,
  },
  caloriesText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  kcalLabel: {
    fontSize: 11,
    color: "#666",
  },
  adminActions: {
    marginTop: 4,
  },
  actionButton: {
    padding: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  }
});
