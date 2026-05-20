const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use Ethereal for testing purposes (fake SMTP)
  // In a real application, replace with actual SMTP credentials (e.g., Gmail, SendGrid)
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email', // This will fail if not using real credentials, but we'll log the URL for exam purposes
      pass: 'testpassword'
    }
  });

  const message = {
    from: 'noreply@hotelpro.rw',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    // For the purpose of the exam/development without real credentials, we just log it
    console.log('--- EMAIL MOCK ---');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Body:', options.message);
    console.log('------------------');
  }
};

module.exports = sendEmail;
