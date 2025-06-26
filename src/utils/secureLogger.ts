
// Secure logging utility that only logs in development
const isDevelopment = import.meta.env.DEV;

export const secureLogger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // In production, only log generic error messages
      console.error('An error occurred');
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  }
};
