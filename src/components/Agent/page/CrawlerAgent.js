import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Loader,
  AlertCircle,
  Type,
  Image,
  Link,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {API_CONFIG} from "../../../constants";

// API请求函数
const api = {
  async startCrawler(url, rules) {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.agent.startCrawler}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, rules })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '启动爬虫失败');
    }

    return response.json();
  },

  async stopCrawler(taskId) {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.agent.stopCrawler}${taskId}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('停止爬虫失败');
    }

    return response.json();
  },

  async getCrawlerStatus(taskId) {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.agent.getCrawlerStatus}${taskId}`);

    if (!response.ok) {
      throw new Error('获取状态失败');
    }

    return response.json();
  },

  async checkUrl(url) {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.agent.checkUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.accessible;
  }
};

const CrawlerAgent = () => {
  // 基础状态
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [taskId, setTaskId] = useState(null);
  const [urlValid, setUrlValid] = useState(true);
  const [selectedElements, setSelectedElements] = useState({
    text: true,
    images: false,
    links: false
  });
  const [crawledContent, setCrawledContent] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [activeContentIndex, setActiveContentIndex] = useState(null);

  // 爬取规则状态
  const [rules, setRules] = useState({
    maxDepth: 2,
    delay: 1000,
    timeout: 5000,
    maxPages: 100,
    followRedirects: true,
    respectRobotsTxt: true
  });

  // 状态监控
  const [stats, setStats] = useState({
    crawled: 0,
    success: 0,
    failed: 0,
    links: 0,
    avgTime: 0,
    memory: 0,
    runningTime: 0
  });

  // 状态轮询
useEffect(() => {
    let timer;
    if (taskId && isProcessing) {
      timer = setInterval(async () => {
        try {
          const data = await api.getCrawlerStatus(taskId);

          if (data.status === 'completed' || data.status === 'error') {
            setIsProcessing(false);
            clearInterval(timer);
          }

          // 更新统计信息
          setStats({/*...*/});

          // 更新爬取内容
          if (data.contents) {
            setCrawledContent(data.contents);
          }

          if (data.errors?.length > 0) {
            setErrors(data.errors);
          }
        } catch (error) {
          /*...*/
        }
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [taskId, isProcessing]);

  // URL验证
  const validateUrl = async (inputUrl) => {
    if (!inputUrl) return false;
    try {
      new URL(inputUrl); // 基本URL格式验证
      const isAccessible = await api.checkUrl(inputUrl);
      setUrlValid(isAccessible);
      return isAccessible;
    } catch {
      setUrlValid(false);
      return false;
    }
  };

  // 处理爬取
  const handleCrawl = async () => {
    if (!url.trim() || !urlValid) return;

    try {
      setIsProcessing(true);
      setErrors([]);

      const data = await api.startCrawler(url, rules);
      setTaskId(data.taskId);

    } catch (error) {
      setErrors(prev => [...prev, {
        url: url,
        message: error.message,
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }
  };

  // 停止爬取
  const handleStop = async () => {
    if (!taskId) return;

    try {
      await api.stopCrawler(taskId);
      setIsProcessing(false);
    } catch (error) {
      setErrors(prev => [...prev, {
        url: 'system',
        message: error.message,
        timestamp: new Date()
      }]);
    }
  };

    const renderCrawlerConfig = () => (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="text-sm font-medium mb-2">爬取内容选择</div>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedElements.text}
            onChange={(e) => setSelectedElements(prev => ({
              ...prev,
              text: e.target.checked
            }))}
          />
          <Type size={16} />
          <span>文本内容</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedElements.images}
            onChange={(e) => setSelectedElements(prev => ({
              ...prev,
              images: e.target.checked
            }))}
          />
          <Image size={16} />
          <span>图片</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedElements.links}
            onChange={(e) => setSelectedElements(prev => ({
              ...prev,
              links: e.target.checked
            }))}
          />
          <Link size={16} />
          <span>链接</span>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* 原有的配置选项 */}
      </div>
    </div>
  );

  // 渲染爬取结果
  const renderCrawledContent = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">爬取结果</h3>
        <button
          className="text-sm text-blue-500 hover:text-blue-600"
          onClick={() => setShowContent(!showContent)}
        >
          {showContent ? '收起' : '展开'}
        </button>
      </div>

      {showContent && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {crawledContent.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm">
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setActiveContentIndex(activeContentIndex === index ? null : index)}
              >
                <div className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span className="font-medium">{item.title || '未命名页面'}</span>
                </div>
                {activeContentIndex === index ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>

              {activeContentIndex === index && (
                <div className="px-4 pb-4 border-t">
                  <div className="text-sm text-gray-500 mb-2">
                    来源：<a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">{item.url}</a>
                  </div>

                  {selectedElements.text && item.content && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">文本内容：</div>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">{item.content}</div>
                    </div>
                  )}

                  {selectedElements.images && item.images && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">图片：</div>
                      <div className="grid grid-cols-4 gap-2">
                        {item.images.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img.url}
                            alt={img.alt || ''}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedElements.links && item.links && (
                    <div>
                      <div className="text-sm font-medium mb-1">链接：</div>
                      <div className="space-y-1">
                        {item.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-500 hover:text-blue-600"
                          >
                            {link.text || link.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showContent && crawledContent.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无爬取结果
        </div>
      )}
    </div>
  );

return (
    <div className="p-6">
      <div className="space-y-4">
        {/* URL输入区 - 保持不变 */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="url"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                ${!urlValid && url ? 'border-red-500' : ''}`}
              placeholder="输入要爬取的网页地址..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={(e) => validateUrl(e.target.value)}
            />
          </div>
          <button
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
              isProcessing 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={isProcessing ? handleStop : handleCrawl}
            disabled={!url.trim() || !urlValid}
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>停止爬取</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>开始爬取</span>
              </>
            )}
          </button>
        </div>

        {/* 内容选择器 - 新增 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">爬取内容选择</h3>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={selectedElements.text}
                  onChange={(e) => setSelectedElements(prev => ({
                    ...prev,
                    text: e.target.checked
                  }))}
                />
                <Type size={16} />
                <span className="text-sm">文本</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={selectedElements.images}
                  onChange={(e) => setSelectedElements(prev => ({
                    ...prev,
                    images: e.target.checked
                  }))}
                />
                <Image size={16} />
                <span className="text-sm">图片</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={selectedElements.links}
                  onChange={(e) => setSelectedElements(prev => ({
                    ...prev,
                    links: e.target.checked
                  }))}
                />
                <Link size={16} />
                <span className="text-sm">链接</span>
              </label>
            </div>
          </div>
        </div>

        {/* 爬取结果展示 - 新增 */}
        {crawledContent.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">爬取结果</h3>
                <button
                  className="text-sm text-blue-500 hover:text-blue-600"
                  onClick={() => setShowContent(!showContent)}
                >
                  {showContent ? '收起' : '展开'}
                </button>
              </div>
            </div>
            {showContent && (
              <div className="p-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {crawledContent.map((item, index) => (
                    <div key={index} className="border rounded-lg">
                      <div
                        className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer"
                        onClick={() => setActiveContentIndex(activeContentIndex === index ? null : index)}
                      >
                        <span className="font-medium">{item.title || `页面 ${index + 1}`}</span>
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${
                            activeContentIndex === index ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {activeContentIndex === index && (
                        <div className="p-3 space-y-3">
                          <div className="text-sm">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600"
                            >
                              {item.url}
                            </a>
                          </div>
                          {selectedElements.text && item.content && (
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {item.content}
                            </div>
                          )}
                          {selectedElements.images && item.images?.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {item.images.map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img.url}
                                  alt={img.alt || ''}
                                  className="w-full h-24 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                          {selectedElements.links && item.links?.length > 0 && (
                            <div className="space-y-1">
                              {item.links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm text-blue-500 hover:text-blue-600"
                                >
                                  {link.text || link.url}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 错误信息 */}
        {errors.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>错误信息</span>
              </h3>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setErrors([])}
              >
                清空
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="text-sm bg-red-50 text-red-700 p-2 rounded">
                  <div className="font-medium">{error.url}</div>
                  <div className="text-red-600">{error.message}</div>
                  <div className="text-xs text-red-500">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlerAgent;