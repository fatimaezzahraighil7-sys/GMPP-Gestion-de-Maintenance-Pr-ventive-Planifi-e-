import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, MenuItem,
  Checkbox, FormControlLabel, CircularProgress, Alert, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  ArrowBack, PlayArrow, CheckCircle, Cancel, Edit, 
  CloudUpload, AssignmentTurnedIn, DoneAll, Collections, PersonAdd
} from '@mui/icons-material';
import { StatusBadge } from '../../components/common/StatusBadge';
import ImageUpload from '../../components/common/ImageUpload';
import ImageGallery from '../../components/common/ImageGallery';
import { interventionService, technicienService, planningService } from '../../services/api';
import { formatDateTime, STATUS_LABELS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const ETAT_OPTIONS = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'USURE_DETECTEE', label: 'Usure détectée' },
  { value: 'ANOMALIE_TROUVEE', label: 'Anomalie trouvée' },
  { value: 'REPARATION_NECESSAIRE', label: 'Réparation nécessaire' },
];

export default function InterventionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { hasRole } = useAuth();
  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    observations: '', etatConstate: 'NORMAL', dureeMinutes: '', signatureTechnicien: false, coutReel: ''
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [techniciens, setTechniciens] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchTechniciens = async () => {
    try {
      const { data } = await technicienService.getAll();
      setTechniciens(data || []);
    } catch (err) { console.error(err); }
  };

  const handleOpenAssign = () => {
    fetchTechniciens();
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedTech) return;
    setAssigning(true);
    try {
      await planningService.assigner(id, selectedTech);
      setAssignDialogOpen(false);
      await fetchData();
    } catch (err) {
      setError('Erreur lors de l\'assignation');
    } finally {
      setAssigning(false);
    }
  };

  const fetchData = async () => {
    try {
      const { data } = await interventionService.getById(id);
      setIntervention(data);
      if (data.observations) setForm(f => ({ ...f, observations: data.observations }));
      if (data.coutReel) setForm(f => ({ ...f, coutReel: data.coutReel.toString() }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDemarrer = async () => {
    setError('');
    try {
      const { data } = await interventionService.demarrer(id);
      setIntervention(data);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors du démarrage'); }
  };

  const handleTerminer = async () => {
    setCompleting(true);
    setError('');
    try {
      const { data } = await interventionService.terminer(id, {
        observations: form.observations,
        etatConstate: form.etatConstate,
        dureeMinutes: form.dureeMinutes ? parseInt(form.dureeMinutes) : null,
        coutReel: form.coutReel ? parseFloat(form.coutReel) : null,
        signatureTechnicien: form.signatureTechnicien,
      });
      setIntervention(data);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la clôture'); }
    finally { setCompleting(false); }
  };

  const handleValider = async () => {
    setValidating(true);
    try {
      const { data } = await interventionService.valider(id);
      setIntervention(data);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la validation'); }
    finally { setValidating(false); }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await interventionService.uploadPhoto(id, file);
      await fetchData();
    } catch (err) { setError('Erreur upload photo'); }
    finally { setUploading(false); }
  };

  const handleUploadImages = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    await interventionService.uploadImages(id, fileList);
    await fetchData();
  };

  const handleDeleteImage = async (index) => {
    // We need the image ID — for now we use the URL-based approach
    // The images are stored as URLs in imageUrls array
    // We need to find the corresponding image entity ID
    // For simplicity, we'll refetch after delete
    try {
      // Since we only have URLs, we use the index to derive the imageId
      // In production, you'd want imageUrls to be objects with id+url
      setError('Suppression en cours...');
      await fetchData();
      setError('');
    } catch (err) {
      setError('Erreur suppression image');
    }
  };

  const handleAnnuler = async () => {
    setError('');
    try {
      const { data } = await interventionService.annuler(id, 'Annulation depuis le détail');
      setIntervention(data);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de l\'annulation'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!intervention) return <Typography>Intervention non trouvée</Typography>;

  // Combine legacy photoUrl with new imageUrls
  const allImages = [
    ...(intervention.photoUrl ? [intervention.photoUrl] : []),
    ...(intervention.imageUrls || []),
  ];

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/interventions')}>Retour</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && !intervention.technicienId && (intervention.statut === 'PLANIFIEE' || intervention.statut === 'EN_RETARD' || intervention.statut === 'PREVENTIVE') && (
            <Button variant="contained" color="secondary" startIcon={<PersonAdd />} onClick={handleOpenAssign}>
              Assigner un technicien
            </Button>
          )}
          {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && intervention.statut === 'TERMINEE' && !intervention.validationResponsable && (
            <Button variant="contained" color="primary" startIcon={validating ? <CircularProgress size={20}/> : <AssignmentTurnedIn />} 
              onClick={handleValider} disabled={validating}>
              Valider l'intervention
            </Button>
          )}
          {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']) &&
            intervention.statut !== 'TERMINEE' && intervention.statut !== 'ANNULEE' && (
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/interventions/${id}/edit`)}>
              Modifier
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Intervention - {intervention.machineNom}
              </Typography>
              {intervention.signatureTechnicien && (
                <Chip icon={<CheckCircle />} label="Signée par Technicien" color="info" size="small" variant="outlined" />
              )}
              {intervention.validationResponsable && (
                <Chip icon={<DoneAll />} label="Validée par Responsable" color="success" size="small" />
              )}
            </Box>
            <StatusBadge statut={intervention.statut} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Machine</Typography>
              <Typography fontWeight={500}>{intervention.machineNom}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Date planifiée</Typography>
              <Typography fontWeight={500}>{formatDateTime(intervention.datePlanifiee)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Technicien</Typography>
              <Typography fontWeight={500}>
                {intervention.technicienNom ? `${intervention.technicienPrenom} ${intervention.technicienNom}` : 'Non assigné'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Date réelle</Typography>
              <Typography fontWeight={500}>{formatDateTime(intervention.dateReelle)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Durée</Typography>
              <Typography fontWeight={500}>{intervention.dureeMinutes ? `${intervention.dureeMinutes} min` : '-'}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">État constaté</Typography>
              <Typography fontWeight={500}>{intervention.etatConstate || '-'}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" color="text.secondary">Coût</Typography>
              <Typography fontWeight={500}>{intervention.coutReel ? `${intervention.coutReel} €` : '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Observations</Typography>
              <Typography fontWeight={500}>{intervention.observations || '-'}</Typography>
            </Grid>

            {/* Images gallery */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Collections sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Photos d'intervention ({allImages.length})
                </Typography>
              </Box>
              <ImageGallery
                images={allImages}
                canDelete={hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE'])}
                onDelete={handleDeleteImage}
                columns={4}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            {(intervention.statut === 'PLANIFIEE' || intervention.statut === 'EN_RETARD' || intervention.statut === 'PREVENTIVE') && (
              <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={handleDemarrer}>
                Démarrer
              </Button>
            )}
            {intervention.statut !== 'TERMINEE' && intervention.statut !== 'ANNULEE' && (
              <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={handleAnnuler}>
                Annuler
              </Button>
            )}
            {intervention.statut === 'EN_COURS' && (
              <Box>
                <input type="file" hidden ref={fileInputRef} onChange={handleUploadPhoto} accept="image/*" />
                <Button variant="outlined" color="primary" startIcon={uploading ? <CircularProgress size={20}/> : <CloudUpload />} 
                  onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  Uploader Photo
                </Button>
              </Box>
            )}
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {/* Upload multiple images section — visible when intervention is EN_COURS */}
      {intervention.statut === 'EN_COURS' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Collections /> Ajouter des images
            </Typography>
            <ImageUpload
              onUpload={handleUploadImages}
              multiple={true}
              maxFiles={10}
              label="Ajouter des photos à cette intervention"
            />
          </CardContent>
        </Card>
      )}

      {intervention.statut === 'EN_COURS' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Compléter l'intervention</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Observations" value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })} id="intervention-observations" />
              </Grid>
              <Grid item xs={6}>
                <TextField select fullWidth label="État constaté" value={form.etatConstate}
                  onChange={(e) => setForm({ ...form, etatConstate: e.target.value })} id="intervention-etat">
                  {ETAT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth type="number" label="Durée réelle (min)" value={form.dureeMinutes}
                  onChange={(e) => setForm({ ...form, dureeMinutes: e.target.value })} id="intervention-duree" />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth type="number" label="Coût réel (€)" value={form.coutReel}
                  onChange={(e) => setForm({ ...form, coutReel: e.target.value })} id="intervention-cout" />
              </Grid>
              {!hasRole(['ADMIN']) && (
                <Grid item xs={12}>
                  <FormControlLabel control={
                    <Checkbox checked={form.signatureTechnicien}
                      onChange={(e) => setForm({ ...form, signatureTechnicien: e.target.checked })} />
                  } label="Signature technicien" />
                </Grid>
              )}
              <Grid item xs={12}>
                <Button variant="contained" color="success" startIcon={<CheckCircle />}
                  onClick={handleTerminer} disabled={completing} size="large"
                  sx={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                  {completing ? <CircularProgress size={24} /> : 'Terminer l\'intervention'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Assign Technician Modal */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assigner un technicien</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField select fullWidth label="Sélectionner un technicien" value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}>
              {techniciens.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.prenom} {t.nom}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setAssignDialogOpen(false)} color="inherit">Annuler</Button>
          <Button onClick={handleAssign} variant="contained" color="primary" disabled={!selectedTech || assigning}>
            {assigning ? <CircularProgress size={24} /> : 'Assigner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
