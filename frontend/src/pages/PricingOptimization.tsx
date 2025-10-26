import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">
              <span className="text-white">BCG</span>
              <span className="text-emerald-400">X</span>
            </span>
            <span className="text-emerald-400 font-semibold">Price Optimization Tool</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white">Welcome, Rakesh</span>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6">
        <div className="flex items-center gap-4 mb-6 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-emerald-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Pricing Optimization</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black">
                  <th className="p-4 text-left text-white font-semibold">Product Name</th>
                  <th className="p-4 text-left text-white font-semibold">Product Category</th>
                  <th className="p-4 text-left text-white font-semibold">Description</th>
                  <th className="p-4 text-left text-white font-semibold">Cost Price</th>
                  <th className="p-4 text-left text-white font-semibold">Selling Price</th>
                  <th className="p-4 text-left text-white font-semibold">Optimized Price</th>
                  <th className="p-4 text-left text-white font-semibold">Max Profit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Loading optimized prices...
                    </td>
                  </tr>
                ) : optimizedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No optimized prices available
                    </td>
                  </tr>
                ) : (
                  optimizedProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`border-t border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-4 text-gray-800">{product.name}</td>
                      <td className="p-4 text-gray-600">{product.category}</td>
                      <td className="p-4 text-gray-600 max-w-md">
                        {product.description || "No description"}
                      </td>
                      <td className="p-4 text-gray-800">${product.cost_price.toFixed(2)}</td>
                      <td className="p-4 text-gray-800">${product.selling_price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="text-emerald-600 font-semibold text-lg">
                          ${product.optimized_price.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded font-semibold">
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
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
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