export interface IcellProductType {
  id: string;
  name: string;
  price: number;
  currency: string;
  optInKeywords: string[];
  optOutKeywords: string[];
  validityDays: string;
  maxAccess: number | 'unlimited';
}

export interface IcellServiceType {
  id: string;
  name: string;
  type: 'subscription' | 'ondemand' | 'game';
  religion?: string;
  service?: string;
  products: IcellProductType[];
}

export interface IcellProductAndServiceType {
  service: IcellServiceType;
  product: IcellProductType;
}
