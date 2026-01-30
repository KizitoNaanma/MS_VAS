import { Injectable } from '@nestjs/common';
import {
  IcellProductAndServiceType,
  IcellProductType,
  IcellServiceType,
} from 'src/common/types/product';
import icellProducts from '../../../modules/icell/icell-products.json';

@Injectable()
export class IcellProductsService {
  private readonly quizAttemptsPerNaira = 0.01;
  private readonly icellProducts: IcellServiceType[] =
    icellProducts as IcellServiceType[];

  constructor() {}

  private createKeywordPattern(keyword: string): RegExp {
    // Escape special regex characters
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace spaces with flexible space matching
    const flexible = escaped.replace(/\s+/g, '\\s+');
    // Create pattern with word boundaries
    return new RegExp(`\\b${flexible}\\b`, 'i');
  }

  getIcellServices() {
    return this.icellProducts;
  }

  getServicesByReligion(religion: string) {
    return this.icellProducts.filter(
      (service) => service.religion === religion,
    );
  }

  getServiceById(id: string) {
    return this.icellProducts.find((service) => service.id === id);
  }

  getProductById(id: string, serviceId?: string) {
    if (serviceId) {
      const service = this.getServiceById(serviceId);
      return service.products.find((product) => product.id === id);
    }
    return this.icellProducts
      .flatMap((service) => service.products)
      .find((product) => product.id === id);
  }

  getServiceByProductId(id: string) {
    return this.icellProducts.find((service) =>
      service.products.find((product) => product.id === id),
    );
  }

  getProductByKeyword(keyword: string) {
    const allProducts = this.icellProducts.flatMap(
      (service) => service.products,
    );
    const product = allProducts.find(
      (product) =>
        product.optInKeywords.includes(keyword) ||
        product.optOutKeywords.includes(keyword),
    );
    return product;
  }

  getProductQuizAttempts(product: IcellProductType) {
    const price = product.price;
    const quizAttempts = price * this.quizAttemptsPerNaira;
    return quizAttempts;
  }

  getProductAndServiceByKeyword(keyword: string): IcellProductAndServiceType {
    const product = this.getProductByKeyword(keyword);
    const service = this.icellProducts.find((service) =>
      service.products.find((p) => p.id === product.id),
    );
    return { service, product };
  }

  getAllProductKeywords(type: 'subscribe' | 'unsubscribe' | 'all') {
    const allProducts = this.icellProducts.flatMap(
      (service) => service.products,
    );
    const keywords = allProducts.map((product) => {
      if (type === 'all') {
        return [...product.optInKeywords, ...product.optOutKeywords];
      } else if (type === 'subscribe') {
        return product.optInKeywords;
      } else {
        return product.optOutKeywords;
      }
    });
    return keywords.flat();
  }

  getProductKeywordType(keyword: string) {
    const product = this.getProductByKeyword(keyword);
    const type = product.optInKeywords.includes(keyword)
      ? 'subscribe'
      : 'unsubscribe';

    return type;
  }

  extractKeywords(message: string): {
    type: 'subscribe' | 'unsubscribe';
    keyword: string;
  } {
    const normalizedMessage = message.toLowerCase();
    const allKeywords = this.getAllProductKeywords('all');

    const sortedKeywords = allKeywords.sort((a, b) => b.length - a.length);

    const foundKeyword = sortedKeywords.find((keyword) =>
      this.createKeywordPattern(keyword).test(normalizedMessage),
    );

    if (foundKeyword) {
      const type = this.getProductKeywordType(foundKeyword);
      return { type, keyword: foundKeyword };
    }

    return { type: 'unsubscribe', keyword: '' };
  }
}
