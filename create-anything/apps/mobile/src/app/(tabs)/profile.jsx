import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Settings,
  ShoppingBag,
  Truck,
  Star,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userType, setUserType] = useState("customer"); // 'farmer' or 'customer'

  // Mock user data
  const userData = {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    userType: userType,
    farmName: userType === "farmer" ? "Green Valley Farm" : null,
    totalOrders: 12,
    totalSales: userType === "farmer" ? 156 : null,
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Alert.alert("Logged out", "You have been logged out successfully.");
        },
      },
    ]);
  };

  const switchUserType = () => {
    Alert.alert(
      "Switch Account Type",
      `Switch to ${userType === "farmer" ? "Customer" : "Farmer"} account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: () => {
            setUserType(userType === "farmer" ? "customer" : "farmer");
          },
        },
      ],
    );
  };

  const menuItems = [
    {
      icon: ShoppingBag,
      title: userType === "farmer" ? "My Produce" : "Order History",
      subtitle:
        userType === "farmer" ? "Manage your listings" : "View past orders",
      onPress: () =>
        Alert.alert("Coming Soon", "This feature will be available soon!"),
    },
    {
      icon: Truck,
      title: "Delivery Tracking",
      subtitle: "Track your deliveries",
      onPress: () =>
        Alert.alert("Coming Soon", "This feature will be available soon!"),
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      subtitle:
        userType === "farmer" ? "Customer feedback" : "Rate your purchases",
      onPress: () =>
        Alert.alert("Coming Soon", "This feature will be available soon!"),
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: "Account preferences",
      onPress: () =>
        Alert.alert("Coming Soon", "This feature will be available soon!"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingTop: insets.top + 16,
          paddingBottom: 24,
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
          Profile
        </Text>

        {/* User Info Card */}
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#16a34a",
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <User size={24} color="white" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}
              >
                {userData.name}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}>
                {userData.email}
              </Text>
              <View
                style={{
                  backgroundColor:
                    userType === "farmer" ? "#dcfce7" : "#dbeafe",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: userType === "farmer" ? "#166534" : "#1e40af",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {userType === "farmer" ? "Farmer" : "Customer"}
                </Text>
              </View>
            </View>
          </View>

          {userData.farmName && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Farm Name
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>
                {userData.farmName}
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#16a34a" }}
              >
                {userType === "farmer"
                  ? userData.totalSales
                  : userData.totalOrders}
              </Text>
              <Text
                style={{ color: "#6b7280", fontSize: 12, textAlign: "center" }}
              >
                {userType === "farmer" ? "Total Sales" : "Orders Placed"}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#16a34a" }}
              >
                4.8
              </Text>
              <Text
                style={{ color: "#6b7280", fontSize: 12, textAlign: "center" }}
              >
                Rating
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <item.icon size={20} color="#6b7280" />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 14 }}>
                  {item.subtitle}
                </Text>
              </View>

              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={switchUserType}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#dbeafe",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <User size={20} color="#2563eb" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 2,
                }}
              >
                Switch to {userType === "farmer" ? "Customer" : "Farmer"}
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>
                Change account type
              </Text>
            </View>

            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#fef2f2",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <LogOut size={20} color="#dc2626" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#dc2626",
                  marginBottom: 2,
                }}
              >
                Logout
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>
                Sign out of your account
              </Text>
            </View>

            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View
          style={{ backgroundColor: "white", borderRadius: 12, padding: 16 }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            About FarmFresh
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: 20 }}>
            Connecting farmers directly with customers for the freshest produce.
            Our logistics partners ensure your farm-fresh goods arrive at your
            doorstep quickly and safely.
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
