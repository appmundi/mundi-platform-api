import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'giozaghi.freitas@gmail.com',
                pass: 'Nervoso@11'
            }
        });
    }

    async sendResetPasswordEmail(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: 'giozaghi.freitas@gmail.com',
            to: email,
            subject: 'Redefinição de Senha',
            text: `Seu código de redefinição de senha é: ${code}`
        };

        await this.transporter.sendMail(mailOptions);
    }
}