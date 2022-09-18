export type Services = 'tinkoff' | 'snowball';
export type IndexIds = 'IMOEX' | 'MOEXBC' | 'RGBITR' | 'RUEYBCSTR';
export type SecuritiesType = 'bonds' | 'stocks';

export interface IStock {
  ticker: string;
  title: string;
  price: number;
  change: number;
  percentChange: number;
  weight: number;
  isHidden: boolean;
  isPref: boolean;
  withPref: boolean;
  prefTicker?: string;
}

export interface ILsData {
  isWeightSort: boolean;
  isAllVisible: boolean;
  hidden: {
    [key in IndexIds]: string[];
  };
  service: Services;
  indexId: IndexIds;
}
