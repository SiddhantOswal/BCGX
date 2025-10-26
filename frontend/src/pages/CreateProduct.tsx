import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/hooks/useProducts";
import { ProductCreate, Product, ProductUpdate, ForecastSummary } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";

const CreateProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [withDemandForecast, setWithDemandForecast] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastSummary[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  
  const { products, loading, error, createProduct, updateProduct, deleteProduct, refreshProducts } = useProducts(
    searchTerm || undefined,
    selectedCategory !== "all" ? selectedCategory : undefined
  );

  const [newProduct, setNewProduct] = useState<ProductCreate>({
    name: "",
    category: "",
    cost_price: 0,
    selling_price: 0,
    description: "",
    stock_available: 0,
    units_sold: 0,
  });

  // Fetch forecast data when toggle is turned on
  useEffect(() => {
    if (withDemandForecast) {
      setLoadingForecast(true);
      productService.getForecastSummary()
        .then(data => {
          setForecastData(data);
        })
        .catch(error => {
          console.error('Failed to fetch forecast data:', error);
          toast({
            title: "Error",
            description: "Failed to load forecast data",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoadingForecast(false);
        });
    } else {
      setForecastData([]);
    }
  }, [withDemandForecast, toast]);

  // Helper function to get forecast data for a specific product
  const getProductForecast = (productId: string): number | null => {
    const forecast = forecastData.find(f => f.product_id === productId);
    return forecast ? forecast.forecast_demand : null;
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.category || newProduct.cost_price <= 0 || newProduct.selling_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    if (newProduct.selling_price < newProduct.cost_price) {
      toast({
        title: "Error",
        description: "Selling price must be greater than or equal to cost price",
        variant: "destructive",
      });
      return;
    }

    const result = await createProduct(newProduct);
    if (result) {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setShowAddDialog(false);
      setNewProduct({
        name: "",
        category: "",
        cost_price: 0,
        selling_price: 0,
        description: "",
        stock_available: 0,
        units_sold: 0,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const result = await deleteProduct(id);
      if (result) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        setShowDeleteDialog(false);
        setProductToDelete(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Handle 404 or other errors by refreshing the product list
      if (error.response?.status === 404) {
        toast({
          title: "Product Not Found",
          description: "This product may have already been deleted. Refreshing the list...",
          variant: "destructive",
        });
        // Refresh the product list
        await refreshProducts();
        setShowDeleteDialog(false);
        setProductToDelete(null);
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.detail || "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      description: product.description || "",
      stock_available: product.stock_available,
      units_sold: product.units_sold,
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !newProduct.name || !newProduct.category || newProduct.cost_price <= 0 || newProduct.selling_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    if (newProduct.selling_price < newProduct.cost_price) {
      toast({
        title: "Error",
        description: "Selling price must be greater than or equal to cost price",
        variant: "destructive",
      });
      return;
    }

    const updateData: ProductUpdate = {
      name: newProduct.name,
      category: newProduct.category,
      cost_price: newProduct.cost_price,
      selling_price: newProduct.selling_price,
      description: newProduct.description,
      stock_available: newProduct.stock_available,
      units_sold: newProduct.units_sold,
    };

    const result = await updateProduct(selectedProduct.id, updateData);
    if (result) {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setShowEditDialog(false);
      setSelectedProduct(null);
      setNewProduct({
        name: "",
        category: "",
        cost_price: 0,
        selling_price: 0,
        description: "",
        stock_available: 0,
        units_sold: 0,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const categories = [
    "Electronics",
    "Wearables", 
    "Outdoor & Sports",
    "Apparel",
    "Home Automation",
    "Transportation",
    "Stationary"
  ];

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
            <span className="text-sm text-muted-foreground">Welcome, User</span>
            <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create and Manage Product</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Switch
                checked={withDemandForecast}
                onCheckedChange={setWithDemandForecast}
                disabled={loadingForecast}
              />
              With Demand Forecast
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border text-foreground">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Products
            </Button>
            <Button
              onClick={() => navigate("/forecast")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Demand Forecast
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/50">
                  <th className="p-4 text-left">
                    <Checkbox />
                  </th>
                  <th className="p-4 text-left text-foreground font-semibold">Product Name</th>
                  <th className="p-4 text-left text-foreground font-semibold">Product Category</th>
                  <th className="p-4 text-left text-foreground font-semibold">Cost Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Selling Price</th>
                  <th className="p-4 text-left text-foreground font-semibold">Description</th>
                  <th className="p-4 text-left text-foreground font-semibold">Available Stock</th>
                  <th className="p-4 text-left text-foreground font-semibold">Units Sold</th>
                  {withDemandForecast && (
                    <th className="p-4 text-left text-foreground font-semibold">Calculated Demand Forecast</th>
                  )}
                  <th className="p-4 text-left text-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={withDemandForecast ? 10 : 9} className="p-8 text-center text-muted-foreground">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={withDemandForecast ? 10 : 9} className="p-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-t border-border ${
                        selectedProducts.includes(product.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td className="p-4 text-foreground">{product.name}</td>
                      <td className="p-4 text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-foreground">${product.cost_price.toFixed(2)}</td>
                      <td className="p-4 text-foreground">${product.selling_price.toFixed(2)}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">
                        {product.description || "No description"}
                      </td>
                      <td className="p-4 text-foreground">{product.stock_available.toLocaleString()}</td>
                      <td className="p-4 text-foreground">{product.units_sold.toLocaleString()}</td>
                      {withDemandForecast && (
                        <td className="p-4">
                          {loadingForecast ? (
                            <span className="text-muted-foreground">Loading...</span>
                          ) : (
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded">
                              {getProductForecast(product.id)?.toLocaleString() || "N/A"}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => handleViewProduct(product)}
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => handleEditProduct(product)}
                            title="Edit Product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => confirmDeleteProduct(product)}
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" className="border-border text-foreground">
            Cancel
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save
          </Button>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-muted border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name:</Label>
              <Input 
                id="productName" 
                className="bg-background border-border"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Product Category:</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Cost Price:</Label>
                <Input 
                  id="costPrice" 
                  type="number"
                  step="0.01"
                  className="bg-background border-border"
                  value={newProduct.cost_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price:</Label>
                <Input 
                  id="sellingPrice" 
                  type="number"
                  step="0.01"
                  className="bg-background border-border"
                  value={newProduct.selling_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description:</Label>
              <Textarea 
                id="description" 
                className="bg-background border-border"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Available Stock:</Label>
                <Input 
                  id="stock" 
                  type="number"
                  className="bg-background border-border"
                  value={newProduct.stock_available}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock_available: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitsSold">Units Sold:</Label>
                <Input 
                  id="unitsSold" 
                  type="number"
                  className="bg-background border-border"
                  value={newProduct.units_sold}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, units_sold: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateProduct}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-muted border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Product Name:</Label>
                <p className="text-foreground font-medium">{selectedProduct.name}</p>
              </div>
              <div className="grid gap-2">
                <Label>Category:</Label>
                <p className="text-foreground">{selectedProduct.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cost Price:</Label>
                  <p className="text-foreground">${selectedProduct.cost_price.toFixed(2)}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price:</Label>
                  <p className="text-foreground">${selectedProduct.selling_price.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description:</Label>
                <p className="text-foreground">{selectedProduct.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Available Stock:</Label>
                  <p className="text-foreground">{selectedProduct.stock_available.toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Units Sold:</Label>
                  <p className="text-foreground">{selectedProduct.units_sold.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-muted border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editProductName">Product Name:</Label>
              <Input 
                id="editProductName" 
                className="bg-background border-border"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCategory">Product Category:</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editCostPrice">Cost Price:</Label>
                <Input 
                  id="editCostPrice" 
                  type="number"
                  step="0.01"
                  className="bg-background border-border"
                  value={newProduct.cost_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSellingPrice">Selling Price:</Label>
                <Input 
                  id="editSellingPrice" 
                  type="number"
                  step="0.01"
                  className="bg-background border-border"
                  value={newProduct.selling_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description:</Label>
              <Textarea 
                id="editDescription" 
                className="bg-background border-border"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editStock">Available Stock:</Label>
                <Input 
                  id="editStock" 
                  type="number"
                  className="bg-background border-border"
                  value={newProduct.stock_available}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock_available: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editUnitsSold">Units Sold:</Label>
                <Input 
                  id="editUnitsSold" 
                  type="number"
                  className="bg-background border-border"
                  value={newProduct.units_sold}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, units_sold: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleUpdateProduct}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-muted border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          {productToDelete && (
            <div className="py-4">
              <p className="text-foreground mb-4">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>?
              </p>
              <p className="text-muted-foreground text-sm">
                This action cannot be undone.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => productToDelete && handleDeleteProduct(productToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProduct;