import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider
} from '@mui/material';
import { 
  PictureAsPdf, TableChart, BarChart as BarChartIcon, Article, 
  Engineering, ShoppingCart 
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import KPICard from '../../components/common/KPICard';
import { rapportService } from '../../services/api';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function RapportPage() {
  const [dateDebut, setDateDebut] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [consommation, setConsommation] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [kpiRes, perfRes, consoRes] = await Promise.all([
        rapportService.getKPIs(dateDebut, dateFin),
        rapportService.getPerformance(dateDebut, dateFin),
        rapportService.getConsommation(dateDebut, dateFin)
      ]);
      setStats(kpiRes.data);
      setPerformance(perfRes.data);
      setConsommation(consoRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleExport = async (type) => {
    try {
      let response, mimeType, extension;
      if (type === 'PDF') {
        response = await rapportService.exportPDF(dateDebut, dateFin);
        mimeType = 'application/pdf';
        extension = 'pdf';
      } else if (type === 'Excel') {
        response = await rapportService.exportExcel(dateDebut, dateFin);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
      } else {
        response = await rapportService.exportCSV(dateDebut, dateFin);
        mimeType = 'text/csv';
        extension = 'csv';
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_gmpp_${dateDebut}_${dateFin}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const barData = stats?.interventionsParMois
    ? Object.entries(stats.interventionsParMois).map(([month, count]) => ({ mois: month, interventions: count }))
    : [];

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Rapports de Maintenance</Typography>

      <Card sx={{ mb: 4, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField type="date" label="Date début" size="small" value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)} InputLabelProps={{ shrink: true }} id="rapport-date-debut" />
          <TextField type="date" label="Date fin" size="small" value={dateFin}
            onChange={(e) => setDateFin(e.target.value)} InputLabelProps={{ shrink: true }} id="rapport-date-fin" />
          
          <Button variant="contained" onClick={fetchAllData} disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BarChartIcon />}
            sx={{ px: 3, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Générer les rapports
          </Button>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => handleExport('PDF')}
              disabled={!stats} color="error" size="small">PDF</Button>
            <Button variant="outlined" startIcon={<Article />} onClick={() => handleExport('Excel')}
              disabled={!stats} color="success" size="small">Excel</Button>
            <Button variant="outlined" startIcon={<TableChart />} onClick={() => handleExport('CSV')}
              disabled={!stats} color="info" size="small">CSV</Button>
          </Box>
        </CardContent>
      </Card>

      {stats && (
        <>
          {/* Key Indicators */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Taux de réalisation" value={`${stats.tauxRealisation}`} unit="%" color="#6366F1"
                icon={<BarChartIcon sx={{ color: '#6366F1' }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Interventions terminées" value={stats.nbInterventionsTerminees} color="#10B981"
                icon={<BarChartIcon sx={{ color: '#10B981' }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="En retard" value={stats.nbInterventionsEnRetard} color="#EF4444"
                icon={<BarChartIcon sx={{ color: '#EF4444' }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard title="Consommables utilisés" value={consommation.length} color="#F59E0B"
                icon={<ShoppingCart sx={{ color: '#F59E0B' }} />} />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Evolution chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Évolution mensuelle des interventions</Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="mois" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8 }} />
                      <Bar dataKey="interventions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Consumables chart */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Répartition Consommables</Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={consommation}
                        dataKey="quantite"
                        nameKey="consommable"
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                      >
                        {consommation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Table */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Engineering sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Performance des Techniciens</Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Technicien</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>Total</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>Taux Réussite</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>En retard</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performance.map((row) => (
                          <TableRow key={row.technicienId}>
                            <TableCell>{row.technicienNom}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>{row.totalInterventions}</TableCell>
                            <TableCell sx={{ textAlign: 'center', color: row.tauxCompletion > 80 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                              {row.tauxCompletion}%
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', color: row.interventionsEnRetard > 0 ? '#EF4444' : 'inherit' }}>
                              {row.interventionsEnRetard}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Consumption Table */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingCart sx={{ mr: 1, color: '#F59E0B' }} />
                    <Typography variant="h6">Détail Consommation</Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Consommable</TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>Quantité Totale</TableCell>
                          <TableCell>Unité</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consommation.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.consommable}</TableCell>
                            <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>{row.quantite}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.unite}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
