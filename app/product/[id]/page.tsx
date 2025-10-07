import { getProduct, getProducts } from '@/actions/products';
import ProductImageGallery from '@/components/ProductImageGallery';
import { ProductPageActions } from '@/components/ProductPageActions';
import RelatedProducts from '@/components/RelatedProducts';
import { Truck } from 'lucide-react';

const ProductPage = async ({ params: { id } }: { params: { id: string } }) => {
  // 1. Fetch the main product
  const product = await getProduct(id);

  // Handle case where product is not found
  if (!product) {
    return <div className="container mx-auto text-center py-12">Product not found.</div>;
  }

  // 2. Fetch the related products using the IDs
  let relatedProducts = [];
  if (product.related_ids && product.related_ids.length > 0) {
    relatedProducts = await getProducts({ include: product.related_ids });
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Column - Now using the gallery component */}
        <div className="lg:col-span-1 sticky top-24">
            <ProductImageGallery images={product.images} />
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
