import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { jobTitle, companyName, candidateEmails } = await request.json();

    if (!jobTitle || !candidateEmails || candidateEmails.length === 0) {
      return NextResponse.json(
        { error: "Empty fields parameters payload" },
        { status: 400 },
      );
    }

    // 🔥 HIGH-END MINIMALIST BENTO BROADCAST TEMPLATE (UPGRADED VISUAL HIERARCHY)
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; padding: 48px 16px; color: #111111; -webkit-font-smoothing: antialiased;">
        <div style="max-w: 460px; margin: 0 auto; background: #ffffff; border: 1px solid #EAEAEA; border-radius: 20px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.015);">
          
          <!-- BRAND TOP PANEL -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; border-bottom: 1px solid #F1F1F1; padding-bottom: 16px;">
            <div>
              <h2 style="font-size: 16px; font-weight: 900; letter-spacing: -0.03em; margin: 0; font-style: italic; text-transform: uppercase;">InternKhojo<span style="color: #FF3B30;">.</span></h2>
              <p style="color: #A3A3A3; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin: 2px 0 0 0; font-family: monospace;">Ecosystem Pipeline</p>
            </div>
            <div style="background-color: #000000; color: #ffffff; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
              Live Track
            </div>
          </div>

          <!-- RE-ENGINEERED CONTEXT BENTO PANEL -->
          <div style="background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 16px; padding: 24px; margin-bottom: 28px; position: relative; overflow: hidden;">
            <!-- Left Signature Studio Border Pin -->
            <div style="position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background-color: #FF3B30;"></div>
            
            <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #FF3B30; margin: 0 0 12px 0; font-family: monospace;">
              Opportunity Deployed
            </p>
            
            <h1 style="font-size: 22px; font-weight: 900; letter-spacing: -0.03em; margin: 0 0 4px 0; color: #000000; line-height: 1.1; text-transform: uppercase;">
              ${jobTitle}
            </h1>
            
            <p style="font-size: 14px; font-weight: 600; color: #525252; margin: 0;">
              at ${companyName}
            </p>
          </div>

          <!-- BRIEF DISPATCH SUBTEXT -->
          <div style="margin-bottom: 28px; padding: 0 4px;">
            <p style="font-size: 13px; color: #666666; line-height: 1.5; margin: 0;">
              A new vacancy block matching your technical track bounds has been initialized on the live index. Review criteria and lock your application loop.
            </p>
          </div>

          <!-- SOLID TIGHT CTA BUTTON -->
          <div style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://internkhojo.com"}/find/jobs" 
               style="display: block; background-color: #000000; color: #ffffff; text-align: center; padding: 14px 20px; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 12px; transition: background-color 0.2s ease;"
               target="_blank">
               View Posting Details
            </a>
          </div>

        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: "InternKhojo Job Alerts <alert@internkhojo.com>",
      to: candidateEmails,
      subject: `⚡ New Opportunity: ${jobTitle} at ${companyName}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
