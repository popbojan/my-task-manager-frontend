import { ApiClient, DefaultApi } from './generated/src/index.js'

const API_BASE_URL = import.meta.env.VITE_MY_TASK_MANAGER_BACKEND_BASE_URL ?? 'http://localhost:8080'

const client = new ApiClient()
client.basePath = API_BASE_URL

export const authApi = new DefaultApi(client)
