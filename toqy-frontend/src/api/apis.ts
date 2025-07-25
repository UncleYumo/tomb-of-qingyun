import instance from './request';

// =================================================================================
// 通用类型定义 (根据 mybatis-plus 分页插件的返回结构定义)
// =================================================================================

/**
 * 分页查询的通用回调数据类型
 * @template T 实体类型
 */
export type PageCallbackType<T> = {
    records: T[]; // 当前页的数据列表
    total: number; // 总记录数
    size: number; // 每页显示的条数
    current: number; // 当前页码
    pages: number; // 总页数
};

// =================================================================================
// 实体与回调类型定义
// =================================================================================

/**
 * 图片实体类型
 */
export type ImageType = {
    id: number;
    url: string;
    likeCount: number;
    dislikeCount: number;
    createTime: string; // 后端 LocalDateTime/Timestamp 通常序列化为 ISO 8601 字符串
};

/**
 * 留言实体类型
 */
export type MessageType = {
    id: number;
    content: string;
    nickname: string;
    likeCount: number;
    dislikeCount: number;
    createTime: string;
};

/**
 * 全局统计信息实体类型
 */
export type StatisticsType = {
    id: number;
    totalMerit: number;
    avatarUrl: string;
};

/**
 * 获取图片列表的回调数据类型
 */
export type ImageListCallbackType = PageCallbackType<ImageType>;

/**
 * 获取留言列表的回调数据类型
 */
export type MessageListCallbackType = PageCallbackType<MessageType>;

/**
 * 获取全局统计信息的回调数据类型
 */
export type StatisticsCallbackType = StatisticsType;


// =================================================================================
// ImagesController 接口封装
// =================================================================================

/**
 * 上传图片
 * @param file 要上传的图片文件
 */
export const uploadImageAPI = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        await instance.post<void>('/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return true;
    } catch (error) {
        console.error("上传图片失败:", error);
        return false;
    }
};

/**
 * 获取图片列表
 * @param params 请求参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页数量
 * @param params.order 排序方式 ('desc' 或 'asc')
 */
export const getImageListAPI = async (params: { pageNum: number; pageSize: number; order: string }) => {
    try {
        const result = await instance.get<ImageListCallbackType>('/images', { params });
        return result; // request.ts 中已经处理了 .data 的提取
    } catch (error) {
        console.error("获取图片列表失败:", error);
        return false;
    }
};

/**
 * 根据ID删除图片
 * @param id 图片ID
 */
export const deleteImageByIdAPI = async (id: number) => {
    try {
        await instance.delete<void>(`/images/${id}`);
        return true;
    } catch (error) {
        console.error("删除图片失败:", error);
        return false;
    }
};

/**
 * 根据ID点赞图片
 * @param id 图片ID
 */
export const likeImageByIdAPI = async (id: number) => {
    try {
        await instance.post<void>(`/images/${id}/like`);
        return true;
    } catch (error) {
        console.error("点赞图片失败:", error);
        return false;
    }
};

/**
 * 根据ID点踩图片
 * @param id 图片ID
 */
export const dislikeImageByIdAPI = async (id: number) => {
    try {
        await instance.post<void>(`/images/${id}/dislike`);
        return true;
    } catch (error) {
        console.error("点踩图片失败:", error);
        return false;
    }
};

// =================================================================================
// MessagesController 接口封装
// =================================================================================

/**
 * 获取留言信息列表
 * @param params 请求参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页数量
 * @param params.order 排序方式 ('desc' 或 'asc')
 */
export const getMessagesListAPI = async (params: { pageNum: number; pageSize: number; order: string }) => {
    try {
        const result = await instance.get<MessageListCallbackType>('/messages', { params });
        return result;
    } catch (error) {
        console.error("获取留言列表失败:", error);
        return false;
    }
};

/**
 * 新增留言
 * @param data 留言内容
 * @param data.nickname 昵称
 * @param data.content 内容
 */
export const addMessageAPI = async (data: { nickname: string; content: string }) => {
    try {
        // 使用 URLSearchParams 来发送 application/x-www-form-urlencoded 格式的数据
        const params = new URLSearchParams();
        params.append('nickname', data.nickname);
        params.append('content', data.content);
        await instance.post<boolean>('/messages', params);
        return true;
    } catch (error) {
        console.error("新增留言失败:", error);
        return false;
    }
};

/**
 * 根据ID点赞留言
 * @param id 留言ID
 */
export const likeMessageByIdAPI = async (id: number) => {
    try {
        await instance.post<void>(`/messages/${id}/like`);
        return true;
    } catch (error) {
        console.error("点赞留言失败:", error);
        return false;
    }
};

/**
 * 根据ID点踩留言
 * @param id 留言ID
 */
export const dislikeMessageByIdAPI = async (id: number) => {
    try {
        await instance.post<void>(`/messages/${id}/dislike`);
        return true;
    } catch (error) {
        console.error("点踩留言失败:", error);
        return false;
    }
};

/**
 * 根据ID删除留言
 * @param id 留言ID
 */
export const deleteMessageByIdAPI = async (id: number) => {
    try {
        await instance.delete<void>(`/messages/${id}`);
        return true;
    } catch (error) {
        console.error("删除留言失败:", error);
        return false;
    }
};

// =================================================================================
// StatisticsController 接口封装
// =================================================================================

/**
 * 获取全局信息统计
 */
export const getStatisticsAPI = async () => {
    try {
        const result = await instance.get<StatisticsCallbackType>('/statistics');
        return result;
    } catch (error) {
        console.error("获取全局统计信息失败:", error);
        return false;
    }
};

/**
 * 更新全局信息统计
 * @param data 统计信息对象
 */
export const updateStatisticsAPI = async (data: StatisticsType) => {
    try {
        await instance.put<void>('/statistics', data);
        return true;
    } catch (error) {
        console.error("更新全局统计信息失败:", error);
        return false;
    }
};

/**
 * 功德加一
 */
export const addMeritAPI = async () => {
    try {
        await instance.put<void>('/statistics/addMerit');
        return true;
    } catch (error) {
        console.error("功德+1失败:", error);
        return false;
    }
};