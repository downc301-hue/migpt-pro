# migpt-pro

> 让小米小爱音箱拥有 AI 能力，7x24 在线

基于 [@mi-gpt/next](https://github.com/idootop/migpt-next) 二次开发，增加了**智能分流**和**原生插话打断**功能。

## 特性

- 🎯 **智能分流** — 时间/天气/播放/控制类问题走原生小爱秒答，其他问题走大模型
- ⚡ **真正打断** — 通过 MiNA `stop()` API 即时打断原生 TTS，无延迟插话
- 🔄 **流式回复** — 首字 2-3 秒出，边生成边播报
- 🖥️ **全云端** — 不需要和音箱同局域网，服务器在哪都能控制家里的音箱
- 🤖 **多模型兼容** — 支持豆包、GPT、DeepSeek 等 OpenAI 兼容 API

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 1. 克隆代码

```shell
git clone https://github.com/downc301-hue/migpt-pro.git
cd migpt-pro
pnpm install
```

### 2. 准备配置文件

```shell
copy apps\example\config.example.js apps\example\config.js
```

### 3. 获取小米 passToken

```shell
curl -X POST "https://account.xiaomi.com/pass/serviceLogin?sid=xiaomiio&_locale=zh_CN&country=CN" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  --data-urlencode "callback=https://www.mi.com/_xiamistatic/api/pass.html" ^
  --data-urlencode "login=你的小米账号" ^
  --data-urlencode "password=你的小米密码"
```

返回的 JSON 里 `smsResult.serviceToken` 就是 passToken（格式 `V1:xxxx...`）。

### 4. 修改 config.js

打开 `apps/example/config.js`，填入你的真实信息：

```javascript
export default {
  speaker: {
    did: '你的音箱名称',           // 如 "小米AI音箱"
    userId: '你的小米账号ID',       // 小米账号数字ID
    password: '你的小米账号密码',
    passToken: 'V1:xxxx...',       // 上一步获取的 passToken
  },
  openai: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: '你的大模型API Key',
    model: '你的模型ID',            // 如 "ep-20261006175427-4g2cb"
  },
  // ... 其他配置
};
```

### 5. 启动

```shell
pnpm --filter @mi-gpt/example start
```

看到 `✅ MiGPT started!` 就表示成功了，试试对小爱音箱说 "DEEPSEEK是什么？" 看看效果。

## 配置说明

### 智能分流

本项目通过 `onMessage` 钩子实现智能分流：

```javascript
async onMessage(engine, msg) {
  const text = msg.text || '';
  // 包含以下关键词的 → 让原生小爱自己答（秒答）
  const nativeKw = ['今天', '明天', '天气', '播放', '暂停', '关灯', '开灯', ...];
  if (nativeKw.some(k => text.includes(k))) {
    return;  // return = 交给原生处理
  }
  // 其他问题 → 打断原生 → 调用大模型
  try { await engine.MiNA?.stop(); } catch {}
  return engine.askAI(msg);
}
```

| 用户说 | 走哪 | 延迟 |
|--------|------|------|
| "今天几号？" | 原生小爱 | ~1秒 |
| "明天杭州天气？" | 原生小爱 | ~1秒 |
| "DEEPSEEK是什么？" | 大模型 | 3-5秒 |

### Speaker 配置

| 字段 | 说明 |
|------|------|
| `did` | 音箱名称，在米家 APP 里可以看到 |
| `userId` | 小米账号数字 ID |
| `password` | 小米账号密码 |
| `passToken` | 通过上面的 curl 命令获取 |
| `heartbeat` | 心跳间隔（秒），默认 100 |

### OpenAI 配置

任何兼容 OpenAI API 的大模型都可以用：

| 厂商 | baseURL | 说明 |
|------|---------|------|
| 豆包（方舟） | `https://ark.cn-beijing.volces.com/api/v3` | 便宜又快，推荐 |
| DeepSeek | `https://api.deepseek.com/v1` | 中文效果好 |
| OpenAI | `https://api.openai.com/v1` | GPT-4o 等 |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云 |

### Prompt 配置

```javascript
prompt: {
  system: '你是小爱同学。仅给出答案，不超过20字。',
},
```

### Stream 配置

```javascript
stream: {
  maxReplyLength: 200,       // 最大回复字数
  firstReplyTimeout: 150,    // 首字超时（ms）
  sentenceEndings: '。？！；?!;',  // 句子结束符
},
```

## 部署到服务器

推荐用 pm2 守护进程。

### pm2 部署

```shell
# 安装 pm2
npm install -g pm2

# 在项目根目录启动（运行目录必须是根目录，不是 apps/example）
pm2 start apps/example/app.js --name migpt

# 设置开机自启
pm2 save
pm2 startup

# 常用命令
pm2 logs migpt --lines 50   # 看日志
pm2 restart migpt            # 重启
pm2 list                     # 查看状态
pm2 stop migpt               # 停止
```

### Docker 部署

```shell
docker build -t mi-music-api .
docker run -d --name migpt -v $(pwd)/apps/example/config.js:/app/config.js mi-music-api
```

## 架构

```
小爱音箱 ──(语音)──→ 小米云端 MiNA API ──(HTTPS)──→ migpt-pro
                                                          │
                                                onMessage 钩子分流
                                                ┌─────────┴──────────┐
                                                ↓                    ↓
                                       包含原生关键词           不包含原生关键词
                                       (return 让原生处理)      (MiNA.stop → askAI)
                                                                      │
                                                                大模型 API
                                                                      │
                                                                MiNA.play → 音箱 TTS
```

### 关键 API

| API | 说明 |
|-----|------|
| `engine.MiNA.stop()` | 停止音箱播放（打断原生小爱） |
| `engine.MiNA.pause()` | 暂停 |
| `engine.MiNA.playOrPause()` | 切换播放/暂停 |
| `engine.MiNA.setVolume(volume)` | 设置音量 |
| `engine.MiNA.callUbus(scope, cmd, msg)` | 自定义 UBUS 命令 |
| `engine.askAI(msg)` | 调用大模型生成回复 |

## 常见问题

### Q: 登录失败？

一般是小米账号触发了安全验证，可以在小米 APP 里检查登录设备，或者重新获取 passToken。

### Q: 小爱插话后 AI 不回答？

检查 `config.js` 里的 `onMessage` 是否正确调用了 `engine.MiNA?.stop()` —— 必须先打断原生 TTS，再调用 AI。

### Q: AI 回答了但音箱没出声？

检查音箱是否正常在线，以及 API Key 是否还有余额。部分模型需要先在对应平台开通（比如豆包 Lite 需要去方舟控制台开通）。

### Q: 想换其他大模型？

改 `openai.baseURL` + `openai.apiKey` + `openai.model` 三个字段即可，所有兼容 OpenAI API 的模型都能用。

## 目录结构

```
migpt-pro/
├── apps/
│   ├── example/              # 使用示例（你只需要改这里）
│   │   ├── app.js            # 入口文件
│   │   ├── config.js         # ⚠️ 你的真实配置（不要提交！）
│   │   └── config.example.js # 示例配置模板
│   └── next/                 # @mi-gpt/next 库源码
├── packages/                 # 核心包
│   ├── miot/                 # 小米 IoT 控制（MiNA API）
│   ├── openai/               # 大模型对接
│   ├── chat/                 # 聊天引擎
│   ├── stream/               # 流式处理
│   ├── engine/               # 引擎基类
│   ├── config/               # 配置工具
│   └── utils/                # 工具函数
└── package.json
```

## 免责声明

1. **适用范围** — 本项目为开源非营利项目，仅供学术研究或个人测试用途。严禁用于商业服务、网络攻击、数据窃取、系统破坏等违反《网络安全法》及使用者所在地司法管辖区的法律规定的场景。
2. **非官方声明** — 本项目由第三方开发者独立开发，与小米集团及其关联方（下称"权利方"）无任何隶属/合作关系，亦未获其官方授权/认可或技术支持。项目中涉及的商标、固件、云服务的所有权利归属小米集团。若权利方主张权益，使用者应立即主动停止使用并删除本项目。

继续下载或运行本项目，即表示您已完整阅读并同意[用户协议](agreement.md)，否则请立即终止使用并彻底删除本项目。

## License

MIT License