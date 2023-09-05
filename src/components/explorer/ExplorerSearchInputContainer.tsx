import { ExplorerSearchProps } from 'components/explorer/ExplorerSearch';
import { FC, JSX, RefObject } from 'react';
import { cn } from 'utils/helpers';
import { ReactComponent as IconClose } from 'assets/icons/times.svg';

type InputAttributes = JSX.IntrinsicElements['input'];
interface Props
  extends Pick<ExplorerSearchProps, 'setSearch' | 'search'>,
    Omit<InputAttributes, 'type'> {
  containerRef?: RefObject<HTMLDivElement>;
}

export const ExplorerSearchInputContainer: FC<Props> = (props) => {
  const {
    className,
    containerRef,
    children,
    search,
    setSearch,
    ...inputProps
  } = props;
  return (
    <div ref={containerRef} className="flex flex-grow">
      <input
        name="search"
        type="search"
        className={cn(
          'w-full flex-grow bg-transparent outline-none',
          className
        )}
        onChange={(e) => setSearch(e.target.value)}
        {...inputProps}
      />
      {!!search && (
        <button type="reset" aria-label="Clear">
          <IconClose className="w-12" />
        </button>
      )}
      {children}
    </div>
  );
};
