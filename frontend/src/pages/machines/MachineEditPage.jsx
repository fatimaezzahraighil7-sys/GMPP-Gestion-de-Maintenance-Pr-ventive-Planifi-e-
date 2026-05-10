import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
  Button, Alert, CircularProgress
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { machineService } from '../../services/api';
import { MACHINE_TYPE_LABELS } from '../../utils/constants';

const STATUT_OPTIONS = [
  { value: 'EN_SERVICE', label: 'En service' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'HORS_SERVICE', label: 'Hors service' },
  { value: 'EN_REPARATION', label: 'En réparation' },
];

export default function MachineEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '', typeMachine: '', marque: '', modele: '',
    numeroSerie: '', anneeFabrication: '', dateMiseEnService: '',
    localisation: '', statut: 'EN_SERVICE', compteurHoraire: 0
  });

  useEffect(() => {
    machineService.getById(id).then(({ data }) => {
      setFormData({
        nom: data.nom || '',
        typeMachine: data.typeMachine || '',
        marque: data.marque || '',
        modele: data.modele || '',
        numeroSerie: data.numeroSerie || '',
        anneeFabrication: data.anneeFabrication || '',
        dateMiseEnService: data.dateMiseEnService || '',
        localisation: data.localisation || '',
        statut: data.statut || 'EN_SERVICE',
        compteurHoraire: data.compteurHoraire || 0,
      });
    }).catch(console.error).finally(() => setDataLoading(false));
  }, [id]);

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
      };
      await machineService.update(id, payload);
      navigate(`/machines/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/machines/${id}`)} sx={{ mb: 2 }}>
        Retour au détail
      </Button>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Modifier la Machine</Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nom de la machine" name="nom" value={formData.nom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Type" name="typeMachine" value={formData.typeMachine} onChange={handleChange}>
                  {Object.entries(MACHINE_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
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
                <TextField fullWidth type="date" label="Date de mise en service" name="dateMiseEnService" value={formData.dateMiseEnService} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Localisation" name="localisation" value={formData.localisation} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Statut" name="statut" value={formData.statut} onChange={handleChange}>
                  {STATUT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" inputProps={{ step: '0.1' }} label="Compteur horaire (h)" name="compteurHoraire" value={formData.compteurHoraire} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(`/machines/${id}`)} disabled={loading}>Annuler</Button>
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
