export abstract class ICacheService {
  abstract get(key: string): Promise<any>;
  abstract set(key: string, value: any, ttl: number);
  abstract del(key: string);
  abstract reset(): Promise<void>;
}
