import React from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';

const DocumentResults = ({ selectedFile, processingResults, setShowResults }) => {
  const [expandedChunks, setExpandedChunks] = React.useState([]);

  const toggleChunk = (chunkId) => {
    setExpandedChunks(expandedChunks.includes(chunkId) ? expandedChunks.filter((id) => id !== chunkId) : [...expandedChunks, chunkId]);
  };

  return (
    <div className="p-6">
      <h2>{selectedFile.name}</h2>
      <button onClick={() => setShowResults(false)}>返回</button>

      {processingResults.map((chunk) => (
        <div key={chunk.id} onClick={() => toggleChunk(chunk.id)}>
          {expandedChunks.includes(chunk.id) ? <ChevronDown /> : <ChevronRight />}
          <span>片段 {chunk.id}</span>
          {expandedChunks.includes(chunk.id) && <pre>{chunk.content}</pre>}
          <button onClick={() => navigator.clipboard.writeText(chunk.content)}>
            <Copy />
          </button>
        </div>
      ))}
    </div>
  );
};

export default DocumentResults;
