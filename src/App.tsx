import { useEffect, useState } from 'react';
import axios from 'axios';

interface IStock {
  ticker: string;
  title: string;
  weight: number;
  isHidden: boolean;
  isPref: boolean;
  withPref: boolean;
  eq: string;
  prefTicker?: string;
}

type LsData = { isWeightSort: boolean; isAllVisible: boolean; hidden: string[] };

const BASE_URL = 'https://iss.moex.com/iss';
const LS_KEY = 'imoex_securities';

const LS_DATA = localStorage.getItem(LS_KEY);
const defaultLsData: LsData = { isWeightSort: false, isAllVisible: false, hidden: [] };

export const App = () => {
  const [lsData, setLsData] = useState<typeof defaultLsData>(
    LS_DATA ? JSON.parse(LS_DATA) : defaultLsData,
  );
  const [dateTime, setDateTime] = useState<string>();
  const [stocks, setStocks] = useState<IStock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const url = `${BASE_URL}/statistics/engines/stock/markets/index/analytics/IMOEX.json`;
    const params = `iss.meta=off&start=${stocks.length}`;
    axios.get(`${url}?${params}`).then(({ data }) => {
      setIsLoaded(
        stocks.length + data.analytics.data.length >= data['analytics.cursor'].data[0][1],
      );
      const stocksPart: IStock[] = data.analytics.data.map(
        ([_, , ticker, title, , weight]: [any, any, string, string, any, number]) => {
          return { ticker, title, weight, isHidden: lsData.hidden.includes(ticker) };
        },
      );
      setDateTime(data['analytics.dates'].data[0][1]);
      setStocks((prevState) => [...prevState, ...stocksPart]);
    });
  }, [isLoaded, lsData.hidden, stocks.length]);

  if (!isLoaded || !dateTime) {
    return null;
  }

  const onChecked = () => {
    setLsData((prevState) => {
      const newState = { ...prevState, isAllVisible: !prevState.isAllVisible };
      localStorage.setItem(LS_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  const onSelect = () => {
    setLsData((prevState) => {
      const newState = { ...prevState, isWeightSort: !prevState.isWeightSort };
      localStorage.setItem(LS_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  const hideOrVisible = (_ticker: string) => {
    setStocks((prevState) => {
      const newStocks = [...prevState];
      const findedIndex = newStocks.findIndex(({ ticker }) => ticker === _ticker);
      newStocks[findedIndex].isHidden = !newStocks[findedIndex].isHidden;
      const hiddenTickets = newStocks
        .filter(({ isHidden }) => isHidden)
        .map(({ ticker }) => ticker);

      setLsData((prevState) => {
        const newState = { ...prevState, hidden: hiddenTickets };
        localStorage.setItem(LS_KEY, JSON.stringify(newState));
        return newState;
      });
      return newStocks;
    });
  };

  const normalizedStocks = stocks
    .map((stock) => {
      const prefStock = stocks.find(({ ticker }) => `${stock.ticker}P` === ticker);
      if (!prefStock) return stock;
      prefStock.isPref = true;
      return {
        ...stock,
        prefTicker: prefStock.ticker,
        weight: Math.floor((stock.weight + prefStock.weight) * 100) / 100,
        withPref: true,
      };
    })
    .filter(({ isPref }) => !isPref);

  const sortedStocks = [...normalizedStocks].sort((a, b) =>
    lsData.isWeightSort ? b.weight - a.weight : 1,
  );

  const filteredStocks = sortedStocks.filter(({ isHidden }) => lsData.isAllVisible || !isHidden);
  const withoutHidden = filteredStocks.filter(({ isHidden }) => !isHidden);
  const isShowedMoreThan10 = withoutHidden.length > 10;

  let eq = 0;
  withoutHidden.forEach((stock) => {
    eq = eq + 1;

    if (stock.withPref) {
      stock.eq = `${eq} / ${eq + 1}`;
      eq = eq + 1;
    } else {
      stock.eq = `${eq}`;
    }
  });

  const totalWeight = withoutHidden.reduce((accum, { weight }) => {
    return Math.round((accum + weight) * 100) / 100;
  }, 0);

  const stakes = filteredStocks.reduce((accum, { ticker, weight, isHidden }, index) => {
    const stake = isHidden ? 0 : Math.round((weight / (totalWeight * 0.01)) * 100) / 100;
    accum[ticker] = stake > 15 ? 15 : stake;

    if (index + 1 >= filteredStocks.length) {
      const total = Object.values(accum).reduce((accum, value) => accum + value, 0);
      accum.total = Math.round(total * 100) / 100;

      let leftValue = Math.round((100 - accum.total) * 100) / 100;

      const distribute = () => {
        const filteredStake = Object.entries(accum)
          .filter(([key, value]) => key !== 'total' && value > 0 && value < 15)
          .sort((a, b) => b[1] - a[1]);

        if (leftValue > 0) {
          for (let i = filteredStake.length; i--; ) {
            if (leftValue <= 0) break;
            const ticker = filteredStake[i][0];
            accum[ticker] = Math.round((accum[ticker] + 0.01) * 100) / 100;
            accum.total = Math.round((accum.total + 0.01) * 100) / 100;
            leftValue = Math.round((leftValue - 0.01) * 100) / 100;
          }
        } else if (leftValue < 0) {
          for (let i = 0; i < filteredStake.length; i++) {
            if (leftValue >= 0) break;
            const ticker = filteredStake[i][0];
            accum[ticker] = Math.round((accum[ticker] - 0.01) * 100) / 100;
            accum.total = Math.round((accum.total - 0.01) * 100) / 100;
            leftValue = Math.round((leftValue + 0.01) * 100) / 100;
          }
        }

        if (leftValue !== 0) {
          distribute();
        }
      };
      distribute();
    }

    return accum;
  }, {} as { [key: string]: number });

  return (
    <div className="app">
      <h1>Индекс МосБиржи ({new Date(dateTime).toLocaleDateString('ru-RU')}г.)</h1>
      <form className="pure-form">
        <fieldset>
          {normalizedStocks.length > withoutHidden.length && (
            <label>
              <input type="checkbox" onChange={onChecked} checked={lsData.isAllVisible} />
              <span> Показать все</span>
            </label>
          )}
          <span>Сортировать по: </span>
          <select onChange={onSelect} value={lsData.isWeightSort ? 'weight' : 'ticker'}>
            <option value="ticker">Тикеру</option>
            <option value="weight">Весу</option>
          </select>
        </fieldset>
      </form>
      <table className="pure-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Тикер</th>
            <th>Название</th>
            <th>Вес в индексе</th>
            <th>Доля в портфеле</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map(({ eq, ticker, prefTicker, title, weight, isHidden }, index) => {
            return (
              <tr key={index} className={isHidden ? 'is-hidden' : ''}>
                <td>{eq}</td>
                <td>
                  {prefTicker ? (
                    <div>
                      <a
                        href={`https://snowball-income.com/public/asset/${ticker}.MCX`}
                        target="_blank"
                        rel="noreferrer">
                        {ticker}
                      </a>
                      <span> / </span>
                      <a
                        href={`https://snowball-income.com/public/asset/${prefTicker}.MCX`}
                        target="_blank"
                        rel="noreferrer">
                        {prefTicker}
                      </a>
                    </div>
                  ) : (
                    <a
                      href={`https://snowball-income.com/public/asset/${ticker}.MCX`}
                      target="_blank"
                      rel="noreferrer">
                      {ticker}
                    </a>
                  )}
                </td>
                <td>{title}</td>
                <td>{weight}%</td>
                <td>{stakes[ticker]}%</td>
                <td>
                  <span className="link" onClick={() => hideOrVisible(ticker)}>
                    {!isHidden ? (isShowedMoreThan10 ? 'убрать' : '') : 'вернуть'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6}>
              <span>Итого - </span>
              <span>по весу на МосБирже: {totalWeight}%</span>
              <span> | </span>
              <span>по доле в портфеле: {stakes.total}%</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
