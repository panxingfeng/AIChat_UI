import React from 'react';
import { GALLERY_TYPES, GALLERY_IMAGES } from '../../../constants';

const GalleryView = ({ selectedType, setSelectedType }) => {
  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">绘画内容展示区</h2>
        <p className="text-gray-500">精选AI绘画作品</p>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {GALLERY_TYPES.map((type) => (
            <button
              key={type}
              className={`px-4 py-1.5 rounded-full text-sm ${
                selectedType === type 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 w-full">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {(selectedType === '全部' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(img => img.type === selectedType))
            .map((image) => (
            <div
              key={image.id}
              className="break-inside-avoid mb-4 bg-white rounded-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryView;