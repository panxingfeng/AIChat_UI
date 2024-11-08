import React from 'react';
import { Copy, Check, Image as ImageIcon, Pause, Play, RotateCcw } from 'lucide-react';

const MessageContent = ({
  content,
  type = 'text', // 'text' | 'code' | 'mixed' | 'voice'
  voiceUrl,      // 新增语音URL参数
  voiceDuration  // 新增语音时长参数
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const audioRef = React.useRef(null);
  const progressInterval = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

// 更新播放进度
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 处理音频加载完成，获取时长
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 播放/暂停控制
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play();
      progressInterval.current = setInterval(updateProgress, 100);
    }
    setIsPlaying(!isPlaying);
  };

  // 重新播放
  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play();
    setIsPlaying(true);
    progressInterval.current = setInterval(updateProgress, 100);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 解析语音链接
  const parseVoiceContent = (text) => {
    const voiceLinkMatch = text.match(/!\[\]\((https?:\/\/[^\s\)]+\.(?:mp3|wav|ogg|m4a))\)/i);
    if (!voiceLinkMatch) return null;

    const messageText = text.replace(voiceLinkMatch[0], '').trim();
    return {
      voiceUrl: voiceLinkMatch[1],
      text: messageText
    };
  };

 // 渲染语音内容
  const renderVoiceContent = (url, messageText = '') => {
    if (!url) return null;

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
      <div className="space-y-2">
        {messageText && (
          <div className="whitespace-pre-wrap text-gray-700">
            {messageText}
          </div>
        )}

        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg max-w-[320px]">
          {/* 播放/暂停按钮 */}
          <button
            onClick={handlePlayPause}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isPlaying ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
            }`}
          >
            {isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-1" />
            )}
          </button>

          <div className="flex-1">
            {/* 进度条 */}
            <div className="h-1.5 bg-gray-200 rounded cursor-pointer relative"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = e.clientX - rect.left;
                   const percentage = x / rect.width;
                   const newTime = percentage * duration;
                   audioRef.current.currentTime = newTime;
                   setCurrentTime(newTime);
                 }}>
              <div
                className="h-full bg-blue-500 rounded transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* 时间显示 - 使用flex布局和space-between */}
            <div className="flex justify-between items-center mt-2 px-1">
              {/* 当前时间 */}
              <div className="font-mono text-xs text-gray-500 tabular-nums min-w-[45px]">
                {formatTime(currentTime)}
              </div>

              {/* 空白间隔 */}
              <div className="flex-grow" />

              {/* 总时长 */}
              <div className="font-mono text-xs text-gray-500 tabular-nums min-w-[45px] text-right">
                {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* 重新播放按钮 */}
          <button
            onClick={handleRestart}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500"
          >
            <RotateCcw size={16} />
          </button>

          <audio
            ref={audioRef}
            src={url}
            onEnded={handleAudioEnded}
            onLoadedMetadata={handleAudioLoadedMetadata}
            className="hidden"
          />
        </div>
      </div>
    );
  };

  // 清理 Markdown 图片语法
  const cleanMarkdownImageSyntax = (text) => {
    return text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
  };

  // 提取所有图片URL
  const extractImageUrls = (text) => {
    const urls = [];
    // 提取 Markdown 图片语法中的URL
    const mdImageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = mdImageRegex.exec(text)) !== null) {
      if (match[1]) urls.push(match[1]);
    }

    // 提取普通URL
    const urlRegex = /(?<![\[\(])(https?:\/\/[^\s\)]+\.(?:jpg|jpeg|png|gif|webp))(?!\))/gi;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[0]);
    }

    return urls;
  };

  // 渲染图片内容
  const renderImage = (imageUrl, index) => (
    <div key={index} className="relative group max-w-[600px] w-full">
      <img
        src={imageUrl}
        alt={`Content ${index + 1}`}
        className="w-full h-auto rounded-lg object-cover"
        onClick={() => {/* 可以添加图片预览功能 */}}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  // 渲染代码块
  const renderCodeBlock = (codeContent) => {
    const parts = [];
    let currentText = '';
    let currentCode = { language: '', content: '' };
    let isInCodeBlock = false;

    const lines = codeContent.split('\n');

    lines.forEach((line) => {
      if (line.startsWith('```')) {
        if (!isInCodeBlock) {
          if (currentText) {
            const imageUrls = extractImageUrls(currentText);
            const cleanedText = cleanMarkdownImageSyntax(currentText);

            if (cleanedText.trim()) {
              parts.push({ type: 'text', content: cleanedText });
            }

            imageUrls.forEach(url => {
              parts.push({ type: 'image', content: url });
            });

            currentText = '';
          }
          const lang = line.slice(3).trim();
          currentCode = { language: lang, content: '' };
          isInCodeBlock = true;
        } else {
          if (currentCode.content) {
            parts.push({
              type: 'code',
              language: currentCode.language,
              content: currentCode.content.trim()
            });
          }
          currentCode = { language: '', content: '' };
          isInCodeBlock = false;
        }
      } else {
        if (isInCodeBlock) {
          if (currentCode.content) {
            currentCode.content += '\n';
          }
          currentCode.content += line;
        } else {
          if (currentText) {
            currentText += '\n';
          }
          currentText += line;
        }
      }
    });

    // 处理最后一个块
    if (isInCodeBlock && currentCode.content) {
      parts.push({
        type: 'code',
        language: currentCode.language,
        content: currentCode.content.trim()
      });
    } else if (currentText) {
      const imageUrls = extractImageUrls(currentText);
      const cleanedText = cleanMarkdownImageSyntax(currentText);

      if (cleanedText.trim()) {
        parts.push({ type: 'text', content: cleanedText });
      }

      imageUrls.forEach(url => {
        parts.push({ type: 'image', content: url });
      });
    }

    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={`text-${index}`} className="whitespace-pre-wrap">
                {part.content}
              </div>
            );
          } else if (part.type === 'code') {
            return (
              <div key={`code-${index}`} className="relative bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
                  <span className="text-gray-400 text-sm">
                    {part.language || 'code'}
                  </span>
                  <button
                    onClick={() => handleCopy(part.content)}
                    className="flex items-center space-x-1 px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="text-xs">
                      {copied ? '已复制' : '复制代码'}
                    </span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="text-gray-100 text-sm font-mono">
                    {part.content}
                  </code>
                </pre>
              </div>
            );
          } else if (part.type === 'image') {
            return renderImage(part.content, index);
          }
          return null;
        })}
      </div>
    );
  };

  // 渲染混合内容（图文混合）
  const renderMixedContent = (mixedContent) => {
    return (
      <div className="space-y-4">
        {/* 语音内容 */}
        {type === 'voice' && renderVoiceContent()}

        {/* 文本内容 */}
        {mixedContent.text && (
          <div className="whitespace-pre-wrap">{mixedContent.text}</div>
        )}

        {/* 图片内容 */}
        {mixedContent.images && mixedContent.images.length > 0 && (
          <div className="flex flex-col space-y-4">
            {mixedContent.images.map((imageUrl, index) => renderImage(imageUrl, index))}
          </div>
        )}
      </div>
    );
  };

  // 主渲染逻辑
  if (typeof content === 'string') {
    // 检查是否包含语音链接
    const voiceContent = parseVoiceContent(content);
    if (voiceContent) {
      return renderVoiceContent(voiceContent.voiceUrl, voiceContent.text);
    }

    // 其他内容的处理保持不变
    const hasSpecialContent = content.includes('```') ||
                            content.includes('https://') ||
                            content.includes('![');

    if (hasSpecialContent) {
      return renderCodeBlock(content);
    } else {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
  }

  if (content?.type === 'mixed') {
    return renderMixedContent(content);
  }

  if (!content) {
    return <div className="text-gray-400">空内容</div>;
  }

  return null;
};

// 进度条动画关键帧
const style = document.createElement('style');
style.textContent = `
@keyframes progress {
  0% { width: 0% }
  100% { width: 100% }
}
.animate-progress {
  animation: progress var(--duration, 1s) linear;
}
`;
document.head.appendChild(style);

export default MessageContent;