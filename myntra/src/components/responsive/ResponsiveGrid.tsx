import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";

interface ResponsiveGridProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  gap?: number;
  phoneCols?: number;
  tabletCols?: number;
  largeTabletCols?: number;
  style?: ViewStyle;
  paddingHorizontal?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  data,
  renderItem,
  gap = 16,
  phoneCols = 2,
  tabletCols = 3,
  largeTabletCols = 4,
  style,
  paddingHorizontal = 15,
}) => {
  const { width: screenWidth, isTablet, isLargeTablet } = useResponsive();

  const cols = isLargeTablet ? largeTabletCols : isTablet ? tabletCols : phoneCols;
  
  // Gutters and container caps
  const totalContainerPadding = paddingHorizontal * 2;
  const contentWidth = Math.min(screenWidth, 1280) - totalContainerPadding;
  const totalGaps = gap * (cols - 1);
  const itemWidth = (contentWidth - totalGaps) / cols;

  return (
    <View style={[styles.gridContainer, style]}>
      {data.map((item, index) => {
        const isLastInRow = (index + 1) % cols === 0;
        return (
          <View
            key={item._id || item.id || index}
            style={{
              width: itemWidth,
              marginBottom: gap,
              marginRight: isLastInRow ? 0 : gap,
            }}
          >
            {renderItem(item, index)}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
});

export default ResponsiveGrid;
