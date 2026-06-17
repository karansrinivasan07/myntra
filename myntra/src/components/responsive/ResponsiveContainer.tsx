import React from "react";
import { StyleSheet, ViewProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "../../hooks/useResponsive";

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  disableSafeArea?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  disableSafeArea = false,
  ...props
}) => {
  const { width } = useResponsive();

  const containerStyle = [
    styles.base,
    width >= 1280 && styles.desktopLimit,
    style,
  ];

  if (disableSafeArea) {
    return (
      <View style={containerStyle} {...props}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={["top", "bottom", "left", "right"]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  desktopLimit: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
  },
});

export default ResponsiveContainer;
