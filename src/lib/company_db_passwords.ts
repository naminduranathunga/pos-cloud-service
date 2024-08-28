import crypto  from 'crypto';
/**
 * We need to store passwords for company databases in the database.
 * We should encrypt these passwords before storing them in the database.
 */

export function genetate_new_company_db_password(){
    // generate a random password
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&';
    const password = [];
    const charsetLength = charset.length;
    
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charsetLength);
        password.push(charset[randomIndex]);
    }
    
    return password.join('');
}

export function encrypt_company_db_password(raw:string){
    // get encryption key from environment variable
    const encryption_key = process.env.PASSWORD_SYMMETRIC_KEY;
    if(!encryption_key){
        throw new Error("Encryption key not found");
    }
    const encryption_key_b = Buffer.from(encryption_key, 'hex');
    // create cipher object
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryption_key_b, iv);
    let encrypted = cipher.update(raw, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // combine iv and encrypted data
    return iv.toString('hex') + encrypted;
    // return encrypted;
}

export function decrypt_company_db_password(encrypted:string){
    // get encryption key from environment variable
    const encryption_key = process.env.PASSWORD_SYMMETRIC_KEY;
    if(!encryption_key){
        throw new Error("Encryption key not found");
    }
    const encryption_key_b = Buffer.from(encryption_key, 'hex');

    // create decipher object
    const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
    const cipher = encrypted.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryption_key_b, iv);
    let decrypted = decipher.update(cipher, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

