import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem,
  IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, PlayArrow, Stop, Cancel, Add } from '@mui/icons-material';
import { StatusBadge } from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { interventionService } from '../../services/api';
import { formatDateTime } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export default function InterventionListPage() {
  const [interventions, setInterventions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statut, setStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (statut) params.statut = statut;
      const { data } = await interventionService.getAll(params);
      setInterventions(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, size, statut]);

  const handleAction = async () => {
    if (!actionModal) return;
    try {
      if (actionModal.type === 'demarrer') await interventionService.demarrer(actionModal.id);
      if (actionModal.type === 'annuler') await interventionService.annuler(actionModal.id, 'Annulation manuelle');
      setActionModal(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Interventions</Typography>
        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']) && (
          <Button variant="contained" startIcon={<Add />}
            onClick={() => navigate('/interventions/new')}
            sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Planifier
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField select size="small" label="Statut" value={statut}
            onChange={(e) => { setStatut(e.target.value); setPage(0); }} sx={{ minWidth: 180 }} id="intervention-filter-statut">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="PREVENTIVE">Préventive</MenuItem>
            <MenuItem value="PLANIFIEE">Planifiée</MenuItem>
            <MenuItem value="EN_COURS">En cours</MenuItem>
            <MenuItem value="TERMINEE">Terminée</MenuItem>
            <MenuItem value="ANNULEE">Annulée</MenuItem>
            <MenuItem value="EN_RETARD">En retard</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead><TableRow>
                  <TableCell>Machine</TableCell>
                  <TableCell>Date planifiée</TableCell>
                  <TableCell>Technicien</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {interventions.map((i) => (
                    <TableRow key={i.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/interventions/${i.id}`)}>
                      <TableCell sx={{ fontWeight: 500 }}>{i.machineNom}</TableCell>
                      <TableCell>{formatDateTime(i.datePlanifiee)}</TableCell>
                      <TableCell>{i.technicienNom ? `${i.technicienPrenom} ${i.technicienNom}` : '-'}</TableCell>
                      <TableCell><StatusBadge statut={i.statut} /></TableCell>
                      <TableCell>{i.dureeMinutes ? `${i.dureeMinutes} min` : '-'}</TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => navigate(`/interventions/${i.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        {(i.statut === 'PLANIFIEE' || i.statut === 'EN_RETARD') && (
                          <IconButton size="small" color="success"
                            onClick={() => setActionModal({ id: i.id, type: 'demarrer' })}>
                            <PlayArrow fontSize="small" />
                          </IconButton>
                        )}
                        {i.statut === 'EN_COURS' && (
                          <IconButton size="small" color="warning"
                            onClick={() => navigate(`/interventions/${i.id}`)}>
                            <Stop fontSize="small" />
                          </IconButton>
                        )}
                        {i.statut !== 'TERMINEE' && i.statut !== 'ANNULEE' &&
                          hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']) && (
                          <IconButton size="small" color="error"
                            onClick={() => setActionModal({ id: i.id, type: 'annuler' })}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {interventions.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Aucune intervention trouvée</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
              rowsPerPage={size} onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value)); setPage(0); }}
              labelRowsPerPage="Lignes :" rowsPerPageOptions={[5, 10, 25]} />
          </>
        )}
      </Card>

      <ConfirmModal
        open={!!actionModal}
        title={actionModal?.type === 'demarrer' ? "Démarrer l'intervention" : "Annuler l'intervention"}
        message={actionModal?.type === 'demarrer'
          ? "Voulez-vous démarrer cette intervention ?"
          : "Voulez-vous annuler cette intervention ?"}
        onConfirm={handleAction}
        onCancel={() => setActionModal(null)}
      />
    </Box>
  );
}
