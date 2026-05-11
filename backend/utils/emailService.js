import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendPasswordResetEmail = async ({ email, resetToken, userName }) => {
    const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: `"FreshSarura Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Reset your FreshSarura password',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 16px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">🌿 FreshSarura</h1>
            <p style="color: #bbf7d0; margin: 8px 0 0 0; font-size: 14px;">Security & Account Access</p>
          </div>

          <!-- Message -->
          <div style="background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px 0;">Hello, ${userName}</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
              We received a request to reset your password for your FreshSarura account. 
              Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${resetURL}" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                Reset My Password →
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 16px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              FreshSarura · Export & Farmer Hub · Rwanda<br/>
              If you're having trouble clicking the button, copy and paste the link into your browser:<br/>
              <span style="color: #16a34a;">${resetURL}</span>
            </p>
          </div>

        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
        logger.error(`Failed to send reset email to ${email}: ${error.message}`);
        throw error;
    }
};

export const sendFarmerWelcomeEmail = async ({ farmerName, email, password }) => {
    const mailOptions = {
        from: `"FreshSarura Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🌿 Welcome to FreshSarura — Your Account is Ready',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 16px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">🌿 FreshSarura</h1>
            <p style="color: #bbf7d0; margin: 8px 0 0 0; font-size: 14px;">Export & Farmer Hub</p>
          </div>

          <!-- Welcome Message -->
          <div style="background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #15803d; font-size: 20px; margin: 0 0 12px 0;">Welcome, ${farmerName}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
              You have been registered as a <strong>Farm Manager</strong> on the FreshSarura platform. 
              You can now log in to access your farmer portal and manage your farm operations.
            </p>

            <!-- Credentials Box -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <p style="color: #15803d; font-weight: bold; margin: 0 0 12px 0; font-size: 14px;">🔐 Your Login Credentials</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 100px;">Email:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold; font-size: 13px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Password:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold; font-size: 13px; letter-spacing: 1px;">${password}</td>
                </tr>
              </table>
            </div>

            <p style="color: #ef4444; font-size: 12px; margin: 0 0 20px 0;">
              ⚠️ Please change your password after your first login for security.
            </p>

            <!-- Login Button -->
            <div style="text-align: center;">
              <a href="http://localhost:5173/login" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                Login to Your Portal →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 16px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              FreshSarura · Export & Farmer Hub · Rwanda<br/>
              GlobalG.A.P. Certified · 500+ Outgrowers · 14 Export Markets
            </p>
          </div>

        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
        logger.error(`Failed to send email to ${email}: ${error.message}`);
        throw error;
    }
};

export const sendUserWelcomeEmail = async ({ name, email, password, role }) => {
    const roleLabels = {
        admin: 'Administrator',
        production_manager: 'Production Manager',
        farm_manager: 'Farm Manager',
        logistic_officer: 'Logistics Officer',
        quality_officer: 'QC Officer',
    };
    const roleLabel = roleLabels[role] || role;

    const mailOptions = {
        from: `"FreshSarura Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🌿 Welcome to FreshSarura — Your Account is Ready',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">🌿 FreshSarura</h1>
            <p style="color: #bbf7d0; margin: 8px 0 0 0; font-size: 14px;">Export & Farmer Hub</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #15803d; font-size: 20px; margin: 0 0 12px 0;">Welcome, ${name}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
              Your account has been created by an administrator on the FreshSarura platform.
              You have been assigned the role of <strong>${roleLabel}</strong>.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <p style="color: #15803d; font-weight: bold; margin: 0 0 12px 0; font-size: 14px;">🔐 Your Login Credentials</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 100px;">Email:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold; font-size: 13px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Password:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold; font-size: 13px; letter-spacing: 1px;">${password}</td>
                </tr>
              </table>
            </div>
            <p style="color: #ef4444; font-size: 12px; margin: 0 0 20px 0;">
              ⚠️ Please change your password after your first login for security.
            </p>
            <div style="text-align: center;">
              <a href="http://localhost:5173/login"
                 style="display: inline-block; background: #16a34a; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                Login to Your Portal →
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              FreshSarura · Export & Farmer Hub · Rwanda<br/>
              GlobalG.A.P. Certified · 500+ Outgrowers · 14 Export Markets
            </p>
          </div>
        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
        logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
        throw error;
    }
};

export const sendContactReplyEmail = async ({ toName, toEmail, inquiryType, originalMsg, replyNote, adminName }) => {
    const mailOptions = {
        from: `"FreshSarura" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Re: Your ${inquiryType} Inquiry — FreshSarura`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 16px;">

          <div style="background: linear-gradient(135deg, #16a34a, #15803d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">Fresh Sarura</h1>
            <p style="color: #bbf7d0; margin: 8px 0 0 0; font-size: 14px;">Export & Farmer Hub</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 18px; margin: 0 0 8px 0;">Hello, ${toName}</h2>
            <p style="color: #4b5563; font-size: 14px; margin: 0 0 20px 0;">
              Thank you for reaching out. Here is our response to your <strong>${inquiryType}</strong> inquiry.
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #15803d; font-weight: bold; font-size: 13px; margin: 0 0 8px 0;">Our Response</p>
              <p style="color: #1f2937; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-line;">${replyNote}</p>
            </div>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #9ca3af; font-weight: bold; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Your Original Message</p>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-line;">${originalMsg}</p>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              If you have further questions, feel free to reply to this email or reach us at
              <a href="mailto:info@gardenfreshrwanda.com" style="color: #16a34a;">info@gardenfreshrwanda.com</a>.
            </p>
          </div>

          <div style="text-align: center; padding: 16px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              Replied by ${adminName} · FreshSarura · Kigali, Rwanda<br/>
              +250 (780) 389-786 · info@gardenfreshrwanda.com
            </p>
          </div>

        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Contact reply sent to: ${toEmail}`);
    } catch (error) {
        logger.error(`Failed to send reply to ${toEmail}: ${error.message}`);
        throw error;
    }
};