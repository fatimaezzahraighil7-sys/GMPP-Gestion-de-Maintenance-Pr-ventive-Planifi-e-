import { useState, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, IconButton, LinearProgress,
} from '@mui/material';
import { CloudUpload, Close, Image as ImageIcon } from '@mui/icons-material';

const MAX_SIZE_DEFAULT = 5 * 1024 * 1024; // 5 Mo
const ACCEPT_DEFAULT = 'image/jpeg,image/png,image/gif,image/webp';

export default function ImageUpload({
  onUpload,
  multiple = false,
  maxSize = MAX_SIZE_DEFAULT,
  accept = ACCEPT_DEFAULT,
  maxFiles = 10,
  label = 'Uploader des images',
}) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `${file.name} dépasse la taille maximale (${Math.round(maxSize / 1024 / 1024)} Mo)`;
    }
    const acceptTypes = accept.split(',').map((t) => t.trim());
    if (!acceptTypes.includes(file.type)) {
      return `${file.name} : type non autorisé. Types acceptés : JPG, PNG, GIF, WebP`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles) => {
    setError('');
    const fileList = Array.from(newFiles);

    if (!multiple && fileList.length > 1) {
      setError('Un seul fichier autorisé');
      return;
    }
    if (files.length + fileList.length > maxFiles) {
      setError(`Maximum ${maxFiles} images`);
      return;
    }

    const validFiles = [];
    const errors = [];

    for (const file of fileList) {
      const err = validateFile(file);
      if (err) {
        errors.push(err);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
      }));

      if (multiple) {
        setFiles((prev) => [...prev, ...validFiles]);
        setPreviews((prev) => [...prev, ...newPreviews]);
      } else {
        // Release previous object URLs
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setFiles(validFiles);
        setPreviews(newPreviews);
      }
    }
  }, [files, previews, multiple, maxFiles, accept, maxSize]);

  const removePreview = (index) => {
    URL.revokeObjectURL(previews[index].url);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await onUpload(multiple ? files : files[0]);
      // Clear after successful upload
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setFiles([]);
    } catch (err) {
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          bgcolor: dragOver ? 'action.hover' : 'transparent',
          '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
        }}
      >
        <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Glisser-déposer ou cliquer • JPG, PNG, GIF, WebP • Max {Math.round(maxSize / 1024 / 1024)} Mo
        </Typography>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      {/* Previews */}
      {previews.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
          {previews.map((preview, index) => (
            <Box key={index} sx={{
              position: 'relative', width: 120, height: 120, borderRadius: 2, overflow: 'hidden',
              border: '1px solid', borderColor: 'divider',
            }}>
              <img
                src={preview.url}
                alt={preview.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); removePreview(index); }}
                sx={{
                  position: 'absolute', top: 2, right: 2,
                  bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  width: 24, height: 24,
                }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                  px: 0.5, py: 0.25, fontSize: 10,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {preview.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {uploading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={18} /> : <ImageIcon />}
            onClick={handleUpload}
            disabled={uploading}
            size="small"
            sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            {uploading ? 'Upload en cours...' : `Uploader ${files.length} image${files.length > 1 ? 's' : ''}`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
