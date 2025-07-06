import React, { useState, useEffect } from 'react';
import { MediaItem, UpdateMediaRequest } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  onSave: (id: number, data: UpdateMediaRequest) => Promise<void>;
}

export const EditMediaModal: React.FC<EditMediaModalProps> = ({
  isOpen,
  onClose,
  media,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    filename: '',
    description: '',
    tags: '',
    genre: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (media) {
      setFormData({
        filename: media.filename,
        description: media.description || '',
        tags: media.tags?.join(', ') || '',
        genre: media.genre || '',
      });
    }
  }, [media]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media) return;

    setIsLoading(true);
    try {
      const updateData: UpdateMediaRequest = {
        filename: formData.filename,
        description: formData.description || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        genre: formData.genre || undefined,
      };
      
      await onSave(media.id, updateData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!media) return null;

  const canEditGenre = media.media_type === 'VIDEO' || media.media_type === 'AUDIO';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Mídia" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Arquivo"
          name="filename"
          value={formData.filename}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva este arquivo..."
          />
        </div>

        <Input
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="tag1, tag2, tag3"
          helperText="Separe as tags com vírgulas"
        />

        {canEditGenre && (
          <Input
            label="Gênero"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="Gênero do conteúdo"
          />
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};