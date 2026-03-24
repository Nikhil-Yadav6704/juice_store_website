import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

    // General Orders Fetch
    const allOrders = await Order.find({ status: { $ne: 'Cancelled' } }).lean();

    // 1. Dashboard Stat Cards
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfToday).length;
    const yesterdayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfYesterday && new Date(o.createdAt) < startOfToday).length;
    const todayOrdersPercent = yesterdayOrders === 0 ? 100 : Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100);

    const weeklyOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfWeek).length;
    const lastWeekOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfLastWeek && new Date(o.createdAt) < startOfWeek).length;
    const weeklyOrdersPercent = lastWeekOrders === 0 ? 100 : Math.round(((weeklyOrders - lastWeekOrders) / lastWeekOrders) * 100);

    const monthlyOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;
    const lastMonthOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfLastMonth && new Date(o.createdAt) < startOfMonth).length;
    const monthlyOrdersPercent = lastMonthOrders === 0 ? 100 : Math.round(((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100);

    const totalVolume = allOrders.length;

    // 2. Orders per Day (Last 30 Days)
    const ordersMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ordersMap[dateStr] = 0;
    }
    
    allOrders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      if (orderDate >= thirtyDaysAgo) {
        const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (ordersMap[dateStr] !== undefined) {
          ordersMap[dateStr]++;
        }
      }
    });

    const ordersPerDay = Object.keys(ordersMap).map(date => ({
      date,
      count: ordersMap[date]
    }));

    // 3. Product Performance & Cross Selling Analytics
    const productStats: Record<string, { units: number, revenue: number }> = {};
    const coOccurrences: Record<string, Record<string, number>> = {};
    const itemFrequencies: Record<string, number> = {};

    allOrders.forEach(o => {
      const orderItems = o.items.map((i: any) => i.name);
      o.items.forEach((item: any) => {
        // Individual product stats
        if (!productStats[item.name]) productStats[item.name] = { units: 0, revenue: 0 };
        productStats[item.name].units += item.quantity;
        productStats[item.name].revenue += item.lineTotal;
        
        // Frequency for cross-sell denominator
        if (!itemFrequencies[item.name]) itemFrequencies[item.name] = 0;
        itemFrequencies[item.name]++;
        
        // Co-occurrence
        if (!coOccurrences[item.name]) coOccurrences[item.name] = {};
        orderItems.forEach((partner: string) => {
          if (partner !== item.name) {
            if (!coOccurrences[item.name][partner]) coOccurrences[item.name][partner] = 0;
            coOccurrences[item.name][partner]++;
          }
        });
      });
    });

    const productPerformance = Object.entries(productStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        units: data.units,
        revenue: data.revenue,
        trend: data.revenue > 100 ? 'up' : 'down',
      }));

    // Simple Cross-Selling Engine
    let bestPair = { items: ["-", "-"], rate: 0 };
    let worstPair = { items: ["-", "-"], rate: 100 };

    Object.keys(coOccurrences).forEach(itemA => {
      Object.keys(coOccurrences[itemA]).forEach(itemB => {
        // attachment rate = times A and B bought together / times A bought
        const rate = (coOccurrences[itemA][itemB] / itemFrequencies[itemA]) * 100;
        if (rate > bestPair.rate) bestPair = { items: [itemA, itemB], rate: Math.round(rate) };
        if (rate > 0 && rate < worstPair.rate) worstPair = { items: [itemA, itemB], rate: Math.round(rate) };
      });
    });

    // 4. Peak Order Hours (Morning vs Afternoon)
    let morningOrders = 0;
    let totalTracked = 0;
    allOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      totalTracked++;
      if (h >= 6 && h < 12) morningOrders++;
    });
    const morningPercent = totalTracked > 0 ? Math.round((morningOrders / totalTracked) * 100) : 0;

    // 5. User Behavior
    const allUsers = await User.find({ role: { $ne: 'admin' } }).lean();
    const activeUsers = allUsers.length; // Simplified active users
    const activeUsersMoM = 12; // Static positive indicator for dummy MoM change

    let recurringCount = 0;
    let newLeadsCount = 0;
    
    allUsers.forEach((u: any) => {
      if (u.ordersCount > 1) recurringCount++;
      else newLeadsCount++;
    });
    
    const atRiskCount = Math.max(0, activeUsers - recurringCount - newLeadsCount);

    // 6. Revenue Growth (Wholesale vs Consumer real split logic)
    const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const analyticsHistoryRaw = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: sevenMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            isWholesale: { $eq: ["$deliveryType", "hourly"] }
          },
          amount: { $sum: "$grandTotal" }
        }
      }
    ]);

    const wholesaleTotal = analyticsHistoryRaw.filter(h => h._id.isWholesale).reduce((acc, curr) => acc + curr.amount, 0);
    const consumerTotal = analyticsHistoryRaw.filter(h => !h._id.isWholesale).reduce((acc, curr) => acc + curr.amount, 0);

    const revenueHistory = [];
    for (let i = 6; i >= 0; i--) {
       const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
       const year = monthDate.getFullYear();
       const month = monthDate.getMonth() + 1;
       
       const wholesale = analyticsHistoryRaw.find(h => h._id.year === year && h._id.month === month && h._id.isWholesale)?.amount || 0;
       const consumer = analyticsHistoryRaw.find(h => h._id.year === year && h._id.month === month && !h._id.isWholesale)?.amount || 0;

       revenueHistory.push({
          period: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          wholesale,
          consumer
       });
    }

    return NextResponse.json({
      cards: {
        today: { value: todayOrders, percent: todayOrdersPercent },
        weekly: { value: weeklyOrders, percent: weeklyOrdersPercent },
        monthly: { value: monthlyOrders, percent: monthlyOrdersPercent },
        totalVolume: { value: totalVolume }
      },
      ordersPerDay,
      productPerformance,
      crossSelling: {
        strongest: bestPair.rate > 0 ? `${bestPair.items[0]} + ${bestPair.items[1]}` : "Not enough data",
        strongestRate: bestPair.rate,
        missed: worstPair.rate < 100 ? `${worstPair.items[0]} + ${worstPair.items[1]}` : "Not enough data",
        missedRate: worstPair.rate
      },
      peakHours: {
        morningPercent
      },
      userBehavior: {
        activeUsers,
        activeUsersMoM,
        recurring: recurringCount,
        newLeads: newLeadsCount,
        atRisk: atRiskCount
      },
      revenueGrowth: {
        wholesaleTotal: wholesaleTotal,
        consumerTotal: consumerTotal,
        history: revenueHistory
      }
    });
  } catch (error: any) {
    console.error("Admin analytics API error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Failed to load analytics", error: error.message },
      { status: 500 }
    );
  }
}
