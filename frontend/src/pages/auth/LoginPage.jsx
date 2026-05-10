import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
} from '@mui/material';
import { Engineering, Login } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, motDePasse);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
    }}>
      <Card sx={{
        width: 420, p: 2, background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} className="fade-in">
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '16px', mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Engineering sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{
              background: 'linear-gradient(135deg, #6366F1, #EC4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700,
            }}>
              GMPP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Gestion de Maintenance Préventive Planifiée
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }}
              required autoFocus id="login-email" />
            <TextField fullWidth label="Mot de passe" type="password" value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)} sx={{ mb: 3 }}
              required id="login-password" />
            <Button fullWidth type="submit" variant="contained" size="large" id="login-submit"
              disabled={loading}
              sx={{
                py: 1.5, fontSize: 16, fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' },
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> :
                <><Login sx={{ mr: 1 }} /> Se connecter</>}
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(99,102,241,0.08)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Comptes démo :</strong><br />
              admin@gmpp.com / admin123<br />
              responsable@gmpp.com / resp123<br />
              tech1@gmpp.com / tech123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
