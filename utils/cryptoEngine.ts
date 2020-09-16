import * as crypto from "crypto";

export class CryptoEngine {

    private secret_key: string;
    private iv: string;

    constructor(secret_key: string = null, iv: string = null) {
        this.secret_key = secret_key || crypto.randomBytes(32).toString('hex');
        this.iv = iv || crypto.randomBytes(16).toString('hex');
    }

    public encrypt(payload: string): string {
        let cipher = crypto.createCipheriv('aes256', Buffer.from(this.secret_key), Buffer.from(this.iv));
        let encrypted = cipher.update(payload);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    }

    public decrypt(payload: string): string {
        let decipher = crypto.createDecipheriv('aes256', Buffer.from(this.secret_key), Buffer.from(this.iv));
        let decrypted = decipher.update(payload, 'hex');
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

}