import crypto from "crypto";

/**
 * Formats any number to a gorgeous Thai Baht currency string.
 * @param amount Number to format
 * @returns Formatted Thai Baht string (e.g. ฿120, ฿1,500)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a Date or timestamp string into a beautiful Thai Buddhist Era calendar string.
 * @param date Date, string, or number representing a timestamp
 * @returns Thai formatted timestamp string (e.g. 18 พ.ค. 2569, 04:19 น.)
 */
export function formatDateTime(date: Date | string | number): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const formatted = d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatted} น.`;
}

/**
 * Standardized status translator and tailwind class mapper for order status.
 * Ensures DRY principles across Cashier, Kitchen, and Customer drawers.
 */
export function translateOrderStatus(status: string): { text: string; colorClass: string; bgClass: string; borderClass: string } {
  switch (status) {
    case "Pending":
      return { 
        text: "รอดำเนินการ", 
        colorClass: "text-amber-700", 
        bgClass: "bg-amber-50", 
        borderClass: "border-amber-100" 
      };
    case "Cooking":
      return { 
        text: "กำลังปรุง", 
        colorClass: "text-blue-700", 
        bgClass: "bg-blue-50", 
        borderClass: "border-blue-100" 
      };
    case "Ready":
      return { 
        text: "ปรุงเสร็จพร้อมเสิร์ฟ", 
        colorClass: "text-purple-700", 
        bgClass: "bg-purple-50", 
        borderClass: "border-purple-100" 
      };
    case "Served":
      return { 
        text: "เสิร์ฟแล้ว", 
        colorClass: "text-emerald-700", 
        bgClass: "bg-emerald-50", 
        borderClass: "border-emerald-100" 
      };
    case "Cancelled":
      return { 
        text: "ยกเลิกแล้ว", 
        colorClass: "text-rose-700", 
        bgClass: "bg-rose-50", 
        borderClass: "border-rose-100" 
      };
    case "Paid":
      return { 
        text: "ชำระเงินแล้ว", 
        colorClass: "text-slate-700", 
        bgClass: "bg-slate-50", 
        borderClass: "border-slate-200" 
      };
    default:
      return { 
        text: status || "ไม่ระบุ", 
        colorClass: "text-slate-600", 
        bgClass: "bg-slate-50", 
        borderClass: "border-slate-100" 
      };
  }
}

/**
 * Standardized status translator and tailwind class mapper for table status.
 */
export function translateTableStatus(status: string): { text: string; colorClass: string; bgClass: string; borderClass: string } {
  switch (status) {
    case "Occupied":
      return { 
        text: "มีลูกค้า (ใช้งานอยู่)", 
        colorClass: "text-rose-700", 
        bgClass: "bg-rose-50", 
        borderClass: "border-rose-150" 
      };
    case "Vacant":
      return { 
        text: "ว่าง (พร้อมบริการ)", 
        colorClass: "text-emerald-700", 
        bgClass: "bg-emerald-50", 
        borderClass: "border-emerald-150" 
      };
    default:
      return { 
        text: status || "ไม่ระบุ", 
        colorClass: "text-slate-600", 
        bgClass: "bg-slate-50", 
        borderClass: "border-slate-150" 
      };
  }
}

/**
 * Generates a cryptographically secure random hexadecimal token.
 * Highly useful for session tokens, password resets, or API authentication tags.
 */
export function generateSecureToken(bytesCount = 16): string {
  return crypto.randomBytes(bytesCount).toString("hex");
}
