'use client';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  categories: any[];
}

const CategoryGrid = ({ categories }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Shop by Category</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.isArray(categories) && categories.map((category) => (
          // We filter out the default "Uncategorized" category
          category.slug !== 'uncategorized' && (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className="group relative border rounded-lg overflow-hidden text-center hover:shadow-xl transition-shadow"
            >
              <div className="aspect-square w-full relative">
                <Image
                  src={category.image?.src || '/placeholder.svg'}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4 bg-white">
                <h2 className="text-lg font-semibold">{category.name}</h2>
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid;