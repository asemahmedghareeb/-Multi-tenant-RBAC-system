import crypto from 'crypto';

export class OtpUtil {
  static generateOtp() {
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
  }

  static verifyOtp(otp: string, actualOtp: string, actualOtpExpireAt: Date) {
    const isValid = otp === actualOtp;
    const isExpired = Date.now() > actualOtpExpireAt.getTime();
    return isValid && !isExpired;
  }
}
