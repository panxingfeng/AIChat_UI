import {
  MessageSquareIcon,
  HistoryIcon,
  ImageIcon,
  Scissors,
  FolderOpen,
  Search,
  FileText,
  LayoutGrid, Star, Rocket, Users, PenTool, Layout, MessageSquare, Mic, Upload
} from 'lucide-react';
import React from "react";

// AI模型配置
export const AI_MODELS = [
  {
    id: 'creative',
    name: '聊天助手',
    primary: true
  },
  {
    id: 'analyst',
    name: '智能体助手',
  },
  {
    id: 'custom',
    name: '自定义模型'
  }
];

// 自定义模型选项
export const CUSTOM_MODEL_OPTIONS = [
  {
    id: 'GPT3.5-turbo',
    name: 'GPT3.5-turbo'
  },
  {
    id: 'GPT4o',
    name: 'GPT4o'
  },
  {
    id: 'GPT4o-mini',
    name: 'GPT4o-mini'
  },
  {
    id: 'Claude-3.5',
    name: 'Claude3.5'
  },
  {
    id: 'Claude-3-Opus',
    name: 'Claude3Opus'
  },
  {
    id: 'Claude-3-Haiku',
    name: 'Claude3Haiku'
  }
];

export const ASSISTANT_TITLE = "AI智能助手";
export const ASSISTANT_DESCRIPTION = "可以帮你完成各种任务，包括写作、分析、编程等。";

// 绘图模式配置
export const DRAWING_MODES = [
  {
    id: 'gallery',
    name: '图集广场',
    icon: ImageIcon
  },
  {
    id: 'text-to-image',
    name: '文生图',
    icon: MessageSquareIcon
  },
  {
    id: 'image-to-image',
    name: '图生图',
    icon: ImageIcon
  },
  {
    id: 'history',
    name: '历史记录',
    icon: HistoryIcon
  }
];
// 图片风格配置
export const IMAGE_STYLES = [
  {
    name: '写实',
    imageUrl: 'https://liblibai-online.liblib.cloud/img/69428715d8fd4713aff77ed97a3b73e4/79c563426db98bc3fee061249127984693418e33a6dcf7656393daf35b32bdeb.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '写实',
    description: '逼真的写实风格'
  },
  {
    name: '摄影',
    imageUrl: 'https://liblibai-online.liblib.cloud/img/148ecce3d0a74e3ca867307cd77bc1cd/15b21a34e74c316c80e0027c5e17dcb9543824fe90b077433b787d61796c2d0c.jpg?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '摄影',
    description: '真实摄影风格'
  },
  {
    name: '插画',
    imageUrl: 'https://liblibai-online.liblib.cloud/web/image/237ede17c78a8dba7301a478bf783e68d282b8af2c0d99b81cf7fd2b4ba0e0f3.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '插画',
    description: '手绘插画风格'
  },
  {
    name: '3D立体',
    imageUrl: 'https://liblibai-online.liblib.cloud/img/876973e4669f41678aef172793f2f8ab/8b99f9a85d5c6019433016a2bc71f98cc42a1fd1e8164dc368e12b879643cffa.jpg?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '3D',
    description: '3D建模风格'
  },
  {
    name: '科幻机甲',
    imageUrl: 'https://liblibai-online.liblib.cloud/web/image/e72e76f811d8100fe4a1ff6cbe487236545167eca069f7e7afdaf8a1436da38a.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '科幻',
    description: '未来科幻风格'
  },
  {
    name: '场景',
    imageUrl: 'https://liblibai-online.liblib.cloud/train/model_images/aa272cf9af5b4c2fa7daf9296f95eda6/20240314-1710383632011_epoch_0005.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    type: '场景',
    description: '室内场景风格'
  }
];

// 图库分类类型
export const GALLERY_TYPES = [
  '全部',
  '写实',
  '科幻',
  '插画',
  '动漫',
  '3D',
  '摄影',
  '电影'
];

// 图库示例图片
export const GALLERY_IMAGES = [
  {
    id: 1,
    url: 'https://liblibai-online.liblib.cloud/img/69428715d8fd4713aff77ed97a3b73e4/79c563426db98bc3fee061249127984693418e33a6dcf7656393daf35b32bdeb.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '写实风格山水画',
    type: '写实',
    tags: ['风景', '山水'],
    author: 'AI画师',
    createTime: '2024-03-01'
  },
  {
    id: 2,
    url: 'https://liblibai-online.liblib.cloud/web/image/e72e76f811d8100fe4a1ff6cbe487236545167eca069f7e7afdaf8a1436da38a.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '科幻机甲战士',
    type: '科幻',
    tags: ['机甲', '战士'],
    author: 'AI画师',
    createTime: '2024-03-02'
  },
  {
    id: 3,
    url: 'https://liblibai-online.liblib.cloud/web/image/237ede17c78a8dba7301a478bf783e68d282b8af2c0d99b81cf7fd2b4ba0e0f3.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '二次元少女插画',
    type: '插画',
    tags: ['动漫', '人物'],
    author: 'AI画师',
    createTime: '2024-03-03'
  },
  {
    id: 4,
    url: 'https://liblibai-online.liblib.cloud/web/image/0fd27dc3ef772e22d7698231d93c04ab48697308f8db0e7e88f72d2377f985ff.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '动漫场景',
    type: '动漫',
    tags: ['场景', '风景'],
    author: 'AI画师',
    createTime: '2024-03-04'
  },
  {
    id: 5,
    url: 'https://liblibai-online.liblib.cloud/img/876973e4669f41678aef172793f2f8ab/8b99f9a85d5c6019433016a2bc71f98cc42a1fd1e8164dc368e12b879643cffa.jpg?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '3D建筑设计',
    type: '3D',
    tags: ['建筑', '设计'],
    author: 'AI画师',
    createTime: '2024-03-05'
  },
  {
    id: 6,
    url: 'https://liblibai-online.liblib.cloud/img/148ecce3d0a74e3ca867307cd77bc1cd/15b21a34e74c316c80e0027c5e17dcb9543824fe90b077433b787d61796c2d0c.jpg?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '风光摄影',
    type: '摄影',
    tags: ['风景', '自然'],
    author: 'AI画师',
    createTime: '2024-03-06'
  },
  {
    id: 7,
    url: 'https://liblibai-online.liblib.cloud/train/model_images/aa272cf9af5b4c2fa7daf9296f95eda6/20240314-1710383632011_epoch_0005.png?image_process=format,webp&x-oss-process=image/resize,w_600,m_lfit/format,webp',
    prompt: '电影场景概念图',
    type: '电影',
    tags: ['场景', '概念'],
    author: 'AI画师',
    createTime: '2024-03-07'
  }
];

// 基础尺寸选项
export const BASE_SIZES = [
  { label: '1:1', width: 512, height: 512 },
  { label: '3:4', width: 384, height: 512 },
  { label: '4:3', width: 512, height: 384 },
  { label: '16:9', width: 512, height: 288 }
];

// 定义倍数选项
export const MULTIPLIERS = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 }
];

export const AGENT_CATEGORIES = [
  {
    id: 'all',
    name: '全部',
    icon: LayoutGrid,
    description: '显示所有可用的智能体'
  },
  {
    id: 'my-agents',
    name: '我创建的',
    icon: Star,
    description: '我创建和收藏的智能体'
  },
  {
    id: 'productivity',
    name: '工作效率',
    icon: Rocket,
    description: '提升工作效率的智能助手'
  },
  {
    id: 'marketing',
    name: '营销助手',
    icon: Users,
    description: '市场营销相关的智能助手'
  },
  {
    id: 'articles',
    name: '文章创作',
    icon: PenTool,
    description: '专注于文章写作的智能助手'
  },
  {
    id: 'content',
    name: '内容创作',
    icon: Layout,
    description: '通用内容创作智能助手'
  }
];


// 知识库模式配置
export const DOC_MODES = [
  {
    id: 'document',
    name: '文档管理',
    icon: FolderOpen,
    description: '管理和组织文档'
  },
  {
    id: 'document_split',
    name: '文档切块',
    icon: Scissors,
    description: '文档智能分段'
  },
  {
    id: 'question_retrieval',
    name: '问题检索',
    icon: Search,
    description: '智能检索相关问题'
  }
];

export const ALLOW_TYPE = {
    'application/pdf': {
      type: 'pdf',
      icon: <FileText className="text-red-500 mr-3" size={20} />,
      title: 'PDF文档',
      accept: '.pdf'
    },
    'application/msword': {
      type: 'doc',
      icon: <FileText className="text-blue-500 mr-3" size={20} />,
      title: 'Word文档',
      accept: '.doc'
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      type: 'docx',
      icon: <FileText className="text-blue-500 mr-3" size={20} />,
      title: 'Word文档',
      accept: '.docx'
    },
    'text/plain': {
      type: 'txt',
      icon: <FileText className="text-gray-500 mr-3" size={20} />,
      title: '文本文档',
      accept: '.txt'
    },
    'text/markdown': {
      type: 'md',
      icon: <FileText className="text-purple-500 mr-3" size={20} />,
      title: 'Markdown文档',
      accept: '.md'
    }
};

export const VOICE_MODES = [
  {
    id: 'upload',
    name: '音色上传',
    icon: Upload,
    description: '上传自定义声音样本'
  },
  {
    id: 'generate',
    name: '语音生成',
    icon: Mic,
    description: '生成AI语音'
  },
  {
    id: 'chat',
    name: '语音聊天',
    icon: MessageSquare,
    description: '实时语音对话'
  }
];

// 上传配置
export const UPLOAD_CONFIG = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxFileSize: 50 * 1024 * 1024,  // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxImageCount: 5,
  maxFileCount: 10
};

// API配置
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000/api',
  endpoints: {
    chat: '/chat',
    generateImage: '/generate-image/',
    optimizeText: '/optimize-text/',
    optimizePrompt: '/optimize-prompt/',
    document: {
      upload: '/upload_document/',
      process: '/process_document/',
      preview: '/preview_document/',
      retrieval:'/retrieval_document/',
      answer:'/answer_document/'
    },
    agent: {
      checkUrl:'/crawler/check-url/',
      getCrawlerStatus: '/crawler/status/',
      stopCrawler: '/crawler/stop/',
      startCrawler: '/crawler/start/'
    }
  },
  timeout: 30000 // 30秒超时
};
