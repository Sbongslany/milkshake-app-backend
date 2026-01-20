

const nodemailer = require('nodemailer');

// Explicit Gmail SMTP config
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Test transporter on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error (check .env EMAIL_USER/PASS):', error);
    } else {
        console.log('Email transporter ready');
    }
});

const sendOrderConfirmation = async (user, order, pricing) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Confirmation #${order._id}`,
            html: `
        <h1>Thank you for your order, ${user.name}!</h1>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Pickup Time:</strong> ${new Date(order.pickupTime).toLocaleString('en-ZA')}</p>
        <p><strong>Restaurant:</strong> ${order.restaurant?.name || 'Selected Branch'}</p>
        <p><strong>Items:</strong> ${order.drinks.length} milkshake(s)</p>
        <p><strong>Total:</strong> R${(pricing.totalCents / 100).toFixed(2)}</p>
        
        <hr>
        <p>We'll prepare your order fresh! See you soon 🍦</p>
        <p><em>Milkshake Shop Team</em></p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${user.email}`);
    } catch (error) {
        console.error('Failed to send email:', error);

    }
};

module.exports = { sendOrderConfirmation };