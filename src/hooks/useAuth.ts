import { auth } from '../services/cloudbase'

const PASSWORD_KEY = "lizard_ledger_pwd"
const SESSION_KEY = "lizard_ledger_session"
const DEFAULT_PASSWORD = "lizard2024"

export function useAuth() {
  // 获取当前存储的密码（第一次使用默认密码）
  const getStoredPassword = (): string => {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD
  }

  // 检查是否已登录（session存在且有效）
  const isLoggedIn = (): boolean => {
    const sessionValid = sessionStorage.getItem(SESSION_KEY) === "1"
    const cloudEnabled = localStorage.getItem(SESSION_KEY + "_cloud") !== "0"
    return sessionValid
  }

  // 检查是否启用了云端存储
  const isCloudEnabled = (): boolean => {
    return localStorage.getItem(SESSION_KEY + "_cloud") !== "0"
  }

  // 验证密码并登录
  const login = async (password: string): Promise<{ success: boolean; user: any; error?: string }> => {
    if (password !== getStoredPassword()) {
      return { success: false, user: null, error: '密码错误' }
    }

    // 使用 CloudBase 匿名登录（无需注册，可直接登录）
    try {
      console.log('开始 CloudBase 匿名登录...')
      const loginResult = await auth.signInAnonymously()
      console.log('CloudBase 匿名登录成功:', loginResult)

      // 获取当前用户信息
      const currentUser = auth.currentUser
      console.log('当前用户信息:', currentUser)
      console.log('用户 ID:', currentUser?.uid)
      console.log('用户 openid:', currentUser?.openid)

      // 保存登录状态
      sessionStorage.setItem(SESSION_KEY, "1")
      localStorage.setItem(SESSION_KEY + "_cloud", "1")

      return { success: true, user: currentUser }
    } catch (error: any) {
      console.error('CloudBase 登录失败:', error)
      console.error('错误详情:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      })

      // CloudBase 登录失败，仍然允许使用本地存储模式
      console.warn('CloudBase 登录失败，将使用本地存储模式')
      sessionStorage.setItem(SESSION_KEY, "1")
      localStorage.setItem(SESSION_KEY + "_cloud", "0")

      return {
        success: true,
        user: null,
        error: '云端登录失败，已切换到本地存储模式'
      }
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await auth.signOut()
      console.log('CloudBase 退出登录成功')
    } catch (error) {
      console.error('CloudBase 退出登录失败:', error)
    } finally {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }

  // 获取当前用户
  const getCurrentUser = (): any => {
    try {
      const user = auth.currentUser
      console.log('获取当前用户:', user)
      return user
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  // 修改密码（需要验证旧密码）
  const changePassword = (oldPwd: string, newPwd: string): boolean => {
    if (oldPwd !== getStoredPassword()) return false
    localStorage.setItem(PASSWORD_KEY, newPwd)
    return true
  }

  return { isLoggedIn, login, logout, changePassword, getCurrentUser, isCloudEnabled }
}
