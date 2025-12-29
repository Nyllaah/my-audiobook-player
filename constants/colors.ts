/**
 * Color palette for the audiobook player app
 * Centralized color definitions for easy maintenance and consistency
 */

import { Platform } from 'react-native';

export const LightColors = {
  // Primary colors
  primaryOrange: '#ff683b',
  primaryVanilla: '#ffe7c2',
  primaryBlue: '#002b64',
  
  // Text colors
  text: '#000',
  textSecondary: '#666',
  textTertiary: '#8E8E93',
  textLight: '#999',
  
  // Background colors
  background: '#F2F2F7',
  backgroundLight: '#FFF',
  
  // UI element colors
  border: '#E5E5EA',
  divider: '#E5E5EA',
  placeholder: '#C7C7CC',
  
  // Accent colors
  red: '#FF3B30',
  green: '#34C759',
  white: '#FFF',
  
  // Shadows
  shadow: '#000',
} as const;

export const DarkColors = {
  // Primary colors
  primaryOrange: '#ff683b',
  primaryVanilla: '#ffe7c2',
  primaryBlue: '#002b64',
  
  // Text colors
  text: '#FFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#98989D',
  textLight: '#636366',
  
  // Background colors
  background: '#1C1C1E',
  backgroundLight: '#2C2C2E',
  
  // UI element colors
  border: '#38383A',
  divider: '#38383A',
  placeholder: '#48484A',
  
  // Accent colors
  red: '#FF453A',
  green: '#32D74B',
  white: '#FFF',
  
  // Shadows
  shadow: '#000',
} as const;

export type ColorScheme = typeof LightColors;
export type ColorKey = keyof ColorScheme;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
