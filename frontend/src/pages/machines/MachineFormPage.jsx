import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button, Alert, CircularProgress
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { machineService } from '../../services/api';
import { MACHINE_TYPE_LABELS } from '../../utils/constants';

export default function MachineFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    typeMachine: '',
    marque: '',
    modele: '',
    numeroSerie: '',
    anneeFabrication: '',
    dateMiseEnService: '',
    localisation: '',
    compteurHoraire: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        anneeFabrication: formData.anneeFabrication ? parseInt(formData.anneeFabrication) : null,
        compteurHoraire: formData.compteurHoraire ? parseFloat(formData.compteurHoraire) : 0.0,
        statut: 'EN_SERVICE' // Default status for new machines
      };
      
      await machineService.create(payload);
      navigate('/machines');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la machine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/machines')} sx={{ mb: 2 }}>
        Retour aux machines
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Ajouter une Machine</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nom de la machine" name="nom" value={formData.nom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Type" name="typeMachine" value={formData.typeMachine} onChange={handleChange}>
                  {Object.entries(MACHINE_TYPE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Marque" name="marque" value={formData.marque} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Modèle" name="modele" value={formData.modele} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Numéro de série" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Année de fabrication" name="anneeFabrication" value={formData.anneeFabrication} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" required label="Date de mise en service" name="dateMiseEnService" value={formData.dateMiseEnService} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Localisation" name="localisation" value={formData.localisation} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" inputProps={{ step: "0.1" }} label="Compteur horaire (initial)" name="compteurHoraire" value={formData.compteurHoraire} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/machines')} disabled={loading}>Annuler</Button>
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
