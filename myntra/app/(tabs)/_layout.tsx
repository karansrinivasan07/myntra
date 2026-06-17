import { Tabs } from 'expo-router';
import React from 'react';
import { Chrome, Heart, Search, ShoppingBag, User } from 'lucide-react-native';
import { useTheme } from '@/src/theme';
import { View } from 'react-native';
import { useResponsive } from '@/src/hooks/useResponsive';
import ResponsiveSidebar from '@/src/components/responsive/ResponsiveSidebar';

export default function TabLayout() {
  const { theme } = useTheme();
  const { isLargeTablet } = useResponsive();

  return (
    <View style={{ flex: 1, flexDirection: isLargeTablet ? 'row' : 'column' }}>
      {isLargeTablet && <ResponsiveSidebar />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textMuted,
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
              display: isLargeTablet ? 'none' : 'flex',
            },
            headerShown: false,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color ,size}) => <Chrome size={size} color={color}/>,
            }}
          />
          <Tabs.Screen
            name="categories"
            options={{
              title: 'Categories',
              tabBarIcon: ({ color ,size}) => <Search size={size} color={color}/>,
            }}
          />
          <Tabs.Screen
            name="wishlist"
            options={{
              title: 'Wishlist',
              tabBarIcon: ({ color ,size}) => <Heart size={size} color={color}/>,
            }}
          />
          <Tabs.Screen
            name="bag"
            options={{
              title: 'Bag',
              tabBarIcon: ({ color ,size}) => <ShoppingBag size={size} color={color}/>,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color ,size}) => <User size={size} color={color}/>,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
