import { useNavigate } from "react-router-dom";
import { Package, TrendingUp, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const tiles = [
    {
      title: "Create and Manage Product",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: Package,
      path: "/create",
    },
    {
      title: "Pricing Optimization",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: TrendingUp,
      path: "/pricing",
    },
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header with user info and logout */}
      <div className="w-full px-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">
              <span className="text-white">BCG</span>
              <span className="text-emerald-500">X</span>
            </span>
            <span className="text-emerald-500 font-semibold">Price Optimization Tool</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white">
              <span>{user?.full_name}</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                {user?.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-6">
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="text-4xl font-bold">
              <span className="text-white">BCG</span>
              <span className="text-emerald-500">X</span>
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Price Optimization Tool
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {tiles.map((tile) => (
            <button
              key={tile.path}
              onClick={() => navigate(tile.path)}
              className="group bg-card hover:bg-card/90 rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
            >
              <div className="mb-6">
                <tile.icon className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {tile.title}
              </h2>
              <p className="text-card-foreground/70 mb-6 leading-relaxed">
                {tile.description}
              </p>
              <div className="flex items-center text-card-foreground group-hover:translate-x-2 transition-transform">
                <span className="text-2xl">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
