/**
 * Color palette for the audiobook player app
 * Centralized color definitions for easy maintenance and consistency
 */

export const LightColors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  
  // Text colors
  text: '#000',
  textSecondary: '#666',
  textTertiary: '#8E8E93',
  textLight: '#999',
  
  // Background colors
  background: '#F2F2F7',
  backgroundLight: '#FFF',
  backgroundCard: '#FFF',
  
  // UI element colors
  border: '#E5E5EA',
  divider: '#E5E5EA',
  placeholder: '#C7C7CC',
  
  // Accent colors
  blue: '#007AFF',
  blueLight: '#E3F2FD',
  blueDark: '#1976D2',
  red: '#FF3B30',
  green: '#34C759',
  
  // Player specific
  artworkBackground: '#E5F1FF',
  progressBar: '#007AFF',
  
  // Shadows
  shadow: '#000',
} as const;

export const DarkColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryDark: '#0051D5',
  
  // Text colors
  text: '#FFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#98989D',
  textLight: '#636366',
  
  // Background colors
  background: '#1C1C1E',
  backgroundLight: '#2C2C2E',
  backgroundCard: '#3A3A3C',
  
  // UI element colors
  border: '#38383A',
  divider: '#38383A',
  placeholder: '#48484A',
  
  // Accent colors
  blue: '#0A84FF',
  blueLight: '#1E3A5F',
  blueDark: '#64A9FF',
  red: '#FF453A',
  green: '#32D74B',
  
  // Player specific
  artworkBackground: '#1E3A5F',
  progressBar: '#0A84FF',
  
  // Shadows
  shadow: '#000',
} as const;

export type ColorScheme = typeof LightColors;
export type ColorKey = keyof ColorScheme;
