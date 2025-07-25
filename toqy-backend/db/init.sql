CREATE DATABASE IF NOT EXISTS toqy_db;

USE toqy_db;

# 消息表
DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
                                          `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息Id',
                                          `content` TEXT NOT NULL COMMENT '消息内容',
                                          `nickname` VARCHAR(30) COMMENT '昵称',
                                          `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数量',
                                          `dislike_count` INT NOT NULL DEFAULT 0 COMMENT '点踩数量',
                                          `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

# 图片表
DROP TABLE IF EXISTS `images`;
CREATE TABLE IF NOT EXISTS `images` (
                                        `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '图片Id',
                                        `url` TEXT NOT NULL COMMENT '图片链接',
                                        `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数量',
                                        `dislike_count` INT NOT NULL DEFAULT 0 COMMENT '点踩数量',
                                        `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

# 全局统计信息
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE IF NOT EXISTS `statistics` (
                                            `id` BIGINT PRIMARY KEY COMMENT '全局Id',
                                            `total_merit` BIGINT NOT NULL DEFAULT 0 COMMENT '功德总数',
                                            `avatar_url` TEXT NOT NULL COMMENT '全局头像链接'
);

# 插入全局统计信息（默认）
INSERT INTO `statistics` (`id`, `total_merit`, `avatar_url`) VALUES (1, 0, 'https://wplcode.xyz:9000/toqy/qingyun_avatr.jpg');