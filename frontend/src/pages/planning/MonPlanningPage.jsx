import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, CircularProgress,
  Alert, Chip, Tabs, Tab
} from '@mui/material';
import { Visibility, PlayArrow, CheckCircle, CalendarMonth } from '@mui/icons-material';
import { interventionService, technicienService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';

export default function MonPlanningPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const fetchMesInterventions = async () => {
    setLoading(true);
    try {
      // Fetch interventions assigned to this technician (filtered by backend using JWT)
      const { data } = await interventionService.getMesInterventions({ size: 100 });
      const list = data.content || [];
      setInterventions(list);

      // Build calendar events
      setCalendarEvents(list.map(i => ({
        id: i.id,
        title: i.machineNom || 'Intervention',
        start: i.datePlanifiee,
        color: i.statut === 'EN_RETARD' ? '#EF4444'
          : i.statut === 'EN_COURS' ? '#F59E0B'
          : i.statut === 'TERMINEE' ? '#10B981'
          : '#6366F1',
      })));
    } catch (err) {
      setError('Erreur lors du chargement de votre planning');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMesInterventions(); }, [user]);

  const handleDemarrer = async (id) => {
    try {
      await interventionService.demarrer(id);
      fetchMesInterventions();
    } catch (err) { setError(err.response?.data?.message || 'Erreur démarrage'); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const interventionsAujourdhui = interventions.filter(i =>
    i.datePlanifiee && i.datePlanifiee.startsWith(today)
  );
  const enRetard = interventions.filter(i => i.statut === 'EN_RETARD' || i.statut === 'EN_COURS');

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Mon Planning</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Bonjour {user?.prenom} — voici vos interventions assignées
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: "Aujourd'hui", value: interventionsAujourdhui.length, color: '#6366F1' },
          { label: 'En cours / retard', value: enRetard.length, color: '#EF4444' },
          { label: 'Total assignées', value: interventions.length, color: '#10B981' },
        ].map(card => (
          <Card key={card.label} sx={{ flex: '1 1 150px', p: 2, borderTop: `3px solid ${card.color}` }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: card.color }}>{card.value}</Typography>
            <Typography variant="body2" color="text.secondary">{card.label}</Typography>
          </Card>
        ))}
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Liste" />
          <Tab label="Calendrier" icon={<CalendarMonth fontSize="small" />} iconPosition="start" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : tab === 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Machine</TableCell>
                  <TableCell>Date planifiée</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interventions.map(i => (
                  <TableRow key={i.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{i.machineNom}</TableCell>
                    <TableCell>{formatDateTime(i.datePlanifiee)}</TableCell>
                    <TableCell><StatusBadge statut={i.statut} /></TableCell>
                    <TableCell>{i.dureeMinutes ? `${i.dureeMinutes} min` : '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/interventions/${i.id}`)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      {(i.statut === 'PLANIFIEE' || i.statut === 'EN_RETARD') && (
                        <IconButton size="small" color="success" onClick={() => handleDemarrer(i.id)}>
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      )}
                      {i.statut === 'EN_COURS' && (
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                          onClick={() => navigate(`/interventions/${i.id}`)} sx={{ ml: 1 }}>
                          Terminer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {interventions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      Aucune intervention vous est assignée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 2 }}>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              locale={frLocale}
              events={calendarEvents}
              height={500}
              eventClick={(info) => navigate(`/interventions/${info.event.id}`)}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
