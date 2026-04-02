import { auth, isCloudBaseInitialized } from '../services/cloudbase'

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

    // 检查 CloudBase 是否初始化成功
    if (!isCloudBaseInitialized) {
      console.warn('CloudBase 未初始化，将使用本地存储模式')
      sessionStorage.setItem(SESSION_KEY, "1")
      localStorage.setItem(SESSION_KEY + "_cloud", "0")

      return {
        success: true,
        user: null,
        error: '云端服务不可用，已自动切换到本地存储模式\n\n数据将保存在浏览器本地缓存中，功能完全正常'
      }
    }

    // 使用 CloudBase 匿名登录（无需注册，可直接登录）
    try {
      console.log('开始 CloudBase 匿名登录...')
      
      // 先检查是否已经登录
      const currentUser = auth.currentUser
      if (currentUser) {
        console.log('用户已经登录，直接使用现有用户信息:', currentUser)
        console.log('用户 ID:', currentUser?.uid)
        console.log('用户 openid:', currentUser?.openid)

        // 保存登录状态
        sessionStorage.setItem(SESSION_KEY, "1")
        localStorage.setItem(SESSION_KEY + "_cloud", "1")

        return { success: true, user: currentUser }
      }

      // 如果没有登录，执行匿名登录
      const loginResult = await auth.signInAnonymously()
      console.log('CloudBase 匿名登录成功:', loginResult)

      // 等待一段时间，确保用户信息被设置
      await new Promise(resolve => setTimeout(resolve, 500))

      // 重新获取当前用户信息
      const userAfterLogin = auth.currentUser
      console.log('登录后的当前用户信息:', userAfterLogin)
      console.log('用户 ID:', userAfterLogin?.uid)
      console.log('用户 openid:', userAfterLogin?.openid)

      if (!userAfterLogin) {
        console.error('登录成功但无法获取用户信息！')
        throw new Error('登录成功但无法获取用户信息')
      }

      // 保存登录状态
      sessionStorage.setItem(SESSION_KEY, "1")
      localStorage.setItem(SESSION_KEY + "_cloud", "1")

      return { success: true, user: userAfterLogin }
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
        error: '云端登录失败，已自动切换到本地存储模式\n\n数据将保存在浏览器本地缓存中，功能完全正常'
      }
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      if (isCloudBaseInitialized) {
        await auth.signOut()
        console.log('CloudBase 退出登录成功')
      }
    } catch (error) {
      console.error('CloudBase 退出登录失败:', error)
    } finally {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }

  // 获取当前用户
  const getCurrentUser = (): any => {
    try {
      if (!isCloudBaseInitialized) {
        return null
      }
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

  return { isLoggedIn, login, logout, changePassword, getCurrentUser, isCloudEnabled, isCloudBaseInitialized }
}
