const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail
        pass: process.env.EMAIL_PASS  // Sua senha ou app password
    },
    tls: {
        rejectUnauthorized: false // ignorar certificado digital - APENAS EM PRODUÇÃO
    }
});

function enviarEmail(to, subject, text)  {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.toString());
        }
        console.log("email enviado")
    });

}

module.exports = {enviarEmail}