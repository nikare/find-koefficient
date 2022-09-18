export type Services = 'tinkoff' | 'snowball';
export type IndexIds = 'IMOEX' | 'RGBITR' /* | 'RUEYBCSTR'*/;
export type SecuritiesType = 'bonds' | 'shares';

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
  dateExp?: string;
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
