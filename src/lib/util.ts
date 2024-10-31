export default {
  timestamp: () => Date.now(),
  unixTimestamp: () => Math.floor(Date.now() / 1000),
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }),
  generateRandomString: ({ length = 10, charset = 'alphanumeric' }) => {
    let chars = '';
    if (charset.includes('numeric')) chars += '0123456789';
    if (charset.includes('alpha')) chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  },
  generateCookie: () => {
    return `_ga=GA1.1.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Math.random() * 1000000000)}; _ga_${Math.random().toString(36).substring(2, 15)}=${Math.random().toString(36).substring(2, 15)}`;
  },
  isBASE64Data: (str: string) => /^data:.+;base64,/.test(str),
  removeBASE64DataHeader: (str: string) => str.replace(/^data:.+;base64,/, ''),
  extractBASE64DataFormat: (str: string) => {
    const match = str.match(/^data:(.+);base64,/);
    return match ? match[1] : 'application/octet-stream';
  }
}; 