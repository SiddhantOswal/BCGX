import { useNavigate } from "react-router-dom";
import { Package, TrendingUp } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="text-4xl font-bold">
              <span className="text-foreground">BCG</span>
              <span className="text-primary">X</span>
            </span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Price Optimization Tool
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
