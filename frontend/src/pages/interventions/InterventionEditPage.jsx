import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
  Button, Alert, CircularProgress
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { interventionService, machineService, pointMaintenanceService, technicienService } from '../../services/api';

export default function InterventionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [machines, setMachines] = useState([]);
  const [points, setPoints] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [formData, setFormData] = useState({
    machineId: '', pointMaintenanceId: '', technicienId: '',
    datePlanifiee: '', observations: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [intRes, macRes, techRes] = await Promise.all([
          interventionService.getById(id),
          machineService.getAll({ size: 100 }),
          technicienService.getAll()
        ]);
        const i = intRes.data;
        setMachines(macRes.data.content || []);
        setTechniciens(techRes.data || []);

        if (i.machineId) {
          const pmRes = await pointMaintenanceService.getAll({ machineId: i.machineId });
          setPoints(pmRes.data || []);
        }

        const dt = i.datePlanifiee ? i.datePlanifiee.substring(0, 16) : '';
        setFormData({
          machineId: i.machineId || '',
          pointMaintenanceId: i.pointMaintenanceId || '',
          technicienId: i.technicienId || '',
          datePlanifiee: dt,
          observations: i.observations || '',
        });
      } catch (err) { console.error(err); }
      finally { setDataLoading(false); }
    };
    load();
  }, [id]);

  const handleMachineChange = async (e) => {
    const machineId = e.target.value;
    setFormData(prev => ({ ...prev, machineId, pointMaintenanceId: '' }));
    if (machineId) {
      const pmRes = await pointMaintenanceService.getAll({ machineId });
      setPoints(pmRes.data || []);
    } else setPoints([]);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
        observations: formData.observations,
      };
      await interventionService.update(id, payload);
      navigate(`/interventions/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  if (dataLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/interventions/${id}`)} sx={{ mb: 2 }}>
        Retour au détail
      </Button>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Modifier l'Intervention</Typography>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select required label="Machine" name="machineId" value={formData.machineId} onChange={handleMachineChange}>
                  <MenuItem value="">-- Sélectionner --</MenuItem>
                  {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Point de maintenance" name="pointMaintenanceId" value={formData.pointMaintenanceId} onChange={handleChange} disabled={!formData.machineId}>
                  <MenuItem value="">-- Aucun --</MenuItem>
                  {points.map(p => <MenuItem key={p.id} value={p.id}>{p.typeOperation}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Technicien assigné" name="technicienId" value={formData.technicienId} onChange={handleChange}>
                  <MenuItem value="">-- Non assigné --</MenuItem>
                  {techniciens.map(t => <MenuItem key={t.id} value={t.id}>{t.prenom} {t.nom}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="datetime-local" required label="Date planifiée" name="datePlanifiee" value={formData.datePlanifiee} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Observations" name="observations" value={formData.observations} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(`/interventions/${id}`)} disabled={loading}>Annuler</Button>
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
