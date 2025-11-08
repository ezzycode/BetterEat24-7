import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  ShoppingCart,
  MapPin,
  Clock,
  Star,
} from "lucide-react-native";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);

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
    queryKey: ["produce", searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category_id", selectedCategory);

      const response = await fetch(`/api/produce?${params}`);
      if (!response.ok) throw new Error("Failed to fetch produce");
      return response.json();
    },
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.price_per_unit * item.quantity,
      0,
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const renderProduceItem = ({ item }) => {
    const primaryImage =
      item.media?.find((m) => m.is_primary && m.media_type === "image") ||
      item.media?.find((m) => m.media_type === "image");

    return (
      <View
        style={{
          backgroundColor: "white",
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Product Image */}
        <View
          style={{
            height: 200,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            position: "relative",
          }}
        >
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage.media_url }}
              style={{
                width: "100%",
                height: "100%",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
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
                borderTopRightRadius: 12,
              }}
            >
              <Text style={{ color: "#9ca3af" }}>No Image</Text>
            </View>
          )}
          {item.is_organic && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "#dcfce7",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{ color: "#166534", fontSize: 12, fontWeight: "600" }}
              >
                Organic
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          {/* Farmer Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MapPin size={16} color="#6b7280" />
            <Text style={{ color: "#6b7280", fontSize: 14, marginLeft: 4 }}>
              {item.farm_name || item.farmer_name}
            </Text>
          </View>

          {/* Harvest Date */}
          {item.harvest_date && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Clock size={16} color="#6b7280" />
              <Text style={{ color: "#6b7280", fontSize: 14, marginLeft: 4 }}>
                Harvested: {formatDate(item.harvest_date)}
              </Text>
            </View>
          )}

          {/* Price and Quantity */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}
              >
                ${item.price_per_unit}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14, marginLeft: 2 }}>
                /{item.unit_type}
              </Text>
            </View>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {item.quantity_available} {item.unit_type} available
            </Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={() => addToCart(item)}
            disabled={item.quantity_available === 0}
            style={{
              backgroundColor:
                item.quantity_available === 0 ? "#d1d5db" : "#16a34a",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: item.quantity_available === 0 ? "#6b7280" : "white",
                fontWeight: "600",
              }}
            >
              {item.quantity_available === 0 ? "Out of Stock" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}
            >
              FarmFresh
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Farm to Table Marketplace
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ position: "relative", marginRight: 12 }}>
              <ShoppingCart size={24} color="#6b7280" />
              {cart.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: "#ef4444",
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
              ${getCartTotal().toFixed(2)}
            </Text>
          </View>
        </View>

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory("")}
            style={{
              backgroundColor: selectedCategory === "" ? "#16a34a" : "#f3f4f6",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: selectedCategory === "" ? "white" : "#374151",
                fontWeight: "600",
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
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color:
                    selectedCategory === category.id.toString()
                      ? "white"
                      : "#374151",
                  fontWeight: "600",
                }}
              >
                {category.name} ({category.produce_count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Produce List */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ marginTop: 16, color: "#6b7280" }}>
            Loading fresh produce...
          </Text>
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
            No produce found matching your criteria.
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Try adjusting your search or filters.
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
