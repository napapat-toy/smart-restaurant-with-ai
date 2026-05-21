"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import { Settings } from "@/models/Settings";
import { RateLimit } from "@/models/RateLimit";

export async function loginStaff(pin: string, callbackUrl: string) {
  await connectToDatabase();
  
  // 1. Check Brute Force (Rate Limit by IP)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown-ip";
  
  const rateLimit = await RateLimit.findOne({ ip });
  if (rateLimit && rateLimit.attempts >= 5) {
    return { error: "ใส่รหัสผิดเกิน 5 ครั้ง กรุณารอ 15 นาที" };
  }

  // Helper to record failed attempt
  const recordFailedAttempt = async () => {
    const expireAt = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
    if (rateLimit) {
      rateLimit.attempts += 1;
      rateLimit.expireAt = expireAt;
      await rateLimit.save();
    } else {
      await RateLimit.create({ ip, attempts: 1, expireAt });
    }
    // Also add a slow-down to deter basic bots
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: "รหัส PIN ไม่ถูกต้อง" };
  };

  // Helper to clear attempts on success
  const handleSuccess = async (role: "admin" | "cashier" | "kitchen", defaultUrl: string) => {
    if (rateLimit) await RateLimit.deleteOne({ ip });
    await setAuthCookie(role);
    
    // Determine the target URL based on role permissions
    let targetUrl = defaultUrl;
    if (callbackUrl) {
      if (role === "admin") {
        targetUrl = callbackUrl;
      } else if (role === "cashier" && callbackUrl.startsWith("/cashier")) {
        targetUrl = callbackUrl;
      } else if (role === "kitchen" && callbackUrl.startsWith("/kitchen")) {
        targetUrl = callbackUrl;
      }
    }
    
    redirect(targetUrl);
  };

  // Get admin password from env
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  // Check Admin
  if (pin === adminPassword) {
    await handleSuccess("admin", "/admin");
  }

  // Get Settings from DB
  const settings = await Settings.findOne();
  if (!settings) {
    return { error: "ระบบยังไม่ได้ตั้งค่า กรุณาเข้าสู่ระบบด้วย Admin" };
  }

  // Check roles
  if (pin === settings.cashierPin) {
    await handleSuccess("cashier", "/cashier");
  } else if (pin === settings.kitchenPin) {
    await handleSuccess("kitchen", "/kitchen");
  }

  return await recordFailedAttempt();
}

export async function logoutStaff() {
  const cookieStore = await cookies();
  cookieStore.delete("staff_role_admin");
  cookieStore.delete("staff_role_cashier");
  cookieStore.delete("staff_role_kitchen");
  cookieStore.delete("staff_role");
  redirect("/login");
}

async function setAuthCookie(role: "admin" | "cashier" | "kitchen") {
  const cookieStore = await cookies();
  const cookieName = `staff_role_${role}`;
  cookieStore.set(cookieName, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12, // 12 hours expire
    path: "/",
  });
}

export async function verifyRole(allowedRoles: ("admin" | "cashier" | "kitchen")[]) {
  const cookieStore = await cookies();
  
  // Check role-specific cookies first
  for (const role of allowedRoles) {
    const roleVal = cookieStore.get(`staff_role_${role}`)?.value;
    if (roleVal === role) {
      return role;
    }
  }

  // Fallback to legacy cookie for backward compatibility
  const legacyRole = cookieStore.get("staff_role")?.value;
  if (legacyRole && allowedRoles.includes(legacyRole as any)) {
    return legacyRole;
  }

  throw new Error("Unauthorized access - Access denied");
}
