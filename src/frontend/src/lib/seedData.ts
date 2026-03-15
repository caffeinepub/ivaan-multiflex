import { ExternalBlob } from "../backend";
import { createActorWithConfig } from "../config";

const CATEGORIES = [
  {
    id: "fashion",
    name: "Fashion",
    description: "Clothing, accessories and more",
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Mobiles, laptops and gadgets",
  },
  {
    id: "home",
    name: "Home & Living",
    description: "Furniture, decor and kitchen",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Skincare, makeup and wellness",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Fitness, outdoor and sporting goods",
  },
  {
    id: "books",
    name: "Books",
    description: "Fiction, non-fiction and educational",
  },
  { id: "toys", name: "Toys", description: "Kids toys and games" },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Cookware, appliances and more",
  },
];

const PRODUCTS = [
  {
    id: "p1",
    name: "Floral Kurta Set",
    description:
      "Beautiful floral printed kurta with palazzo. Perfect for festive occasions.",
    price: BigInt(89900),
    originalPrice: BigInt(159900),
    categoryId: "fashion",
    stock: BigInt(50),
    image: "https://picsum.photos/seed/kurta/400/400",
  },
  {
    id: "p2",
    name: "Men Slim Fit Jeans",
    description:
      "Comfortable slim fit denim jeans for men. Available in multiple sizes.",
    price: BigInt(69900),
    originalPrice: BigInt(119900),
    categoryId: "fashion",
    stock: BigInt(30),
    image: "https://picsum.photos/seed/jeans/400/400",
  },
  {
    id: "p3",
    name: "Wireless Earbuds Pro",
    description:
      "True wireless earbuds with ANC, 30hr battery life and premium sound.",
    price: BigInt(199900),
    originalPrice: BigInt(349900),
    categoryId: "electronics",
    stock: BigInt(20),
    image: "https://picsum.photos/seed/earbuds/400/400",
  },
  {
    id: "p4",
    name: "Smart Watch Series 5",
    description:
      "Feature-packed smartwatch with health monitoring and GPS tracking.",
    price: BigInt(299900),
    originalPrice: BigInt(499900),
    categoryId: "electronics",
    stock: BigInt(15),
    image: "https://picsum.photos/seed/watch/400/400",
  },
  {
    id: "p5",
    name: "Decorative Table Lamp",
    description:
      "Modern LED table lamp with adjustable brightness. Perfect for bedside.",
    price: BigInt(49900),
    originalPrice: BigInt(79900),
    categoryId: "home",
    stock: BigInt(40),
    image: "https://picsum.photos/seed/lamp/400/400",
  },
  {
    id: "p6",
    name: "Vitamin C Face Serum",
    description: "Brightening serum with 15% Vitamin C and hyaluronic acid.",
    price: BigInt(39900),
    originalPrice: BigInt(69900),
    categoryId: "beauty",
    stock: BigInt(60),
    image: "https://picsum.photos/seed/serum/400/400",
  },
  {
    id: "p7",
    name: "Yoga Mat Premium",
    description:
      "Extra thick non-slip yoga mat with alignment lines. Eco-friendly material.",
    price: BigInt(89900),
    originalPrice: BigInt(129900),
    categoryId: "sports",
    stock: BigInt(25),
    image: "https://picsum.photos/seed/yoga/400/400",
  },
  {
    id: "p8",
    name: "Non-Stick Cookware Set",
    description:
      "5-piece non-stick cookware set. Dishwasher safe and induction compatible.",
    price: BigInt(149900),
    originalPrice: BigInt(249900),
    categoryId: "kitchen",
    stock: BigInt(18),
    image: "https://picsum.photos/seed/cookware/400/400",
  },
];

export async function seedIfEmpty() {
  try {
    const actor = await createActorWithConfig();
    const cats = await actor.listCategories();
    if (cats.length > 0) return;
    for (const cat of CATEGORIES) {
      await actor.createCategory(cat.id, cat.name, cat.description);
    }
    for (const p of PRODUCTS) {
      await actor.createProduct(
        p.id,
        p.name,
        p.description,
        p.price,
        p.originalPrice,
        p.categoryId,
        p.stock,
        ExternalBlob.fromURL(p.image),
      );
    }
  } catch (e) {
    console.error("Seeding failed", e);
  }
}
