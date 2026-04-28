import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();

  const { to, status, jobTitle } = body;

  try {
    await resend.emails.send({
      from: "InternKhojo <onboarding@resend.dev>",
      to,
      subject: `Application ${status}`,
      html: `
        <h2>Application Update</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been <strong>${status}</strong>.</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error });
  }
}
