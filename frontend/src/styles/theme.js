import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
            secondary: { main: '#EC4899', light: '#F472B6', dark: '#DB2777' },
            success: { main: '#10B981', light: '#34D399', dark: '#059669' },
            warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
            error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
            info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
            background: { default: '#0F172A', paper: '#1E293B' },
            text: { primary: '#F1F5F9', secondary: '#94A3B8' },
          }
        : {
            primary: { main: '#4F46E5', light: '#6366F1', dark: '#4338CA' },
            secondary: { main: '#DB2777', light: '#EC4899', dark: '#BE185D' },
            success: { main: '#059669', light: '#10B981', dark: '#047857' },
            warning: { main: '#D97706', light: '#F59E0B', dark: '#B45309' },
            error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C' },
            info: { main: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
            background: { default: '#F1F5F9', paper: '#FFFFFF' },
            text: { primary: '#1E293B', secondary: '#64748B' },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(148, 163, 184, 0.1)'
                : 'rgba(0, 0, 0, 0.08)'
            }`,
            backdropFilter: 'blur(20px)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? 'none'
                : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 20px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            fontWeight: 600,
            color: theme.palette.text.secondary,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
                : 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
            borderRight: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(148,163,184,0.1)'
                : 'rgba(0,0,0,0.08)'
            }`,
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderBottom: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(148,163,184,0.1)'
                : 'rgba(0,0,0,0.08)'
            }`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 30px rgba(0,0,0,0.3)'
                : '0 1px 3px rgba(0,0,0,0.08)',
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            background: theme.palette.background.paper,
          }),
        },
      },
    },
  });

// Keep a default export for backward compatibility
const theme = getTheme('dark');
export default theme;
