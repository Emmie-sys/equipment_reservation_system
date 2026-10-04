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
    // Brand Primitives — #004643 (Deep Aegean Teal) & #F0EDE5 (Warm Cream) & #F26419 (Solar Orange)
    brandForestDark: '#004643',
    brandForestMid: '#005C58',
    brandForestVivid: '#007F7A',
    brandTealBase: '#004643',
    brandCreamBase: '#F0EDE5',
    brandOrange: '#F26419',
    brandOrangeLight: '#FB923C',
    brandOrangeDim: 'rgba(242, 100, 25, 0.16)',
    brandLilacBase: '#F0EDE5',
    brandLilacLight: '#FAF9F6',
    brandPlumDeep: '#004643',
    brandPlumMid: '#005C58',

    // Canvas & Solid Glass Surfaces — Apple HIG Dark
    canvasBg: '#011716',
    surfacePrimary: 'rgba(0, 70, 67, 0.40)',
    surfaceSecondary: 'rgba(0, 48, 46, 0.55)',
    surfaceCard: '#022423',
    surfaceElevated: '#043230',
    surfaceInput: 'rgba(0, 70, 67, 0.28)',

    // Specular Borders — lighter top, dimmer sides
    borderSubtle: 'rgba(240, 237, 229, 0.08)',
    borderMedium: 'rgba(240, 237, 229, 0.14)',
    borderStrong: 'rgba(240, 237, 229, 0.26)',
    borderInput: 'rgba(240, 237, 229, 0.18)',
    borderInputFocus: '#00A8A1',

    // Typography
    textPrimary: '#FAF9F6',
    textSecondary: '#D1CCC0',
    textMuted: '#8E8A80',
    textInverse: '#004643',

    // Telemetry & Status Badges
    status: {
      available: {
        bg: 'rgba(0, 127, 122, 0.22)',
        text: '#2DD4BF',
        border: 'rgba(0, 127, 122, 0.40)',
      },
      active: {
        bg: 'rgba(240, 237, 229, 0.14)',
        text: '#F0EDE5',
        border: 'rgba(240, 237, 229, 0.28)',
      },
      pending: {
        bg: 'rgba(242, 100, 25, 0.18)',
        text: '#FB923C',
        border: 'rgba(242, 100, 25, 0.38)',
      },
      maintenance: {
        bg: 'rgba(0, 70, 67, 0.35)',
        text: '#5EEAD4',
        border: 'rgba(0, 70, 67, 0.50)',
      },
      completed: {
        bg: 'rgba(240, 237, 229, 0.08)',
        text: '#CBD5E1',
        border: 'rgba(240, 237, 229, 0.18)',
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
        bg: 'rgba(0, 70, 67, 0.28)',
        color: '#2DD4BF',
        border: 'rgba(0, 127, 122, 0.40)',
      },
      orange: {
        bg: 'rgba(242, 100, 25, 0.22)',
        color: '#FB923C',
        border: 'rgba(242, 100, 25, 0.40)',
      },
      lilac: {
        bg: 'rgba(240, 237, 229, 0.14)',
        color: '#F0EDE5',
        border: 'rgba(240, 237, 229, 0.28)',
      },
      neutral: {
        bg: 'rgba(148, 163, 184, 0.14)',
        color: '#CBD5E1',
        border: 'rgba(203, 213, 225, 0.30)',
      },
      amber: {
        bg: 'rgba(242, 100, 25, 0.22)',
        color: '#FCD34D',
        border: 'rgba(242, 100, 25, 0.40)',
      },
      cyan: {
        bg: 'rgba(0, 127, 122, 0.22)',
        color: '#5EEAD4',
        border: 'rgba(0, 127, 122, 0.40)',
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
    // Brand Primitives — #004643 (Deep Aegean Teal) & #F0EDE5 (Warm Cream) & #F26419 (Solar Orange)
    brandForestDark: '#004643',
    brandForestMid: '#005C58',
    brandForestVivid: '#007F7A',
    brandTealBase: '#004643',
    brandCreamBase: '#F0EDE5',
    brandOrange: '#F26419',
    brandOrangeLight: '#FB923C',
    brandOrangeDim: 'rgba(242, 100, 25, 0.12)',
    brandLilacBase: '#004643',
    brandLilacLight: '#F0EDE5',
    brandPlumDeep: '#004643',
    brandPlumMid: '#005C58',

    // Canvas & Solid Surfaces (Light Mode — Crisp clean warm alabaster)
    canvasBg: '#F0EDE5',
    surfacePrimary: 'rgba(255, 255, 255, 0.90)',
    surfaceSecondary: 'rgba(245, 242, 236, 0.85)',
    surfaceCard: '#FFFFFF',
    surfaceElevated: '#FAF9F5',
    surfaceInput: '#FFFFFF',

    // Specular Borders
    borderSubtle: 'rgba(0, 70, 67, 0.08)',
    borderMedium: 'rgba(0, 70, 67, 0.15)',
    borderStrong: 'rgba(0, 70, 67, 0.28)',
    borderInput: 'rgba(0, 70, 67, 0.18)',
    borderInputFocus: '#007F7A',

    // Typography
    textPrimary: '#004643',
    textSecondary: '#1D4644',
    textMuted: '#5D7977',
    textInverse: '#FAF9F6',

    // Telemetry & Status Badges (Light Mode)
    status: {
      available: {
        bg: 'rgba(0, 70, 67, 0.12)',
        text: '#007F7A',
        border: 'rgba(0, 70, 67, 0.28)',
      },
      active: {
        bg: 'rgba(0, 70, 67, 0.10)',
        text: '#004643',
        border: 'rgba(0, 70, 67, 0.25)',
      },
      pending: {
        bg: 'rgba(242, 100, 25, 0.12)',
        text: '#C2410C',
        border: 'rgba(242, 100, 25, 0.30)',
      },
      maintenance: {
        bg: 'rgba(0, 70, 67, 0.10)',
        text: '#005C58',
        border: 'rgba(0, 70, 67, 0.26)',
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
        bg: 'rgba(0, 70, 67, 0.12)',
        color: '#007F7A',
        border: 'rgba(0, 70, 67, 0.26)',
      },
      orange: {
        bg: 'rgba(242, 100, 25, 0.14)',
        color: '#C2410C',
        border: 'rgba(242, 100, 25, 0.30)',
      },
      lilac: {
        bg: 'rgba(240, 237, 229, 0.60)',
        color: '#004643',
        border: 'rgba(0, 70, 67, 0.20)',
      },
      neutral: {
        bg: 'rgba(100, 116, 139, 0.10)',
        color: '#475569',
        border: 'rgba(100, 116, 139, 0.22)',
      },
      amber: {
        bg: 'rgba(242, 100, 25, 0.14)',
        color: '#C2410C',
        border: 'rgba(242, 100, 25, 0.30)',
      },
      cyan: {
        bg: 'rgba(0, 70, 67, 0.12)',
        color: '#007F7A',
        border: 'rgba(0, 70, 67, 0.25)',
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

