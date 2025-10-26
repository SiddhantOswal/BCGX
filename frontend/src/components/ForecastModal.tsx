import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productService, ForecastPoint } from '@/services/productService';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const ForecastModal: React.FC<ForecastModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchForecastData();
    }
  }, [isOpen, productId]);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getForecast(productId);
      setForecastData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = forecastData.map(point => ({
    price: point.price,
    demand: point.demand,
    priceLabel: `$${point.price.toFixed(2)}`
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border text-foreground max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Demand Forecast – {productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-muted-foreground">Loading forecast data...</div>
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-destructive text-center">
                <p className="font-medium">Error loading forecast data</p>
                <p className="text-sm mt-1">{error}</p>
                <Button 
                  onClick={fetchForecastData} 
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : forecastData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-muted-foreground">No forecast data available</div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="priceLabel"
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: 11 }}
                    label={{ value: 'Price ($)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#666' } }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: 11 }}
                    label={{ value: 'Demand (units)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number) => [value, 'Demand']}
                    labelFormatter={(label: string) => `Price: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForecastModal;
