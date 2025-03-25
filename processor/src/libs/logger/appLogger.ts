import { Logger } from '@commercetools/connect-payments-sdk';
import { logger } from './logger';

class AppLogger implements Logger {
  public debug = (obj: object, message: string) => {
    logger.debug(message, obj || undefined);
  };
  public info = (obj: object, message: string) => {
    logger.info(message, obj || undefined);
  };
  public warn = (obj: object, message: string) => {
    logger.warn(message, obj || undefined);
  };
  public error = (obj: object, message: string) => {
    logger.error(message, obj || undefined);
  };
}

const appLogger = new AppLogger();

export { appLogger };
