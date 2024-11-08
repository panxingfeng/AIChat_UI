import React, {useState, useRef, useEffect} from 'react';
import { Search, Plus, FileText, AlertCircle, Trash2, Loader,X } from 'lucide-react';
import DocumentService from "../tool/DocumentService";

const DocumentPreview = ({ document }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocumentContent = async () => {
      if (!document?.id) return;

      setLoading(true);
      setError('');

      try {
        const response = await DocumentService.getDocumentPreview(document.id);
        setContent(response.content);
      } catch (err) {
        console.error('预览错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentContent();
  }, [document?.id]);

  if (!document) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
          选择文档以预览内容
        </div>
    );
  }

  return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{document.name}</h1>
          <div className="text-sm text-gray-500">
            上传时间：{document.date} · 大小：{document.size}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center space-x-2 py-8">
              <Loader className="animate-spin" size={20} />
              <span className="text-gray-500">加载预览中...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              {error}
            </div>
          ) : content ? (
            <div className="prose max-w-none whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              该文档暂无预览内容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileUploadHandler = ({ isUploading, onUpload }) => {
  const fileInputRef = useRef(null);

  return (
    <>
      <button
        className={`ml-auto p-1.5 rounded-full transition-colors ${
          isUploading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          !isUploading && fileInputRef.current?.click();
        }}
        disabled={isUploading}
      >
        {isUploading ? <Loader className="animate-spin" size={20}/> : <Plus size={20}/>}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onUpload}
        accept=".pdf,.docx,.doc,.txt,.md"
      />
    </>
  );
};

const DocumentUploadError = ({ error, onDismiss }) => {
  if (!error) return null;
  return (
    <div className="fixed top-4 right-4 max-w-sm bg-red-50 text-red-500 rounded-lg p-4 shadow-lg flex items-start">
      <AlertCircle size={18} className="mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-medium mb-1">上传失败</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
      <button onClick={onDismiss} className="ml-3 text-gray-400 hover:text-gray-500">×</button>
    </div>
  );
};

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, fileName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">确认删除</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          确定要删除文档 <span className="font-medium">"{fileName}"</span> 吗？
          <br />此操作无法撤销。
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            取消
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            删除
          </button>
        </div>
      </div>
    </div>
  );
};


const DocumentList = ({
  documents,
  selectedFile,
  isUploading,
  searchTerm,
  setSearchTerm,
  onUpload
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const filteredDocuments = documents.filter(doc =>
    doc?.name?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleDeleteClick = (doc, event) => {
    event.preventDefault();
    event.stopPropagation();
    setDocumentToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      DocumentService.deleteDocument(documentToDelete.id);
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };

  return (
      <div className="w-80 border-r bg-gray-50 flex flex-col h-screen">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold">文档管理</h2>
            <FileUploadHandler
                isUploading={isUploading}
                onUpload={onUpload}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            <input
                type="text"
                placeholder="搜索文档..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocuments.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                {searchTerm ? '未找到匹配的文档' : '点击 "+" 添加文档'}
              </div>
          ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                    <div
                        key={doc.id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedFile?.id === doc.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                        onClick={() => DocumentService.setSelectedFile(doc)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className={`mr-3 ${
                            selectedFile?.id === doc.id ? 'text-blue-500' : 'text-gray-400'
                        }`} size={20}/>
                        <div className="truncate">
                          <div className="font-medium truncate">{doc.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {doc.size} · {doc.date}
                          </div>
                        </div>
                      </div>
                      <button
                          onClick={(e) => handleDeleteClick(doc, e)}
                          className="ml-2 p-1.5 rounded-full hover:bg-gray-100 group"
                          title="删除文档"
                      >
                        <Trash2 size={18} className="text-gray-400 group-hover:text-red-500"/>
                      </button>
                    </div>
                ))}
              </div>
          )}
        </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          支持上传文件格式：.pdf, .docx, .doc, .txt, .md
        </div>

        <DeleteConfirmDialog
            isOpen={deleteConfirmOpen}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setDocumentToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            fileName={documentToDelete?.name}
        />
      </div>
  );
};

const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    documents: [],
    selectedFile: null
  });

  useEffect(() => {
    const unsubscribe = DocumentService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      await DocumentService.uploadDocument(file);
    } catch (err) {
      console.error('上传错误:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
      // 清理文件输入
      event.target.value = '';
    }
  };

  return (
    <div className="flex h-full bg-white">
      <DocumentList
        documents={state.documents}
        selectedFile={state.selectedFile}
        isUploading={isUploading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onUpload={handleFileUpload}
      />
      <DocumentPreview document={state.selectedFile} />
      <DocumentUploadError
        error={error}
        onDismiss={() => setError('')}
      />
    </div>
  );
};

export default DocumentManagement;