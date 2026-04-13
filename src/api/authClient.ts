import { Configuration } from "./generated/runtime";
import { DefaultApi } from "./generated/apis/DefaultApi";

const config = new Configuration({
  basePath: import.meta.env.VITE_MY_TASK_MANAGER_BACKEND_BASE_URL ?? "http://localhost:8080",
  credentials: "include",
});

export const authApi = new DefaultApi(config);