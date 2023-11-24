import { useEffect, useMemo, useState } from 'react';
import { useOrder } from './useOrder';
import { useCreateStrategyQuery } from 'libs/queries';
import { useModal } from 'hooks/useModal';
import { ModalTokenListData } from 'libs/modals/modals/ModalTokenList';
import { useApproval } from 'hooks/useApproval';
import { PathNames, useNavigate, useSearch } from 'libs/routing';
import { Token } from 'libs/tokens';
import { config } from 'services/web3/config';
import { useGetTokenBalance, useQueryClient } from 'libs/queries';
import { useWeb3 } from 'libs/web3';
import { useNotifications } from 'hooks/useNotifications';
import { useDuplicateStrategy } from './useDuplicateStrategy';
import { carbonEvents } from 'services/events';
import { useStrategyEventData } from './useStrategyEventData';
import { useTokens } from 'hooks/useTokens';
import { pairsToExchangeMapping } from 'components/tradingviewChart/utils';
import { StrategyCreateSearch } from 'components/strategies/create/types';
import {
  handleStrategyDirection,
  handleStrategySettings,
  createStrategyAction,
  checkErrors,
} from 'components/strategies/create/utils';
import { checkIfOrdersOverlap } from '../utils';
import { useMarketIndication } from 'components/strategies/marketPriceIndication/useMarketIndication';

const spenderAddress = config.carbon.carbonController;

export type UseStrategyCreateReturn = ReturnType<typeof useCreateStrategy>;

export const useCreateStrategy = () => {
  const { templateStrategy } = useDuplicateStrategy();
  const cache = useQueryClient();
  const navigate = useNavigate();
  const { user, provider } = useWeb3();
  const { openModal } = useModal();
  const [base, setBase] = useState<Token | undefined>(templateStrategy?.base);
  const [quote, setQuote] = useState<Token | undefined>(
    templateStrategy?.quote
  );
  const [showGraph, setShowGraph] = useState(false);
  const { dispatchNotification } = useNotifications();

  const token0BalanceQuery = useGetTokenBalance(base);
  const token1BalanceQuery = useGetTokenBalance(quote);
  const order1 = useOrder(templateStrategy?.order1);
  const order0 = useOrder(templateStrategy?.order0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { marketPricePercentage: buyMarketPricePercentage } =
    useMarketIndication({
      base,
      quote,
      order: order0,
      buy: true,
    });

  const { marketPricePercentage: sellMarketPricePercentage } =
    useMarketIndication({
      base,
      quote,
      order: order1,
    });
  const isOrdersOverlap = useMemo(() => {
    return checkIfOrdersOverlap(order0, order1);
  }, [order0, order1]);

  const mutation = useCreateStrategyQuery();

  const search: StrategyCreateSearch = useSearch({ strict: false });
  const [selectedStrategySettings, setSelectedStrategySettings] = useState<
    | {
        to: string;
        search: StrategyCreateSearch;
      }
    | undefined
  >();

  const approvalTokens = useMemo(() => {
    const arr = [];

    if (base && +order1.budget > 0) {
      arr.push({
        ...base,
        spender: spenderAddress,
        amount: order1.budget,
      });
    }
    if (quote && +order0.budget > 0) {
      arr.push({
        ...quote,
        spender: spenderAddress,
        amount: order0.budget,
      });
    }

    return arr;
  }, [base, quote, order0.budget, order1.budget]);

  const approval = useApproval(approvalTokens);
  const strategyEventData = useStrategyEventData({
    base,
    quote,
    order0,
    order1,
  });

  const createStrategy = async () => {
    const sourceCorrect = checkErrors(order0, order1, token1BalanceQuery.data);
    const targetCorrect = checkErrors(order1, order0, token0BalanceQuery.data);

    if (!user) {
      return openModal('wallet', undefined);
    }

    const onConfirm = () =>
      createStrategyAction({
        base,
        quote,
        user,
        mutation,
        order0,
        order1,
        dispatchNotification,
        cache,
        navigate,
        strategyEventData: {
          ...strategyEventData,
          buyMarketPricePercentage,
          sellMarketPricePercentage,
        },
        setIsProcessing,
      });

    if (sourceCorrect && targetCorrect) {
      if (!+order0.budget && !+order1.budget) {
        return openModal('genericInfo', {
          title: 'Empty Strategy Warning',
          text: 'You are about to create a strategy with no associated budget. It will be inactive until you deposit funds.',
          variant: 'warning',
          onConfirm,
        });
      }

      if (approval.approvalRequired) {
        return openModal('txConfirm', {
          approvalTokens,
          onConfirm,
          buttonLabel: 'Create Strategy',
          eventData: {
            ...strategyEventData,
            productType: 'strategy',
            approvalTokens: approval.tokens,
            buyToken: base,
            sellToken: quote,
            blockchainNetwork: provider?.network?.name || '',
          },
          context: 'createStrategy',
        });
      }

      await onConfirm();
    }
  };

  const handleChangeTokensEvents = (isSource = false, token: Token) => {
    if (isSource) {
      !base
        ? carbonEvents.strategy.newStrategyBaseTokenSelect({
            token,
          })
        : carbonEvents.strategy.strategyBaseTokenChange({
            token,
          });
    } else {
      !quote
        ? carbonEvents.strategy.newStrategyQuoteTokenSelect({
            token,
          })
        : carbonEvents.strategy.strategyQuoteTokenChange({
            token,
          });
    }
  };

  const openTokenListModal = (isSource?: boolean) => {
    const onClick = (token: Token) => {
      let b: string | undefined;
      let q: string | undefined;
      handleChangeTokensEvents(isSource, token);

      switch (isSource) {
        case true: {
          b = token.address;
          q = quote?.address;
          break;
        }
        default: {
          b = base?.address;
          q = token.address;
        }
      }

      navigate({
        to: PathNames.createStrategy,
        search: (search) => ({ ...search, base: b, quote: q }),
        replace: true,
      });
      order0.resetFields();
      order1.resetFields();
    };

    const data: ModalTokenListData = {
      onClick,
      excludedTokens: [isSource ? quote?.address ?? '' : base?.address ?? ''],
      isBaseToken: isSource,
    };
    openModal('tokenLists', data);
  };

  const isCTAdisabled = useMemo(() => {
    if (!user) {
      return false;
    }

    const isOrder0Valid = order0.isRange
      ? +order0.min > 0 && +order0.max > 0 && +order0.min < +order0.max
      : +order0.price >= 0 && order0.price !== '';

    const isOrder1Valid = order1.isRange
      ? +order1.min > 0 && +order1.max > 0 && +order1.min < +order1.max
      : +order1.price >= 0 && order1.price !== '';

    return (
      approval.isLoading ||
      approval.isError ||
      mutation.isLoading ||
      !isOrder0Valid ||
      !isOrder1Valid ||
      isProcessing
    );
  }, [
    approval.isError,
    approval.isLoading,
    isProcessing,
    mutation.isLoading,
    order0.isRange,
    order0.max,
    order0.min,
    order0.price,
    order1.isRange,
    order1.max,
    order1.min,
    order1.price,
    user,
  ]);

  const {
    base: baseAddress,
    quote: quoteAddress,
    strategySettings = templateStrategy?.strategySettings,
    strategyDirection = templateStrategy?.strategyDirection,
    strategyType = templateStrategy?.strategyType,
  } = search;
  const { getTokenById } = useTokens();

  useEffect(() => {
    setSelectedStrategySettings(undefined);
  }, [baseAddress, quoteAddress]);

  useEffect(() => {
    if (!baseAddress && !quoteAddress) {
      return;
    }
    setBase(getTokenById(baseAddress || ''));
    setQuote(getTokenById(quoteAddress || ''));

    switch (strategyType) {
      case 'disposable': {
        order0.resetFields();
        order1.resetFields();
        handleStrategyDirection(
          strategyDirection,
          strategySettings,
          order0,
          order1
        );
        break;
      }
      case 'recurring': {
        order0.resetFields();
        order1.resetFields();
        handleStrategySettings(strategySettings, [
          order0.setIsRange,
          order1.setIsRange,
        ]);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseAddress,
    getTokenById,
    quoteAddress,
    setBase,
    setQuote,
    strategyDirection,
    strategySettings,
    strategyType,
  ]);

  const showTokenSelection =
    (!strategyType || !strategySettings) && !templateStrategy;
  const showTypeMenu =
    !(!base || !quote) &&
    (!strategyType || !strategySettings) &&
    !templateStrategy;
  const showOrders = (!!base && !!quote && !showTypeMenu) || !!templateStrategy;

  useEffect(() => {
    if (!showOrders) {
      return setShowGraph(false);
    }
    const hasMapping =
      !!pairsToExchangeMapping[`${base?.symbol}${quote?.symbol}`];
    if (hasMapping && showOrders) {
      setShowGraph(true);
    }
    if (!base || !quote) {
      setShowGraph(false);
    }
  }, [base, quote, setShowGraph, showOrders]);

  return {
    base,
    setBase,
    quote,
    setQuote,
    order0,
    order1,
    isAwaiting: mutation.isLoading,
    createStrategy,
    openTokenListModal,
    showOrders,
    isCTAdisabled,
    token0BalanceQuery,
    token1BalanceQuery,
    isDuplicate: !!templateStrategy,
    showGraph,
    setShowGraph,
    showTokenSelection,
    strategyType,
    strategySettings,
    strategyDirection,
    showTypeMenu,
    selectedStrategySettings,
    setSelectedStrategySettings,
    isProcessing,
    isOrdersOverlap,
  };
};
