# 语音助手调用方案调研

## 华为鸿蒙系统 (HarmonyOS 6.0+)

### 方案一：URL Scheme 调用
```javascript
// 华为小艺语音助手
window.location.href = 'hwvrcs://cmd?action=voice&query=' + encodeURIComponent(query);
```

### 方案二：Intent 调用（仅在 HarmonyOS WebView 中）
```javascript
// 通过 JavaScript Bridge 调用
if (window.harmonyOS && window.harmonyOS.voiceAssistant) {
  window.harmonyOS.voiceAssistant.wakeUp(query);
}
```

### 方案三：语音指令接口
```javascript
// 使用系统语音识别接口
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
```

## 其他平台支持

### iOS Siri
```javascript
window.location.href = 'siri://' + encodeURIComponent(query);
```

### 小米小爱同学
```javascript
window.location.href = 'miui://vlassistant/search?query=' + encodeURIComponent(query);
```

### OPPO 小布助手
```javascript
window.location.href = 'oppokit://voiceassistant/search?query=' + encodeURIComponent(query);
```

### VIVO Jovi
```javascript
window.location.href = 'vivovoice://search?query=' + encodeURIComponent(query);
```

## Web 标准 API

### Web Speech API (跨平台)
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.start();
// 但这是启动语音识别，不是调用系统语音助手
```

## 实现建议

1. **优先检测平台**，提供对应平台的调用方式
2. **提供 Web Speech API** 作为备选方案
3. **显示提示信息**，告知用户当前支持的方式
4. **收集反馈**，了解哪些设备可以成功调用

## 已知的华为 HarmonyOS 方式

### 通过 H5 页面唤醒小艺
```javascript
// 华为浏览器支持的深度链接
window.location.href = 'hwvrcs://voiceassistant?query=' + encodeURIComponent(query);

// 或者
window.location.href = 'huawei://voiceassistant?text=' + encodeURIComponent(query);
```

### 通过 HarmonyOS JavaScript Bridge
```javascript
// 在华为 WebView 中可能可用
if (window.JsBridge && window.JsBridge.openVoiceAssistant) {
  window.JsBridge.openVoiceAssistant(query);
}
```

## 注意事项

1. **权限问题**：调用语音助手可能需要用户授权
2. **HTTPS 要求**：某些接口要求 HTTPS 环境
3. **浏览器兼容**：不同浏览器的支持程度不同
4. **系统版本**：部分功能仅在高版本系统中可用
5. **用户反馈**：需要收集用户反馈了解成功率

## 测试建议

在华为 HarmonyOS 6.0+ 设备上测试以下场景：
1. 华为浏览器
2. 微信内置浏览器
3. Chrome 浏览器
4. 系统 WebView

## 参考资料

- 华为开发者联盟：https://developer.huawei.com/
- HarmonyOS API 文档
- Web Speech API 标准
