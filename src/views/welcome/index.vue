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
    <el-card shadow="never">
      <el-table :data="cementData" border stripe style="width: 100%">
        <el-table-column prop="project" label="项目名称" width="120" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="structure" label="结构类型" width="120" />
        <el-table-column prop="contractor" label="施工单位" width="120" />
        <el-table-column prop="supervisor" label="监理单位" width="120" />
        <el-table-column prop="manufacturer" label="生产厂家" width="120" />
        <el-table-column prop="contact" label="负责人" width="100" />
        <el-table-column prop="size" label="尺寸(mm)" width="100" />
        <el-table-column prop="strength" label="强度等级" width="100" />
        <el-table-column prop="cementBrand" label="水泥品牌" width="120" />
        <el-table-column prop="sandType" label="砂类型" width="100" />
        <el-table-column prop="gravelType" label="碎石类型" width="120" />
        <el-table-column prop="admixture" label="外加剂" width="120" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="curingPeriod" label="养护周期" width="100" />
        <el-table-column prop="timestamp" label="生产时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >
              <Edit style="margin-right: 4px" /> 修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              <Delete style="margin-right: 4px" /> 删除
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
        <el-form-item label="编号"
          ><el-input v-model="editForm.id"
        /></el-form-item>
        <el-form-item label="结构类型"
          ><el-input v-model="editForm.structure"
        /></el-form-item>
        <el-form-item label="施工单位"
          ><el-input v-model="editForm.contractor"
        /></el-form-item>
        <el-form-item label="监理单位"
          ><el-input v-model="editForm.supervisor"
        /></el-form-item>
        <el-form-item label="生产厂家"
          ><el-input v-model="editForm.manufacturer"
        /></el-form-item>
        <el-form-item label="负责人"
          ><el-input v-model="editForm.contact"
        /></el-form-item>
        <el-form-item label="尺寸(mm)"
          ><el-input v-model="editForm.size"
        /></el-form-item>
        <el-form-item label="强度等级"
          ><el-input v-model="editForm.strength"
        /></el-form-item>
        <el-form-item label="水泥品牌"
          ><el-input v-model="editForm.cementBrand"
        /></el-form-item>
        <el-form-item label="砂类型"
          ><el-input v-model="editForm.sandType"
        /></el-form-item>
        <el-form-item label="碎石类型"
          ><el-input v-model="editForm.gravelType"
        /></el-form-item>
        <el-form-item label="外加剂"
          ><el-input v-model="editForm.admixture"
        /></el-form-item>
        <el-form-item label="批次号"
          ><el-input v-model="editForm.batchNo"
        /></el-form-item>
        <el-form-item label="养护周期"
          ><el-input v-model="editForm.curingPeriod"
        /></el-form-item>
        <el-form-item label="生产时间"
          ><el-input v-model="editForm.timestamp"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  Search,
  Plus,
  Refresh,
  Edit,
  Delete,
  DataLine,
  OfficeBuilding,
  Calendar,
  User,
  Download
} from "@element-plus/icons-vue";

// 统计卡片数据
const statCards = reactive([
  {
    title: "总记录数",
    value: 3,
    icon: DataLine,
    bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    title: "本月新增",
    value: 1,
    icon: Plus,
    bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    title: "平均养护周期",
    value: "16 days",
    icon: Calendar,
    bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    title: "活跃厂家",
    value: 2,
    icon: OfficeBuilding,
    bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  }
]);

// 搜索表单
const searchForm = reactive({
  projectName: "",
  manufacturer: ""
});

// 表格数据（示例）
const cementData = ref([
  {
    project: "项目 A",
    id: 1,
    structure: "框架结构",
    contractor: "中建三局",
    supervisor: "浙江工业大学",
    manufacturer: "华润建材",
    contact: "王小明",
    size: "150*150",
    strength: "C30",
    cementBrand: "海螺牌 42.5",
    sandType: "中砂",
    gravelType: "碎石 10-20mm",
    admixture: "高效减水剂",
    batchNo: "ZJUT-001",
    curingPeriod: "7 days",
    timestamp: "2025-07-24 09:05:37"
  },
  {
    project: "项目 B",
    id: 2,
    structure: "剪力墙结构",
    contractor: "浙江建工",
    supervisor: "浙江工业大学",
    manufacturer: "红狮集团",
    contact: "李雷",
    size: "100*100",
    strength: "C35",
    cementBrand: "红狮牌 42.5",
    sandType: "河砂",
    gravelType: "碎石 5-15mm",
    admixture: "聚羧酸外加剂",
    batchNo: "ZJUT-002",
    curingPeriod: "14 days",
    timestamp: "2025-07-24 09:05:37"
  },
  {
    project: "项目 C",
    id: 3,
    structure: "框架剪力墙",
    contractor: "中铁建",
    supervisor: "浙江工业大学",
    manufacturer: "华润建材",
    contact: "韩梅梅",
    size: "50*50",
    strength: "C40",
    cementBrand: "海螺牌 42.5",
    sandType: "机制砂",
    gravelType: "碎石 5-10mm",
    admixture: "萘系减水剂",
    batchNo: "ZJUT-003",
    curingPeriod: "28 days",
    timestamp: "2025-07-24 09:05:37"
  }
]);

// 编辑弹窗
const editDialogVisible = ref(false);
const isEdit = ref(false);
const editForm = reactive({});

// 查询
const handleSearch = () => {
  console.log("搜索条件:", searchForm);
  // TODO: 调用查询接口
};

// 重置搜索
const resetSearch = () => {
  searchForm.projectName = "";
  searchForm.manufacturer = "";
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  Object.assign(editForm, {});
  editDialogVisible.value = true;
};

// 编辑
const handleEdit = row => {
  isEdit.value = true;
  Object.assign(editForm, row);
  editDialogVisible.value = true;
};

// 删除
const handleDelete = row => {
  console.log("删除记录:", row);
  // TODO: 接口调用删除
};

// 保存
const saveEdit = () => {
  if (isEdit.value) {
    console.log("保存修改:", editForm);
    // TODO: 调用修改接口
  } else {
    console.log("新增数据:", editForm);
    // TODO: 调用新增接口
  }
  editDialogVisible.value = false;
};
</script>

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
