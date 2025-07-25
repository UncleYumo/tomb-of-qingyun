package cn.uncleyumo.toqybackend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;

/**
 * @author uncle_yumo
 * @fileName SwaggerConfig
 * @createDate 2025/7/23 July
 * @school 无锡学院
 * @studentID 22344131
 * @description
 */

public class SwaggerConfig {

    @Bean
    public OpenAPI springShopOpenApi() {
        return new OpenAPI()
                .openapi("3.0.0")
                .info(new Info()
                        .title("青云的小坟 - Tomb Of Qingyun")
                        .description("青云的小坟 RESTful API 文档")
                        .version("v1"))
                .externalDocs(new ExternalDocumentation()
                        .description("前端访问地址")
                        .url("http://localhost:5176"));
    }

}