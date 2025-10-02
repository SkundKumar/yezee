import { getCategories } from "@/actions/products";
import CategoryGrid from "@/components/CategoryGrid"; // We will create this next

export default async function Home() {
  const categories = await getCategories();

  return (
    <CategoryGrid categories={categories} />
  );
}