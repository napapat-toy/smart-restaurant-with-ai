import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">กำลังโหลด...</div>}>
      <LoginClient />
    </Suspense>
  );
}
