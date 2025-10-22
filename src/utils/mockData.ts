export interface Product {
  id: string;
  name: string;
  nameZH?: string;
  category: string;
  price: number;
  company: string;
  location: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  rating: number;
  reviews?: number;
  hsCode?: string;
  brand?: string;
  model?: string;
  originCountry?: string;
  province?: string;
  city?: string;
  unit?: string;
  unitPrice?: number;
  currency?: "CNY" | "USD" | "NGN";
  moq?: number;
  supplyAbilityPerMonth?: number;
  quantityAvailable?: number;
  leadTimeDays?: number;
  incoterm?: string;
  portOfShipment?: string;
  description?: string;
  specifications?: string[];
  brochureUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  wechat?: string;
  whatsapp?: string;
  oemAvailable?: boolean;
  odmAvailable?: boolean;
  customPackaging?: boolean;
  sampleAvailable?: boolean;
  certifications?: string[];
  warrantyMonths?: number;
  inquiries?: number;
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  status: "pending" | "shipped" | "delivered";
  date: string;
}

export interface SocialPost {
  id: string;
  username: string;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  timestamp: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Industrial CNC Machinery",
    nameZH: "工业数控机床",
    category: "Manufacturing",
    price: 45000,
    unitPrice: 45000,
    currency: "USD",
    company: "Shanghai Heavy Industries",
    location: "Shanghai, China",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
      "https://images.unsplash.com/photo-1552664730-d307ca884978",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    reviews: 156,
    hsCode: "842210",
    brand: "ShangHai CNC",
    model: "SH-CNC-3000",
    originCountry: "China",
    province: "Shanghai",
    city: "Shanghai",
    unit: "piece",
    moq: 2,
    supplyAbilityPerMonth: 50,
    quantityAvailable: 15,
    leadTimeDays: 30,
    incoterm: "FOB",
    portOfShipment: "Shanghai",
    description: "High-precision industrial CNC machinery for metalworking and manufacturing. Features advanced control systems, reliable performance, and competitive pricing.",
    specifications: [
      "Max Spindle Speed: 6000 RPM",
      "Table Size: 3000 x 1500 mm",
      "X/Y/Z Travel: 3000/1500/1000 mm",
      "Positional Accuracy: ±0.005 mm",
      "Power Consumption: 45 kW",
      "Weight: 25 tons",
    ],
    brochureUrl: "https://example.com/brochure-cnc.pdf",
    contactName: "Mr. Wang Chen",
    contactEmail: "wang.chen@shanghaiheavy.com",
    contactPhone: "+86-21-5555-0000",
    wechat: "wangchen2023",
    whatsapp: "+86-13800000000",
    oemAvailable: true,
    odmAvailable: true,
    customPackaging: true,
    sampleAvailable: false,
    certifications: ["CE", "ISO9001", "RoHS"],
    warrantyMonths: 24,
    inquiries: 47,
  },
  {
    id: "2",
    name: "Electronic Components",
    nameZH: "电子元器件",
    category: "Electronics",
    price: 12000,
    unitPrice: 2.50,
    currency: "USD",
    company: "Shenzhen Tech Ltd",
    location: "Shenzhen, China",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
    ],
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    rating: 4.5,
    reviews: 234,
    hsCode: "854370",
    brand: "TechChip",
    model: "TC-IC-5000",
    originCountry: "China",
    province: "Guangdong",
    city: "Shenzhen",
    unit: "piece",
    moq: 5000,
    supplyAbilityPerMonth: 500000,
    quantityAvailable: 125000,
    leadTimeDays: 15,
    incoterm: "FOB",
    portOfShipment: "Shenzhen",
    description: "Professional-grade electronic components and integrated circuits for consumer and industrial applications. Sourced from reliable manufacturers with quality assurance.",
    specifications: [
      "Voltage Rating: 3.3V - 5V",
      "Operating Temperature: -40°C to 85°C",
      "Lead Free: Yes",
      "RoHS Compliant: Yes",
      "Package: SMD/DIP",
      "Stock: 125,000+ units",
    ],
    brochureUrl: "https://example.com/brochure-components.pdf",
    contactName: "Ms. Li Wei",
    contactEmail: "li.wei@shenzhentech.com",
    contactPhone: "+86-755-2888-0000",
    wechat: "liwei_tech",
    whatsapp: "+86-13900000000",
    oemAvailable: true,
    odmAvailable: false,
    customPackaging: true,
    sampleAvailable: true,
    certifications: ["CE", "FCC", "RoHS"],
    warrantyMonths: 12,
    inquiries: 89,
  },
  {
    id: "3",
    name: "Premium Textile Materials",
    nameZH: "优质纺织材料",
    category: "Textiles",
    price: 8500,
    unitPrice: 4.25,
    currency: "USD",
    company: "Guangzhou Fabrics",
    location: "Guangzhou, China",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea3c8f64",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea3c8f64",
      "https://images.unsplash.com/photo-1572302006215-f2c8dccc9a96",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2",
    ],
    videoUrl: "https://www.youtube.com/embed/e-IWRmpefzE",
    rating: 4.7,
    reviews: 178,
    hsCode: "540330",
    brand: "GuangZhou Premium",
    model: "GZ-Fabric-100",
    originCountry: "China",
    province: "Guangdong",
    city: "Guangzhou",
    unit: "kg",
    moq: 100,
    supplyAbilityPerMonth: 5000,
    quantityAvailable: 850,
    leadTimeDays: 20,
    incoterm: "CIF",
    portOfShipment: "Guangzhou",
    description: "High-quality textile materials suitable for apparel, home furnishing, and industrial applications. Durable, eco-friendly, and available in various colors and patterns.",
    specifications: [
      "Material: 100% Polyester",
      "Width: 1.5m",
      "Weight: 200 GSM",
      "Color Fastness: Grade 4-5",
      "Tensile Strength: >25 MPa",
      "Available Colors: 50+",
    ],
    brochureUrl: "https://example.com/brochure-textiles.pdf",
    contactName: "Mr. Zhang Ming",
    contactEmail: "zhang.ming@gzfabrics.com",
    contactPhone: "+86-20-3888-0000",
    wechat: "zhangming_fabric",
    whatsapp: "+86-13700000000",
    oemAvailable: true,
    odmAvailable: true,
    customPackaging: true,
    sampleAvailable: true,
    certifications: ["CE", "ISO9001"],
    warrantyMonths: 6,
    inquiries: 62,
  },
  {
    id: "4",
    name: "Heavy Construction Equipment",
    nameZH: "重型建筑机械",
    category: "Construction",
    price: 67000,
    unitPrice: 67000,
    currency: "USD",
    company: "Beijing Build Co",
    location: "Beijing, China",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789",
    ],
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    rating: 4.9,
    reviews: 92,
    hsCode: "842869",
    brand: "Beijing Builder",
    model: "BB-Excavator-320",
    originCountry: "China",
    province: "Beijing",
    city: "Beijing",
    unit: "piece",
    moq: 1,
    supplyAbilityPerMonth: 20,
    quantityAvailable: 3,
    leadTimeDays: 45,
    incoterm: "DDP",
    portOfShipment: "Qingdao",
    description: "Professional-grade heavy construction equipment including excavators, loaders, and bulldozers. Engineered for durability and performance in demanding environments.",
    specifications: [
      "Bucket Capacity: 2.2 cubic meters",
      "Operating Weight: 32 tons",
      "Max Reach: 10.5 meters",
      "Engine Power: 210 kW",
      "Fuel Tank: 600 liters",
      "Cabin Type: Air-conditioned with ROPS",
    ],
    brochureUrl: "https://example.com/brochure-equipment.pdf",
    contactName: "Mr. Liu Hong",
    contactEmail: "liu.hong@beijingbuild.com",
    contactPhone: "+86-10-5555-0000",
    wechat: "liuhong_builder",
    whatsapp: "+86-13600000000",
    oemAvailable: false,
    odmAvailable: true,
    customPackaging: false,
    sampleAvailable: false,
    certifications: ["CE", "ISO9001", "CCC"],
    warrantyMonths: 36,
    inquiries: 28,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    productName: "Industrial Machinery",
    quantity: 2,
    total: 90000,
    status: "shipped",
    date: "2025-09-15",
  },
  {
    id: "ORD-002",
    productName: "Electronics Components",
    quantity: 10,
    total: 120000,
    status: "delivered",
    date: "2025-09-01",
  },
  {
    id: "ORD-003",
    productName: "Textile Materials",
    quantity: 5,
    total: 42500,
    status: "pending",
    date: "2025-10-01",
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: "1",
    username: "chen_industries",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    likes: 1240,
    comments: 89,
    caption: "New factory opening in Shanghai! 🏭 Ready to serve global partners.",
    timestamp: "2h ago",
  },
  {
    id: "2",
    username: "lagos_trading",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lagos",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec",
    likes: 856,
    comments: 42,
    caption: "Just received our latest shipment! Quality products from China 🚢",
    timestamp: "5h ago",
  },
  {
    id: "3",
    username: "shenzhen_tech",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    likes: 2341,
    comments: 156,
    caption: "Innovation meets tradition. Our new product line launching soon! 💡",
    timestamp: "1d ago",
  },
  {
    id: "4",
    username: "abuja_imports",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abuja",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    likes: 654,
    comments: 31,
    caption: "Building bridges between continents 🌍 #TradeSuccess",
    timestamp: "2d ago",
  },
];
