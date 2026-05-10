import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, CircularProgress, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { pointMaintenanceService, machineService } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import { OPERATION_LABELS, FREQUENCE_LABELS, formatDate } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const TYPE_OPS = ['GRAISSAGE', 'VIDANGE_HUILE', 'VERIFICATION_COURROIE', 'VERIFICATION_ROULEMENT', 'CONTROLE_FILTRES', 'SERRAGE_VISSERIE'];
const FREQUENCES = ['QUOTIDIENNE', 'HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE', 'PAR_HEURES'];

const emptyForm = {
  machineId: '', typeOperation: '', description: '', localisation: '',
  frequence: '', typeConsommable: '', quantiteNecessaire: '', unite: '',
  intervalleHeures: ''
};

export default function PointMaintenancePage() {
  const [points, setPoints] = useState([]);
  const [machines, setMachines] = useState([]);
  const [filterMachineId, setFilterMachineId] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasRole } = useAuth();

  const fetchPoints = async (machineId) => {
    setLoading(true);
    try {
      const params = machineId ? { machineId } : {};
      const { data } = await pointMaintenanceService.getAll(params);
      setPoints(data || []);
    } catch { setError('Erreur chargement points de maintenance'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    machineService.getAll({ size: 200 }).then(r => setMachines(r.data.content || []));
    fetchPoints();
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (p) => {
    setForm({
      machineId: p.machineId || '', typeOperation: p.typeOperation || '',
      description: p.description || '', localisation: p.localisation || '',
      frequence: p.frequence || '', typeConsommable: p.typeConsommable || '',
      quantiteNecessaire: p.quantiteNecessaire || '', unite: p.unite || '',
      intervalleHeures: p.intervalleHeures || ''
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditingId(null); setForm(emptyForm); setError(''); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        quantiteNecessaire: form.quantiteNecessaire ? parseFloat(form.quantiteNecessaire) : null,
        intervalleHeures: form.intervalleHeures ? parseInt(form.intervalleHeures) : null,
      };
      if (editingId) await pointMaintenanceService.update(editingId, payload);
      else await pointMaintenanceService.create(payload);
      setSuccess(editingId ? 'Point modifié !' : 'Point créé !');
      closeDialog();
      fetchPoints(filterMachineId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur enregistrement');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await pointMaintenanceService.delete(deleteId); setDeleteId(null); fetchPoints(filterMachineId); }
    catch { setError('Erreur suppression'); }
  };

  const handleFilter = (machineId) => {
    setFilterMachineId(machineId);
    fetchPoints(machineId);
  };

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Points de Maintenance</Typography>
        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Ajouter
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField select size="small" label="Filtrer par machine" value={filterMachineId} onChange={e => handleFilter(e.target.value)} sx={{ minWidth: 280 }}>
          <MenuItem value="">Toutes les machines</MenuItem>
          {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>)}
        </TextField>
      </Card>

      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Machine</TableCell>
                  <TableCell>Type d'opération</TableCell>
                  <TableCell>Fréquence</TableCell>
                  <TableCell>Prochaine date</TableCell>
                  <TableCell>Consommable</TableCell>
                  <TableCell>Localisation</TableCell>
                  {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {points.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{p.machineNom || '-'}</TableCell>
                    <TableCell><Chip label={OPERATION_LABELS[p.typeOperation] || p.typeOperation} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell><Chip label={FREQUENCE_LABELS[p.frequence] || p.frequence} size="small" /></TableCell>
                    <TableCell sx={{ color: new Date(p.prochaineIntervention) < new Date() ? '#EF4444' : 'inherit' }}>
                      {formatDate(p.prochaineIntervention)}
                    </TableCell>
                    <TableCell>{p.typeConsommable ? `${p.typeConsommable} (${p.quantiteNecessaire} ${p.unite})` : '-'}</TableCell>
                    <TableCell>{p.localisation || '-'}</TableCell>
                    {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {points.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun point de maintenance trouvé</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Modifier' : 'Ajouter'} un point de maintenance</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select required label="Machine" value={form.machineId} onChange={e => setForm(p => ({ ...p, machineId: e.target.value }))}>
                <MenuItem value="">-- Sélectionner --</MenuItem>
                {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select required label="Type d'opération" value={form.typeOperation} onChange={e => setForm(p => ({ ...p, typeOperation: e.target.value }))}>
                {TYPE_OPS.map(t => <MenuItem key={t} value={t}>{OPERATION_LABELS[t] || t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Localisation sur la machine" value={form.localisation} onChange={e => setForm(p => ({ ...p, localisation: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select required label="Fréquence" value={form.frequence} onChange={e => setForm(p => ({ ...p, frequence: e.target.value }))}>
                {FREQUENCES.map(f => <MenuItem key={f} value={f}>{FREQUENCE_LABELS[f] || f}</MenuItem>)}
              </TextField>
            </Grid>
            {form.frequence === 'PAR_HEURES' && (
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Fréquence en heures" value={form.intervalleHeures} onChange={e => setForm(p => ({ ...p, intervalleHeures: e.target.value }))} />
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Type de consommable" value={form.typeConsommable} onChange={e => setForm(p => ({ ...p, typeConsommable: e.target.value }))} placeholder="Graisse lithium, Huile SAE 30..." />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Quantité nécessaire" value={form.quantiteNecessaire} onChange={e => setForm(p => ({ ...p, quantiteNecessaire: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Unité" value={form.unite} onChange={e => setForm(p => ({ ...p, unite: e.target.value }))} placeholder="g, L, coups de pompe..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} variant="outlined">Annuler</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            {saving ? <CircularProgress size={20} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal open={!!deleteId} title="Supprimer le point"
        message="Voulez-vous vraiment supprimer ce point de maintenance ?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
