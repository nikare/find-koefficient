import { ILsData, IndexIds, SecuritiesType } from './interfaces';

export const BASE_URL = 'https://iss.moex.com/iss/statistics/engines/stock/markets/index/analytics';
export const LS_KEY = 'imoex_securities';

export const INITIAL_DATA: ILsData = {
  isWeightSort: false,
  isAllVisible: false,
  hidden: [],
  service: 'tinkoff',
  indexId: 'IMOEX',
};

export const INDEX_IDS: { [key in IndexIds]: [IndexIds, string, SecuritiesType] } = {
  IMOEX: ['IMOEX', 'Индекс МосБиржи', 'stocks'],
  MOEXBC: ['MOEXBC', 'Индекс голубых фишек', 'stocks'],
  MOEX10: ['MOEX10', 'Индекс МосБиржи 10', 'stocks'],
  RGBITR: ['RGBITR', 'Индекс государственных облигаций', 'bonds'],
  RUMBITR: ['RUMBITR', 'Индекс муниципальных облигаций', 'bonds'],
  RUCBITR: ['RUCBITR', 'Индекс корпоративных облигаций', 'bonds'],
  RUEYBCSTR: ['RUEYBCSTR', 'Индекс облигаций повышенной доходности', 'bonds'],
  RUCBHYTR: ['RUCBHYTR', 'Индекс ВДО ПИР', 'bonds'],
};
