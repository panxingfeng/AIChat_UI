import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ImageDetailModal from './ImageDetailModal';

const PromptSuggestionModal = ({ isOpen, onClose, prompts = [], onSelect, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-md p-4">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-medium mb-4">选择提示词</h3>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500">正在生成提示词...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array.isArray(prompts) && prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSelect(prompt)}
                className="w-full p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SimpleImageDetailModal = ({ isOpen, onClose, imageData, onRegenerate }) => {
  const [, setIsRegenerating] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleShowPrompts = async () => {
    setShowPromptSuggestions(true);
    setIsLoadingPrompts(true);
    try {
      const response = await fetch('http://localhost:5000/api/suggest-prompts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: imageData?.inputText || ''
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.prompts)) {
        setSuggestedPrompts(data.prompts);
      } else {
        setSuggestedPrompts([
          (imageData?.inputText || '') + " (风格变体 1)",
          (imageData?.inputText || '') + " (风格变体 2)",
          (imageData?.inputText || '') + " (风格变体 3)"
        ]);
      }
    } catch (error) {
      console.error('获取提示词建议失败', error);
      setSuggestedPrompts([
        (imageData?.inputText || '') + " (风格变体 1)",
        (imageData?.inputText || '') + " (风格变体 2)",
        (imageData?.inputText || '') + " (风格变体 3)"
      ]);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleRegenerate = async (selectedPrompt) => {
    setIsRegenerating(true);
    setShowPromptSuggestions(false);
    try {
      const response = await fetch('http://localhost:5000/api/generate-image/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: selectedPrompt,
          modelStyle: imageData.modelStyle
        }),
      });

      const data = await response.json();
      const newImageData = {
        ...imageData,
        id: Date.now(),
        imageUrl: data.imageUrl,
        inputText: selectedPrompt,
        timestamp: new Date().toLocaleString()
      };

      if (onRegenerate) {
        await onRegenerate(newImageData);
      }
    } catch (error) {
      console.error('重新生成图像失败', error);
    } finally {
      setIsRegenerating(false);
      onClose();
    }
  };

  if (!isOpen || !imageData) return null;

return (
    <>
      <ImageDetailModal
        isOpen={isOpen}
        onClose={onClose}
        imageData={imageData}
        onShowPrompts={handleShowPrompts}
      />

      <PromptSuggestionModal
        isOpen={showPromptSuggestions}
        onClose={() => setShowPromptSuggestions(false)}
        prompts={suggestedPrompts}
        onSelect={handleRegenerate}
        isLoading={isLoadingPrompts}
      />
    </>
  );
};

export default SimpleImageDetailModal;