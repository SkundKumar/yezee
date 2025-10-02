import { getProducts, getCategoryBySlug } from "@/actions/products"; // Import the new function
import ProductGrid from "@/components/ProductGrid";

type Props = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: Props) {
  // 1. First, get the category details using the slug from the URL
  const category = await getCategoryBySlug(params.slug);
  
  let products = [];
  // 2. If the category was found, use its ID to fetch the products
  if (category) {
    products = await getProducts({ category: category.id });
  }

  // 3. Display the products using the ProductGrid component
  return (
    <div>
      <h1 className="text-4xl font-bold text-center my-8 capitalize">
        {category ? category.name : params.slug.replace('-', ' ')}
      </h1>
      
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-center">No products found in this category.</p>
      )}
    </div>
  );
}