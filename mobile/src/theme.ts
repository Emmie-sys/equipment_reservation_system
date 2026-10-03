/**
 * RESERViT Mobile Design Tokens
 * Rebranded institutional design system: #09381F (Forest Green) & #E6D4E6 (Muted Lilac)
 * ZERO gradients, solid clean Apple-inspired surfaces, Chirp typography, and unified harmonious icon palettes.
 * Supports dynamic Dark Mode and Light Mode.
 */

const typography = {
  fonts: {
    regular: 'Chirp',
    medium: 'Chirp-Medium',
    semiBold: 'Chirp-SemiBold',
    bold: 'Chirp-Bold',
    heavy: 'Chirp-Heavy',
  },
  fontFamilySans: 'Chirp',
  fontFamilyMono: 'monospace',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 28,
    hero: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const darkTheme = {
  isDark: true,
  mode: 'dark' as const,
  colors: {
    // Brand Primitives
    brandForestDark: '#09381F',
    brandForestMid: '#155E38',
    brandForestVivid: '#1B6A41',
    brandLilacBase: '#E6D4E6',
    brandLilacLight: '#F4EBF4',
    brandPlumDeep: '#5A2D5C',
    brandPlumMid: '#7E4181',

    // Canvas & Solid Glass Surfaces (Zero Gradients)
    canvasBg: '#05130A',
    surfacePrimary: 'rgba(10, 33, 20, 0.78)',
    surfaceSecondary: 'rgba(17, 45, 30, 0.58)',
    surfaceCard: '#0A2616',
    surfaceElevated: '#113520',
    surfaceInput: 'rgba(9, 56, 31, 0.45)',

    // Specular Borders
    borderSubtle: 'rgba(230, 212, 230, 0.10)',
    borderMedium: 'rgba(230, 212, 230, 0.18)',
    borderStrong: 'rgba(230, 212, 230, 0.32)',
    borderInput: 'rgba(230, 212, 230, 0.20)',
    borderInputFocus: '#E6D4E6',

    // Typography
    textPrimary: '#FAF8FB',
    textSecondary: '#C8BFCB',
    textMuted: '#857D87',
    textInverse: '#09381F',

    // Telemetry & Status Badges
    status: {
      available: {
        bg: 'rgba(27, 106, 65, 0.22)',
        text: '#34D399',
        border: 'rgba(27, 106, 65, 0.40)',
      },
      active: {
        bg: 'rgba(230, 212, 230, 0.16)',
        text: '#E6D4E6',
        border: 'rgba(230, 212, 230, 0.32)',
      },
      pending: {
        bg: 'rgba(180, 115, 20, 0.18)',
        text: '#FBBF24',
        border: 'rgba(180, 115, 20, 0.34)',
      },
      maintenance: {
        bg: 'rgba(90, 45, 92, 0.25)',
        text: '#D8B4E2',
        border: 'rgba(90, 45, 92, 0.45)',
      },
      completed: {
        bg: 'rgba(230, 212, 230, 0.08)',
        text: '#CBD5E1',
        border: 'rgba(230, 212, 230, 0.18)',
      },
      rejected: {
        bg: 'rgba(225, 29, 72, 0.16)',
        text: '#FB7185',
        border: 'rgba(225, 29, 72, 0.36)',
      },
    },

    // Harmonious Icon Variants (Zero clashing colors)
    icons: {
      forest: {
        bg: 'rgba(27, 106, 65, 0.20)',
        color: '#34D399',
        border: 'rgba(27, 106, 65, 0.38)',
      },
      lilac: {
        bg: 'rgba(90, 45, 92, 0.24)',
        color: '#E6D4E6',
        border: 'rgba(90, 45, 92, 0.42)',
      },
      neutral: {
        bg: 'rgba(230, 212, 230, 0.10)',
        color: '#CBD5E1',
        border: 'rgba(230, 212, 230, 0.20)',
      },
    },
  },

  typography,
  radius,
  spacing,
};

export const lightTheme = {
  isDark: false,
  mode: 'light' as const,
  colors: {
    // Brand Primitives
    brandForestDark: '#09381F',
    brandForestMid: '#155E38',
    brandForestVivid: '#1B6A41',
    brandLilacBase: '#5A2D5C',
    brandLilacLight: '#F4EBF4',
    brandPlumDeep: '#5A2D5C',
    brandPlumMid: '#7E4181',

    // Canvas & Solid Surfaces (Light Mode — Crisp clean)
    canvasBg: '#F7F5F8',
    surfacePrimary: 'rgba(255, 255, 255, 0.94)',
    surfaceSecondary: 'rgba(246, 241, 247, 0.90)',
    surfaceCard: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceInput: '#FFFFFF',

    // Specular Borders
    borderSubtle: 'rgba(9, 56, 31, 0.08)',
    borderMedium: 'rgba(9, 56, 31, 0.15)',
    borderStrong: 'rgba(9, 56, 31, 0.28)',
    borderInput: 'rgba(9, 56, 31, 0.18)',
    borderInputFocus: '#1B6A41',

    // Typography
    textPrimary: '#092615',
    textSecondary: '#2C4335',
    textMuted: '#6B7C71',
    textInverse: '#FAF8FB',

    // Telemetry & Status Badges (Light Mode)
    status: {
      available: {
        bg: 'rgba(22, 163, 74, 0.12)',
        text: '#15803d',
        border: 'rgba(22, 163, 74, 0.30)',
      },
      active: {
        bg: 'rgba(90, 45, 92, 0.10)',
        text: '#5A2D5C',
        border: 'rgba(90, 45, 92, 0.28)',
      },
      pending: {
        bg: 'rgba(217, 119, 6, 0.12)',
        text: '#b45309',
        border: 'rgba(217, 119, 6, 0.30)',
      },
      maintenance: {
        bg: 'rgba(109, 40, 217, 0.10)',
        text: '#6d28d9',
        border: 'rgba(109, 40, 217, 0.28)',
      },
      completed: {
        bg: 'rgba(100, 116, 139, 0.12)',
        text: '#475569',
        border: 'rgba(100, 116, 139, 0.25)',
      },
      rejected: {
        bg: 'rgba(225, 29, 72, 0.12)',
        text: '#be123c',
        border: 'rgba(225, 29, 72, 0.30)',
      },
    },

    // Harmonious Icon Variants (Light Mode)
    icons: {
      forest: {
        bg: 'rgba(27, 106, 65, 0.14)',
        color: '#155E38',
        border: 'rgba(27, 106, 65, 0.30)',
      },
      lilac: {
        bg: 'rgba(90, 45, 92, 0.12)',
        color: '#5A2D5C',
        border: 'rgba(90, 45, 92, 0.28)',
      },
      neutral: {
        bg: 'rgba(100, 116, 139, 0.10)',
        color: '#475569',
        border: 'rgba(100, 116, 139, 0.22)',
      },
    },
  },

  typography,
  radius,
  spacing,
};

export type Theme = {
  isDark: boolean;
  mode: 'dark' | 'light';
  colors: typeof darkTheme.colors;
  typography: typeof typography;
  radius: typeof radius;
  spacing: typeof spacing;
};

export const theme: Theme = darkTheme;

