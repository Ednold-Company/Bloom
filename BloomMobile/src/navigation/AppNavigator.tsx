import React from "react";
import { NavigationContainer, RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CalendarScreen from "../screens/CalendarScreen";
import SymptomsScreen from "../screens/SymptomsScreen";
import ChatScreen from "../screens/ChatScreen";
import InsightsScreen from "../screens/InsightsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useAuth } from "../context/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import api from "../services/api";
import { useQuery } from "@tanstack/react-query";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
type MainTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Symptoms: undefined;
  Chat: undefined;
  Insights: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "home",
  Calendar: "calendar",
  Symptoms: "pulse",
  Chat: "chatbubble",
  Insights: "bar-chart",
  Settings: "settings",
};

function TabBarIcon({
  routeName,
  color,
  size,
}: {
  routeName: keyof MainTabParamList;
  color: string;
  size: number;
}) {
  const iconName = iconMap[routeName] || "home";
  return <Ionicons name={iconName} size={size} color={color} />;
}

const tabScreenOptions = ({
  route,
}: {
  route: RouteProp<MainTabParamList, keyof MainTabParamList>;
}): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarActiveTintColor: "#ef7a9a",
  tabBarInactiveTintColor: "#9a7b8c",
  tabBarStyle: { backgroundColor: "#fff7f5", borderTopColor: "#f0d6df" },
  tabBarIcon: ({ color, size }) => (
    <TabBarIcon routeName={route.name} color={color} size={size} />
  ),
});

function MainTabs() {
  const { token } = useAuth();
  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cycles as Array<{ id: string }>;
    },
    enabled: !!token,
  });

  const showInsights = (cyclesQuery.data?.length ?? 0) >= 2;

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Symptoms" component={SymptomsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      {showInsights ? <Tab.Screen name="Insights" component={InsightsScreen} /> : null}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
