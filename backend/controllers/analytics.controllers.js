import Event from '../models/event.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

const funnelStages = [
  { key: 'product_view', label: 'Product Views' },
  { key: 'add_to_cart', label: 'Add To Cart' },
  { key: 'checkout_started', label: 'Checkout Started' },
  { key: 'checkout_completed', label: 'Checkout Completed' },
];

const getStartDate = (days) => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - Number(days || 30) + 1);
  return startDate;
};

const getActorKeyExpression = () => ({
  $cond: [
    { $ifNull: ['$user', false] },
    { $concat: ['user:', { $toString: '$user' }] },
    {
      $cond: [
        {
          $gt: [{ $strLenCP: { $ifNull: ['$sessionId', ''] } }, 0],
        },
        { $concat: ['session:', '$sessionId'] },
        {
          $cond: [
            {
              $gt: [{ $strLenCP: { $ifNull: ['$ipAddress', ''] } }, 0],
            },
            { $concat: ['ip:', '$ipAddress'] },
            { $concat: ['event:', { $toString: '$_id' }] },
          ],
        },
      ],
    },
  ],
});

const toRate = (numerator, denominator) => {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
};

const createDefaultProductAnalytics = (productId) => ({
  productId,
  name: 'Unknown Product',
  slug: '',
  image: '',
  views: 0,
  uniqueViewers: 0,
  addToCarts: 0,
  addToCartActors: 0,
  unitsSold: 0,
  orders: 0,
  revenue: 0,
});

const enrichProducts = async (itemsById) => {
  const productIds = Array.from(itemsById.keys());

  if (productIds.length === 0) {
    return [];
  }

  const products = await Product.find({ _id: { $in: productIds } })
    .select('name slug images')
    .lean();

  for (const product of products) {
    const productId = String(product._id);
    const current = itemsById.get(productId);

    if (!current) {
      continue;
    }

    current.name = product.name;
    current.slug = product.slug;
    current.image = product.images?.find((image) => image?.isPrimary)?.url
      || product.images?.[0]?.url
      || '';
  }

  return Array.from(itemsById.values());
};

export const getAnalyticsFunnel = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const startDate = getStartDate(days);
    const counts = await Event.aggregate([
      {
        $match: {
          eventType: { $in: funnelStages.map((stage) => stage.key) },
          occurredAt: { $gte: startDate },
        },
      },
      {
        $addFields: {
          actorKey: getActorKeyExpression(),
        },
      },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            actorKey: '$actorKey',
          },
        },
      },
      {
        $group: {
          _id: '$_id.eventType',
          actors: { $sum: 1 },
        },
      },
    ]);

    const countsByStage = new Map(
      counts.map((entry) => [entry._id, Number(entry.actors || 0)])
    );
    const firstStageCount = countsByStage.get(funnelStages[0].key) || 0;

    const stages = funnelStages.map((stage, index) => {
      const actors = countsByStage.get(stage.key) || 0;
      const previousActors =
        index > 0 ? countsByStage.get(funnelStages[index - 1].key) || 0 : 0;

      return {
        ...stage,
        actors,
        conversionFromPrevious:
          index === 0 ? null : toRate(actors, previousActors),
        conversionFromFirst:
          index === 0 ? null : toRate(actors, firstStageCount),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        days,
        startDate,
        stages,
        overallConversionRate: toRate(
          countsByStage.get('checkout_completed') || 0,
          firstStageCount
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching funnel analytics',
      error: error.message,
    });
  }
};

export const getAnalyticsTopProducts = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const limit = Number(req.query.limit || 5);
    const startDate = getStartDate(days);
    const eventLimit = Math.max(limit * 5, 10);

    const [viewRows, addToCartRows, orderRows] = await Promise.all([
      Event.aggregate([
        {
          $match: {
            eventType: 'product_view',
            occurredAt: { $gte: startDate },
            product: { $ne: null },
          },
        },
        {
          $addFields: {
            actorKey: getActorKeyExpression(),
          },
        },
        {
          $group: {
            _id: '$product',
            views: { $sum: 1 },
            uniqueViewersSet: { $addToSet: '$actorKey' },
          },
        },
        {
          $project: {
            views: 1,
            uniqueViewers: { $size: '$uniqueViewersSet' },
          },
        },
        { $sort: { views: -1 } },
        { $limit: eventLimit },
      ]),
      Event.aggregate([
        {
          $match: {
            eventType: 'add_to_cart',
            occurredAt: { $gte: startDate },
            product: { $ne: null },
          },
        },
        {
          $addFields: {
            actorKey: getActorKeyExpression(),
          },
        },
        {
          $group: {
            _id: '$product',
            addToCarts: { $sum: 1 },
            addToCartActorsSet: { $addToSet: '$actorKey' },
          },
        },
        {
          $project: {
            addToCarts: 1,
            addToCartActors: { $size: '$addToCartActorsSet' },
          },
        },
        { $sort: { addToCarts: -1 } },
        { $limit: eventLimit },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            unitsSold: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$items.price', 0] },
                  { $ifNull: ['$items.quantity', 0] },
                ],
              },
            },
          },
        },
        { $sort: { revenue: -1, unitsSold: -1 } },
        { $limit: eventLimit },
      ]),
    ]);

    const itemsById = new Map();
    const ensureItem = (rawId) => {
      if (!rawId) {
        return null;
      }

      const productId = String(rawId);
      if (!itemsById.has(productId)) {
        itemsById.set(productId, createDefaultProductAnalytics(productId));
      }

      return itemsById.get(productId);
    };

    for (const row of viewRows) {
      const item = ensureItem(row._id);
      if (!item) {
        continue;
      }
      item.views = Number(row.views || 0);
      item.uniqueViewers = Number(row.uniqueViewers || 0);
    }

    for (const row of addToCartRows) {
      const item = ensureItem(row._id);
      if (!item) {
        continue;
      }
      item.addToCarts = Number(row.addToCarts || 0);
      item.addToCartActors = Number(row.addToCartActors || 0);
    }

    for (const row of orderRows) {
      const item = ensureItem(row._id);
      if (!item) {
        continue;
      }
      item.unitsSold = Number(row.unitsSold || 0);
      item.orders = Number(row.orders || 0);
      item.revenue = Number(row.revenue || 0);
    }

    const enrichedItems = await enrichProducts(itemsById);

    const data = enrichedItems
      .map((item) => ({
        ...item,
        viewToCartRate: toRate(item.addToCartActors, item.uniqueViewers),
        viewToPurchaseRate: toRate(item.orders, item.uniqueViewers),
      }))
      .sort((left, right) => (
        right.revenue - left.revenue
        || right.unitsSold - left.unitsSold
        || right.addToCarts - left.addToCarts
        || right.views - left.views
      ))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        days,
        items: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top product analytics',
      error: error.message,
    });
  }
};

export const getAnalyticsRepeatCustomers = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const limit = Number(req.query.limit || 5);
    const startDate = getStartDate(days);

    const repeatCustomerRows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      { $sort: { orderCount: -1, totalSpent: -1 } },
      { $limit: limit },
    ]);

    const users = await User.find({
      _id: { $in: repeatCustomerRows.map((row) => row._id) },
    })
      .select('name email')
      .lean();

    const usersById = new Map(users.map((user) => [String(user._id), user]));

    const data = repeatCustomerRows.map((row) => {
      const user = usersById.get(String(row._id));
      const totalSpent = Number(row.totalSpent || 0);
      const orderCount = Number(row.orderCount || 0);

      return {
        userId: String(row._id),
        name: user?.name || 'Unknown User',
        email: user?.email || '',
        orderCount,
        totalSpent,
        averageOrderValue: orderCount ? Number((totalSpent / orderCount).toFixed(2)) : 0,
        lastOrderAt: row.lastOrderAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        days,
        items: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching repeat customer analytics',
      error: error.message,
    });
  }
};

export const getAnalyticsLowConversionPages = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const limit = Number(req.query.limit || 5);
    const minVisitors = Number(req.query.minVisitors || 10);
    const startDate = getStartDate(days);
    const eventLimit = Math.max(limit * 8, 20);

    const [viewRows, addToCartRows, purchaseRows] = await Promise.all([
      Event.aggregate([
        {
          $match: {
            eventType: 'product_view',
            occurredAt: { $gte: startDate },
            product: { $ne: null },
          },
        },
        {
          $addFields: {
            actorKey: getActorKeyExpression(),
          },
        },
        { $sort: { occurredAt: -1 } },
        {
          $group: {
            _id: '$product',
            views: { $sum: 1 },
            uniqueVisitorsSet: { $addToSet: '$actorKey' },
            pagePath: { $first: '$metadata.pagePath' },
            slug: { $first: '$metadata.slug' },
          },
        },
        {
          $project: {
            views: 1,
            uniqueVisitors: { $size: '$uniqueVisitorsSet' },
            pagePath: 1,
            slug: 1,
          },
        },
        { $match: { uniqueVisitors: { $gte: minVisitors } } },
        { $sort: { uniqueVisitors: -1, views: -1 } },
        { $limit: eventLimit },
      ]),
      Event.aggregate([
        {
          $match: {
            eventType: 'add_to_cart',
            occurredAt: { $gte: startDate },
            product: { $ne: null },
          },
        },
        {
          $addFields: {
            actorKey: getActorKeyExpression(),
          },
        },
        {
          $group: {
            _id: '$product',
            addToCartEvents: { $sum: 1 },
            addToCartActorsSet: { $addToSet: '$actorKey' },
          },
        },
        {
          $project: {
            addToCartEvents: 1,
            addToCartActors: { $size: '$addToCartActorsSet' },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            purchasedUnits: { $sum: '$items.quantity' },
          },
        },
      ]),
    ]);

    const productIds = viewRows.map((row) => row._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name slug')
      .lean();
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const addToCartById = new Map(
      addToCartRows.map((row) => [String(row._id), row])
    );
    const purchasesById = new Map(
      purchaseRows.map((row) => [String(row._id), Number(row.purchasedUnits || 0)])
    );

    const data = viewRows
      .map((row) => {
        const productId = String(row._id);
        const product = productsById.get(productId);
        const addToCart = addToCartById.get(productId);
        const uniqueVisitors = Number(row.uniqueVisitors || 0);
        const addToCartActors = Number(addToCart?.addToCartActors || 0);

        return {
          productId,
          name: product?.name || 'Unknown Product',
          slug: product?.slug || row.slug || '',
          pagePath: row.pagePath || (product?.slug ? `/product/${product.slug}` : ''),
          views: Number(row.views || 0),
          uniqueVisitors,
          addToCartActors,
          addToCartEvents: Number(addToCart?.addToCartEvents || 0),
          purchasedUnits: purchasesById.get(productId) || 0,
          conversionRate: toRate(addToCartActors, uniqueVisitors),
        };
      })
      .sort((left, right) => (
        left.conversionRate - right.conversionRate
        || right.uniqueVisitors - left.uniqueVisitors
        || right.views - left.views
      ))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        days,
        minVisitors,
        items: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low-conversion pages',
      error: error.message,
    });
  }
};
