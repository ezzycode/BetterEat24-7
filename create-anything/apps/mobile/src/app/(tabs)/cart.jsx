import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { ShoppingCart, Plus, Minus, Trash2, Truck } from "lucide-react-native";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState([
    // Mock cart data - in real app this would come from state management
    {
      id: 1,
      name: "Fresh Tomatoes",
      price_per_unit: 3.5,
      unit_type: "kg",
      quantity: 2,
      farmer_name: "Green Valley Farm",
      media: [
        {
          media_url:
            "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400",
          media_type: "image",
          is_primary: true,
        },
      ],
    },
    {
      id: 2,
      name: "Organic Carrots",
      price_per_unit: 2.25,
      unit_type: "kg",
      quantity: 1,
      farmer_name: "Sunshine Organics",
      is_organic: true,
      media: [
        {
          media_url:
            "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
          media_type: "image",
          is_primary: true,
        },
      ],
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            setCartItems((prev) => prev.filter((item) => item.id !== id)),
        },
      ],
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price_per_unit * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      `Total: $${getCartTotal().toFixed(2)}\n\nProceed to checkout?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Checkout",
          onPress: () => {
            Alert.alert(
              "Success",
              "Order placed! A logistics company will deliver your produce soon.",
            );
            setCartItems([]);
          },
        },
      ],
    );
  };

  const renderCartItem = ({ item }) => {
    const primaryImage =
      item.media?.find((m) => m.is_primary && m.media_type === "image") ||
      item.media?.find((m) => m.media_type === "image");

    return (
      <View
        style={{
          backgroundColor: "white",
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Product Image */}
          <View
            style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }}
          >
            {primaryImage ? (
              <Image
                source={{ uri: primaryImage.media_url }}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
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
                  borderRadius: 8,
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
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{ color: "#166534", fontSize: 8, fontWeight: "600" }}
                >
                  Organic
                </Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={{ flex: 1 }}>
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
            <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>
              From {item.farmer_name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#16a34a" }}
                >
                  ${item.price_per_unit}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  per {item.unit_type}
                </Text>
              </View>

              {/* Quantity Controls */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    backgroundColor: "#f3f4f6",
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <Minus size={16} color="#6b7280" />
                </TouchableOpacity>

                <Text
                  style={{
                    marginHorizontal: 16,
                    fontSize: 16,
                    fontWeight: "600",
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    backgroundColor: "#16a34a",
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <Plus size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Total and Remove */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
              >
                Total: ${(item.price_per_unit * item.quantity).toFixed(2)}
              </Text>

              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={{
                  backgroundColor: "#fef2f2",
                  borderRadius: 6,
                  padding: 8,
                }}
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
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
          }}
        >
          <View>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}
            >
              Shopping Cart
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in
              your cart
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <ShoppingCart size={24} color="#16a34a" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#16a34a",
                marginTop: 4,
              }}
            >
              ${getCartTotal().toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <ShoppingCart size={64} color="#d1d5db" />
          <Text
            style={{
              fontSize: 20,
              color: "#6b7280",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Your cart is empty
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Add some fresh produce to get started!
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Delivery Info */}
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Truck size={20} color="#16a34a" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginLeft: 8,
                }}
              >
                Delivery Information
              </Text>
            </View>
            <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: 20 }}>
              Your produce will be delivered by our partner logistics company
              specializing in farm-fresh products. Delivery typically takes 1-2
              business days to ensure maximum freshness.
            </Text>
          </View>

          {/* Checkout Button */}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}
              >
                Total: ${getCartTotal().toFixed(2)}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              style={{
                backgroundColor: "#16a34a",
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <ShoppingCart
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
