import type { DeepPartial, Prettify } from '@mi-gpt/utils/typing';
import type { ClientOptions } from 'openai';
import type { RequestOptions } from 'openai/core';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

export type OpenAIConfig = DeepPartial<{
  /**
   * 是否启用代理
   *
   * 默认：false
   */
  enableProxy: boolean;
  /**
   * 你的大模型服务提供商的接口地址
   *
   * 支持兼容 OpenAI 接口的大模型服务，比如：DeepSeek V3 等
   *
   * 注意：一般以 /v1 结尾，不包含 /chat/completions 部分
   * - ✅ https://api.openai.com/v1
   * - ❌ https://api.openai.com/v1/（最后多了一个 /）
   * - ❌ https://api.openai.com/v1/chat/completions（不需要加 /chat/completions）
   */
  baseURL: string;
  /**
   * 密钥
   *
   * 示例：sk-1234567890
   */
  apiKey: string;
  /**
   * 模型
   *
   * 默认：gpt-4o-mini
   */
  model: string;
  /**
   * 扩展配置
   */
  extra: {
    clientOptions: Prettify<ClientOptions>;
    createParams: Prettify<ChatCompletionCreateParamsBase>;
    requestOptions: Prettify<RequestOptions>;
  };
}>;

export const kDefaultOpenAIConfig: OpenAIConfig = {
  enableProxy: false,
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: 'sk-1234567890',
  extra: {
    clientOptions: {},
    createParams: {},
    requestOptions: {},
  },
};
