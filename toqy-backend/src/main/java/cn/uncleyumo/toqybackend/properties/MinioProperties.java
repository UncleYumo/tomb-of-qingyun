package cn.uncleyumo.toqybackend.properties;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author uncle_yumo
 * @fileName MinioProperties
 * @createDate 2025/7/25 July
 * @school 无锡学院
 * @studentID 22344131
 * @description
 */
@Component
@Data
public class MinioProperties {
    @Value("${minio.endpoint}")
    private String endPoint;
    @Value("${minio.fileHost}")
    private String fileHost;
    @Value("${minio.accessKey}")
    private String accessKey;
    @Value("${minio.secretKey}")
    private String secretKey;
    @Value("${minio.bucketName}")
    private String bucketName;
}
