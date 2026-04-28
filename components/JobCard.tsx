"use client";

import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  type: string;
  tags?: string[];
  paid?: boolean;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/find/jobs/${job.id}`}>
      <div
        className="
          bg-white
          rounded-xl
          p-5
          shadow-sm
          hover:shadow-md
          transition
          cursor-pointer
        "
      >
        {/* top */}
        <div className="flex justify-between items-start">
          <div className="text-xs text-gray-500">
            {job.company || "Startup"}
          </div>

          {job.paid && (
            <span className="text-xs text-green-600 font-medium">Paid</span>
          )}
        </div>

        {/* title */}
        <h2 className="text-lg font-semibold mt-3">{job.title}</h2>

        {/* desc */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {job.description}
        </p>

        {/* tags */}
        {job.tags && (
          <div className="flex gap-2 flex-wrap mt-3">
            {job.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* bottom */}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <span>{job.type}</span>

          <span className="text-blue-600 font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
}
