import { CryptoEngine } from "../utils/cryptoEngine";
import * as JwtHelper from "jsonwebtoken";
import "reflect-metadata";
import { singleton } from "tsyringe";

@singleton()
export class Auth {

    private secret_key: string = 'MXuqsy6:zYWaNy~]?iu;8R1KGF+(Jr12';
    private iv: string = 'MXuqsy6:zYWaNy~]';
    private crypto_engine: CryptoEngine;

    constructor() {
        this.crypto_engine = new CryptoEngine(this.secret_key, this.iv)
    }

    validateToken(token: string): boolean {
        let payload = this.getPayload(token);
        let id = this.crypto_engine.decrypt(payload.checksum).split("#")[0];
        return !!JwtHelper.verify(token, this.secret_key) && id == payload.id;
    }

    createToken(payload: any): string {
        let checksum = this.crypto_engine.encrypt(payload.id + "#" + (payload.roles || []).join(","));
        payload.checksum = checksum;
        return JwtHelper.sign(payload, this.secret_key, { expiresIn: "90 days" })
    }

    getPayload(token: string): any {
        let payload = JwtHelper.decode(token);
        return payload;
    }

    tokenAsRole(token: string, role: string | string[]): boolean {
        let payload = this.getPayload(token);
        let checksum = this.crypto_engine.decrypt(payload.checksum)
        let roles = (checksum.split("#")[1] || '').split(',');
        let id = checksum.split("#")[0];
        
        if (typeof role == "string") {
            return roles.indexOf(role) > -1 && id == payload.id;
        }

        return !!roles.find(r => role.indexOf(r) > -1) && id == payload.id;
    }

    encryptPassword(password: string): string {
        return this.crypto_engine.encrypt(password);
    }
}