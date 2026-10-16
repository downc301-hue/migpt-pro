import type { ISpeaker } from '@mi-gpt/engine/base';
import { MiService } from './service.js';

class SpeakerManager implements ISpeaker {
  /**
   * 播放文字、音频链接
   */
  async play({ text, url }: { text?: string; url?: string } = {}) {
    if (!MiService.MiNA) {
      return false;
    }
    if (url) {
      return MiService.MiNA.play({ url });
    }
    if (text) {
      return MiService.MiNA.play({ text });
    }
    return false;
  }

  /**
   * 中断原来小爱的运行
   *
   * 注意：重启需要大约 1-2s 的时间，在此期间无法使用小爱音箱自带的 TTS 服务
   */
  async abortXiaoAI() {
    // 无法通过 MiOT 中断小爱运行
    return false;
  }
}

export const MiSpeaker = new SpeakerManager();
