import React from 'react';
import { X, Download, Edit } from 'lucide-react';
import { MediaDetailResponse } from '../../types';
import { Button } from '../ui/Button';

interface MediaViewerProps {
  media: MediaDetailResponse;
  onClose: () => void;
  onEdit: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  onClose,
  onEdit,
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaContent = () => {
    switch (media.media_type) {
      case 'IMAGE':
        return (
          <img
            src={media.url}
            alt={media.filename}
            className="max-w-full max-h-96 object-contain mx-auto"
          />
        );
      case 'VIDEO':
        return (
          <video
            src={media.url}
            controls
            className="max-w-full max-h-96 mx-auto"
            preload="metadata"
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        );
      case 'AUDIO':
        return (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <div className="text-6xl mb-4">🎵</div>
            <audio
              src={media.url}
              controls
              className="w-full max-w-md mx-auto"
              preload="metadata"
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600">Tipo de arquivo não suportado para visualização</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {media.filename}
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              {media.url && (
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href={media.url}
                  download={media.filename}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              {renderMediaContent()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Informações do Arquivo</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {media.media_type.toLowerCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tamanho</dt>
                    <dd className="text-sm text-gray-900">
                      {formatFileSize(media.file_size)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo MIME</dt>
                    <dd className="text-sm text-gray-900">{media.mime_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {media.status.toLowerCase()}
                    </dd>
                  </div>
                  {media.duration && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duração</dt>
                      <dd className="text-sm text-gray-900">
                        {formatDuration(media.duration)}
                      </dd>
                    </div>
                  )}
                  {media.width && media.height && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dimensões</dt>
                      <dd className="text-sm text-gray-900">
                        {media.width} × {media.height}
                      </dd>
                    </div>
                  )}
                  {media.genre && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Gênero</dt>
                      <dd className="text-sm text-gray-900">{media.genre}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Metadados</h3>
                {media.description && (
                  <div className="mb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Descrição</dt>
                    <dd className="text-sm text-gray-900">{media.description}</dd>
                  </div>
                )}
                
                {media.tags && media.tags.length > 0 && (
                  <div className="mb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                    <dd className="flex flex-wrap gap-2">
                      {media.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {media.created_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(media.created_at).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};