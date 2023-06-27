import { ModalWallet } from 'libs/modals/modals/WalletModal/ModalWallet';
import {
  ModalTokenList,
  ModalTokenListData,
} from 'libs/modals/modals/ModalTokenList';
import { TModals } from 'libs/modals/modals.types';
import {
  ModalConfirm,
  ModalCreateConfirmData,
} from 'libs/modals/modals/ModalConfirm/ModalConfirm';
import {
  ModalImportToken,
  ModalImportTokenData,
} from 'libs/modals/modals/ModalImportToken';
import { ModalNotifications } from 'libs/modals/modals/ModalNotifications';
import {
  ModalTradeTokenList,
  ModalTradeTokenListData,
} from 'libs/modals/modals/ModalTradeTokenList';
import {
  ModalTradeSettings,
  ModalTradeSettingsData,
} from 'libs/modals/modals/ModalTradeSettings';

import {
  ModalTradeRouting,
  ModalTradeRoutingData,
} from 'libs/modals/modals/ModalTradeRouting/ModalTradeRouting';
import {
  ModalConfirmStrategy,
  ModalConfirmStrategyData,
} from './ModalConfirmStrategy/ModalConfirmStrategy';
import { ModalBurgerMenu } from './ModalBurgerMenu';
import { ModalRestrictedCountry } from 'libs/modals/modals/ModalRestrictedCountry';
import {
  ModalGenericInfo,
  ModalGenericInfoData,
} from 'libs/modals/modals/ModalGenericInfo';
import {
  ModalCreateStratExpertMode,
  ModalCreateStratExpertModeData,
} from 'libs/modals/modals/ModalCreateStratExpertMode';
import { ModalSheetTest } from 'libs/modals/modals/ModalSheetTest';

// Step 1: Add modal key and data type to schema
export interface ModalSchema {
  wallet: undefined;
  tokenLists: ModalTokenListData;
  tradeTokenList: ModalTradeTokenListData;
  txConfirm: ModalCreateConfirmData;
  importToken: ModalImportTokenData;
  notifications: undefined;
  tradeSettings: ModalTradeSettingsData;
  tradeRouting: ModalTradeRoutingData;
  confirmStrategy: ModalConfirmStrategyData;
  burgerMenu: undefined;
  restrictedCountry: undefined;
  genericInfo: ModalGenericInfoData;
  createStratExpertMode: ModalCreateStratExpertModeData;
  sheetTest: undefined;
}

// Step 2: Create component in modals/modals folder

// Step 3: Add modal component here
export const MODAL_COMPONENTS: TModals = {
  wallet: (props) => ModalWallet(props),
  tokenLists: (props) => ModalTokenList(props),
  txConfirm: (props) => ModalConfirm(props),
  importToken: (props) => ModalImportToken(props),
  notifications: (props) => ModalNotifications(props),
  tradeTokenList: (props) => ModalTradeTokenList(props),
  tradeSettings: (props) => ModalTradeSettings(props),
  tradeRouting: (props) => ModalTradeRouting(props),
  confirmStrategy: (props) => ModalConfirmStrategy(props),
  burgerMenu: (props) => ModalBurgerMenu(props),
  restrictedCountry: (props) => ModalRestrictedCountry(props),
  genericInfo: (props) => ModalGenericInfo(props),
  createStratExpertMode: (props) => ModalCreateStratExpertMode(props),
  sheetTest: (props) => ModalSheetTest(props),
};
