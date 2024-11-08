import React, { useEffect, useRef } from 'react';
import { Send, Image, Paperclip, XCircle } from 'lucide-react';

const InputArea = ({
  inputValue,
  isLoading,
  handleInputChange,
  handleSend,
  handleKeyPress,
  uploadedImages,
  handleImageUpload,
  handleFileUpload,
  handleDeleteImage,
  quickTools,
}) => {
  const inputRef = useRef(null);

  // 自动聚焦到输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="p-2 flex flex-col space-y-2 rounded-xl" style={{ backgroundColor: 'transparent' }}>
        {/* 快捷工具栏 */}
        <div className="flex items-center space-x-2 px-2">
          {quickTools.map((tool, index) => (
            <button
              key={index}
              onClick={tool.action}
              className="text-gray-500 hover:text-gray-800 text-sm flex items-center space-x-1"
            >
              <tool.icon size={14} />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* 图片预览区 */}
        {uploadedImages.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto mb-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group cursor-pointer">
                <img
                  src={URL.createObjectURL(image)}
                  alt="预览图"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleDeleteImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入区域 - 背景透明，文本框白色背景 */}
        <div className="p-2 flex items-center space-x-2 bg-transparent">
          {/* 左侧工具按钮 */}
          <div className="flex items-center space-x-1">
            {/* 图片上传 */}
            <label className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
              <Image size={20} className="text-gray-500" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                multiple
              />
            </label>

            {/* 文件上传 */}
            <label className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
              <Paperclip size={20} className="text-gray-500" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
            </label>
          </div>

          {/* 文本输入框，白色背景，支持滚动 */}
          <textarea
            ref={inputRef}
            className="flex-1 resize-none outline-none bg-white rounded-lg p-2 h-full overflow-y-auto"
            rows="1"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="请输入消息..."
            disabled={isLoading}
            style={{
              minHeight: '44px',
              maxHeight: '150px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputValue.trim() && !uploadedImages.length)}
            className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send
              size={20}
              className={`${
                isLoading || (!inputValue.trim() && !uploadedImages.length)
                  ? 'text-gray-300'
                  : 'text-gray-500'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
