import { useState, useCallback, useEffect } from 'react';
import { VOICE_OPTIONS, VOICE_PRESETS } from '../constants';

export const useVoice = ({
  defaultVoice = '',
  onVoiceChange = () => {},
  enableSpeech = true
} = {}) => {
  // 状态管理
  const [voiceOptions, setVoiceOptions] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [error, setError] = useState(null);

  // 初始化语音合成
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    if (enableSpeech && window.speechSynthesis) {
      setSynth(window.speechSynthesis);

      // 获取可用的语音
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        if (synth && synth.speaking) {
          synth.cancel();
        }
      };
    }
  }, [enableSpeech, synth]);

  // 处理语音选择
  const handleVoiceSelect = useCallback((voiceId) => {
    if (VOICE_OPTIONS.includes(voiceId)) {
      setSelectedVoice(voiceId);
      setVoiceOptions(false);
      onVoiceChange(voiceId);
    }
  }, [onVoiceChange]);

  // 切换语音选项显示
  const toggleVoiceOptions = useCallback(() => {
    setVoiceOptions(prev => !prev);
  }, []);

  // 获取当前语音配置
  const getCurrentVoiceConfig = useCallback(() => {
    const voiceId = Object.keys(VOICE_PRESETS).find(
      key => VOICE_PRESETS[key].name === selectedVoice
    );
    return voiceId ? VOICE_PRESETS[voiceId] : null;
  }, [selectedVoice]);

  // 文本转语音
  const speak = useCallback((text) => {
    if (!enableSpeech) {
      setError('语音功能未启用');
      return;
    }

    if (!synth) {
      setError('浏览器不支持语音合成');
      return;
    }

    if (synth.speaking) {
      synth.cancel();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceConfig = getCurrentVoiceConfig();

      if (voiceConfig) {
        utterance.pitch = voiceConfig.pitch;
        utterance.rate = voiceConfig.rate;
        utterance.volume = voiceConfig.volume;
        utterance.lang = voiceConfig.language;

        // 查找匹配的系统语音
        const systemVoice = availableVoices.find(v =>
          v.lang === voiceConfig.language &&
          v.name.toLowerCase().includes(voiceConfig.id)
        );
        if (systemVoice) {
          utterance.voice = systemVoice;
        }
      }

      // 事件处理
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        setError(`语音合成错误: ${event.error}`);
        setIsPlaying(false);
      };

      synth.speak(utterance);
    } catch (err) {
      setError(`语音合成失败: ${err.message}`);
      setIsPlaying(false);
    }
  }, [synth, enableSpeech, getCurrentVoiceConfig, availableVoices]);

  // 控制方法
  const stop = useCallback(() => {
    if (synth && synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
    }
  }, [synth]);

  const pause = useCallback(() => {
    if (synth && synth.speaking) {
      synth.pause();
      setIsPlaying(false);
    }
  }, [synth]);

  const resume = useCallback(() => {
    if (synth && synth.paused) {
      synth.resume();
      setIsPlaying(true);
    }
  }, [synth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 状态
    voiceOptions,
    selectedVoice,
    isPlaying,
    error,
    availableVoices,

    // 控制方法
    handleVoiceSelect,
    toggleVoiceOptions,
    speak,
    stop,
    pause,
    resume,
    clearError,

    // 工具方法
    getCurrentVoiceConfig
  };
};