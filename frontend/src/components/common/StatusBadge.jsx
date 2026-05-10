import { Chip } from '@mui/material';
import { STATUS_COLORS, STATUS_LABELS, MACHINE_STATUS_COLORS, MACHINE_STATUS_LABELS } from '../../utils/constants';

export function StatusBadge({ statut }) {
  return (
    <Chip
      label={STATUS_LABELS[statut] || statut}
      color={STATUS_COLORS[statut] || 'default'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
}

export function MachineStatusBadge({ statut }) {
  return (
    <Chip
      label={MACHINE_STATUS_LABELS[statut] || statut}
      color={MACHINE_STATUS_COLORS[statut] || 'default'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
}
