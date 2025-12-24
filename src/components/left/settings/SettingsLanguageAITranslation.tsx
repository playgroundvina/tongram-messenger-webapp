import type { FC } from '../../../lib/teact/teact';
import {
  memo, useEffect, useMemo, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { SharedSettings } from '../../../global/types';
import type { AccountSettings } from '../../../types';

import { selectIsCurrentUserPremium } from '../../../global/selectors';
import { selectSharedSettings } from '../../../global/selectors/sharedState';

import useFlag from '../../../hooks/useFlag';
import useHistoryBack from '../../../hooks/useHistoryBack';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';

import ItemPicker, { type ItemPickerOption } from '../../common/pickers/ItemPicker';
import Loading from '../../ui/Loading';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  isCurrentUserPremium: boolean;
} & Pick<AccountSettings, 'canTranslate' | 'canTranslateChats' | 'doNotTranslate'>
& Pick<SharedSettings, 'language' | 'languages'>;

const SettingsLanguageAITranslation: FC<OwnProps & StateProps> = ({
  isActive,
  languages,
  language,
  onReset,
}) => {
  const {
    loadLanguages,
  } = getActions();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [isLoading, markIsLoading, unmarkIsLoading] = useFlag();

  const lang = useOldLang();
  const LangSelected = window.localStorage.getItem('preferredLanguage');

  useEffect(() => {
    if (!languages?.length) {
      loadLanguages();
    }
  }, [languages]);

  const handleChange = useLastCallback((langCode: string) => {
    setSelectedLanguage(langCode);
    markIsLoading();

    const langSelected = languages?.find((languageItem) => languageItem.langCode === langCode);
    if (langSelected) {
      window.localStorage.setItem('preferredLanguage', JSON.stringify(langSelected));
      unmarkIsLoading();
      return;
    }
  });

  const options = useMemo(() => {
    if (!languages) return undefined;
    const currentLangCode = (LangSelected
      ? JSON.parse(LangSelected)
      : { langCode: 'en' }).langCode || 'en';
    const shortLangCode = currentLangCode.substr(0, 2);

    if (currentLangCode !== selectedLanguage) {
      setSelectedLanguage(currentLangCode);
    }

    return languages.map(({ langCode, nativeName, name }) => ({
      value: langCode,
      label: nativeName,
      subLabel: name,
      isLoading: langCode === selectedLanguage && isLoading,
    } satisfies ItemPickerOption)).sort((a) => {
      return currentLangCode && (a.value === currentLangCode || a.value === shortLangCode) ? -1 : 0;
    });
  }, [isLoading, languages, selectedLanguage, LangSelected]);

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  return (
    <div className="settings-content settings-language custom-scroll">
      <div className="settings-item settings-item-picker">
        <h4 className="settings-item-header">
          {lang('Localization.InterfaceLanguage')}
        </h4>
        {options ? (
          <ItemPicker
            items={options}
            selectedValue={selectedLanguage}
            forceRenderAllItems
            onSelectedValueChange={handleChange}
            itemInputType="radio"
            className="settings-picker"
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const {
      canTranslate, canTranslateChats, doNotTranslate,
    } = global.settings.byKey;
    const { language, languages } = selectSharedSettings(global);

    const isCurrentUserPremium = selectIsCurrentUserPremium(global);

    return {
      isCurrentUserPremium,
      languages,
      language,
      canTranslate,
      canTranslateChats,
      doNotTranslate,
    };
  },
)(SettingsLanguageAITranslation));
