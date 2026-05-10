import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Avatar,
  Alert, Divider, CircularProgress, Paper
} from '@mui/material';
import { Person, Lock, Save, Badge } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { utilisateurService } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Password state
  const [passwords, setPasswords] = useState({
    ancien: '',
    nouveau: '',
    confirmation: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.nouveau !== passwords.confirmation) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await utilisateurService.changerMotDePasse(user.id, passwords.ancien, passwords.nouveau);
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPasswords({ ancien: '', nouveau: '', confirmation: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Mon Profil</Typography>

      <Grid container spacing={3}>
        {/* Info Card */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{ 
                  width: 100, height: 100, mx: 'auto', mb: 2,
                  bgcolor: 'primary.main', fontSize: '2.5rem'
                }}
              >
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user?.prenom} {user?.nom}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {user?.role}
              </Typography>
              
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Date d'inscription</Typography>
                      <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email professionnel</Typography>
                      <Typography variant="body2">{user?.email}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change Card */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Lock sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Sécurité du compte</Typography>
              </Box>
              
              {message && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handlePasswordChange}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Changer le mot de passe</Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="Ancien mot de passe"
                  value={passwords.ancien}
                  onChange={(e) => setPasswords({...passwords, ancien: e.target.value})}
                  sx={{ mb: 2 }}
                  required
                />
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  type="password"
                  label="Nouveau mot de passe"
                  value={passwords.nouveau}
                  onChange={(e) => setPasswords({...passwords, nouveau: e.target.value})}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmer le nouveau mot de passe"
                  value={passwords.confirmation}
                  onChange={(e) => setPasswords({...passwords, confirmation: e.target.value})}
                  sx={{ mb: 3 }}
                  required
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  disabled={loading}
                  sx={{ 
                    px: 4, py: 1,
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' 
                  }}
                >
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
