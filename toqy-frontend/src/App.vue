<script setup lang="ts">
import {
  addMeritAPI,
  addMessageAPI,
  deleteImageByIdAPI,
  deleteMessageByIdAPI,
  dislikeImageByIdAPI,
  dislikeMessageByIdAPI,
  getImageListAPI,
  getMessagesListAPI,
  getStatisticsAPI,
  type ImageType,
  likeImageByIdAPI,
  likeMessageByIdAPI,
  type MessageType,
  type StatisticsType,
  uploadImageAPI,
  updateAvatarAPI, // 导入更新头像的API
} from "./api/apis.ts";
import {onMounted, reactive, ref, watch} from "vue";
import {ElMessage, genFileId, type UploadFile, type UploadProps, type UploadRawFile} from "element-plus";
import { UploadFilled, Edit } from '@element-plus/icons-vue' // 导入Edit图标
import MasonryWall from '@yeger/vue-masonry-wall'

const isDeleteMessageDrawerVisible = ref(false);
const isDeleteImageDrawerVisible = ref(false);
const isUpdateAvatarDrawerVisible = ref(false); // 控制更新头像抽屉的显示

// 初始化数据
const statisticsData = ref<StatisticsType>({
  id: -1,
  totalMerit: -1,
  avatarUrl: "",
});

// 表单数据
const messageFormData = reactive<{
  nickname: string;
  content: string;
}>({
  nickname: "",
  content: ""
});

//日期格式化
const dateFormat = (data: string) => {
  return new Date(data).toLocaleString();
};

const currentMeritCount = ref(0);
const messagePagination = reactive({
  pageNum: 1,
  pageSize: 10,
  order: 'desc'
});
// 图片列表相关数据与方法
const imagePagination = reactive({
  pageNum: 1,
  pageSize: 10,
  order: 'desc'
});

const handleAddMessageClick = async () => {

  if (!messageFormData.nickname.trim() || !messageFormData.content.trim()) {
    ElMessage.warning("昵称和内容不能为空");
    return;
  }

  if (messageFormData.content.length > 100) {
    ElMessage.warning("留言内容不能超过100字");
    return;
  }

  if (messageFormData.nickname.length > 20) {
    ElMessage.warning("昵称不能超过20字");
    return;
  }

  const res = await addMessageAPI(messageFormData);
  if (!res) {
    ElMessage.error("添加留言失败");
    return;
  }
  ElMessage.success("留言成功");
  messageFormData.nickname = "";
  messageFormData.content = "";
  await fetchMessageListData();
};

const handleAddMessageReset = () => {
  messageFormData.nickname = "";
  messageFormData.content = "";
};
const messageListData = ref<MessageType[]>();

const imageListData = ref<ImageType[]>();


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
    label: "5条/页",
    value: 5
  },
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

const imagePageSizeOptions = [
  {
    label: "5张/页",
    value: 5
  },
  {
    label: "10张/页",
    value: 10
  },
  {
    label: "20张/页",
    value: 20
  },
  {
    label: "30张/页",
    value: 30
  }
]

const imagePageNumOptions = [
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
  fetchImageListData();
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

const currentMessageIdTobeDeleted = ref(-1);

const handleMessageDelete = async (id: number) => {
  currentMessageIdTobeDeleted.value = id;
  isDeleteMessageDrawerVisible.value = true;
};

const doDeleteMessageById = async () => {
  if (currentMessageIdTobeDeleted.value === -1) {
    ElMessage.error("删除留言失败");
    return;
  }
  const res = await deleteMessageByIdAPI(currentMessageIdTobeDeleted.value);
  if (!res) {
    ElMessage.error("删除留言失败");
    return;
  }
  currentMessageIdTobeDeleted.value = -1;
  ElMessage.success("删除留言成功");
  await fetchMessageListData();
};

const doDeleteImageById = async () => {
  if (currentImageIdTobeDeleted.value === -1) {
    ElMessage.error("删除图片失败");
    return;
  }
  const res = await deleteImageByIdAPI(currentImageIdTobeDeleted.value);
  if (!res) {
    ElMessage.error("删除图片失败");
    return;
  }
  currentImageIdTobeDeleted.value = -1;
  ElMessage.success("删除图片成功");
  await fetchImageListData();
};

const deleteMessagePassword = ref('');
const deleteImagePassword = ref('');

const handleMessageDeleteDrawerConfirmBtnClick = async () => {
  if (!deleteMessagePassword.value.trim()) {
    ElMessage.warning("请输入管理员密钥");
    return;
  }
  if (deleteMessagePassword.value !== 'uncleyumo') {
    ElMessage.error("管理员密钥错误");
    return;
  }
  await doDeleteMessageById();
  isDeleteMessageDrawerVisible.value = false;
};

const handleMessageDeleteDrawerCancelBtnClick = () => {
  deleteMessagePassword.value = '';
  isDeleteMessageDrawerVisible.value = false;
};

const handleImageDeleteDrawerCancelBtnClick = () => {
  deleteImagePassword.value = '';
  isDeleteImageDrawerVisible.value = false;
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

const handleImageDeleteDrawerConfirmBtnClick = async () => {
  if (!deleteImagePassword.value.trim()) {
    ElMessage.warning("请输入管理员密钥");
    return;
  }
  if (deleteImagePassword.value !== 'uncleyumo') {
    ElMessage.error("管理员密钥错误");
    return;
  }
  await doDeleteImageById();
  isDeleteImageDrawerVisible.value = false;
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

const imageFormData = reactive({
  fileList: [] as UploadFile[]
});

// 找到这个函数
const handleImageUploadClick = async () => {
  if (!imageFormData.fileList || imageFormData.fileList.length === 0) {
    ElMessage.warning("请先选择一张图片");
    return;
  }

  // 获取第一张图片的 UploadFile 对象
  const uploadFile = imageFormData.fileList[0];

  // 从 UploadFile 对象中获取原生的 File 对象
  const file = uploadFile.raw; //
  if (!file) {
    ElMessage.error("请选择一张有效的图片");
    return;
  }

  // 判断文件大小和类型 (这里的逻辑可以保留，UploadFile对象上也有name和size属性)
  if (uploadFile.size && uploadFile.size > 1024 * 1024 * 2) {
    ElMessage.warning("图片大小不能超过2MB");
    return; // 增加return，防止继续执行
  }

  const fileName = uploadFile.name;
  const fileSuffix = fileName.split('.').pop();
  if (!fileSuffix) {
    ElMessage.error("未获取到图片后缀");
    return;
  }
  if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileSuffix.toLowerCase())) { // 建议转为小写比较
    ElMessage.error("不支持的文件格式：" + fileSuffix);
    return;
  }

  const res = await uploadImageAPI(file);
  if (!res) {
    ElMessage.error("图片上传失败");
    return;
  }

  ElMessage.success("图片上传成功");
  // 清空文件列表
  if (upload.value) {
    upload.value.clearFiles();
  }
  await fetchImageListData();
};

const upload = ref<any>(null);

const handleImageExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

const fetchImageListData = async () => {
  const res = await getImageListAPI({
    pageNum: imagePagination.pageNum,
    pageSize: imagePagination.pageSize,
    order: imagePagination.order
  });
  if (!res) {
    ElMessage.error("获取图片列表失败");
    return; // 提早返回，防止继续执行
  }
  imageListData.value = res
}

const currentImageIdTobeDeleted = ref(-1);

const handleLikeImageById = async (id: number) => {
  const res = await likeImageByIdAPI(id);
  if (!res) {
    ElMessage.error("点赞失败");
    return;
  }
  ElMessage.success("点赞成功");
  await fetchImageListData();
};

const handleDislikeImageById = async (id: number) => {
  const res = await dislikeImageByIdAPI(id);
  if (!res) {
    ElMessage.error("点踩失败");
    return;
  }
  ElMessage.success("点踩成功");
  await fetchImageListData();
};

const handleImageDelete = async (id: number) => {
  currentImageIdTobeDeleted.value = id;
  isDeleteImageDrawerVisible.value = true;
};


// 添加用于控制图片放大显示的响应式变量
const isImageModalVisible = ref(false);
const selectedImage = ref<ImageType | null>(null);

// 添加处理图片点击的函数
const handleImageClick = (image: ImageType) => {
  selectedImage.value = image;
  isImageModalVisible.value = true;
};

// 添加关闭图片放大显示的函数
const closeImageModal = () => {
  isImageModalVisible.value = false;
  selectedImage.value = null;
};

// -- 开始：更新头像相关逻辑 --
const newAvatarFileList = ref<UploadFile[]>([]);
const updateAvatarPassword = ref('');

const handleUpdateAvatarClick = () => {
  isUpdateAvatarDrawerVisible.value = true;
};

const handleUpdateAvatarDrawerCancelBtnClick = () => {
  isUpdateAvatarDrawerVisible.value = false;
  newAvatarFileList.value = [];
  updateAvatarPassword.value = '';
};

const handleUpdateAvatarDrawerConfirmBtnClick = async () => {
  if (updateAvatarPassword.value !== 'uncleyumo') {
    ElMessage.error("管理员密钥错误");
    return;
  }
  if (newAvatarFileList.value.length === 0) {
    ElMessage.warning("请选择一张图片");
    return;
  }

  const fileToUpload = newAvatarFileList.value[0].raw;
  if (!fileToUpload) {
    ElMessage.error("无效的文件");
    return;
  }

  const res = await updateAvatarAPI(fileToUpload);
  if (res) {
    ElMessage.success("头像更新成功");
    handleUpdateAvatarDrawerCancelBtnClick(); // 关闭并重置抽屉
    // 强制刷新页面
    location.reload();
  } else {
    ElMessage.error("头像更新失败");
  }
};
// -- 结束：更新头像相关逻辑 --

watch(() => messagePagination, () => {
  fetchMessageListData();
}, {
  deep: true
})

watch(() => imagePagination, () => {
  fetchImageListData();
}, {
  deep: true
})

</script>

<template>
  <div style="display: flex; flex-direction: column;">
    <div class="home-container">
      <!-- 青云功德台 -->
      <div class="statistic-container">
        <div class="statistic-title-container">
          <h2>青云功德台</h2>
          <h6>您在功德台收获的功德将扣在青云头上</h6>
          <!-- 更新头像按钮 -->
          <el-button
              icon="Edit"
              size="small"
              circle
              @click="handleUpdateAvatarClick"
              style="position: absolute; top: 10px; right: 10px; background-color: rgba(255,255,255,0.2); border: none;"
          >
            <el-icon><Edit /></el-icon>
          </el-button>
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

        <!--添加留言-->
        <el-form ref="messageFormRef" :model="messageFormData" label-width="80px">
          <el-form-item label="昵称">
            <el-input v-model="messageFormData.nickname" placeholder="请输入昵称"></el-input>
          </el-form-item>
          <el-form-item label="留言">
            <el-input v-model="messageFormData.content" placeholder="请输入留言"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="default" @click="handleAddMessageClick">提交</el-button>
            <el-button type="default" @click="handleAddMessageReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-divider><span style="font-size: small; font-style: italic; color: #979797;">留言列表</span></el-divider>

        <div style="display: flex; flex-direction: row; justify-content: space-between; width: 90%; max-width: 400px; margin-bottom: 16px;">
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
            {{ messagePagination.order === 'desc' ? '最新' : '最早' }}
          </el-button>
        </div>
        <el-card class="message-list" v-for="(message) in messageListData" style="margin-top: 16px;width: 90%; max-width: 400px;" shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: smaller">昵称：{{message.nickname}}</span>
              <span style="font-size: small; color: dimgray;">{{dateFormat(message.createTime)}}</span>
            </div>
          </template>
          <span style="font-weight: bolder;font-size: smaller">{{ message.content }}</span>
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
        <h3>上传青云的逆天黑料</h3>

        <!--上传图片-->
        <el-upload
            ref="upload"
            class="upload-demo"
            drag
            multiple
            :auto-upload="false"
            v-model:file-list="imageFormData.fileList"
            :limit="1"
            :on-exceed="handleImageExceed"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖动图片或 <em>点击加载</em>
          </div>
          <template #tip>
            <div style="text-align: center;font-size: small; color: #979797;">
              图片大小不能超过2M
            </div>
          </template>
        </el-upload>
        <el-button type="primary" @click="handleImageUploadClick" style="margin-top: 10px;">
          上传
        </el-button>

        <el-divider><span style="font-size: small; font-style: italic; color: #979797;">历史黑料列表</span></el-divider>

        <div style="display: flex; flex-direction: row; justify-content: space-between; width: 90%; max-width: 400px; margin-bottom: 16px;">
          <el-select v-model="imagePagination.pageSize" placeholder="Select" style="width: 100px">
            <el-option
                v-for="item in imagePageSizeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>

          <el-select v-model="imagePagination.pageNum" placeholder="Select"
                     style="width: 100px;margin-left: 10px; margin-right: 10px">
            <el-option
                v-for="item in imagePageNumOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <el-button @click="imagePagination.order = imagePagination.order === 'desc' ? 'asc' : 'desc'">
            {{ imagePagination.order === 'desc' ? '最新' : '最早' }}
          </el-button>
        </div>
        <div class="image-waterfall-container">
          <masonry-wall :items="imageListData ?? []" :column-width="200" :gap="16">
            <template #default="{ item }">
              <div class="image-card">
                <img :src="item.url"  @click="handleImageClick(item)" class="waterfall-image" alt="黑料图片"/>
                <div class="image-card-footer">
                  <div class="image-card-info">
                    <span style="font-size: small; color: dimgray;">{{dateFormat(item.createTime)}}</span>
                    <div class="likes-dislikes">
                      <span style="font-size: small; color: dimgray;">赞 {{item.likeCount}}</span>
                      <el-divider direction="vertical"></el-divider>
                      <span style="font-size: small; color: dimgray;">踩 {{item.dislikeCount}}</span>
                    </div>
                  </div>
                  <div class="image-card-actions">
                    <el-button type="primary" size="small" @click="handleLikeImageById(item.id)">赞</el-button>
                    <el-button type="warning" size="small" @click="handleDislikeImageById(item.id)">踩</el-button>
                    <el-button type="danger" size="small" @click="handleImageDelete(item.id)">删</el-button>
                  </div>
                </div>
              </div>
            </template>
          </masonry-wall>
        </div>
      </div>
    </div>
  </div>

  <!--  音频播放器，隐藏起来 -->
  <audio ref="audioRef" src="/muyu.wav" preload="auto" style="display: none;"></audio>

  <!-- 删除留言的校验抽屉 -->
  <el-drawer
      v-model="isDeleteMessageDrawerVisible"
      title="管理员密钥校验"
      direction="btt"
      size="40%"
      :before-close="handleMessageDeleteDrawerCancelBtnClick"
  >
    <el-input v-model="deleteMessagePassword" placeholder="请输入管理员密钥"></el-input>
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <el-button @click="handleMessageDeleteDrawerCancelBtnClick">取消</el-button>
      <el-button type="danger" @click="handleMessageDeleteDrawerConfirmBtnClick">确认</el-button>
    </div>
  </el-drawer>

  <!-- 删除图片的校验抽屉 -->
  <el-drawer
      v-model="isDeleteImageDrawerVisible"
      title="管理员密钥校验"
      direction="btt"
      size="40%"
      :before-close="handleImageDeleteDrawerCancelBtnClick"
  >
    <el-input v-model="deleteImagePassword" placeholder="请输入管理员密钥"></el-input>
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <el-button @click="handleImageDeleteDrawerCancelBtnClick">取消</el-button>
      <el-button type="danger" @click="handleImageDeleteDrawerConfirmBtnClick">确认</el-button>
    </div>
  </el-drawer>

  <!-- 更新头像的抽屉 -->
  <el-drawer
      v-model="isUpdateAvatarDrawerVisible"
      title="更新功德台头像"
      direction="btt"
      size="50%"
      :before-close="handleUpdateAvatarDrawerCancelBtnClick"
  >
    <div style="padding: 0 20px;">
      <el-upload
          :auto-upload="false"
          :show-file-list="true"
          v-model:file-list="newAvatarFileList"
          :limit="1"
          list-type="picture"
          accept="image/*"
      >
        <el-button type="primary">选择图片</el-button>
        <template #tip>
          <div class="el-upload__tip" style="margin-top: 10px;">
            请选择新的头像图片，大小不超过2MB。
          </div>
        </template>
      </el-upload>
      <el-input v-model="updateAvatarPassword" placeholder="请输入管理员密钥" style="margin-top: 20px;"></el-input>
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <el-button @click="handleUpdateAvatarDrawerCancelBtnClick">取消</el-button>
        <el-button type="primary" @click="handleUpdateAvatarDrawerConfirmBtnClick">确认更新</el-button>
      </div>
    </div>
  </el-drawer>


  <!-- 添加图片放大显示的模态框 -->
  <div v-if="isImageModalVisible" class="image-modal-overlay" @click="closeImageModal">
    <div class="image-modal-content" @click.stop>
      <img v-if="selectedImage" :src="selectedImage.url" class="modal-image" alt="放大图片"/>
      <div class="modal-close-btn" @click="closeImageModal">×</div>
    </div>
  </div>
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
  position: relative; /* 为按钮定位添加 */
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
  padding: 0 16px;
}

.image-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 16px;
}

.image-waterfall-container {
  width: 100%;
  max-width: 1280px; /* 限制最大宽度 */
}

.image-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  break-inside: avoid;
}

.waterfall-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-card-footer {
  padding: 10px;
  background-color: #fff;
}

.image-card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.likes-dislikes{
  display: flex;
  align-items: center;
}

.image-card-actions {
  display: flex;
  justify-content: flex-end;
}

/* 添加图片放大显示的样式 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.modal-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  font-size: 36px;
  color: white;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-close-btn:hover {
  color: #ccc;
}
</style>