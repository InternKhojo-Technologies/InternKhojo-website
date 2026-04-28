"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  Building2,
  FileText,
  ArrowRight,
  Upload,
  Globe,
  Mail,
  Linkedin,
  Camera,
  Fingerprint,
  GraduationCap,
  MapPin,
  Users2,
  ChevronDown,
  Check,
  Search,
  Sparkles,
  Phone,
  Map,
  X,
  Plus,
  Github,
  Terminal,
  Code2,
} from "lucide-react";

// PRESETS & LOCAL DATA
const LOCAL_COLLEGES = [
  "Thapar Institute of Engineering and Technology (TIET), Patiala",
  "IIT Delhi",
  "IIT Bombay",
  "IIT Kanpur",
  "IIT Madras",
  "Delhi Technological University (DTU)",
  "BITS Pilani",
  "Punjabi University, Patiala",
  "Chitkara University",
  "VIT Vellore",
  "SRM University",
  "Manipal Institute of Technology",
  "Amity University",
  "LPU Phagwara",
  "PEC Chandigarh",
  "NSUT Delhi",
  "IIIT Delhi",
  "NIT Kurukshetra",
  "NIT Jalandhar",
];

const INDUSTRIES = [
  "Artificial Intelligence",
  "Aerospace",
  "Agriculture",
  "Automotive",
  "Biotechnology",
  "Construction",
  "E-commerce",
  "Education",
  "Energy",
  "Entertainment",
  "Fintech",
  "Healthcare",
  "Logistics",
  "Manufacturing",
  "Media",
  "Real Estate",
  "SaaS",
  "Software Development",
  "Telecommunications",
  "Web3",
];
const COMPANY_SIZES = [
  "1-10 Employees",
  "11-50 Employees",
  "51-200 Employees",
  "201-500 Employees",
  "501-1000 Employees",
  "1000+ Employees",
];
const COMMON_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "Node.js",
  "Python",
  "UI/UX Design",
  "C++",
  "Java",
  "SQL",
  "AWS",
  "Figma",
  "Docker",
  "Go",
  "Rust",
  "Machine Learning",
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState<any>(null);

  // API & Identity Data
  const [countryData, setCountryData] = useState<any[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Core Profile Data
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [contactNumber, setContactNumber] = useState("");

  // Global Links (Socials)
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");

  // Academic Info
  const [college, setCollege] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [gradYear, setGradYear] = useState("");

  // Recruiter/Company Data
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyHeadquarters, setCompanyHeadquarters] = useState("");
  const [companyCountryCode, setCompanyCountryCode] = useState("+91");
  const [companyContact, setCompanyContact] = useState("");

  const isRecruiter = role === "recruiter";
  const accentColor = isRecruiter ? "border-red-500" : "border-blue-600";
  const accentBg = isRecruiter ? "bg-red-500" : "bg-blue-600";

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        window.location.href = "/login";
        return;
      }
      setUser(authUser);

      // Load Global Countries & Code with Images
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,idd,cca2",
      );
      const cData = await res.json();
      setAllCountries(cData.map((c: any) => c.name.common).sort());

      const processed = cData
        .filter((c: any) => c.idd.root)
        .map((c: any) => ({
          code: c.idd.root + (c.idd.suffixes?.[0] || ""),
          label: c.cca2,
          flag: `https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`,
        }))
        .sort(
          (a: any, b: any) =>
            parseInt(a.code.replace(/\D/g, "")) -
            parseInt(b.code.replace(/\D/g, "")),
        );
      setCountryData(processed);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
      if (p) {
        setName(p.name || "");
        setRole(p.role || "candidate");
        setBio(p.bio || "");
        setSkills(Array.isArray(p.skills) ? p.skills : []);
        setLinkedinUrl(p.links || "");
        setGithubUrl(p.github_url || "");
        setLeetcodeUrl(p.leetcode_url || "");
        setCodeforcesUrl(p.codeforces_url || "");
        setCollege(p.college || "");
        setCgpa(p.cgpa?.toString() || "");
        setGradYear(p.grad_year?.toString() || "");
        setLocation(p.location || "");
        setCountry(p.country || "");
        setAvatarUrl(
          p.avatar_url ||
            createAvatar(thumbs, { seed: authUser.email }).toDataUri(),
        );

        if (p.contact_number?.includes(" ")) {
          const split = p.contact_number.split(" ");
          setCountryCode(split[0]);
          setContactNumber(split.slice(1).join(" "));
        } else {
          setContactNumber(p.contact_number || "");
        }

        if (p.role === "recruiter" && p.company_id) {
          const { data: c } = await supabase
            .from("companies")
            .select("*")
            .eq("id", p.company_id)
            .maybeSingle();
          if (c) {
            setCompanyId(c.id);
            setCompanyName(c.name || "");
            setCompanyBio(c.description || "");
            setIndustry(c.industry || "");
            setCompanySize(c.size || "");
            setCompanyWebsite(c.website || "");
            setCompanyHeadquarters(c.headquarters || "");
            if (c.contact_number?.includes(" ")) {
              const cParts = c.contact_number.split(" ");
              setCompanyCountryCode(cParts[0]);
              setCompanyContact(cParts[1]);
            } else {
              setCompanyContact(c.contact_number || "");
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    const t = toast.loading("Syncing Identity...");
    try {
      let finalAvatar = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        finalAvatar = supabase.storage.from("avatars").getPublicUrl(fileName)
          .data.publicUrl;
        setAvatarUrl(finalAvatar);
      }

      // Phone Logic: Avoid saving standalone code if number is missing
      const formattedPersonalPhone = contactNumber.trim()
        ? `${countryCode} ${contactNumber.trim()}`
        : "";
      const formattedCompanyPhone = companyContact.trim()
        ? `${companyCountryCode} ${companyContact.trim()}`
        : "";

      let currentCompanyId = companyId;
      if (isRecruiter) {
        const { data: upsertedCompany, error: cErr } = await supabase
          .from("companies")
          .upsert(
            {
              id: companyId || undefined,
              name: companyName,
              description: companyBio,
              industry,
              size: companySize,
              website: companyWebsite,
              contact_number: formattedCompanyPhone,
              headquarters: companyHeadquarters,
              logo_url: finalAvatar,
              owner_id: user.id,
              created_by: user.id,
            },
            { onConflict: "id" },
          )
          .select()
          .single();
        if (cErr) throw cErr;
        currentCompanyId = upsertedCompany.id;
        setCompanyId(currentCompanyId);
      }

      const { error: pErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name,
          bio,
          location,
          country,
          avatar_url: finalAvatar,
          contact_number: formattedPersonalPhone,
          role: role || "candidate",
          company_id: isRecruiter ? currentCompanyId : null,
          college,
          cgpa: !isRecruiter && cgpa !== "" ? parseFloat(cgpa) : null,
          grad_year:
            !isRecruiter && gradYear !== "" ? parseInt(gradYear) : null,
          skills,
          links: linkedinUrl,
          github_url: githubUrl,
          leetcode_url: leetcodeUrl,
          codeforces_url: codeforcesUrl,
        },
        { onConflict: "id" },
      );

      if (pErr) throw pErr;
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile fully synced", { id: t });
      setAvatarFile(null);
    } catch (err: any) {
      toast.error(err.message, { id: t });
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-white flex items-center justify-center font-black text-2xl tracking-tighter uppercase italic">
        Initializing...
      </div>
    );

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* TOP IDENTITY CARD */}
        <div className="relative overflow-hidden rounded-[3rem] p-10 mb-12 border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
          <div
            className={`absolute -top-24 -left-24 w-80 h-80 blur-[140px] opacity-10 rounded-full ${accentBg} opacity-10`}
          />
          <div className="relative flex items-center gap-8 z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-xl bg-gray-50">
                <img
                  src={avatarUrl}
                  className="w-full h-full object-cover"
                  alt="identity"
                />
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
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={saveAll}
            className="bg-black text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-500 transition-all z-10 active:scale-95"
          >
            Sync Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* NAVIGATION */}
          <div className="md:col-span-3 space-y-4">
            <div className="space-y-2">
              <NavTab
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                icon={<Fingerprint size={18} />}
                label="Personal Identity"
              />
              {!isRecruiter && (
                <NavTab
                  active={activeTab === "academic"}
                  onClick={() => setActiveTab("academic")}
                  icon={<GraduationCap size={18} />}
                  label="Academic Record"
                />
              )}
              {isRecruiter && (
                <NavTab
                  active={activeTab === "company"}
                  onClick={() => setActiveTab("company")}
                  icon={<Building2 size={18} />}
                  label="Company Branding"
                />
              )}
              <NavTab
                active={activeTab === "social"}
                onClick={() => setActiveTab("social")}
                icon={<Globe size={18} />}
                label="Global Links"
              />
            </div>
            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-500" /> Identity
                Gallery
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((seed) => {
                  const preset = createAvatar(thumbs, { seed }).toDataUri();
                  return (
                    <img
                      key={seed}
                      src={preset}
                      onClick={() => {
                        setAvatarUrl(preset);
                        setAvatarFile(null);
                      }}
                      className={`w-full aspect-square rounded-xl cursor-pointer border-2 transition-all hover:scale-110 ${avatarUrl === preset ? "border-black" : "border-transparent"}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-9 bg-white border border-gray-50 shadow-[0_40px_100px_rgba(0,0,0,0.02)] rounded-[3rem] p-10 md:p-14">
            <AnimatePresence mode="wait">
              {activeTab === "personal" && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputGroup
                      label="Display Name"
                      value={name}
                      onChange={setName}
                      placeholder="John Doe"
                    />
                    <PhoneInputGroup
                      label="Personal Contact"
                      code={countryCode}
                      setCode={setCountryCode}
                      number={contactNumber}
                      setNumber={setContactNumber}
                      countryData={countryData}
                    />
                    <SearchableDropdown
                      type="city"
                      label="Current City & State"
                      value={location}
                      onSelect={setLocation}
                      options={[]}
                    />
                    <SearchableDropdown
                      label="Base Country"
                      value={country}
                      onSelect={setCountry}
                      options={allCountries}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Professional Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write your professional bio..."
                      className="w-full p-6 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-black outline-none font-medium min-h-[160px]"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "academic" && (
                <motion.div
                  key="academic"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-10"
                >
                  {/* FIXED COLLEGE: Works exactly like Skills Manager */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      College / University
                    </label>
                    <SearchableDropdown
                      type="college"
                      label="College"
                      value={college}
                      onSelect={setCollege}
                      options={LOCAL_COLLEGES}
                      isEditable
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputGroup
                      label="Current CGPA"
                      value={cgpa}
                      onChange={setCgpa}
                      placeholder="e.g. 9.1"
                    />
                    <InputGroup
                      label="Graduation Year"
                      value={gradYear}
                      onChange={setGradYear}
                      placeholder="2026"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Key Expertise (Skills)
                    </label>
                    <SkillManager selected={skills} setSelected={setSkills} />
                  </div>
                </motion.div>
              )}

              {activeTab === "company" && (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputGroup
                      label="Legal Company Name"
                      value={companyName}
                      onChange={setCompanyName}
                    />
                    <PhoneInputGroup
                      label="Company Contact"
                      code={companyCountryCode}
                      setCode={setCompanyCountryCode}
                      number={companyContact}
                      setNumber={setCompanyContact}
                      countryData={countryData}
                    />
                    <SearchableDropdown
                      label="Industry Sector"
                      value={industry}
                      onSelect={setIndustry}
                      options={INDUSTRIES}
                    />
                    <SearchableDropdown
                      label="Company Size"
                      value={companySize}
                      onSelect={setCompanySize}
                      options={COMPANY_SIZES}
                    />
                  </div>
                  <InputGroup
                    label="Headquarters Address"
                    value={companyHeadquarters}
                    onChange={setCompanyHeadquarters}
                    icon={<Map size={16} />}
                    placeholder="Building 4, Cyber City"
                  />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Company Description
                    </label>
                    <textarea
                      value={companyBio}
                      onChange={(e) => setCompanyBio(e.target.value)}
                      placeholder="Mission statement..."
                      className="w-full p-6 bg-gray-50 rounded-[2rem] border-none focus:ring-2 focus:ring-red-500 outline-none font-medium min-h-[160px]"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "social" && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputGroup
                      label="LinkedIn Profile URL"
                      value={linkedinUrl}
                      onChange={setLinkedinUrl}
                      icon={<Linkedin size={18} className="text-[#0077B5]" />}
                      placeholder="linkedin.com/in/username"
                    />
                    {!isRecruiter ? (
                      <>
                        <InputGroup
                          label="GitHub URL"
                          value={githubUrl}
                          onChange={setGithubUrl}
                          icon={<Github size={18} />}
                          placeholder="github.com/username"
                        />
                        <InputGroup
                          label="LeetCode URL"
                          value={leetcodeUrl}
                          onChange={setLeetcodeUrl}
                          icon={<Code2 size={18} className="text-[#FFA116]" />}
                          placeholder="leetcode.com/username"
                        />
                        <InputGroup
                          label="Codeforces URL"
                          value={codeforcesUrl}
                          onChange={setCodeforcesUrl}
                          icon={
                            <Terminal size={18} className="text-[#318CE7]" />
                          }
                          placeholder="codeforces.com/profile/username"
                        />
                      </>
                    ) : (
                      <InputGroup
                        label="Corporate Website"
                        value={companyWebsite}
                        onChange={setCompanyWebsite}
                        icon={<Globe size={18} />}
                        placeholder="https://company.com"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// UI SUB-COMPONENTS
function NavTab({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-black text-white shadow-lg scale-105" : "text-gray-300 hover:text-black hover:bg-gray-50"}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder, icon }: any) {
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
          className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none transition-all"
        />
        {icon && (
          <div className="absolute right-6 top-4 text-gray-300">{icon}</div>
        )}
      </div>
    </div>
  );
}

function PhoneInputGroup({
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
    (c) =>
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
            <img
              src={selected?.flag}
              className="w-5 h-3 object-cover rounded-sm"
            />
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
                      <img
                        src={c.flag}
                        className="w-5 h-3 object-cover rounded-sm"
                      />
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
            className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none"
          />
          <div className="absolute right-6 top-4 text-gray-300">
            <Phone size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillManager({ selected, setSelected }: any) {
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
                {COMMON_SKILLS.filter((s) =>
                  s.toLowerCase().includes(query.toLowerCase()),
                ).map((s) => (
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

function SearchableDropdown({
  label,
  value,
  onSelect,
  options,
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
                  if (isEditable) onSelect(e.target.value); // Sync custom value instantly
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
