const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration not set. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send blood request notification to donor
 */
const sendBloodRequestNotification = async (donorEmail, donorName, requestDetails) => {
  const subject = 'Urgent Blood Donation Request';
  const text = `
    Dear ${donorName},
    
    There is an urgent blood donation request near you:
    
    Blood Type Needed: ${requestDetails.blood_type_needed}
    Units Required: ${requestDetails.units_required}
    Urgency Level: ${requestDetails.urgency_level}
    Hospital: ${requestDetails.hospital_name}
    
    Please consider donating if you are eligible.
    
    Thank you for your support!
  `;
  
  const html = `
    <h2>Urgent Blood Donation Request</h2>
    <p>Dear ${donorName},</p>
    <p>There is an urgent blood donation request near you:</p>
    <ul>
      <li><strong>Blood Type Needed:</strong> ${requestDetails.blood_type_needed}</li>
      <li><strong>Units Required:</strong> ${requestDetails.units_required}</li>
      <li><strong>Urgency Level:</strong> ${requestDetails.urgency_level}</li>
      <li><strong>Hospital:</strong> ${requestDetails.hospital_name}</li>
    </ul>
    <p>Please consider donating if you are eligible.</p>
    <p>Thank you for your support!</p>
  `;

  return await sendEmail(donorEmail, subject, text, html);
};

/**
 * Send low stock alert
 */
const sendLowStockAlert = async (hospitalEmail, hospitalName, bloodType, currentStock, threshold) => {
  const subject = 'Low Blood Stock Alert';
  const text = `
    Dear ${hospitalName},
    
    Your blood inventory is running low:
    
    Blood Type: ${bloodType}
    Current Stock: ${currentStock} units
    Threshold: ${threshold} units
    
    Please consider requesting more units.
  `;
  
  const html = `
    <h2>Low Blood Stock Alert</h2>
    <p>Dear ${hospitalName},</p>
    <p>Your blood inventory is running low:</p>
    <ul>
      <li><strong>Blood Type:</strong> ${bloodType}</li>
      <li><strong>Current Stock:</strong> ${currentStock} units</li>
      <li><strong>Threshold:</strong> ${threshold} units</li>
    </ul>
    <p>Please consider requesting more units.</p>
  `;

  return await sendEmail(hospitalEmail, subject, text, html);
};

/**
 * Send expiring units alert
 */
const sendExpiringUnitsAlert = async (hospitalEmail, hospitalName, expiringUnits) => {
  const subject = 'Blood Units Expiring Soon';
  const text = `
    Dear ${hospitalName},
    
    You have ${expiringUnits.length} blood unit(s) expiring within 7 days.
    
    Please check your inventory and use these units before they expire.
  `;
  
  const html = `
    <h2>Blood Units Expiring Soon</h2>
    <p>Dear ${hospitalName},</p>
    <p>You have <strong>${expiringUnits.length}</strong> blood unit(s) expiring within 7 days.</p>
    <p>Please check your inventory and use these units before they expire.</p>
  `;

  return await sendEmail(hospitalEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendBloodRequestNotification,
  sendLowStockAlert,
  sendExpiringUnitsAlert
};

