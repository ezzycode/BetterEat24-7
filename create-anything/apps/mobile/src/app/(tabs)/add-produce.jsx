import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Camera, Video, X, Upload, Plus, Check } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function AddProduceScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price_per_unit: "",
    unit_type: "kg",
    quantity_available: "",
    harvest_date: "",
    expiry_date: "",
    is_organic: false,
  });

  // Mock farmer ID - in real app this would come from auth
  const farmerId = 1;

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Create produce mutation
  const createProduceMutation = useMutation({
    mutationFn: async (produceData) => {
      const response = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...produceData, farmer_id: farmerId }),
      });
      if (!response.ok) throw new Error("Failed to create produce");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-produce", farmerId] });
      resetForm();
      Alert.alert("Success", "Produce added successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to add produce");
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ produceId, file, mediaType, isPrimary }) => {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type:
          file.mimeType || (mediaType === "image" ? "image/jpeg" : "video/mp4"),
        name:
          file.fileName ||
          `${mediaType}_${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`,
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");
      const { url } = await uploadResponse.json();

      // Then save media record
      const mediaResponse = await fetch("/api/produce-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produce_id: produceId,
          media_url: url,
          media_type: mediaType,
          is_primary: isPrimary,
        }),
      });

      if (!mediaResponse.ok) throw new Error("Failed to save media");
      return mediaResponse.json();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      price_per_unit: "",
      unit_type: "kg",
      quantity_available: "",
      harvest_date: "",
      expiry_date: "",
      is_organic: false,
    });
    setSelectedFiles([]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newFiles = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        width: asset.width,
        height: asset.height,
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera permissions to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      const newFile = {
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        width: asset.width,
        height: asset.height,
      };
      setSelectedFiles((prev) => [...prev, newFile]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.price_per_unit ||
      !formData.quantity_available
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      // Create the produce first
      const newProduce = await createProduceMutation.mutateAsync(formData);

      // Upload media files
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadMediaMutation.mutateAsync({
          produceId: newProduce.id,
          file: file,
          mediaType: file.type,
          isPrimary: i === 0, // First file is primary
        });
      }
    } catch (error) {
      console.error("Error creating produce:", error);
    }
  };

  const unitTypes = [
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Pound (lb)", value: "lb" },
    { label: "Piece", value: "piece" },
    { label: "Bunch", value: "bunch" },
    { label: "Dozen", value: "dozen" },
    { label: "Liter", value: "liter" },
  ];

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <StatusBar style="dark" />

        {/* Header */}
        <View
          style={{
            backgroundColor: "white",
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}>
            Add Produce
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            List your farm produce for sale
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Basic Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Produce Name *
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="e.g., Fresh Tomatoes"
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: "#f9fafb",
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Category *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: category.id.toString(),
                      }))
                    }
                    style={{
                      backgroundColor:
                        formData.category_id === category.id.toString()
                          ? "#16a34a"
                          : "#f3f4f6",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formData.category_id === category.id.toString()
                            ? "white"
                            : "#374151",
                        fontWeight: "600",
                      }}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Describe your produce..."
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: "#f9fafb",
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Pricing & Quantity */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Pricing & Quantity
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Price per Unit *
                </Text>
                <TextInput
                  value={formData.price_per_unit}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, price_per_unit: text }))
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#f9fafb",
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Quantity Available *
                </Text>
                <TextInput
                  value={formData.quantity_available}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity_available: text,
                    }))
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#f9fafb",
                  }}
                />
              </View>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Unit Type *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {unitTypes.map((unit) => (
                  <TouchableOpacity
                    key={unit.value}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        unit_type: unit.value,
                      }))
                    }
                    style={{
                      backgroundColor:
                        formData.unit_type === unit.value
                          ? "#16a34a"
                          : "#f3f4f6",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formData.unit_type === unit.value
                            ? "white"
                            : "#374151",
                        fontWeight: "600",
                      }}
                    >
                      {unit.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Dates */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Dates
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Harvest Date
                </Text>
                <TextInput
                  value={formData.harvest_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, harvest_date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#f9fafb",
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Expiry Date
                </Text>
                <TextInput
                  value={formData.expiry_date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, expiry_date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: "#f9fafb",
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  is_organic: !prev.is_organic,
                }))
              }
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: formData.is_organic ? "#16a34a" : "#d1d5db",
                  backgroundColor: formData.is_organic
                    ? "#16a34a"
                    : "transparent",
                  marginRight: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {formData.is_organic && <Check size={12} color="white" />}
              </View>
              <Text style={{ fontSize: 14, color: "#374151" }}>
                This is organic produce
              </Text>
            </TouchableOpacity>
          </View>

          {/* Media Upload */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Photos & Videos
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 8,
                  paddingVertical: 16,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#e5e7eb",
                  borderStyle: "dashed",
                }}
              >
                <Camera size={24} color="#6b7280" />
                <Text
                  style={{ color: "#6b7280", marginTop: 8, fontWeight: "600" }}
                >
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 8,
                  paddingVertical: 16,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#e5e7eb",
                  borderStyle: "dashed",
                }}
              >
                <Upload size={24} color="#6b7280" />
                <Text
                  style={{ color: "#6b7280", marginTop: 8, fontWeight: "600" }}
                >
                  Choose Files
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {selectedFiles.map((file, index) => (
                  <View
                    key={index}
                    style={{ position: "relative", width: 80, height: 80 }}
                  >
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      {file.type === "image" ? (
                        <Image
                          source={{ uri: file.uri }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: "100%",
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Video size={24} color="#6b7280" />
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "#ef4444",
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <X size={12} color="white" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 2,
                          left: 2,
                          backgroundColor: "#16a34a",
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          Primary
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            padding: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createProduceMutation.isLoading}
            style={{
              backgroundColor: createProduceMutation.isLoading
                ? "#d1d5db"
                : "#16a34a",
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {createProduceMutation.isLoading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#6b7280"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: "#6b7280", fontWeight: "600", fontSize: 16 }}
                >
                  Adding...
                </Text>
              </>
            ) : (
              <>
                <Plus size={20} color="white" style={{ marginRight: 8 }} />
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  Add Produce
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
