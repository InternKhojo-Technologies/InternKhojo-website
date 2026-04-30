"use client";

import { useState } from "react";
import JobCard from "./JobCard";
import Container from "./ui/Container";

export default function FindSection() {
  const [search, setSearch] = useState("");

  // ✅ Dummy jobs (temporary until backend connected)
  const jobs = [
    { title: "Frontend Intern (React)" },
    { title: "AI/ML Intern" },
    { title: "UI/UX Designer" },
    { title: "Backend Developer (Node)" },
    { title: "Product Intern" },
    { title: "Marketing Intern" },
  ];

  // ✅ Filter logic
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container>
      <div className="py-24">
        {/* title */}
        <h1 className="text-5xl font-bold">Join the Core Team</h1>

        <p className="opacity-60 mt-2">
          Internship Program · Remote · Performance based
        </p>

        {/* search */}
        <div className="mt-6 flex justify-end">
          <input
            placeholder="Search roles (React, AI, Design...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-full px-6 py-3 w-96"
          />
        </div>

        {/* cards */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          {filteredJobs.map((job, i) => (
            <JobCard key={i} job={job} />
          ))}
        </div>
      </div>
    </Container>
  );
}
