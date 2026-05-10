import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Avatar, CircularProgress,
  TextField, MenuItem, Alert, IconButton, Tooltip, useTheme,
} from '@mui/material';
import {
  Engineering, CalendarMonth, Person, DragIndicator, Refresh,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { interventionService, machineService, technicienService } from '../../services/api';
import { formatDate, STATUS_LABELS } from '../../utils/constants';

const COLUMNS = [
  { id: 'PREVENTIVE', label: 'Préventive', color: '#9C27B0', bgAlpha: '0.08' },
  { id: 'PLANIFIEE', label: 'Planifiée', color: '#3B82F6', bgAlpha: '0.08' },
  { id: 'EN_RETARD', label: 'En retard', color: '#EF4444', bgAlpha: '0.08' },
  { id: 'EN_COURS', label: 'En cours', color: '#F59E0B', bgAlpha: '0.08' },
  { id: 'TERMINEE', label: 'Terminé', color: '#10B981', bgAlpha: '0.08' },
  { id: 'ANNULEE', label: 'Annulée', color: '#6B7280', bgAlpha: '0.08' },
];

export default function KanbanPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ machineId: '', technicienId: '' });
  const [machines, setMachines] = useState([]);
  const [techniciens, setTechniciens] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { size: 100 };
      if (filters.machineId) params.machineId = filters.machineId;
      if (filters.technicienId) params.technicienId = filters.technicienId;

      const [intRes, macRes, techRes] = await Promise.all([
        interventionService.getAll(params),
        machineService.getAll({ size: 100 }),
        technicienService.getAll(),
      ]);

      setInterventions(intRes.data.content || []);
      setMachines(macRes.data.content || []);
      setTechniciens(techRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getColumnItems = (statut) =>
    interventions.filter((i) => i.statut === statut);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatut = destination.droppableId;
    const interventionId = draggableId;

    // Optimistic update
    setInterventions((prev) =>
      prev.map((i) =>
        i.id === interventionId ? { ...i, statut: newStatut } : i
      )
    );

    try {
      await interventionService.updateStatut(interventionId, newStatut);
    } catch (err) {
      // Revert on error
      setInterventions((prev) =>
        prev.map((i) =>
          i.id === interventionId ? { ...i, statut: source.droppableId } : i
        )
      );
      setError(err.response?.data?.message || 'Transition de statut invalide');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          📊 Kanban — Planification
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select size="small" label="Machine" value={filters.machineId}
            onChange={(e) => setFilters((f) => ({ ...f, machineId: e.target.value }))}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Toutes</MenuItem>
            {machines.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>
            ))}
          </TextField>
          <TextField
            select size="small" label="Technicien" value={filters.technicienId}
            onChange={(e) => setFilters((f) => ({ ...f, technicienId: e.target.value }))}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {techniciens.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.prenom} {t.nom}</MenuItem>
            ))}
          </TextField>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={fetchData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{
          display: 'flex', gap: 2, overflowX: 'auto', pb: 2,
          minHeight: 'calc(100vh - 220px)',
        }}>
          {COLUMNS.map((column) => {
            const items = getColumnItems(column.id);
            return (
              <Box
                key={column.id}
                sx={{
                  minWidth: 280, maxWidth: 320, flex: '1 0 280px',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Column header */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  mb: 1.5, px: 1,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%',
                      bgcolor: column.color,
                    }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      {column.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={items.length}
                    size="small"
                    sx={{
                      bgcolor: `${column.color}20`,
                      color: column.color,
                      fontWeight: 700, fontSize: 13, minWidth: 28,
                    }}
                  />
                </Box>

                {/* Droppable column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flex: 1,
                        bgcolor: snapshot.isDraggingOver
                          ? `${column.color}15`
                          : isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)',
                        borderRadius: 3,
                        p: 1, minHeight: 200,
                        border: '1px solid',
                        borderColor: snapshot.isDraggingOver
                          ? column.color
                          : isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.06)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                mb: 1,
                                cursor: 'grab',
                                transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                boxShadow: snapshot.isDragging
                                  ? `0 8px 25px ${column.color}40`
                                  : undefined,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                '&:hover': {
                                  borderColor: column.color,
                                  boxShadow: `0 2px 8px ${column.color}20`,
                                },
                              }}
                            >
                              <CardContent sx={{ p: '12px !important', '&:last-child': { pb: '12px !important' } }}>
                                {/* Drag handle */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <Box {...provided.dragHandleProps} sx={{ color: 'text.secondary', mt: 0.3 }}>
                                    <DragIndicator sx={{ fontSize: 18 }} />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="subtitle2" fontWeight={600}
                                      sx={{
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.machineNom}
                                    </Typography>
                                    {item.pointMaintenanceDescription && (
                                      <Typography variant="caption" color="text.secondary"
                                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.pointMaintenanceDescription}
                                      </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                      <Chip
                                        icon={<CalendarMonth sx={{ fontSize: '14px !important' }} />}
                                        label={formatDate(item.datePlanifiee)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: 11, height: 24 }}
                                      />
                                      {item.technicienNom ? (
                                        <Chip
                                          avatar={
                                            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: column.color }}>
                                              {item.technicienPrenom?.[0]}{item.technicienNom?.[0]}
                                            </Avatar>
                                          }
                                          label={`${item.technicienPrenom} ${item.technicienNom}`}
                                          size="small"
                                          sx={{ fontSize: 11, height: 24 }}
                                        />
                                      ) : (
                                        <Chip
                                          icon={<Person sx={{ fontSize: '14px !important' }} />}
                                          label="Non assigné"
                                          size="small"
                                          variant="outlined"
                                          color="warning"
                                          sx={{ fontSize: 11, height: 24 }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && (
                        <Box sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: 100, color: 'text.secondary',
                        }}>
                          <Typography variant="caption">Aucune intervention</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>
    </Box>
  );
}
