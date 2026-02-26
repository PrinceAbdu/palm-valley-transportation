import nodemailer from 'nodemailer';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

const emailHeaderStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #f8f9fa;
`;

const emailContainerStyles = `
    background-color: #ffffff;
    border-top: 4px solid #1e40af;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 20px auto;
    max-width: 600px;
`;

const headerBannerStyles = `
    background: linear-gradient(135deg, #1e40af 0%, #0d2849 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
`;

const logoStyles = `
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #fbbf24;
`;

const contentStyles = `
    padding: 30px 20px;
    color: #333333;
`;

const sectionTitleStyles = `
    color: #1e40af;
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0 15px 0;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 10px;
`;

const detailsTableStyles = `
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
`;

const detailRowStyles = `
    border-bottom: 1px solid #e5e7eb;
`;

const detailLabelStyles = `
    color: #6b7280;
    font-weight: 500;
    padding: 12px 0;
    width: 35%;
    background-color: #f3f4f6;
    padding: 12px 12px;
`;

const detailValueStyles = `
    color: #1f2937;
    font-weight: 600;
    padding: 12px 12px;
`;

const ctaButtonStyles = `
    display: inline-block;
    padding: 12px 30px;
    background: linear-gradient(135deg, #1e40af 0%, #0d2849 100%);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    margin: 20px 0;
    font-weight: 600;
    transition: opacity 0.3s;
`;

const footerStyles = `
    background-color: #f3f4f6;
    border-top: 1px solid #e5e7eb;
    padding: 20px;
    text-align: center;
    color: #6b7280;
    font-size: 12px;
`;

const badgeStyles = `
    display: inline-block;
    background-color: #dbeafe;
    color: #0d2849;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin: 3px;
`;

export async function sendEmail(params: EmailParams): Promise<boolean> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.log('Email service not configured, skipping email send');
            console.log(`Would send email to ${params.to}: ${params.subject}`);
            return false;
        }

        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: params.to,
            subject: params.subject,
            html: params.html,
        });

        console.log(`Email sent to ${params.to}: ${params.subject}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export async function sendBookingConfirmation(booking: any, userEmail: string): Promise<boolean> {
    return sendEmail({
        to: userEmail,
        subject: `Booking Confirmed - Palm Valley Transportation #${booking.bookingNumber}`,
        html: `
            <div style="${emailHeaderStyles}">
                <div style="${emailContainerStyles}">
                    <div style="${headerBannerStyles}">
                        <div style="${logoStyles}">🚗 Palm Valley Transportation</div>
                        <p style="margin: 0; font-size: 14px; color: #e5e7eb;">Your Trusted Ride Partner</p>
                    </div>
                    
                    <div style="${contentStyles}">
                        <h2 style="${sectionTitleStyles}">✓ Booking Confirmed!</h2>
                        
                        <p style="margin: 0 0 20px 0; color: #555;">Dear Valued Customer,</p>
                        <p style="margin: 0 0 20px 0; color: #555;">Your ride has been confirmed! We're looking forward to providing you with a professional, safe, and comfortable transportation experience.</p>
                        
                        <table style="${detailsTableStyles}">
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Booking Number</strong></td>
                                <td style="${detailValueStyles}">#${booking.bookingNumber}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Pickup Location</strong></td>
                                <td style="${detailValueStyles}">${booking.pickup?.address || 'Not specified'}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Drop-off Location</strong></td>
                                <td style="${detailValueStyles}">${booking.dropoff?.address || 'Not specified'}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Date & Time</strong></td>
                                <td style="${detailValueStyles}">${booking.scheduledDate} at ${booking.scheduledTime}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Passengers</strong></td>
                                <td style="${detailValueStyles}">${booking.passengers || 1}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Total Amount</strong></td>
                                <td style="${detailValueStyles}"><span style="font-size: 18px; color: #1e40af;">$${(booking.totalPrice || 0).toFixed(2)}</span></td>
                            </tr>
                        </table>

                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0284c7;">
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px;"><strong>💡 Tip:</strong> Arrive 5-10 minutes early at your pickup location for a smooth experience.</p>
                        </div>

                        <h3 style="color: #1e40af; font-size: 14px; margin: 20px 0 10px 0; font-weight: 600;">Why Choose Palm Valley Transportation?</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                            <span style="${badgeStyles}">✓ Licensed & Insured</span>
                            <span style="${badgeStyles}">✓ Professional Drivers</span>
                            <span style="${badgeStyles}">✓ 24/7 Support</span>
                            <span style="${badgeStyles}">✓ Transparent Pricing</span>
                        </div>
                    </div>
                    
                    <div style="${footerStyles}">
                        <p style="margin: 0 0 8px 0;">© 2026 Palm Valley Transportation. All rights reserved.</p>
                        <p style="margin: 0;">📞 Available 24/7 | 🌐 www.palmvalleytransportation.com</p>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        `,
    });
}

export async function sendDriverAssigned(booking: any, driverName: string, userEmail: string): Promise<boolean> {
    return sendEmail({
        to: userEmail,
        subject: `Driver Assigned - Palm Valley Transportation #${booking.bookingNumber}`,
        html: `
            <div style="${emailHeaderStyles}">
                <div style="${emailContainerStyles}">
                    <div style="${headerBannerStyles}">
                        <div style="${logoStyles}">🚗 Palm Valley Transportation</div>
                        <p style="margin: 0; font-size: 14px; color: #e5e7eb;">Your Driver is on the way</p>
                    </div>
                    
                    <div style="${contentStyles}">
                        <h2 style="${sectionTitleStyles}">👤 Driver Assigned!</h2>
                        
                        <p style="margin: 0 0 20px 0; color: #555;">Great news! A professional driver has been assigned to your booking. You're all set for a safe and comfortable ride.</p>
                        
                        <table style="${detailsTableStyles}">
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Booking Number</strong></td>
                                <td style="${detailValueStyles}">#${booking.bookingNumber}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Driver Name</strong></td>
                                <td style="${detailValueStyles}"><span style="color: #1e40af; font-weight: bold;">${driverName}</span></td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Pickup Time</strong></td>
                                <td style="${detailValueStyles}">${booking.scheduledDate} at ${booking.scheduledTime}</td>
                            </tr>
                        </table>

                        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
                            <p style="margin: 0; color: #166534; font-size: 14px;"><strong>✓ Confirmed:</strong> Your driver is verified and has an excellent safety rating. You'll receive SMS updates with live tracking information.</p>
                        </div>

                        <h3 style="color: #1e40af; font-size: 14px; margin: 20px 0 10px 0; font-weight: 600;">What to Expect</h3>
                        <ol style="color: #555; margin: 10px 0 20px 20px; padding: 0;">
                            <li>Your driver will arrive within the estimated time window</li>
                            <li>You'll receive SMS notifications with driver location</li>
                            <li>Look for the vehicle description provided in your confirmation</li>
                            <li>Be ready at your pickup location</li>
                        </ol>
                    </div>
                    
                    <div style="${footerStyles}">
                        <p style="margin: 0 0 8px 0;">© 2026 Palm Valley Transportation. All rights reserved.</p>
                        <p style="margin: 0;">📞 24/7 Support Hotline | 🌐 www.palmvalleytransportation.com</p>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">Need help? Contact us immediately through our app or website.</p>
                    </div>
                </div>
            </div>
        `,
    });
}

export async function sendStatusUpdate(booking: any, status: string, userEmail: string): Promise<boolean> {
    const statusEmoji: Record<string, string> = {
        confirmed: '✓',
        driver_assigned: '👤',
        in_progress: '🚗',
        arrived: '🎯',
        completed: '✓',
        cancelled: '✗',
    };

    const statusColor: Record<string, string> = {
        confirmed: '#0284c7',
        driver_assigned: '#0284c7',
        in_progress: '#f59e0b',
        arrived: '#16a34a',
        completed: '#16a34a',
        cancelled: '#dc2626',
    };

    const emoji = statusEmoji[status] || '•';
    const color = statusColor[status] || '#1e40af';

    return sendEmail({
        to: userEmail,
        subject: `Booking Update - Palm Valley Transportation #${booking.bookingNumber}`,
        html: `
            <div style="${emailHeaderStyles}">
                <div style="${emailContainerStyles}">
                    <div style="${headerBannerStyles}">
                        <div style="${logoStyles}">🚗 Palm Valley Transportation</div>
                        <p style="margin: 0; font-size: 14px; color: #e5e7eb;">Trip Status Updated</p>
                    </div>
                    
                    <div style="${contentStyles}">
                        <h2 style="color: ${color}; font-size: 20px; margin: 0 0 20px 0;">${emoji} Booking Update</h2>
                        
                        <table style="${detailsTableStyles}">
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Booking Number</strong></td>
                                <td style="${detailValueStyles}">#${booking.bookingNumber}</td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Status</strong></td>
                                <td style="${detailValueStyles}"><span style="color: ${color}; font-weight: bold; font-size: 16px;">${status.replace('_', ' ').toUpperCase()}</span></td>
                            </tr>
                            <tr style="${detailRowStyles}">
                                <td style="${detailLabelStyles}"><strong>Updated At</strong></td>
                                <td style="${detailValueStyles}">${new Date().toLocaleString()}</td>
                            </tr>
                        </table>

                        <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0284c7;">
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px;">Your ride is progressing smoothly. We're committed to getting you to your destination safely and on time.</p>
                        </div>
                    </div>
                    
                    <div style="${footerStyles}">
                        <p style="margin: 0 0 8px 0;">© 2026 Palm Valley Transportation. All rights reserved.</p>
                        <p style="margin: 0;">📞 Questions? Contact us | 🌐 www.palmvalleytransportation.com</p>
                    </div>
                </div>
            </div>
        `,
    });
}

export async function sendPasswordReset(email: string, resetUrl: string): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: 'Password Reset Request - Palm Valley Transportation',
        html: `
            <div style="${emailHeaderStyles}">
                <div style="${emailContainerStyles}">
                    <div style="${headerBannerStyles}">
                        <div style="${logoStyles}">🚗 Palm Valley Transportation</div>
                        <p style="margin: 0; font-size: 14px; color: #e5e7eb;">Account Security</p>
                    </div>
                    
                    <div style="${contentStyles}">
                        <h2 style="${sectionTitleStyles}">🔐 Password Reset Request</h2>
                        
                        <p style="margin: 0 0 20px 0; color: #555;">We received a request to reset your password for your Palm Valley Transportation account. If you didn't make this request, please ignore this email.</p>

                        <p style="margin: 0 0 10px 0; color: #555; text-align: center;">
                            <a href="${resetUrl}" style="${ctaButtonStyles}">Reset Your Password</a>
                        </p>

                        <p style="margin: 0 0 20px 0; text-align: center;">
                            <a href="${resetUrl}" style="color: #0284c7; text-decoration: none; font-size: 12px;">${resetUrl}</a>
                        </p>

                        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                            <p style="margin: 0; color: #7f1d1d; font-size: 14px;"><strong>⚠️ Security Notice:</strong> This link expires in 1 hour. For your security, never share this link with anyone. Palm Valley Transportation will never ask for your password via email.</p>
                        </div>

                        <h3 style="color: #1e40af; font-size: 14px; margin: 20px 0 10px 0; font-weight: 600;">Account Security Tips</h3>
                        <ul style="color: #555; margin: 10px 0 20px 20px; padding: 0;">
                            <li>Use a strong, unique password</li>
                            <li>Enable two-factor authentication when available</li>
                            <li>Never share your login credentials</li>
                            <li>Report suspicious activity immediately</li>
                        </ul>
                    </div>
                    
                    <div style="${footerStyles}">
                        <p style="margin: 0 0 8px 0;">© 2026 Palm Valley Transportation. All rights reserved.</p>
                        <p style="margin: 0;">🔒 Your security is our priority | 🌐 www.palmvalleytransportation.com</p>
                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">This is a security-related email. Do not forward to others.</p>
                    </div>
                </div>
            </div>
        `,
    });
}
