import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Star,
  Filter,
  Loader2,
  UtensilsCrossed
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIAS = [
  { value: "all", label: "Todas as Categorias" },
  { value: "Entradas", label: "Entradas" },
  { value: "Pratos Principais", label: "Pratos Principais" },
  { value: "Sobremesas", label: "Sobremesas" },
  { value: "Bebidas", label: "Bebidas" },
];

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [destacadoFiltro, setDestacadoFiltro] = useState("all");

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoriaFiltro && categoriaFiltro !== "all") {
        params.append("categoria", categoriaFiltro);
      }
      if (destacadoFiltro !== "all") {
        params.append("destacado", destacadoFiltro === "true");
      }
      
      const response = await axios.get(`${API}/produtos?${params.toString()}`);
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [categoriaFiltro, destacadoFiltro]);

  const handleDelete = async (id, nome) => {
    try {
      await axios.delete(`${API}/produtos/${id}`);
      toast.success(`"${nome}" removido com sucesso`);
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao remover produto");
    }
  };

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryStyle = (categoria) => {
    const styles = {
      "Entradas": "badge-entradas",
      "Pratos Principais": "badge-pratos-principais",
      "Sobremesas": "badge-sobremesas",
      "Bebidas": "badge-bebidas"
    };
    return styles[categoria] || "bg-zinc-800 text-zinc-300";
  };

  return (
    <div data-testid="produtos-page" className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-50 tracking-tight">Produtos</h1>
          <p className="text-zinc-500 mt-2">Gerencie os itens do cardápio</p>
        </div>
        <Link to="/produtos/novo">
          <Button data-testid="btn-novo-produto" className="bg-orange-600 hover:bg-orange-500">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                data-testid="search-input"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 focus:border-orange-500"
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger data-testid="filter-categoria" className="w-full md:w-48 bg-zinc-800 border-zinc-700">
                <Filter className="h-4 w-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {CATEGORIAS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={destacadoFiltro} onValueChange={setDestacadoFiltro}>
              <SelectTrigger data-testid="filter-destacado" className="w-full md:w-40 bg-zinc-800 border-zinc-700">
                <Star className="h-4 w-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Destaque" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Destacados</SelectItem>
                <SelectItem value="false">Não Destacados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredProdutos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((produto) => (
            <Card 
              key={produto.id}
              data-testid={`produto-${produto.id}`}
              className={`product-card group border-zinc-800 bg-zinc-900 overflow-hidden hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300 hover-lift ${produto.destacado ? 'glow-orange border-orange-500/30' : ''}`}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={produto.imagem} 
                  alt={produto.nome}
                  className="product-image w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                  }}
                />
                {produto.destacado && (
                  <Badge className="absolute top-3 right-3 badge-destacado">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Destaque
                  </Badge>
                )}
                <Badge className={`absolute top-3 left-3 ${getCategoryStyle(produto.categoria)}`}>
                  {produto.categoria}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-zinc-50">{produto.nome}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mt-1 min-h-[40px]">
                  {produto.descricao}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-orange-500 price">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/produtos/editar/${produto.id}`}>
                      <Button 
                        data-testid={`btn-editar-${produto.id}`}
                        variant="ghost" 
                        size="icon"
                        className="text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          data-testid={`btn-deletar-${produto.id}`}
                          variant="ghost" 
                          size="icon"
                          className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-zinc-50">Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            Tem certeza que deseja remover "{produto.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(produto.id, produto.nome)}
                            className="bg-red-600 hover:bg-red-500"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="empty-state py-16">
            <UtensilsCrossed className="h-16 w-16 text-zinc-700 mb-4" />
            <h3 className="text-xl font-medium text-zinc-400">Nenhum produto encontrado</h3>
            <p className="text-sm text-zinc-600 mt-2">
              {searchTerm || categoriaFiltro !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Comece adicionando seu primeiro produto"}
            </p>
            <Link to="/produtos/novo" className="mt-6">
              <Button className="bg-orange-600 hover:bg-orange-500">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      {!loading && filteredProdutos.length > 0 && (
        <p className="text-sm text-zinc-600 text-center">
          Exibindo {filteredProdutos.length} {filteredProdutos.length === 1 ? 'produto' : 'produtos'}
        </p>
      )}
    </div>
  );
}
