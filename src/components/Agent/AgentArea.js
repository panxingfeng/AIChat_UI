import React, { useState, Suspense, lazy } from 'react';
import {
  Settings, Play, Pause, Loader,Bot,
} from 'lucide-react';
import { agentConfigs } from "./agentConfig";

const agentComponents = {
  CrawlerAgent: lazy(() => import('./page/CrawlerAgent'))
};

const StatCard = ({ label, value }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const AgentCard = ({ agent, isActive, onToggle, onOpen }) => (
  <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            <h3 className="font-medium">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.description}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-sm ${
          isActive
            ? 'bg-green-50 text-green-600'
            : 'bg-gray-50 text-gray-600'
        }`}>
          {isActive ? '运行中' : '已停止'}
        </div>
      </div>
    </div>

    <div className="p-4">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(agent.stats).map(([key, value]) => (
          <StatCard key={key} label={key} value={value} />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => onOpen(agent)}
        >
          打开界面
        </button>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => onToggle(agent.id)}
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AgentArea = ({ agentCategory }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentStates, setAgentStates] = useState(
    agentConfigs.reduce((acc, agent) => ({
      ...acc,
      [agent.id]: agent.isActive
    }), {})
  );

  const toggleAgentState = (agentId) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const renderAgentComponent = (agent) => {
    if (!agent.component || !agentComponents[agent.component]) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">未找到对应的组件</p>
        </div>
      );
    }

    const Component = agentComponents[agent.component];
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Loader className="animate-spin" size={24} />
        </div>
      }>
        <Component />
      </Suspense>
    );
  };

  // 根据选中的分类过滤智能体
  const filteredAgents = agentCategory === 'all'
    ? agentConfigs
    : agentConfigs.filter(agent => agent.category === agentCategory);


  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6">
        {selectedAgent ? (
          <div className="bg-white rounded-lg shadow max-w-[1200px] mx-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedAgent.icon}</span>
                <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedAgent(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {renderAgentComponent(selectedAgent)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start content-start">
            {filteredAgents.map(agent => (
              <div key={agent.id} className="w-full">
                <AgentCard
                  agent={agent}
                  isActive={agentStates[agent.id]}
                  onToggle={toggleAgentState}
                  onOpen={setSelectedAgent}
                />
              </div>
            ))}
            {filteredAgents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <Bot size={48} className="mb-4 opacity-50" />
                <p>该分类下暂无智能体</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentArea;