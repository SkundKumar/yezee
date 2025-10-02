import { getProduct, getProducts } from '@/actions/products';
import { ProductPageActions } from '@/components/ProductPageActions';
import RelatedProducts from '@/components/RelatedProducts';
import Image from 'next/image';
import Link from 'next/link';
import { Truck } from 'lucide-react';

const ProductPage = async ({ params: { id } }: { params: { id: string } }) => {
  // 1. Fetch the main product
  const product = await getProduct(id);

  // 2. Fetch the related products using the IDs
  let relatedProducts = [];
  if (product.related_ids && product.related_ids.length > 0) {
    relatedProducts = await getProducts({ include: product.related_ids });
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Column */}
        <div className="lg:col-span-1">
          {product.images?.[0]?.src && (
            <div className="aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 sticky top-24">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                width={600}
                height={600}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div>
                {product.on_sale ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-red-600">
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

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Truck className="h-4 w-4" />
            <span>Delivery in 5-6 days</span>
          </div>

          <ProductPageActions product={product} />

          {/* --- ADD THIS BLOCK TO SHOW THE DESCRIPTION --- */}
          <div
            className="text-gray-700 mt-6 prose"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          
        </div>
      </div>

      {/* 3. Render the Related Products section */}
      {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
      )}

    </div>
  );
}

export default ProductPage;