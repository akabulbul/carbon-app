import {
  OrderBook,
  orderBookConfig,
  useGetOrderBook,
} from 'libs/queries/sdk/orderBook';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash';
import { useTokens } from 'hooks/useTokens';
import { sanitizeNumberInput } from 'utils/helpers';

export const useOrderBookWidget = (base?: string, quote?: string) => {
  const orderBookQuery = useGetOrderBook(base, quote);
  const { getTokenById } = useTokens();

  const orders = useMemo<OrderBook>(() => {
    const buy = [...(orderBookQuery.data?.buy || [])];
    const sell = [...(orderBookQuery.data?.sell || [])];

    const data = {
      buy: orderBy(buy, ({ rate }) => Number(rate), 'desc'),
      sell: orderBy(sell, ({ rate }) => Number(rate), 'asc'),
    };

    const _subtractPrevAmount = (
      buy: boolean,
      amount: string,
      rate: string,
      i: number
    ) => {
      const prevAmount = data[buy ? 'buy' : 'sell'][i - 1]?.amount || '0';
      const newAmount = new BigNumber(amount).minus(prevAmount);
      const totalAmount = newAmount.times(rate);

      return {
        rate: sanitizeNumberInput(rate, getTokenById(quote!)?.decimals),
        amount: sanitizeNumberInput(
          newAmount.toString(),
          getTokenById(base!)?.decimals
        ),
        total: sanitizeNumberInput(
          totalAmount.toString(),
          getTokenById(quote!)?.decimals
        ),
      };
    };

    return {
      buy: data.buy
        .map(({ amount, rate }, i) =>
          _subtractPrevAmount(true, amount, rate, i)
        )
        .filter(({ amount }) => amount !== '0')
        .splice(0, orderBookConfig.buckets.orderBook),
      sell: data.sell
        .map(({ amount, rate }, i) =>
          _subtractPrevAmount(false, amount, rate, i)
        )
        .filter(({ amount }) => amount !== '0')
        .splice(0, orderBookConfig.buckets.orderBook),
      middleRate: orderBookQuery.data?.middleRate || '0',
    };
  }, [
    base,
    getTokenById,
    orderBookQuery.data?.buy,
    orderBookQuery.data?.middleRate,
    orderBookQuery.data?.sell,
    quote,
  ]);

  return { ...orderBookQuery, data: orders };
};
