"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import RecruiterSidebar from "@/components/recruiter/RecruiterSidebar";

interface RecruiterContextType {
  company: any;
  profile: any;
  reloadRecruiterData: () => Promise<void>;
}

const RecruiterContext = createContext<RecruiterContextType>({
  company: null,
  profile: null,
  reloadRecruiterData: async () => {},
});

export const useRecruiter = () => useContext(RecruiterContext);

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Pages where sidebar should not appear
  const hideSidebar = pathname.includes("/jobs/create");

  const loadBaseData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData || profileData.role !== "recruiter") {
        router.push("/dashboard/candidate");
        return;
      }
      setProfile(profileData);

      if (profileData?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profileData.company_id)
          .single();
        setCompany(companyData);
      }
    } catch (err) {
      console.error("Recruiter Layout Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500 font-medium">
        Loading Recruiter Workspace...
      </div>
    );
  }

  // Full-width layout for Create Job page without sidebar
  if (hideSidebar) {
    return (
      <RecruiterContext.Provider
        value={{ company, profile, reloadRecruiterData: loadBaseData }}
      >
        <main className="w-full min-h-screen bg-white">{children}</main>
      </RecruiterContext.Provider>
    );
  }

  return (
    <RecruiterContext.Provider
      value={{ company, profile, reloadRecruiterData: loadBaseData }}
    >
      <div className="bg-white min-h-screen flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 text-black">
        <RecruiterSidebar company={company} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </RecruiterContext.Provider>
  );
}
