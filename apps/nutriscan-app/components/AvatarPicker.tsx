import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Alert, Platform, Text, ActivityIndicator, Modal, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, Check, ImageIcon as GalleryIcon } from "lucide-react-native";
import { api, getAuthToken } from "../api/client";

// Preset avatar URLs
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=d3f660",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Bella&backgroundColor=d3f660",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Charlie&backgroundColor=d3f660",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Max&backgroundColor=d3f660",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Luna&backgroundColor=d3f660",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Rocky&backgroundColor=d3f660",
];

interface AvatarPickerProps {
  currentImage?: string | null;
  onImageSelected: (uri: string) => void;
  size?: number;
  editable?: boolean;
  uploadImmediately?: boolean; // If true, upload to server. If false, just return local URI
}

// Get the base URL from api client
const getBaseUrl = () => {
  // Extract base URL without /api suffix
  return (api.defaults.baseURL || "").replace("/api", "");
};

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentImage,
  onImageSelected,
  size = 100,
  editable = true,
  uploadImmediately = true, // Default to true for backward compatibility
}) => {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setImage(currentImage);
    }
  }, [currentImage]);

  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    setUploading(true);
    try {
      const token = await getAuthToken();
      console.log("Upload: Token present:", !!token);
      
      if (!token) {
        // No token - just return local URI (for registration flow)
        console.log("No token available, returning local URI");
        return uri;
      }
      
      // Create FormData
      const formData = new FormData();
      
      // Get the filename from URI
      const filename = uri.split('/').pop() || 'avatar.jpg';
      
      // Determine the file type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Append file to FormData
      formData.append('avatar', {
        uri: uri,
        name: filename,
        type: type,
      } as any);

      console.log("Uploading avatar...");
      
      // Use axios with multipart/form-data and longer timeout
      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file uploads
        transformRequest: (data) => data, // Prevent axios from processing FormData
      });
      
      if (response.data?.status === 'success' && response.data?.data?.url) {
        console.log("Avatar uploaded successfully:", response.data.data.url);
        return response.data.data.url;
      } else {
        console.error("Upload failed:", response.data);
        // Fall back to local URI on failure
        return uri;
      }
    } catch (error: any) {
      console.error("Error uploading image:", error?.message || error);
      // Fall back to local URI on error
      return uri;
    } finally {
      setUploading(false);
    }
  };

  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      setShowModal(false);
      
      if (uploadImmediately) {
        // Upload to server and get URL (or fallback to local URI)
        const finalUri = await uploadImage(localUri);
        if (finalUri) {
          setImage(finalUri);
          onImageSelected(finalUri);
        }
      } else {
        // Just use local URI directly (for registration flow)
        setImage(localUri);
        onImageSelected(localUri);
      }
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setImage(presetUrl);
    onImageSelected(presetUrl);
    setShowModal(false);
  };

  const handlePress = () => {
    if (!editable || uploading) return;
    setShowModal(true);
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please allow access to your camera to take photos.");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await handleImageResult(result);
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const hasPermission = await requestPermission('gallery');
      if (!hasPermission) {
        Alert.alert("Permission Required", "Please allow access to your photo library to select photos.");
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      await handleImageResult(result);
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} disabled={!editable || uploading} activeOpacity={0.8}>
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
          {uploading ? (
            <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
              <ActivityIndicator size="small" color="#d3f660" />
            </View>
          ) : image ? (
            <Image source={{ uri: image }} style={[styles.image, { borderRadius: size / 2 }]} />
          ) : (
             <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
                <Camera size={size * 0.4} color="#666" />
             </View>
          )}

          {editable && !uploading && (
            <View style={styles.editBadge}>
              <Camera size={14} color="#000" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Preset Avatars */}
            <Text style={styles.sectionLabel}>Choose an avatar</Text>
            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((presetUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.presetAvatar,
                    image === presetUrl && styles.presetAvatarSelected,
                  ]}
                  onPress={() => handlePresetSelect(presetUrl)}
                >
                  <Image source={{ uri: presetUrl }} style={styles.presetImage} />
                  {image === presetUrl && (
                    <View style={styles.presetCheck}>
                      <Check size={10} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <View style={styles.actionIcon}>
                  <Camera size={20} color="#d3f660" />
                </View>
                <Text style={styles.actionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <View style={styles.actionIcon}>
                  <GalleryIcon size={20} color="#d3f660" />
                </View>
                <Text style={styles.actionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#333",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#d3f660",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0A0A0A",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
    fontWeight: "500",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  presetAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  presetAvatarSelected: {
    borderColor: "#d3f660",
    borderWidth: 3,
  },
  presetImage: {
    width: "100%",
    height: "100%",
  },
  presetCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#d3f660",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 12,
    fontSize: 12,
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(211, 246, 96, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

