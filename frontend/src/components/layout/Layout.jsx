import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, IconButton, Avatar, Menu, MenuItem, Divider, Chip, Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard, Build, Engineering, CalendarMonth, Assessment, People,
  Settings, Logout, Menu as MenuIcon, ChevronLeft, Notifications, Handyman,
  Person, DarkMode, LightMode, ViewKanban,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { ROLE_LABELS } from '../../utils/constants';
import { planningService } from '../../services/api';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Tableau de bord', icon: <Dashboard />, path: '/' },
  { text: 'Machines', icon: <Build />, path: '/machines' },
  { text: 'Points de maintenance', icon: <Handyman />, path: '/points-maintenance' },
  { text: 'Interventions', icon: <Engineering />, path: '/interventions' },
  { text: 'Kanban', icon: <ViewKanban />, path: '/kanban', roles: ['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE'] },
  { text: 'Planning', icon: <CalendarMonth />, path: '/planning', roles: ['ADMIN', 'RESPONSABLE_MAINTENANCE'] },
  { text: 'Mon Planning', icon: <CalendarMonth />, path: '/mon-planning', roles: ['TECHNICIEN', 'CHEF_EQUIPE'] },
  { text: 'Rapports', icon: <Assessment />, path: '/rapports', roles: ['ADMIN', 'RESPONSABLE_MAINTENANCE'] },
  { text: 'Techniciens', icon: <People />, path: '/techniciens', roles: ['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE'] },
  { text: 'Utilisateurs', icon: <Settings />, path: '/utilisateurs', roles: ['ADMIN'] },
];

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const { user, logout, hasRole } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAlerts = async () => {
    try {
      const { data } = await planningService.getAlertes();
      setAlertCount(data.length || 0);
    } catch (err) { console.error('Alerts error', err); }
  };

  useEffect(() => {
    if (user && hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE'])) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  const isDark = mode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setDrawerOpen(!drawerOpen)} edge="start" sx={{ mr: 2 }}>
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Engineering sx={{ color: isDark ? '#6366F1' : '#4F46E5', fontSize: 32 }} />
            <Typography variant="h6" noWrap sx={{
              background: 'linear-gradient(135deg, #6366F1, #EC4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}>
              GMPP
            </Typography>
          </Box>

          {/* Theme toggle */}
          <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
              {isDark ? <LightMode sx={{ color: '#FBBF24' }} /> : <DarkMode sx={{ color: '#64748B' }} />}
            </IconButton>
          </Tooltip>

          <IconButton color="inherit" sx={{ mr: 1 }} onClick={() => navigate('/planning')}>
            <Badge badgeContent={alertCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Chip label={ROLE_LABELS[user?.role] || user?.role} size="small"
            sx={{ mr: 2, bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)', color: isDark ? '#818CF8' : '#4F46E5', fontWeight: 600 }} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: isDark ? '#6366F1' : '#4F46E5', width: 36, height: 36, fontSize: 14 }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
              <Person sx={{ mr: 1, fontSize: 18 }} /> Mon Profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}><Logout sx={{ mr: 1, fontSize: 18 }} /> Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" open={drawerOpen} sx={{
        width: drawerOpen ? DRAWER_WIDTH : 0, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH, boxSizing: 'border-box',
        },
      }}>
        <Toolbar />
        <List sx={{ mt: 1, px: 1 }}>
          {filteredMenu.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))}
                sx={{
                  borderRadius: 2, mx: 0.5,
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)',
                    '&:hover': { bgcolor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.15)' },
                    '& .MuiListItemIcon-root': { color: isDark ? '#6366F1' : '#4F46E5' },
                    '& .MuiListItemText-primary': { color: isDark ? '#818CF8' : '#4F46E5', fontWeight: 600 },
                  },
                  '&:hover': { bgcolor: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(0,0,0,0.04)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isDark ? '#64748B' : '#94A3B8' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{
        flexGrow: 1, p: 3, mt: 8,
        ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
        transition: 'margin 0.3s ease',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
