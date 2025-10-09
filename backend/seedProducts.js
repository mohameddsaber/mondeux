// scripts/seedProducts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js';
import Category from './models/category.model.js';
import SubCategory from './models/subCategory.model.js';

dotenv.config();

// Product data
const productsData = [
// {
//   name: 'Silver Napoleon Ring',
//     description: `The Silver Napoleon Ring is a chunky ring with compass artwork and engravings on the shoulders. It is made from 925 Sterling Silver and Stainless Steel.

// The ring has a compass on the face with layered detailing and an oxidised finish which highlights the design. On the shoulders of the ring is the branding 'Mondeux' and arrows that follow around the face, representing eternity.

// The Napoleon Ring is hollowed on the inside so can fit comfortably over knuckles. Wear this ring with classic shapes such as the Silver Envy Signet Ring and the Silver St Christopher Necklace.

// Every product comes in a recyclable pouch. Our pouches are made from 100% cotton with cotton drawstrings and are completely plastic free & recyclable. Silver products (excluding Rhodium plated styles) naturally age over time, so they also come with a cleaning cloth, which can be used to polish your product.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Iconic compass design',
//     tags: ['compass', 'chunky', 'engraved', 'silver'],
//     isFeatured: true,
//     images: [
//       { url: 'https://www.sergedenimes.com/cdn/shop/products/Silver-Napoleon-Ring-Product-Shot-Grey_c30b0886-6c26-495a-b5ee-bfc4c5213090.jpg?v=1675880869&width=1946', alt: 'Silver Napoleon Ring', isPrimary: true },
//       { url: 'https://www.sergedenimes.com/cdn/shop/products/Silver-Napoleon-Ring-Product-Shot-2-Grey_cab74c61-4155-464e-8903-6e8b92d8794b.jpg?v=1675880869&width=1946', alt: 'Silver Napoleon Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 11,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 3, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 11,
//         price: 450,
//         compareAtPrice: 550,
//         costPrice: 200,
//         stock: 30,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

//   {
//     name: 'Silver Brushed Rectangle Ring',
//     description: `The Silver Brushed Rectangle Ring is a rectangle shaped ring finished with a brushed effect on the outer edges. The ring is forged from 925 Sterling Silver and Stainless Steel.

// This slim rectangle shaped signet ring has clean edges, made from solid Sterling Silver for a heavy weight and high quality. The ring has a brushed finish on the outer surfaces, while the inside and edges are polished, giving a unique texture and premium finish. Rhodium plating gives it a polished, bright Silver look that won't age and discolour.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Classic timeless design',
//     tags: ['rectangle', 'brushed', 'silver', 'signet'],
//     isFeatured: false,
//     images: [
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Brushed-Rectangle-Ring-Product-Shot-2-Grey_8a342f54-67c8-4ffa-b63f-942cecc97bb9.jpg?v=1713345344&width=1946', alt: 'Silver Brushed Rectangle Ring', isPrimary: true },
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Brushed-Rectangle-Ring-Product-Shot-Grey.jpg?v=1713345344&width=1946', alt: 'Silver Brushed Rectangle Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 12,
//         price: 1700,
//         compareAtPrice: 2100,
//         costPrice: 1000,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 12,
//         price: 420,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

//   {
//     name: 'Silver Rose Ring',
//     description: `The Silver Rose Ring features delicate rose detailing on a solid silver band. Perfect for those who appreciate floral designs and subtle elegance.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Rose detailing',
//     tags: ['rose', 'silver', 'floral', 'elegant'],
//     isFeatured: false,
//     images: [
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Rose-Ring-Grey-1.jpg?v=1719406428&width=1946', alt: 'Silver Rose Ring', isPrimary: true },
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Rose-Ring-White-2_93313f07-819c-49b1-80c1-70895bd1d345.jpg?v=1718805969&width=1946', alt: 'Silver Rose Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 10,
//         price: 1500,
//         compareAtPrice: 1900,
//         costPrice: 900,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 3, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 10,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 30,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

//   {
//     name: 'Silver Line Cuff',
//     description: `Minimalist silver cuff with sleek line detailing. Ideal for everyday wear or stacking with other bracelets.`,
//     category: 'bracelets',
//     subCategory: 'silver-bracelets',
//     briefDescription: 'Minimal design',
//     tags: ['cuff', 'minimal', 'silver', 'bracelet'],
//     isFeatured: true,
//     images: [
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Line-Bangle-Grey-1_e7b503d0-226e-46af-af3c-74711b618684.jpg?v=1697465237&width=1946', alt: 'Silver Line Cuff', isPrimary: true },
//       { url: 'https://www.sergedenimes.com/cdn/shop/files/Silver-Line-Bangle-Grey-2_782a3645-350e-4f46-84b3-278a88860c59.jpg?v=1697465237&width=1946', alt: 'Silver Line Cuff Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 16,
//         price: 2800,
//         compareAtPrice: 3200,
//         costPrice: 1500,
//         stock: 20,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 10, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 16,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 220,
//         stock: 25,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 15, isAvailable: true }
//         ]
//       }
//     ]
//   },

//   {
//     name: 'Back in the Day',
//     description: `It all started with one penguin... It's said he had a style or perhaps just a radical love for the ocean that brought a glimmer, a spark to the waves he flew across. Nothing too fancy, but he sure could ride, soaring like a cannonball and flying. Gliding and trimming... Every step, was like a dance, a rhythm almost as if giving thanks to the waves he rode. It’s said he spent his days traveling the globe, trying to pass on the heart and art of riding watery slopes, and spent his elderly years gliding with the next generation. The first surfer to walk to earth…This is a story about back in the day.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Inspired by the first surfer',
//     tags: ['penguin', 'surf', 'silver', 'story'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_111of180_c06d868b-60c6-4c76-ac2f-61db45a24ef3.jpg?v=1758541843', alt: 'Back in the Day Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_114of180_6417fdea-da0c-4f6e-aae7-3fade17421bb.jpg?v=1758541843', alt: 'Back in the Day Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 12,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 12,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },
//   {
//     name: 'Gift Of God',
//     description: `The gift of time, the gift of warmth. When you let go of everything that you felt was 'supposed to be' you may just find everything is quite alright. The most important thing is to know all we have and are is a gift and to treasure it. Let these griffins protect your warmth and remind you that today is the 'present'.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Griffin inspired design',
//     tags: ['gift', 'griffin', 'silver', 'meaningful'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_41of180.jpg?v=1758541601', alt: 'Gift Of God Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_45of180.jpg?v=1758541602', alt: 'Gift Of God Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 12,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 12,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Timekeeper Cuff',
//     description: `It's about time... So often, time is traced, tracked. Each day is judged by the minute. The moments you lose track of time are often the most important. Unlike a watch or clock, numbers are etched on the inside to remind you that time is a tool, not a cage.`,
//     category: 'bracelets',
//     subCategory: 'silver-bracelets',
//     briefDescription: 'Time-tracking bracelet',
//     tags: ['cuff', 'time', 'silver', 'bracelet'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_11of180.jpg?v=1758541460', alt: 'Timekeeper Cuff', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_13of180.jpg?v=1758541460', alt: 'Timekeeper Cuff Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 16,
//         price: 2800,
//         compareAtPrice: 3200,
//         costPrice: 1500,
//         stock: 20,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 10, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 16,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 220,
//         stock: 25,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 15, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Blowing In The Wind Cuff',
//     description: `Heritage to our first-ever collection. The piece holds memories, ideas, and dreams. Symbols like the palm tree, olive branch, sun, and moon remind you to trust yourself and dream bigger.`,
//     category: 'bracelets',
//     subCategory: 'silver-bracelets',
//     briefDescription: 'Heritage-inspired cuff',
//     tags: ['cuff', 'heritage', 'silver', 'symbolic'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_161of180.jpg?v=1758541990', alt: 'Blowing In The Wind Cuff', isPrimary: true }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 16,
//         price: 2800,
//         compareAtPrice: 3200,
//         costPrice: 1500,
//         stock: 20,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 10, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 16,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 220,
//         stock: 25,
//         sizeVariants: [
//           { label: 'Small', stock: 10, isAvailable: true },
//           { label: 'Medium', stock: 15, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Lost Treasure',
//     description: `To cut through the mayhem and chaos around us, the salt. To see the beauty amongst the storm. To be still when the world wavers and to remember the simplest things often matter more than large ambitions.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Find beauty in chaos',
//     tags: ['treasure', 'silver', 'ring', 'inspirational'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_31of180.jpg?v=1758541573', alt: 'Lost Treasure Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_32of180.jpg?v=1758541573', alt: 'Lost Treasure Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 12,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 12,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Faith',
//     description: `This piece is inspired by the gift of gods, taken from the centre, the flame within. It’s about being the light when the world needs it most. Dedicated to having faith in things we cannot see and shining a little brighter.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Inspired by faith',
//     tags: ['faith', 'silver', 'ring', 'light'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_151of180.jpg?v=1758541954', alt: 'Faith Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_154of180.jpg?v=1758541954', alt: 'Faith Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 11,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 11,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'True North Pendant',
//     description: `It’s said the heart guides us all, a compass that forever leads us or reminds us when we’ve fallen astray. Let this piece remind you of the guide within. A promise when in turmoil to keep the heart open and mind clear. Let it sail you true north.`,
//     category: 'necklaces',
//     subCategory: 'silver-necklaces',
//     briefDescription: 'Compass inspired pendant',
//     tags: ['pendant', 'compass', 'silver', 'necklace'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_72of180_70fadd73-eeb4-4c60-acc0-0665f8766804.jpg?v=1758645249', alt: 'True North Pendant', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_71of180_563f5097-fcb0-447f-81fa-c1e89eb930ef.jpg?v=1758645249', alt: 'True North Pendant Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 10,
//         price: 2100,
//         compareAtPrice: 2500,
//         costPrice: 1300,
//         stock: 20,
//         sizeVariants: [
//           { label: '55 + 5 Adjustable', stock: 5, isAvailable: true },
//           { label: '45 + 5 Adjustable', stock: 5, isAvailable: true },
//           { label: '35 + 5 Adjustable', stock: 5, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 10,
//         price: 460,
//         compareAtPrice: 550,
//         costPrice: 230,
//         stock: 25,
//         sizeVariants: [
//           { label: '55 + 5 Adjustable', stock: 5, isAvailable: true },
//           { label: '45 + 5 Adjustable', stock: 5, isAvailable: true },
//           { label: '35 + 5 Adjustable', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'The Boxer',
//     description: `It is not about being the strongest or the greatest. It's about getting back up. This piece is for the fighters; regardless of age, gender, or background, there is a fighter in all of us.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Fight and resilience',
//     tags: ['boxer', 'silver', 'ring', 'resilience'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_91of180.jpg?v=1758541738', alt: 'The Boxer Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_98of180.jpg?v=1758541739', alt: 'The Boxer Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 12,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 12,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },
// {
//     name: 'Ancient Phoenix Pendant',
//     description: `The phoenix is wreathed in myths and legends around the globe. Some say it spun forth from Ancient Egyptian legend; a symbol of eternity, strength, and renewal. The tale of rebirth endures, giving hope for oneself and humanity.`,
//     category: 'necklaces',
//     subCategory: 'silver-necklaces',
//     briefDescription: 'Phoenix inspired pendant',
//     tags: ['phoenix', 'pendant', 'silver', 'renewal'],
//     isFeatured: true,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_101of180.jpg?v=1758541774', alt: 'Ancient Phoenix Pendant', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_104of180.jpg?v=1758541775', alt: 'Ancient Phoenix Pendant Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 10,
//         price: 2100,
//         compareAtPrice: 2500,
//         costPrice: 1300,
//         stock: 20,
//         sizeVariants: [
//           { label: 'One Size', stock: 20, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 10,
//         price: 460,
//         compareAtPrice: 550,
//         costPrice: 230,
//         stock: 25,
//         sizeVariants: [
//           { label: 'One Size', stock: 25, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Le Cinéma',
//     description: `This one's for the movie makers. The film advocates often losing track of time as you see your vision come to life, creating purely for the dream, hoping to inspire, or simply creating something that exceeds all previous creations.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Cinematic inspired ring',
//     tags: ['cinema', 'ring', 'silver', 'creative'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_1of180.jpg?v=1758541364', alt: 'Le Cinéma Ring', isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/YETZ_4of180.jpg?v=1758541365', alt: 'Le Cinéma Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 11,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 11,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'White Howlite Seeker',
//     description: `A stone of healing and protection. Helps calm the mind and ground the body. Known for compassion, soothing, awareness, sensitivity, and transformation. Guides you across the wild seas of life.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Healing Howlite ring',
//     tags: ['howlite', 'ring', 'silver', 'healing'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/P1499977.jpg?v=1754560007', alt: 'White Howlite Seeker Ring', isPrimary: true }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 11,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 11,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: "Gerry's Board",
//     description: `The race was on to retrieve the prize for their almighty god. Those who possess the surfboard will forever surf with the style of Gerry. A magical journey of surfing adventure and epic storytelling.`,
//     category: 'rings',
//     subCategory: 'silver-rings',
//     briefDescription: 'Surf-inspired ring',
//     tags: ['surf', 'ring', 'silver', 'storytelling'],
//     isFeatured: false,
//     images: [
//       { url: 'https://saltydagger.com/cdn/shop/files/DSC00109-2.jpg?v=1754559930', alt: "Gerry's Board Ring", isPrimary: true },
//       { url: 'https://saltydagger.com/cdn/shop/files/DSC00475.jpg?v=1754559932', alt: "Gerry's Board Ring Detail", isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 11,
//         price: 1800,
//         compareAtPrice: 2200,
//         costPrice: 1100,
//         stock: 20,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 2, isAvailable: true },
//           { label: 'UK W', stock: 2, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 11,
//         price: 400,
//         compareAtPrice: 500,
//         costPrice: 200,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

// {
//     name: 'Sapphire Ring',
//     description: `A luxurious gold ring featuring a sparkling sapphire gemstone. Elegant and timeless, designed to be worn on any occasion.`,
//     category: 'rings',
//     subCategory: 'gold-rings',
//     briefDescription: 'Elegant sapphire gold Plated silver ring',
//     tags: ['sapphire', 'gold', 'ring', 'luxury'],
//     isFeatured: false,
//     images: [
//       { url: 'https://l-ermite.com/cdn/shop/files/ClobFlatlaysJuli20246592.jpg?v=1721302144', alt: 'Sapphire Ring', isPrimary: true },
//       { url: 'https://l-ermite.com/cdn/shop/files/ClobFlatlaysJuli20246552.jpg?v=1738194472', alt: 'Sapphire Ring Detail', isPrimary: false }
//     ],
//     materialVariants: [
//       {
//         material: 'silver',
//         metalPurity: '925',
//         weight: 10,
//         price: 3500,
//         compareAtPrice: 4000,
//         costPrice: 2000,
//         stock: 15,
//         sizeVariants: [
//           { label: 'UK L', stock: 3, isAvailable: true },
//           { label: 'UK N', stock: 3, isAvailable: true },
//           { label: 'UK P', stock: 3, isAvailable: true },
//           { label: 'UK S', stock: 3, isAvailable: true },
//           { label: 'UK U', stock: 3, isAvailable: true }
//         ]
//       },
//       {
//         material: 'stainless steel',
//         weight: 15,
//         price: 700,
//         compareAtPrice: 900,
//         costPrice: 400,
//         stock: 25,
//         sizeVariants: [
//           { label: 'UK L', stock: 5, isAvailable: true },
//           { label: 'UK N', stock: 5, isAvailable: true },
//           { label: 'UK P', stock: 5, isAvailable: true },
//           { label: 'UK S', stock: 5, isAvailable: true },
//           { label: 'UK U', stock: 5, isAvailable: true },
//           { label: 'UK W', stock: 5, isAvailable: true }
//         ]
//       }
//     ]
//   },

{
    name: 'Royal',
    description: `A majestic gold ring with refined design. Embodying elegance, royalty, and luxury for every occasion.`,
    category: 'necklaces',
    subCategory: 'gold-necklaces',
    briefDescription: 'Majestic gold plated silver necklace',
    tags: ['gold', 'necklace', 'royal', 'luxury'],
    isFeatured: true,
    images: [
      { url: 'https://l-ermite.com/cdn/shop/files/ClobFlatlaysJuli20246545.jpg?v=1721222207', alt: 'Royal Ring', isPrimary: true }
    ],
    materialVariants: [
      {
        material: 'silver',
        metalPurity: '925',
        weight: 12,
        price: 3800,
        compareAtPrice: 4300,
        costPrice: 2200,
        stock: 15,
        sizeVariants: [
          { label: 'UK L', stock: 3, isAvailable: true },
          { label: 'UK N', stock: 3, isAvailable: true },
          { label: 'UK P', stock: 3, isAvailable: true },
          { label: 'UK S', stock: 3, isAvailable: true },
          { label: 'UK U', stock: 3, isAvailable: true }
        ]
      },
      {
        material: 'stainless steel',
        weight: 15,
        price: 700,
        compareAtPrice: 900,
        costPrice: 400,
        stock: 25,
        sizeVariants: [
          { label: 'UK L', stock: 5, isAvailable: true },
          { label: 'UK N', stock: 5, isAvailable: true },
          { label: 'UK P', stock: 5, isAvailable: true },
          { label: 'UK S', stock: 5, isAvailable: true },
          { label: 'UK U', stock: 5, isAvailable: true },
          { label: 'UK W', stock: 5, isAvailable: true }
        ]
      }
    ]
  }


];

// Helper function to generate SKU
const generateSKU = (productSlug, material, size) => {
  const productPart = productSlug ? productSlug.substring(0, 10).toUpperCase() : 'PROD';
  const materialPart = material ? material.substring(0, 3).toUpperCase() : 'MAT';
  const sizePart = size ? size.replace(/\s+/g, '').toUpperCase() : 'SIZE';

  return `${productPart}-${materialPart}-${sizePart}`;
};

// Create slug from product name
const createSlug = (name) => {
  return name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : 'product-slug';
};

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    // await Product.deleteMany({});
    // console.log('🗑️ Cleared existing products');

    for (const productData of productsData) {
      const category = await Category.findOne({ slug: productData.category });
      const subCategory = await SubCategory.findOne({ slug: productData.subCategory });

      if (!category || !subCategory) {
        console.log(`⚠️ Skipping ${productData.name}: Category or SubCategory not found`);
        continue;
      }

      const slug = createSlug(productData.name);

      // Process material variants and size variants
      const materialVariants = productData.materialVariants.map((mv) => {
        const sizeVariants = mv.sizeVariants.map((sv) => ({
          ...sv,
          sku: generateSKU(slug, mv.material, sv.label),
          price: sv.price || mv.price,
          isAvailable: sv.isAvailable !== undefined ? sv.isAvailable : true,
          stock: sv.stock !== undefined ? sv.stock : 0
        }));

        return {
          ...mv,
          sizeVariants,
          stock: mv.stock !== undefined ? mv.stock : sizeVariants.reduce((a, b) => a + b.stock, 0)
        };
      });

      await Product.create({
        name: productData.name,
        slug,
        description: productData.description,
        images: productData.images || [],
        category: category._id,
        subCategory: subCategory._id,
        materialVariants,
        tags: productData.tags || [],
        isActive: true,
        isFeatured: productData.isFeatured || false,
        metaTitle: productData.name,
        metaDescription: productData.briefDescription || productData.description.substring(0, 160)
      });

      console.log(`✅ Created: ${productData.name} (${materialVariants.length} materials)`);
    }

    console.log('\n🎉 Products seeded successfully!');
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products: ${totalProducts}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding products:', err);
    process.exit(1);
  }
};

seedProducts();