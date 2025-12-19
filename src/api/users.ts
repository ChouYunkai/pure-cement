import { http } from "@/utils/http";

// 调试阶段建议使用本地后端地址，确保连接到最新的后端代码
// 上线发布时，请将此处改为您的云服务器地址 (例如 http://47.250.152.216:3001/api/users)
const BASE_URL = "http://47.250.152.216:3001/api/users";

/** 获取用户列表 (对应后端 router.get('/')) */
export const getUserList = () => {
  return http.request<any>("get", BASE_URL);
};

/** 新增用户 (对应后端 router.post('/add')) */
export const addUser = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/add`, { data });
};

/** 修改用户 (对应后端 router.post('/update')) */
export const updateUser = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/update`, { data });
};

/** 删除用户 (对应后端 router.delete('/delete/:id')) */
export const deleteUser = (id: number) => {
  return http.request<any>("delete", `${BASE_URL}/delete/${id}`);
};
/** 搜索数据 (对应后端 router.post('/search')) */
export const searchUser = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/search`, { data });
};
