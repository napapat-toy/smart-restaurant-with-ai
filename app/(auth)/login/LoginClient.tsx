"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginStaff } from "@/app/actions/auth";
import { Lock, UserCircle } from "lucide-react";

export default function LoginClient() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      try {
        const result = await loginStaff(pin, callbackUrl);
        if (result?.error) {
          setError(result.error);
        }
      } catch {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
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
                className="auth-input-pin"
                required
              />
            </div>
            {error && <p className="text-rose-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending || pin.length < 4}
            className="btn-auth-submit"
          >
            {isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
