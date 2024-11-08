import React, {useRef, useState} from 'react';
import { Trash2, Upload, Wand2 } from 'lucide-react';
import { useVoiceStore } from '../tool/VoiceStore';

const VoiceUpload = () => {
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const {
    voiceSamples,
    selectedSample,
    addVoiceSample,
    removeVoiceSample,
    updateVoiceSample,
    setSelectedSample,
    setPlaying,
  } = useVoiceStore();

  // 处理重命名开始
  const handleRenameStart = (e, sample) => {
    e.stopPropagation();
    setEditingId(sample.id);
    setEditingName(sample.name.split('.')[0]); // 只编辑文件名，不包含扩展名
  };

  // 处理重命名
  const handleRenameConfirm = (sample) => {
    if (editingName.trim()) {
      const extension = sample.name.split('.').pop();
      const newName = `${editingName.trim()}.${extension}`;
      updateVoiceSample(sample.id, { name: newName });

      // 更新 selectedSample 以确保右侧显示最新名称
      if (selectedSample?.id === sample.id) {
        setSelectedSample({ ...sample, name: newName });
      }
    }
    setEditingId(null);
    setEditingName('');
  };

  // 处理重命名取消
  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  // 处理重命名输入框按键事件
  const handleRenameKeyDown = (e, sample) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameConfirm(sample);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    const url = URL.createObjectURL(file);

    const newSample = {
      id: Date.now().toString(),
      name: file.name,
      duration: '计算中...',
      date: new Date().toLocaleString(),
      file,
      url,
      isPlaying: false,
    };

    // 获取音频时长
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      updateVoiceSample(newSample.id, { duration });
    });

    addVoiceSample(newSample);
  };
  const handleTranscribe = async (sample) => {
    // 实现语音识别逻辑
    try {
      // 这里添加实际的语音识别API调用
      const transcription = '语音识别结果示例';
      updateVoiceSample(sample.id, { transcription });
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

   // 文件名截断函数
  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;

    const extension = name.split('.').pop();
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);

    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="flex h-full bg-white">
      {/* 左侧上传和文件列表 */}
      <div className="w-72 border-r p-4 flex flex-col">
        <div className="mb-4">
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
          />
          <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <Upload className="mr-2" size={20}/>
            上传音频
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {voiceSamples.map((sample) => (
              <div
                  key={sample.id}
                  className={`flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer mb-2 ${
                      selectedSample?.id === sample.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSample(sample)}
              >
                <div className="flex-1 min-w-0">
                  {editingId === sample.id ? (
                      <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleRenameConfirm(sample)}
                          onKeyDown={(e) => handleRenameKeyDown(e, sample)}
                          className="w-full px-2 py-1 text-sm border rounded"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                      />
                  ) : (
                      <div className="flex-1 min-w-0">
                        <div
                            className="font-medium truncate cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={(e) => handleRenameStart(e, sample)}
                        >
                          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                          {truncateFileName(sample.name, 15)}
                        </div>
                        <div className="text-xs text-gray-500 px-2">
                          {sample.duration} · {sample.date}
                        </div>
                      </div>
                  )}
                </div>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVoiceSample(sample.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                >
                  <Trash2 size={16} className="text-gray-400 hover:text-red-500"/>
                </button>
              </div>
          ))}
        </div>
      </div>

      {/* 右侧播放和识别区域 */}
      <div className="flex-1 p-8">
        {selectedSample ? (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 truncate" title={selectedSample.name}>
                  {truncateFileName(selectedSample.name)}
                </h2>
                <audio
                    controls
                    className="w-full"
                    src={selectedSample.url}
                    onPlay={() => setPlaying(selectedSample.id, true)}
                    onPause={() => setPlaying(selectedSample.id, false)}
                />
              </div>

              <div className="mb-6">
                <button
                    onClick={() => handleTranscribe(selectedSample)}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 flex items-center"
                >
                  <Wand2 className="mr-2" size={20}/>
                  识别内容
                </button>
              </div>

              {selectedSample.transcription && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">识别结果</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedSample.transcription}
                    </p>
                  </div>
              )}
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              请选择要播放的音频
            </div>
        )}
      </div>
    </div>
  );
};

export default VoiceUpload;