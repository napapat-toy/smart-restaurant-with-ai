import { Plus, FileKey2 } from "lucide-react";

interface TablesTabProps {
  tables: any[];
  onAddTable: () => void;
  onResetToken: (id: string) => void;
}

export function TablesTab({ tables, onAddTable, onResetToken }: TablesTabProps) {
  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">จัดการโต๊ะและลิงก์ QR</h2>
          <p className="text-slate-500 mt-1">รีเซ็ต Token เพื่อป้องกันคนนำลิงก์เก่ามาสั่งอาหารแกล้ง</p>
        </div>
        <button onClick={onAddTable} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={20} /> เพิ่มโต๊ะใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table: any) => (
          <div key={table._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl text-xl font-bold">
                {table.tableNumber}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${table.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {table.status}
              </span>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2 font-mono break-all">{table.token}</p>
              <button 
                onClick={() => onResetToken(table._id)}
                className="w-full flex justify-center items-center gap-2 text-sm text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 py-2 rounded-lg transition-colors"
              >
                <FileKey2 size={16} /> รีเซ็ต Token (ลิงก์ QR)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
