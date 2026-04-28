import Container from "./ui/Container";
import JobCard from "./JobCard";

interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  type: string;
  tags?: string[];
  paid?: boolean;
}

export default function JobsGrid({ jobs }: { jobs: Job[] }) {
  return (
    <Container>
      <div className="py-16">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Latest Opportunities</h2>
        </div>

        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </Container>
  );
}
