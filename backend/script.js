// scripts/seedCategories.js
import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.model.js';
import SubCategory from './models/subCategory.model.js';
import connectDB from './db/db.js';

dotenv.config();

const categoriesData = [
  {
    name: "Collections",
    slug: "collections",
    description: "Curated collections and featured items",
    displayOrder: 0,
    subcategories: [
      { name: "Modern Rodeo", slug: "modern-rodeo", description: "Modern Rodeo collection", displayOrder: 1 },
      { name: "New In", slug: "new-in", description: "Latest arrivals", displayOrder: 2 },
      { name: "Best Sellers", slug: "best-sellers", description: "Our most popular items", displayOrder: 3 },
      { name: "Shop All", slug: "shop-all", description: "Browse entire catalog", displayOrder: 4 }
    ]
  },
  {
    name: "Rings",
    slug: "rings",
    description: "Explore our collection of handcrafted rings",
    displayOrder: 1,
    subcategories: [
      { name: "All Rings", slug: "all-rings", description: "Browse all ring styles", displayOrder: 1 },
      { name: "Silver Rings", slug: "silver-rings", description: "Sterling silver rings", displayOrder: 2 },
      { name: "Gold Rings", slug: "gold-rings", description: "Gold plated and solid gold rings", displayOrder: 3 },
      { name: "Statement Rings", slug: "statement-rings", description: "Bold and unique statement pieces", displayOrder: 4 },
      { name: "Stone Rings", slug: "stone-rings", description: "Rings featuring gemstones", displayOrder: 5 },
      { name: "Signet Rings", slug: "signet-rings", description: "Classic signet ring designs", displayOrder: 6 }
    ]
  },
  {
    name: "Necklaces",
    slug: "necklaces",
    description: "Beautiful necklaces for every occasion",
    displayOrder: 2,
    subcategories: [
      { name: "All Necklaces", slug: "all-necklaces", description: "Browse all necklace styles", displayOrder: 1 },
      { name: "Silver Necklaces", slug: "silver-necklaces", description: "Sterling silver necklaces", displayOrder: 2 },
      { name: "Gold Necklaces", slug: "gold-necklaces", description: "Gold plated and solid gold necklaces", displayOrder: 3 },
      { name: "Pendant Necklaces", slug: "pendant-necklaces", description: "Necklaces with pendant charms", displayOrder: 4 },
      { name: "Chain Necklaces", slug: "chain-necklaces", description: "Classic chain necklaces", displayOrder: 5 }
    ]
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    description: "Stylish bracelets to complement your look",
    displayOrder: 3,
    subcategories: [
      { name: "All Bracelets", slug: "all-bracelets", description: "Browse all bracelet styles", displayOrder: 1 },
      { name: "Silver Bracelets", slug: "silver-bracelets", description: "Sterling silver bracelets", displayOrder: 2 },
      { name: "Gold Bracelets", slug: "gold-bracelets", description: "Gold plated and solid gold bracelets", displayOrder: 3 },
      { name: "Cuff Bracelets", slug: "cuff-bracelets", description: "Bold cuff bracelet designs", displayOrder: 4 },
      { name: "Classic Bracelets", slug: "classic-bracelets", description: "Timeless bracelet styles", displayOrder: 5 }
    ]
  },
  {
    name: "Wallets",
    slug: "wallets",
    description: "Premium leather wallets and card holders",
    displayOrder: 4,
    subcategories: [
      { name: "All Wallets", slug: "all-wallets", description: "Browse all wallet styles", displayOrder: 1 },
      { name: "Slim Wallets", slug: "slim-wallets", description: "Minimalist slim wallets", displayOrder: 2 },
      { name: "Card Holders", slug: "card-holders", description: "Compact card holder wallets", displayOrder: 3 }
    ]
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Complete your style with our accessories",
    displayOrder: 5,
    subcategories: [
      { name: "All Accessories", slug: "all-accessories", description: "Browse all accessories", displayOrder: 1 }
    ]
  },
  {
    name: "Perle",
    slug: "perle",
    description: "Pearl jewelry collection",
    displayOrder: 6,
    subcategories: []
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