import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = size => width / guidelineBaseWidth * size;
export const verticalScale = size => height / guidelineBaseHeight * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Font sizes
export const fontSize = {
  tiny: moderateScale(12),
  small: moderateScale(14),
  medium: moderateScale(16),
  large: moderateScale(18),
  xlarge: moderateScale(20),
  xxlarge: moderateScale(24),
  xxxlarge: moderateScale(28),
  title: moderateScale(32),
  huge: moderateScale(36),
};

// Spacing
export const spacing = {
  tiny: moderateScale(4),
  small: moderateScale(8),
  medium: moderateScale(16),
  large: moderateScale(24),
  xlarge: moderateScale(32),
  xxlarge: moderateScale(40),
};

// Border radius
export const borderRadius = {
  small: moderateScale(8),
  medium: moderateScale(12),
  large: moderateScale(16),
  xlarge: moderateScale(24),
  round: moderateScale(999),
};

// Icon sizes
export const iconSize = {
  small: moderateScale(16),
  medium: moderateScale(24),
  large: moderateScale(32),
  xlarge: moderateScale(40),
};

// Platform specific adjustments
export const platformSpecific = {
  paddingTop: Platform.select({
    ios: spacing.medium,
    android: spacing.small,
  }),
  paddingBottom: Platform.select({
    ios: spacing.medium,
    android: spacing.small,
  }),
};

// Screen dimensions
export const screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Responsive styles
export const responsiveStyles = {
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  card: {
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginVertical: spacing.small,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  button: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  input: {
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    fontSize: fontSize.medium,
  },
  title: {
    fontSize: fontSize.title,
    marginBottom: spacing.large,
  },
  subtitle: {
    fontSize: fontSize.large,
    marginBottom: spacing.medium,
  },
}; 