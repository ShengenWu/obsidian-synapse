import { singleton } from "tsyringe";

@singleton()
export class LoggerService {
  public info(message: string, ...args: any[]): void {
    console.log(`[Synapse]: ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[Synapse]: ${message}`, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(`[Synapse]: ${message}`, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    // Only log in dev mode ideally, but for now just log
    console.debug(`[Synapse]: ${message}`, ...args);
  }
}
