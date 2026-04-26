// 检测设备类型
export function detectDevice(): 'huawei' | 'android' | 'ios' | 'other' {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('harmonyos') || ua.includes('huawei') || ua.includes('honor')) {
    return 'huawei'
  }
  if (ua.includes('android')) return 'android'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios'
  return 'other'
}

// 复制文字到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // 降级方案：execCommand
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

// 尝试打开语音助手（Android Intent，best-effort）
export function tryLaunchVoiceAssistant(device: string): void {
  try {
    if (device === 'huawei') {
      // 华为小艺：尝试 Android Intent 拉起（EMUI / HarmonyOS Android-based）
      const intent = `intent://com.huawei.vassistant#Intent;` +
        `scheme=huawei;` +
        `package=com.huawei.vassistant;` +
        `action=android.intent.action.MAIN;` +
        `category=android.intent.category.LAUNCHER;` +
        `end`
      window.location.href = intent
    } else if (device === 'android') {
      // 通用 Android：尝试打开语音搜索 Intent
      const intent = `intent:#Intent;` +
        `action=android.intent.action.VOICE_COMMAND;` +
        `end`
      window.location.href = intent
    }
    // iOS / other: 不做操作，只靠剪贴板
  } catch {
    // 静默失败
  }
}

// 主入口：复制 + 尝试拉起 + 返回设备信息供 UI 展示
export async function sendQueryToAssistant(query: string): Promise<{
  copied: boolean
  device: string
}> {
  const device = detectDevice()
  const copied = await copyToClipboard(query)

  // 给剪贴板 100ms 写入时间，再尝试拉起（避免浏览器跳转中断写入）
  setTimeout(() => {
    tryLaunchVoiceAssistant(device)
  }, 150)

  return { copied, device }
}
