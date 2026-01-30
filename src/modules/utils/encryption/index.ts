import { Injectable } from '@nestjs/common';
import * as bcrypt from '@node-rs/bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionUtilsService {
  /**
   * compares hash password with a password
   * @param password password to compare
   * @param hashedPassword hashed password to compare password with
   * @returns true or false
   */
  public async compareHash(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      const bool = await bcrypt.compare(password, hashedPassword);
      return bool;
    } catch (e) {
      throw e;
    }
  }

  /**
   * hashes a string, character, words. We mostly use it to hash passwords
   * @param password character or string to hash
   * @returns
   */
  public async hash(password: string) {
    const saltRound = 10;
    const hash = await bcrypt.hashSync(password, saltRound);
    return hash;
  }

  generateEncryptionKey(password: string) {
    return crypto.scryptSync(password, 'salt', 24);
  }

  generateEncryptionIV() {
    return Buffer.alloc(16, 0); // Initialization vector.
  }

  encryptData(text: string, password: string, algo: string) {
    try {
      const key = this.generateEncryptionKey(password);
      const iv = this.generateEncryptionIV();
      const cipher = crypto.createCipheriv(algo, key, iv);

      let encrypted;
      encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (e) {
      throw new Error(e);
    }
  }

  decryptData(text: string, password: string, algo: string) {
    try {
      const key = this.generateEncryptionKey(password);
      const iv = this.generateEncryptionIV();
      const decipher = crypto.createDecipheriv(algo, key, iv);

      let decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      throw new Error(e);
    }
  }
  sha256WithoutSecretKey(payload: string) {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  sha256WithSecretKey(secret: string, payload: string) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  sha512WithoutSecretKey(payload: string) {
    return crypto.createHash('sha512').update(payload).digest('hex');
  }

  sha512WithSecretKey(secret: string, payload: string) {
    return crypto.createHmac('sha512', secret).update(payload).digest('hex');
  }

  safeCompare(a: string, b: string): boolean {
    // Convert inputs to buffers
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    // Both buffers must be the same length
    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
  }
}
