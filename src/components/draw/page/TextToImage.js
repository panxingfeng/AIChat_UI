import React from 'react';
import {IMAGE_STYLES, BASE_SIZES, MULTIPLIERS, API_CONFIG} from '../../../constants';
import { Wand2  } from 'lucide-react';

const TextToImage = ({
  imagePrompt,
  selectedCategory,
  selectedImageStyle,
  setImagePrompt,
  setSelectedCategory,
  setSelectedImageStyle,
  handleGenerate,
  isLoadingOptimization,
  selectedSize = { ratio: '1:1', multiplier: 1 },
  setSelectedSize,
}) => {
  const [isCustomSize, setIsCustomSize] = React.useState(false);
  const [customWidth, setCustomWidth] = React.useState('512');
  const [customHeight, setCustomHeight] = React.useState('512');
  const handleOptimizePrompt = async (currentPrompt) => {
    const promptText = String(currentPrompt || '');

    if (!promptText.trim()) {
      alert('请先输入提示词');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.optimize-prompt}`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!response.ok) throw new Error('优化失败');
      const data = await response.json();

      if (!data.optimizedPrompt) {
        const commonEnhancements = [
          'masterpiece', 'best quality', 'extremely detailed',
          '4k', 'high resolution', 'intricate details',
          'highly detailed', 'clear focus', 'full shot'
        ];
        const numberOfEnhancements = Math.floor(Math.random() * 3) + 3;
        const selectedEnhancements = commonEnhancements
          .sort(() => 0.5 - Math.random())
          .slice(0, numberOfEnhancements);
        return `${promptText}, ${selectedEnhancements.join(', ')}`;
      }
      return data.optimizedPrompt;
    } catch (error) {
      console.error('优化提示词失败:', error);
      const commonEnhancements = [
        'masterpiece', 'best quality', 'extremely detailed',
        '4k', 'high resolution', 'intricate details',
        'highly detailed', 'clear focus', 'full shot'
      ];
      const numberOfEnhancements = Math.floor(Math.random() * 3) + 3;
      const selectedEnhancements = commonEnhancements
        .sort(() => 0.5 - Math.random())
        .slice(0, numberOfEnhancements);
      return `${promptText}, ${selectedEnhancements.join(', ')}`;
    }
  };

  const onOptimizeClick = async () => {
    try {
      const optimizedPrompt = await handleOptimizePrompt(imagePrompt);
      if (optimizedPrompt) setImagePrompt(optimizedPrompt);
    } catch (error) {
      console.error('优化失败:', error);
    }
  };

  const calculateActualSize = (baseSize, multiplier) => ({
    width: baseSize.width * multiplier,  // 基础宽度 × 倍数
    height: baseSize.height * multiplier // 基础高度 × 倍数
  });

// 检查尺寸是否在允许范围内
  const isSizeAllowed = (width, height) => width <= 2048 && height <= 2048;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-6 pt-4">
        <div>
          {/* 绘画描述 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">绘画描述</label>
              <button
                  onClick={onOptimizeClick}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
              >
                <Wand2 size={14}/>
                优化提示词
              </button>
            </div>
            <textarea
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="支持中英文描述，禁止暴力、色情、血腥等敏感词内容~"
            />
          </div>

          {/* 图片尺寸选择 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm text-gray-600">图片尺寸</label>
            </div>

            <div className="flex gap-4">
              {/* 尺寸选择下拉框 */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">尺寸</label>
                <select
                  value={isCustomSize ? 'custom' : selectedSize.ratio}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomSize(true);
                    } else {
                      setIsCustomSize(false);
                      setSelectedSize({
                        ...selectedSize,
                        ratio: e.target.value
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <optgroup label="预设尺寸">
                    {BASE_SIZES.map((size) => {
                      const actualSize = calculateActualSize(size, selectedSize.multiplier);
                      return (
                        <option key={size.label} value={size.label}>
                          {size.label} - {actualSize.width}×{actualSize.height}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="自定义">
                    <option value="custom">自定义尺寸</option>
                  </optgroup>
                </select>
              </div>

              {/* 倍数选择或自定义尺寸输入 */}
              <div className="w-64">
                {isCustomSize ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">自定义尺寸</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          min="256"
                          max="2048"
                          step="64"
                          className="w-full pl-2 pr-8 py-2 border rounded-lg text-sm"
                          placeholder="宽度"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">px</span>
                      </div>
                      <span className="text-gray-400">×</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          min="256"
                          max="2048"
                          step="64"
                          className="w-full pl-2 pr-8 py-2 border rounded-lg text-sm"
                          placeholder="高度"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">px</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      最大支持2048×2048
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">倍数</label>
                    <select
                      value={selectedSize.multiplier}
                      onChange={(e) => setSelectedSize({
                        ...selectedSize,
                        multiplier: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {MULTIPLIERS.map((mult) => {
                        const baseSize = BASE_SIZES.find(s => s.label === selectedSize.ratio);
                        const actualSize = calculateActualSize(baseSize, mult.value);
                        const isAllowed = isSizeAllowed(actualSize.width, actualSize.height);

                        return (
                          <option
                            key={mult.value}
                            value={mult.value}
                            disabled={!isAllowed}
                          >
                            {mult.label} - {actualSize.width}×{actualSize.height}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 当前尺寸显示 */}
            <div className="mt-2 text-xs text-gray-500">
              当前尺寸：
              {isCustomSize
                ? `${customWidth}×${customHeight}`
                : (() => {
                    const baseSize = BASE_SIZES.find(s => s.label === selectedSize.ratio);
                    const actualSize = calculateActualSize(baseSize, selectedSize.multiplier);
                    return `${actualSize.width}×${actualSize.height}`;
                  })()
              }
            </div>
          </div>

          {/* LORA风格选择 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">LORA风格选择</label>
            <div className="mb-4 flex flex-wrap gap-2">
              {['推荐', ...new Set(IMAGE_STYLES.map(style => style.type))].map((type) => (
                  <button
                      key={type}
                      onClick={() => setSelectedCategory(type)}
                      className={`px-4 py-1.5 rounded-full text-sm ${
                          selectedCategory === type
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {type}
                  </button>
              ))}
            </div>

            {/* 风格图片选择网格 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {IMAGE_STYLES
                  .filter(style => selectedCategory === '推荐' || style.type === selectedCategory)
                  .map((style, index) => (
                      <button
                          key={index}
                          onClick={() => setSelectedImageStyle(style.name)}
                          className={`relative w-full h-24 rounded-lg overflow-hidden shadow-md cursor-pointer ${
                              selectedImageStyle === style.name ? 'border-4 border-blue-600' : ''
                          }`}
                      >
                        <img
                            src={style.imageUrl}
                            alt={style.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 w-full bg-black/30 text-white text-xs text-center py-1">
                          {style.name}
                        </div>
                      </button>
                  ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
              className="w-full mt-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={isLoadingOptimization || !imagePrompt?.trim()}
          >
            {isLoadingOptimization ? '生成中...' : '生成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToImage;