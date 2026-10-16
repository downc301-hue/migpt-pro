export default {
  debug: true,
  speaker: {
    heartbeat: 100,
    did: '你的音箱名称',
    userId: '你的小米账号ID',
    password: '你的小米账号密码',
    passToken: '你的小米passToken（V1:开头）',
  },
  openai: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: '你的大模型API Key',
    model: '你的模型接入点ID',
    extra: {
      createParams: {
        max_tokens: 60,
        service_tier: 'fast',
      },
    },
  },
  stream: {
    maxReplyLength: 200,
    firstReplyTimeout: 150,
    sentenceEndings: '。？！；?!;',
  },
  prompt: {
    system: '你是小爱同学。仅给出答案，不超过20字。例如问"谁是队长"答"姆巴佩"。',
  },
  context: {
    historyMaxLength: 10,
  },
  callAIKeywords: [],
  async onMessage(engine, msg) {
    const text = msg.text || '';
    const nativeKw = [
      '今天',
      '明天',
      '后天',
      '现在',
      '几点',
      '几号',
      '日期',
      '星期',
      '天气',
      '气温',
      '温度',
      '湿度',
      '空气质量',
      '风力',
      '空气质量指数',
      '播放',
      '暂停',
      '停止',
      '上一首',
      '下一首',
      '音量',
      '关灯',
      '开灯',
      '打开',
      '关闭',
      '搜索',
      '闹钟',
      '计时器',
      '提醒',
    ];
    if (nativeKw.some((k) => text.includes(k))) {
      return;
    }
    try {
      await engine.MiNA?.stop();
    } catch {}
    return engine.askAI(msg);
  },
};
