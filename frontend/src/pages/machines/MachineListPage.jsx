import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField, MenuItem,
  IconButton, CircularProgress, InputAdornment,
} from '@mui/material';
import { Add, Visibility, Delete, Search, Edit } from '@mui/icons-material';
import { MachineStatusBadge } from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { machineService } from '../../services/api';
import { MACHINE_TYPE_LABELS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useHooks';

export default function MachineListPage() {
  const [machines, setMachines] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const debouncedSearch = useDebounce(search);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statut) params.statut = statut;
      if (type) params.type = type;
      const { data } = await machineService.getAll(params);
      setMachines(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMachines(); }, [page, size, debouncedSearch, statut, type]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await machineService.delete(deleteId);
      setDeleteId(null);
      fetchMachines();
    } catch (err) { console.error(err); }
  };

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Machines</Typography>
        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/machines/new')}
            sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Ajouter
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Rechercher..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 250 }} id="machine-search" />
          <TextField select size="small" label="Statut" value={statut}
            onChange={(e) => { setStatut(e.target.value); setPage(0); }} sx={{ minWidth: 160 }} id="machine-filter-statut">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="EN_SERVICE">En service</MenuItem>
            <MenuItem value="EN_MAINTENANCE">En maintenance</MenuItem>
            <MenuItem value="HORS_SERVICE">Hors service</MenuItem>
            <MenuItem value="EN_REPARATION">En réparation</MenuItem>
          </TextField>
          <TextField select size="small" label="Type" value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }} sx={{ minWidth: 160 }} id="machine-filter-type">
            <MenuItem value="">Tous</MenuItem>
            {Object.entries(MACHINE_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
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
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Localisation</TableCell>
                    <TableCell>Compteur (h)</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machines.map((m) => (
                    <TableRow key={m.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/machines/${m.id}`)}>
                      <TableCell sx={{ fontWeight: 500 }}>{m.nom}</TableCell>
                      <TableCell>{MACHINE_TYPE_LABELS[m.typeMachine] || m.typeMachine}</TableCell>
                      <TableCell><MachineStatusBadge statut={m.statut} /></TableCell>
                      <TableCell>{m.localisation}</TableCell>
                      <TableCell>{m.compteurHoraire?.toLocaleString()}</TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => navigate(`/machines/${m.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
                          <IconButton size="small" onClick={() => navigate(`/machines/${m.id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        {hasRole(['ADMIN']) && (
                          <IconButton size="small" color="error" onClick={() => setDeleteId(m.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {machines.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Aucune machine trouvée</TableCell></TableRow>
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

      <ConfirmModal open={!!deleteId} title="Supprimer la machine"
        message="Êtes-vous sûr de vouloir supprimer cette machine ? Cette action est irréversible."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
