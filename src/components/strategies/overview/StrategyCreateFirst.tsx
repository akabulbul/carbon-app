import { StrategyBlockCreate } from 'components/strategies/overview/strategyBlock/StrategyBlockCreate';
import { useTranslation } from 'libs/translations';

export const StrategyCreateFirst = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full p-20">
      <StrategyBlockCreate
        title={t('strategy.overview.block.createFirstStrategy')}
        className="w-[270px] gap-[32px] text-center text-36"
      />
    </div>
  );
};
