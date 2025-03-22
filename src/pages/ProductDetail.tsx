import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Product, getProductById, products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, CreditCard } from 'lucide-react';
import { toast } from '@/lib/toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    if (id) {
      // Simulate API loading
      setLoading(true);
      setTimeout(() => {
        const foundProduct = getProductById(id);
        setProduct(foundProduct || null);
        setLoading(false);
      }, 500);
    }
  }, [id]);
  
  const handleAddToCart = () => {
    toast.success(`Added to cart`, {
      description: `${quantity} × ${product?.name}`,
      action: {
        label: 'View Cart',
        onClick: () => console.log('View cart'),
      },
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 container mx-auto max-w-7xl flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 container mx-auto max-w-7xl flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Shop
            </Link>
          </Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-6 container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-lg shadow-sm">
          {/* Product Image */}
          <motion.div 
            className="relative overflow-hidden rounded-lg bg-muted aspect-square"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`absolute inset-0 bg-gray-100 animate-pulse ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`} />
            <img 
              src={product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover object-center ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
          
          {/* Product Details */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-2">
              <span className="inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
            
            <div className="mt-2 mb-6">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            </div>
            
            <div className="prose prose-sm mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>
            
            <div className="mt-auto space-y-6">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 text-lg font-medium w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  size="lg"
                >
                  Buy Later
                </Button>
              </div>
              
              <div className="border-t pt-6 flex items-center text-sm text-muted-foreground">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                In stock & ready to ship
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Related Products */}
        <section className="my-20">
          <h2 className="text-2xl font-semibold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* We would show related products here, just showing the first 3 for now */}
            {products.filter(p => p.id !== product.id).slice(0, 3).map(relatedProduct => (
              <div key={relatedProduct.id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover-lift">
                <Link to={`/products/${relatedProduct.id}`}>
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {relatedProduct.category}
                    </span>
                    <h3 className="mt-1 text-lg font-medium">{relatedProduct.name}</h3>
                    <p className="mt-2 font-semibold">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Wholesale System</h3>
              <p className="text-muted-foreground">
                Premium products for discerning customers and wholesale partners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/wholesale" className="text-muted-foreground hover:text-primary transition-colors">
                    Wholesale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <p className="text-muted-foreground">
                123 Design Street<br />
                Creativity City, CO 12345<br />
                info@wholesalesystem.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Wholesale System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
