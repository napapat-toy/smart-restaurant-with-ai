export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
};

export type Table = {
  id: string;
  tableNumber: string;
  status: 'Available' | 'Occupied';
  token: string;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
};

export type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Cooking' | 'Served' | 'Paid' | 'Cancelled';
  createdAt: Date;
};

// --- Mock Data ---

export const mockMenuItems: MenuItem[] = [
  {
    id: "m1",
    name: "ข้าวกะเพราหมูสับไข่ดาว",
    description: "รสจัดจ้าน เผ็ดกำลังดี หอมกลิ่นใบกะเพราแท้ๆ",
    price: 60,
    image: "https://images.unsplash.com/photo-1626804475297-4160aaeaba1c?auto=format&fit=crop&w=600&q=80",
    category: "อาหารจานหลัก",
    isAvailable: true,
  },
  {
    id: "m2",
    name: "ต้มยำกุ้งน้ำข้น",
    description: "กุ้งแม่น้ำตัวโต น้ำซุปเข้มข้น หอมเครื่องต้มยำ",
    price: 150,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&w=600&q=80",
    category: "อาหารจานหลัก",
    isAvailable: true,
  },
  {
    id: "m3",
    name: "สลัดแซลมอนรมควัน",
    description: "ผักสลัดออร์แกนิค เสิร์ฟพร้อมน้ำสลัดยูซุรสเปรี้ยวอมหวาน",
    price: 180,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    category: "อาหารเรียกน้ำย่อย",
    isAvailable: true,
  },
  {
    id: "m4",
    name: "ปอเปี๊ยะทอด",
    description: "ไส้ผักวุ้นเส้น ทอดกรอบ ทานคู่กับน้ำจิ้มบ๊วย",
    price: 60,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    category: "อาหารเรียกน้ำย่อย",
    isAvailable: true,
  },
  {
    id: "m5",
    name: "ชาไทยเย็น",
    description: "หอมหวานชื่นใจ ต้นตำรับชาไทยแท้",
    price: 40,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    category: "เครื่องดื่ม",
    isAvailable: true,
  },
  {
    id: "m6",
    name: "อิตาเลี่ยนโซดาสตรอว์เบอร์รี่",
    description: "ซ่าสดชื่น ดับกระหายคลายร้อน",
    price: 50,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    category: "เครื่องดื่ม",
    isAvailable: true,
  }
];

export const mockTables: Table[] = [
  { id: "t1", tableNumber: "1", status: "Available", token: "tok_t1_xyz" },
  { id: "t2", tableNumber: "2", status: "Occupied", token: "tok_t2_xyz" },
  { id: "t3", tableNumber: "3", status: "Available", token: "tok_t3_xyz" },
  { id: "t4", tableNumber: "4", status: "Available", token: "tok_t4_xyz" },
  { id: "t5", tableNumber: "5", status: "Occupied", token: "tok_t5_xyz" },
  { id: "t6", tableNumber: "6", status: "Available", token: "tok_t6_xyz" },
  { id: "t7", tableNumber: "7", status: "Available", token: "tok_t7_xyz" },
  { id: "t8", tableNumber: "8", status: "Occupied", token: "tok_t8_xyz" },
  { id: "t9", tableNumber: "9", status: "Available", token: "tok_t9_xyz" },
  { id: "t10", tableNumber: "10", status: "Available", token: "tok_t10_xyz" },
];

export const mockOrders: Order[] = [];
