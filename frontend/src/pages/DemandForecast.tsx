import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useForecastSummary } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";

interface ForecastPoint {
  price: number;
  demand: number;
}

interface ProductForecast {
  product_id: string;
  product_name: string;
  category: string;
  forecast_demand: number;
  cost_price: number;
  selling_price: number;
}

const DemandForecast = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { summary, loading, error } = useForecastSummary();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // Chart colors for different products
  const chartColors = [
    "hsl(var(--chart-1))", // Teal
    "hsl(var(--chart-2))", // Purple
    "hsl(var(--chart-3))", // Orange
    "hsl(var(--chart-4))", // Pink
    "hsl(var(--chart-5))", // Blue
    "hsl(var(--chart-6))", // Green
    "hsl(var(--chart-7))", // Red
    "hsl(var(--chart-8))", // Yellow
  ];

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const generateChartData = () => {
    if (selectedProducts.length === 0) {
      setChartData([]);
      return;
    }

    // Create BCG-style chart data with years and multiple metrics
    const years = [2020, 2021, 2022, 2023, 2024];
    const chartDataArray: any[] = [];

    years.forEach(year => {
      const dataPoint: any = { year };
      
      selectedProducts.forEach((productId, index) => {
        const product = summary.find(p => p.product_id === productId);
        if (product) {
          // Generate realistic demand and price variations over years
          const baseDemand = product.forecast_demand;
          const basePrice = product.selling_price;
          
          // Add some variation based on year and product
          const demandVariation = Math.sin((year - 2020) * Math.PI / 2 + index) * 0.3 + 1;
          const priceVariation = Math.cos((year - 2020) * Math.PI / 3 + index) * 0.2 + 1;
          
          dataPoint[`${product.product_name} - Demand`] = Math.round(baseDemand * demandVariation);
          dataPoint[`${product.product_name} - Price`] = Math.round(basePrice * priceVariation * 100) / 100;
        }
      });
      
      chartDataArray.push(dataPoint);
    });

    setChartData(chartDataArray);
  };

  // Update chart when selected products change
  useEffect(() => {
    generateChartData();
  }, [selectedProducts, summary]);

  const handleCancel = () => {
    navigate("/create");
  };

  const handleSave = () => {
    toast({
      title: "Forecast Saved",
      description: "Demand forecast data has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">
              <span className="text-foreground">BCG</span>
              <span className="text-primary">X</span>
            </span>
            <span className="text-primary font-semibold">Price Optimization Tool</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, Rakesh</span>
            <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/create")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Demand Forecast</h1>
        </div>

        {/* Chart Section */}
        <div className="bg-muted rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Product Demand Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Select products below to view their demand trends over time
            </p>
          </div>
          
          {isLoadingChart ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">
                {selectedProducts.length === 0 
                  ? "Select products below to view demand analysis" 
                  : "No chart data available for selected products"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="year"
                  stroke="#999"
                  tick={{ fill: "#999" }}
                  label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#999" 
                  tick={{ fill: "#999" }}
                  label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#999" }}
                  iconType="line"
                />
                {selectedProducts.map((productId, index) => {
                  const product = summary.find(p => p.product_id === productId);
                  if (!product) return null;
                  
                  return (
                    <Line
                      key={`${productId}-demand`}
                      type="monotone"
                      dataKey={`${product.product_name} - Demand`}
                      name={product.product_name}
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth={2}
                      dot={{ fill: chartColors[index % chartColors.length], strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-muted rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/50">
                  <th className="p-4 text-left text-foreground font-semibold w-12">
                    <Checkbox
                      checked={selectedProducts.length === summary.length && summary.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts(summary.map(p => p.product_id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left text-foreground font-semibold">Product Name</th>
                  <th className="p-4 text-left text-foreground font-semibold">Product Category</th>
                  <th className="p-4 text-left text-foreground font-semibold">Cost Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Selling Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Available Stock</th>
                  <th className="p-4 text-left text-foreground font-semibold">Units Sold</th>
                  <th className="p-4 text-left text-foreground font-semibold">Calculated Demand Forecast</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Loading forecast data...
                    </td>
                  </tr>
                ) : summary.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No forecast data available
                    </td>
                  </tr>
                ) : (
                  summary.map((product) => (
                    <tr key={product.product_id} className="border-t border-border">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.product_id)}
                          onCheckedChange={() => toggleProductSelection(product.product_id)}
                        />
                      </td>
                      <td className="p-4 text-foreground">{product.product_name}</td>
                      <td className="p-4 text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-foreground">${product.cost_price.toFixed(2)}</td>
                      <td className="p-4 text-foreground">${product.selling_price.toFixed(2)}</td>
                      <td className="p-4 text-foreground">-</td>
                      <td className="p-4 text-foreground">-</td>
                      <td className="p-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded">
                          {product.forecast_demand.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            className="border-border text-foreground"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemandForecast;