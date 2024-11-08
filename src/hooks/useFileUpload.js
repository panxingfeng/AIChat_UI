import { useState, useCallback } from 'react';
import { UPLOAD_CONFIG } from '../constants';

export const useFileUpload = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  // 验证文件
  const validateFile = useCallback((file, isImage = false) => {
    const errors = [];
    const { maxImageSize, maxFileSize, allowedImageTypes, allowedFileTypes } = UPLOAD_CONFIG;
    const maxSize = isImage ? maxImageSize : maxFileSize;
    const allowedTypes = isImage ? allowedImageTypes : allowedFileTypes;

    // 检查文件大小
    if (file.size > maxSize) {
      errors.push({
        file: file.name,
        error: `文件大小超过限制 ${(maxSize / 1024 / 1024).toFixed(1)}MB`
      });
    }

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        file: file.name,
        error: `不支持的文件类型 ${file.type}`
      });
    }

    return errors;
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validImages = [];
    const { maxImageCount } = UPLOAD_CONFIG;

    // 检查总数限制
    if (uploadedImages.length + files.length > maxImageCount) {
      newErrors.push({
        error: `最多只能上传${maxImageCount}张图片`
      });
      setErrors(newErrors);
      return;
    }

    // 处理每个文件
    files.forEach(file => {
      // 验证文件
      const fileErrors = validateFile(file, true);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        // 创建预览URL并添加到有效图片列表
        validImages.push({
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toISOString()
        });
      }
    });

    // 更新状态
    if (validImages.length > 0) {
      setUploadedImages(prev => [...prev, ...validImages]);
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    // 清除input的value，允许重复选择同一文件
    e.target.value = '';
  }, [uploadedImages, validateFile]);

  // 处理文件上传
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];
    const { maxFileCount } = UPLOAD_CONFIG;

    // 检查总数限制
    if (uploadedFiles.length + files.length > maxFileCount) {
      newErrors.push({
        error: `最多只能上传${maxFileCount}个文件`
      });
      setErrors(newErrors);
      return;
    }

    // 处理每个文件
    files.forEach(file => {
      // 验证文件
      const fileErrors = validateFile(file, false);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        // 添加到有效文件列表
        validFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toISOString()
        });
      }
    });

    // 更新状态
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    // 清除input的value
    e.target.value = '';
  }, [uploadedFiles, validateFile]);

  // 删除图片
  const handleDeleteImage = useCallback((index) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      // 释放预览URL占用的内存
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // 删除文件
  const handleDeleteFile = useCallback((index) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  // 清除所有错误
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 清除所有上传内容
  const clearAll = useCallback(() => {
    // 释放所有预览URL
    uploadedImages.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setUploadedImages([]);
    setUploadedFiles([]);
    setErrors([]);
  }, [uploadedImages]);

  // 计算上传统计信息
  const stats = {
    totalImages: uploadedImages.length,
    totalFiles: uploadedFiles.length,
    totalSize: [...uploadedImages, ...uploadedFiles]
      .reduce((acc, curr) => acc + curr.size, 0),
    remainingImageSlots: UPLOAD_CONFIG.maxImageCount - uploadedImages.length,
    remainingFileSlots: UPLOAD_CONFIG.maxFileCount - uploadedFiles.length
  };

  return {
    // 状态
    uploadedImages,
    uploadedFiles,
    errors,
    stats,

    // 处理方法
    handleImageUpload,
    handleFileUpload,
    handleDeleteImage,
    handleDeleteFile,
    clearErrors,
    clearAll,
  };
};