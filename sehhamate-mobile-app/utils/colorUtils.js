export const Colors = {
  // Primary colors - Dark theme
  primary: '#000000',
  secondary: '#1a1a1a',
  accent: '#00ff88',
  accentDark: '#00cc70',
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  // Border colors
  borderPrimary: '#2a2a2a',
  borderSecondary: '#404040',
  // Background colors
  backgroundPrimary: '#000000',
  backgroundSecondary: '#1a1a1a',
  backgroundCard: '#1a1a1a',
  backgroundCardSecondary: '#2a2a2a',
  // Status colors
  success: '#00ff88',
  warning: '#ffaa00',
  danger: '#ff4444',
  info: '#0088ff',
  // Activity colors
  activityRed: '#ff4444',
  activityBlue: '#0088ff',
  activityPurple: '#8844ff',
  activityGreen: '#00ff88',
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'safe':
      return Colors.success;
    case 'warning':
    case 'caution':
      return Colors.warning;
    case 'danger':
    case 'interaction detected':
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};

export const getRiskLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'low':
    case 'safe':
      return Colors.success;
    case 'medium':
    case 'caution':
      return Colors.warning;
    case 'high':
    case 'danger':
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};
