import { http } from "@/utils/http";

// 你的后端云服务器地址
// 注意：这里对应后端 index.ts 中挂载的 app.use('/api/information', infoRouter)
const BASE_URL = "http://47.250.152.216:3001/api/information";

/** 获取选项列表数据 (对应后端 router.get('/')) */
export const getInfoList = () => {
  return http.request<any>("get", BASE_URL);
};

/** 新增选项数据 (对应后端 router.post('/add')) */
export const addInfo = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/add`, { data });
};

/** 修改选项数据 (对应后端 router.post('/update')) */
export const updateInfo = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/update`, { data });
};

/** 删除选项数据 (对应后端 router.delete('/delete/:id')) */
export const deleteInfo = (id: number) => {
  return http.request<any>("delete", `${BASE_URL}/delete/${id}`);
};
/** 搜索数据 (对应后端 router.post('/search')) */
export const searchInfo = (data: object) => {
  return http.request<any>("post", `${BASE_URL}/search`, { data });
};
