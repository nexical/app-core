export const logger = {
  info: (msg: string) => console.info(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string, err?: any) => {
    console.error(msg);
    if (err) console.error(err);
  },
  success: (msg: string) => console.log(msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) console.log(msg);
  },
};
