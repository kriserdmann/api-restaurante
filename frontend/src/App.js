import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import NovoProduto from "./pages/NovoProduto";
import EditarProduto from "./pages/EditarProduto";
import ApiDocs from "./pages/ApiDocs";
import "@/App.css";

function App() {
  return (
    <div className="App min-h-screen bg-zinc-950">
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="produtos/novo" element={<NovoProduto />} />
            <Route path="produtos/editar/:id" element={<EditarProduto />} />
            <Route path="documentacao" element={<ApiDocs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
