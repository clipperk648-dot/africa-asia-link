import crypto from 'crypto';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'echina_salt').digest('hex');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

const createSessionToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const parseGoogleToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch (err) {
    throw new Error('Invalid token: ' + err.message);
  }
};

export { hashPassword, verifyPassword, createSessionToken, parseGoogleToken };
