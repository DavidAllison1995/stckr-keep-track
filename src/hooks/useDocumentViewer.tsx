
import { useState } from 'react';

interface DocumentViewerState {
  isOpen: boolean;
  fileUrl: string;
  fileName: string;
}

export const useDocumentViewer = () => {
  const [viewerState, setViewerState] = useState<DocumentViewerState>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const openViewer = (fileUrl: string, fileName: string) => {
    setViewerState({
      isOpen: true,
      fileUrl,
      fileName
    });
  };

  const closeViewer = () => {
    setViewerState({
      isOpen: false,
      fileUrl: '',
      fileName: ''
    });
  };

  return {
    ...viewerState,
    openViewer,
    closeViewer
  };
};
