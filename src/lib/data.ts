
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  products: {
    productId: string;
    quantity: number;
    priceAtSale: number;
  }[];
  total: number;
  paid: boolean;
}

// Mock data
export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Ceramic Vase",
    description: "Handcrafted ceramic vase with a modern, minimalist design.",
    price: 89.99,
    wholesalePrice: 49.99,
    image: "https://images.unsplash.com/photo-1602748828300-57c35baaef48?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p2",
    name: "Artisanal Coffee Mug",
    description: "Handmade ceramic mug with a unique glazed finish.",
    price: 34.99,
    wholesalePrice: 19.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
    category: "Kitchenware"
  },
  {
    id: "p3",
    name: "Minimalist Wall Clock",
    description: "Simple yet elegant wall clock with a silent quartz movement.",
    price: 59.99,
    wholesalePrice: 32.99,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p4",
    name: "Natural Linen Throw Pillow",
    description: "Soft, natural linen pillow cover with a feather insert.",
    price: 49.99,
    wholesalePrice: 28.99,
    image: "https://images.unsplash.com/photo-1592789705501-f9ae4287c4a9?q=80&w=1000&auto=format&fit=crop",
    category: "Textiles"
  },
  {
    id: "p5",
    name: "Handwoven Basket",
    description: "Traditional handwoven basket made from sustainable materials.",
    price: 79.99,
    wholesalePrice: 42.99,
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=1000&auto=format&fit=crop",
    category: "Storage"
  },
  {
    id: "p6",
    name: "Glass Terrarium",
    description: "Geometric glass terrarium for displaying small plants and succulents.",
    price: 69.99,
    wholesalePrice: 38.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop",
    category: "Plants"
  },
];

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Jane Smith",
    phone: "+1 (555) 123-4567",
    email: "jane@example.com",
    company: "Smith Home Goods",
    notes: "Prefers delivery on Tuesdays"
  },
  {
    id: "c2",
    name: "Michael Johnson",
    phone: "+1 (555) 987-6543",
    email: "michael@example.com",
    company: "Urban Living Co.",
    notes: ""
  },
  {
    id: "c3",
    name: "Emma Williams",
    phone: "+1 (555) 456-7890",
    email: "emma@example.com",
    company: "Williams Decor",
    notes: "New customer as of Jan 2023"
  },
];

export const sales: Sale[] = [
  {
    id: "s1",
    customerId: "c1",
    date: "2023-05-15",
    products: [
      { productId: "p1", quantity: 5, priceAtSale: 49.99 },
      { productId: "p3", quantity: 3, priceAtSale: 32.99 }
    ],
    total: 348.92,
    paid: true
  },
  {
    id: "s2",
    customerId: "c2",
    date: "2023-05-20",
    products: [
      { productId: "p2", quantity: 10, priceAtSale: 19.99 },
      { productId: "p4", quantity: 8, priceAtSale: 28.99 }
    ],
    total: 431.82,
    paid: true
  },
  {
    id: "s3",
    customerId: "c3",
    date: "2023-06-01",
    products: [
      { productId: "p5", quantity: 4, priceAtSale: 42.99 },
      { productId: "p6", quantity: 6, priceAtSale: 38.99 }
    ],
    total: 405.90,
    paid: false
  },
];

// Authentication simulation
const WHOLESALE_PASSWORD = "0000";

export const checkWholesalePassword = (password: string): boolean => {
  return password === WHOLESALE_PASSWORD;
};

// Wholesale utils
export const calculateTotalSales = (): number => {
  return sales.reduce((total, sale) => total + (sale.paid ? sale.total : 0), 0);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getSalesByCustomerId = (customerId: string): Sale[] => {
  return sales.filter(sale => sale.customerId === customerId);
};
