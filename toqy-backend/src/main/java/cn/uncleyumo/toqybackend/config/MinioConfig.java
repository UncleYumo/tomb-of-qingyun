package cn.uncleyumo.toqybackend.config;

import cn.uncleyumo.toqybackend.properties.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author uncle_yumo
 * @fileName MinioConfig
 * @createDate 2025/7/25 July
 * @school 无锡学院
 * @studentID 22344131
 * @description
 */

@Configuration
public class MinioConfig {

    private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);

    private final MinioProperties minioProperties;

    public MinioConfig(MinioProperties minioProperties) {
        this.minioProperties = minioProperties;
    }

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(minioProperties.getEndPoint())
                .credentials(
                        minioProperties.getAccessKey(),
                        minioProperties.getSecretKey()
                ).build();
    }
    
    @Bean
    public CommandLineRunner initMinioBucket(MinioClient minioClient) {
        return args -> {
            try {
                boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(minioProperties.getBucketName()).build());
                if (!exists) {
                    logger.info("Creating MinIO bucket: {}", minioProperties.getBucketName());
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(minioProperties.getBucketName()).build());
                } else {
                    logger.info("MinIO bucket already exists: {}", minioProperties.getBucketName());
                }
            } catch (Exception e) {
                logger.error("Failed to initialize MinIO bucket: {}", minioProperties.getBucketName(), e);
                throw new RuntimeException("MinIO 连接失败", e);
            }
        };
    }
}
