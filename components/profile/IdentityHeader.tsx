"use client";

import { Camera } from "lucide-react";

export function IdentityHeader({
  avatarUrl,
  setAvatarUrl,
  setAvatarFile,
  isRecruiter,
  companyName,
  name,
  userEmail,
  accentBg,
  onSave,
}: any) {
  return (
    <div className="relative overflow-hidden rounded-[3rem] p-10 mb-12 border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
      <div
        className={`absolute -top-24 -left-24 w-80 h-80 blur-[140px] opacity-10 rounded-full ${accentBg}`}
      />
      <div className="relative flex items-center gap-8 z-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-xl bg-gray-50 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-full h-full object-cover"
                alt="identity"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            )}
          </div>
          <label
            className={`absolute -bottom-2 -right-2 p-2.5 rounded-xl text-white shadow-lg cursor-pointer hover:scale-110 transition-all ${accentBg}`}
          >
            <Camera size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatarFile(file);
                  setAvatarUrl(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">
            {isRecruiter
              ? companyName || "Organization"
              : name || "Professional"}
          </h1>
          <p className="text-gray-400 font-bold text-sm mt-2 italic">
            {userEmail}
          </p>
        </div>
      </div>
      <button
        onClick={onSave}
        className="bg-black text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-500 transition-all z-10 active:scale-95"
      >
        Sync Profile
      </button>
    </div>
  );
}
