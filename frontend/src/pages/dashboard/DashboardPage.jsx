import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Chip, CircularProgress } from '@mui/material';
import { Build, Engineering, Warning, CheckCircle, Schedule, TrendingUp } from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import KPICard from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { rapportService, interventionService } from '../../services/api';
import { formatDateTime } from '../../utils/constants';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [retard, setRetard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const today = new Date();
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateDebut = sixMonthsAgo.toISOString().split('T')[0];
      const dateFin = today.toISOString().split('T')[0];

      if (hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE'])) {
        const todayStr = new Date().toISOString().split('T')[0];
        const [statsRes, retardRes, allRes] = await Promise.all([
          rapportService.getKPIs(dateDebut, dateFin),
          interventionService.getRetard(),
          interventionService.getAll({ size: 1000 }),
        ]);
        const allList = allRes.data.content || [];
        const retardList = retardRes.data || [];
        const interventionsDuJour = allList.filter(i =>
          i.datePlanifiee && i.datePlanifiee.startsWith(todayStr)
        );
        setStats({
          ...statsRes.data,
          nbAffectees: allList.length,
          nbRealisees: allList.filter(i => i.statut === 'TERMINEE').length,
          nbInterventionsEnRetard: retardList.length,
          interventionsDuJour,
          _allList: allList,
        });
        setRetard(retardList);
      } else {
        const { data } = await interventionService.getMesInterventions({ size: 100 });
        const list = data.content || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const now = new Date();
        const interventionsDuJour = list.filter(i =>
          i.datePlanifiee && i.datePlanifiee.startsWith(todayStr)
        );
        const enRetard = list.filter(i =>
          i.statut !== 'TERMINEE' && i.statut !== 'ANNULEE' &&
          i.datePlanifiee && new Date(i.datePlanifiee) < now
        );
        setStats({
          nbAffectees: list.length,
          nbRealisees: list.filter(i => i.statut === 'TERMINEE').length,
          nbInterventionsEnRetard: enRetard.length,
          isTechnician: true,
          interventionsDuJour,
          _allList: list,
        });
        setRetard(enRetard);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasRole]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Graphique par jours du mois courant
  const barData = (() => {
    const sourceList = stats?._allList || [];
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      jour: String(i + 1),
      interventions: 0,
    }));
    sourceList.forEach(item => {
      if (!item.datePlanifiee) return;
      const d = new Date(item.datePlanifiee);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const dayIndex = d.getDate() - 1;
        days[dayIndex].interventions += 1;
      }
    });
    return days;
  })();

  // Pourcentage réalisées
  const pctRealisees = stats?.nbAffectees > 0
    ? Math.round((stats.nbRealisees / stats.nbAffectees) * 100)
    : 0;

  return (
    <Box className="fade-in">
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>Tableau de bord</Typography>

      {retard.length > 0 && (
        <Alert severity="error" icon={<Warning />} sx={{ mb: 1.5, py: 0.5 }}>
          <strong>{retard.length} intervention(s) en retard</strong> nécessitent votre attention
        </Alert>
      )}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <KPICard title="Affectées" value={stats?.nbAffectees || 0}
            subtitle="interventions"
            icon={<Engineering sx={{ color: '#3B82F6' }} />} color="#3B82F6" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="Réalisées" value={stats?.nbRealisees || 0}
            subtitle="interventions"
            icon={<CheckCircle sx={{ color: '#10B981' }} />} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="En retard" value={stats?.nbInterventionsEnRetard || 0}
            subtitle="interventions"
            icon={<Warning sx={{ color: '#EF4444' }} />} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <KPICard title="Taux de réalisation" value={pctRealisees} unit="%"
            subtitle="ce mois-ci"
            icon={<TrendingUp sx={{ color: '#6366F1' }} />} color="#6366F1" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Interventions — {today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="jour" stroke="#94A3B8" tick={{ fontSize: 11 }}
                    label={{ value: 'Jours', position: 'insideBottom', offset: -2, fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis stroke="#94A3B8" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8 }}
                    formatter={(v, name) => [v, name === 'interventions' ? 'Total' : 'Réalisées']} />
                  <Bar dataKey="interventions" fill="#6366F1" radius={[4, 4, 0, 0]} name="interventions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Temps Moyen / Opération</Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {stats?.tempsMoyenParTypeOperation && Object.entries(stats.tempsMoyenParTypeOperation).map(([type, time]) => (
                      <TableRow key={type}>
                        <TableCell sx={{ fontSize: '0.8rem', py: 0.5 }}>{type.replace('_', ' ')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, py: 0.5 }}>{Math.round(time)} min</TableCell>
                      </TableRow>
                    ))}
                    {(!stats?.tempsMoyenParTypeOperation || Object.keys(stats.tempsMoyenParTypeOperation).length === 0) && (
                      <TableRow><TableCell align="center" sx={{ color: 'text.secondary', py: 2 }}>Aucune donnée</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>🗓️ Interventions du jour</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Machine</TableCell>
                      <TableCell>Heure planifiée</TableCell>
                      <TableCell>Technicien</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(stats?.interventionsDuJour || []).length > 0 ? (
                      (stats.interventionsDuJour).map((item, i) => (
                        <TableRow key={i} hover sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/interventions/${item.id}`)}>
                          <TableCell sx={{ fontWeight: 500 }}>{item.machineNom}</TableCell>
                          <TableCell>{formatDateTime(item.datePlanifiee)}</TableCell>
                          <TableCell>{`${item.technicienPrenom || ''} ${item.technicienNom || ''}`}</TableCell>
                          <TableCell><StatusBadge statut={item.statut} /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          ✅ Aucune intervention planifiée pour aujourd'hui
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
