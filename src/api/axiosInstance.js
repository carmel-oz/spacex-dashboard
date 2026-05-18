import axios from 'axios'

// Single shared axios instance — intercepted by ApiLoggerContext
const axiosInstance = axios.create()

export default axiosInstance
