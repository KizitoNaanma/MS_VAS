export abstract class IHttpService {
  abstract get(url: string, config?: Record<string, any>);

  abstract getWithHeaders(url: string, config?: Record<string, any>);

  abstract delete(url: string, config: Record<string, any>);
  abstract post(
    url: string,
    data: Record<string, any> | string,
    config?: Record<string, any>,
  );

  abstract postWithHeaders(
    url: string,
    data: Record<string, any>,
    config?: Record<string, any>,
  );

  abstract patch(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>,
  );

  abstract put(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>,
  );
}
