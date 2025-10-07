
import { getProducts } from '@/actions/products';
import { getCategories } from "@/actions/products";
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import { FadeIn } from '@/components/ui/animation';

export default async function Home() {
  const categories = await getCategories();

  return (
    <FadeIn>
        <div>
            <CategoryGrid categories={categories} />
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
                
            </div>
        </div>
    </FadeIn>
  );
};


