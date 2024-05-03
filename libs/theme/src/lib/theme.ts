import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    900: '#E56900',
    800: '#E56900',
    700: '#E56900',
    600: '#E56900',
    500: '#FF7602',
    400: '#FFA152',
    300: '#FFA152',
    200: '#FFA152',
    100: '#FFE0C6',
  },
  secondary: {
    900: '#24303E',
    800: '#24303E',
    700: '#24303E',
    600: '#24303E',
    500: '#24303E',
    400: '#3C5067',
    300: '#3C5067',
    200: '#96B3D0',
    100: '#E4EDF6',
  },
  bgLight: '#EAE7DD',
  bgDark: '#24303E',
  neutrals: {
    900: '#000000',
    800: '#000000',
    700: '#000000',
    600: '#000000',
    500: '#404040',
    400: '#666666',
    300: '#C7C7C7',
    200: '#E1E1E1',
    100: '#F6F6F7',
  },
};

const fonts = {
  body: 'Roboto, sans-serif',
  heading: 'Roboto, sans-serif',
  mono: 'Menlo, monospace',
};

export const theme = extendTheme({
  colors,
  fonts,
});
