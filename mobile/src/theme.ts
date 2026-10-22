/**
 * RESERViT Mobile Design Tokens
 * Institutional Design System: #008080 (Teal) & #FFFAFA (Snow White) with #F26419 (Solar Orange)
 * Apple HIG design principles, Chirp typography, minimal professional neutral shadows.
 * Supports dynamic Dark Mode and Light Mode governed by system default.
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
    // Brand Primitives — #008080 (Teal) & #FFFAFA (Snow White) & #F26419 (Solar Orange)
    brandForestDark: '#004D4D',
    brandForestMid: '#008080',
    brandForestVivid: '#00A0A0',
    brandTealBase: '#008080',
    brandCreamBase: '#FFFAFA',
    brandOrange: '#F26419',
    brandOrangeLight: '#FB923C',
    brandOrangeDim: 'rgba(242, 100, 25, 0.16)',
    brandLilacBase: '#FFFAFA',
    brandLilacLight: '#FFFFFF',
    brandPlumDeep: '#008080',
    brandPlumMid: '#004D4D',

    // Canvas & Solid Glass Surfaces — Apple HIG Dark
    canvasBg: '#001414',
    surfacePrimary: 'rgba(0, 28, 28, 0.60)',
    surfaceSecondary: 'rgba(0, 20, 20, 0.50)',
    surfaceCard: '#001a1a',
    surfaceElevated: '#002424',
    surfaceInput: 'rgba(0, 40, 40, 0.35)',

    // Specular Borders — lighter top, dimmer sides
    borderSubtle: 'rgba(255, 250, 250, 0.08)',
    borderMedium: 'rgba(255, 250, 250, 0.14)',
    borderStrong: 'rgba(255, 250, 250, 0.26)',
    borderInput: 'rgba(255, 250, 250, 0.18)',
    borderInputFocus: '#00A0A0',

    // Typography
    textPrimary: '#FFFAFA',
    textSecondary: '#D1CCC0',
    textMuted: '#8E8A80',
    textInverse: '#004D4D',

    // Telemetry & Status Badges
    status: {
      available: {
        bg: 'rgba(0, 128, 128, 0.22)',
        text: '#2DD4BF',
        border: 'rgba(0, 128, 128, 0.40)',
      },
      active: {
        bg: 'rgba(255, 250, 250, 0.14)',
        text: '#FFFAFA',
        border: 'rgba(255, 250, 250, 0.28)',
      },
      pending: {
        bg: 'rgba(242, 100, 25, 0.18)',
        text: '#FB923C',
        border: 'rgba(242, 100, 25, 0.38)',
      },
      maintenance: {
        bg: 'rgba(0, 77, 77, 0.35)',
        text: '#5EEAD4',
        border: 'rgba(0, 77, 77, 0.50)',
      },
      completed: {
        bg: 'rgba(255, 250, 250, 0.08)',
        text: '#CBD5E1',
        border: 'rgba(255, 250, 250, 0.18)',
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
        bg: 'rgba(0, 128, 128, 0.28)',
        color: '#2DD4BF',
        border: 'rgba(0, 128, 128, 0.40)',
      },
      orange: {
        bg: 'rgba(242, 100, 25, 0.22)',
        color: '#FB923C',
        border: 'rgba(242, 100, 25, 0.40)',
      },
      lilac: {
        bg: 'rgba(255, 250, 250, 0.14)',
        color: '#FFFAFA',
        border: 'rgba(255, 250, 250, 0.28)',
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
        bg: 'rgba(0, 128, 128, 0.22)',
        color: '#5EEAD4',
        border: 'rgba(0, 128, 128, 0.40)',
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
    // Brand Primitives — #008080 (Teal) & #FFFAFA (Snow White) & #F26419 (Solar Orange)
    brandForestDark: '#004D4D',
    brandForestMid: '#008080',
    brandForestVivid: '#008080',
    brandTealBase: '#008080',
    brandCreamBase: '#FFFAFA',
    brandOrange: '#F26419',
    brandOrangeLight: '#FB923C',
    brandOrangeDim: 'rgba(242, 100, 25, 0.12)',
    brandLilacBase: '#008080',
    brandLilacLight: '#FFFAFA',
    brandPlumDeep: '#008080',
    brandPlumMid: '#004D4D',

    // Canvas & Solid Surfaces (Light Mode — Crisp Clean Snow White)
    canvasBg: '#FFFAFA',
    surfacePrimary: 'rgba(255, 255, 255, 0.84)',
    surfaceSecondary: 'rgba(255, 250, 250, 0.70)',
    surfaceCard: '#FFFFFF',
    surfaceElevated: '#FFFAFA',
    surfaceInput: '#FFFFFF',

    // Specular Borders
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    borderMedium: 'rgba(0, 0, 0, 0.10)',
    borderStrong: 'rgba(0, 0, 0, 0.18)',
    borderInput: 'rgba(0, 0, 0, 0.12)',
    borderInputFocus: '#008080',

    // Typography
    textPrimary: '#004D4D',
    textSecondary: '#006666',
    textMuted: '#5C7A7A',
    textInverse: '#FFFAFA',

    // Telemetry & Status Badges (Light Mode)
    status: {
      available: {
        bg: 'rgba(0, 128, 128, 0.10)',
        text: '#008080',
        border: 'rgba(0, 128, 128, 0.25)',
      },
      active: {
        bg: 'rgba(0, 128, 128, 0.08)',
        text: '#004D4D',
        border: 'rgba(0, 128, 128, 0.20)',
      },
      pending: {
        bg: 'rgba(242, 100, 25, 0.12)',
        text: '#C2410C',
        border: 'rgba(242, 100, 25, 0.30)',
      },
      maintenance: {
        bg: 'rgba(0, 128, 128, 0.10)',
        text: '#006666',
        border: 'rgba(0, 128, 128, 0.24)',
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
        bg: 'rgba(0, 128, 128, 0.10)',
        color: '#008080',
        border: 'rgba(0, 128, 128, 0.22)',
      },
      orange: {
        bg: 'rgba(242, 100, 25, 0.14)',
        color: '#C2410C',
        border: 'rgba(242, 100, 25, 0.30)',
      },
      lilac: {
        bg: 'rgba(0, 128, 128, 0.08)',
        color: '#008080',
        border: 'rgba(0, 128, 128, 0.20)',
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
        bg: 'rgba(0, 128, 128, 0.10)',
        color: '#008080',
        border: 'rgba(0, 128, 128, 0.22)',
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
