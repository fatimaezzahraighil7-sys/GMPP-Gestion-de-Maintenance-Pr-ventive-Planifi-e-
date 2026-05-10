package com.gmpp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "Upload et gestion des images")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    private static final String IMAGE_DIR = "uploads/images";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    /**
     * Upload une seule image.
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Uploader une image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        String error = validateFile(file);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);
        }

        try {
            String url = saveFile(file);
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            logger.error("Erreur upload image: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erreur lors de l'upload: " + e.getMessage());
        }
    }

    /**
     * Upload multiple images.
     */
    @PostMapping("/upload-multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Uploader plusieurs images")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") MultipartFile[] files) {
        if (files.length == 0) {
            return ResponseEntity.badRequest().body("Aucun fichier fourni");
        }
        if (files.length > 10) {
            return ResponseEntity.badRequest().body("Maximum 10 images par upload");
        }

        List<String> urls = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            String error = validateFile(file);
            if (error != null) {
                errors.add(file.getOriginalFilename() + ": " + error);
                continue;
            }
            try {
                urls.add(saveFile(file));
            } catch (IOException e) {
                errors.add(file.getOriginalFilename() + ": Erreur upload");
                logger.error("Erreur upload {}: {}", file.getOriginalFilename(), e.getMessage());
            }
        }

        if (urls.isEmpty() && !errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        return ResponseEntity.ok(urls);
    }

    private String validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            return "Fichier vide";
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return "Fichier trop volumineux (max 5 Mo)";
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return "Type de fichier non autorisé. Types acceptés : JPG, PNG, GIF, WebP";
        }
        return null;
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path root = Paths.get(IMAGE_DIR);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : ".jpg";
        String fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + extension;
        Path path = root.resolve(fileName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        String url = "/api/images/" + fileName;
        logger.debug("Image uploadée: {}", url);
        return url;
    }
}
