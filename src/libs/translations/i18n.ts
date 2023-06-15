import {
  initReactI18next,
  LanguageDetector,
  ChainedBackend,
  HttpBackend,
  // LocalStorageBackend,
  i18n,
} from 'libs/translations';
import { APP_ID, APP_VERSION } from 'utils/constants';
import { TRANSLATION_VERSION } from './version';

// TODO: add local storage backend + remove not needed languages
// TODO: add accent letter fonts.
// Remove after gets all languages + actual translations
// TODO: Fix en json - walletConnect.connect1 -> decrease tags 1->0, 2->1
// Notice: only new notification translated at the current language.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish (ES)' },
  { code: 'de', name: 'German (DE)' },
  { code: 'he', name: 'Hebrew (IL)' },
  { code: 'pt-BR', name: 'Portuguese (BR)' },
  { code: 'xx', name: 'Test (XX)' },
];

type SupportedLanguagesCodes = (typeof SUPPORTED_LANGUAGES)[number]['code'];

type LanguageVersionMapping = {
  [key in SupportedLanguagesCodes]: string;
};

i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    react: {
      useSuspense: true,
    },
    returnNull: false,
    fallbackLng: {
      pt: ['pt-BR', 'en'],
      default: ['en'],
    },
    load: 'all',
    debug: import.meta.env.VITE_DEV_MODE,
    detection: {
      lookupLocalStorage: `${APP_ID}-${APP_VERSION}-i18nextLng`,
      lookupQuerystring: '', // disable querystring in url
    },
    backend: {
      backends: [HttpBackend],
      backendOptions: [
        {
          prefix: `${APP_ID}-${APP_VERSION}-`,
          expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 days
          defaultVersion: 'v1',
          versions: SUPPORTED_LANGUAGES.reduce((acc, currLang) => {
            acc[currLang.code] = TRANSLATION_VERSION;
            return acc;
          }, {} as LanguageVersionMapping),
        },
        {
          prefix: `${APP_ID}-${APP_VERSION}-`,
          loadPath: '/locales/{{lng}}/{{ns}}.json',
          requestOptions: {
            cache: 'no-store',
          },
        },
      ],
    },
    saveMissing: true,
  });

i18n.on('missingKey', (_, _1, key) => {
  if (import.meta.env.VITE_DEV_MODE) {
    throw new Error(`Missing key ${key}`);
  }
});

export default i18n;
