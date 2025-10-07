
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 relative">
                    <Image
                        src={product.images?.[0]?.src || '/placeholder.svg'}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={`w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105 ${hoveredProduct === product.id && product.images?.[1]?.src ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {product.images?.[1]?.src && (
                        <Image
                        src={product.images[1].src}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>
            </Link>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <Link href={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-900">₹{product.price}</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 z-10">
                <button 
                    onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ProductGrid
