<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  searchUser
} from "@/api/users";
import { message } from "@/utils/message";
import {
  Plus,
  Edit,
  Delete,
  User,
  Refresh,
  DataLine,
  Search
} from "@element-plus/icons-vue";

// 0. 定义数据接口
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  permission_level: string;
  organization: string;
  created_at: string;
}

// 1. 统计卡片
const statCards = reactive([
  {
    title: "用户总数",
    value: 0,
    icon: User,
    bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)"
  }
]);

// 2. 表格数据
const tableData = ref<UserData[]>([]);
const loading = ref(false);

// 3. 弹窗控制
const editDialogVisible = ref(false);
const isEdit = ref(false);

// 搜索表单数据
const searchForm = reactive({
  name: "",
  email: ""
});

// 编辑表单数据
const editForm = reactive({
  id: undefined,
  name: "",
  email: "",
  password: "",
  role: "", // 默认为空，让用户选或填
  permission_level: "",
  organization: ""
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

// 4. 获取数据
const getData = async () => {
  loading.value = true;
  try {
    const res = await getUserList();
    console.log("User API返回数据:", res);
    tableData.value = res;

    if (res && res.length) {
      statCards[0].value = res.length;
    } else {
      statCards[0].value = 0;
    }
  } catch (error) {
    console.error("获取失败:", error);
    message("获取用户列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getData();
});

// 触发搜索功能
const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await searchUser({
      name: searchForm.name,
      email: searchForm.email
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
  searchForm.name = "";
  searchForm.email = "";
  getData();
};

const handleRefresh = () => {
  resetSearch();
  message("刷新成功", { type: "success" });
};

const handleAdd = () => {
  isEdit.value = false;
  // 清空表单
  editForm.id = undefined;
  editForm.name = "";
  editForm.email = "";
  editForm.password = "";
  editForm.role = "User"; // 给个默认值
  editForm.permission_level = "ReadOnly"; // 给个默认值
  editForm.organization = "";

  editDialogVisible.value = true;
};

const handleEdit = (row: UserData) => {
  isEdit.value = true;
  Object.assign(editForm, row);
  editForm.password = "";
  editDialogVisible.value = true;
};

const handleDelete = async (row: UserData) => {
  try {
    if (!row.id) return;
    await deleteUser(row.id);
    message("删除成功", { type: "success" });
    getData();
  } catch (error) {
    message("删除失败", { type: "error" });
  }
};

const saveEdit = async () => {
  try {
    if (isEdit.value) {
      await updateUser(editForm);
      message("修改成功", { type: "success" });
    } else {
      await addUser(editForm);
      message("新增成功", { type: "success" });
    }
    editDialogVisible.value = false;
    getData();
  } catch (error: any) {
    console.error(error);
    const errorMsg =
      error.response?.data?.message || error.message || "操作失败";
    message(errorMsg, { type: "error" });
  }
};
</script>

<template>
  <div class="user-page">
    <!-- 顶部统计 -->
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

    <!-- 搜索栏卡片 -->
    <el-card shadow="never" class="mb-4 search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="输入姓名关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="输入邮箱关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon style="margin-right: 4px; vertical-align: middle"
              ><Search
            /></el-icon>
            <span style="vertical-align: middle">查询</span>
          </el-button>

          <el-button @click="resetSearch">
            <el-icon style="margin-right: 4px; vertical-align: middle"
              ><Refresh
            /></el-icon>
            <span style="vertical-align: middle">重置</span>
          </el-button>

          <el-button type="success" @click="handleAdd">
            <el-icon style="margin-right: 4px; vertical-align: middle"
              ><Plus
            /></el-icon>
            <span style="vertical-align: middle">新增用户</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card v-loading="loading" shadow="never">
      <el-table :data="tableData" border stripe style="width: 100%">
        <!-- 序号 -->
        <el-table-column label="序号" width="80">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>

        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="email" label="邮箱账号" width="250" />

        <el-table-column prop="role" label="角色" width="200">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.role === 'Administrator'
                  ? 'danger'
                  : scope.row.role === 'User'
                    ? 'success'
                    : 'info'
              "
            >
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="organization"
          label="所属组织/公司"
          width="200"
        />

        <el-table-column prop="permission_level" label="权限等级" width="200">
          <template #default="scope">
            <el-tag effect="plain" type="info">{{
              scope.row.permission_level
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="280">
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

    <!-- 弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? '修改用户' : '新增用户'"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱账号">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="登录密码">
          <el-input
            v-model="editForm.password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <!-- ✅ 角色选择：支持手动输入 (filterable + allow-create) -->
        <el-form-item label="角色">
          <el-select
            v-model="editForm.role"
            placeholder="请选择或输入角色"
            style="width: 100%"
            filterable
            allow-create
            default-first-option
          >
            <el-option label="Administrator" value="Administrator" />
            <el-option label="User" value="User" />
            <el-option label="Editor" value="Editor" />
            <el-option label="Manager" value="Manager" />
          </el-select>
        </el-form-item>

        <!-- ✅ 权限选择：支持手动输入 -->
        <el-form-item label="权限等级">
          <el-select
            v-model="editForm.permission_level"
            placeholder="请选择或输入权限"
            style="width: 100%"
            filterable
            allow-create
            default-first-option
          >
            <el-option label="Super" value="Super" />
            <el-option label="ReadOnly" value="ReadOnly" />
            <el-option label="Write" value="Write" />
            <el-option label="FullAccess" value="FullAccess" />
            <el-option label="Admin" value="Admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属组织">
          <el-input
            v-model="editForm.organization"
            placeholder="请输入公司或组织名称"
          />
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
.user-page {
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
