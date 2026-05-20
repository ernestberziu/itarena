import type { PrismaClient } from "@prisma/client";

const DEMO_ORDER_NUMBER = "DEMO-ORD-2026-001";

const demoItems = [
  {
    sku: "HP-LJ-M404",
    name: "HP LaserJet Pro M404dn",
    nameEn: "HP LaserJet Pro M404dn",
    quantity: 2,
    price: 28500,
  },
  {
    sku: "CAT6-305M",
    name: "Kabllo Cat6 UTP 305m",
    nameEn: "Cat6 UTP Cable 305m",
    quantity: 1,
    price: 12000,
  },
  {
    sku: "CAM-HIK-4K",
    name: "Kamera Hikvision 4MP Dome",
    nameEn: "Hikvision 4MP Dome Camera",
    quantity: 4,
    price: 8500,
  },
];

export async function seedDemoOrder(prisma: PrismaClient) {
  const client = await prisma.user.findUnique({
    where: { email: "client@demo.al" },
    select: { id: true, companyId: true },
  });

  if (!client) {
    console.warn("⚠️  Demo client (client@demo.al) not found — run full seed first.");
    return null;
  }

  const subtotal = demoItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const now = new Date();
  const confirmedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const order = await prisma.order.upsert({
    where: { orderNumber: DEMO_ORDER_NUMBER },
    update: {
      userId: client.id,
      companyId: client.companyId,
      items: JSON.stringify(demoItems),
      subtotal,
      total: subtotal,
      status: "CONFIRMED",
      deliveryAddress: "Rruga Demo, Nr. 1, Kati 2",
      deliveryCity: "Tiranë",
      deliveryNotes: "Telefononi 30 min para dorëzimit.",
      contactPhone: "+355 69 123 4567",
      staffNotes: "Porosi demo për testim UI.",
      confirmedAt,
      dispatchedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      cancelReason: null,
    },
    create: {
      orderNumber: DEMO_ORDER_NUMBER,
      userId: client.id,
      companyId: client.companyId,
      items: JSON.stringify(demoItems),
      subtotal,
      total: subtotal,
      status: "CONFIRMED",
      deliveryAddress: "Rruga Demo, Nr. 1, Kati 2",
      deliveryCity: "Tiranë",
      deliveryNotes: "Telefononi 30 min para dorëzimit.",
      contactPhone: "+355 69 123 4567",
      staffNotes: "Porosi demo për testim UI.",
      confirmedAt,
    },
  });

  console.log("✅ Demo order:", order.orderNumber, `(${demoItems.length} artikuj, ${subtotal} Lekë)`);
  return order;
}
