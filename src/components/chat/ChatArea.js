import React from 'react';
import { Brain } from 'lucide-react';
import MessageContent from './detail/MessageContent';
import { ASSISTANT_TITLE, ASSISTANT_DESCRIPTION } from '../../constants';


const ChatArea = ({
  messages,
  isLoading,
  error,
  messagesEndRef
}) => {
  // 渲染空状态
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{ASSISTANT_TITLE}</h2>
        <p className="text-gray-500 mb-8">{ASSISTANT_DESCRIPTION}</p>
      </div>
    );
  }

  // 获取消息气泡样式
  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* 消息列表 */}
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div className={`max-w-[70%] ${message.type === 'user' ? 'order-2' : 'order-1 ml-12'}`}>
            <div
              className={`relative p-4 rounded-2xl shadow-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* AI头像 */}
              {message.type === 'assistant' && (
                <div className="absolute -left-12 top-2 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              )}

              {/* 消息内容 */}
              <MessageContent
                content={message.content}
                type={message.type}
              />

              {/* 时间戳 */}
              <div
                className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {message.timestamp}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="text-sm">正在思考...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* 滚动锚点 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;
