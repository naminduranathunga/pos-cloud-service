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
    // create cipher object
const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryption_key, iv);
    let encrypted = cipher.update(raw, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function decrypt_company_db_password(encrypted:string){
    // get encryption key from environment variable
    const encryption_key = process.env.PASSWORD_SYMMETRIC_KEY;
    if(!encryption_key){
        throw new Error("Encryption key not found");
    }

    // create decipher object
    const iv = crypto.randomBytes(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryption_key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

