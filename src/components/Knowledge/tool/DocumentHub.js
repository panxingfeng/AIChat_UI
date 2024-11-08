// DocumentHub.jsx
import React, { useState, useEffect } from 'react';
import { FileText, SplitSquareHorizontal } from 'lucide-react';
import DocumentManagement from '../page/DocumentManagement';
import DocumentSplit from '../page/DocumentSplit';
import DocumentService from './DocumentService';

const DocumentHub = () => {
  const [activeTab, setActiveTab] = useState('management');
  const [state, setState] = useState({
    documents: DocumentService.getAllDocuments(),
    selectedFile: DocumentService.getSelectedDocument()
  });

  useEffect(() => {
    // 订阅 DocumentService 状态变化
    const unsubscribe = DocumentService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 切换标签页时确保状态同步
    setState({
      documents: DocumentService.getAllDocuments(),
      selectedFile: DocumentService.getSelectedDocument()
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabChange('management')}
              className={`px-4 py-2 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} />
              <span>文档管理</span>
            </button>
            <button
              onClick={() => handleTabChange('split')}
              className={`px-4 py-2 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'split'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <SplitSquareHorizontal size={16} />
              <span>文档切分</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'management' && (
          <DocumentManagement />
        )}
        {activeTab === 'split' && (
          <DocumentSplit documents={state.documents} />
        )}
      </div>
    </div>
  );
};

export default DocumentHub;