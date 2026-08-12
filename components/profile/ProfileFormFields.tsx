"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, X, Plus, ChevronDown } from "lucide-react";

export function InputGroup({ label, value, onChange, placeholder, icon }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-6 ${icon ? "pr-12" : "pr-6"} py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none transition-all`}
        />
        {icon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhoneInputGroup({
  label,
  code,
  setCode,
  number,
  setNumber,
  countryData,
}: any) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredData = countryData.filter(
    (c: any) =>
      c.code.includes(searchQuery) ||
      c.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const selected =
    countryData.find(
      (c: any) => c.code === code && (c.label === "IN" || c.label === "US"),
    ) ||
    countryData.find((c: any) => c.code === code) ||
    countryData[0];

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex gap-2" ref={ref}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="bg-gray-50 rounded-2xl px-4 py-4 text-sm font-bold flex items-center gap-2 border-none hover:bg-gray-100 transition-all min-w-[125px]"
          >
            {selected?.flag && (
              <img
                src={selected.flag}
                className="w-5 h-3 object-cover rounded-sm"
                alt="Selected country flag"
              />
            )}
            <span>{code}</span>
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[60] w-64 p-3 space-y-2"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl mb-1">
                  <Search size={14} className="text-gray-400" />
                  <input
                    autoFocus
                    placeholder="Search code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs font-bold w-full"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredData.map((c: any) => (
                    <button
                      type="button"
                      key={c.label + c.code}
                      onClick={() => {
                        setCode(c.code);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-xs font-bold flex items-center gap-3"
                    >
                      {c.flag && (
                        <img
                          src={c.flag}
                          className="w-5 h-3 object-cover rounded-sm"
                          alt=""
                        />
                      )}
                      <span className="text-gray-400 w-6 uppercase">
                        {c.label}
                      </span>
                      <span className="flex-1 text-right font-black">
                        {c.code}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative flex-1">
          <input
            type="tel"
            value={number || ""}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Number"
            className="w-full pl-6 pr-12 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
            <Phone size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillManager({
  selected,
  setSelected,
  commonSkills = [],
}: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !selected.includes(trimmed))
      setSelected([...selected, trimmed]);
    setQuery("");
  };

  return (
    <div className="space-y-4" ref={ref}>
      <div className="flex flex-wrap gap-2">
        {selected.map((s: string) => (
          <span
            key={s}
            className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group"
          >
            {s}{" "}
            <X
              size={12}
              className="cursor-pointer hover:text-red-500 transition-colors"
              onClick={() =>
                setSelected(selected.filter((i: string) => i !== s))
              }
            />
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query) {
              addSkill(query);
              e.preventDefault();
            }
          }}
          placeholder="Search or add skill..."
          className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none"
        />
        <AnimatePresence>
          {open && query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 w-full mt-2 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {commonSkills
                  .filter((s: string) =>
                    s.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((s: string) => (
                    <div
                      key={s}
                      onClick={() => addSkill(s)}
                      className="px-6 py-3 text-xs font-bold hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      {s} <Plus size={14} className="text-gray-300" />
                    </div>
                  ))}
                <div
                  onClick={() => addSkill(query)}
                  className="px-6 py-3 text-xs font-black text-blue-600 bg-blue-50 cursor-pointer italic flex justify-between items-center"
                >
                  Add "{query}" <Plus size={14} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function SearchableDropdown({
  label,
  value,
  onSelect,
  options = [],
  type,
  isEditable,
}: any) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [apiOptions, setApiOptions] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setQuery(value);
  }, [value]);

  useEffect(() => {
    const h = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setApiOptions([]);
      return;
    }
    const controller = new AbortController();
    const fetchApiData = async () => {
      try {
        if (type === "college") {
          const res = await fetch(
            `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`,
            { signal: controller.signal },
          );
          if (res.ok) {
            const data = await res.json();
            setApiOptions(
              Array.from(new Set(data.map((d: any) => d.name))).slice(
                0,
                15,
              ) as string[],
            );
          }
        } else if (type === "city") {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
            {
              signal: controller.signal,
              headers: { "User-Agent": "InternKhojo/1.0" },
            },
          );
          if (res.ok) {
            const data = await res.json();
            setApiOptions(
              data.map((d: any) => {
                const addr = d.address;
                const city =
                  addr.city || addr.town || addr.village || addr.suburb || "";
                const state = addr.state || "";
                return city && state
                  ? `${city}, ${state}`
                  : d.display_name.split(",").slice(0, 2).join(", ");
              }),
            );
          }
        }
      } catch (e: any) {}
    };
    const debounce = setTimeout(fetchApiData, 400);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query, type]);

  const combined = [
    ...new Set([
      ...options.filter((o: string) =>
        o.toLowerCase().includes(query.toLowerCase()),
      ),
      ...apiOptions,
    ]),
  ];

  return (
    <div className="space-y-3 relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-all"
      >
        <span className={query ? "text-black" : "text-gray-300"}>
          {query || `Select ${label}...`}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-50 flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                className="w-full text-xs outline-none font-bold"
                placeholder="Start typing..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (isEditable) onSelect(e.target.value);
                }}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {combined.length > 0 ? (
                combined.map((opt: string) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onSelect(opt);
                      setQuery(opt);
                      setOpen(false);
                    }}
                    className="px-6 py-3 text-[11px] font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    {opt}
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-[10px] text-gray-400 italic text-center">
                  {isEditable ? `Add "${query}" manually` : "No results found"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
