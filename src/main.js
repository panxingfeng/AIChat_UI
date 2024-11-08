import React, { useState, useRef, useEffect } from 'react';
import {
 Image,MessageSquare, Clock,Bot, BookOpen, Mic
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import { useDrawing } from './hooks/useDrawing';
import { useFileUpload } from './hooks/useFileUpload';
import Sidebar from './components/sidebar/Sidebar';
import TopNav from './components/TopNav';
import ChatArea from './components/chat/ChatArea';
import InputArea from './components/input/InputArea';
import DrawingArea from './components/draw/DrawingArea';
import AgentArea from './components/Agent/AgentArea';
import KnowledgeArea from './components/Knowledge/KnowledgeArea';
import VoiceArea from './components/Voice/VoiceArea';
import ImageDetailModal from './components/draw/detail/ImageDetailModal';
import {agentConfigs} from "./components/Agent/agentConfig";

const StreamingOutput = () => {
  // 基础状态
  const [showSidebar, setShowSidebar] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const [documentMode, setDocumentMode] = useState('document');
  const [agentCategory, setAgentCategory] = useState('all');
  const [voiceMode, setVoiceMode] = useState('upload');

  // hooks
  const {
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
    handleModelSelect,
  } = useChat();

  const {
    drawingMode,
    imagePrompt,
    selectedCategory,
    selectedImageStyle,
    creationRecords,
    showCreationRecord,
    showImageDetail,
    selectedImageData,
    handleSendContent,
    setDrawingMode,
    setImagePrompt,
    setSelectedCategory,
    setSelectedImageStyle,
    setShowCreationRecord,
    handleCloseImageDetail
  } = useDrawing();

  const {
    uploadedImages,
    handleImageUpload,
    handleFileUpload,
    handleDeleteImage
  } = useFileUpload();

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 左侧工具栏配置
const tools = [
    {
      icon: MessageSquare,
      name: '对话',
      active: !showImageGen && !showAgent && !showKnowledge && !showVoice,
      action: () => {
        setShowImageGen(false);
        setShowAgent(false);
        setShowKnowledge(false);
        setShowVoice(false);
      }
    },
    {
      icon: Image,
      name: '绘图',
      active: showImageGen,
      action: () => {
        setShowImageGen(true);
        setShowAgent(false);
        setShowKnowledge(false);
        setShowVoice(false);
      }
    },
    {
      icon: Bot,
      name: '智能体',
      active: showAgent,
      action: () => {
        setShowImageGen(false);
        setShowAgent(true);
        setShowKnowledge(false);
        setShowVoice(false);
      }
    },
    {
      icon: BookOpen,
      name: '知识库',
      active: showKnowledge,
      action: () => {
        setShowImageGen(false);
        setShowAgent(false);
        setShowKnowledge(true);
        setShowVoice(false);
      }
    },
    {
      icon: Mic,
      name: '语音',
      active: showVoice,
      action: () => {
        setShowImageGen(false);
        setShowAgent(false);
        setShowKnowledge(false);
        setShowVoice(true);
      }
    }
  ];

  // 快捷工具栏配置
  const quickTools = [
    {
      icon: Clock,
      label: '历史记录',
      action: () => setShowSidebar(!showSidebar)
    }
  ];

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* 左侧工具栏 */}
      <Sidebar
        tools={tools}
        showImageGen={showImageGen}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顶部导航 */}
      <TopNav
        showImageGen={showImageGen}
        showDocument={showKnowledge}
        showAgent={showAgent}
        showVoice={showVoice}
        agentCategory={agentCategory}
        setAgentCategory={setAgentCategory}
        agentConfigs={agentConfigs}
        currentModel={currentModel}
        isCustomDropdownOpen={isCustomDropdownOpen}
        handleModelSelect={handleModelSelect}
        createNewConversation={createNewConversation}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        voiceMode={voiceMode}
        setVoiceMode={setVoiceMode}
        documentMode={documentMode}
        setDocumentMode={setDocumentMode}
      />

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {!showImageGen && !showAgent && !showKnowledge && !showVoice ? (
            <ChatArea
              messages={messages}
              isLor={error}
              messading={isLoading}
              erroagesEndRef={messagesEndRef}
            />
          ) : showImageGen ? (
            <DrawingArea
              drawingMode={drawingMode}
              imagePrompt={imagePrompt}
              selectedCategory={selectedCategory}
              selectedImageStyle={selectedImageStyle}
              creationRecords={creationRecords}
              showCreationRecord={showCreationRecord}
              handleSendContent={handleSendContent}
              setImagePrompt={setImagePrompt}
              setSelectedCategory={setSelectedCategory}
              setSelectedImageStyle={setSelectedImageStyle}
              setShowCreationRecord={setShowCreationRecord}
              setDrawingMode={setDrawingMode}
            />
          ) : showAgent ? (
            <AgentArea
              agentCategory={agentCategory}
            />
          ) : showKnowledge ? (
            <KnowledgeArea
              documentMode={documentMode}
              setDocumentMode={setDocumentMode}
            />
          ) : (
            <VoiceArea
              voiceMode={voiceMode}
              setVoiceMode={setVoiceMode}
            />
          )}
        </div>

        {/* 底部输入区域 - 聊天模式显示 */}
        {(!showImageGen && !showAgent && !showVoice && !showKnowledge) && (
          <InputArea
            inputValue={inputValue}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSend={handleSend}
            handleKeyPress={handleKeyPress}
            uploadedImages={uploadedImages}
            handleImageUpload={handleImageUpload}
            handleFileUpload={handleFileUpload}
            handleDeleteImage={handleDeleteImage}
            quickTools={quickTools}
          />
        )}
      </div>

      {/* 历史记录侧边栏 */}
      {showSidebar && (
        <Sidebar
          type="history"
          conversations={conversations}
          currentConversationId={currentConversationId}
          switchConversation={switchConversation}
          deleteConversation={deleteConversation}
          setShowSidebar={setShowSidebar}
        />
      )}

      {/* 图片详情模态框 */}
      <ImageDetailModal
        isOpen={showImageDetail}
        imageData={selectedImageData}
        onClose={handleCloseImageDetail}
      />
    </div>
  );
};

export default StreamingOutput;
