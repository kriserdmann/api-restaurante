import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  UtensilsCrossed, 
  Star, 
  TrendingUp,
  Coffee,
  IceCream,
  Salad,
  GlassWater,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="stat-card border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="text-3xl font-bold text-zinc-50 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductCard = ({ produto }) => {
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
    <Card 
      data-testid={`product-card-${produto.id}`}
      className={`product-card group border-zinc-800 bg-zinc-900 overflow-hidden hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300 ${produto.destacado ? 'glow-orange border-orange-500/30' : ''}`}
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
          <Badge 
            data-testid={`badge-destacado-${produto.id}`}
            className="absolute top-3 right-3 badge-destacado"
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            Destaque
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-50 truncate">{produto.nome}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{produto.descricao}</p>
          </div>
          <Badge className={getCategoryStyle(produto.categoria)} variant="secondary">
            {produto.categoria.split(' ')[0]}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-orange-500 price">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>
          <Link to={`/produtos/editar/${produto.id}`}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-orange-500">
              Editar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, produtosRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/produtos?destacado=true`)
        ]);
        setStats(statsRes.data);
        setProdutos(produtosRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div data-testid="dashboard" className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-zinc-50 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Visão geral do cardápio do restaurante</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Produtos"
          value={stats?.total_produtos || 0}
          icon={UtensilsCrossed}
          color="bg-orange-500/10 text-orange-500"
        />
        <StatCard 
          title="Entradas"
          value={stats?.total_entradas || 0}
          icon={Salad}
          color="bg-orange-500/10 text-orange-400"
          subtitle="Aperitivos e entradas"
        />
        <StatCard 
          title="Pratos Principais"
          value={stats?.total_pratos_principais || 0}
          icon={Coffee}
          color="bg-emerald-500/10 text-emerald-500"
          subtitle="Refeições completas"
        />
        <StatCard 
          title="Destacados"
          value={stats?.total_destacados || 0}
          icon={Star}
          color="bg-yellow-500/10 text-yellow-500"
          subtitle="Produtos em destaque"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Sobremesas"
          value={stats?.total_sobremesas || 0}
          icon={IceCream}
          color="bg-purple-500/10 text-purple-500"
          subtitle="Doces e sobremesas"
        />
        <StatCard 
          title="Bebidas"
          value={stats?.total_bebidas || 0}
          icon={GlassWater}
          color="bg-blue-500/10 text-blue-500"
          subtitle="Sucos, refrigerantes e mais"
        />
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Produtos em Destaque</h2>
            <p className="text-zinc-500 text-sm mt-1">Itens marcados como destaque no cardápio</p>
          </div>
          <Link to="/produtos">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 hover:border-orange-500/50">
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {produtos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.slice(0, 6).map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="empty-state py-12">
              <Star className="h-12 w-12 text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400">Nenhum produto em destaque</h3>
              <p className="text-sm text-zinc-600 mt-1">Marque produtos como destaque para exibi-los aqui</p>
              <Link to="/produtos/novo" className="mt-4">
                <Button className="bg-orange-600 hover:bg-orange-500">
                  Adicionar Produto
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-50 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link to="/produtos/novo">
            <Button className="bg-orange-600 hover:bg-orange-500">
              Adicionar Novo Produto
            </Button>
          </Link>
          <Link to="/documentacao">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
              Ver Documentação da API
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
