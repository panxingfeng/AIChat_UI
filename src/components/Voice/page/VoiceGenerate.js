import React, { useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import { useVoiceStore } from '../tool/VoiceStore';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">确认删除</h2>
        <p className="text-gray-600 mb-6">您确定要删除此条记录吗？</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

const VoiceGenerate = () => {
  const { voiceSamples } = useVoiceStore();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speed, setSpeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoices, setGeneratedVoices] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, voiceId: null });

  const handleGenerate = async () => {
    if (!text || !selectedVoice) {
      alert('请输入文本并选择音色');
      return;
    }

    setIsGenerating(true);
    try {
      const newVoice = {
        id: Date.now(),
        content: text,
        voiceName: voiceSamples.find(v => v.id === selectedVoice)?.name || '默认音色',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '1:00',
        date: new Date().toLocaleString(),
        isPlaying: false
      };

      setGeneratedVoices(prev => [newVoice, ...prev]);
      setText(''); // Clear text after generation
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayToggle = (id) => {
    setGeneratedVoices(voices =>
      voices.map(voice => ({
        ...voice,
        isPlaying: voice.id === id ? !voice.isPlaying : false
      }))
    );
  };

  const openDeleteModal = (voiceId) => {
    setDeleteModal({ isOpen: true, voiceId });
  };

  const handleDelete = (id) => {
    setGeneratedVoices((voices) => voices.filter((voice) => voice.id !== id));
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar - Generated History */}
      <div className="w-72 border-r p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">生成历史</h2>
        <div className="flex-1 overflow-y-auto">
          {generatedVoices.map((voice) => (
            <div
              key={voice.id}
              className="p-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium truncate text-gray-700">{voice.voiceName}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(voice.url, voice.voiceName)}
                    title="下载"
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    <Download size={16} className="text-gray-500 hover:text-blue-500"/>
                  </button>
                  <button
                    onClick={() => openDeleteModal(voice.id)}
                    title="删除"
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    <Trash2 size={16} className="text-gray-500 hover:text-red-500"/>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-800 mb-1 truncate" title={voice.content}>
                {voice.content}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {voice.duration} · {voice.date}
              </div>
              <audio
                src={voice.url}
                className="w-full h-8"
                controls
                onPlay={() => handlePlayToggle(voice.id)}
                onPause={() => handlePlayToggle(voice.id)}
              />
            </div>
          ))}
          {generatedVoices.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              暂无生成记录
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Text to Voice Generation */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">选择音色</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="border-gray-300 rounded"
              >
                <option value="">默认音色</option>
                {voiceSamples.map(voice => (
                  <option key={voice.id} value={voice.id} title={voice.name}>
                    {voice.name.length > 10 ? voice.name.slice(0, 8) + '...' : voice.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">语速调节</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">{speed}x</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入要转换的文本..."
              className="w-full h-48 p-4 border rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="p-4 bg-gray-50 rounded-b-lg flex items-center justify-between">
              <div className="text-sm text-gray-500">{text.length} 个字符</div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text || !selectedVoice}
                className={`px-6 py-2 rounded-lg ${isGenerating || !text || !selectedVoice
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isGenerating ? '生成中...' : '开始生成'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, voiceId: null })}
        onConfirm={() => handleDelete(deleteModal.voiceId)}
      />
    </div>
  );
};

export default VoiceGenerate;