import React, {useState, useEffect} from 'react';
import { FileText, SplitSquareHorizontal, AlertCircle } from 'lucide-react';
import DocumentService from '../tool/DocumentService';
const RangeInput = ({ value, onChange, min, max, step, label, hint }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">当前值: {value}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-24 px-2 py-1 text-right border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  </div>
);

const PresetButton = ({ isSelected, onClick, children, chunkSize, overlapSize }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-lg border transition-colors w-full
      ${isSelected
        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
  >
    <span className="font-medium mb-1">{children}</span>
    <div className="text-xs text-gray-500">
      <div>切块: {chunkSize}</div>
      <div>重叠: {overlapSize}</div>
    </div>
  </button>
);

const DocumentSelect = ({ documents, selectedFile, onSelect }) => {
  const handleChange = (event) => {
    const selectedId = event.target.value;
    console.log('Selected ID:', selectedId);

    if (selectedId) {
      const selected = documents.find(d => d.id.toString() === selectedId);
      console.log('Selected document:', selected);
      if (selected) {
        onSelect(selected);
      }
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center w-full p-2 pr-8 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500">
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



const DocumentSplit = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [chunkSize, setChunkSize] = useState(500);
  const [overlapSize, setOverlapSize] = useState(200);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResults, setSplitResults] = useState([]);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // 预设配置
  const presets = [
    { name: '小文本', chunkSize: 500, overlapSize: 200 },
    { name: '中等文本', chunkSize: 1000, overlapSize: 400 },
    { name: '大文本', chunkSize: 2000, overlapSize: 600 }
  ];

  useEffect(() => {
    const unsubscribe = DocumentService.subscribe(({ documents }) => {
      setDocuments(documents);
    });
    return () => unsubscribe();
  }, []);

  const handlePresetSelect = (index) => {
    setSelectedPreset(index);
    setChunkSize(presets[index].chunkSize);
    setOverlapSize(presets[index].overlapSize);
  };

  const handleChunkSizeChange = (value) => {
    setChunkSize(value);
    setSelectedPreset(null); // 清除预设选择
  };

  const handleOverlapSizeChange = (value) => {
    setOverlapSize(value);
    setSelectedPreset(null); // 清除预设选择
  };

  const handleProcessDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('请选择要处理的文档');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await DocumentService.processDocument(
        selectedFile.id,
        Number(chunkSize),
        Number(overlapSize)
      );
      setSplitResults(result.chunks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFile = (file) => {
    console.log('Selecting file:', file);
    setSelectedFile(file);
    setSplitResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center text-gray-800">
            <SplitSquareHorizontal className="mr-2" size={20} />
            文档智能切分
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            将文档分割成适合处理的小块，以提高分析效率
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-medium mb-4">参数设置</h3>
              <form onSubmit={handleProcessDocument} className="space-y-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择要处理的文档
                  </label>
                  <DocumentSelect
                      documents={documents}
                      selectedFile={selectedFile}
                      onSelect={handleSelectFile}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    快速预设
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset, index) => (
                        <PresetButton
                            key={index}
                            isSelected={selectedPreset === index}
                            onClick={() => handlePresetSelect(index)}
                            chunkSize={preset.chunkSize}
                            overlapSize={preset.overlapSize}
                        >
                          {preset.name}
                        </PresetButton>
                    ))}
                  </div>
                </div>

                <RangeInput
                    label="切块大小"
                    value={chunkSize}
                    onChange={handleChunkSizeChange}
                    min={500}
                    max={2000}
                    step={100}
                    hint="调整文本块的大小，较大的值适合处理长文本"
                />

                <RangeInput
                    label="重叠大小"
                    value={overlapSize}
                    onChange={handleOverlapSizeChange}
                    min={200}
                    max={600}
                    step={100}
                    hint="调整相邻块之间的重叠字符数，较大的值有助于保持上下文连贯性"
                />

                {error && (
                    <div className="p-3 bg-red-50 rounded-lg flex items-center text-red-800">
                      <AlertCircle className="flex-shrink-0 mr-2" size={16}/>
                      <span className="text-sm">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className={`
                    w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2
                    ${selectedFile && !isProcessing
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                    transition-colors duration-200
                  `}
                    disabled={!selectedFile || isProcessing}
                >
                  {isProcessing ? (
                      <>
                        <div
                            className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                        <span>处理中...</span>
                      </>
                  ) : (
                      <>
                        <SplitSquareHorizontal size={18}/>
                        <span>开始处理</span>
                      </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-medium mb-4">切分结果</h3>
              {!selectedFile ? (
                  <div className="text-center py-12 text-gray-500">
                    <SplitSquareHorizontal className="mx-auto mb-4 text-gray-400" size={32}/>
                    <p>请先选择要处理的文档</p>
                  </div>
              ) : splitResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <SplitSquareHorizontal className="mx-auto mb-4 text-gray-400" size={32}/>
                    <p>点击"开始处理"按钮进行文档切分</p>
                  </div>
              ) : (
                  <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {splitResults.map((chunk, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm text-gray-700">
                          块 {index + 1}
                        </span>
                            <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            {chunk.content.length} 个字符
                          </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {chunk.content}
                          </p>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSplit;