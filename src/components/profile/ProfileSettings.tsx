import React, { useState } from "react";
import { Camera, Edit, Save, X } from "lucide-react";
import { User, UpdateUserRequest } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface ProfileSettingsProps {
  user: User;
  onUpdateProfile: (data: UpdateUserRequest) => Promise<void>;
  onUploadProfilePicture: (file: File) => Promise<void>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onUpdateProfile,
  onUploadProfilePicture,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    description: user.description || "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: UpdateUserRequest = {};

      // Só inclui campos que foram modificados
      if (formData.full_name !== user.full_name) {
        updateData.full_name = formData.full_name;
      }
      if (formData.description !== (user.description || "")) {
        updateData.description = formData.description;
      }
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      // Só faz a requisição se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await onUpdateProfile(updateData);
      }

      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUploadProfilePicture(file);
      } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      description: user.description || "",
      password: "",
    });
  };

  const getProfilePictureUrl = () => {
    if (user.profile_picture_base64 && user.profile_picture_content_type) {
      return `data:${user.profile_picture_content_type};base64,${user.profile_picture_base64}`;
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="mb-6 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto">
            {getProfilePictureUrl() ? (
              <img
                src={getProfilePictureUrl()!}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Nome de Usuário"
            name="username"
            value={formData.username}
            onChange={handleChange}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
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
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          <Input
            label="Nova Senha (opcional)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Deixe em branco para manter a atual"
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Nome Completo
            </label>
            <p className="text-gray-900">{user.full_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Nome de Usuário
            </label>
            <p className="text-gray-900">@{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Email
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          {user.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Descrição
              </label>
              <p className="text-gray-900">{user.description}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Membro desde
            </label>
            <p className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
