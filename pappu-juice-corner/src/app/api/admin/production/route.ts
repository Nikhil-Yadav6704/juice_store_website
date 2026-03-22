import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Fetch today's orders
  const todaysOrders = await Order.find({ createdAt: { $gte: startOfDay }, status: { $ne: 'Cancelled' } }).populate('items.productId');

  // We are calculating 3 distinct groups:
  // 1. Active Production: 'Pending' | 'Preparing' && 'instant' | 'super_instant'
  // 2. Upcoming Hour: 'Pending' | 'Preparing' && 'hourly'
  // 3. Completed Today: 'Delivered' | 'Out for Delivery'

  const activeMap: Record<string, any> = {};
  const upcomingMap: Record<string, any> = {};
  const completedMap: Record<string, any> = {};

  const getStyleForProduct = (name: string) => {
    const lName = name.toLowerCase();
    if (lName.includes('mango') || lName.includes('orange') || lName.includes('citrus')) return { icon: '🥭', bg: 'bg-[#ffe4c4]' };
    if (lName.includes('green') || lName.includes('celery') || lName.includes('kale') || lName.includes('spinach')) return { icon: '🥬', bg: 'bg-[#d1ecb4]' };
    if (lName.includes('ginger') || lName.includes('turmeric') || lName.includes('beet') || lName.includes('wellness')) return { icon: '🫚', bg: 'bg-[#fadbd8]' };
    if (lName.includes('berry') || lName.includes('strawberry')) return { icon: '🍓', bg: 'bg-[#f5cba7]' };
    return { icon: '🍹', bg: 'bg-surface-container' };
  };

  todaysOrders.forEach((order) => {
    order.items.forEach((item: any) => {
      const pId = item.productId ? item.productId._id.toString() : item.name;
      const styling = getStyleForProduct(item.name);
      
      const isInstant = order.deliveryType === 'instant' || order.deliveryType === 'super_instant';
      
      const payload = {
         id: pId,
         name: item.name,
         count: item.quantity,
         icon: styling.icon,
         bg: styling.bg
      };

      if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
         if (!completedMap[pId]) completedMap[pId] = { ...payload, count: 0 };
         completedMap[pId].count += item.quantity;
      } else {
         // Pending or Preparing
         if (isInstant) {
            if (!activeMap[pId]) activeMap[pId] = { ...payload, count: 0 };
            activeMap[pId].count += item.quantity;
         } else {
            // Hourly blocks
            if (!upcomingMap[pId]) upcomingMap[pId] = { ...payload, count: 0 };
            upcomingMap[pId].count += item.quantity;
         }
      }
    });
  });

  const activeProduction = Object.values(activeMap).sort((a, b) => b.count - a.count);
  const upcomingHour = Object.values(upcomingMap).sort((a, b) => b.count - a.count);
  const completedToday = Object.values(completedMap).sort((a, b) => b.count - a.count).slice(0, 3); // Max 3 completed shown

  // Simulated alerts
  const alerts = [
    {
      type: 'warning',
      icon: 'warning',
      textColor: 'text-[#8f4e00]',
      bgColor: 'bg-[#f2f0e6]',
      borderColor: 'border-[#e6e3d5]',
      title: 'Low Stock Alert',
      item: 'Organic Celery',
      message: 'Only 4kg remaining in prep station. Restock required for next batch.'
    }
  ];

  // Capacity calculation based on active loads (Mocked dynamically)
  const totalActiveItems = activeProduction.reduce((sum, item: any) => sum + item.count, 0) + upcomingHour.reduce((sum, item: any) => sum + item.count, 0);
  let capacityPercent = Math.min(100, Math.max(30, Math.round((totalActiveItems / 200) * 100)));

  return NextResponse.json({
    activeProduction,
    upcomingHour,
    completedToday,
    alerts,
    kitchenStats: {
      capacity: `${capacityPercent}% Capacity`,
      outputStr: `Outputting ${totalActiveItems > 50 ? 142 : 78} units/hr. Optimal pace maintained.`
    }
  });
}
