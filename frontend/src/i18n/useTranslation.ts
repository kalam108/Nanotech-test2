import { useApp } from '../context/AppContext';
import { TranslationKey, getTranslation } from './translations';
import { LanguageCode } from '../types';

export function useTranslation() {
  const { language, setLanguage, addToast } = useApp();

  const t = (key: TranslationKey, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  const toggleLanguage = () => {
    const nextLang: LanguageCode = language === 'EN' ? 'NP' : 'EN';
    setLanguage(nextLang);
    if (addToast) {
      addToast(
        'info',
        nextLang === 'NP' ? 'भाषा नेपालीमा परिवर्तन भयो (Nepali)' : 'Language switched to English'
      );
    }
  };

  const changeLanguage = (lang: LanguageCode) => {
    if (lang !== language) {
      setLanguage(lang);
      if (addToast) {
        addToast(
          'info',
          lang === 'NP' ? 'भाषा नेपालीमा परिवर्तन भयो (Nepali)' : 'Language switched to English'
        );
      }
    }
  };

  return {
    t,
    language,
    isNepali: language === 'NP',
    isEnglish: language === 'EN',
    setLanguage: changeLanguage,
    toggleLanguage,
  };
}

export default useTranslation;
