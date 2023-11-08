import { ChangeEvent, FC, useId } from 'react';
import { carbonEvents } from 'services/events';
import { Token } from 'libs/tokens';
import { useFiatCurrency } from 'hooks/useFiatCurrency';
import { Tooltip } from 'components/common/tooltip/Tooltip';
import { MarketPriceIndication } from 'components/strategies/marketPriceIndication';
import { sanitizeNumberInput } from 'utils/helpers';
import { decimalNumberValidationRegex } from 'utils/inputsValidations';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { MarketPricePercentage } from 'components/strategies/marketPriceIndication/useMarketIndication';
import { WarningMessageWithIcon } from 'components/common/WarningMessageWithIcon';

type InputRangeProps = {
  min: string;
  setMin: (value: string) => void;
  max: string;
  setMax: (value: string) => void;
  quote: Token;
  base: Token;
  buy?: boolean;
  error?: string;
  warnings?: string[];
  setRangeError: (error: string) => void;
  marketPricePercentages: MarketPricePercentage;
};

export const InputRange: FC<InputRangeProps> = ({
  min,
  setMin,
  max,
  setMax,
  quote,
  base,
  error,
  setRangeError,
  buy = false,
  marketPricePercentages,
  warnings,
}) => {
  const inputMinId = useId();
  const inputMaxId = useId();
  const errorMinMax = 'Maximum price must be higher than the minimum price';
  const errorAboveZero = 'Price must be greater than 0';
  const showWarning = !error && warnings?.length;

  const handleChangeMin = (e: ChangeEvent<HTMLInputElement>) => {
    const minValue = Number(e.target.value);
    setMin(sanitizeNumberInput(e.target.value));
    if (!!max && (minValue <= 0 || minValue >= +max)) {
      const message = minValue <= 0 ? errorAboveZero : errorMinMax;
      carbonEvents.strategy.strategyErrorShow({
        buy,
        message,
      });
      setRangeError(message);
    } else {
      setRangeError('');
    }
  };

  const handleChangeMax = (e: ChangeEvent<HTMLInputElement>) => {
    const maxValue = Number(e.target.value);
    setMax(sanitizeNumberInput(e.target.value));
    if (!!min && (+min <= 0 || +min >= maxValue)) {
      const message = +min <= 0 ? errorAboveZero : errorMinMax;
      carbonEvents.strategy.strategyErrorShow({
        buy,
        message: message,
      });
      setRangeError(message);
    } else {
      setRangeError('');
    }
  };

  const { getFiatAsString } = useFiatCurrency(quote);

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div
          className={`
            bg-body w-full cursor-text rounded-r-4 rounded-l-16 border border-black p-16
            focus-within:border-white/50 
            ${error ? '!border-red/50' : ''}
            ${showWarning ? '!border-warning-400' : ''}
          `}
          onClick={() => document.getElementById(inputMinId)?.focus()}
        >
          <Tooltip
            sendEventOnMount={{ buy }}
            element={`The lowest price to ${buy ? 'buy' : 'sell'} ${
              base.symbol
            } at.`}
          >
            <div className="mb-5 text-12 text-white/60">Min</div>
          </Tooltip>
          <input
            id={inputMinId}
            type="text"
            pattern={decimalNumberValidationRegex}
            inputMode="decimal"
            value={min}
            aria-label="Minimum price"
            placeholder="Enter Price"
            className={`
              mb-5 w-full text-ellipsis bg-transparent text-18 font-weight-500 focus:outline-none
              ${error ? 'text-red' : ''}
            `}
            onChange={handleChangeMin}
            onFocus={(e) => e.target.select()}
            data-testid="input-range-min"
          />
          <p className="flex flex-wrap items-center gap-4">
            <span className="break-all font-mono text-12 text-white/60">
              {getFiatAsString(min)}
            </span>
            <MarketPriceIndication
              marketPricePercentage={marketPricePercentages.min}
              isRange
            />
          </p>
        </div>
        <div
          className={`
            bg-body w-full cursor-text rounded-r-16 rounded-l-4 border border-black p-16
            focus-within:border-white/50
            ${error ? '!border-red/50' : ''}
            ${showWarning ? '!border-warning-400' : ''}
          `}
          onClick={() => document.getElementById(inputMaxId)?.focus()}
        >
          <Tooltip
            sendEventOnMount={{ buy }}
            element={`The highest price to ${buy ? 'buy' : 'sell'} ${
              base.symbol
            } at.`}
          >
            <div className="mb-5 text-12 text-white/60">Max</div>
          </Tooltip>
          <input
            id={inputMaxId}
            type="text"
            pattern={decimalNumberValidationRegex}
            inputMode="decimal"
            value={max}
            aria-label="Maximum price"
            placeholder="Enter Price"
            className={`
              mb-5 w-full text-ellipsis bg-transparent text-18 font-weight-500 focus:outline-none
              ${error ? 'text-red' : ''}
            `}
            onChange={handleChangeMax}
            onFocus={(e) => e.target.select()}
            data-testid="input-range-max"
          />
          <div className="flex flex-wrap items-center gap-4">
            <p className="break-all font-mono text-12 text-white/60">
              {getFiatAsString(max)}
            </p>
            <MarketPriceIndication
              marketPricePercentage={marketPricePercentages.max}
              isRange
            />
          </div>
        </div>
      </div>
      {error ? (
        <output
          htmlFor={`${inputMinId} ${inputMaxId}`}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-10 font-mono text-12 text-red"
        >
          <IconWarning className="h-12 w-12" />
          <span className="flex-1">{error}</span>
        </output>
      ) : (
        warnings?.map((warning, i) => (
          <WarningMessageWithIcon key={i} message={warning} />
        ))
      )}
    </>
  );
};
