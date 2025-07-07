// src/App.tsx

import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Importe Routes, Route, useNavigate
import { useAuth, AuthProvider } from "./hooks/useAuth";

// Importe os componentes de página que serão usados nas rotas
import { Dashboard } from "./components/Dashboard"; // O seu Dashboard principal
import { MediaDetailPage } from "./components/media/MediaDetailsPage"; // A página de detalhes
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";

// Componente para a página de Autenticação
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

// AppContent - Gerencia o estado de autenticação e as rotas
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate(); // useNavigate está OK aqui

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Se não autenticado, e não está na rota de login/registro, redireciona
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          navigate("/login", { replace: true });
        }
      } else {
        // Se autenticado, e está na rota de login/registro, redireciona para o dashboard
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register"
        ) {
          navigate("/", { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas para usuários não autenticados */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Rotas protegidas (exigem autenticação) */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Dashboard />} />{" "}
          {/* Renderiza o Dashboard */}
          <Route path="/media/:id" element={<MediaDetailPage />} />{" "}
          {/* A página de detalhes */}
          {/* Rota coringa para redirecionar para o dashboard se autenticado e rota desconhecida */}
          <Route path="*" element={<Dashboard />} />
        </>
      ) : (
        // Rota coringa para redirecionar para o login se não autenticado e rota desconhecida
        <Route path="*" element={<AuthPage />} />
      )}
    </Routes>
  );
};

// Componente App final que envolve AppContent com AuthProvider (e BrowserRouter em main.tsx)
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
