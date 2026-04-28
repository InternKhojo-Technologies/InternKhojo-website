"use client";

import Container from "./ui/Container"

export default function Reviews() {
  return (

    <div className="py-32 bg-white">

      <Container>

        {/* title */}

        <div className="text-center max-w-2xl mx-auto">

          <h2 className="text-4xl font-bold">
            People who got work using InternKhojo
          </h2>

          <p className="mt-4 opacity-70">
            Students, freelancers and startups
            use InternKhojo to build real experience.
          </p>

        </div>


        {/* cards */}

        <div className="grid grid-cols-3 gap-8 mt-16">

          {/* card */}

          <div
            className="
              p-6
              rounded-2xl
              shadow-md
              hover:shadow-xl
              transition
              bg-gray-50
            "
          >

            <p>
              I got my first startup internship
              through InternKhojo and later got
              hired full time.
            </p>

            <div className="flex items-center mt-6 gap-3">

              <div className="w-10 h-10 rounded-full bg-gray-300" />

              <div>

                <p className="font-semibold">
                  Aarav Sharma
                </p>

                <p className="text-sm opacity-60">
                  Frontend Intern
                </p>

              </div>

            </div>

          </div>



          {/* card */}

          <div
            className="
              p-6
              rounded-2xl
              shadow-md
              hover:shadow-xl
              transition
              bg-gray-50
            "
          >

            <p>
              We hired 3 developers for our
              startup using InternKhojo.
              Super easy and fast.
            </p>

            <div className="flex items-center mt-6 gap-3">

              <div className="w-10 h-10 rounded-full bg-gray-300" />

              <div>

                <p className="font-semibold">
                  Rohan Mehta
                </p>

                <p className="text-sm opacity-60">
                  Startup Founder
                </p>

              </div>

            </div>

          </div>



          {/* card */}

          <div
            className="
              p-6
              rounded-2xl
              shadow-md
              hover:shadow-xl
              transition
              bg-gray-50
            "
          >

            <p>
              As a beginner I couldn't get job,
              but through InternKhojo I got
              real experience first.
            </p>

            <div className="flex items-center mt-6 gap-3">

              <div className="w-10 h-10 rounded-full bg-gray-300" />

              <div>

                <p className="font-semibold">
                  Neha Verma
                </p>

                <p className="text-sm opacity-60">
                  UI Designer
                </p>

              </div>

            </div>

          </div>

        </div>

      </Container>

    </div>

  )
}