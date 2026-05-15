"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Printer } from "lucide-react";
import { mockTables } from "@/data/mockDb";

export default function QRGeneratorClient() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Get the current URL base (e.g. http://localhost:3000)
    setBaseUrl(window.location.origin);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
              <QrCode size={28} />
            </div>
            Table QR Codes
          </h1>
          <p className="text-slate-500 mt-2">พิมพ์ QR Code ไปตั้งไว้ที่โต๊ะ เพื่อให้ลูกค้าสแกนสั่งอาหาร</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md"
        >
          <Printer size={20} />
          พิมพ์ QR Code
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 print:grid-cols-3 print:gap-8">
        {mockTables.map(table => {
          const url = `${baseUrl}?table=${table.tableNumber}&token=${table.token}`;
          return (
            <div key={table.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center print:border-slate-300 print:shadow-none break-inside-avoid">
              <div className="text-sm font-bold text-blue-600 mb-1 tracking-widest uppercase">Table</div>
              <div className="text-4xl font-black text-slate-900 mb-6">{table.tableNumber}</div>
              
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-4">
                {baseUrl && (
                  <QRCodeSVG 
                    value={url} 
                    size={120} 
                    level="H" 
                    includeMargin={false}
                    className="w-full h-auto"
                  />
                )}
              </div>
              

              <p className="text-xs font-medium text-slate-600 mt-2 hidden print:block">
                สแกนเพื่อสั่งอาหาร
              </p>
            </div>
          );
        })}
      </div>
      

    </div>
  );
}
