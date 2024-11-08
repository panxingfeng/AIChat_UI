// DocumentService.js
import { API_CONFIG } from "../../../constants";
import { formatFileSize } from "./FileUtilities";

class DocumentService {
  static LOCAL_STORAGE_KEY = 'document_list';
  static documents = [];
  static selectedFile = null;
  static listeners = new Set();

  // 初始化服务
  static initService() {
    try {
      const savedDocs = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedDocs) {
        this.documents = JSON.parse(savedDocs);
      }
    } catch (error) {
      console.error('加载文档列表失败:', error);
    }
  }

    static async processDocument(fileId, chunkSize = 500, overlapSize = 200) {
    if (!fileId) {
      throw new Error('未选择文档');
    }

    try {
      console.log('处理文档:', { fileId, chunkSize, overlapSize });

      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.process}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            fileId: fileId.toString(),
            chunkSize: Number(chunkSize),
            overlapSize: Number(overlapSize)
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('处理响应错误:', errorText);
        throw new Error('处理失败: ' + errorText);
      }

      const result = await response.json();

      // 检查响应格式
      if (!result.success) {
        throw new Error(result.error || '处理失败');
      }

      if (!result.data || !Array.isArray(result.data.chunks)) {
        throw new Error('处理结果格式错误');
      }

      // 返回处理结果
      return {
        success: true,
        chunks: result.data.chunks.map((chunk, index) => ({
          content: chunk.content || '',
          pageNumber: chunk.page_number || 0,
          index: index + 1
        }))
      };

    } catch (error) {
      console.error('处理文档错误:', error);
      throw error;
    }
  }

  // 文档检索方法
  static async searchDocument(documentId, question) {
    if (!documentId) throw new Error('未选择文档');

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.retrieval}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: documentId,
            question: question
          })
        }
      );

      if (!response.ok) {
        throw new Error('检索失败');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '检索失败');
      }

      return result.data || [];

    } catch (error) {
      console.error('检索错误:', error);
      throw error;
    }
  }

  static async generateStreamAnswer(question, searchResults, onChunk) {
    if (!question?.trim()) throw new Error('问题不能为空');
    if (!searchResults?.length) throw new Error('没有检索到相关内容');

    try {
      // 创建 SSE 连接
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.answer}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question,
            context: searchResults
          })
        }
      );

      if (!response.ok) {
        throw new Error('答案生成失败');
      }

      // 获取响应的 reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码响应数据
        const chunk = decoder.decode(value);

        // 处理数据块
        try {
          const lines = chunk
            .split('\n')
            .filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return { success: true };
              }
              // 回调函数处理文本块
              onChunk(data);
            }
          }
        } catch (e) {
          console.error('处理响应数据错误:', e);
        }
      }

      return { success: true };

    } catch (error) {
      console.error('生成答案错误:', error);
      throw error;
    }
  }

  // 保存到本地存储
  static saveToStorage() {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.documents));
    } catch (error) {
      console.error('保存文档列表失败:', error);
    }
  }

  static subscribe(listener) {
    this.listeners.add(listener);
    // 立即通知新订阅者当前状态
    listener({
      documents: this.documents,
      selectedFile: this.selectedFile
    });
    return () => this.listeners.delete(listener);
  }

  static notify() {
    this.listeners.forEach(listener => listener({
      documents: this.documents,
      selectedFile: this.selectedFile
    }));
  }

  static setDocuments(docs) {
    this.documents = docs;
    this.saveToStorage();
    this.notify();
  }

  static setSelectedFile(file) {
    this.selectedFile = file;
    this.notify();
  }

  static async uploadDocument(file) {
    if (!file) throw new Error('未选择文件');

    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt','.md'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      throw new Error(`不支持的文件类型。支持的类型：${allowedTypes.join(', ')}`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('extension', fileExt.substring(1));

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.upload}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('文件上传失败');
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || '上传失败');
      }

      const newDocument = {
        id: result.data.id,
        name: file.name,
        size: formatFileSize(file.size),
        date: new Date().toISOString().split('T')[0],
        extension: fileExt.substring(1),
        path: result.data.path
      };

      this.documents = [...this.documents, newDocument];
      this.selectedFile = newDocument;
      this.saveToStorage();
      this.notify();

      return newDocument;
    } catch (error) {
      console.error('上传错误:', error);
      throw error;
    }
  }

  static async getDocumentPreview(documentId) {
    if (!documentId) {
      throw new Error('文档ID不能为空');
    }

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.document.preview}${documentId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('加载预览失败');
      }

      const result = await response.json();
      if (result.success && result.data?.content) {
        return result.data;
      } else {
        throw new Error(result.error || '无法获取文档内容');
      }
    } catch (error) {
      console.error('预览错误:', error);
      throw error;
    }
  }

  static deleteDocument(docId) {
    this.documents = this.documents.filter(doc => doc.id !== docId);
    if (this.selectedFile?.id === docId) {
      this.selectedFile = null;
    }
    this.saveToStorage();
    this.notify();
  }

  static getAllDocuments() {
    return this.documents;
  }

  static getSelectedDocument() {
    return this.selectedFile;
  }
}



// 初始化服务
DocumentService.initService();

export default DocumentService;