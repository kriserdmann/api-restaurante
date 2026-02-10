from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="API Restaurante Educacional", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class Categoria(str, Enum):
    ENTRADAS = "Entradas"
    PRATOS_PRINCIPAIS = "Pratos Principais"
    SOBREMESAS = "Sobremesas"
    BEBIDAS = "Bebidas"

# Models
class Produto(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    descricao: str
    categoria: Categoria
    preco: float
    imagem: str
    destacado: bool = False
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str
    categoria: Categoria
    preco: float
    imagem: str
    destacado: bool = False

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[Categoria] = None
    preco: Optional[float] = None
    imagem: Optional[str] = None
    destacado: Optional[bool] = None

class Stats(BaseModel):
    total_produtos: int
    total_entradas: int
    total_pratos_principais: int
    total_sobremesas: int
    total_bebidas: int
    total_destacados: int

# Dados iniciais para seed
PRODUTOS_INICIAIS = [
    # Entradas
    {
        "nome": "Bruschetta Caprese",
        "descricao": "Fatias de pão italiano tostado com tomate fresco, mussarela de búfala e manjericão",
        "categoria": Categoria.ENTRADAS,
        "preco": 28.90,
        "imagem": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800",
        "destacado": True
    },
    {
        "nome": "Carpaccio de Carne",
        "descricao": "Finas fatias de filé mignon com rúcula, alcaparras e lascas de parmesão",
        "categoria": Categoria.ENTRADAS,
        "preco": 42.90,
        "imagem": "https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=800",
        "destacado": False
    },
    {
        "nome": "Bolinho de Bacalhau",
        "descricao": "Porção com 8 unidades de bolinho artesanal de bacalhau português",
        "categoria": Categoria.ENTRADAS,
        "preco": 38.90,
        "imagem": "https://images.unsplash.com/photo-1604908550665-327f6d8c8093?w=800",
        "destacado": True
    },
    {
        "nome": "Creme de Abóbora",
        "descricao": "Sopa cremosa de abóbora com gengibre e crocante de bacon",
        "categoria": Categoria.ENTRADAS,
        "preco": 24.90,
        "imagem": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800",
        "destacado": False
    },
    # Pratos Principais
    {
        "nome": "Filé Mignon ao Molho Madeira",
        "descricao": "Filé mignon grelhado ao ponto, servido com molho madeira e batatas rústicas",
        "categoria": Categoria.PRATOS_PRINCIPAIS,
        "preco": 78.90,
        "imagem": "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
        "destacado": True
    },
    {
        "nome": "Salmão Grelhado",
        "descricao": "Salmão fresco grelhado com legumes salteados e molho de maracujá",
        "categoria": Categoria.PRATOS_PRINCIPAIS,
        "preco": 72.90,
        "imagem": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
        "destacado": True
    },
    {
        "nome": "Risoto de Camarão",
        "descricao": "Risoto cremoso com camarões rosa, tomate seco e manjericão fresco",
        "categoria": Categoria.PRATOS_PRINCIPAIS,
        "preco": 68.90,
        "imagem": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800",
        "destacado": False
    },
    {
        "nome": "Frango à Parmegiana",
        "descricao": "Peito de frango empanado com molho de tomate caseiro, queijo gratinado e espaguete",
        "categoria": Categoria.PRATOS_PRINCIPAIS,
        "preco": 52.90,
        "imagem": "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800",
        "destacado": False
    },
    # Sobremesas
    {
        "nome": "Petit Gâteau",
        "descricao": "Bolinho de chocolate belga com recheio cremoso, servido com sorvete de baunilha",
        "categoria": Categoria.SOBREMESAS,
        "preco": 32.90,
        "imagem": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
        "destacado": True
    },
    {
        "nome": "Cheesecake de Frutas Vermelhas",
        "descricao": "Cheesecake cremoso com calda de frutas vermelhas frescas",
        "categoria": Categoria.SOBREMESAS,
        "preco": 28.90,
        "imagem": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800",
        "destacado": False
    },
    {
        "nome": "Pudim de Leite",
        "descricao": "Pudim tradicional de leite condensado com calda de caramelo",
        "categoria": Categoria.SOBREMESAS,
        "preco": 18.90,
        "imagem": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800",
        "destacado": False
    },
    # Bebidas
    {
        "nome": "Suco de Laranja Natural",
        "descricao": "Suco de laranja espremido na hora (400ml)",
        "categoria": Categoria.BEBIDAS,
        "preco": 12.90,
        "imagem": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800",
        "destacado": False
    },
    {
        "nome": "Limonada Suíça",
        "descricao": "Limonada refrescante com leite condensado e gelo (500ml)",
        "categoria": Categoria.BEBIDAS,
        "preco": 14.90,
        "imagem": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800",
        "destacado": True
    },
    {
        "nome": "Água de Coco",
        "descricao": "Água de coco natural gelada (500ml)",
        "categoria": Categoria.BEBIDAS,
        "preco": 9.90,
        "imagem": "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800",
        "destacado": False
    },
    {
        "nome": "Refrigerante",
        "descricao": "Lata 350ml - Coca-Cola, Guaraná ou Sprite",
        "categoria": Categoria.BEBIDAS,
        "preco": 7.90,
        "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
        "destacado": False
    }
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "API Restaurante Educacional - Bem-vindo!"}

# Produtos CRUD
@api_router.get("/produtos", response_model=List[Produto])
async def listar_produtos(categoria: Optional[Categoria] = None, destacado: Optional[bool] = None):
    """Lista todos os produtos, com filtros opcionais por categoria e destacado"""
    query = {}
    if categoria:
        query["categoria"] = categoria.value
    if destacado is not None:
        query["destacado"] = destacado
    
    produtos = await db.produtos.find(query, {"_id": 0}).to_list(1000)
    
    for p in produtos:
        if isinstance(p.get('criado_em'), str):
            p['criado_em'] = datetime.fromisoformat(p['criado_em'])
        if isinstance(p.get('atualizado_em'), str):
            p['atualizado_em'] = datetime.fromisoformat(p['atualizado_em'])
    
    return produtos

@api_router.get("/produtos/{produto_id}", response_model=Produto)
async def obter_produto(produto_id: str):
    """Obtém um produto específico pelo ID"""
    produto = await db.produtos.find_one({"id": produto_id}, {"_id": 0})
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    if isinstance(produto.get('criado_em'), str):
        produto['criado_em'] = datetime.fromisoformat(produto['criado_em'])
    if isinstance(produto.get('atualizado_em'), str):
        produto['atualizado_em'] = datetime.fromisoformat(produto['atualizado_em'])
    
    return produto

@api_router.get("/produtos/categoria/{categoria}", response_model=List[Produto])
async def listar_por_categoria(categoria: Categoria):
    """Lista produtos de uma categoria específica"""
    produtos = await db.produtos.find({"categoria": categoria.value}, {"_id": 0}).to_list(1000)
    
    for p in produtos:
        if isinstance(p.get('criado_em'), str):
            p['criado_em'] = datetime.fromisoformat(p['criado_em'])
        if isinstance(p.get('atualizado_em'), str):
            p['atualizado_em'] = datetime.fromisoformat(p['atualizado_em'])
    
    return produtos

@api_router.post("/produtos", response_model=Produto)
async def criar_produto(produto_input: ProdutoCreate):
    """Cria um novo produto"""
    produto = Produto(**produto_input.model_dump())
    
    doc = produto.model_dump()
    doc['criado_em'] = doc['criado_em'].isoformat()
    doc['atualizado_em'] = doc['atualizado_em'].isoformat()
    
    await db.produtos.insert_one(doc)
    return produto

@api_router.put("/produtos/{produto_id}", response_model=Produto)
async def atualizar_produto(produto_id: str, produto_input: ProdutoUpdate):
    """Atualiza um produto existente"""
    produto_existente = await db.produtos.find_one({"id": produto_id}, {"_id": 0})
    if not produto_existente:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    update_data = {k: v for k, v in produto_input.model_dump().items() if v is not None}
    update_data['atualizado_em'] = datetime.now(timezone.utc).isoformat()
    
    await db.produtos.update_one({"id": produto_id}, {"$set": update_data})
    
    produto_atualizado = await db.produtos.find_one({"id": produto_id}, {"_id": 0})
    
    if isinstance(produto_atualizado.get('criado_em'), str):
        produto_atualizado['criado_em'] = datetime.fromisoformat(produto_atualizado['criado_em'])
    if isinstance(produto_atualizado.get('atualizado_em'), str):
        produto_atualizado['atualizado_em'] = datetime.fromisoformat(produto_atualizado['atualizado_em'])
    
    return produto_atualizado

@api_router.delete("/produtos/{produto_id}")
async def deletar_produto(produto_id: str):
    """Remove um produto"""
    result = await db.produtos.delete_one({"id": produto_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"message": "Produto removido com sucesso", "id": produto_id}

# Stats
@api_router.get("/stats", response_model=Stats)
async def obter_estatisticas():
    """Retorna estatísticas dos produtos"""
    total = await db.produtos.count_documents({})
    entradas = await db.produtos.count_documents({"categoria": Categoria.ENTRADAS.value})
    principais = await db.produtos.count_documents({"categoria": Categoria.PRATOS_PRINCIPAIS.value})
    sobremesas = await db.produtos.count_documents({"categoria": Categoria.SOBREMESAS.value})
    bebidas = await db.produtos.count_documents({"categoria": Categoria.BEBIDAS.value})
    destacados = await db.produtos.count_documents({"destacado": True})
    
    return Stats(
        total_produtos=total,
        total_entradas=entradas,
        total_pratos_principais=principais,
        total_sobremesas=sobremesas,
        total_bebidas=bebidas,
        total_destacados=destacados
    )

# Seed
@api_router.post("/seed")
async def popular_dados():
    """Popula o banco com dados iniciais (15 produtos)"""
    # Limpa produtos existentes
    await db.produtos.delete_many({})
    
    # Insere produtos iniciais
    for prod_data in PRODUTOS_INICIAIS:
        produto = Produto(**prod_data)
        doc = produto.model_dump()
        doc['criado_em'] = doc['criado_em'].isoformat()
        doc['atualizado_em'] = doc['atualizado_em'].isoformat()
        await db.produtos.insert_one(doc)
    
    return {"message": f"{len(PRODUTOS_INICIAIS)} produtos inseridos com sucesso!"}

# Categorias
@api_router.get("/categorias")
async def listar_categorias():
    """Lista todas as categorias disponíveis"""
    return [{"value": c.value, "label": c.value} for c in Categoria]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
