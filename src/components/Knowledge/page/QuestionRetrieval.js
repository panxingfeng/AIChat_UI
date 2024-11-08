import React, { useState, useEffect } from 'react';
import { Search, FileText, AlertCircle } from 'lucide-react';
import DocumentService from '../tool/DocumentService';

// 文档选择下拉框组件
const DocumentSelect = ({ documents, selectedFile, onSelect }) => {
  const handleChange = (event) => {
    const selectedId = event.target.value;
    if (selectedId) {
      const selected = documents.find(d => d.id.toString() === selectedId);
      if (selected) {
        onSelect(selected);
      }
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center w-full p-2 pr-8 border rounded-lg bg-white">
        <select
          className="w-full bg-transparent focus:outline-none cursor-pointer"
          value={selectedFile?.id?.toString() || ""}
          onChange={handleChange}
          onClick={e => e.stopPropagation()}
        >
          <option value="">请选择文档...</option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id.toString()}>
              {doc.name}
            </option>
          ))}
        </select>
        <FileText className="flex-shrink-0 text-gray-400" size={18} />
      </div>
    </div>
  );
};

const QuestionRetrieval = () => {
  // 状态管理
  const [documents, setDocuments] = useState([]); // 文档列表
  const [selectedFile, setSelectedFile] = useState(null); // 当前选中的文档
  const [question, setQuestion] = useState(''); // 问题输入
  const [isSearching, setIsSearching] = useState(false); // 检索状态
  const [searchResults, setSearchResults] = useState([]); // 检索结果
  const [answer, setAnswer] = useState(''); // 生成的答案
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false); // 答案生成状态
  const [error, setError] = useState(null); // 错误信息

  // 组件挂载时订阅文档服务
  useEffect(() => {
    const unsubscribe = DocumentService.subscribe(({ documents }) => {
      setDocuments(documents);
    });
    return () => unsubscribe();
  }, []);

  // 处理检索和回答生成
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('请选择要检索的文档');
      return;
    }
    if (!question.trim()) {
      setError('请输入检索问题');
      return;
    }

    setIsSearching(true);
    setError(null);
    setAnswer('');

    try {
      // 1. 先获取检索结果
      const results = await DocumentService.searchDocument(
        selectedFile.id,
        question
      );
      setSearchResults(results || []);

      // 2. 开始生成答案
      if (results && results.length > 0) {
        setIsGeneratingAnswer(true);

        // 调用流式生成答案的API
        const response = await DocumentService.generateStreamAnswer(
          question,
          results,
          (chunk) => {
            // 使用函数式更新保证状态更新的一致性
            setAnswer(prev => prev + chunk);
          }
        );

        if (!response.success) {
          throw new Error(response.error || '生成答案失败');
        }
      }
    } catch (err) {
      setError(err.message);
      setAnswer('');
    } finally {
      setIsSearching(false);
      setIsGeneratingAnswer(false);
    }
  };

  // 处理文档选择
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setSearchResults([]);
    setAnswer('');
    setError(null);
  };

  // 格式化答案的函数
const formatAnswer = (text) => {
  // 将文本按数字序号分割成段落
  const formatNumberedParagraphs = (text) => {
    // 匹配数字开头的段落，支持 1. 和 1：两种格式
    const paragraphs = text.split(/(?=\d+[\.:]\s*)/);

    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      // 匹配段落中的数字和内容
      const match = paragraph.match(/^(\d+)[\.:]\s*(.+)$/s);
      if (!match) return <p key={index} className="mb-2">{paragraph}</p>;

      const [, number, content] = match;

      // 处理内容中的强调语法 (**text** 和 *text*)
      const formattedContent = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={i} className="font-medium text-blue-600">
              {part.slice(2, -2)}
            </span>
          );
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <span key={i} className="text-blue-500">
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      });

      // 返回格式化的段落
      return (
        <div key={index} className="flex gap-2 mb-3">
          <div className="flex-shrink-0 font-medium text-gray-700">
            {number}.
          </div>
          <div className="flex-1">
            {formattedContent}
          </div>
        </div>
      );
    }).filter(Boolean); // 过滤掉空值
  };

  return (
    <div className="space-y-1">
      {formatNumberedParagraphs(text)}
    </div>
  );
};

  return (
    <div className="h-screen bg-gray-50 p-6 flex gap-6">
      {/* 左侧检索设置面板 */}
      <div className="w-[400px] bg-white border rounded-lg">
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择要检索的文档
              </label>
              <DocumentSelect
                documents={documents}
                selectedFile={selectedFile}
                onSelect={handleSelectFile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入问题
              </label>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:outline-none resize-none bg-white"
                  placeholder="请输入您的问题..."
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-lg flex items-center text-red-800">
                <AlertCircle className="flex-shrink-0 mr-2" size={16}/>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`
                w-full h-11 rounded-lg flex items-center justify-center space-x-2 bg-gray-100
                ${selectedFile && question.trim() && !isSearching && !isGeneratingAnswer
                  ? 'hover:bg-gray-200 text-gray-600'
                  : 'text-gray-400 cursor-not-allowed'
                }
                transition-colors duration-200
              `}
              disabled={!selectedFile || !question.trim() || isSearching || isGeneratingAnswer}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-gray-600"></div>
                  <span>检索中...</span>
                </>
              ) : isGeneratingAnswer ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-gray-600"></div>
                  <span>生成答案中...</span>
                </>
              ) : (
                <>
                  <Search size={18}/>
                  <span>开始检索</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* 上部分：检索结果面板 */}
        <div className="flex-1 bg-white border rounded-lg overflow-hidden"> {/* 添加 overflow-hidden */}
          <div className="p-6 h-full flex flex-col"> {/* 添加 h-full 和 flex flex-col */}
            <h3 className="text-base font-medium mb-6 flex-shrink-0">检索结果</h3> {/* 添加 flex-shrink-0 */}

            {/* 内容区域 - 添加固定高度和滚动 */}
            <div className="flex-1 overflow-y-auto min-h-0"> {/* 关键修改 */}
              {!selectedFile ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Search className="mb-4" size={40}/>
                    <p>请先选择要检索的文档</p>
                  </div>
              ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Search className="mb-4" size={40}/>
                    <p>输入问题并点击"开始检索"按钮</p>
                  </div>
              ) : (
                  <div className="space-y-4 pr-2"> {/* 添加 pr-2 为滚动条留出空间 */}
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm text-gray-700">
                            匹配块 {index + 1}
                          </span>
                                      <span className="text-xs text-gray-500">
                            相关度: {(result.score * 100).toFixed(1)}%
                          </span>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {result.content}
                          </p>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* 下部分：答案面板 - 同样添加固定高度和滚动 */}
        <div className="h-72 bg-white border rounded-lg overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-base font-medium mb-4 flex-shrink-0">检索答案</h3>
            <div className="flex-1 overflow-y-auto min-h-0">
              {isGeneratingAnswer ? (
                  <div className="text-sm text-gray-600">
                    {formatAnswer(answer)}
                    <span className="animate-pulse">▋</span>
                  </div>
              ) : answer ? (
                  <div className="text-sm text-gray-600">
                    {formatAnswer(answer)}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p>检索完成后这里将显示答案</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionRetrieval;