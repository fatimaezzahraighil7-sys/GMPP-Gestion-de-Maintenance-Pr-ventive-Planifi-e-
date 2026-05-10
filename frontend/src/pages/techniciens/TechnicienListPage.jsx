import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, LinearProgress,
  Button, IconButton,
} from '@mui/material';
import { Person, Engineering, Edit } from '@mui/icons-material';
import { technicienService } from '../../services/api';
import { ROLE_LABELS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export default function TechnicienListPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [techniciens, setTechniciens] = useState([]);
  const [charges, setCharges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await technicienService.getAll();
        setTechniciens(data);
        const chargePromises = data.map(async (t) => {
          try {
            const { data: c } = await technicienService.getCharge(t.id);
            return { id: t.id, charge: c.charge };
          } catch { return { id: t.id, charge: 0 }; }
        });
        const chargeResults = await Promise.all(chargePromises);
        const chargeMap = {};
        chargeResults.forEach((r) => { chargeMap[r.id] = r.charge; });
        setCharges(chargeMap);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const maxCharge = Math.max(...Object.values(charges), 1);

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Techniciens</Typography>
        {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
          <Button variant="contained" startIcon={<Person />} onClick={() => navigate('/techniciens/new')}
            sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            Ajouter
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {techniciens.map((tech) => (
          <Grid item xs={12} md={6} lg={4} key={tech.id}>
            <Card sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(99,102,241,0.15)' },
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  {hasRole(['ADMIN', 'RESPONSABLE_MAINTENANCE']) && (
                    <IconButton size="small" onClick={() => navigate(`/techniciens/${tech.id}/edit`)}
                      sx={{ color: '#818CF8' }} title="Modifier">
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Person sx={{ color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {tech.prenom} {tech.nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{tech.matricule}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Spécialités</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {tech.specialites?.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined"
                        sx={{ borderColor: 'rgba(99,102,241,0.3)', color: '#818CF8', fontSize: 11 }} />
                    ))}
                    {(!tech.specialites || tech.specialites.length === 0) && (
                      <Typography variant="caption" color="text.secondary">Aucune</Typography>
                    )}
                  </Box>
                </Box>

                {tech.certifications?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Certifications</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {tech.certifications.map((c) => (
                        <Chip key={c} label={c} size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Charge de travail</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {charges[tech.id] || 0} intervention(s)
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate"
                    value={Math.min(((charges[tech.id] || 0) / maxCharge) * 100, 100)}
                    sx={{
                      height: 6, borderRadius: 3, bgcolor: 'rgba(148,163,184,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: (charges[tech.id] || 0) > maxCharge * 0.8
                          ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                          : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {techniciens.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">Aucun technicien actif</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
