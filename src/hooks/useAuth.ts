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
    return sessionStorage.getItem(SESSION_KEY) === "1"
  }

  // 验证密码并登录
  const login = (password: string): boolean => {
    if (password === getStoredPassword()) {
      sessionStorage.setItem(SESSION_KEY, "1")
      return true
    }
    return false
  }

  // 退出登录
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
  }

  // 修改密码（需要验证旧密码）
  const changePassword = (oldPwd: string, newPwd: string): boolean => {
    if (oldPwd !== getStoredPassword()) return false
    localStorage.setItem(PASSWORD_KEY, newPwd)
    return true
  }

  return { isLoggedIn, login, logout, changePassword }
}
