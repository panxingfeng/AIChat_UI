import React, { useState } from 'react';
import { Brain, XCircle, Search, Trash2, Star, Pin } from 'lucide-react';

const Sidebar = ({
  type = 'tools',
  tools,
  conversations = [],
  currentConversationId,
  switchConversation,
  deleteConversation,
  setShowSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderToolsSidebar = () => (
      <div className="w-20 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center py-6 text-white">
          <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Brain size={24}/>
              </div>
          </div>

          <div className="flex-1 space-y-4">
              {tools.map((tool, index) => (
                  <button
                      key={index}
                      onClick={tool.action}
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${
                          tool.active ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                  >
                      <tool.icon size={20}/>
                      <span className="text-xs mt-1">{tool.name}</span>
                  </button>
              ))}
          </div>
      </div>
  );

    const renderHistorySidebar = () => (
        <>
            <div className="w-full p-4 border-b border-gray-300 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">历史记录</h3>
                    <button
                        onClick={() => setShowSidebar(false)}
                        className="p-1 hover:bg-gray-300 rounded-full transition-colors"
                    >
                        <XCircle size={20}/>
                    </button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="搜索历史记录..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
                    />
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto p-4 bg-white">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery ? '无搜索结果' : '暂无历史记录'}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => switchConversation(conv.id)}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                                    currentConversationId === conv.id
                                        ? 'bg-gray-300'
                                        : 'hover:bg-gray-200'
                                }`}
                            >
                                <div className="pr-8">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium truncate">{conv.title}</h4>
                                        {conv.starred && <Star size={14} className="text-yellow-500" />}
                                        {conv.pinned && <Pin size={14} className="text-blue-500" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{conv.timestamp}</p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-400 rounded-full transition-all duration-200"
                                >
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full p-4 border-t border-gray-300 bg-white">
                <button
                    onClick={() => setSearchQuery('')}
                    className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
                >
                    清除搜索
                </button>
            </div>
        </>
    );

    return (
        <div
            className={`
                ${type === 'tools' ? 'w-20' : 'w-80'} 
                h-full bg-gradient-to-b from-gray-800 to-gray-900
                flex flex-col items-center 
                ${type === 'history' ? 'fixed right-0 top-0 shadow-xl' : ''}
            `}
        >
            {type === 'tools' ? renderToolsSidebar() : renderHistorySidebar()}
        </div>
    );
};

export default Sidebar;