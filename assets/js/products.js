export const PRODUCTS = Object.freeze([
  {
    id: 'crisples-dried-apple-crisps',
    name: 'Crisples Dried Apple Crisps',
    shortName: 'Crisples',
    eyebrow: 'The everyday apple crunch',
    description: 'Thin dried apple crisps with a naturally satisfying bite—made for desks, bags, picnics, and every break in between.',
    detail: 'A bright, uncomplicated apple snack with a crisp texture and natural sweetness. Enjoy it straight from the pack or pair it with a favorite dip or breakfast bowl.',
    price: null,
    images: [
      'generated/product/crisples-product-white-01.webp',
      'generated/product/crisples-product-cream-02.webp',
      'generated/product/crisples-product-closeup-03.webp',
      'generated/product/crisples-product-surrounded-04.webp',
    ],
    cardImage: 'generated/product/crisples-product-cream-02.webp',
    benefits: ['100% Apples', 'Naturally Sweet', 'High in Fibre', 'No Added Sugar'],
    pairings: ['Peanut Butter', 'Greek Yogurt', 'Dark Chocolate'],
  },
]);

export const getProduct = (id) => PRODUCTS.find((product) => product.id === id) || PRODUCTS[0];
