package cn.uncleyumo.toqybackend.model.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author uncle_yumo
 * @fileName ResultEntity
 * @createDate 2025/7/25 July
 * @school 无锡学院
 * @studentID 22344131
 * @description
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResultEntity {
    private Integer code;
    private String msg;
    private Object data;

    public static ResultEntity success(Object data) {
        return ResultEntity.builder().code(0).msg("success").data(data).build();
    }

    public static ResultEntity success() {
        return ResultEntity.builder().code(0).msg("success").data(null).build();
    }

    public static ResultEntity success(String msg, Object data) {
        return ResultEntity.builder().code(0).msg(msg).data(data).build();
    }

    public static ResultEntity error(String msg) {
        return ResultEntity.builder().code(1).msg(msg).data(null).build();
    }
}
