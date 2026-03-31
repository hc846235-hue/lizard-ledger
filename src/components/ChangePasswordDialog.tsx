import { useState } from "react"
import { Lock, Eye, EyeOff, X, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
  onSave: (oldPwd: string, newPwd: string) => boolean
}

export function ChangePasswordDialog({ open, onClose, onSave }: ChangePasswordDialogProps) {
  const [oldPwd, setOldPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const reset = () => {
    setOldPwd(""); setNewPwd(""); setConfirmPwd("")
    setShowOld(false); setShowNew(false); setShowConfirm(false)
    setError(""); setSuccess(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPwd.length < 4) {
      setError("新密码至少需要4位")
      return
    }
    if (newPwd !== confirmPwd) {
      setError("两次输入的新密码不一致")
      return
    }
    const ok = onSave(oldPwd, newPwd)
    if (!ok) {
      setError("当前密码错误")
      return
    }
    setSuccess(true)
    setTimeout(() => {
      handleClose()
    }, 1500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">修改密码</span>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">密码修改成功</p>
              <p className="text-xs text-gray-400">即将关闭...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 当前密码 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">当前密码</label>
                <div className="relative">
                  <Input
                    type={showOld ? "text" : "password"}
                    placeholder="请输入当前密码"
                    value={oldPwd}
                    onChange={(e) => { setOldPwd(e.target.value); setError("") }}
                    className="pr-10 text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showOld ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">新密码</label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="至少4位"
                    value={newPwd}
                    onChange={(e) => { setNewPwd(e.target.value); setError("") }}
                    className="pr-10 text-sm"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* 确认新密码 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">确认新密码</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="再次输入新密码"
                    value={confirmPwd}
                    onChange={(e) => { setConfirmPwd(e.target.value); setError("") }}
                    className="pr-10 text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-sm" onClick={handleClose}>
                  取消
                </Button>
                <Button type="submit" className="flex-1 text-sm" disabled={!oldPwd || !newPwd || !confirmPwd}>
                  保存修改
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
