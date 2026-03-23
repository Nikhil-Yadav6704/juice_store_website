import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Fetch Today's Pulse and Monthly Aggregates in parallel
    const [todaysOrders, monthlyOrdersRaw] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfDay } }).select("grandTotal items createdAt"),
      Order.find({ createdAt: { $gte: startOfMonth } }).select("grandTotal items createdAt")
    ]);

    const dailyRevenue = todaysOrders.reduce((acc, current) => acc + current.grandTotal, 0);
    const dailyOrderCount = todaysOrders.length;

    const monthlyRevenue = monthlyOrdersRaw.reduce((acc, curr) => acc + curr.grandTotal, 0);
    const monthlyOrdersCount = monthlyOrdersRaw.length;
    const avgOrderValue = monthlyOrdersCount > 0 ? Math.round(monthlyRevenue / monthlyOrdersCount) : 0;

    // Current Hour
    const currentHourOrders = todaysOrders.filter(o => new Date(o.createdAt) >= startOfHour).length;

    // Total Juices Today & Product Sales mapping
    let totalJuicesToday = 0;
    const productSells: Record<string, { units: number, revenue: number }> = {};

    monthlyOrdersRaw.forEach(order => {
      order.items.forEach((item: any) => {
        // Aggregate monthly stats for Top Products
        if (!productSells[item.name]) {
           productSells[item.name] = { units: 0, revenue: 0 };
        }
        productSells[item.name].units += item.quantity;
        productSells[item.name].revenue += item.lineTotal;

        // Aggregate today's juicing counts
        if (new Date(order.createdAt) >= startOfDay) {
           totalJuicesToday += item.quantity;
        }
      });
    });

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

    const topProductName = sortedProducts.length > 0 ? sortedProducts[0].name : "-";

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
        avgOrderValue
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
