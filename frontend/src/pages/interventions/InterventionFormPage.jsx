import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button, Alert, CircularProgress
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { interventionService, machineService, pointMaintenanceService, technicienService } from '../../services/api';

export default function InterventionFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [machines, setMachines] = useState([]);
  const [points, setPoints] = useState([]);
  const [techniciens, setTechniciens] = useState([]);

  const [formData, setFormData] = useState({
    machineId: '',
    pointMaintenanceId: '',
    technicienId: '',
    datePlanifiee: '',
    observations: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [macRes, techRes] = await Promise.all([
          machineService.getAll({ size: 100 }),
          technicienService.getAll()
        ]);
        setMachines(macRes.data.content || []);
        setTechniciens(techRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMachineChange = async (e) => {
    const machineId = e.target.value;
    setFormData(prev => ({ ...prev, machineId, pointMaintenanceId: '' }));
    try {
      if (machineId) {
        const pmRes = await pointMaintenanceService.getAll({ machineId });
        setPoints(pmRes.data || []);
      } else {
        setPoints([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        machineId: formData.machineId,
        pointMaintenanceId: formData.pointMaintenanceId || null,
        technicienId: formData.technicienId || null,
        datePlanifiee: formData.datePlanifiee,
        observations: formData.observations
      };
      
      await interventionService.planifier(payload);
      navigate('/interventions');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'intervention');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/interventions')} sx={{ mb: 2 }}>
        Retour aux interventions
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Planifier une Intervention</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Machine" name="machineId" value={formData.machineId} onChange={handleMachineChange}>
                  <MenuItem value="">-- Sélectionner une machine --</MenuItem>
                  {machines.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.nom} ({m.numeroSerie})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Point de maintenance (Optionnel)" name="pointMaintenanceId" value={formData.pointMaintenanceId} onChange={handleChange} disabled={!formData.machineId}>
                  <MenuItem value="">-- Aucun --</MenuItem>
                  {points.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.typeOperation} - {p.description}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Technicien assigné" name="technicienId" value={formData.technicienId} onChange={handleChange}>
                  <MenuItem value="">-- Non assigné --</MenuItem>
                  {techniciens.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.prenom} {t.nom} ({t.matricule})</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth type="datetime-local" required label="Date planifiée" name="datePlanifiee" value={formData.datePlanifiee} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Observations" name="observations" value={formData.observations} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/interventions')} disabled={loading}>Annuler</Button>
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
