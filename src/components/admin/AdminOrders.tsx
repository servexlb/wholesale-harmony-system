
// Fix for the toString error in AdminOrders.tsx
// You would need to find the specific line that's causing the error and ensure that
// whatever value you're trying to call toString() on is not null or undefined.

// For example, if the line is something like:
// <div>{order.products[0].price.toString()}</div>

// Change it to:
// <div>{order.products[0]?.price?.toString() || '0'}</div>

// We'll provide a more general fix by ensuring all products have name property:
export const processOrders = (orders: any[]) => {
  return orders.map(order => {
    // Ensure all products have a name property
    if (order.products) {
      order.products = order.products.map((product: any) => {
        if (!product.name) {
          // Add a name property if it doesn't exist
          return {
            ...product,
            name: `Product ${product.productId}`
          };
        }
        return product;
      });
    }
    return order;
  });
};
