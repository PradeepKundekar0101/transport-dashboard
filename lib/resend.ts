import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const isResendConfigured = !!resendApiKey;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const TEST_EMAIL = process.env.TEST_RECIPIENT_EMAIL;

interface SendEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  subject: string;
  statusTitle: string;
  statusMessage: string;
  vehicleDescription: string;
  route: string;
  carrierName?: string;
}

export async function sendTransportEmail(
  params: SendEmailParams
): Promise<{ id: string; success: boolean }> {
  if (!resend) {
    return { id: `mock_${Date.now()}`, success: false };
  }

  const html = buildEmailHtml(params);
  const recipient = TEST_EMAIL || params.to;

  try {
    const { data, error } = await resend.emails.send({
      from: `AutoTransport Dispatch <${FROM_EMAIL}>`,
      to: [recipient],
      subject: params.subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { id: `err_${Date.now()}`, success: false };
    }

    return { id: data?.id ?? `sent_${Date.now()}`, success: true };
  } catch (err) {
    console.error("Resend send failed:", err);
    return { id: `err_${Date.now()}`, success: false };
  }
}

function buildEmailHtml(params: SendEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:#0f172a;padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">AutoTransport</span>
            <span style="color:#64748b;font-size:12px;margin-left:8px;">Dispatch Hub</span>
          </td>
          <td align="right">
            <span style="color:#94a3b8;font-size:12px;font-family:monospace;">${params.orderNumber}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Status Banner -->
    <div style="background:#2563eb;padding:20px 32px;">
      <p style="color:#bfdbfe;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Transport Update</p>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">${params.statusTitle}</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${params.customerName},
      </p>
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
        ${params.statusMessage}
      </p>

      <!-- Details Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 0;">
              <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Vehicle</span><br>
              <span style="color:#0f172a;font-size:14px;font-weight:600;">${params.vehicleDescription}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 4px;">
              <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Route</span><br>
              <span style="color:#0f172a;font-size:14px;font-weight:600;">${params.route}</span>
            </td>
          </tr>
          ${
            params.carrierName
              ? `<tr>
            <td style="padding:12px 0 4px;">
              <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Carrier</span><br>
              <span style="color:#0f172a;font-size:14px;font-weight:600;">${params.carrierName}</span>
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:12px 0 0;">
              <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Order Number</span><br>
              <span style="color:#0f172a;font-size:14px;font-weight:600;font-family:monospace;">${params.orderNumber}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
        If you have any questions about your transport, reply to this email or contact our dispatch team.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;">
      <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">
        AutoTransport Dispatch Hub &middot; Automated notification
      </p>
    </div>
  </div>
</body>
</html>`;
}
