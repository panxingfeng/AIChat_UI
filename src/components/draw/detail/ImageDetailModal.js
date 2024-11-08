import React from 'react';
import { XCircle, Download, Copy, RefreshCw } from 'lucide-react';

const ImageDetailModal = ({
  isOpen,
  onClose,
  imageData,
  onShowPrompts
}) => {
  if (!isOpen || !imageData) return null;

  const handleCopyPrompt = () => {
    // 创建一个回退方案来复制文本
    const copyToClipboard = (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        // 当有 Clipboard API 可用时
        return navigator.clipboard.writeText(text)
          .then(() => alert('提示词已复制到剪贴板'))
          .catch(() => fallbackCopyToClipboard(text));
      } else {
        // 回退方案
        return fallbackCopyToClipboard(text);
      }
    };

    const fallbackCopyToClipboard = (text) => {
      try {
        // 创建临时textarea元素
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // 防止创建的元素可滚动
        textArea.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 2em;
          height: 2em;
          padding: 0;
          border: none;
          outline: none;
          boxShadow: none;
          background: transparent;
        `;

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
          alert('提示词已复制到剪贴板');
        } catch (err) {
          console.error('复制失败:', err);
          textArea.remove();
          alert('复制失败，请手动复制');
        }
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      }
    };

    // 执行复制
    copyToClipboard(imageData.inputText);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageData.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${imageData.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 主容器 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">图片详情</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 左侧图片 */}
              <div className="lg:flex-1">
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={imageData.imageUrl}
                    alt={imageData.inputText}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
              </div>

              {/* 右侧信息 */}
              <div className="lg:w-80">
                <div className="space-y-6">
                  {/* 提示词 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">提示词</h4>
                    <div className="relative">
                      <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg pr-10">
                        {imageData.inputText}
                      </p>
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* 生成信息 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">生成信息</h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">生成时间</span>
                        <span className="text-gray-800">{imageData.timestamp}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">模型风格</span>
                        <span className="text-gray-800">{imageData.modelStyle || '默认'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={onShowPrompts}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      重新生成
                    </button>

                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载图片
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;