import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Chrome, Heart, Search, ShoppingBag, User } from "lucide-react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme";

export const ResponsiveSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { isLargeTablet } = useResponsive();

  // Show Sidebar ONLY when width >= 1024 (isLargeTablet is true)
  if (!isLargeTablet) return null;

  const navItems = [
    { name: "Home", route: "/", icon: Chrome },
    { name: "Categories", route: "/categories", icon: Search },
    { name: "Wishlist", route: "/wishlist", icon: Heart },
    { name: "Bag", route: "/bag", icon: ShoppingBag },
    { name: "Profile", route: "/profile", icon: User },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.colors.card, borderRightColor: theme.colors.border }]}>
      {/* Brand Logo header */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>MYNTRA</Text>
      </View>

      <View style={styles.navContainer}>
        {navItems.map((item) => {
          // Check active route matches
          const isActive =
            item.route === "/"
              ? pathname === "/" || pathname === "/index"
              : pathname.startsWith(item.route);

          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                isActive && { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => handleNavigate(item.route)}
            >
              <Icon size={22} color={isActive ? theme.colors.primary : theme.colors.textMuted} />
              <Text
                style={[
                  styles.navText,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.text,
                    fontWeight: isActive ? "bold" : "normal",
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    height: "100%",
    borderRightWidth: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  logoContainer: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  navContainer: {
    gap: 10,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 15,
  },
  navText: {
    fontSize: 15,
  },
});

export default ResponsiveSidebar;
