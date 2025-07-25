package cn.uncleyumo.toqybackend.handler;

import cn.uncleyumo.toqybackend.model.result.ResultEntity;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * @author uncle_yumo
 * @fileName GlobalExceptionHandler
 * @createDate 2025/7/24 July
 * @school 无锡学院
 * @studentID 22344131
 * @description
 */

@Slf4j
@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResultEntity handlerException(Exception e) {
        log.error("全局异常拦截：{}", e.getMessage());
        if (e.getMessage().length() <= 30) {
            return ResultEntity.error(e.getMessage());
        }
        return ResultEntity.error("请求错误，请稍后重试！");
    }
}
