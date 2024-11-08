import React, {useRef, useState} from 'react';
import { Mic, Send, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button
} from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { cn } from "../lib/utils";
import {useVoiceStore} from "../tool/VoiceStore";

const VoiceChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isRealtime, setIsRealtime] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);

  const [chatHistory, setChatHistory] = useState([]);

  const textareaRef = useRef(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [deleteChat, setDeleteChat] = useState(null);  // 要删除的聊天记录状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);  // 删除确认框状态
  const { voiceSamples, selectedVoice, setSelectedVoice} = useVoiceStore();

  // 自动调整高度的函数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // 最大高度150px
      textarea.style.height = `${newHeight}px`;
    }
  };

  // 处理按键事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 新对话的处理函数
  const handleNewChat = () => {
    // 如果当前有消息，保存到历史记录
    if (currentMessages.length > 0) {
      const newChat = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('zh-CN'),
        title: currentMessages[0].content.slice(0, 20) + (currentMessages[0].content.length > 20 ? '...' : ''), // 使用第一条消息作为标题
        messageCount: currentMessages.length,
        messages: currentMessages
      };

      setChatHistory(prev => [newChat, ...prev]);
    }

    // 清空当前会话
    setSelectedChat(null);
    setCurrentMessages([]);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setCurrentChat(chat);
    setShowDialog(true);
  };

  // AI回复的模拟函数
  const simulateAIResponse = (userMessage) => {
    setTimeout(() => {
      const aiResponse = {
        id: Date.now(),
        type: 'ai',
        content: `这是对 "${userMessage.content}" 的AI回复`,
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setCurrentMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputText.trim() && !isRecording) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setCurrentMessages(prev => [...prev, newMessage]);
    setInputText('');
    adjustTextareaHeight();

    // 模拟AI回复
    simulateAIResponse(newMessage);
  };

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (deleteChat) {
      setChatHistory(prev => prev.filter(chat => chat.id !== deleteChat.id));
      if (selectedChat?.id === deleteChat.id) {
        setSelectedChat(null);
      }
      if (currentChat?.id === deleteChat.id) {
        setCurrentChat(null);
      }
    }
    setShowDeleteDialog(false);
    setDeleteChat(null);
  };

  // 处理删除按钮点击
  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();  // 阻止事件冒泡
    setDeleteChat(chat);
    setShowDeleteDialog(true);
  };

  return (
    <div className="flex h-full bg-white">
      {/* 左侧历史列表 */}
      <div className="w-72 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">对话历史</h2>
            <div className="text-sm text-gray-500">
              总计: {chatHistory.length}
            </div>
          </div>
          {/* 添加新对话按钮 */}
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>新对话</span>
          </button>
        </div>

        <ScrollArea className="flex-1">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "cursor-pointer border-b hover:bg-gray-50 group", // 添加 group 类
                selectedChat?.id === chat.id && "bg-gray-50"
              )}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="p-4 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {chat.date}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare size={14} className="mr-1" />
                      {chat.messageCount}
                    </div>
                  </div>
                  <div className="font-medium truncate">{chat.title}</div>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, chat)}
                  className="ml-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除对话"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* 右侧聊天区 */}
      <div className="flex-1 flex flex-col">
        {/* 消息显示区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentMessages.length > 0 ? (
            <div className="space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    )}
                  >
                    <p>{message.content}</p>
                    <div className={cn(
                      "text-xs mt-1",
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              {selectedChat ? (
                <div className="text-center">
                  <h3 className="font-medium">{selectedChat.title}</h3>
                  <p className="text-sm mt-2">点击对话内容展开详情</p>
                </div>
              ) : (
                "开始新的语音对话"
              )}
            </div>
          )}
        </div>

        {/* 底部输入区域 */}
        <div className="p-4 border-t">
          <div className="max-w-3xl mx-auto flex items-center space-x-3">
            {/* 左侧音色选择和开关 */}
            <div className="flex items-center space-x-2">
              <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-32 text-sm border rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">默认音色</option>
                {voiceSamples.map((voice) => {
                  // 处理音色名称
                  let displayName = voice.name;
                  // 匹配 [...] 中的内容
                  const match = voice.name.match(/\[(.*?)\]/);
                  if (match) {
                    displayName = match[1];
                    // 如果提取的内容还包含下划线，只取第一部分
                    if (displayName.includes('_')) {
                      displayName = displayName.split('_')[0];
                    }
                  } else {
                    // 如果没有方括号，限制长度
                    displayName = voice.name.length > 6 ? voice.name.slice(0, 6) + '...' : voice.name;
                  }

                  return (
                      <option
                          key={voice.id}
                          value={voice.id}
                          title={voice.name} // 原始完整名称作为提示
                      >
                        {displayName}
                      </option>
                  );
                })}
              </select>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isRealtime}
                    onChange={(e) => setIsRealtime(e.target.checked)}
                    className="sr-only peer"
                />
                <div
                    className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* 输入框部分 */}
            <div className="flex-1 relative">
              <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 pr-24 border rounded-2xl resize-none min-h-[40px] max-h-[150px] overflow-y-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-normal"
                  placeholder="输入文字或按住麦克风说话... (Shift + Enter 换行)"
                  style={{
                    height: '40px', // 初始高度
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E0 #F7FAFC',
                  }}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                <button
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        isRecording
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "hover:bg-gray-100 text-gray-500"
                    )}
                    onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic size={20}/>
                </button>
                <button
                    onClick={handleSend}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    disabled={!inputText.trim() && !isRecording}
                >
                  <Send size={20}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除对话</DialogTitle>
            <DialogDescription>
              确定要删除这条对话记录吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 对话详情弹窗 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{currentChat?.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{currentChat?.date}</p>
          </div>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {currentChat?.messages.map((message) => (
                  <div
                      key={message.id}
                      className={cn(
                          "flex",
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                  >
                    <div
                        className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    )}
                  >
                    <p>{message.content}</p>
                    <div className={cn(
                      "text-xs mt-1",
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceChat;