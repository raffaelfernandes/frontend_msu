// src/components/Dashboard.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate está OK aqui

// Importações DIRETAS para componentes que são sempre usados ou não serão lazy loaded
import { Sidebar } from "./layout/Sidebar";
import { UploadZone } from "./media/UploadZone";
import { MediaGrid } from "./media/MediaGrid";
import { MediaViewer } from "./media/MediaViewer"; // Se ainda for usado para o modal de visualização
import { EditMediaModal } from "./media/EditMediaModal";
import { ProfileSettings } from "./profile/ProfileSettings";
import { SearchBar } from "./search/SearchBar";
import { Toast } from "../components/ui/Toast"; // Ajuste o caminho
import { useAuth } from "../hooks/useAuth"; // Ajuste o caminho
import { apiService } from "../services/api"; // Ajuste o caminho
import {
  MediaItem,
  MediaDetailResponse,
  UploadMediaRequest,
  UpdateMediaRequest,
  UpdateUserRequest,
} from "../types"; // Ajuste o caminho

export const Dashboard: React.FC = () => {
  // Renomeado de MainDashboardContent para Dashboard
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] =
    useState<MediaDetailResponse | null>(null); // Mantido se MediaViewer ainda for um modal
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const showToast = (
    type: "success" | "error" | "info" | "warning",
    message: string
  ) => {
    setToast({ type, message });
  };

  const loadMedia = async (query?: string) => {
    setIsLoadingMedia(true);
    try {
      const response = query
        ? await apiService.searchMedia({ q: query, limit: 50 })
        : await apiService.getMediaList({ limit: 50 });
      setMedia(response.media);
    } catch (error) {
      showToast("error", "Erro ao carregar mídia");
      console.error("Erro ao carregar mídia:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "search") {
      loadMedia(searchQuery);
    }
  }, [activeTab, searchQuery]);

  const handleUpload = async (
    files: File[],
    metadata: { description?: string; tags?: string; genre?: string }
  ) => {
    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => {
        const uploadData: UploadMediaRequest = {
          file,
          description: metadata.description,
          tags: metadata.tags,
          genre: metadata.genre,
        };
        return apiService.uploadMedia(uploadData);
      });

      await Promise.all(uploadPromises);
      showToast("success", `${files.length} arquivo(s) enviado(s) com sucesso`);
      loadMedia(searchQuery);
    } catch (error) {
      showToast("error", "Erro ao fazer upload dos arquivos");
      console.error("Erro no upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewMedia = async (mediaItem: MediaItem) => {
    // Agora navega para a página de detalhes, não abre um modal no Dashboard
    navigate(`/media/${mediaItem.id}`);
  };

  const handleEditMedia = (mediaItem: MediaItem) => {
    setEditingMedia(mediaItem);
  };

  const handleSaveMediaEdit = async (id: number, data: UpdateMediaRequest) => {
    try {
      await apiService.updateMedia(id, data);
      showToast("success", "Mídia atualizada com sucesso");
      loadMedia(searchQuery);
      setEditingMedia(null);
    } catch (error) {
      showToast("error", "Erro ao atualizar mídia");
      console.error("Erro ao salvar:", error);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este arquivo?")) {
      try {
        await apiService.deleteMedia(mediaId);
        showToast("success", "Arquivo deletado com sucesso");
        loadMedia(searchQuery);
        // Se selectedMedia for o que foi deletado, limpe-o.
        if (selectedMedia?.id === mediaId) {
          setSelectedMedia(null);
        }
      } catch (error) {
        showToast("error", "Erro ao deletar arquivo");
        console.error("Erro ao deletar:", error);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateProfile = async (data: UpdateUserRequest) => {
    if (!user) return;
    try {
      await apiService.updateUser(user.id, data);
      showToast("success", "Perfil atualizado com sucesso");
      // Considere como atualizar o usuário sem reload completo, se possível
      // ex: re-fetch user data via useAuth context
    } catch (error) {
      showToast("error", "Erro ao atualizar perfil");
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    try {
      await apiService.uploadProfilePicture(file);
      showToast("success", "Foto de perfil atualizada com sucesso");
      // Considerar como atualizar a foto sem reload completo
    } catch (error) {
      showToast("error", "Erro ao atualizar foto de perfil");
      console.error("Erro ao fazer upload da foto:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="max-w-2xl mx-auto">
            <UploadZone onUpload={handleUpload} isUploading={isUploading} />
          </div>
        );

      case "search":
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-grow">
                <SearchBar onSearch={handleSearch} isLoading={isLoadingMedia} />
              </div>
              <button
                onClick={() => handleSearch("")}
                className="px-4 py-2 mt-1 h-fit bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition whitespace-nowrap"
              >
                Limpar filtros
              </button>
            </div>
            <MediaGrid
              media={media}
              isLoading={isLoadingMedia}
              onView={handleViewMedia}
              onEdit={handleEditMedia}
              onDelete={handleDeleteMedia}
            />
          </div>
        );

      case "profile":
        return user ? (
          <ProfileSettings
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onUploadProfilePicture={handleUploadProfilePicture}
          />
        ) : null;

      default:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">
                Bem-vindo, {user?.full_name}!
              </h2>
              <p className="text-gray-600 mb-4">
                Gerencie seus arquivos multimídia de forma fácil e organizada.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">
                    Total de Arquivos
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {media.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Concluídos</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {media.filter((m) => m.status === "completed").length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900">Processando</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      media.filter(
                        (m) =>
                          m.status === "processing" || m.status === "pending"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
            <MediaGrid
              media={media}
              isLoading={isLoadingMedia}
              onView={handleViewMedia}
              onEdit={handleEditMedia}
              onDelete={handleDeleteMedia}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{renderContent()}</div>
      </main>

      {/* Se você ainda usa MediaViewer como um modal para o 'selectedMedia', mantenha-o.
          Se a navegação para MediaDetailPage substitui essa visualização, remova-o. */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onEdit={() => {
            const mediaItem: MediaItem = {
              id: selectedMedia.id,
              filename: selectedMedia.filename,
              mime_type: selectedMedia.mime_type,
              media_type: selectedMedia.media_type,
              status: selectedMedia.status,
              description: selectedMedia.description,
              tags: selectedMedia.tags,
              s3_url: selectedMedia.s3_url, // Corrigido de 'url' para 's3_url'
              thumbnail_s3_key:
                selectedMedia.image_metadata?.thumbnail_s3_key ||
                selectedMedia.video_metadata?.thumbnail_s3_key, // Pegar de metadados
              // genre: selectedMedia.genre, // Genre está nos metadados, não em MediaItem
            };
            setEditingMedia(mediaItem);
            setSelectedMedia(null);
          }}
        />
      )}

      <EditMediaModal
        isOpen={!!editingMedia}
        onClose={() => setEditingMedia(null)}
        media={editingMedia}
        onSave={handleSaveMediaEdit}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
