import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { isSmallPhone, isPhone, isTablet, isLargeTablet } from "../constants/breakpoints";

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Dynamic values check
    const isSmallPhoneActive = isSmallPhone(width);
    const isPhoneActive = isPhone(width);
    const isTabletActive = isTablet(width);
    const isLargeTabletActive = isLargeTablet(width);
    const orientation = width > height ? "landscape" : "portrait";

    // Typography scaling capped between 0.9x and 1.2x
    const fontScale = Math.min(Math.max(width / 375, 0.9), 1.2);
    const scaleFont = (size: number) => Math.round(size * fontScale);

    // Spacing scaling capped between 1.0x and 1.3x
    const spacingScale = Math.min(Math.max(width / 375, 1.0), 1.3);
    const spacing = {
      xs: Math.round(4 * spacingScale),
      sm: Math.round(8 * spacingScale),
      md: Math.round(16 * spacingScale),
      lg: Math.round(24 * spacingScale),
      xl: Math.round(32 * spacingScale),
    };

    return {
      width,
      height,
      isSmallPhone: isSmallPhoneActive,
      isPhone: isPhoneActive,
      isTablet: isTabletActive,
      isLargeTablet: isLargeTabletActive,
      orientation,
      scaleFont,
      spacing,
    };
  }, [width, height]);
};
export default useResponsive;
