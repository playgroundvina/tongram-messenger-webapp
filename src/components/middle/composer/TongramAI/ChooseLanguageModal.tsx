import type { FC } from '@teact';
import { memo, useEffect, useMemo, useState } from '@teact';
import { getActions, withGlobal } from '../../../../global';

import type { ApiLanguage } from '../../../../api/types';
import type { SharedSettings } from '../../../../global/types';
import type { AccountSettings } from '../../../../types';
import type { ItemPickerOption } from '../../../common/pickers/ItemPicker';

import { selectIsCurrentUserPremium } from '../../../../global/selectors';
import { selectSharedSettings } from '../../../../global/selectors/sharedState';

import useFlag from '../../../../hooks/useFlag';
import useLastCallback from '../../../../hooks/useLastCallback';
import useOldLang from '../../../../hooks/useOldLang';

import ItemPicker from '../../../common/pickers/ItemPicker';
import Button from '../../../ui/Button';
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';

import './ChooseLanguageModal.scss';

type OwnProps = {
  isShow?: boolean;
  onClose: () => void;
};

type StateProps = {
  isCurrentUserPremium: boolean;
} & Pick<AccountSettings, 'canTranslate' | 'canTranslateChats' | 'doNotTranslate'>
& Pick<SharedSettings, 'language' | 'languages'>;

const ChooseLanguageModal: FC<OwnProps & StateProps> = ({
  isShow,
  languages,
  language,
  onClose,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  const {
    loadLanguages,
  } = getActions();
  const lang = useOldLang();
  const [isLoading] = useFlag();
  const LangSelected = window.localStorage.getItem('preferredLanguage');

  useEffect(() => {
    if (!languages?.length) {
      loadLanguages();
    }
  }, [languages]);

  const handleChange = useLastCallback((langCode: string) => {
    setSelectedLanguage(langCode);
  });

  const handleSubmit = () => {
    const langSelected = options?.find((languageItem) => languageItem.value === selectedLanguage);
    if (langSelected) {
      window.localStorage.setItem('preferredLanguage', JSON.stringify(langSelected));
    }
    onClose();
  };

  const options = useMemo(() => {
    if (!languages) return undefined;
    const vnLanguage: ApiLanguage = {
      name: 'Tiếng Việt',
      nativeName: 'Tiếng Việt',
      langCode: 'vn',
      pluralCode: 'vn',
      stringsCount: 2227,
      translatedCount: 2227,
      translationsUrl: 'https://translations.telegram.org/vn/',
    };
    const languagesWithVN = [...languages, vnLanguage];
    const currentLangCode = (LangSelected
      ? JSON.parse(LangSelected)
      : { langCode: 'en' }).langCode || 'en';
    const shortLangCode = currentLangCode.substr(0, 2);

    return languagesWithVN.map(({ langCode, nativeName, name }) => ({
      value: langCode,
      label: nativeName,
      subLabel: name,
      isLoading: langCode === selectedLanguage && isLoading,
    } satisfies ItemPickerOption)).sort((a) => {
      return currentLangCode && (a.value === currentLangCode || a.value === shortLangCode) ? -1 : 0;
    });
  }, [LangSelected, isLoading, languages, selectedLanguage]);

  useEffect(() => {
    if (LangSelected) {
      setSelectedLanguage(JSON.parse(LangSelected).value);
    }
  }, [LangSelected]);

  return (
    <Modal
      isOpen={isShow}
      onClose={onClose}
      className="ChooseLanguageModal"
    >
      <div className="settings-content settings-language custom-scroll">
        <div className="settings-item settings-item-picker">
          <h4 className="settings-item-header">
            {lang('Choose Language')}
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
          <div className="btnChoose">
            <Button
              className="confirm-dialog-button"
              isText
              onClick={() => handleSubmit()}
            >
              {lang('OK')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
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
)(ChooseLanguageModal));
