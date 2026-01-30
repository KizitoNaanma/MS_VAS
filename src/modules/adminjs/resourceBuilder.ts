import { PrismaClient } from '@prisma/client/extension';

interface ResourceOptions {
  resource: any;
  options: any;
}

interface ResourceWithOptions {
  resource: Resource;
  options: ResourceOptions;
}

class Resource {
  model: any;
  options: ResourceOptions;

  constructor(model: any, options?: ResourceOptions) {
    this.model = model;
    this.options = options || ({} as ResourceOptions);
  }
}

export class ResourceBuilder {
  private readonly resources: Array<Resource> = [];

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Adds a resource to the builder
   *
   * @param resource string
   * @param options ResourceOptions
   * @returns this
   */
  public addResource(resource: any, options?: ResourceOptions): this {
    const obj = new Resource(resource, options);
    this.resources.push(obj);
    return this;
  }

  /**
   * Compiles the resources into an array of objects
   * that can be passed to the AdminJS module
   *
   * @returns Array<ResourceWithOptions | any>
   */
  public build(): Array<ResourceWithOptions | any> {
    return this.resources.map((resource) => {
      return {
        resource: {
          model: resource.model,
          client: this.prisma,
        },
        options: resource.options,
      };
    });
  }
}
