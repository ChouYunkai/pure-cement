<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  getChipList,
  deleteChip,
  searchChip,
  addChip,
  updateChip,
  getChipOptions
} from "@/api/chipfrom";
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

// 0. 定义数据接口
interface ChipData {
  id: number;
  company: string;
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
  }
]);

// 2. 搜索表单
const searchForm = reactive({
  projectName: "",
  manufacturer: ""
});

// 3. 表格数据核心变量
const cementData = ref<ChipData[]>([]);
const loading = ref(false);

// 下拉框选项数据
const projectOptions = ref<string[]>([]);
const cubeSizeOptions = ref<string[]>([]);
const testDaysOptions = ref<string[]>([]);

// 4. 编辑/新增相关变量
const editDialogVisible = ref(false);
const isEdit = ref(false);
const editForm = reactive<Partial<ChipData>>({
  id: undefined,
  company: "",
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
// 优化：时间格式化函数 (强制使用北京时间)
const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  });
  return formatter.format(date).replace(/\//g, "-");
};
// 5. 核心逻辑：获取数据
const getData = async () => {
  loading.value = true;
  try {
    const res = await getChipList();
    console.log("API返回数据:", res);
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
// 获取下拉框选项
const getOptions = async () => {
  try {
    const res = await getChipOptions();
    console.log("下拉选项数据:", res);
    projectOptions.value = res.project || [];
    cubeSizeOptions.value = res.cubeSize || [];
    testDaysOptions.value = res.testDays || [];
  } catch (error) {
    console.error("获取选项失败:", error);
    message("获取下拉选项失败", { type: "error" });
  }
};
onMounted(() => {
  getData();
  getOptions();
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
    (editForm as any)[key] = key === "id" ? undefined : "";
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

defineOptions({
  name: "ChipfromPage"
});
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
          <el-select
            v-model="searchForm.projectName"
            placeholder="选择项目名称"
            clearable
            filterable
          >
            <el-option
              v-for="item in projectOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card v-loading="loading" shadow="never">
      <el-table :data="cementData" border stripe :style="{ width: '100%' }">
        <!-- 数据库字段对齐 -->
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="company" label="公司名称" width="120" />
        <el-table-column prop="project" label="项目名称" width="120" />
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
        <el-table-column prop="chip_code" label="试块编号" width="150" />
        <el-table-column prop="test_days" label="养护天数" width="100" />
        <el-table-column prop="created_at" label="生产时间" width="180">
          <template #default="scope">
            <!-- ✅ 使用 formatDate 函数包裹原始时间 -->
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              style="margin-right: 8px"
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
        <el-form-item label="公司名称">
          <el-input v-model="editForm.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-select
            v-model="editForm.project"
            placeholder="请选择项目名称"
            clearable
            filterable
          >
            <el-option
              v-for="item in projectOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="结构类型">
          <el-input v-model="editForm.structure" placeholder="请输入结构类型" />
        </el-form-item>
        <el-form-item label="施工单位">
          <el-input
            v-model="editForm.contractor"
            placeholder="请输入施工单位"
          />
        </el-form-item>
        <el-form-item label="生产厂家">
          <el-input v-model="editForm.supplier" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="editForm.prepared_by" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="尺寸">
          <el-select
            v-model="editForm.cube_size"
            placeholder="请选择尺寸"
            clearable
            filterable
          >
            <el-option
              v-for="item in cubeSizeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="强度等级">
          <el-input v-model="editForm.grade" placeholder="请输入强度等级" />
        </el-form-item>
        <el-form-item label="水泥品牌">
          <el-input v-model="editForm.cement" placeholder="请输入水泥品牌" />
        </el-form-item>
        <el-form-item label="砂类型">
          <el-input
            v-model="editForm.fine_aggregate"
            placeholder="请输入砂类型"
          />
        </el-form-item>
        <el-form-item label="碎石类型">
          <el-input
            v-model="editForm.coarse_aggregate"
            placeholder="请输入碎石类型"
          />
        </el-form-item>
        <el-form-item label="外加剂">
          <el-input v-model="editForm.admixture" placeholder="请输入外加剂" />
        </el-form-item>
        <el-form-item label="试块编号">
          <el-input v-model="editForm.chip_code" placeholder="请输入试块编号" />
        </el-form-item>
        <el-form-item label="养护天数">
          <el-select
            v-model="editForm.test_days"
            placeholder="请选择养护天数"
            clearable
            filterable
          >
            <el-option
              v-for="item in testDaysOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
