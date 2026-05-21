export type PosProductRow = {
  sku: string;
  name: string;
  barcode: string | null;
  stock: number;
  price: number;
};

export type PosCartLine = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type PosDailySalesLineItem = {
  sku: string | null;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type PosDailySalesOrder = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  isCashClient: boolean;
  customerName: string;
  paymentMethod: string | null;
  orderTotal: number;
  items: PosDailySalesLineItem[];
};

export type PosDailySalesStaffRow = {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  saleCount: number;
  total: number;
  sales: PosDailySalesOrder[];
};

export type PosDailySalesPayload = {
  date: string;
  staff: PosDailySalesStaffRow[];
  grandTotal: number;
  grandCount: number;
};
