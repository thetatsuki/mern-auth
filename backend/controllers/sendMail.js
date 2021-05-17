const nodemailer = require('nodemailer')


const email = ''
const password = ''

const sendMail = (to, url) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: email,
            pass: password
        }
    })
    const message = {
        from: 'Mailer Test<test-mern-auth@mail.ru>',
        to: to,
        subject: 'Tatsuki - AUTH',
        html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Tatsuki_AUTH</h2>
        <p>Congratulations! You're almost set to start using Tatsuki_AUTH
            Just click the button below to validate your email address.
        </p>
        
        <a href=${url} style="background: crimson; cursor: pointer; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">clickme</a>
        <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        <div>${url}</div>
        </div>
        `
    }
    transporter.sendMail(message, (err, info) => {
        if (err) return err
    })
}

module.exports = sendMail