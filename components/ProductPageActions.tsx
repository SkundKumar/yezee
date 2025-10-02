'use client';

import { useCart } from "@/hooks/use-cart";
import { WishlistButton } from "./WishlistButton";

export function ProductPageActions({ product }: { product: any }) {
  const { addItem } = useCart();

  return (
    <div className="flex items-center gap-4 mt-4">
        <button
            onClick={() => addItem(product)}
            className="flex-1 p-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
            Add to Cart
        </button>
        <WishlistButton productId={product.id} />
    </div>
  );
}