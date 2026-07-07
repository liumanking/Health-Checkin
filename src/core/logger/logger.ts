type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

function write(level: LogLevel, msg: string, ctx?: LogContext): void {
  const entry = { ts: new Date().toISOString(), level, msg, ...ctx };
  // structured log：單一物件輸出，之後可換成上報
  console[level === 'debug' ? 'log' : level](entry);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => write('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => write('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => write('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => write('error', msg, ctx),
};
