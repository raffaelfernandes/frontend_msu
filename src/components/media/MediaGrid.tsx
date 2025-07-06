import React from 'react';
import { MediaItem } from '../../types';
import { MediaCard } from './MediaCard';
import { Loader } from 'lucide-react';

interface MediaGridProps {
  media: MediaItem[];
  isLoading: boolean;
  onView: (media: MediaItem) => void;
  onEdit: (media: MediaItem) => void;
  onDelete: (mediaId: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando mídia...</span>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum arquivo encontrado
        </h3>
        <p className="text-gray-600">
          Faça upload de alguns arquivos para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};