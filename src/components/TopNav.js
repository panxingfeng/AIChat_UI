import React, { useRef, useState, useEffect } from 'react';
import { Badge } from './ui/badge.jsx';
import { PlusCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AI_MODELS, DRAWING_MODES, CUSTOM_MODEL_OPTIONS, DOC_MODES, AGENT_CATEGORIES, VOICE_MODES  } from '../constants';

const TopNav = ({
  showImageGen,
  showDocument,
  showAgent,
  showVoice,
  currentModel,
  handleModelSelect,
  createNewConversation,
  drawingMode,
  setDrawingMode,
  documentMode,
  setDocumentMode,
  agentCategory,
  voiceMode,
  setVoiceMode,
  setAgentCategory,
  agentConfigs
}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [selectedCustomModel, setSelectedCustomModel] = useState(null);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);

    // 处理点击自定义模型按钮
  const handleCustomModelClick = () => {
    setIsCustomDropdownOpen(!isCustomDropdownOpen);
  };

  // 处理选择自定义模型选项
  const handleCustomModelSelect = (option) => {
    const modelId = `custom_${option.id}`;
    handleModelSelect(modelId);
    setSelectedCustomModel(option);
    setIsCustomDropdownOpen(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scrollContainerRef.current && !scrollContainerRef.current.contains(event.target)) {
        setIsCustomDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取每个分类下的智能体数量
  const getAgentCountByCategory = (categoryId) => {
    if (!agentConfigs) return 0;
    if (categoryId === 'all') return agentConfigs.length;
    return agentConfigs.filter(agent => agent.category === categoryId).length;
  };

  // 检查是否需要显示滚动按钮
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // 监听滚动容器大小变化
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(container);
      container.addEventListener('scroll', checkScroll);

      return () => {
        resizeObserver.disconnect();
        container.removeEventListener('scroll', checkScroll);
      };
    }
  }, []);

  // 滚动处理函数
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 渲染滚动按钮
  const renderScrollButton = (direction) => {
    const show = direction === 'left' ? showLeftScroll : showRightScroll;
    if (!show) return null;

    return (
      <button
        onClick={() => handleScroll(direction)}
        className={`
          absolute top-1/2 -translate-y-1/2 z-10
          ${direction === 'left' ? 'left-0' : 'right-0'}
          h-full px-2 bg-gradient-to-r
          ${direction === 'left' 
            ? 'from-white via-white to-transparent' 
            : 'from-transparent via-white to-white'}
          hover:bg-opacity-90 transition-opacity
        `}
      >
        {direction === 'left' ? (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>
    );
  };

 // 渲染聊天模式导航
  const renderChatNav = () => (
    <>
      <div className="flex-shrink-0 mr-4">
        <button
          onClick={createNewConversation}
          className="flex items-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} />
          <span>新对话</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 min-w-0">
        {AI_MODELS.map((model) => (
          <div key={model.id} className="flex-shrink-0">
            <button
              onClick={() => {
                if (model.id === 'custom') {
                  handleCustomModelClick();
                } else if (model.id.startsWith('agent')) {
                  // 添加 agent_ 前缀以标识智能体模型
                  handleModelSelect(`agent_${model.id}`);
                  setSelectedCustomModel(null);
                  setIsCustomDropdownOpen(false);
                } else {
                  // 添加 chat_ 前缀以标识聊天模型
                  handleModelSelect(`chat_${model.id}`);
                  setSelectedCustomModel(null);
                  setIsCustomDropdownOpen(false);
                }
              }}
              className={`
                relative flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap
                ${(currentModel === model.id || 
                   currentModel === `chat_${model.id}` || 
                   currentModel === `agent_${model.id}` || 
                   (model.id === 'custom' && currentModel?.startsWith('custom_')))
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span>
                {model.id === 'custom' && selectedCustomModel
                  ? selectedCustomModel.name
                  : model.name}
              </span>
              {model.tag && (
                <span className={`
                  ml-1 text-xs whitespace-nowrap
                  ${model.tag === '会员'
                    ? 'text-red-500'
                    : model.primary
                      ? 'text-emerald-400'
                      : 'text-gray-400'
                  }
                `}>
                  {model.tag}
                </span>
              )}
              {model.id === 'custom' && (
                <ChevronDown
                  size={14}
                  className={`ml-1 transform transition-transform ${
                    isCustomDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {model.id === 'custom' && isCustomDropdownOpen && (
              <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-20 w-40">
                {CUSTOM_MODEL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleCustomModelSelect(option)}
                    className={`
                      block w-full px-3 py-1.5 text-left text-xs truncate hover:bg-gray-100
                      ${currentModel === `custom_${option.id}` ? 'bg-gray-200 text-gray-800' : 'text-gray-600'}
                    `}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );


  // 渲染绘图模式导航
  const renderDrawingNav = () => (
    <div className="flex items-center justify-between w-full min-w-0">
      <div className="flex items-center space-x-6 min-w-0">
        <h3 className="text-lg font-semibold flex-shrink-0">AI绘图</h3>
        <div className="flex space-x-2 min-w-0">
          {DRAWING_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setDrawingMode(mode.id)}
              className={`
                px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors whitespace-nowrap flex-shrink-0
                ${drawingMode === mode.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <mode.icon size={16} />
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染知识库模式导航
  const renderDocumentNav = () => (
    <div className="flex items-center w-full min-w-0">
      <div className="flex items-center space-x-6 min-w-0">
        <h3 className="text-lg font-semibold flex-shrink-0">知识库</h3>
        <div className="flex space-x-2 min-w-0">
          {DOC_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setDocumentMode(mode.id)}
              className={`
                px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors whitespace-nowrap flex-shrink-0
                ${documentMode === mode.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={mode.description}
            >
              <mode.icon size={16} />
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染智能体模式导航
  const renderAgentNav = () => (
    <div className="flex items-center w-full min-w-0">
      <div className="flex items-center space-x-6 min-w-0">
        <h3 className="text-lg font-semibold flex-shrink-0">智能体</h3>
        <div className="flex space-x-2 min-w-0">
          {AGENT_CATEGORIES.map((category) => {
            const count = getAgentCountByCategory(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setAgentCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors 
                  whitespace-nowrap flex-shrink-0 group relative
                  ${agentCategory === category.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                title={category.description}
              >
                <category.icon size={16} className="flex-shrink-0" />
                <span>{category.name}</span>
                {category.id !== 'all' && count > 0 && (
                  <Badge
                    variant="secondary"
                    className={`
                      ml-1 flex-shrink-0
                      ${agentCategory === category.id ? 'bg-gray-700' : 'bg-gray-200'}
                    `}
                  >
                    {count}
                  </Badge>
                )}
                <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100
                             bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1
                             text-xs text-white bg-gray-800 rounded whitespace-nowrap
                             transition-all duration-200">
                  {category.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 渲染语音导航栏
  const renderVoiceNav = () => (
    <div className="flex items-center w-full min-w-0">
      <div className="flex items-center space-x-6 min-w-0">
        <h3 className="text-lg font-semibold flex-shrink-0">AI语音</h3>
        <div className="flex space-x-2 min-w-0">
          {VOICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVoiceMode(mode.id)}
              className={`
                px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors 
                whitespace-nowrap flex-shrink-0 group relative
                ${voiceMode === mode.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={mode.description}
            >
              <mode.icon size={16} className="flex-shrink-0" />
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-16 bg-white border-b shadow-sm relative">
      {renderScrollButton('left')}
      <div
        ref={scrollContainerRef}
        className="px-6 h-full flex items-center overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {showImageGen ? renderDrawingNav() :
         showDocument ? renderDocumentNav() :
         showVoice ? renderVoiceNav() :
         showAgent ? renderAgentNav() :
         renderChatNav()}
      </div>
      {renderScrollButton('right')}
    </div>
  );
};

export default TopNav;