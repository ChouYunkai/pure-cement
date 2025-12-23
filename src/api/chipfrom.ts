import { http } from "@/utils/http";

// 你的后端云服务器地址
// 端口 3001 对应后端 index.ts 中的 app.listen(3001)
// 路径 /api/chipform 对应 app.use('/api/chipform', chipFormRouter)
const BASE_URL = "http://47.250.152.216:3001/api/chipform";

/** 获取列表数据 (对应后端 router.get('/')) */
export const getChipList = () => {
  return http.request<any>("get", BASE_URL);
};

/** 新增数据 (对应后端 router.post('/add')) */
export const addChip = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/add`, { data });
};

/** 修改数据 (对应后端 router.post('/update')) */
export const updateChip = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/update`, { data });
};

/** 删除数据 (对应后端 router.delete('/delete/:id')) */
export const deleteChip = (id: number) => {
  return http.request<any>("delete", `${BASE_URL}/delete/${id}`);
};

/** 搜索数据 (对应后端 router.post('/search')) */
export const searchChip = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/search`, { data });
};

/** 获取下拉框选项 (对应后端 router.get('/options/information')) */
export const getChipOptions = () => {
  return http.request<any>("get", `${BASE_URL}/options/information`);
};
