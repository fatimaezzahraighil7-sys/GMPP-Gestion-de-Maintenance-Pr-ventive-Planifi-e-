import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{
      sx: { background: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' }
    }}>
      <DialogTitle sx={{ fontWeight: 600 }}>{title || 'Confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">Annuler</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Confirmer</Button>
      </DialogActions>
    </Dialog>
  );
}
