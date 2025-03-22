import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: 'do-not-reply@mundiapp.com.br',
                pass: '002244Br*'
            },
            tls: {
                rejectUnauthorized: false
            },
        });
    }

    async sendResetPasswordEmail(email: string, code: string): Promise<void> {
        try {

            const mailOptions = {
                from: 'do-not-reply@mundiapp.com.br',
                to: email,
                subject: 'Redefinição de Senha',
                text: `Seu código de redefinição de senha é: ${code}`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("Oq deu certoo> ", info.messageId);

        } catch (error) {
            console.log(error)
            throw Error(error)
        }
    }
}