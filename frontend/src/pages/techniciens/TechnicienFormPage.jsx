import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, OutlinedInput, Chip
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { utilisateurService } from '../../services/api';

const SPECIALITES_OPTIONS = [
  'Mécanique', 'Électrique', 'Hydraulique', 'Pneumatique', 'Électronique', 'Soudure', 'Graissage', 'Vidange', 'Filtres', 'CNC'
];

export default function TechnicienFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    email: '',
    motDePasse: '',
    role: 'TECHNICIEN',
    specialites: [],
    certifications: 'Aucune'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialitesChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, specialites: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
        actif: true
      };
      
      await utilisateurService.create(payload);
      navigate('/techniciens');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création du technicien/utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/techniciens')} sx={{ mb: 2 }}>
        Retour aux techniciens
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Ajouter un Technicien/Utilisateur</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nom" name="nom" value={formData.nom} onChange={handleChange} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Mot de passe" type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Matricule" name="matricule" value={formData.matricule} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Rôle" name="role" value={formData.role} onChange={handleChange}>
                  <MenuItem value="TECHNICIEN">Technicien</MenuItem>
                  <MenuItem value="CHEF_EQUIPE">Chef d'équipe</MenuItem>
                  <MenuItem value="RESPONSABLE_MAINTENANCE">Responsable Maintenance</MenuItem>
                  <MenuItem value="ADMIN">Administrateur</MenuItem>
                </TextField>
              </Grid>

              {['TECHNICIEN', 'CHEF_EQUIPE'].includes(formData.role) && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="specialites-label">Spécialités</InputLabel>
                      <Select
                        labelId="specialites-label"
                        multiple
                        name="specialites"
                        value={formData.specialites}
                        onChange={handleSpecialitesChange}
                        input={<OutlinedInput label="Spécialités" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {SPECIALITES_OPTIONS.map((spec) => (
                          <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Certifications (séparées par une virgule)" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="ex: Habilitation électrique, ISO 9001" />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/techniciens')} disabled={loading}>Annuler</Button>
                <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <Save />} sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
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
