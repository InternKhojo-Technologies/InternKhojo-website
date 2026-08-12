"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  Linkedin,
  Fingerprint,
  GraduationCap,
  Sparkles,
  Map,
  Github,
  Terminal,
  Code2,
  MessageSquare,
} from "lucide-react";

import { IdentityHeader } from "@/components/profile/IdentityHeader";
import {
  InputGroup,
  PhoneInputGroup,
  SkillManager,
  SearchableDropdown,
} from "@/components/profile/ProfileFormFields";
import { ReviewSection } from "@/components/profile/ReviewSection";

// PRESETS
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

  // Global Links
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
  const accentBg = isRecruiter ? "bg-red-500" : "bg-blue-600";

  useEffect(() => {
    loadInitialData();
  }, []);

  const formatUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

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

      try {
        const res = await fetch(
          "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json",
        );
        if (!res.ok) throw new Error("CDN fallback request failed");
        const cData = await res.json();
        setAllCountries(cData.map((c: any) => c.name).sort());

        const processed = cData.map((c: any) => {
          let dialCode = "+1";
          if (c.code === "IN") dialCode = "+91";
          else if (c.code === "GB") dialCode = "+44";
          else if (c.code === "CA") dialCode = "+1";
          else if (c.code === "AU") dialCode = "+61";
          else if (c.code === "DE") dialCode = "+49";
          else if (c.code === "FR") dialCode = "+33";

          return {
            code: dialCode,
            label: c.code,
            flag: `https://flagcdn.com/w40/${c.code.toLowerCase()}.png`,
          };
        });
        setCountryData(processed);
      } catch (apiErr) {
        setAllCountries([
          "India",
          "United States",
          "United Kingdom",
          "Canada",
          "Germany",
        ]);
        setCountryData([
          { code: "+91", label: "IN", flag: "https://flagcdn.com/w40/in.png" },
          { code: "+1", label: "US", flag: "https://flagcdn.com/w40/us.png" },
          { code: "+44", label: "GB", flag: "https://flagcdn.com/w40/gb.png" },
        ]);
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (p) {
        setName(p.name || "");
        setRole(p.role);
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
      } else {
        setAvatarUrl(
          createAvatar(thumbs, { seed: authUser.email }).toDataUri(),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    const t = toast.loading("Syncing Identity...");
    if (!role) {
      toast.error("Role not loaded yet");
      return;
    }

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
              website: formatUrl(companyWebsite),
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
          role: role,
          company_id: isRecruiter ? currentCompanyId : null,
          college,
          cgpa: !isRecruiter && cgpa !== "" ? parseFloat(cgpa) : null,
          grad_year:
            !isRecruiter && gradYear !== "" ? parseInt(gradYear) : null,
          skills,
          links: formatUrl(linkedinUrl),
          github_url: formatUrl(githubUrl),
          leetcode_url: formatUrl(leetcodeUrl),
          codeforces_url: formatUrl(codeforcesUrl),
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
        <IdentityHeader
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          setAvatarFile={setAvatarFile}
          isRecruiter={isRecruiter}
          companyName={companyName}
          name={name}
          userEmail={user?.email}
          accentBg={accentBg}
          onSave={saveAll}
        />

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
              <NavTab
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
                icon={<MessageSquare size={18} />}
                label="Feedback & Reviews"
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
                  return preset ? (
                    <img
                      key={seed}
                      src={preset}
                      onClick={() => {
                        setAvatarUrl(preset);
                        setAvatarFile(null);
                      }}
                      alt={`Avatar preset ${seed}`}
                      className={`w-full aspect-square rounded-xl cursor-pointer border-2 transition-all hover:scale-110 ${avatarUrl === preset ? "border-black" : "border-transparent"}`}
                    />
                  ) : null;
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
                    <SkillManager
                      selected={skills}
                      setSelected={setSkills}
                      commonSkills={COMMON_SKILLS}
                    />
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
                        placeholder="company.com"
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <ReviewSection user={user} role={role} name={name} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavTab({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-black text-white shadow-lg scale-105"
          : "text-gray-300 hover:text-black hover:bg-gray-50"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}
