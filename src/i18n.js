import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as bridge from './assets/js/Bridge';
import zh from './locales/zh.json';
import en from './locales/en.json';


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'zh',
        lng: bridge.getLocale(),
        debug: true,
        resources: {
            en: { translation: en },
            zh: { translation: zh }
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;