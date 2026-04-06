// server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './db/db.js';
import { appConfig, isAllowedOrigin } from './config/env.js';



// Import routes
import categoryRoutes from './routes/category.routes.js';
import subCategoryRoutes from './routes/subCategory.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import salesRoutes from './routes/sales.routes.js';
import eventRoutes from './routes/event.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reviewRoutes from './routes/review.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser(appConfig.cookieSecret));
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Jewelry Store API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.listen(appConfig.port, appConfig.host, () => {
  const displayHost = appConfig.host === '0.0.0.0' ? 'localhost' : appConfig.host;
  console.log(`Server is running on http://${displayHost}:${appConfig.port}`);
  connectDB();

});




export default app;





