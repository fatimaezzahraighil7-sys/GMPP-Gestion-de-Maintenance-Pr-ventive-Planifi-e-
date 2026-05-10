import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
  Button, Alert, CircularProgress, Chip
} from '@mui/material';
import { ArrowBack, Save, Engineering } from '@mui/icons-material';
import { utilisateurService } from '../../services/api';

const ROLES = ['TECHNICIEN', 'CHEF_EQUIPE', 'RESPONSABLE_MAINTENANCE'];

export default function TechnicienEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specialiteInput, setSpecialiteInput] = useState('');
  const [formData, setFormData] = useState({
    nom: '', prenom: '', matricule: '', email: '',
    role: 'TECHNICIEN', specialites: [], certifications: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await utilisateurService.getById(id);
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          matricule: data.matricule || '',
          email: data.email || '',
          role: data.role || 'TECHNICIEN',
          specialites: data.specialites || [],
          certifications: data.certifications || [],
        });
      } catch { setError('Erreur chargement des données'); }
      finally { setDataLoading(false); }
    };
    load();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const addSpecialite = () => {
    const s = specialiteInput.trim();
    if (s && !formData.specialites.includes(s)) {
      setFormData(prev => ({ ...prev, specialites: [...prev.specialites, s] }));
    }
    setSpecialiteInput('');
  };

  const removeSpecialite = (s) => setFormData(prev => ({ ...prev, specialites: prev.specialites.filter(x => x !== s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await utilisateurService.update(id, formData);
      setSuccess('Technicien modifié avec succès !');
      setTimeout(() => navigate('/techniciens'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally { setLoading(false); }
  };

  if (dataLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/techniciens')} sx={{ mb: 2 }}>
        Retour aux techniciens
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Engineering sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Modifier le Technicien</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nom" name="nom" value={formData.nom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Matricule" name="matricule" value={formData.matricule} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required type="email" label="Email" name="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Rôle" name="role" value={formData.role} onChange={handleChange}>
                  {ROLES.map(r => <MenuItem key={r} value={r}>{r.replace('_', ' ')}</MenuItem>)}
                </TextField>
              </Grid>

              {/* Spécialités */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Spécialités techniques</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {formData.specialites.map(s => (
                    <Chip key={s} label={s} onDelete={() => removeSpecialite(s)}
                      sx={{ borderColor: 'rgba(99,102,241,0.4)', color: '#818CF8' }} variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" placeholder="Ajouter une spécialité (ex: Hydraulique)"
                    value={specialiteInput} onChange={e => setSpecialiteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpecialite())}
                    sx={{ flexGrow: 1 }} />
                  <Button variant="outlined" onClick={addSpecialite} size="small">Ajouter</Button>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/techniciens')} disabled={loading}>Annuler</Button>
                <Button type="submit" variant="contained" disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  Enregistrer
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
