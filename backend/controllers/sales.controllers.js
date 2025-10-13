import Sale from "../models/sales.model.js";

export const getSalesSummary = async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalUnitsSold: { $sum: "$quantity" },
        },
      },
    ]);

    res.status(200).json(totalSales[0] || { totalRevenue: 0, totalUnitsSold: 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales summary", error });
  }
};

export const getSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(salesByDate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales by date", error });
  }
};
