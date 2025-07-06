import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileVideo, Music } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface UploadZoneProps {
  onUpload: (files: File[], metadata: { description?: string; tags?: string; genre?: string }) => void;
  isUploading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState({
    description: '',
    tags: '',
    genre: '',
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, metadata);
      setSelectedFiles([]);
      setMetadata({ description: '', tags: '', genre: '' });
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.startsWith('video/')) return FileVideo;
    if (file.type.startsWith('audio/')) return Music;
    return FileImage;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload de Arquivos</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Arraste e solte arquivos aqui ou{' '}
          <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
            <span>escolha arquivos</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Suporte para imagens, vídeos e áudios
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Arquivos Selecionados</h4>
          <div className="space-y-2 mb-4">
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 mb-4">
            <Input
              label="Descrição"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva seus arquivos..."
            />
            
            <Input
              label="Tags"
              value={metadata.tags}
              onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
              helperText="Separe as tags com vírgulas"
            />
            
            <Input
              label="Gênero (para vídeos e áudios)"
              value={metadata.genre}
              onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
              placeholder="Gênero do conteúdo"
            />
          </div>

          <Button
            onClick={handleUpload}
            loading={isUploading}
            className="w-full"
          >
            Upload {selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};