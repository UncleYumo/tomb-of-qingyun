package cn.uncleyumo.toqybackend.utils;

import cn.uncleyumo.toqybackend.properties.MinioProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * @author Uncle Yumo
 */
@Component
public class MinioFileUtils {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private static final long PART_SIZE = 10485760L; // 10MB part size
    private static final long MAX_FILE_SIZE = 2097152L; // 2MB max file size

    public MinioFileUtils(MinioClient minioClient, MinioProperties minioProperties) {
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
    }

    public String uploadFile(
            MultipartFile file
    ) {
        try (InputStream ips = file.getInputStream()) {
            // 超过2MB的文件禁止上传
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new RuntimeException("文件过大：" + file.getOriginalFilename());
            }

            // 获取文件扩展名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uuidFileName = UUID.randomUUID().toString() + extension;
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(uuidFileName)
                            .stream(ips, -1, PART_SIZE)
                            .contentType(file.getContentType())
                            .build()
            );
            return minioProperties.getFileHost() + "/" + minioProperties.getBucketName() + "/" + uuidFileName;
        } catch (Exception e) {
            throw new RuntimeException("文件上传失败", e);
        }
    }
}
