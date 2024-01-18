import { useMatchRoute } from '@tanstack/react-router';
import { useSearch, useNavigate } from 'libs/routing';
import { useTokens } from 'hooks/useTokens';
import { TradeSearch } from 'libs/routing/routes/trade';

export const useTradeTokens = () => {
  const navigate = useNavigate();
  const match = useMatchRoute();
  const isTradePage = match({
    to: '/trade',
    fuzzy: true,
  });
  const { getTokenById } = useTokens();
  const search: TradeSearch = useSearch({ strict: false });

  const baseToken = getTokenById(search.base);
  const quoteToken = getTokenById(search.quote);

  const goToPair = (base: string, quote: string, replace?: boolean) =>
    navigate({ to: '/trade', search: { base, quote }, replace });

  const isTokenError =
    (search.base && !baseToken) || (search.base && !quoteToken);

  return {
    isTradePage,
    baseToken,
    quoteToken,
    isTokenError,
    goToPair,
  };
};
