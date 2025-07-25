<script setup lang="ts">
import {
  addMeritAPI, deleteMessageByIdAPI, dislikeMessageByIdAPI,
  getMessagesListAPI,
  getStatisticsAPI, likeMessageByIdAPI,
  type MessageType,
  type StatisticsType
} from "./api/apis.ts";
import {onMounted, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";

// 初始化数据
const statisticsData = ref<StatisticsType>({
  id: -1,
  totalMerit: -1,
  avatarUrl: "",
});

const currentMeritCount = ref(0);
const messagePagination = reactive({
  pageNum: 1,
  pageSize: 10,
  order: 'desc'
});

watch(() => messagePagination, () => {
  fetchMessageListData();
}, {
  deep: true
})

const messageListData = ref<MessageType[]>()

const fetchStatisticsData = async () => {
  const res = await getStatisticsAPI();
  if (!res) {
    ElMessage.error("获取功德台数据失败");
    return;
  }
  statisticsData.value = res;
};

const messagePageNumOptions = [
  {
    label: "第1页",
    value: 1
  },
  {
    label: "第2页",
    value: 2
  },
  {
    label: "第3页",
    value: 3
  },
  {
    label: "第4页",
    value: 4
  },
  {
    label: "第5页",
    value: 5
  }
]

const messagePageSizeOptions = [
  {
    label: "10条/页",
    value: 10
  },
  {
    label: "20条/页",
    value: 20
  },
  {
    label: "30条/页",
    value: 30
  }
]

const fetchMessageListData = async () => {
  const res = await getMessagesListAPI({
    pageNum: messagePagination.pageNum,
    pageSize: messagePagination.pageSize,
    order: messagePagination.order
  });
  if (!res) {
    ElMessage.error("获取留言列表失败");
    return; // 提早返回，防止继续执行
  }
  messageListData.value = res;
}

onMounted(() => {
  fetchStatisticsData();
  fetchMessageListData();
});

// -- 以下是新增的核心逻辑 --

const audioRef = ref<HTMLAudioElement | null>(null);
const isAvatarAnimating = ref(false);

// 加功德的方法
const addMerit = async () => {
  // 1. 播放声音
  if (audioRef.value) {
    audioRef.value.currentTime = 0; // 从头开始播放
    audioRef.value.play();
  }

  // 2. 更新总功德数
  currentMeritCount.value += 1;
  await addMeritAPI();
  await fetchStatisticsData();

  // 3. 头像放大动画
  isAvatarAnimating.value = true;
  setTimeout(() => {
    isAvatarAnimating.value = false;
  }, 200); // 动画时长为300ms

  // 4. 创建并显示 "+1" 动画
  createMeritPlusOneAnimation();
};

const createMeritPlusOneAnimation = () => {
  const meritPlusOne = document.createElement('div');
  meritPlusOne.innerText = '功德+1';
  meritPlusOne.className = 'merit-plus-one-animation'; // 应用动画class

  // 将元素添加到头像容器的父节点中，方便定位
  const container = document.querySelector('.statistic-content-container');
  if (container) {
    container.appendChild(meritPlusOne);
  }

  // 动画结束后移除元素
  meritPlusOne.addEventListener('animationend', () => {
    meritPlusOne.remove();
  });
};

const handleMessageDelete = async (id: number) => {
  const res = await deleteMessageByIdAPI(id);
  if (!res) {
    ElMessage.error("删除留言失败");
    return;
  }
  ElMessage.success("删除留言成功");
  await fetchMessageListData();
};

const handleLikeMessageById = async (id: number) => {
  const res = await likeMessageByIdAPI(id);
  if (!res) {
    ElMessage.error("点赞失败");
    return;
  }
  ElMessage.success("点赞成功");
  await fetchMessageListData();
};

const handleDislikeMessageById = async (id: number) => {
  const res = await dislikeMessageByIdAPI(id);
  if (!res) {
    ElMessage.error("点踩失败");
    return;
  }
  ElMessage.success("点踩成功");
  await fetchMessageListData();
};

</script>

<template>
  <div style="display: flex; flex-direction: column;">
    <div class="home-container">
      <!-- 青云功德台 -->
      <div class="statistic-container">
        <div class="statistic-title-container">
          <h2>青云功德台</h2>
          <h6>您在功德台收获的功德将扣在青云头上</h6>
        </div>
        <div class="statistic-content-container">
          <!-- “功德+1”的动画将出现在这里 -->
          <el-avatar
              class="clickable-avatar"
              style="margin: 10px auto;"
              shape="circle"
              :size="80"
              fit="cover"
              :src="statisticsData.avatarUrl"
              @click="addMerit"
              :class="{ 'avatar-scale-animation': isAvatarAnimating }"
          />
          <span
              style="font-size: small; font-style: italic; color: dimgray;">英年早逝，天妒英才。此子已除，国泰民安。</span>
        </div>
        <el-divider></el-divider>
        <div class="statistic-data-container">
          <el-statistic :value="statisticsData.totalMerit">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                青云失去的总功德
              </div>
            </template>
          </el-statistic>
          <el-statistic :value="currentMeritCount">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                您当前得到的功德
              </div>
            </template>
          </el-statistic>
        </div>
      </div>
      <el-divider></el-divider>
      <!-- 留言展示板 -->
      <div class="message-board-container">
        <h3>上香&留言</h3>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">
          <el-select v-model="messagePagination.pageSize" placeholder="Select" style="width: 100px">
            <el-option
                v-for="item in messagePageSizeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>

          <el-select v-model="messagePagination.pageNum" placeholder="Select"
                     style="width: 100px;margin-left: 10px; margin-right: 10px">
            <el-option
                v-for="item in messagePageNumOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <el-button @click="messagePagination.order = messagePagination.order === 'desc' ? 'asc' : 'desc'">
            {{ messagePagination.order === 'desc' ? '最新留言' : '最早留言' }}
          </el-button>
        </div>
        <el-card class="message-list" v-for="message in messageListData" style="margin-top: 16px;min-width: 350px" shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: bolder;font-size: smaller">{{message.nickname}}</span>
              <span style="font-size: small; color: dimgray;">{{message.createTime}}</span>
            </div>
          </template>
          <span style="font-size: smaller">{{ message.content }}</span>
          <template #footer>
            <div style="display: flex; flex-direction: row; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: small; color: dimgray;">赞 {{message.likeCount}}</span>
                <el-divider direction="vertical"></el-divider>
                <span style="font-size: small; color: dimgray;">踩 {{message.dislikeCount}}</span>
              </div>
              <div style="display: flex; justify-content: right;">
                <el-button type="primary" size="small" @click="handleLikeMessageById(message.id)">赞</el-button>
                <el-button type="warning" size="small" @click="handleDislikeMessageById(message.id)">踩</el-button>
                <el-button type="danger" size="small" @click="handleMessageDelete(message.id)">删</el-button>
              </div>
            </div>
          </template>
        </el-card>
      </div>
      <el-divider></el-divider>
      <!-- 图片展示板 -->
      <div class="image-board-container">
        图片展示板
      </div>
    </div>
  </div>

  <!--  音频播放器，隐藏起来 -->
  <audio ref="audioRef" src="/muyu.wav" preload="auto" style="display: none;"></audio>
</template>

<style scoped>
.home-container {
  margin: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.statistic-container {
  margin-top: 0;
  text-align: center;
}

.statistic-title-container {
  background-color: #afb6c5;
  text-align: center;
  padding: 10px 0;
  color: white;
  line-height: 0.5;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.statistic-content-container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 10px;
}

/*
  针对头像的最终解决方案
*/
.clickable-avatar {
  cursor: pointer;

  /* 关键：移除移动端点击时的蓝色或灰色覆盖层 */
  -webkit-tap-highlight-color: transparent;

  /* 再次确保移除桌面端的蓝色轮廓 */
  outline: none;

  /* 关键：防止用户点击时意外选中文本或图片 */
  user-select: none;
}

/* 头像点击放大动画 */
.avatar-scale-animation {
  animation: scale-up 0.3s ease-out;
}

@keyframes scale-up {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* "功德+1" 动画效果 */
:deep(.merit-plus-one-animation) {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: #E6A23C;
  font-size: 24px;
  font-weight: bold;
  animation: fade-and-move-up 1.5s forwards;
  pointer-events: none;
  user-select: none;
}

@keyframes fade-and-move-up {
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -80px);
  }
}

.statistic-data-container {
  display: flex;
  justify-content: space-between;
  padding: 0 70px;
}

.message-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>