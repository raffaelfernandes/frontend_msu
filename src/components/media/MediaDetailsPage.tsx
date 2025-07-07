// src/pages/MediaDetailPage.tsx

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clapperboard,
} from "lucide-react";
import { format } from "date-fns";

// Substitua pelo caminho real do seu serviço de API e tipos
import { apiService } from "../../services/api";
import {
  MediaDetailResponse,
  VideoMetadataDetail,
} from "../../types/mediatypes";

// --- Sub-Componente: VideoPlayer ---
interface VideoPlayerProps {
  mediaId: number;
  initialUrl: string;
  videoMetadata: VideoMetadataDetail;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaId,
  initialUrl,
  videoMetadata,
}) => {
  const [activeStreamUrl, setActiveStreamUrl] = useState(initialUrl);
  const [selectedQuality, setSelectedQuality] = useState<string>("1080p");
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedQualities = useMemo(() => {
    if (!videoMetadata.available_qualities) return [];
    return Object.keys(videoMetadata.available_qualities).sort((a, b) => {
      const qualityA = parseInt(a.replace("p", ""));
      const qualityB = parseInt(b.replace("p", ""));
      return qualityB - qualityA;
    });
  }, [videoMetadata.available_qualities]);

  useEffect(() => {
    const initialQuality =
      sortedQualities.find((q) => initialUrl.includes(q)) ||
      sortedQualities[0] ||
      "1080p";
    setSelectedQuality(initialQuality);
  }, [initialUrl, sortedQualities]);

  const handleQualityChange = async (quality: string) => {
    if (quality === selectedQuality) return;

    setIsStreamLoading(true);
    setError(null);
    try {
      const newUrl = await apiService.getMediaStreamUrl(mediaId, quality);
      setActiveStreamUrl(newUrl);
      setSelectedQuality(quality);
    } catch (err) {
      console.error(`Erro ao buscar URL para qualidade ${quality}:`, err);
      setError(
        `Não foi possível carregar a qualidade ${quality}. Tente novamente.`
      );
    } finally {
      setIsStreamLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full bg-black rounded-lg shadow-lg">
        {isStreamLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10 rounded-lg">
            <Loader className="w-10 h-10 animate-spin text-white mb-2" />
            <span className="text-white">Carregando nova qualidade...</span>
          </div>
        )}
        <video
          key={activeStreamUrl}
          src={activeStreamUrl}
          controls
          className="w-full h-auto rounded-lg"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {sortedQualities.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <Clapperboard className="w-4 h-4 mr-2" />
            Qualidade do Vídeo
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortedQualities.map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                disabled={isStreamLoading}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectedQuality === quality
                    ? "bg-blue-600 text-white focus:ring-blue-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                } ${isStreamLoading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Componente: ExifDataSection ---
const ExifDataSection: React.FC<{ exifData: Record<string, any> }> = ({
  exifData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!exifData || Object.keys(exifData).length === 0) return null;
  return (
    <div className="bg-gray-100 p-3 rounded-lg shadow-inner mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-md font-semibold text-gray-700 focus:outline-none"
      >
        <span>Dados EXIF</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
            {Object.entries(exifData).map(([key, value]) => (
              <li
                key={key}
                className="flex flex-col sm:flex-row sm:items-baseline"
              >
                <span className="font-medium text-gray-800 capitalize sm:w-1/3 pr-1 break-words">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="break-all sm:w-2/3 sm:break-words">
                  {String(value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Sub-Componente: MetadataSection ---
const MetadataSection: React.FC<{
  title: string;
  data: Record<string, any> | null | undefined;
}> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!data) return null;
  const filteredData = Object.entries(data).filter(
    ([key, value]) =>
      value !== null &&
      value !== undefined &&
      !["thumbnail_s3_key", "exif_data", "available_qualities"].includes(key)
  );
  if (filteredData.length === 0) return null;
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 focus:outline-none"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            {filteredData.map(([key, value]) => (
              <li key={key} className="flex flex-col mb-2">
                <span className="font-medium text-gray-900 capitalize mb-1">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="break-all pl-2">{String(value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal: MediaDetailPage ---
export const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<MediaDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (!id) {
        setError("ID da mídia não fornecido na URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getMediaById(Number(id));
        setMedia(response);
      } catch (err: any) {
        setError(
          err.message || "Ocorreu um erro ao carregar os detalhes da mídia."
        );
        console.error("Erro ao buscar detalhes da mídia:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMediaDetails();
  }, [id]);

  const renderMediaContent = () => {
    if (!media?.s3_url) {
      return (
        <div className="flex items-center justify-center w-full h-96 bg-gray-200 text-gray-500 rounded-lg">
          <span className="text-lg">
            URL da mídia principal não disponível.
          </span>
        </div>
      );
    }
    switch (media.media_type.toLowerCase()) {
      case "image":
        return (
          <img
            src={media.s3_url}
            alt={media.filename}
            className="max-w-full h-auto rounded-lg shadow-lg mx-auto object-contain"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          />
        );
      case "video":
        return media.video_metadata ? (
          <VideoPlayer
            mediaId={media.id}
            initialUrl={media.s3_url}
            videoMetadata={media.video_metadata}
          />
        ) : (
          <p>Metadados do vídeo não disponíveis.</p>
        );
      case "audio":
        return (
          <audio
            src={media.s3_url}
            controls
            className="w-full max-w-lg mx-auto"
          />
        );
      default:
        return (
          <div className="flex items-center justify-center w-full h-96 bg-gray-200 text-gray-500 rounded-lg">
            <span className="text-lg">Tipo de mídia não suportado.</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-12">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <span className="text-xl text-gray-600">
          Carregando detalhes da mídia...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p className="text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
        </button>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg mb-4">Dados da mídia não disponíveis.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8">
      <button
        onClick={() => navigate("/")}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 break-words">
        {media.filename}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-100 p-4 sm:p-6 rounded-lg flex items-center justify-center min-h-80">
            {renderMediaContent()}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Detalhes da Mídia
          </h2>
          <div className="space-y-3 text-gray-700 mb-6">
            <p>
              <span className="font-medium">Tipo:</span>{" "}
              {media.media_type.toLowerCase()}
            </p>
            <p>
              <span className="font-medium">Tamanho:</span>{" "}
              {(media.file_size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p>
              <span className="font-medium">Upload:</span>{" "}
              {format(new Date(media.upload_date), "dd/MM/yyyy HH:mm")}
            </p>
            <p>
              <span className="font-medium">Status:</span> {media.status}
            </p>
            {media.description && (
              <p>
                <span className="font-medium">Descrição:</span>{" "}
                {media.description}
              </p>
            )}
            {media.tags && media.tags.length > 0 && (
              <p>
                <span className="font-medium">Tags:</span>{" "}
                {media.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                  >
                    {tag}
                  </span>
                ))}
              </p>
            )}
            <p>
              <span className="font-medium">MIME Type:</span> {media.mime_type}
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Metadados Específicos
          </h2>
          {media.image_metadata && (
            <>
              <MetadataSection
                title="Metadados de Imagem"
                data={media.image_metadata}
              />
              {media.image_metadata.exif_data && (
                <ExifDataSection exifData={media.image_metadata.exif_data} />
              )}
            </>
          )}
          {media.video_metadata && (
            <>
              <MetadataSection
                title="Metadados de Vídeo"
                data={media.video_metadata}
              />
            </>
          )}
          {media.audio_metadata && (
            <MetadataSection
              title="Metadados de Áudio"
              data={media.audio_metadata}
            />
          )}
          {!media.image_metadata &&
            !media.video_metadata &&
            !media.audio_metadata && (
              <p className="text-gray-600">
                Nenhum metadado específico disponível.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;
