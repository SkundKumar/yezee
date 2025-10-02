'use server'
import WooCommerceRestApi from 'woocommerce-rest-ts-api'

const WooCommerce = new WooCommerceRestApi({
  url: 'http://e-com.local/',
  consumerKey: process.env.WC_CONSUMER_KEY as string,
  consumerSecret: process.env.WC_CONSUMER_SECRET as string,
  version: 'wc/v3',
})

// This function can now accept filter options
export const getProducts = async (options = {}) => {
  try {
    const products = await WooCommerce.get('products', options)
    return products.data
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return an empty array on error
  }
}

// This function is updated to correctly fetch a single product by its ID
export const getProduct = async (id: string) => {
  try {
    const product = await WooCommerce.get(`products/${id}`)
    return product.data
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null; // Return null on error
  }
}

export const getCategories = async () => {
  try {
    const { data } = await WooCommerce.get('products/categories');
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    // This fetches the category details using the slug
    const { data } = await WooCommerce.get('products/categories', { slug: slug });
    // The API returns an array, so we return the first item
    return data[0]; 
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
};