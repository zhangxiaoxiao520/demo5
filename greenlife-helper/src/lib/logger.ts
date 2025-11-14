import { supabase } from './supabase'

// 日志级别枚举
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 日志接口
export interface LogEntry {
  log_level: LogLevel
  message: string
  details?: any
  source?: string
}

// 临时存储日志（在能够保存到数据库之前）
let pendingLogs: LogEntry[] = []

// 保存日志到数据库
export const saveLog = async (logEntry: LogEntry) => {
  try {
    const { error } = await supabase
      .from('logs')
      .insert([{
        log_level: logEntry.log_level,
        message: logEntry.message,
        details: logEntry.details || null,
        source: logEntry.source || 'frontend'
      }])
    
    if (error) {
      console.warn('Failed to save log to database:', error)
      // 添加到待处理日志
      pendingLogs.push(logEntry)
    }
  } catch (error) {
    console.warn('Error saving log:', error)
    pendingLogs.push(logEntry)
  }
}

// 保存所有待处理日志
export const savePendingLogs = async () => {
  if (pendingLogs.length === 0) return
  
  try {
    const logsToSave = [...pendingLogs]
    pendingLogs = []
    
    for (const logEntry of logsToSave) {
      await saveLog(logEntry)
    }
  } catch (error) {
    console.warn('Error saving pending logs:', error)
  }
}

// 检查并保存当前日志
export const saveCurrentLogs = async () => {
  return await savePendingLogs()
}

// 日志函数
export const logger = {
  error: (message: string, details?: any, source?: string) => {
    console.error(`[ERROR] ${source || 'unknown'}:`, message, details)
    saveLog({
      log_level: LogLevel.ERROR,
      message,
      details,
      source
    })
  },
  
  warn: (message: string, details?: any, source?: string) => {
    console.warn(`[WARN] ${source || 'unknown'}:`, message, details)
    saveLog({
      log_level: LogLevel.WARN,
      message,
      details,
      source
    })
  },
  
  info: (message: string, details?: any, source?: string) => {
    console.info(`[INFO] ${source || 'unknown'}:`, message, details)
    saveLog({
      log_level: LogLevel.INFO,
      message,
      details,
      source
    })
  },
  
  debug: (message: string, details?: any, source?: string) => {
    console.debug(`[DEBUG] ${source || 'unknown'}:`, message, details)
    saveLog({
      log_level: LogLevel.DEBUG,
      message,
      details,
      source
    })
  }
}

// 批量保存日志（性能优化）
export const batchSaveLogs = async (logs: LogEntry[]) => {
  try {
    const { error } = await supabase
      .from('logs')
      .insert(logs.map(log => ({
        log_level: log.log_level,
        message: log.message,
        details: log.details || null,
        source: log.source || 'frontend'
      })))
    
    if (error) {
      console.warn('Failed to batch save logs:', error)
      pendingLogs.push(...logs)
    }
  } catch (error) {
    console.warn('Error batch saving logs:', error)
    pendingLogs.push(...logs)
  }
}

// 导出默认日志对象
export default logger