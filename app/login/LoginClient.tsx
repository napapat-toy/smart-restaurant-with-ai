"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginStaff } from "@/app/actions/auth";
import { Lock, UserCircle } from "lucide-react";

export default function LoginClient() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cashier";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const result = await loginStaff(pin, callbackUrl);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If successful, the action will redirect
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">พนักงาน (Staff Login)</h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            กรุณาใส่รหัส PIN เพื่อเข้าใช้งานระบบแคชเชียร์และห้องครัว
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <UserCircle size={20} />
              </span>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="รหัส PIN หรือ Admin Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-medium"
                required
              />
            </div>
            {error && <p className="text-rose-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
