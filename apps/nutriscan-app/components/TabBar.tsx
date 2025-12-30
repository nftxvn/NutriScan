import { View, Text, TouchableOpacity, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, BarChart2, User, Plus } from "lucide-react-native";
import { BlurView } from "expo-blur";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-8 left-0 right-0 px-6 flex-row items-center justify-between pointer-events-none">
      <View
        className="flex-1 h-16 bg-[#2C2C2E]/90 border border-gray-700 rounded-2xl flex-row justify-between items-center px-6 shadow-2xl pointer-events-auto"
        style={{ overflow: 'hidden' }}
      >
        {Platform.OS === 'ios' && (
             <BlurView intensity={20} tint="dark" className="absolute inset-0" />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let Icon = Home;
          let label = "Home";

          if (route.name === "index") {
             Icon = Home;
             label = "Home";
          } else if (route.name === "analytics") {
             Icon = BarChart2;
             label = "Analytics";
          } else if (route.name === "profile") {
             Icon = User;
             label = "Profile";
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              className="flex-col items-center justify-center gap-1 w-16"
            >
              <Icon
                size={24}
                color={isFocused ? "#d3f660" : "#A0A0A0"}
                fill={isFocused && route.name === 'index' ? "#d3f660" : 'transparent'}
              />
              <Text
                className={`text-[10px] font-medium ${
                  isFocused ? "text-primary" : "text-gray-500"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity className="ml-4 w-16 h-16 rounded-2xl bg-[#1C1C1E] border border-gray-700 items-center justify-center shadow-2xl pointer-events-auto active:scale-95 transition-all">
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
