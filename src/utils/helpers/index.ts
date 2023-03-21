import BigNumber from 'bignumber.js';
import numbro from 'numbro';
import { config } from 'services/web3/config';
import { TradePair } from 'libs/modals/modals/ModalTradeTokenList';
import { FiatSymbol } from 'store/useFiatCurrencyStore';
import { TokenPair } from '@bancor/carbon-sdk';

export const isProduction = window.location.host.includes('bancor.network');

export const uuid = () => {
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const sanitizeNumberInput = (
  input: string,
  precision?: number
): string => {
  const sanitized = input
    .replace(/,/, '.')
    .replace(/[^\d.]/g, '')
    .replace(/\./, 'x')
    .replace(/\./g, '')
    .replace(/x/, '.');
  if (!precision) return sanitized;
  const [integer, decimals] = sanitized.split('.');
  if (decimals) return `${integer}.${decimals.substring(0, precision)}`;
  else return sanitized;
};

export const shortenString = (
  string: string,
  separator = '...',
  toLength = 13
): string => {
  if (string.length <= toLength) {
    return string;
  }
  const startEndLength = Math.floor((toLength - separator.length) / 2);
  const start = string.substring(0, startEndLength);
  const end = string.substring(string.length - startEndLength, string.length);
  return start + separator + end;
};

export const reduceETH = (value: string, address: string) => {
  if (address === config.tokens.ETH)
    return new BigNumber(value).minus(0.01).toString();

  return value;
};

export const getFiatDisplayValue = (
  fiatValue: BigNumber | string | number,
  currentCurrency: FiatSymbol
) => {
  return `${prettifyNumber(fiatValue, {
    usd: ['USD', 'CAD', 'AUD'].includes(currentCurrency),
  })} ${currentCurrency}`;
};

const prettifyNumberAbbreviateFormat: numbro.Format = {
  average: true,
  mantissa: 1,
  optionalMantissa: true,
  lowPrecision: false,
  spaceSeparated: true,
  roundingFunction: (num) => Math.floor(num),
};

const defaultNumbroOptions: numbro.Format = {
  roundingFunction: (num) => Math.floor(num),
  mantissa: 0,
  optionalMantissa: true,
  thousandSeparated: true,
  trimMantissa: true,
};

const getDefaultNumberoOptions = (round = false) => {
  return {
    ...defaultNumbroOptions,
    ...(round && {
      roundingFunction: (num: number) => Math.round(num),
    }),
  };
};

export function prettifyNumber(num: number | string | BigNumber): string;

export function prettifyNumber(
  num: number | string | BigNumber,
  options?: {
    usd?: boolean;
    abbreviate?: boolean;
    highPrecision?: boolean;
    round?: boolean;
  }
): string;

export function prettifyNumber(
  num: number | string | BigNumber,
  options?: {
    usd?: boolean;
    abbreviate?: boolean;
    highPrecision?: boolean;
    round?: boolean;
  }
): string {
  const {
    usd = false,
    abbreviate = false,
    highPrecision = false,
    round = false,
  } = options || {};

  const bigNum = new BigNumber(num);
  if (usd) {
    return handlePrettifyNumberUsd(bigNum, options);
  }

  if (bigNum.lte(0)) return '0';
  if (bigNum.lt(0.000001)) return '< 0.000001';
  if (abbreviate && bigNum.gt(999999))
    return numbro(bigNum).format({
      ...prettifyNumberAbbreviateFormat,
      ...(round && {
        roundingFunction: (num) => Math.round(num),
      }),
    });
  if (!highPrecision) {
    if (bigNum.gte(1000))
      return numbro(bigNum).format(getDefaultNumberoOptions(round));
    if (bigNum.gte(2))
      return `${numbro(bigNum).format({
        ...getDefaultNumberoOptions(round),
        mantissa: 2,
      })}`;
  }
  return `${numbro(bigNum).format({
    ...getDefaultNumberoOptions(round),
    mantissa: 6,
  })}`;
}

const handlePrettifyNumberUsd = (
  num: BigNumber,
  options?: {
    usd?: boolean;
    abbreviate?: boolean;
    highPrecision?: boolean;
    round?: boolean;
  }
) => {
  const {
    abbreviate = false,
    highPrecision = false,
    round = false,
  } = options || {};

  if (num.lte(0)) return '$0.00';
  if (num.lt(0.01)) return '< $0.01';
  if (abbreviate && num.gt(999999))
    return `$${numbro(num).format({
      ...prettifyNumberAbbreviateFormat,
      ...(round && {
        roundingFunction: (num) => Math.round(num),
      }),
    })}`;
  if (!highPrecision) {
    if (num.gt(100))
      return `$${numbro(num).format(getDefaultNumberoOptions(round))}`;
  }
  return `$${numbro(num).format({
    ...getDefaultNumberoOptions(round),
    mantissa: 2,
  })}`;
};

export const wait = async (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const buildPairKey = (pair: TradePair) =>
  [
    pair.baseToken.address.toLowerCase(),
    pair.quoteToken.address.toLowerCase(),
  ].join('-');

export const buildTokenPairKey = (pair: TokenPair) =>
  pair.join('-').toLowerCase();

export const setIntervalUsingTimeout = (
  callback: Function,
  interval: number
): NodeJS.Timeout => {
  let intervalId: NodeJS.Timeout;

  const timeoutCallback = () => {
    callback();
    intervalId = setTimeout(timeoutCallback, interval);
  };

  intervalId = setTimeout(timeoutCallback, interval);
  return intervalId;
};
