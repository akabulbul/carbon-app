import { CarbonEvents, GTMData, SendEventFn } from './types';
import { convertCase } from 'utils/helpers';
import { generalEvents } from './generalEvents';
import { walletEvents } from './walletEvents';
import { navigationEvents } from './navigationEvents';
import { strategyEvents } from './strategyEvents';
import { strategyEditEvents } from './strategyEditEvents';
import { tradeEvents } from './tradeEvents';
import { transactionConfirmationEvents } from './transactionConfirmationEvents';
import { tokenConfirmationEvents } from './tokenConfirmationEvents';

declare global {
  interface Window {
    dataLayer: GTMData[];
    OneTrust: any;
  }
}

const sendGTM = (data: GTMData) => {
  if (window.dataLayer) {
    window.dataLayer.push(data);
  }
  console.log(window.dataLayer, '-=-=-=-=-=- window.dataLayer -=-=-=-=-=-');
};

export const sendGTMEvent: SendEventFn = (type, event, data) => {
  const snakeCaseEvent = convertCase(event, true);
  const dataObj = data ? data : {};

  switch (type) {
    case 'general': {
      return sendGTM({
        event: 'PV',
        user_properties: {},
        event_properties: {},
        page: dataObj,
        wallet: {},
      });
    }
    case 'wallet': {
      return sendGTM({
        event: `CE ${snakeCaseEvent}`,
        user_properties: dataObj,
        event_properties: {},
        wallet: dataObj,
      });
    }
    default:
      return sendGTM({
        event: `CE ${snakeCaseEvent}`,
        event_properties: dataObj,
        user_properties: {},
        wallet: {},
      });
  }
};

export const carbonEvents: CarbonEvents = {
  general: generalEvents,
  wallet: walletEvents,
  navigation: navigationEvents,
  strategy: strategyEvents,
  strategyEdit: strategyEditEvents,
  trade: tradeEvents,
  transactionConfirmation: transactionConfirmationEvents,
  tokenConfirmation: tokenConfirmationEvents,
};
