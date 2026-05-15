// Mock data matching real Financa5 ERP database structure
// Shapes match: Financa5Product and Financa5Category TypeScript interfaces

const categories = [
  { id: "LAP",  name: "Laptop & Notebook",       parentId: null, level: 1, sortOrder: 1,  isActive: true },
  { id: "MON",  name: "Monitor & Display",        parentId: null, level: 1, sortOrder: 2,  isActive: true },
  { id: "PRI",  name: "Printer & Scanner",        parentId: null, level: 1, sortOrder: 3,  isActive: true },
  { id: "NET",  name: "Networking & Wi-Fi",       parentId: null, level: 1, sortOrder: 4,  isActive: true },
  { id: "COM",  name: "Desktop & Server",         parentId: null, level: 1, sortOrder: 5,  isActive: true },
  { id: "ACC",  name: "Aksesorë & Periferikë",   parentId: null, level: 1, sortOrder: 6,  isActive: true },
  { id: "STO",  name: "Ruajtje & Memorie",        parentId: null, level: 1, sortOrder: 7,  isActive: true },
  { id: "UPS",  name: "UPS & Energji",            parentId: null, level: 1, sortOrder: 8,  isActive: true },
];

const products = [
  // ── Laptops ──────────────────────────────────────────────────────────────
  {
    id: 1, kod: "LAP-001", barcode: "5901234567001",
    name: "Laptop Lenovo ThinkPad E15 Gen 4 i5-1235U 8GB 256GB SSD",
    price: 54990, priceWithVat: 65988, vatRate: 20, costPrice: 46000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "LEN-001", stock: 12, isActive: true,
  },
  {
    id: 2, kod: "LAP-002", barcode: "5901234567002",
    name: "Laptop HP EliteBook 840 G9 i7-1255U 16GB 512GB SSD",
    price: 89990, priceWithVat: 107988, vatRate: 20, costPrice: 76000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "HP-001", stock: 5, isActive: true,
  },
  {
    id: 3, kod: "LAP-003", barcode: "5901234567003",
    name: "Laptop Dell Latitude 5530 i5-1235U 16GB 512GB SSD 15.6\"",
    price: 79500, priceWithVat: 95400, vatRate: 20, costPrice: 67000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "DEL-001", stock: 8, isActive: true,
  },
  {
    id: 4, kod: "LAP-004", barcode: "5901234567004",
    name: "Laptop ASUS VivoBook 15 i3-1215U 8GB 256GB SSD",
    price: 39990, priceWithVat: 47988, vatRate: 20, costPrice: 33000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "ASU-001", stock: 20, isActive: true,
  },
  {
    id: 5, kod: "LAP-005", barcode: "5901234567005",
    name: "Laptop Apple MacBook Air M2 8GB 256GB Space Gray",
    price: 129900, priceWithVat: 155880, vatRate: 20, costPrice: 112000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "APL-001", stock: 3, isActive: true,
  },
  {
    id: 6, kod: "LAP-006", barcode: "5901234567006",
    name: "Laptop Lenovo IdeaPad 3 Ryzen 5 7520U 8GB 512GB SSD",
    price: 44990, priceWithVat: 53988, vatRate: 20, costPrice: 38000,
    unit: "Cope", categoryId: "LAP", categoryName: "Laptop & Notebook",
    supplierCode: "LEN-002", stock: 15, isActive: true,
  },

  // ── Monitors ─────────────────────────────────────────────────────────────
  {
    id: 7, kod: "MON-001", barcode: "5901234568001",
    name: "Monitor Dell P2422H 24\" FHD IPS 60Hz",
    price: 19990, priceWithVat: 23988, vatRate: 20, costPrice: 16500,
    unit: "Cope", categoryId: "MON", categoryName: "Monitor & Display",
    supplierCode: "DEL-M01", stock: 18, isActive: true,
  },
  {
    id: 8, kod: "MON-002", barcode: "5901234568002",
    name: "Monitor LG 27UL500-W 27\" 4K UHD IPS",
    price: 32990, priceWithVat: 39588, vatRate: 20, costPrice: 28000,
    unit: "Cope", categoryId: "MON", categoryName: "Monitor & Display",
    supplierCode: "LGE-M01", stock: 7, isActive: true,
  },
  {
    id: 9, kod: "MON-003", barcode: "5901234568003",
    name: "Monitor Samsung 32\" Curved VA 144Hz FHD",
    price: 24500, priceWithVat: 29400, vatRate: 20, costPrice: 20500,
    unit: "Cope", categoryId: "MON", categoryName: "Monitor & Display",
    supplierCode: "SAM-M01", stock: 10, isActive: true,
  },

  // ── Printers ─────────────────────────────────────────────────────────────
  {
    id: 10, kod: "PRI-001", barcode: "5901234569001",
    name: "Printer HP LaserJet Pro M404dn Monochrome",
    price: 29990, priceWithVat: 35988, vatRate: 20, costPrice: 25000,
    unit: "Cope", categoryId: "PRI", categoryName: "Printer & Scanner",
    supplierCode: "HP-P01", stock: 6, isActive: true,
  },
  {
    id: 11, kod: "PRI-002", barcode: "5901234569002",
    name: "Printer Canon PIXMA G3430 MegaTank Wi-Fi Color",
    price: 19990, priceWithVat: 23988, vatRate: 20, costPrice: 16500,
    unit: "Cope", categoryId: "PRI", categoryName: "Printer & Scanner",
    supplierCode: "CAN-P01", stock: 9, isActive: true,
  },
  {
    id: 12, kod: "PRI-003", barcode: "5901234569003",
    name: "Printer Brother MFC-L2710DW Laser Multifunksional",
    price: 22990, priceWithVat: 27588, vatRate: 20, costPrice: 19000,
    unit: "Cope", categoryId: "PRI", categoryName: "Printer & Scanner",
    supplierCode: "BRO-P01", stock: 4, isActive: true,
  },

  // ── Networking ───────────────────────────────────────────────────────────
  {
    id: 13, kod: "NET-001", barcode: "5901234570001",
    name: "Router TP-Link Archer AX55 Wi-Fi 6 AX3000",
    price: 8990, priceWithVat: 10788, vatRate: 20, costPrice: 7200,
    unit: "Cope", categoryId: "NET", categoryName: "Networking & Wi-Fi",
    supplierCode: "TPL-N01", stock: 25, isActive: true,
  },
  {
    id: 14, kod: "NET-002", barcode: "5901234570002",
    name: "Switch TP-Link TL-SG108 8-Port Gigabit Unmanaged",
    price: 3490, priceWithVat: 4188, vatRate: 20, costPrice: 2900,
    unit: "Cope", categoryId: "NET", categoryName: "Networking & Wi-Fi",
    supplierCode: "TPL-N02", stock: 40, isActive: true,
  },
  {
    id: 15, kod: "NET-003", barcode: "5901234570003",
    name: "Access Point Ubiquiti UniFi U6-Lite Wi-Fi 6",
    price: 12990, priceWithVat: 15588, vatRate: 20, costPrice: 10800,
    unit: "Cope", categoryId: "NET", categoryName: "Networking & Wi-Fi",
    supplierCode: "UBQ-N01", stock: 11, isActive: true,
  },
  {
    id: 16, kod: "NET-004", barcode: "5901234570004",
    name: "Kabëll UTP Cat6 CCA 305m (spool)",
    price: 5490, priceWithVat: 6588, vatRate: 20, costPrice: 4500,
    unit: "Rol", categoryId: "NET", categoryName: "Networking & Wi-Fi",
    supplierCode: "KAB-N01", stock: 30, isActive: true,
  },

  // ── Accessories ──────────────────────────────────────────────────────────
  {
    id: 17, kod: "ACC-001", barcode: "5901234571001",
    name: "Mouse Logitech MX Master 3S Wireless",
    price: 7490, priceWithVat: 8988, vatRate: 20, costPrice: 6200,
    unit: "Cope", categoryId: "ACC", categoryName: "Aksesorë & Periferikë",
    supplierCode: "LOG-A01", stock: 35, isActive: true,
  },
  {
    id: 18, kod: "ACC-002", barcode: "5901234571002",
    name: "Tastierë Logitech MK540 Wireless Combo (AL Layout)",
    price: 4990, priceWithVat: 5988, vatRate: 20, costPrice: 4100,
    unit: "Cope", categoryId: "ACC", categoryName: "Aksesorë & Periferikë",
    supplierCode: "LOG-A02", stock: 28, isActive: true,
  },
  {
    id: 19, kod: "ACC-003", barcode: "5901234571003",
    name: "Headset Jabra Evolve2 55 UC Wireless Stereo",
    price: 32990, priceWithVat: 39588, vatRate: 20, costPrice: 28000,
    unit: "Cope", categoryId: "ACC", categoryName: "Aksesorë & Periferikë",
    supplierCode: "JAB-A01", stock: 6, isActive: true,
  },
  {
    id: 20, kod: "ACC-004", barcode: "5901234571004",
    name: "Webcam Logitech C920 HD Pro 1080p",
    price: 5990, priceWithVat: 7188, vatRate: 20, costPrice: 5000,
    unit: "Cope", categoryId: "ACC", categoryName: "Aksesorë & Periferikë",
    supplierCode: "LOG-A03", stock: 22, isActive: true,
  },

  // ── Storage ──────────────────────────────────────────────────────────────
  {
    id: 21, kod: "STO-001", barcode: "5901234572001",
    name: "SSD Samsung 870 EVO 500GB SATA 2.5\"",
    price: 5990, priceWithVat: 7188, vatRate: 20, costPrice: 4900,
    unit: "Cope", categoryId: "STO", categoryName: "Ruajtje & Memorie",
    supplierCode: "SAM-S01", stock: 50, isActive: true,
  },
  {
    id: 22, kod: "STO-002", barcode: "5901234572002",
    name: "SSD Samsung 980 Pro 1TB NVMe M.2",
    price: 9990, priceWithVat: 11988, vatRate: 20, costPrice: 8400,
    unit: "Cope", categoryId: "STO", categoryName: "Ruajtje & Memorie",
    supplierCode: "SAM-S02", stock: 30, isActive: true,
  },
  {
    id: 23, kod: "STO-003", barcode: "5901234572003",
    name: "RAM Kingston 16GB DDR4 3200MHz CL22",
    price: 3990, priceWithVat: 4788, vatRate: 20, costPrice: 3300,
    unit: "Cope", categoryId: "STO", categoryName: "Ruajtje & Memorie",
    supplierCode: "KIN-S01", stock: 45, isActive: true,
  },
  {
    id: 24, kod: "STO-004", barcode: "5901234572004",
    name: "HDD Seagate BarraCuda 2TB 3.5\" 7200rpm",
    price: 4990, priceWithVat: 5988, vatRate: 20, costPrice: 4100,
    unit: "Cope", categoryId: "STO", categoryName: "Ruajtje & Memorie",
    supplierCode: "SEA-S01", stock: 20, isActive: true,
  },

  // ── UPS ──────────────────────────────────────────────────────────────────
  {
    id: 25, kod: "UPS-001", barcode: "5901234573001",
    name: "UPS APC Back-UPS 650VA 230V AVR",
    price: 8990, priceWithVat: 10788, vatRate: 20, costPrice: 7500,
    unit: "Cope", categoryId: "UPS", categoryName: "UPS & Energji",
    supplierCode: "APC-U01", stock: 14, isActive: true,
  },
  {
    id: 26, kod: "UPS-002", barcode: "5901234573002",
    name: "UPS APC Smart-UPS 1500VA LCD RM 2U 230V",
    price: 34990, priceWithVat: 41988, vatRate: 20, costPrice: 29500,
    unit: "Cope", categoryId: "UPS", categoryName: "UPS & Energji",
    supplierCode: "APC-U02", stock: 4, isActive: true,
  },

  // ── Desktops ─────────────────────────────────────────────────────────────
  {
    id: 27, kod: "COM-001", barcode: "5901234574001",
    name: "Desktop HP ProDesk 400 G9 i5-13500 8GB 256GB SSD",
    price: 54990, priceWithVat: 65988, vatRate: 20, costPrice: 46000,
    unit: "Cope", categoryId: "COM", categoryName: "Desktop & Server",
    supplierCode: "HP-C01", stock: 7, isActive: true,
  },
  {
    id: 28, kod: "COM-002", barcode: "5901234574002",
    name: "Server Dell PowerEdge T150 Xeon E-2314 16GB 1TB",
    price: 119900, priceWithVat: 143880, vatRate: 20, costPrice: 100000,
    unit: "Cope", categoryId: "COM", categoryName: "Desktop & Server",
    supplierCode: "DEL-C01", stock: 2, isActive: true,
  },
];

module.exports = { products, categories };
