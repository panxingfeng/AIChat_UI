import React from 'react';
import DocumentManagement from './page/DocumentManagement';
import DocumentSplit from './page/DocumentSplit';
import { ALLOW_TYPE, API_CONFIG } from '../../constants';
import { formatFileSize } from './tool/FileUtilities';
import QuestionRetrieval from "./page/QuestionRetrieval";

const KnowledgeArea = ({ documentMode, setDocumentMode }) => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [documents, setDocuments] = React.useState([]);
  const [error, setError] = React.useState('');
  const [, setShowResults] = React.useState(false);
  const [, setProcessingResults] = React.useState([]);
  const [chunkSize, setChunkSize] = React.useState('500');
  const [overlapSize, setOverlapSize] = React.useState('0');
  const [, setIsProcessing] = React.useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = ALLOW_TYPE[file.type];
    if (!fileType) {
      setError('不支持的文件类型');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.upload}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '文件上传失败');
      }

      const result = await response.json();

      if (!result.data.fileId) {
        throw new Error('文件上传失败，缺少 fileId');
      }

      const newDocument = {
        id: Date.now(),
        name: file.name,
        size: formatFileSize(file.size),
        date: new Date().toISOString().split('T')[0],
        type: fileType.type,
        icon: fileType.icon,
        content: result.data.content,
        fileId: result.data.fileId,
      };

      setDocuments((prev) => [...prev, newDocument]);
      setSelectedFile(newDocument);
      setError('');
    } catch (err) {
      console.error('文件处理错误:', err);
      setError(err.message || '文件处理失败');
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleProcessDocument = async () => {
    if (!selectedFile?.fileId) {
      console.warn("No file selected or fileId is missing.");
      return;
    }

    try {
      setError('');
      setIsProcessing(true);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.process}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: selectedFile.fileId,
          chunkSize: parseInt(chunkSize),
          overlapSize: parseInt(overlapSize),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '文档处理失败');
      }

      const result = await response.json();
      if (result.success) {
        setSelectedFile({ ...selectedFile, content: result.data.chunks });
        setProcessingResults(result.data.chunks);
        setShowResults(true);
      } else {
        throw new Error(result.error || '文档处理失败');
      }
    } catch (error) {
      console.error('处理错误:', error);
      setError(error.message || '处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (documentMode) {
      case 'document':
        return (
          <DocumentManagement
            documents={documents}
            selectedFile={selectedFile}
            setDocuments={setDocuments}
            setSelectedFile={setSelectedFile}
            handleFileUpload={handleFileUpload}
            error={error}
            setError={setError}
          />
        );
      case 'document_split':
        return (
          <DocumentSplit
            documents={documents}
            selectedFile={selectedFile}
            chunkSize={chunkSize}
            overlapSize={overlapSize}
            setChunkSize={setChunkSize}
            setOverlapSize={setOverlapSize}
            setSelectedFile={setSelectedFile}
            handleProcessDocument={handleProcessDocument}
          />
        );
      case 'question_retrieval':
        return <QuestionRetrieval/>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex">
      {/* 只保留内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default KnowledgeArea;