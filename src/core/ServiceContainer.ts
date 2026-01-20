import "reflect-metadata";
import { container, DependencyContainer, InjectionToken } from "tsyringe";

export class ServiceContainer {
  private static instance: ServiceContainer;
  private container: DependencyContainer;

  private constructor() {
    this.container = container;
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public register<T>(token: InjectionToken<T>, provider: any): void {
    this.container.register(token, provider);
  }

  public registerSingleton<T>(token: InjectionToken<T>, provider: any): void {
    this.container.registerSingleton(token, provider);
  }

  public resolve<T>(token: InjectionToken<T>): T {
    return this.container.resolve(token);
  }
}
