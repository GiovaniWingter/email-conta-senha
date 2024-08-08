const nodemailer = require('nodemailer');
// console.log("-----------------");
// console.log(to);
// console.log("-----------------");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail
        pass: process.env.EMAIL_PASS  // Sua senha ou app password
    },
    tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false // ignorar certificado digital - APENAS EM PRODUÇÃO
    }
});



function enviarEmail(to, subject, text=null, html = null) {


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject
    };
    if(text!= null){
        mailOptions.text = text;
    }else if(html != null){
        mailOptions.html = html
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("email enviado")
        }
    });

}

module.exports = { enviarEmail }