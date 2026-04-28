import Container from "./ui/Container";

export default function IntroSection() {
  return (
    <div className="py-40">
      <div className="bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold">
              Where startups and talent connect
            </h2>

            <p className="mt-6 text-lg opacity-70">
              InternKhojo helps students, freelancers and startups work
              together, gain experience, and build real careers.
            </p>

            <div className="mt-10 flex gap-4 justify-center">
              <button
                className="
                  px-8 py-4
                  bg-blue-600
                  text-white
                  rounded-xl
                  font-semibold
                  hover:bg-blue-700
                  transition
                "
              >
                Find Work
              </button>

              <button
                className="
                  px-8 py-4
                  border
                  rounded-xl
                  font-semibold
                  hover:bg-gray-100
                  transition
                "
              >
                Hire Talent
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
