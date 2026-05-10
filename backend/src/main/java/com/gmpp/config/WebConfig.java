package com.gmpp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        registry.addResourceHandler("/api/interventions/photo/**")
                .addResourceLocations("file:///" + uploadPath + "/interventions/", "file:uploads/interventions/");

        Path imagesDir = Paths.get("uploads/images");
        String imagesPath = imagesDir.toFile().getAbsolutePath();
        registry.addResourceHandler("/api/images/**")
                .addResourceLocations("file:///" + imagesPath + "/", "file:uploads/images/");
    }
}
