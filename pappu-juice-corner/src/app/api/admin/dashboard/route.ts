import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Fetch Settings for Shop Status
    const settings = await Settings.findOne({});
    let isShopOpen = true;
    if (settings?.shop) {
      const { isManualClose, openingTime, closingTime } = settings.shop;
      
      // Get current time in Indian Standard Time (IST)
      const currentTimeStr = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false,
        timeZone: 'Asia/Kolkata' 
      });
      
      const isOpenTime = currentTimeStr >= (openingTime || "09:00") && currentTimeStr <= (closingTime || "21:00");
      isShopOpen = !isManualClose && isOpenTime;
    }

    // Aggregation 1: Monthly History (Last 12 Months)
    const monthlyHistory = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill gaps for Monthly History
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const match = monthlyHistory.find(h => h._id.year === year && h._id.month === month);
      monthlyData.push({
        label: d.toLocaleString('default', { month: 'short' }),
        revenue: match ? match.revenue : 0
      });
    }

    // Aggregation 2: Weekly History (Last 7 Days)
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyHistory = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill gaps for Weekly History
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = weeklyHistory.find(h => h._id === dateStr);
      weeklyData.push({
        label: d.toLocaleString('default', { weekday: 'short' }),
        revenue: match ? match.revenue : 0
      });
    }

    // Aggregation 3: Current Month Stats & Top Products
    const [todaysOrders, monthlyOrdersRaw] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfToday } }),
      Order.find({ createdAt: { $gte: startOfMonth }, status: { $ne: "Cancelled" } })
    ]);

    const dailyRevenue = todaysOrders.reduce((acc, current) => acc + current.grandTotal, 0);
    const dailyOrderCount = todaysOrders.length;
    const currentHourOrders = todaysOrders.filter(o => new Date(o.createdAt) >= startOfHour).length;

    const monthlyRevenue = monthlyOrdersRaw.reduce((acc, curr) => acc + curr.grandTotal, 0);
    const monthlyOrdersCount = monthlyOrdersRaw.length;
    const avgOrderValue = monthlyOrdersCount > 0 ? Math.round(monthlyRevenue / monthlyOrdersCount) : 0;

    // Total Juices Today & Product Sales mapping
    let totalJuicesToday = 0;
    const productSells: Record<string, { units: number, revenue: number }> = {};

    monthlyOrdersRaw.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productSells[item.name]) {
          productSells[item.name] = { units: 0, revenue: 0 };
        }
        productSells[item.name].units += item.quantity;
        productSells[item.name].revenue += item.lineTotal;

        if (new Date(order.createdAt) >= startOfToday) {
          totalJuicesToday += item.quantity;
        }
      });
    });

    // Aggregation 3: Best Product for the current month
    const bestProductAggregation = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: startOfMonth }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 }
    ]);

    const topProductName = bestProductAggregation.length > 0 ? bestProductAggregation[0]._id : "No data";

    const sortedProducts = Object.entries(productSells)
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5)
      .map(([name, data]: [string, any]) => ({
        name,
        units: data.units,
        revenue: data.revenue,
        status: "In Stock",
        trend: "up"
      }));

    return NextResponse.json({
      pulse: {
        dailyRevenue,
        dailyOrderCount,
        topProduct: topProductName,
      },
      stats: {
        currentHourOrders,
        totalJuicesToday,
        kitchenCapacity: "88%",
        monthlyRevenue,
        monthlyOrdersCount,
        avgOrderValue,
        isShopOpen
      },
      revenueHistory: {
        Monthly: monthlyData,
        Weekly: weeklyData
      },
      topProducts: sortedProducts.length > 0 ? sortedProducts : [
        { name: "No Data Yet", units: 0, revenue: 0, status: "-", trend: "stable" }
      ]
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Failed to load dashboard data", error: error.message },
      { status: 500 }
    );
  }
}
