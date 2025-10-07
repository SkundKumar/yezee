'use client'
import { useState } from 'react';
import { Heart, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/providers/wishlist-context'

type Props = {
  products: any[]
}

const ProductGrid = ({ products }: Props) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {Array.isArray(products) && products.map((product) => (
          <div 
            key={product.id} 
            className="group relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 group-hover:opacity-75">
                <Image
                  src={hoveredProduct === product.id && product.images?.[1]?.src ? product.images[1].src : (product.images?.[0]?.src || '/placeholder.svg')}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex justify-between items-start">
                <h3 className="text-base font-semibold text-primary">
                  {product.name}
                </h3>
                <div>
                  {product.on_sale ? (
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-red-600">
                        ₹{product.sale_price}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        ₹{product.regular_price}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base font-semibold text-primary">
                      ₹{product.price}
                    </p>
                  )}
                </div>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Truck className="h-4 w-4" />
              <span>Delivery in 5-6 days</span>
            </div>
            
            <button
              onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
              aria-label="Add to wishlist"
            >
              <Heart 
                className={`h-5 w-5 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                fill={isInWishlist(product.id) ? 'currentColor' : 'none'} 
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductGrid