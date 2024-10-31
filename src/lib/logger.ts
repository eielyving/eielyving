export default {
  info: (message: any) => console.log('[INFO]', message),
  success: (message: any) => console.log('[SUCCESS]', message),
  warn: (message: any) => console.warn('[WARN]', message),
  error: (message: any) => console.error('[ERROR]', message)
}; 