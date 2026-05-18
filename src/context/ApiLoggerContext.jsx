import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'

const ApiLoggerContext = createContext(null)

export function ApiLoggerProvider({ children }) {
  const [logs, setLogs]     = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const clearLogs = () => setLogs([])

  useEffect(() => {
    const reqInterceptor = axiosInstance.interceptors.request.use(config => {
      config._startTime = Date.now()
      return config
    })

    const resInterceptor = axiosInstance.interceptors.response.use(
      response => {
        const entry = {
          id:        `${Date.now()}-${Math.random()}`,
          method:    response.config.method.toUpperCase(),
          url:       response.config.url,
          body:      response.config.data ? JSON.parse(response.config.data) : null,
          status:    response.status,
          duration:  Date.now() - (response.config._startTime ?? Date.now()),
          timestamp: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jerusalem', hour12: false }),
          data:      response.data,
          ok:        true,
        }
        setLogs(prev => [entry, ...prev])
        return response
      },
      error => {
        const entry = {
          id:        `${Date.now()}-${Math.random()}`,
          method:    error.config?.method?.toUpperCase() ?? '?',
          url:       error.config?.url ?? 'unknown',
          body:      error.config?.data ? JSON.parse(error.config.data) : null,
          status:    error.response?.status ?? 0,
          duration:  Date.now() - (error.config?._startTime ?? Date.now()),
          timestamp: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jerusalem', hour12: false }),
          data:      error.response?.data ?? { error: error.message },
          ok:        false,
        }
        setLogs(prev => [entry, ...prev])
        return Promise.reject(error)
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor)
      axiosInstance.interceptors.response.eject(resInterceptor)
    }
  }, [])

  return (
    <ApiLoggerContext.Provider value={{ logs, isOpen, setIsOpen, clearLogs }}>
      {children}
    </ApiLoggerContext.Provider>
  )
}

export const useApiLogger = () => useContext(ApiLoggerContext)
