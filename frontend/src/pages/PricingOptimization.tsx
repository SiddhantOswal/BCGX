import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimizedPrices } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";

const PricingOptimization = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { optimizedProducts, loading, error } = useOptimizedPrices();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (optimizedProducts.length === 0) {
      toast({
        title: "No Products",
        description: "No products available to save optimized prices.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Update each product with its optimized price
      for (const product of optimizedProducts) {
        try {
        await productService.updateProduct(product.id, {
          selling_price: product.optimized_price,
          optimized_price: product.optimized_price,
        });
          successCount++;
        } catch (error) {
          console.error(`Failed to update product ${product.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Prices Updated",
          description: `Successfully updated ${successCount} product${successCount > 1 ? 's' : ''} with optimized prices.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Some Updates Failed",
          description: `Failed to update ${errorCount} product${errorCount > 1 ? 's' : ''}. Please try again.`,
          variant: "destructive",
        });
      }

      // Navigate back to products page after successful save
      if (errorCount === 0) {
        navigate("/create");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save optimized prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/create");
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
            onClick={() => navigate("/")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Pricing Optimization</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <div className="bg-muted rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/50">
                  <th className="p-4 text-left text-foreground font-semibold">Product Name</th>
                  <th className="p-4 text-left text-foreground font-semibold">Product Category</th>
                  <th className="p-4 text-left text-foreground font-semibold">Description</th>
                  <th className="p-4 text-left text-foreground font-semibold">Cost Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Selling Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Optimized Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Max Profit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading optimized prices...
                    </td>
                  </tr>
                ) : optimizedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No optimized prices available
                    </td>
                  </tr>
                ) : (
                  optimizedProducts.map((product) => (
                    <tr key={product.id} className="border-t border-border">
                      <td className="p-4 text-foreground">{product.name}</td>
                      <td className="p-4 text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-muted-foreground max-w-md">
                        {product.description || "No description"}
                      </td>
                      <td className="p-4 text-foreground">${product.cost_price.toFixed(2)}</td>
                      <td className="p-4 text-foreground">${product.selling_price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="text-primary font-semibold text-lg">
                          ${product.optimized_price.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-semibold">
                          ${product.max_profit.toFixed(2)}
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
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSaving || loading}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingOptimization;