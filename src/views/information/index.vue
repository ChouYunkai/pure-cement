<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  getInfoList,
  addInfo,
  updateInfo,
  deleteInfo,
  searchInfo
} from "@/api/information"; // 确保你之前创建了 api/information.ts
import { message } from "@/utils/message"; // 确保你有这个工具，如果没有可用 ElMessage
import {
  Plus,
  Edit,
  Delete,
  Menu,
  Refresh,
  Search
} from "@element-plus/icons-vue";

// 0. 定义数据接口 (对应数据库 information 表)
interface InfoData {
  id: number;
  project: string;
  cube_size: string;
  test_days: string;
}

// 1. 统计卡片 (紫色风格)
const statCards = reactive([
  {
    title: "选项总数",
    value: 0,
    icon: Menu,
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }
]);

// 2. 表格数据
const tableData = ref<InfoData[]>([]);
const loading = ref(false);

// 3. 弹窗控制
const editDialogVisible = ref(false);
const isEdit = ref(false);

// 🔍 搜索表单：包含两个条件
const searchForm = reactive({
  project: "",
  cube_size: "" // ✅ 新增：尺寸搜索字段
});

// 表单数据
const editForm = reactive<Partial<InfoData>>({
  id: undefined,
  project: "",
  cube_size: "",
  test_days: ""
});
// 4. 获取数据
const getData = async () => {
  loading.value = true;
  try {
    const res = await getInfoList();
    tableData.value = res;
    // 更新统计
    if (res && res.length) {
      statCards[0].value = res.length;
    } else {
      statCards[0].value = 0;
    }
  } catch (error) {
    console.error("获取失败:", error);
    message("获取列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getData();
});
// 🔍 触发搜索逻辑
const handleSearch = async () => {
  loading.value = true;
  try {
    // 调用搜索接口，传两个参数
    const res = await searchInfo({
      project: searchForm.project,
      cube_size: searchForm.cube_size // ✅ 改动 2：将尺寸条件一并传给后端
    });
    tableData.value = res;
    message("查询完成", { type: "success" });
  } catch (error) {
    console.error(error);
    message("查询失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.project = "";
  searchForm.cube_size = ""; // ✅ 改动 3：重置时也要清空尺寸字段
  getData(); // 重新获取所有数据
};

// 5. 交互逻辑
const handleRefresh = () => {
  getData();
  message("刷新成功", { type: "success" });
};

const handleAdd = () => {
  isEdit.value = false;
  // 清空表单
  editForm.id = undefined;
  editForm.project = "";
  editForm.cube_size = "";
  editForm.test_days = "";
  editDialogVisible.value = true;
};

const handleEdit = (row: InfoData) => {
  isEdit.value = true;
  Object.assign(editForm, row); // 回显数据
  editDialogVisible.value = true;
};

const handleDelete = async (row: InfoData) => {
  try {
    if (!row.id) return;
    await deleteInfo(row.id);
    message("删除成功", { type: "success" });
    getData();
  } catch (error) {
    message("删除失败", { type: "error" });
  }
};

const saveEdit = async () => {
  try {
    if (isEdit.value) {
      await updateInfo(editForm);
      message("修改成功", { type: "success" });
    } else {
      await addInfo(editForm);
      message("新增成功", { type: "success" });
    }
    editDialogVisible.value = false;
    getData();
  } catch (error) {
    message("操作失败", { type: "error" });
  }
};
</script>

<template>
  <div class="info-page">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card
          shadow="hover"
          class="stat-card"
          :style="{ background: statCards[0].bg }"
        >
          <div class="stat-icon">
            <component
              :is="statCards[0].icon"
              style="width: 28px; height: 28px; color: white"
            />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ statCards[0].title }}</div>
            <div class="stat-value">{{ statCards[0].value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 🔍 搜索栏卡片 -->
    <el-card shadow="never" class="mb-4 search-card">
      <el-form :inline="true" :model="searchForm">
        <!-- 搜索框 1：项目名称 -->
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.project"
            placeholder="输入项目关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <!-- ✅ 搜索框 2：尺寸标准 -->
        <el-form-item label="尺寸标准">
          <el-input
            v-model="searchForm.cube_size"
            placeholder="输入尺寸关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增选项
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <el-table :data="tableData" border stripe style="width: 100%">
        <!-- ID 列 (使用序号显示) -->
        <el-table-column label="序号" width="80">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>

        <el-table-column prop="project" label="项目名称" />
        <el-table-column prop="cube_size" label="尺寸标准" />
        <el-table-column prop="test_days" label="养护天数" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon> 修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? '修改选项' : '新增选项'"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="editForm.project" placeholder="例：项目一" />
        </el-form-item>
        <el-form-item label="尺寸标准">
          <el-input v-model="editForm.cube_size" placeholder="例：150*150" />
        </el-form-item>
        <el-form-item label="养护天数">
          <el-input v-model="editForm.test_days" placeholder="例：7days" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.info-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.mb-4 {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  color: white;
  border: none;
  border-radius: 12px;
}

.stat-icon {
  display: flex;
  padding: 12px;
  margin-right: 12px;
  background: rgb(255 255 255 / 20%);
  border-radius: 50%;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.search-card {
  border-radius: 10px;
}
</style>
