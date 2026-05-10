import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
} from '@mui/material';
import { ArrowBack, Add, Build, Schedule, Edit } from '@mui/icons-material';
import { MachineStatusBadge, StatusBadge } from '../../components/common/StatusBadge';
import { machineService, pointMaintenanceService } from '../../services/api';
import { MACHINE_TYPE_LABELS, OPERATION_LABELS, FREQUENCE_LABELS, formatDate, formatDateTime } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export default function MachineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [machine, setMachine] = useState(null);
  const [points, setPoints] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machineRes, pointsRes, histRes] = await Promise.all([
          machineService.getById(id),
          pointMaintenanceService.getAll({ machineId: id }),
          machineService.getHistorique(id),
        ]);
        setMachine(machineRes.data);
        setPoints(pointsRes.data);
        setInterventions(histRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!machine) return <Typography>Machine non trouvée</Typography>;

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/machines')}>
          Retour aux machines
        </Button>
        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/machines/${id}/edit`)}>
            Modifier
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{machine.nom}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <MachineStatusBadge statut={machine.statut} />
                <Chip label={MACHINE_TYPE_LABELS[machine.typeMachine]} size="small" variant="outlined" />
              </Box>
            </Box>
            <Build sx={{ fontSize: 48, color: '#6366F1', opacity: 0.3 }} />
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Marque</Typography>
              <Typography fontWeight={500}>{machine.marque || '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Modèle</Typography>
              <Typography fontWeight={500}>{machine.modele || '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">N° Série</Typography>
              <Typography fontWeight={500}>{machine.numeroSerie}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Année</Typography>
              <Typography fontWeight={500}>{machine.anneeFabrication || '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Localisation</Typography>
              <Typography fontWeight={500}>{machine.localisation || '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Mise en service</Typography>
              <Typography fontWeight={500}>{formatDate(machine.dateMiseEnService)}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Compteur horaire</Typography>
              <Typography fontWeight={500}>{machine.compteurHoraire?.toLocaleString()} h</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="caption" color="text.secondary">Points maintenance</Typography>
              <Typography fontWeight={500}>{machine.nbPointsMaintenance}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid rgba(148,163,184,0.1)', px: 2 }}>
          <Tab label={`Points de maintenance (${points.length})`} />
          <Tab label={`Historique interventions (${interventions.length})`} />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Opération</TableCell><TableCell>Fréquence</TableCell>
                <TableCell>Prochaine intervention</TableCell><TableCell>Consommable</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {points.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{OPERATION_LABELS[p.typeOperation] || p.typeOperation}</TableCell>
                    <TableCell><Chip label={FREQUENCE_LABELS[p.frequence]} size="small" variant="outlined" /></TableCell>
                    <TableCell>{formatDate(p.prochaineIntervention)}</TableCell>
                    <TableCell>{p.typeConsommable ? `${p.typeConsommable} (${p.quantiteNecessaire} ${p.unite})` : '-'}</TableCell>
                  </TableRow>
                ))}
                {points.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Aucun point de maintenance</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Date planifiée</TableCell><TableCell>Statut</TableCell>
                <TableCell>Technicien</TableCell><TableCell>Durée</TableCell><TableCell>Observations</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {interventions.map((i) => (
                  <TableRow key={i.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/interventions/${i.id}`)}>
                    <TableCell>{formatDateTime(i.datePlanifiee)}</TableCell>
                    <TableCell><StatusBadge statut={i.statut} /></TableCell>
                    <TableCell>{i.technicienNom ? `${i.technicienPrenom} ${i.technicienNom}` : '-'}</TableCell>
                    <TableCell>{i.dureeMinutes ? `${i.dureeMinutes} min` : '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.observations || '-'}</TableCell>
                  </TableRow>
                ))}
                {interventions.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Aucune intervention</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
