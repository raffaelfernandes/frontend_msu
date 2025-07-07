// Tipos de Metadados Detalhados
export interface ImageMetadataDetail {
  dimensions?: string;
  color_depth?: number;
  resolution?: string;
  exif_data?: { [key: string]: string }; // Chave-valor para dados EXIF
  thumbnail_s3_key?: string; // URL pré-assinada da thumbnail da imagem
}

export interface VideoMetadataDetail {
  duration?: number;
  resolution?: string;
  frame_rate?: number;
  video_codec?: string;
  audio_codec?: string;
  bit_rate?: number;
  thumbnail_s3_key?: string; // URL pré-assinada da thumbnail do vídeo (pode ser .mp4)
  available_qualities?: { [key: string]: string }; // Ex: { "SD": "url_sd", "HD": "url_hd" }
  genre?: string;
}

export interface AudioMetadataDetail {
  duration?: number;
  bit_rate?: number;
  sample_rate?: number;
  channels?: number;
  genre?: string;
}

// MediaItem - Para a lista de mídias (visão geral na MediaCard)
// Deve conter os dados que você precisa exibir na lista/card
export interface MediaItem {
  id: number;
  filename: string;
  mime_type: string;
  media_type: string;
  status: string;
  description?: string;
  tags?: string[];
  s3_url: string; // URL pré-assinada do arquivo original
  thumbnail_s3_key?: string; // URL pré-assinada da thumbnail (para exibição no card)
}

// MediaDetailResponse - Para a página de detalhes de uma mídia específica
// Contém todos os metadados específicos de cada tipo de mídia
export interface MediaDetailResponse {
  id: number;
  filename: string;
  s3_key: string; // A chave S3 original (não a URL pré-assinada)
  mime_type: string;
  file_size: number;
  upload_date: string; // Usar string e formatar com date-fns
  media_type: string;
  status: string;
  description?: string;
  tags?: string[];
  s3_url: string; // A URL pré-assinada do arquivo original para exibição

  image_metadata?: ImageMetadataDetail;
  video_metadata?: VideoMetadataDetail;
  audio_metadata?: AudioMetadataDetail;
}
