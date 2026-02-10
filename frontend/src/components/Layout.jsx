import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Plus, 
  FileCode2,
  ChefHat
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/produtos", icon: UtensilsCrossed, label: "Produtos" },
  { to: "/produtos/novo", icon: Plus, label: "Novo Produto" },
  { to: "/documentacao", icon: FileCode2, label: "Documentação API" },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <ChefHat className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-zinc-50 tracking-tight">Menu API</h1>
              <p className="text-xs text-zinc-500">Painel Educacional</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== "/" && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "active bg-zinc-800/50 text-orange-500" 
                    : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/30"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-600 text-center">
            <p>API para fins educacionais</p>
            <p className="mt-1 text-zinc-500">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen bg-zinc-950">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
