import resend
import os
from typing import Dict, Any

resend.api_key = os.environ.get('RESEND_API_KEY')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

class EmailService:
    @staticmethod
    async def send_bid_received_email(builder_email: str, builder_name: str, project_title: str, project_id: str, contractor_name: str, bid_amount: int):
        """Send email to builder when new bid is received"""
        try:
            params = {
                "from": "BuildConnect <onboarding@resend.dev>",
                "to": [builder_email],
                "subject": f"New Bid Received on '{project_title}'",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }}
                        .bid-details {{ background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                        .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 New Bid Received!</h1>
                        </div>
                        <div class="content">
                            <p>Hi {builder_name},</p>
                            <p>Great news! A contractor has submitted a bid on your project: <strong>{project_title}</strong></p>
                            
                            <div class="bid-details">
                                <h3>Bid Details</h3>
                                <p><strong>Contractor:</strong> {contractor_name}</p>
                                <p><strong>Bid Amount:</strong> ₹{bid_amount:,}</p>
                            </div>
                            
                            <p>Log in to your BuildConnect account to review this bid and compare it with others.</p>
                            
                            <a href="{FRONTEND_URL}/builder/projects/{project_id}" class="button">View Bid Details</a>
                        </div>
                        <div class="footer">
                            <p>© 2025 BuildConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            print(f"Error sending bid received email: {e}")
            return False

    @staticmethod
    async def send_bid_accepted_email(contractor_email: str, contractor_name: str, project_title: str, builder_name: str, builder_company: str):
        """Send email to contractor when bid is accepted"""
        try:
            params = {
                "from": "BuildConnect <onboarding@resend.dev>",
                "to": [contractor_email],
                "subject": f"🎊 Congratulations! Your Bid Was Accepted",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }}
                        .success-box {{ background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; }}
                        .button {{ display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎊 Congratulations!</h1>
                        </div>
                        <div class="content">
                            <p>Hi {contractor_name},</p>
                            
                            <div class="success-box">
                                <h3>✅ Your Bid Has Been Accepted!</h3>
                                <p><strong>Project:</strong> {project_title}</p>
                                <p><strong>Builder:</strong> {builder_name} ({builder_company})</p>
                            </div>
                            
                            <p>The builder has chosen your bid for this project. You can now start coordinating with the builder to begin work.</p>
                            
                            <p>Next steps:</p>
                            <ul>
                                <li>Review project milestones and deliverables</li>
                                <li>Use the chat feature to communicate with the builder</li>
                                <li>Update project progress regularly</li>
                            </ul>
                            
                            <a href="{FRONTEND_URL}/contractor/bids" class="button">View Project Details</a>
                        </div>
                        <div class="footer">
                            <p>© 2025 BuildConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            print(f"Error sending bid accepted email: {e}")
            return False

    @staticmethod
    async def send_bid_rejected_email(contractor_email: str, contractor_name: str, project_title: str):
        """Send email to contractor when bid is rejected"""
        try:
            params = {
                "from": "BuildConnect <onboarding@resend.dev>",
                "to": [contractor_email],
                "subject": f"Update on Your Bid for '{project_title}'",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }}
                        .info-box {{ background: #f1f5f9; border-left: 4px solid #64748b; padding: 20px; margin: 20px 0; }}
                        .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Bid Update</h1>
                        </div>
                        <div class="content">
                            <p>Hi {contractor_name},</p>
                            
                            <div class="info-box">
                                <p>Thank you for submitting your bid for <strong>{project_title}</strong>.</p>
                                <p>After careful consideration, the builder has decided to proceed with another contractor for this project.</p>
                            </div>
                            
                            <p>Don't be discouraged! There are many more opportunities available on BuildConnect.</p>
                            
                            <p><strong>Keep growing:</strong></p>
                            <ul>
                                <li>Browse new projects daily</li>
                                <li>Update your profile and portfolio</li>
                                <li>Competitive pricing and detailed proposals help win bids</li>
                            </ul>
                            
                            <a href="{FRONTEND_URL}/contractor/projects" class="button">Browse New Projects</a>
                        </div>
                        <div class="footer">
                            <p>© 2025 BuildConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            print(f"Error sending bid rejected email: {e}")
            return False

    @staticmethod
    async def send_new_message_email(recipient_email: str, recipient_name: str, sender_name: str, project_title: str, project_id: str):
        """Send email notification for new chat message"""
        try:
            params = {
                "from": "BuildConnect <onboarding@resend.dev>",
                "to": [recipient_email],
                "subject": f"New message from {sender_name} - {project_title}",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }}
                        .button {{ display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💬 New Message</h1>
                        </div>
                        <div class="content">
                            <p>Hi {recipient_name},</p>
                            <p>You have a new message from <strong>{sender_name}</strong> regarding the project: <strong>{project_title}</strong></p>
                            <a href="{FRONTEND_URL}/builder/projects/{project_id}" class="button">View Message</a>
                        </div>
                        <div class="footer">
                            <p>© 2025 BuildConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            print(f"Error sending new message email: {e}")
            return False