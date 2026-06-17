export const BREAKPOINTS = {
  PHONE_SMALL: 360,
  PHONE: 768,
  TABLET: 768,
  LARGE_TABLET: 1024,
};

export const isSmallPhone = (width: number): boolean => width < BREAKPOINTS.PHONE_SMALL;
export const isPhone = (width: number): boolean => width < BREAKPOINTS.PHONE;
export const isTablet = (width: number): boolean => width >= BREAKPOINTS.TABLET;
export const isLargeTablet = (width: number): boolean => width >= BREAKPOINTS.LARGE_TABLET;
