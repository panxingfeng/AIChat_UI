import { useState } from 'react';
import { API_CONFIG } from '../constants';

export const useDrawing = () => {
  const [drawingMode, setDrawingMode] = useState('gallery');
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('推荐');
  const [selectedImageStyle, setSelectedImageStyle] = useState('');
  const [creationRecords, setCreationRecords] = useState([]);
  const [showCreationRecord, setShowCreationRecord] = useState(false);
  const [showImageDetail, setShowImageDetail] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [isLoadingOptimization, setIsLoadingOptimization] = useState(false);

  // 处理图片生成
  const handleSendContent = async () => {
    setIsLoadingOptimization(true);
    let contentText = imagePrompt;

    // 创建新的创作记录
    const newRecord = {
      id: Date.now(),
      modelStyle: selectedImageStyle,
      inputText: contentText,
      timestamp: new Date().toLocaleString(),
      isLoading: true
    };

    // 添加新记录到创作记录列表
    setCreationRecords(prev => [newRecord, ...prev]);
    setShowCreationRecord(true);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.generateImage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: contentText,
          modelStyle: selectedImageStyle
        }),
      });

      const data = await response.json();

      // 更新创作记录
      setCreationRecords(prev => prev.map(record =>
        record.id === newRecord.id
          ? {
              ...record,
              imageUrl: data.imageUrl,
              isLoading: false
            }
          : record
      ));

    } catch (error) {
      console.error('生成图像请求失败', error);
      setCreationRecords(prev => prev.map(record =>
        record.id === newRecord.id
          ? {
              ...record,
              error: '生成图像失败，请稍后重试。',
              isLoading: false
            }
          : record
      ));
    } finally {
      setIsLoadingOptimization(false);
    }
  };

  // 处理图片详情
  const handleCloseImageDetail = () => {
    setShowImageDetail(false);
    setSelectedImageData(null);
  };

  return {
    drawingMode,
    imagePrompt,
    selectedCategory,
    selectedImageStyle,
    creationRecords,
    showCreationRecord,
    showImageDetail,
    selectedImageData,
    isLoadingOptimization,
    handleSendContent,
    setDrawingMode,
    setImagePrompt,
    setSelectedCategory,
    setSelectedImageStyle,
    setShowCreationRecord,
    handleCloseImageDetail,
    setSelectedImageData
  };
};