import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'BuildConnect <noreply@buildconnect.com>';

export async function sendBidReceivedEmail(
  builderEmail: string,
  builderName: string,
  projectTitle: string,
  projectId: string,
  bidAmount: number,
  contractorName: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: builderEmail,
      subject: `New bid received on "${projectTitle}"`,
      html: `
        <h2>New Bid Alert!</h2>
        <p>Hello ${builderName},</p>
        <p>A contractor has submitted a bid on your project: <strong>${projectTitle}</strong></p>
        <p><strong>Contractor:</strong> ${contractorName}</p>
        <p><strong>Bid Amount:</strong> ₹${bidAmount.toLocaleString('en-IN')}</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/builder/projects/${projectId}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Bid</a></p>
        <p>Best regards,<br/>BuildConnect Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending bid received email:', error);
  }
}

export async function sendBidAcceptedEmail(
  contractorEmail: string,
  contractorName: string,
  projectTitle: string,
  projectId: string,
  builderName: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: contractorEmail,
      subject: `Your bid was accepted for "${projectTitle}"`,
      html: `
        <h2>Congratulations!</h2>
        <p>Hello ${contractorName},</p>
        <p>Great news! Your bid has been accepted for the project: <strong>${projectTitle}</strong></p>
        <p><strong>Builder:</strong> ${builderName}</p>
        <p>You can now proceed with the project. The builder will contact you soon.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/contractor/bids" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Project Details</a></p>
        <p>Best regards,<br/>BuildConnect Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending bid accepted email:', error);
  }
}

export async function sendBidRejectedEmail(
  contractorEmail: string,
  contractorName: string,
  projectTitle: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: contractorEmail,
      subject: `Update on your bid for "${projectTitle}"`,
      html: `
        <h2>Bid Update</h2>
        <p>Hello ${contractorName},</p>
        <p>Thank you for submitting a bid for: <strong>${projectTitle}</strong></p>
        <p>Unfortunately, the builder has decided to proceed with another contractor for this project.</p>
        <p>Don't be discouraged! Keep bidding on projects that match your expertise.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/contractor/projects" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Browse More Projects</a></p>
        <p>Best regards,<br/>BuildConnect Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending bid rejected email:', error);
  }
}

export async function sendNewProjectNotification(
  contractorEmail: string,
  contractorName: string,
  projectTitle: string,
  projectId: string,
  city: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: contractorEmail,
      subject: `New project in ${city}: "${projectTitle}"`,
      html: `
        <h2>New Project Available!</h2>
        <p>Hello ${contractorName},</p>
        <p>A new project matching your specialization has been posted in ${city}:</p>
        <p><strong>${projectTitle}</strong></p>
        <p>Submit your bid now to increase your chances of winning this project!</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/contractor/projects/${projectId}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Project & Submit Bid</a></p>
        <p>Best regards,<br/>BuildConnect Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending new project notification:', error);
  }
}

export async function sendDeadlineReminderEmail(
  builderEmail: string,
  builderName: string,
  projectTitle: string,
  projectId: string,
  deadline: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: builderEmail,
      subject: `Bidding deadline approaching for "${projectTitle}"`,
      html: `
        <h2>Deadline Reminder</h2>
        <p>Hello ${builderName},</p>
        <p>This is a reminder that the bidding deadline for your project <strong>${projectTitle}</strong> is approaching soon.</p>
        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString('en-IN')}</p>
        <p>Make sure to review all bids before the deadline.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL}/builder/projects/${projectId}" style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Review Bids</a></p>
        <p>Best regards,<br/>BuildConnect Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending deadline reminder email:', error);
  }
}
