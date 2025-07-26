import axios from "axios";  // 引入axios库的类型定义
import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios"
import {ElMessage} from "element-plus";

// const baseURL: string = "https://dev.uncleyumo.cn/api/toqy/";
const baseURL: string = "http://localhost:8086";

type ResponseDataType<T> = {
    code: number;
    msg: string;
    data: T;
};

interface AxiosInstanceWithResponseType extends AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>;
}

// 修改为 baseURL 以符合 Axios 的配置选项
const instance: AxiosInstanceWithResponseType = axios.create({ baseURL: baseURL }) as AxiosInstanceWithResponseType

// 请求拦截器
instance.interceptors.request.use()

// 响应拦截器
instance.interceptors.response.use(
    // @ts-ignore
    async <T>(response: AxiosResponse<ResponseDataType<T>>) => {
        const result = response.data
        console.log("响应拦截器开始");
        if (result.code === 0) {
            return result;
        }
        ElMessage.error(result.msg);
        return Promise.reject(new Error(result.msg));
    },
    error => {
        console.log("响应拦截器错误");
        return Promise.reject(error);
    }
)

export default instance;