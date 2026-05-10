import { useState } from 'react';
import {
  Box, Typography, Dialog, IconButton, ImageList, ImageListItem,
} from '@mui/material';
import {
  Close, ChevronLeft, ChevronRight, ZoomIn, Delete, Image as ImageIcon,
} from '@mui/icons-material';

// Récupération de l'URL de base pour les images
const API_URL = import.meta.env.VITE_API_URL || '';

export default function ImageGallery({
  images = [],
  onDelete,
  canDelete = false,
  columns = 4,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  if (!images || images.length === 0) {
    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        color: 'text.secondary', py: 2,
      }}>
        <ImageIcon sx={{ fontSize: 20 }} />
        <Typography variant="body2">Aucune image</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ImageList cols={columns} gap={8} sx={{ mt: 1 }}>
        {images.map((url, index) => (
          <ImageListItem
            key={index}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              '&:hover .gallery-overlay': { opacity: 1 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <img
              src={url.startsWith('http') ? url : `${API_URL}${url}`}
              alt={`Image ${index + 1}`}
              loading="lazy"
              style={{ width: '100%', height: 160, objectFit: 'cover' }}
              onClick={() => setSelectedIndex(index)}
            />
            <Box
              className="gallery-overlay"
              sx={{
                position: 'absolute', inset: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 1, opacity: 0, transition: 'opacity 0.2s ease',
              }}
            >
              <IconButton
                size="small"
                sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)' }}
                onClick={() => setSelectedIndex(index)}
              >
                <ZoomIn />
              </IconButton>
              {canDelete && onDelete && (
                <IconButton
                  size="small"
                  sx={{ color: '#EF4444', bgcolor: 'rgba(0,0,0,0.5)' }}
                  onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          </ImageListItem>
        ))}
      </ImageList>

      {/* Lightbox / Zoom Dialog */}
      <Dialog
        open={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        maxWidth={false}
        onKeyDown={handleKeyDown}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.95)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        {selectedIndex !== null && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', p: 1,
          }}>
            {/* Close */}
            <IconButton
              onClick={() => setSelectedIndex(null)}
              sx={{
                position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 10,
                bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Close />
            </IconButton>

            {/* Previous */}
            {images.length > 1 && (
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute', left: 8, color: '#fff', zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ChevronLeft sx={{ fontSize: 32 }} />
              </IconButton>
            )}

            {/* Image */}
            <img
              src={images[selectedIndex].startsWith('http') ? images[selectedIndex] : `${API_URL}${images[selectedIndex]}`}
              alt={`Image ${selectedIndex + 1}`}
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />

            {/* Next */}
            {images.length > 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute', right: 8, color: '#fff', zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ChevronRight sx={{ fontSize: 32 }} />
              </IconButton>
            )}

            {/* Counter */}
            <Typography
              variant="caption"
              sx={{
                position: 'absolute', bottom: 12, left: '50%',
                transform: 'translateX(-50%)', color: '#fff',
                bgcolor: 'rgba(0,0,0,0.6)', px: 2, py: 0.5, borderRadius: 2,
              }}
            >
              {selectedIndex + 1} / {images.length}
            </Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
