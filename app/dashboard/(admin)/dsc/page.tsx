"use client";

import { useState } from "react";
import { 
  KeyRound, Search, Filter, ShieldCheck, Clock, 
  AlertTriangle, CheckCircle2, Usb, ArrowRight, UserCheck
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";

interface DscItem {
  id: string;
  holderName: string;
  pan: string;
  businessName: string;
  dscClass: "Class 3 - Individual" | "Class 3 - Organization" | "Class 3 - Combo (Sign & Encrypt)";
  usbSerial: string;
  certifyingAuthority: "eMudhra" | "Vsign" | "Capricorn" | "Sify";
  expiryDate: string;
  daysRemaining: number;
  status: "Active" | "Expiring Soon" | "Expired";
}

const mockDscList: DscItem[] = [
  { id: "DSC-801", holderName: "Rahul Sharma", pan: "ABCPS1234F", businessName: "Sharma Sweets & Bakers", dscClass: "Class 3 - Combo (Sign & Encrypt)", usbSerial: "HYP2003-89410", certifyingAuthority: "eMudhra", expiryDate: "18 Oct 2026", daysRemaining: 18, status: "Expiring Soon" },
  { id: "DSC-802", holderName: "Priya Verma", pan: "BCDPV5678G", businessName: "Verma Tex Fabrics", dscClass: "Class 3 - Organization", usbSerial: "EPAS-77412", certifyingAuthority: "Vsign", expiryDate: "14 Jan 2028", daysRemaining: 471, status: "Active" },
  { id: "DSC-803", holderName: "Aman Gupta", pan: "CDEAG9012H", businessName: "Apex Retail Mart", dscClass: "Class 3 - Individual", usbSerial: "CAP-10294", certifyingAuthority: "Capricorn", expiryDate: "20 Dec 2027", daysRemaining: 446, status: "Active" },
  { id: "DSC-804", holderName: "Meera Kapoor", pan: "FGHMK1234L", businessName: "Meera Organic Foods", dscClass: "Class 3 - Combo (Sign & Encrypt)", usbSerial: "HYP2003-90415", certifyingAuthority: "eMudhra", expiryDate: "05 Nov 2026", daysRemaining: 36, status: "Expiring Soon" },
  { id: "DSC-805", holderName: "Suresh Yadav", pan: "GHIYS5678M", businessName: "Yadav Agro Commodities", dscClass: "Class 3 - Organization", usbSerial: "EPAS-66512", certifyingAuthority: "Vsign", expiryDate: "12 Mar 2028", daysRemaining: 528, status: "Active" },
];

export default function DscPage() {
  const [search, setSearch] = useState("");
  const [caFilter, setCaFilter] = useState("ALL");

  const filtered = mockDscList.filter((item) => {
    if (caFilter !== "ALL" && item.certifyingAuthority !== caFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.holderName.toLowerCase().includes(q) ||
        item.pan.toLowerCase().includes(q) ||
        item.usbSerial.toLowerCase().includes(q) ||
        item.businessName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Digital Signature Certificate (DSC) Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Class 3 USB cryptotokens (ePass2003 / HYP2003), paperless video KYC, and certificate issuance.
          </p>
        </div>

        <button className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer">
          <KeyRound className="w-4 h-4" />
          <span>Issue New DSC</span>
        </button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Active DSC Tokens</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={348} /> Units
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Expiring in 30 Days</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              14 Tokens
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Usb className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Hardware Dispatched</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              29 This Month
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">CA Cert Validation</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              100% SHA-256
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holder name, PAN, token serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "eMudhra", "Vsign", "Capricorn"].map((ca) => (
            <button
              key={ca}
              onClick={() => setCaFilter(ca)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                caFilter === ca
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {ca}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-5">Holder Name</th>
                <th className="py-3.5 px-5">PAN</th>
                <th className="py-3.5 px-5">Business Entity</th>
                <th className="py-3.5 px-5">Class & Purpose</th>
                <th className="py-3.5 px-5">USB Serial</th>
                <th className="py-3.5 px-5">Certifying Authority</th>
                <th className="py-3.5 px-5">Expiry Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.holderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.pan}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                    {item.businessName}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {item.dscClass}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400 text-xs">
                    {item.usbSerial}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                    {item.certifyingAuthority}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {item.expiryDate}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      item.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer">
                      Download Certificate &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
