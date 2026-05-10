import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export default function KPICard({ title, value, unit, subtitle, icon, color = '#6366F1', trend }) {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 30px ${color}20` },
    }}>
      <CardContent sx={{ p: '12px !important', '&:last-child': { pb: '12px !important' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
              {unit && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{unit}</Typography>}
            </Box>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                {trend >= 0 ? <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} /> : <TrendingDown sx={{ fontSize: 16, color: '#EF4444' }} />}
                <Typography variant="caption" sx={{ color: trend >= 0 ? '#10B981' : '#EF4444' }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{
            p: 1.5, borderRadius: 2, bgcolor: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
