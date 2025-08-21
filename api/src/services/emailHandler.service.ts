import mailConfig from "../configs/email.config";
import ora from 'ora';
import chalk from 'chalk';

class EmailHandler {
    static async send(to: string, subject: string, template: string) {
        const mailOptions = {
            from: Bun.env.EMAIL,
            to,
            subject,
            html: template,
        };
        const spinner = ora({ text: 'Sending mail...', color: 'blue' }).start();
        try {
            // Use Promise API
            const info = await mailConfig.sendMail(mailOptions);
            spinner.succeed(
                chalk.bold.greenBright('✅ Email Sent') +
                chalk.dim(' | Receiver: ' + to)
            );
            console.log('Mail info:', info);
            return info;
        } catch (error) {
            spinner.fail(
                chalk.bold.redBright('❌ Error sending mail: ') +
                chalk.whiteBright(`Error: ${(error as any)?.message || error}`) +
                chalk.dim(` | Code: ${((error as any).code ?? 'Unknown')}`)
            );
            console.error('Email send error details:', error);
            // rethrow so callers can handle failure
            throw error;
        }
    }


    static async convertImageToBase64(imageUrl: string): Promise<string> {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/png';
            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error converting image to Base64: ${error.message}`);
            } else {
                throw new Error('Error converting image to Base64: Unknown error');
            }
        }
    }
}

export default EmailHandler