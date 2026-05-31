// scripts/seedCategories.js
import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model.js';
import SubCategory from './models/subCategory.model.js';
import connectDB from './db/db.js';

dotenv.config();

const categoriesData = [
  {
    name: "Tops",
    slug: "tops",
    description: "Explore our collection of tops",
    displayOrder: 1,
    subcategories: [
      { name: "All Tops", slug: "all-tops", description: "Browse all top styles", displayOrder: 1 },
      { name: "T-Shirts", slug: "t-shirts", description: "Casual and graphic t-shirts", displayOrder: 2 },
      { name: "Shirts", slug: "shirts", description: "Button-up and casual shirts", displayOrder: 3 },
      { name: "Sweaters", slug: "sweaters", description: "Cozy sweaters and knits", displayOrder: 4 },
      { name: "Hoodies", slug: "hoodies", description: "Comfortable hoodies and sweatshirts", displayOrder: 5 },
      { name: "Jackets", slug: "jackets", description: "Outerwear and jackets", displayOrder: 6 },
      { name: "Polos", slug: "polos", description: "Classic polo shirts", displayOrder: 7 },
      { name: "Tank Tops", slug: "tank-tops", description: "Sleeveless tank tops", displayOrder: 8 },
      { name: "Sportswear", slug: "sportswear", description: "Sportswear and activewear", displayOrder: 9 }
    ]
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Explore our collection of bottoms",
    displayOrder: 2,
    subcategories: [
      { name: "All Bottoms", slug: "all-bottoms", description: "Browse all bottom styles", displayOrder: 1 },
      { name: "Jeans", slug: "jeans", description: "Denim jeans", displayOrder: 2 },
      { name: "Trousers", slug: "trousers", description: "Tailored and casual trousers", displayOrder: 3 },
      { name: "Shorts", slug: "shorts", description: "Casual and tailored shorts", displayOrder: 4 },
      { name: "Sweatpants", slug: "sweatpants", description: "Comfortable sweatpants and joggers", displayOrder: 5 },
    ]
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Explore our collection of footwear",
    displayOrder: 3,
    subcategories: [
      { name: "All Footwear", slug: "all-footwear", description: "Browse all footwear styles", displayOrder: 1 },
      { name: "Sneakers", slug: "sneakers", description: "Casual and athletic sneakers", displayOrder: 2 },
      { name: "Boots", slug: "boots", description: "Stylish and durable boots", displayOrder: 3 },
      { name: "Loafers", slug: "loafers", description: "Classic loafers and slip-ons", displayOrder: 4 },
    ]
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Explore our collection of accessories",
    displayOrder: 4,
    subcategories: [
      { name: "All Accessories", slug: "all-accessories", description: "Browse all accessories", displayOrder: 1 },
      { name: "Bags", slug: "bags", description: "Bags and backpacks", displayOrder: 2 },
      { name: "Belts", slug: "belts", description: "Leather and casual belts", displayOrder: 3 },
      { name: "Hats", slug: "hats", description: "Caps, beanies, and hats", displayOrder: 4 },
      { name: "Sunglasses", slug: "sunglasses", description: "Stylish eyewear", displayOrder: 5 },
      { name: "Wallets", slug: "wallets", description: "Wallets and cardholders", displayOrder: 6 },
      { name: "Gloves", slug: "gloves", description: "Warm gloves", displayOrder: 7 },
      { name: "Socks", slug: "socks", description: "Everyday socks", displayOrder: 8 },
      { name: "Ties", slug: "ties", description: "Neckties and bowties", displayOrder: 9 },
      { name: "Cufflinks", slug: "cufflinks", description: "Elegant cufflinks", displayOrder: 10 }
    ]
  },
  {
    name: "Jewellery",
    slug: "jewellery",
    description: "Explore our collection of jewellery",
    displayOrder: 5,
    subcategories: [
      { name: "All Jewellery", slug: "all-jewellery", description: "Browse all jewellery styles", displayOrder: 1 },
      { name: "Rings", slug: "rings", description: "Handcrafted rings", displayOrder: 2 },
      { name: "Necklaces", slug: "necklaces", description: "Beautiful necklaces", displayOrder: 3 },
      { name: "Bracelets", slug: "bracelets", description: "Stylish bracelets", displayOrder: 4 }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing categories and subcategories...');
    await SubCategory.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create categories and subcategories
    console.log('📦 Seeding categories and subcategories...');

    for (const catData of categoriesData) {
      // Create category
      const category = await Category.create({
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        displayOrder: catData.displayOrder,
        isActive: true
      });

      console.log(`✅ Created category: ${category.name} (${category._id})`);

      // Create subcategories for this category
      if (catData.subcategories && catData.subcategories.length > 0) {
        for (const subCatData of catData.subcategories) {
          const subCategory = await SubCategory.create({
            name: subCatData.name,
            slug: subCatData.slug,
            description: subCatData.description,
            category: category._id,
            displayOrder: subCatData.displayOrder,
            isActive: true
          });

          console.log(`   ➡️  Created subcategory: ${subCategory.name}`);
        }
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    const categoryCount = await Category.countDocuments();
    const subCategoryCount = await SubCategory.countDocuments();
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   SubCategories: ${subCategoryCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();