/** @type {import('tailwindcss').Config} */
const argoCDThemeColors = {
  parkBlue: '#0f2733',
  primary: '#0dadea',
  secondary: '#f8fbfb',
  success: '#18be94',
  warning: '#f4c030',
  danger: '#e96d76',
  light: '#F8F9FA',
  dark: '#343A40',
  gray: '#6d7f8b',
};

module.exports = {
  corePlugins: {
    preflight: false,
  },
  prefix: 'ls-',
  content: [
    "./src/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: argoCDThemeColors,
    extend: {
    },
  },
  plugins: [],
}