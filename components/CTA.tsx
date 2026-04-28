import Container from "./ui/Container"

export default function CTA() {
  return (

    <div
      className="
        py-36
        text-white
        bg-gradient-to-r
        from-[#14001c]
        to-[#320042]
      "
    >

      <Container>

        <div className="text-center max-w-3xl mx-auto">

          <h2 className="text-5xl font-bold">

            Start your journey with InternKhojo

          </h2>


          <p className="mt-6 opacity-70 text-lg">

            Find internships, freelance work,
            and startup opportunities — or hire
            talented people for your project.

          </p>


          <div className="mt-10 flex justify-center gap-4">

            <button
              className="
                px-8 py-4
                bg-blue-600
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
                border border-white/40
                rounded-xl
                font-semibold
                hover:bg-white/10
                transition
              "
            >
              Hire Talent
            </button>

          </div>

        </div>

      </Container>

    </div>

  )
}