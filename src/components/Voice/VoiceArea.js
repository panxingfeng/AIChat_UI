import React from 'react';
import VoiceUpload from './page/VoiceUpload';
import VoiceGenerate from './page/VoiceGenerate';
import VoiceChat from './page/VoiceChat';

const VoiceArea = ({ voiceMode }) => {
  const renderContent = () => {
    switch (voiceMode) {
      case 'upload':
        return <VoiceUpload />;
      case 'generate':
        return <VoiceGenerate />;
      case 'chat':
        return <VoiceChat />;
      default:
        return <VoiceUpload />;
    }
  };

  return renderContent();
};

export default VoiceArea;