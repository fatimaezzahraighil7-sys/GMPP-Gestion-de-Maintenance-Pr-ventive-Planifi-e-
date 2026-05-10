import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, List, ListItem,
  ListItemText, Chip, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import { AutoMode, Warning } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { interventionService, planningService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/constants';

export default function PlanningPage() {
  const [events, setEvents] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [generating, setGenerating] = useState(false);
  const calendarRef = useRef(null);

  const fetchEvents = useCallback(async (start, end) => {
    try {
      const debut = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const fin = end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
      const [eventsRes, alertesRes] = await Promise.all([
        interventionService.getCalendar(debut, fin),
        planningService.getAlertes(),
      ]);
      setEvents(eventsRes.data.map(e => ({
        id: e.id, title: e.title, start: e.start, end: e.end,
        backgroundColor: e.color, borderColor: e.color,
        extendedProps: { statut: e.statut, machineNom: e.machineNom, technicienNom: e.technicienNom },
      })));
      setAlertes(alertesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleGenerer = async () => {
    setGenerating(true);
    try {
      await planningService.generer();
      fetchEvents();
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  };

  const handleDateChange = (info) => {
    const start = info.startStr?.split('T')[0] || info.start?.toISOString().split('T')[0];
    const end = info.endStr?.split('T')[0] || info.end?.toISOString().split('T')[0];
    fetchEvents(start, end);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Planning</Typography>
        <Button variant="contained" startIcon={generating ? <CircularProgress size={20} /> : <AutoMode />}
          onClick={handleGenerer} disabled={generating}
          sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          Générer le planning
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                locale="fr"
                events={events}
                eventClick={(info) => setSelectedEvent(info.event)}
                datesSet={handleDateChange}
                height="auto"
                editable={false}
                selectable={true}
                buttonText={{ today: "Aujourd'hui", month: 'Mois', week: 'Semaine', day: 'Jour' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" /> Alertes
              </Typography>
              {alertes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Aucune alerte</Typography>
              ) : (
                <List dense>
                  {alertes.slice(0, 10).map((a) => {
                    const isJ1 = a.alertLabel === '[J-1]';
                    const isJ3 = a.alertLabel === '[J-3]';
                    const label = a.alertLabel || '';
                    return (
                      <ListItem key={a.id} sx={{
                        bgcolor: isJ1 ? 'rgba(239,68,68,0.15)' : isJ3 ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.08)', 
                        borderRadius: 1, mb: 1,
                        border: isJ1 ? '1px solid #EF4444' : isJ3 ? '1px solid #F59E0B' : '1px solid rgba(148,163,184,0.2)',
                      }}>
                        <ListItemText
                          primary={`${label} ${a.machineNom}`}
                          secondary={a.observations || 'Maintenance planifiée'}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: isJ1 ? '#EF4444' : isJ3 ? '#F59E0B' : 'inherit' }}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                        <StatusBadge statut={a.statut} />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Légende</Typography>
              {[
                { color: '#9C27B0', label: 'Préventive' },
                { color: '#3B82F6', label: 'Planifiée' },
                { color: '#F59E0B', label: 'En cours' },
                { color: '#10B981', label: 'Terminée' },
                { color: '#6B7280', label: 'Annulée' },
                { color: '#EF4444', label: 'En retard' },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#1E293B' } }}>
        <DialogTitle>{selectedEvent?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Machine :</strong> {selectedEvent?.extendedProps?.machineNom}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Technicien :</strong> {selectedEvent?.extendedProps?.technicienNom || 'Non assigné'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Date :</strong> {selectedEvent?.start ? formatDateTime(selectedEvent.start.toISOString()) : '-'}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <StatusBadge statut={selectedEvent?.extendedProps?.statut} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          {!selectedEvent?.extendedProps?.technicienNom && (
             <Button 
               variant="outlined" 
               startIcon={<AutoMode />} 
               color="secondary"
               onClick={async () => {
                 try {
                   await planningService.assignerAuto(selectedEvent.id);
                   setSelectedEvent(null);
                   fetchEvents();
                 } catch (e) { console.error(e); }
               }}
             >
               Assignation Auto
             </Button>
          )}
          <Button onClick={() => setSelectedEvent(null)} variant="text">Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
