import { categoryImages, demoProducts } from '@/utils/data';

const titleCase = (value = '') =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getProductCategorySlug = (product) => {
  if (typeof product?.category === 'string') {
    return product.category;
  }

  return product?.category?.slug || '';
};

export function normalizeProduct(product) {
  const categorySlug = getProductCategorySlug(product);
  const categoryName = product?.category?.name || titleCase(categorySlug);
  const categoryId =
    product?.category?._id?.toString?.() ||
    product?.categoryId?.toString?.() ||
    (typeof product?.category === 'string' ? product.category : '');

  return {
    ...product,
    _id: product?._id?.toString?.() || product?._id,
    category: categorySlug,
    categoryId,
    categoryName,
    categorySlug,
  };
}

export function buildDemoCategories() {
  return Object.keys(categoryImages).map((slug) => ({
    _id: slug,
    name: titleCase(slug),
    slug,
    thumbnail: categoryImages[slug],
    banner: categoryImages[slug],
    description: '',
    isActive: true,
  }));
}

export function getDemoProducts({ search, category, limit } = {}) {
  const normalizedSearch = search?.trim().toLowerCase() || '';
  const normalizedCategory = category?.trim().toLowerCase() || '';

  let products = demoProducts.map(normalizeProduct);

  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.shortDescription,
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }

  if (normalizedCategory) {
    products = products.filter(
      (product) =>
        product.categorySlug?.toLowerCase() === normalizedCategory ||
        product.categoryName?.toLowerCase() === normalizedCategory
    );
  }

  if (limit > 0) {
    products = products.slice(0, limit);
  }

  return products;
}
