// src/components/MediaCard.tsx
import React from "react";
import {
  Play,
  Download,
  Edit,
  Trash2,
  FileImage,
  Music,
  Video,
} from "lucide-react";
import { MediaItem } from "../../types"; // Ajuste o caminho conforme a estrutura do seu projeto
import { useNavigate } from "react-router-dom"; // Importe para navegação

interface MediaCardProps {
  media: MediaItem;
  // onView não é mais usado para navegar diretamente, mas pode ser mantido
  // se você tiver outra lógica atrelada a ele em um nível superior.
  // Para navegação, usaremos o useNavigate diretamente dentro do componente.
  onView: (media: MediaItem) => void;
  onEdit: (media: MediaItem) => void;
  onDelete: (mediaId: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate(); // Hook para navegação

  // Função para lidar com o clique de visualização e navegar para a página de detalhes
  const handleViewDetails = () => {
    navigate(`/media/${media.id}`);
  };

  const getTypeIcon = () => {
    switch (media.media_type) {
      case "IMAGE":
        return FileImage;
      case "VIDEO":
        return Video;
      case "AUDIO":
        return Music;
      default:
        return FileImage;
    }
  };

  const TypeIcon = getTypeIcon();

  const getStatusColor = () => {
    switch (media.status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (media.status) {
      case "completed":
        return "Concluído";
      case "processing":
        return "Processando";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return media.status;
    }
  };

  const renderThumbnail = () => {
    // Prioriza thumbnail_s3_key se disponível
    if (media.thumbnail_s3_key) {
      const isVideoThumbnail = media.thumbnail_s3_key
        .toLowerCase()
        .endsWith(".mp4");

      if (isVideoThumbnail) {
        return (
          <video
            src={media.thumbnail_s3_key}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            loop
            title={`Thumbnail de vídeo ${media.filename}`} // Use title para acessibilidade em vídeo
          />
        );
      } else {
        // Assume que é uma imagem se não for .mp4
        return (
          <img
            src={media.thumbnail_s3_key}
            alt={`Thumbnail de ${media.filename}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none"; // Esconde a imagem quebrada
              target.parentElement
                ?.querySelector(".fallback-icon")
                ?.classList.remove("hidden"); // Mostra o ícone fallback
            }}
          />
        );
      }
    }

    // Fallback: se não tiver thumbnail_s3_key, mas for uma imagem e tiver URL original
    if (media.media_type === "IMAGE" && media.s3_url) {
      return (
        <img
          src={media.s3_url} // Usa a s3_url para imagem se não houver thumbnail
          alt={media.filename}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement
              ?.querySelector(".fallback-icon")
              ?.classList.remove("hidden");
          }}
        />
      );
    }

    // Se for vídeo e não tiver thumbnail_s3_key (nem URL original se preferir), não renderiza o <video>
    // para evitar carregar o vídeo completo na lista, apenas o ícone.
    // Se quiser que vídeos sem thumbnail carreguem o vídeo principal como preview, remova este null e
    // adicione a lógica para renderizar <video src={media.s3_url} ... />

    // Default: retorna null para que o ícone de fallback seja exibido
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative group">
        {renderThumbnail()}

        {/* Ícone de fallback: aparece se renderThumbnail retornar null ou se a mídia falhar ao carregar */}
        <div className={`fallback-icon ${renderThumbnail() ? "hidden" : ""}`}>
          <TypeIcon className="w-12 h-12 text-gray-400" />
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleViewDetails} // Usa a nova função de navegação
            className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Visualizar Mídia"
          >
            {media.media_type === "VIDEO" || media.media_type === "AUDIO" ? (
              <Play className="w-5 h-5" />
            ) : (
              <FileImage className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusText()}
          </span>
        </div>

        {media.media_type === "VIDEO" && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
              <Video className="w-3 h-3 mr-1" />
              Vídeo
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-1">
          {media.filename}
        </h3>

        {media.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {media.description}
          </p>
        )}

        {media.tags && media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {media.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{media.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            {media.upload_date
              ? new Date(media.upload_date).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : ""}
          </span>
          <span className="text-xs text-gray-500">
            {media.file_size
              ? (() => {
                  const size = Number(media.file_size);
                  if (isNaN(size)) return "";
                  if (size < 1024) return `${size} B`;
                  if (size < 1024 * 1024)
                    return `${(size / 1024).toFixed(1)} KB`;
                  if (size < 1024 * 1024 * 1024)
                    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
                  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
                })()
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {media.media_type.toLowerCase()}
          </span>

          <div className="flex items-center space-x-2">
            {media.s3_url && ( // Usa s3_url para o download do arquivo original
              <a
                href={media.s3_url}
                download={media.filename}
                className="text-blue-600 hover:text-blue-700 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onEdit(media)}
              className="text-gray-600 hover:text-gray-700 transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(media.id)}
              className="text-red-600 hover:text-red-700 transition-colors"
              title="Deletar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
