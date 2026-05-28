import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, jobTitle, companyName, stage } = await request.json();

    if (!email || !stage) {
      return NextResponse.json(
        { error: "Missing parameters payload" },
        { status: 400 },
      );
    }

    let emailSubject = "InternKhojo Process Update";
    let statusColor = "#737373";
    let statusBg = "#F5F5F5";
    let statusLabel = stage;
    let operationalMessage = "";

    const cleanStage = stage.toLowerCase();

    if (cleanStage === "shortlisted") {
      emailSubject = `🚀 Shortlisted for ${jobTitle} at ${companyName}`;
      statusColor = "#4F46E5";
      statusBg = "#EEF2FF";
      statusLabel = "Shortlisted";
      operationalMessage = `Great news! Your application has been reviewed and <strong>shortlisted</strong> by <strong>${companyName}</strong> for the <strong>${jobTitle}</strong> role. Stay sharp and watch your tracking terminal closely for upcoming loop milestones.`;
    } else if (cleanStage === "interview") {
      emailSubject = `📅 Interview Scheduled — ${companyName}`;
      statusColor = "#2563EB";
      statusBg = "#EFF6FF";
      statusLabel = "Interview";
      operationalMessage = `Your profile metrics for <strong>${jobTitle}</strong> have cleared initial criteria. <strong>${companyName}</strong> has advanced your application to the <strong>Interview Round</strong>. Check your dashboard for scheduling slots.`;
    } else if (cleanStage === "hired") {
      emailSubject = `🎉 Offer Confirmed at ${companyName}!`;
      statusColor = "#16A34A";
      statusBg = "#F0FDF4";
      statusLabel = "Hired";
      operationalMessage = `Congratulations! You cleared all validation stages. <strong>${companyName}</strong> has officially extended an <strong>employment offer</strong> for the <strong>${jobTitle}</strong> pipeline. Welcome aboard!`;
    } else if (cleanStage === "rejected") {
      emailSubject = `Update regarding your application at ${companyName}`;
      statusColor = "#DC2626";
      statusBg = "#FEF2F2";
      statusLabel = "Rejected";
      operationalMessage = `Thank you for your interest in the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>. After close review, recruiters have decided to move forward with other candidates for this specific track slot. Keep building and iterating!`;
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; padding: 32px 16px; color: #111111; -webkit-font-smoothing: antialiased;">
        <div style="max-w: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #EAEAEA; border-radius: 20px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.01);">
          
          <!-- HEADER MATRIX -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #F1F1F1; padding-bottom: 16px;">
            <div>
              <h2 style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; margin: 0; font-style: italic;">InternKhojo<span style="color: #FF3B30;">.</span></h2>
              <p style="color: #A3A3A3; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 2px 0 0 0; font-family: monospace;">Stage Sync</p>
            </div>
            <!-- MICRO COMPACT BADGE -->
            <div style="background-color: ${statusBg}; color: ${statusColor}; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid ${statusColor}15;">
              ${statusLabel}
            </div>
          </div>

          <!-- SALUTATION -->
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #404040; margin: 0;">Hi <strong>${name || "Candidate"}</strong>,</p>
          </div>

          <!-- OPERATIONAL MESSAGE -->
          <div style="margin-bottom: 24px;">
            <p style="font-size: 13.5px; color: #262626; line-height: 1.5; margin: 0; font-weight: 400;">
              ${operationalMessage}
            </p>
          </div>

          <!-- SUMMARY ROWS (FIXED SPACING) -->
          <div style="margin-bottom: 24px; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 12px; padding: 14px 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 3px 0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; width: 30%;">Role</td>
                <td style="padding: 3px 0; font-size: 12px; font-weight: 700; color: #111111;">${jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888;">Company</td>
                <td style="padding: 3px 0; font-size: 12px; font-weight: 600; color: #404040;">${companyName}</td>
              </tr>
            </table>
          </div>

          <!-- BUTTON -->
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://internkhojo.com"}/dashboard/candidate" 
               style="display: block; background-color: #000000; color: #ffffff; text-align: center; padding: 14px 20px; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 10px;"
               target="_blank">
               Open Candidate Dashboard
            </a>
          </div>

        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "InternKhojo <onboarding@internkhojo.com>",
      to: [email],
      subject: emailSubject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, emailResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
