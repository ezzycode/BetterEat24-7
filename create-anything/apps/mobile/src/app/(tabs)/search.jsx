import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Clock } from "lucide-react-native";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch produce with filters
  const { data: produce = [], isLoading } = useQuery({
    queryKey: ["search-produce", searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category_id", selectedCategory);

      const response = await fetch(`/api/produce?${params}`);
      if (!response.ok) throw new Error("Failed to fetch produce");
      return response.json();
    },
    enabled: searchTerm.length > 0 || selectedCategory.length > 0,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const renderProduceItem = ({ item }) => {
    const primaryImage =
      item.media?.find((m) => m.is_primary && m.media_type === "image") ||
      item.media?.find((m) => m.media_type === "image");

    return (
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          flexDirection: "row",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Product Image */}
        <View
          style={{
            width: 100,
            height: 100,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          }}
        >
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage.media_url }}
              style={{
                width: "100%",
                height: "100%",
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
              }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
              }}
            >
              <Text style={{ color: "#9ca3af", fontSize: 12 }}>No Image</Text>
            </View>
          )}
          {item.is_organic && (
            <View
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                backgroundColor: "#dcfce7",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: "#166534", fontSize: 10, fontWeight: "600" }}
              >
                Organic
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={{ flex: 1, padding: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{ color: "#6b7280", fontSize: 12, marginBottom: 6 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          {/* Farmer Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <MapPin size={12} color="#6b7280" />
            <Text style={{ color: "#6b7280", fontSize: 12, marginLeft: 4 }}>
              {item.farm_name || item.farmer_name}
            </Text>
          </View>

          {/* Price */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#16a34a" }}
              >
                ${item.price_per_unit}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginLeft: 2 }}>
                /{item.unit_type}
              </Text>
            </View>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>
              {item.quantity_available} available
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
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
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#16a34a",
            marginBottom: 16,
          }}
        >
          Search Produce
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search for fresh produce..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 16,
              color: "#111827",
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Category Filter */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Filter size={16} color="#6b7280" />
          <Text
            style={{
              color: "#6b7280",
              fontSize: 14,
              marginLeft: 4,
              fontWeight: "600",
            }}
          >
            Filter by category:
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedCategory("")}
            style={{
              backgroundColor: selectedCategory === "" ? "#16a34a" : "#f3f4f6",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                color: selectedCategory === "" ? "white" : "#374151",
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id.toString())}
              style={{
                backgroundColor:
                  selectedCategory === category.id.toString()
                    ? "#16a34a"
                    : "#f3f4f6",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color:
                    selectedCategory === category.id.toString()
                      ? "white"
                      : "#374151",
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      {!searchTerm && !selectedCategory ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Search size={48} color="#d1d5db" />
          <Text
            style={{
              fontSize: 18,
              color: "#6b7280",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Start typing to search for produce
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Or select a category to browse
          </Text>
        </View>
      ) : isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ marginTop: 16, color: "#6b7280" }}>Searching...</Text>
        </View>
      ) : produce.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 18, color: "#6b7280", textAlign: "center" }}>
            No produce found
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Try adjusting your search terms or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={produce}
          renderItem={renderProduceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
