
import { getCategoryBySlug, getProducts } from '@/actions/products';
import ProductGrid from '@/components/ProductGrid';
import { FadeIn } from '@/components/ui/animation';

export default async function CategoryPage({ params: { slug } }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(slug);
  const products = await getProducts({ category: category.id });

  return (
    <FadeIn>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">{category.name}</h1>
            <ProductGrid products={products} />
        </div>
    </FadeIn>
  );
}
