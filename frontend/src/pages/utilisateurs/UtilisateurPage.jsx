import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Key, PersonOff, PersonAdd } from '@mui/icons-material';
import { utilisateurService } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';

const ROLES = ['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN'];
const ROLE_COLORS = {
  ADMIN: 'error', RESPONSABLE_MAINTENANCE: 'warning',
  CHEF_EQUIPE: 'info', TECHNICIEN: 'success'
};
const ROLE_LABELS = {
  ADMIN: 'Admin', RESPONSABLE_MAINTENANCE: 'Responsable',
  CHEF_EQUIPE: "Chef d'équipe", TECHNICIEN: 'Technicien'
};

const emptyForm = { nom: '', prenom: '', email: '', matricule: '', motDePasse: '', role: 'TECHNICIEN', specialites: '', certifications: '' };

export default function UtilisateurPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await utilisateurService.getAll();
      setUsers(data);
    } catch { setError('Erreur chargement utilisateurs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (u) => {
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, matricule: u.matricule, motDePasse: '', role: u.role, specialites: u.specialites?.join(', ') || '', certifications: u.certifications?.join(', ') || '' });
    setEditingId(u.id);
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        specialites: form.specialites ? form.specialites.split(',').map(s => s.trim()).filter(Boolean) : [],
        certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
        actif: true,
      };
      if (!editingId) payload.motDePasse = form.motDePasse;
      else if (!form.motDePasse) delete payload.motDePasse;

      if (editingId) await utilisateurService.update(editingId, payload);
      else await utilisateurService.create(payload);
      setSuccess(editingId ? 'Utilisateur modifié !' : 'Utilisateur créé !');
      closeDialog();
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await utilisateurService.activerDesactiver(u.id);
      fetchUsers();
    } catch { setError('Erreur modification statut'); }
  };

  const handleDelete = async () => {
    try { await utilisateurService.delete(deleteId); setDeleteId(null); fetchUsers(); }
    catch { setError('Erreur suppression');  }
  };

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Gestion des Utilisateurs</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          Ajouter
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Spécialités</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{u.prenom} {u.nom}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.matricule}</TableCell>
                    <TableCell><Chip label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role] || 'default'} size="small" /></TableCell>
                    <TableCell>
                      <Switch checked={u.actif} onChange={() => handleToggle(u)} size="small" color="success" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {u.specialites?.slice(0, 2).map(s => <Chip key={s} label={s} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5, fontSize: 10 }} />)}
                      {u.specialites?.length > 2 && <Chip label={`+${u.specialites.length - 2}`} size="small" />}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Aucun utilisateur</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Prénom" value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} />
              <TextField fullWidth label="Nom" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </Box>
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <TextField fullWidth label={editingId ? 'Nouveau mot de passe (laisser vide pour garder)' : 'Mot de passe'} type="password" value={form.motDePasse} onChange={e => setForm(p => ({ ...p, motDePasse: e.target.value }))} />
            <TextField fullWidth label="Matricule" value={form.matricule} onChange={e => setForm(p => ({ ...p, matricule: e.target.value }))} />
            <TextField fullWidth select label="Rôle" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Spécialités (séparées par virgule)" value={form.specialites} onChange={e => setForm(p => ({ ...p, specialites: e.target.value }))} placeholder="Mécanique, Électrique, Hydraulique" />
            <TextField fullWidth label="Certifications (séparées par virgule)" value={form.certifications} onChange={e => setForm(p => ({ ...p, certifications: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog} variant="outlined">Annuler</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            {saving ? <CircularProgress size={20} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal open={!!deleteId} title="Supprimer l'utilisateur"
        message="Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
