import React, {useEffect, useState} from 'react';
import TextToImage from './page/TextToImage';
import GalleryView from './page/GalleryView';
import ImageToImage from './page/ImageToImage';
import HistoryView from './page/HistoryView';
import SimpleImageDetailModal from './detail/SimpleImageDetailModal';

const DrawingArea = ({
  drawingMode = 'text-to-image',
  imagePrompt,
  selectedCategory,
  selectedImageStyle,
  creationRecords,
  handleSendContent,
  setImagePrompt,
  setSelectedCategory,
  setSelectedImageStyle,
  setShowCreationRecord,
  setCreationRecords,
  setDrawingMode,
  handleOptimizePrompt,
  isLoadingOptimization = false
}) => {
  const [showImageDetail, setShowImageDetail] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [selectedType, setSelectedType] = useState('全部');
  const [imageStrength, setImageStrength] = useState(60);
  const [selectedSize, setSelectedSize] = useState({
    ratio: '1:1',
    multiplier: 1
  });

  useEffect(() => {
    if (drawingMode === 'text-to-image' || drawingMode === 'image-to-image') {
      setShowCreationRecord(false);
    }
  }, [drawingMode, setShowCreationRecord]);

  const handleImageClick = (record) => {
    setSelectedImageData(record);
    setShowImageDetail(true);
  };

  const handleCloseImageDetail = () => {
    setShowImageDetail(false);
    setSelectedImageData(null);
  };

  const handleRegenerate = (newImageData) => {
    creationRecords.unshift(newImageData);
    setCreationRecords([...creationRecords]);
  };

  const handleGenerate = async () => {
    await handleSendContent();
    setDrawingMode('history');
  };

  const handleImageToImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('图片上传:', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (drawingMode) {
      case 'gallery':
        return <GalleryView selectedType={selectedType} setSelectedType={setSelectedType} />;
      case 'image-to-image':
        return (
          <ImageToImage
            imageStrength={imageStrength}
            setImageStrength={setImageStrength}
            handleImageToImageUpload={handleImageToImageUpload}
            imagePrompt={imagePrompt}
            selectedCategory={selectedCategory}
            selectedImageStyle={selectedImageStyle}
            setImagePrompt={setImagePrompt}
            setSelectedCategory={setSelectedCategory}
            setSelectedImageStyle={setSelectedImageStyle}
            handleGenerate={handleGenerate}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
          />
        );
      case 'text-to-image':
        return (
          <TextToImage
            imagePrompt={imagePrompt}
            selectedCategory={selectedCategory}
            selectedImageStyle={selectedImageStyle}
            setImagePrompt={setImagePrompt}
            setSelectedCategory={setSelectedCategory}
            setSelectedImageStyle={setSelectedImageStyle}
            handleGenerate={handleGenerate}
            isLoadingOptimization={isLoadingOptimization}
            onOptimizePrompt={handleOptimizePrompt}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
          />
        );
      case 'history':
        return <HistoryView creationRecords={creationRecords} handleImageClick={handleImageClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto">
      {renderContent()}

      <SimpleImageDetailModal
        isOpen={showImageDetail}
        onClose={handleCloseImageDetail}
        imageData={selectedImageData}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
};

export default DrawingArea;