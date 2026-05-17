import MenuClient from "@/app/components/MenuClient";
import { getMenuData } from "@/app/actions/menu";
import connectToDatabase from "@/lib/mongodb";
import { Table } from "@/models/Table";

export default async function Home(props: { searchParams: Promise<{ table?: string, token?: string }> }) {
  const searchParams = await props.searchParams;
  const table = searchParams.table || "1";
  const token = searchParams.token || "";

  await connectToDatabase();
  const tableData = await Table.findOne({ tableNumber: table });

  // If token doesn't match or table not found, show error page
  // (Meaning the table was checked out and the token was rotated)
  if (!tableData || tableData.token !== token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-rose-50 text-rose-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">ลิงก์หมดอายุแล้ว</h1>
          <p className="text-slate-500 mb-2 leading-relaxed">
            เซสชันสำหรับสั่งอาหารของโต๊ะนี้ได้จบลงแล้ว (อาจมีการเช็คบิลหรือย้ายโต๊ะ)
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mt-6 border border-slate-100">
            <p className="text-sm text-slate-600 font-medium">หากต้องการสั่งอาหารเพิ่ม หรือเปิดโต๊ะใหม่<br/>กรุณาแจ้งพนักงานเพื่อรับ QR Code ใหม่ครับ</p>
          </div>
        </div>
      </div>
    );
  }

  const { categories, items } = await getMenuData();

  return <MenuClient tableNumber={table} token={token} initialMenuItems={items} initialCategories={categories} />;
}
