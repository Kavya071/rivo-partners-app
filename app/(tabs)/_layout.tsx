import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import Icon from "@/components/Icon";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00D084",
        tabBarInactiveTintColor: "#71717A",
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 1,
          borderTopColor: "#27272A",
          elevation: 0,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#000000" },
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "briefcase" : "briefcase-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Icon name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
