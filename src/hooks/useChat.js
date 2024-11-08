import { useState, useEffect } from 'react';
import { API_CONFIG } from '../constants';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentModel, setCurrentModel] = useState('creative');
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);

  // 创建新对话
  const createNewConversation = () => {
    const newId = Date.now();
    setCurrentConversationId(newId);
    setConversations(prev => [{
      id: newId,
      title: '新对话',
      messages: [],
      timestamp: new Date().toLocaleString(),
      starred: false,
      pinned: false
    }, ...prev]);
    setMessages([]);
    setInputValue('');
    setError(null);
  };

  // 切换对话
  const switchConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages || []);
      setError(null);
    }
  };

  // 删除对话
  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理按键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理模型选择
  const handleModelSelect = (modelId) => {
    if (modelId === 'custom') {
      setIsCustomDropdownOpen(!isCustomDropdownOpen);
    } else {
      setCurrentModel(modelId);
      setIsCustomDropdownOpen(false);
    }
  };

    // 获取当前模型类型
  const getModelType = (modelId) => {
    if (modelId.startsWith('agent')) {
      return 'agent';
    }
    if (modelId.startsWith('custom_')) {
      // 如果是自定义模型，返回 custom{模型名称}
      return `custom${modelId.split('custom_')[1]}`;
    }
    return 'chat';
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (!currentConversationId) {
      createNewConversation();
    }

    try {
      const userMessage = {
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: currentModel,
          type: getModelType(currentModel) // 添加 type 参数
        }),
      });

      if (!response.ok) throw new Error('服务器连接失败');

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      // 创建AI响应消息
      const aiMessage = {
        type: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        responseText += decoder.decode(value, { stream: true });
        // 更新AI响应
        // eslint-disable-next-line no-loop-func
        setMessages(prev => prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, content: responseText } : msg
        ));
      }

    } catch (err) {
      setError('连接服务器失败，请检查网络连接');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存对话
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages,
            title: messages[0].content.slice(0, 30) || '新对话'
          };
        }
        return conv;
      }));
    }
  }, [messages, currentConversationId]);

 return {
    messages,
    inputValue,
    isLoading,
    error,
    conversations,
    currentConversationId,
    currentModel,
    isCustomDropdownOpen,
    handleInputChange,
    handleSend,
    handleKeyPress,
    createNewConversation,
    switchConversation,
    deleteConversation,
    handleModelSelect
  };
};