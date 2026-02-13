
declare module 'speakeasy' {
    interface SharedOptions {
        encoding?: 'ascii' | 'hex' | 'base32' | 'base64';
        algorithm?: 'sha1' | 'sha256' | 'sha512';
    }

    interface GenerateSecretOptions extends SharedOptions {
        length?: number;
        symbols?: boolean;
        name?: string;
        issuer?: string;
        google_auth_qr?: boolean;
        qr_codes?: boolean;
    }

    interface GeneratedSecret {
        ascii: string;
        hex: string;
        base32: string;
        qr_code_ascii?: string;
        qr_code_hex?: string;
        qr_code_base32?: string;
        google_auth_qr?: string;
        otpauth_url?: string;
    }

    interface TotpOptions extends SharedOptions {
        secret: string;
        step?: number;
        time?: number;
        epoch?: number;
        counter?: number;
        window?: number;
    }

    interface TotpVerifyOptions extends TotpOptions {
        token: string;
    }

    function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;
    function generateSecretASCII(length?: number, symbols?: boolean): string;

    function totp(options: TotpOptions): string;
    function totp_verify(options: TotpVerifyOptions): boolean;
    function totp(options: TotpVerifyOptions): boolean; // alias for totp.verify

    interface HotpOptions extends SharedOptions {
        secret: string;
        counter: number;
    }

    interface HotpVerifyOptions extends HotpOptions {
        token: string;
        window?: number;
    }

    function hotp(options: HotpOptions): string;
    function hotp_verify(options: HotpVerifyOptions): boolean;
    function hotp(options: HotpVerifyOptions): boolean; // alias for hotp.verify

    function OTP(options: TotpOptions | HotpOptions): string;
}
