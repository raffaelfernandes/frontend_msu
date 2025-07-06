import React from "react";
import { Play, Download, Edit, Trash2, FileImage, Video } from "lucide-react";
import { MediaItem } from "../../types";

interface MediaCardProps {
  media: MediaItem;
  onView: (media: MediaItem) => void;
  onEdit: (media: MediaItem) => void;
  onDelete: (mediaId: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onView,
  onEdit,
  onDelete,
}) => {
  const getTypeIcon = () => {
    switch (media.media_type) {
      case "IMAGE":
        return FileImage;
      case "VIDEO":
      case "AUDIO": // Áudio não tem thumbnail visual geralmente, então mantemos o ícone de vídeo/música para consistência.
        return Video; // Ou Music, dependendo da sua preferência para vídeo sem thumbnail
      default:
        return FileImage;
    }
  };

  const TypeIcon = getTypeIcon();

  const getStatusColor = () => {
    switch (media.status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (media.status) {
      case "COMPLETED":
        return "Concluído";
      case "PROCESSING":
        return "Processando";
      case "PENDING":
        return "Pendente";
      case "FAILED":
        return "Falhou";
      default:
        return media.status;
    }
  };

  const renderThumbnail = () => {
    // Se houver uma thumbnail pré-assinada, tentamos exibi-la
    if (media.thumbnail_s3_key) {
      // Verifica a extensão da thumbnail para decidir entre <img> e <video>
      const isVideoThumbnail = media.thumbnail_s3_key
        .toLowerCase()
        .endsWith(".mp4");

      if (isVideoThumbnail) {
        // Usa <video> para thumbnails que são vídeos
        return (
          <video
            src={media.thumbnail_s3_key}
            className="w-full h-full object-cover"
            preload="metadata" // Carrega apenas metadados para não baixar o vídeo inteiro
            muted // Essencial para auto-play em muitos navegadores, mesmo que não haja play automático, evita problemas.
            loop // Opcional: faz o vídeo da thumbnail dar loop
            // alt removido porque não é válido para <video>
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
              // Fallback se a imagem da thumbnail falhar
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

    // Se não houver thumbnail_s3_key, mas for uma imagem e tiver URL original
    if (media.media_type === "IMAGE" && media.url) {
      return (
        <img
          src={media.url}
          alt={media.filename}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback se a imagem da URL original falhar
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement
              ?.querySelector(".fallback-icon")
              ?.classList.remove("hidden");
          }}
        />
      );
    }

    // Para vídeos sem thumbnail_s3_key, mas com URL original (ainda pode ser grande para preview)
    // Se a intenção é só um play icon, essa parte pode ser removida.
    // Se a intenção é pré-visualizar o vídeo grande, talvez adicionar `poster` aqui se tiver uma imagem de capa.
    if (media.media_type === "VIDEO" && media.url) {
      return (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          preload="metadata"
          // Remova 'controls' se não quiser que o usuário interaja na thumbnail
        />
      );
    }

    // Se não houver thumbnail_s3_key ou url adequada, não retorna nada aqui para que o fallback-icon seja exibido
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative group">
        {renderThumbnail()}

        {/* Ícone de fallback: aparece se renderThumbnail retornar null ou se a imagem/vídeo falhar ao carregar */}
        {/* A lógica da classe 'hidden' é crucial aqui para que o fallback só apareça quando necessário. */}
        {/* Simplificamos a condição da classe hidden, pois o onError já lida com a exibição do ícone se o elemento de mídia falhar. */}
        <div className={`fallback-icon ${renderThumbnail() ? "hidden" : ""}`}>
          <TypeIcon className="w-12 h-12 text-gray-400" />
        </div>

        {/* Overlay com botão de play/view */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onView(media)}
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

        {/* Badge de status */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {getStatusText()}
          </span>
        </div>

        {/* Indicador de tipo de mídia para vídeos */}
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

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {media.media_type.toLowerCase()}
          </span>

          <div className="flex items-center space-x-2">
            {media.url && (
              <a
                href={media.url}
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
