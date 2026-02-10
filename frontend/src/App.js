import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AdminLayout } from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import NovoProduto from "./pages/NovoProduto";
import EditarProduto from "./pages/EditarProduto";
import ApiDocsPublic from "./pages/ApiDocsPublic";
import "@/App.css";

function App() {
  return (
    <div className="App min-h-screen bg-zinc-950">
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          {/* Página pública - Documentação da API */}
          <Route path="/" element={<ApiDocsPublic />} />
          
          {/* Painel Administrativo */}
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="produtos/novo" element={<NovoProduto />} />
            <Route path="produtos/editar/:id" element={<EditarProduto />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
