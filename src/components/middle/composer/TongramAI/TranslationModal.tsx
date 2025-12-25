import type { FC } from '../../../../lib/teact/teact';
import { memo, useEffect, useMemo, useState } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { ApiLanguage } from '../../../../api/types';
import type { SharedSettings } from '../../../../global/types';

import { selectSharedSettings } from '../../../../global/selectors/sharedState';

import useFlag from '../../../../hooks/useFlag';
import useOldLang from '../../../../hooks/useOldLang';
import { translateMessageText } from '../hooks/useTranslate';

import Button from '../../../ui/Button';
import DropdownMenu from '../../../ui/DropdownMenu';
import InputText from '../../../ui/InputText';
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import TabList from '../../../ui/TabList';

import './TranslationModal.scss';

import SentArrow from '../../../../assets/sentArrow.svg';
import TongramAiIcon from '../../../../assets/tongramAi.svg';
import Translation from '../../../../assets/translation.svg';
import WritingAssistant from '../../../../assets/writingAssistant.svg';

export type TranslateModalProps = {
  messageText?: string;
  isOpen: boolean;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
  onSubmit: (text: string) => void;
};

type StateProps = Pick<SharedSettings, 'languages'>;

const TranslationModal: FC<TranslateModalProps & StateProps> = ({
  messageText, isOpen, languages, onClose, onCloseAnimationEnd, onSubmit }) => {
  const {
    loadLanguages,
  } = getActions();
  const [isLoading, markIsLoading, unmarkIsLoading] = useFlag();

  const lang = useOldLang();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLang, setSelectedLang] = useState(languages?.[0]?.name || '');
  const [sentValue, setSentValue] = useState(messageText || '');
  const [translateValue, setTranslateValue] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);

  function renderHeader() {
    return (
      <div className="modal-header" dir={lang.isRtl ? 'rtl' : undefined}>
        <h3 className="modal-title">
          <img src={TongramAiIcon} alt="Tongram AI" className="tongram-ai-icon" />
          Tongram AI
        </h3>
      </div>
    );
  }

  const tabs = [
    {
      id: 0,
      title: (
        <div className="tab">
          <span className="icon"><img src={Translation} alt="Translation" /></span>
          <span className="label">{lang('Translation')}</span>
        </div>
      ),
    },
    {
      id: 1,
      title: (
        <div className="tab">
          <span className="icon"><img src={WritingAssistant} alt="Writing Assistant" /></span>
          <div className="comingSoon">
            <span className="label">{lang('Writing Assistant')}</span>
            <span className="badge">{lang('Coming soon')}</span>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!languages?.length) {
      loadLanguages();
    }
  }, [languages]);

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

    return languagesWithVN.map(({ langCode, nativeName, name }) => ({
      value: langCode,
      label: nativeName,
      subLabel: name,
    }));
  }, [languages]);

  const LanguageTrigger = ({ onTrigger, isOpen: triggerIsOpen }: { onTrigger: () => void; isOpen?: boolean }) => (
    <div className={`language-select ${triggerIsOpen ? 'open' : ''}`} onClick={onTrigger} role="button" tabIndex={0}>
      <span className="icon"><img src={Translation} alt="Translation" /></span>
      <span className="text">{selectedLang || lang('Choose language')}</span>
    </div>
  );

  const handleSent = async () => {
    setTranslateLoading(true);
    const resTranslate = await translateMessageText(sentValue, selectedLang);
    setTranslateLoading(false);
    setTranslateValue(resTranslate as unknown as string);
  };
  useEffect(() => {
    if (messageText) {
      setSentValue(messageText || '');
    }
  }, [messageText]);

  return (
    <Modal
      isOpen={isOpen}
      className="TranslationModal"
      header={renderHeader()}
      onClose={onClose}
      onCloseAnimationEnd={onCloseAnimationEnd}
    >
      <div className="panel">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onSwitchTab={setActiveTab}
          className="tabs"
        />

        <div className="content">
          {activeTab === 0 ? (
            <div>
              <DropdownMenu trigger={LanguageTrigger} className="translation-language-dropdown">
                <div className="translation-language-list">
                  {options?.map((l) => (
                    <div
                      key={l.value}
                      className={`translation-language-item ${l.value === selectedLang ? 'active' : ''}`}
                      onClick={() => setSelectedLang(l.subLabel)}
                      role="button"
                      tabIndex={0}
                    >
                      {l.subLabel}
                      {l.subLabel === selectedLang ? <span className="check">  ✓</span> : undefined}
                    </div>
                  ))}
                </div>
              </DropdownMenu>
              <div className="text-translate">
                <p className="info-text">
                  {translateLoading ? <Loading /> : translateValue}
                </p>
              </div>
            </div>
          ) : (
            <div className="disabled-content">{lang('Coming soon')}</div>
          )}
        </div>
      </div>
      <div>
        <div className="MessageTranslation">
          <InputText
            value={sentValue}
            placeholder={lang('Message')}
            onChange={(e) => setSentValue(e.target.value)}
            className="inputSent"
          />
          <div className="sentButton">
            <Button className="btn" onClick={() => handleSent()} disabled={!sentValue}>
              <img src={SentArrow} alt="Sent Arrow Icon" sizes="48px" />
            </Button>
          </div>
        </div>
        <div className="dialog-buttons">
          <Button className="confirm-dialog-button" isText onClick={onClose}>{lang('Cancel')}</Button>
          <Button
            className="confirm-dialog-button"
            color="secondary"
            isText
            disabled={!translateValue}
            onClick={() => onSubmit(translateValue as unknown as string)}
          >
            {lang('Apply')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(withGlobal<TranslateModalProps>(
  (global): Complete<StateProps> => {
    const { languages } = selectSharedSettings(global);
    return { languages };
  },
)(TranslationModal));
