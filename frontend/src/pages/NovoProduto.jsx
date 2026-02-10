import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIAS = [
  { value: "Entradas", label: "Entradas" },
  { value: "Pratos Principais", label: "Pratos Principais" },
  { value: "Sobremesas", label: "Sobremesas" },
  { value: "Bebidas", label: "Bebidas" },
];

export default function NovoProduto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
    imagem: "",
    destacado: false
  });
  const [previewImage, setPreviewImage] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "imagem") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.descricao || !formData.categoria || !formData.preco || !formData.imagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const preco = parseFloat(formData.preco.replace(",", "."));
    if (isNaN(preco) || preco <= 0) {
      toast.error("Preço inválido");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/produtos`, {
        ...formData,
        preco
      });
      toast.success("Produto criado com sucesso!");
      navigate("/produtos");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="novo-produto-page" className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/produtos">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-50 tracking-tight">Novo Produto</h1>
          <p className="text-zinc-500 mt-1">Adicione um novo item ao cardápio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-zinc-50">Informações do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-zinc-300">Nome *</Label>
                  <Input
                    id="nome"
                    data-testid="input-nome"
                    placeholder="Ex: Filé Mignon ao Molho Madeira"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-zinc-300">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    data-testid="input-descricao"
                    placeholder="Descreva o prato, ingredientes e modo de preparo..."
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoria" className="text-zinc-300">Categoria *</Label>
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => handleChange("categoria", value)}
                    >
                      <SelectTrigger data-testid="select-categoria" className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {CATEGORIAS.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco" className="text-zinc-300">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      data-testid="input-preco"
                      placeholder="Ex: 59,90"
                      value={formData.preco}
                      onChange={(e) => handleChange("preco", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem" className="text-zinc-300">URL da Imagem *</Label>
                  <Input
                    id="imagem"
                    data-testid="input-imagem"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imagem}
                    onChange={(e) => handleChange("imagem", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 focus:border-orange-500"
                  />
                  <p className="text-xs text-zinc-600">
                    Dica: Use imagens do Unsplash ou Pexels para fotos de alta qualidade
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div>
                    <Label htmlFor="destacado" className="text-zinc-300 font-medium">
                      Produto em Destaque
                    </Label>
                    <p className="text-xs text-zinc-500 mt-1">
                      Produtos destacados aparecem em evidência no cardápio
                    </p>
                  </div>
                  <Switch
                    id="destacado"
                    data-testid="switch-destacado"
                    checked={formData.destacado}
                    onCheckedChange={(checked) => handleChange("destacado", checked)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50 sticky top-8">
              <CardHeader>
                <CardTitle className="text-zinc-50">Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border border-zinc-800">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-40 bg-zinc-800 flex items-center justify-center ${previewImage ? 'hidden' : ''}`}
                  >
                    <ImageIcon className="h-12 w-12 text-zinc-700" />
                  </div>
                  <div className="p-4 bg-zinc-900">
                    <h3 className="font-semibold text-zinc-50">
                      {formData.nome || "Nome do Produto"}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {formData.descricao || "Descrição do produto..."}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-orange-500">
                        R$ {formData.preco || "0,00"}
                      </span>
                      {formData.categoria && (
                        <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                          {formData.categoria}
                        </span>
                      )}
                    </div>
                    {formData.destacado && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded badge-destacado">
                        ★ Destaque
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit"
              data-testid="btn-salvar"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 h-12"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Produto
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
