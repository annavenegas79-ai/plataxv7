import { PaletteOptions } from '@mui/material/styles';

// Light mode palette
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#2D3277', // MercadoBlue
    light: '#4A5BDC',
    dark: '#1A1F4D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFE600', // MercadoYellow
    light: '#FFF066',
    dark: '#E6CF00',
    contrastText: '#000000',
  },
  success: {
    main: '#39B54A',
    light: '#6FD97E',
    dark: '#267D33',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#E53935',
    light: '#FF6B67',
    dark: '#AB000D',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFA000',
    light: '#FFC947',
    dark: '#C67100',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#0B79D0',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F5F5F5',
    100: '#EEEEEE',
    200: '#E0E0E0',
    300: '#CCCCCC',
    400: '#AAAAAA',
    500: '#999999',
    600: '#777777',
    700: '#555555',
    800: '#333333',
    900: '#111111',
    A100: '#F5F5F5',
    A200: '#EEEEEE',
    A400: '#AAAAAA',
    A700: '#555555',
  },
  text: {
    primary: '#333333',
    secondary: '#777777',
    disabled: '#AAAAAA',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 0, 0, 0.12)',
  },
};

// Dark mode palette
export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#4A5BDC', // Lighter version of MercadoBlue for dark mode
    light: '#7986E8',
    dark: '#2D3277',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFE600', // MercadoYellow
    light: '#FFF066',
    dark: '#E6CF00',
    contrastText: '#000000',
  },
  success: {
    main: '#4CAF50',
    light: '#80E27E',
    dark: '#087F23',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',
    light: '#FF7961',
    dark: '#BA000D',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFC107',
    light: '#FFF350',
    dark: '#C79100',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#0B79D0',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#2C2C2C',
    100: '#333333',
    200: '#444444',
    300: '#555555',
    400: '#666666',
    500: '#777777',
    600: '#888888',
    700: '#999999',
    800: '#AAAAAA',
    900: '#EEEEEE',
    A100: '#333333',
    A200: '#444444',
    A400: '#666666',
    A700: '#999999',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#777777',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: 'rgba(255, 255, 255, 0.7)',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(255, 255, 255, 0.12)',
  },
};