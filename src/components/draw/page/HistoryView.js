import React from 'react';

const HistoryView = ({ creationRecords, handleImageClick }) => {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {creationRecords.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">暂无创作记录</p>
            </div>
          ) : (
            creationRecords.map((record) => (
              <div key={record.id} className="break-inside-avoid mb-4">
                <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                  {record.isLoading ? (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                        <p className="mt-4 text-sm text-gray-600">生成中...</p>
                      </div>
                    </div>
                  ) : record.error ? (
                    <div className="w-full h-48 bg-red-50 flex items-center justify-center p-4">
                      <p className="text-red-500 text-center">{record.error}</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={record.imageUrl}
                        alt={record.inputText}
                        className="w-full h-auto cursor-pointer"
                        onClick={() => handleImageClick(record)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm truncate">{record.inputText}</p>
                        <p className="text-white/80 text-xs mt-1">{record.timestamp}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;