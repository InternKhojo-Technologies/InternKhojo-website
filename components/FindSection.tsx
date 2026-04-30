"use client";

import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import Container from "./ui/Container";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  description: string;
  company?: string;
  type: string;
  tags?: string[];
  paid?: boolean;
};

export default function FindSection() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase.from("jobs").select("*");

      if (error) {
        console.error(error);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    }

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container>
      <div className="py-24">
        <h1 className="text-5xl font-bold">Join the Core Team</h1>

        <p className="opacity-60 mt-2">
          Internship Program · Remote · Performance based
        </p>

        <div className="mt-6 flex justify-end">
          <input
            placeholder="Search roles (React, AI, Design...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-full px-6 py-3 w-96"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mt-10">
          {loading ? (
            <p className="col-span-3 text-center text-gray-500">
              Loading jobs...
            </p>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <p className="col-span-3 text-center text-gray-500">
              No jobs found
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
