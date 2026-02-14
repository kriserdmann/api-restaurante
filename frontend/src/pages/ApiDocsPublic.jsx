import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Play, ChevronRight, Database, Code, Terminal, BookOpen, ChefHat, Settings, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const endpoints = [
  {
    method: "GET",
    path: "/api/produtos",
    description: "Lista todos os produtos do cardápio",
    params: [
      { name: "categoria", type: "string", optional: true, description: "Filtrar por categoria (Entradas, Pratos Principais, Sobremesas, Bebidas)" },
      { name: "destacado", type: "boolean", optional: true, description: "Filtrar por produtos destacados (true/false)" }
    ],
    response: `[
  {
    "id": "uuid-string",
    "nome": "Filé Mignon ao Molho Madeira",
    "descricao": "Descrição do prato...",
    "categoria": "Pratos Principais",
    "preco": 78.90,
    "imagem": "https://...",
    "destacado": true,
    "criado_em": "2024-01-15T10:30:00Z",
    "atualizado_em": "2024-01-15T10:30:00Z"
  }
]`
  },
  {
    method: "GET",
    path: "/api/produtos/{id}",
    description: "Obtém um produto específico pelo ID",
    params: [
      { name: "id", type: "string", optional: false, description: "ID único do produto (UUID)" }
    ],
    response: `{
  "id": "uuid-string",
  "nome": "Filé Mignon ao Molho Madeira",
  "descricao": "Descrição do prato...",
  "categoria": "Pratos Principais",
  "preco": 78.90,
  "imagem": "https://...",
  "destacado": true,
  "criado_em": "2024-01-15T10:30:00Z",
  "atualizado_em": "2024-01-15T10:30:00Z"
}`
  },
  {
    method: "GET",
    path: "/api/produtos/categoria/{categoria}",
    description: "Lista produtos de uma categoria específica",
    params: [
      { name: "categoria", type: "enum", optional: false, description: "Entradas | Pratos Principais | Sobremesas | Bebidas" }
    ],
    response: `[
  {
    "id": "uuid-string",
    "nome": "Bruschetta Caprese",
    "descricao": "...",
    "categoria": "Entradas",
    "preco": 28.90,
    ...
  }
]`
  },
  {
    method: "POST",
    path: "/api/produtos",
    description: "Cria um novo produto",
    body: `{
  "nome": "Novo Prato",
  "descricao": "Descrição do prato",
  "categoria": "Pratos Principais",
  "preco": 45.90,
  "imagem": "https://...",
  "destacado": false
}`,
    response: `{
  "id": "novo-uuid",
  "nome": "Novo Prato",
  ...
}`
  },
  {
    method: "PUT",
    path: "/api/produtos/{id}",
    description: "Atualiza um produto existente",
    params: [
      { name: "id", type: "string", optional: false, description: "ID do produto a ser atualizado" }
    ],
    body: `{
  "nome": "Nome Atualizado",
  "preco": 49.90
}`,
    response: `{
  "id": "uuid",
  "nome": "Nome Atualizado",
  "preco": 49.90,
  ...
}`
  },
  {
    method: "DELETE",
    path: "/api/produtos/{id}",
    description: "Remove um produto",
    params: [
      { name: "id", type: "string", optional: false, description: "ID do produto a ser removido" }
    ],
    response: `{
  "message": "Produto removido com sucesso",
  "id": "uuid-removido"
}`
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Retorna estatísticas do cardápio",
    params: [],
    response: `{
  "total_produtos": 15,
  "total_entradas": 4,
  "total_pratos_principais": 4,
  "total_sobremesas": 3,
  "total_bebidas": 4,
  "total_destacados": 6
}`
  },
  {
    method: "GET",
    path: "/api/categorias",
    description: "Lista todas as categorias disponíveis",
    params: [],
    response: `[
  { "value": "Entradas", "label": "Entradas" },
  { "value": "Pratos Principais", "label": "Pratos Principais" },
  { "value": "Sobremesas", "label": "Sobremesas" },
  { "value": "Bebidas", "label": "Bebidas" }
]`
  },
  {
    method: "POST",
    path: "/api/seed",
    description: "Popula o banco com 15 produtos de exemplo",
    params: [],
    response: `{
  "message": "15 produtos inseridos com sucesso!"
}`
  }
];

const CodeBlock = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="code-block text-sm overflow-x-auto">
        <code className="text-emerald-400">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const EndpointCard = ({ endpoint }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const methodColors = {
    GET: "api-method get",
    POST: "api-method post",
    PUT: "api-method put",
    DELETE: "api-method delete"
  };

  const testEndpoint = async () => {
    if (endpoint.method !== "GET") {
      toast.info("Use curl ou Postman para testar endpoints POST/PUT/DELETE");
      return;
    }

    setLoading(true);
    try {
      const path = endpoint.path.replace("{id}", "").replace("{categoria}", "Entradas");
      const res = await axios.get(`${API_BASE}${path}`);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success("Requisição bem-sucedida!");
    } catch (error) {
      setResponse(JSON.stringify({ error: error.message }, null, 2));
      toast.error("Erro na requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={methodColors[endpoint.method]}>{endpoint.method}</span>
            <code className="endpoint-path">{endpoint.path}</code>
          </div>
          {endpoint.method === "GET" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={testEndpoint}
              disabled={loading}
              className="text-zinc-400 hover:text-orange-500"
            >
              <Play className="h-4 w-4 mr-1" />
              Testar
            </Button>
          )}
        </div>
        <p className="text-sm text-zinc-500 mt-2">{endpoint.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoint.params && endpoint.params.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Parâmetros</h4>
            <div className="space-y-2">
              {endpoint.params.map((param) => (
                <div key={param.name} className="flex items-start gap-2 text-sm">
                  <code className="text-orange-400 font-mono">{param.name}</code>
                  <span className="text-zinc-600">({param.type})</span>
                  {param.optional && <Badge variant="outline" className="text-xs">opcional</Badge>}
                  <span className="text-zinc-500">- {param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {endpoint.body && (
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Body (JSON)</h4>
            <CodeBlock code={endpoint.body} />
          </div>
        )}

        <div>
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Resposta</h4>
          <CodeBlock code={response || endpoint.response} />
        </div>
      </CardContent>
    </Card>
  );
};

export default function ApiDocsPublic() {
  const [seedLoading, setSeedLoading] = useState(false);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      await axios.post(`${API_BASE}/api/seed`);
      toast.success("Banco populado com 15 produtos!");
    } catch (error) {
      toast.error("Erro ao popular banco de dados");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div data-testid="api-docs-public" className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <ChefHat className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-zinc-50 tracking-tight">Menu API</h1>
              <p className="text-xs text-zinc-500">API Educacional de Restaurante</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
              API REST Educacional
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-50 tracking-tight">
              Documentação da API
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mt-6 leading-relaxed">
              API RESTful para consulta e gerenciamento do cardápio de um restaurante. 
              Ideal para estudantes aprenderem a consumir APIs em aplicações frontend.
            </p>
            <div className="mt-8">
              <Button
                data-testid="btn-seed"
                onClick={handleSeed}
                disabled={seedLoading}
                className="bg-orange-600 hover:bg-orange-500"
              >
                <Database className="h-4 w-4 mr-2" />
                Popular Banco (15 itens)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Quick Start */}
        <Card className="border-zinc-800 bg-zinc-900/50 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-zinc-50 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-orange-500" />
              Início Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-zinc-400">
              A URL base da API é: <code className="text-orange-400 bg-zinc-800 px-2 py-1 rounded">{API_BASE}/api</code>
            </p>
            
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Exemplo com fetch (JavaScript):</h4>
              <CodeBlock code={`// Listar todos os produtos
fetch('${API_BASE}/api/produtos')
  .then(response => response.json())
  .then(data => console.log(data));

// Filtrar por categoria
fetch('${API_BASE}/api/produtos?categoria=Entradas')
  .then(response => response.json())
  .then(data => console.log(data));

// Criar novo produto
fetch('${API_BASE}/api/produtos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Novo Prato',
    descricao: 'Descrição...',
    categoria: 'Pratos Principais',
    preco: 45.90,
    imagem: 'https://...',
    destacado: false
  })
}).then(r => r.json()).then(console.log);`} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Exemplo com curl:</h4>
              <CodeBlock code={`# Listar produtos
curl ${API_BASE}/api/produtos

# Obter estatísticas
curl ${API_BASE}/api/stats

# Popular banco com dados de exemplo
curl -X POST ${API_BASE}/api/seed`} />
            </div>
          </CardContent>
        </Card>

        {/* Data Model */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-50 flex items-center gap-2">
              <Code className="h-5 w-5 text-orange-500" />
              Modelo de Dados - Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Campo</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">id</code></td>
                    <td className="py-3 px-4 text-zinc-500">string (UUID)</td>
                    <td className="py-3 px-4 text-zinc-400">Identificador único do produto</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">nome</code></td>
                    <td className="py-3 px-4 text-zinc-500">string</td>
                    <td className="py-3 px-4 text-zinc-400">Nome do produto</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">descricao</code></td>
                    <td className="py-3 px-4 text-zinc-500">string</td>
                    <td className="py-3 px-4 text-zinc-400">Descrição detalhada</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">categoria</code></td>
                    <td className="py-3 px-4 text-zinc-500">enum</td>
                    <td className="py-3 px-4 text-zinc-400">Entradas | Pratos Principais | Sobremesas | Bebidas</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">preco</code></td>
                    <td className="py-3 px-4 text-zinc-500">float</td>
                    <td className="py-3 px-4 text-zinc-400">Preço em reais (R$)</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">imagem</code></td>
                    <td className="py-3 px-4 text-zinc-500">string (URL)</td>
                    <td className="py-3 px-4 text-zinc-400">URL da imagem do produto</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">destacado</code></td>
                    <td className="py-3 px-4 text-zinc-500">boolean</td>
                    <td className="py-3 px-4 text-zinc-400">Se o produto está em destaque</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 px-4"><code className="text-orange-400">criado_em</code></td>
                    <td className="py-3 px-4 text-zinc-500">datetime (ISO)</td>
                    <td className="py-3 px-4 text-zinc-400">Data de criação</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="text-orange-400">atualizado_em</code></td>
                    <td className="py-3 px-4 text-zinc-500">datetime (ISO)</td>
                    <td className="py-3 px-4 text-zinc-400">Data da última atualização</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-zinc-50">Endpoints Disponíveis</h2>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                Todos
              </TabsTrigger>
              <TabsTrigger value="get" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                GET
              </TabsTrigger>
              <TabsTrigger value="post" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                POST
              </TabsTrigger>
              <TabsTrigger value="put" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                PUT
              </TabsTrigger>
              <TabsTrigger value="delete" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                DELETE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {endpoints.map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>

            <TabsContent value="get" className="space-y-4">
              {endpoints.filter(ep => ep.method === "GET").map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>

            <TabsContent value="post" className="space-y-4">
              {endpoints.filter(ep => ep.method === "POST").map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>

            <TabsContent value="put" className="space-y-4">
              {endpoints.filter(ep => ep.method === "PUT").map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>

            <TabsContent value="delete" className="space-y-4">
              {endpoints.filter(ep => ep.method === "DELETE").map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-zinc-500">
            API para fins educacionais • Ideal para aprender consumo de APIs REST
          </p>
        </div>
      </footer>
    </div>
  );
}
