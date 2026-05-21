"use client";

import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";


interface OptionsSelectionModalProps {
  item: any | null;
  selectedOptions: Record<string, string[]>;
  onClose: () => void;
  onToggleOption: (groupName: string, choiceName: string, allowMultiple: boolean) => void;
  onConfirm: () => void;
}

export function OptionsSelectionModal({
  item,
  selectedOptions,
  onClose,
  onToggleOption,
  onConfirm
}: OptionsSelectionModalProps) {
  if (!item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-h-[85vh]">
        <header className="modal-header">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{formatPrice(item.price)}</p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {item.options && item.options.map((group: any) => (
            <div key={group.name} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  {group.name}
                  {group.required && (
                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded font-medium">จำเป็น</span>
                  )}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {group.allowMultiple ? "เลือกได้หลายอย่าง" : "เลือกได้ 1 อย่าง"}
                </span>
              </div>

              <div className="space-y-2">
                {group.choices.map((choice: any) => {
                  const isSelected = (selectedOptions[group.name] || []).includes(choice.name);
                  return (
                    <button
                      key={choice.name}
                      onClick={() => onToggleOption(group.name, choice.name, group.allowMultiple)}
                      className={`w-full flex justify-between items-center p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </span>
                        {choice.name}
                      </span>
                      {choice.priceDelta > 0 && (
                        <span className="text-blue-600 font-semibold">+ {formatPrice(choice.priceDelta)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button
            onClick={onConfirm}
            className="w-full bg-blue-600 text-white font-semibold rounded-2xl py-4 hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            ใส่ตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
