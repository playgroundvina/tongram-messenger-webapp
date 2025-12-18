import { useState } from '../../../../lib/teact/teact';

import useOldLang from '../../../../hooks/useOldLang';

import Button from '../../../ui/Button';
import DropdownMenu from '../../../ui/DropdownMenu';
import InputText from '../../../ui/InputText';
import Modal from '../../../ui/Modal';
import TabList from '../../../ui/TabList';

import './TranslationModal.scss';

import SentArrow from '../../../../assets/sentArrow.svg';
import TongramAiIcon from '../../../../assets/tongramAi.svg';
import Translation from '../../../../assets/translation.svg';
import WritingAssistant from '../../../../assets/writingAssistant.svg';

export type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
};

const TranlationModal = ({ isOpen, onClose, onCloseAnimationEnd }: OwnProps) => {
  const lang = useOldLang();

  const [activeTab, setActiveTab] = useState(0);
  // eslint-disable-next-line @stylistic/max-len
  const languages = ['English', 'Tiếng Việt', 'Español', 'Русский', 'Français', 'Deutsch', 'Italiano', 'Português', '中文', '日本語', '한국어'];
  const [selectedLang, setSelectedLang] = useState(languages[0]);

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

  const LanguageTrigger = ({ onTrigger, isOpen: triggerIsOpen }: { onTrigger: () => void; isOpen?: boolean }) => (
    <div className={`language-select ${triggerIsOpen ? 'open' : ''}`} onClick={onTrigger} role="button" tabIndex={0}>
      <span className="icon"><img src={Translation} alt="Translation" /></span>
      <span className="text">{selectedLang || lang('Choose language')}</span>
      <span className="arrow">⌄</span>
    </div>
  );

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
            <DropdownMenu trigger={LanguageTrigger} className="translation-language-dropdown">
              <div className="translation-language-list">
                {languages.map((l) => (
                  <div
                    key={l}
                    className={`translation-language-item ${l === selectedLang ? 'active' : ''}`}
                    onClick={() => setSelectedLang(l)}
                    role="button"
                    tabIndex={0}
                  >
                    {l}
                    {l === selectedLang ? <span className="check">  ✓</span> : undefined}
                  </div>
                ))}
              </div>
            </DropdownMenu>
          ) : (
            <div className="disabled-content">{lang('Coming soon')}</div>
          )}
        </div>
      </div>
      <div>
        <div className="MessageTranslation">
          <InputText placeholder={lang('Message')} className="inputSent" />
          <div className="sentButton">
            <button className="btn">
              <img src={SentArrow} alt="Sent Arrow Icon" sizes="48px" />
            </button>
          </div>
        </div>
        <div className="dialog-buttons-column">
          <Button className="confirm-dialog-button" isText onClick={onClose}>{lang('Cancel')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default TranlationModal;
