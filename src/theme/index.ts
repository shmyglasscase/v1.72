export * from './colors';
export * from './spacing';

import { colors, lightTheme, darkTheme, type Theme } from './colors';
import { spacing, borderRadius, fontSize, fontWeight, lineHeight, shadows } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
  light: lightTheme,
  dark: darkTheme,
};

export type { Theme };
