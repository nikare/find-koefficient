export type Services = 'tinkoff' | 'investmint' | 'snowball';
export type IndexIds =
  | 'IMOEX'
  | 'MOEXBC'
  | 'MOEX10'
  | 'RGBITR'
  | 'RUMBITR'
  | 'RUCBITR'
  | 'RUEYBCSTR'
  | 'RUCBHYTR';
export type SecuritiesType = 'bonds' | 'stocks';

export interface IStock {
  ticker: string;
  title: string;
  weight: number;
  isHidden: boolean;
  isPref: boolean;
  withPref: boolean;
  prefTicker?: string;
}

export interface ILsData {
  isWeightSort: boolean;
  isAllVisible: boolean;
  hidden: string[];
  service: Services;
  indexId: IndexIds;
}
