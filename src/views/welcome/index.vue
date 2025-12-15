<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  getChipList,
  deleteChip,
  searchChip,
  addChip,
  updateChip
} from "@/api/cement";
import { message } from "@/utils/message";
import {
  Search,
  Plus,
  Refresh,
  Edit,
  Delete,
  DataLine,
  OfficeBuilding,
  Calendar,
  Download
} from "@element-plus/icons-vue";
import { el } from "element-plus/es/locales.mjs";

// 0. 定义数据接口 (彻底解决爆红的关键)
interface ChipData {
  id: number;
  project: string;
  structure: string;
  contractor: string;
  supplier: string;
  prepared_by: string;
  cube_size: string;
  grade: string;
  cement: string;
  fine_aggregate: string;
  coarse_aggregate: string;
  admixture: string;
  chip_code: string;
  test_days: string;
  created_at: string;
}

// 1. 统计卡片数据
const statCards = reactive([
  {
    title: "总记录数",
    value: 0,
    icon: DataLine,
    bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    title: "本月新增",
    value: 0,
    icon: Plus,
    bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    title: "平均养护周期",
    value: "0 days",
    icon: Calendar,
    bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    title: "活跃厂家",
    value: 0,
    icon: OfficeBuilding,
    bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  }
]);

// 2. 搜索表单
const searchForm = reactive({
  projectName: "",
  manufacturer: ""
});

// 3. 表格数据核心变量
// 【修复】使用明确的 ChipData 接口类型
const cementData = ref<ChipData[]>([]);
const loading = ref(false);

// 4. 编辑/新增相关变量
const editDialogVisible = ref(false);
const isEdit = ref(false);
// 【修复】使用 Partial<ChipData> 表示部分字段可能为空
const editForm = reactive<Partial<ChipData>>({
  id: undefined,
  project: "",
  structure: "",
  contractor: "",
  supplier: "",
  prepared_by: "",
  cube_size: "",
  grade: "",
  cement: "",
  fine_aggregate: "",
  coarse_aggregate: "",
  admixture: "",
  chip_code: "",
  test_days: "",
  created_at: ""
});

// 5. 核心逻辑：获取数据
const getData = async () => {
  loading.value = true;
  try {
    const res = await getChipList();
    console.log("API返回数据:", res);
    // 这里如果后端返回的字段有些许差异，TypeScript不会报错，因为any兼容性，但运行时会正常显示
    cementData.value = res;
    // 更新统计数字
    if (res && res.length) {
      statCards[0].value = res.length;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    message("获取数据失败，请检查控制台", { type: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getData();
});

// 6. 交互功能
const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await searchChip({
      projectName: searchForm.projectName,
      supplier: searchForm.manufacturer
    });
    cementData.value = res;
    message("查询完成", { type: "success" });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.projectName = "";
  searchForm.manufacturer = "";
  getData();
};

const handleDelete = async (row: ChipData) => {
  try {
    if (!row.id) {
      message("无法删除：ID不存在", { type: "warning" });
      return;
    }
    await deleteChip(row.id);
    message("删除成功", { type: "success" });
    getData();
  } catch (error) {
    console.error(error);
    message("删除失败", { type: "error" });
  }
};

const handleAdd = () => {
  isEdit.value = false;
  // 清空表单
  Object.keys(editForm).forEach(key => {
    (editForm as any)[key] = ""; // 临时断言以允许赋值
  });
  editDialogVisible.value = true;
};

const handleEdit = (row: ChipData) => {
  isEdit.value = true;
  Object.assign(editForm, row);
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    if (isEdit.value) {
      // 修改模式
      if (!editForm.id) {
        message("修改失败：ID不存在", { type: "warning" });
        return;
      }
      await updateChip(editForm);
      message("修改成功", { type: "success" });
    } else {
      // 新增模式
      await addChip(editForm);
      message("新增成功", { type: "success" });
    }

    editDialogVisible.value = false;
    getData(); // 刷新表格数据
  } catch (error) {
    console.error("保存失败:", error);
    message(isEdit.value ? "修改失败" : "新增失败", { type: "error" });
  }
};

const handleExport = () => {
  message("导出功能开发中", { type: "info" });
};
</script>

<template>
  <div class="cement-page">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col v-for="card in statCards" :key="card.title" :span="6">
        <el-card
          shadow="hover"
          class="stat-card"
          :style="{ background: card.bg }"
        >
          <div class="stat-icon">
            <component
              :is="card.icon"
              style="width: 28px; height: 28px; color: white"
            />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4 search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.projectName"
            placeholder="输入项目名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="生产厂家">
          <el-input
            v-model="searchForm.manufacturer"
            placeholder="输入生产厂家"
            clearable
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
            <el-icon><Plus /></el-icon> 新增
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card v-loading="loading" shadow="never">
      <el-table :data="cementData" border stripe :style="{ width: '100%' }">
        <!-- 数据库字段对齐 -->
        <el-table-column prop="project" label="项目名称" width="120" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="structure" label="结构类型" width="120" />
        <el-table-column prop="contractor" label="施工单位" width="120" />
        <el-table-column prop="supplier" label="生产厂家" width="120" />
        <el-table-column prop="prepared_by" label="负责人" width="100" />
        <el-table-column prop="cube_size" label="尺寸(mm)" width="100" />
        <el-table-column prop="grade" label="强度等级" width="100" />
        <el-table-column prop="cement" label="水泥品牌" width="120" />
        <el-table-column prop="fine_aggregate" label="砂类型" width="100" />
        <el-table-column prop="coarse_aggregate" label="碎石类型" width="120" />
        <el-table-column prop="admixture" label="外加剂" width="120" />
        <el-table-column prop="chip_code" label="试块编号" width="120" />
        <el-table-column prop="test_days" label="养护周期" width="100" />
        <el-table-column prop="created_at" label="生产时间" width="180" />

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >
              <el-icon style="margin-right: 4px"><Edit /></el-icon> 修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              <el-icon style="margin-right: 4px"><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? '修改信息' : '新增信息'"
      width="60%"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="项目名称"
          ><el-input v-model="editForm.project"
        /></el-form-item>
        <el-form-item label="结构类型"
          ><el-input v-model="editForm.structure"
        /></el-form-item>
        <el-form-item label="施工单位"
          ><el-input v-model="editForm.contractor"
        /></el-form-item>
        <el-form-item label="生产厂家"
          ><el-input v-model="editForm.supplier"
        /></el-form-item>
        <el-form-item label="负责人"
          ><el-input v-model="editForm.prepared_by"
        /></el-form-item>
        <el-form-item label="尺寸"
          ><el-input v-model="editForm.cube_size"
        /></el-form-item>
        <el-form-item label="强度等级"
          ><el-input v-model="editForm.grade"
        /></el-form-item>
        <el-form-item label="水泥品牌"
          ><el-input v-model="editForm.cement"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.cement-page {
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
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin-right: 12px;
  background: rgb(255 255 255 / 20%);
  border-radius: 50%;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
}

.stat-value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: bold;
}

.search-card {
  border-radius: 10px;
}
</style>
