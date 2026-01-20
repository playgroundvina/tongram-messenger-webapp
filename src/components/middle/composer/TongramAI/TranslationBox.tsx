import type { FC } from '../../../../lib/teact/teact';
import { memo, useCallback, useEffect, useState } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { SharedSettings } from '../../../../global/types';

import { selectSharedSettings } from '../../../../global/selectors/sharedState';

import useOldLang from '../../../../hooks/useOldLang';
import { AiTranslateText } from '../hooks/useTranslate';

import Button from '../../../ui/Button';
import ButtonList from '../../../ui/ButtonList';
import Loading from '../../../ui/Loading';
import ChooseLanguageModal from './ChooseLanguageModal';

import './TranslationBox.scss';

import TongramAiIcon from '../../../../assets/tongram-ai2.svg';
import Translation from '../../../../assets/translation.svg';
import TranslationBG from '../../../../assets/translation-bg.svg';
import WritingAssistant from '../../../../assets/writing-assistant.svg';

export type TranslateBoxProps = {
  translateValue?: string;
  onSubmit: (text: string) => void;
};

type StateProps = Pick<SharedSettings, 'languages'>;

const TranslationBox: FC<TranslateBoxProps & StateProps> = ({
  languages, translateValue, onSubmit }) => {
  const {
    loadLanguages,
  } = getActions();

  const lang = useOldLang();
  const [activeTab, setActiveTab] = useState(0);
  const [translated, setTranslated] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);
  const [showChooseLanguageModal, setShowChooseLanguageModal] = useState(false);
  const LangSelected = window.localStorage.getItem('preferredLanguage');

  function renderHeader() {
    return (
      <div className="modal-header" dir={lang.isRtl ? 'rtl' : undefined}>
        <div>
          <h3 className="modal-title">
            <img src={TongramAiIcon} alt="Tongram AI" className="tongram-ai-icon" />
            Tongram AI
          </h3>
        </div>
        <div>

          <Button
            className="confirm-dialog-button"
            color="primary"
            isText
            disabled={!translated}
            onClick={() => onSubmit(translated as unknown as string)}
          >
            {lang('Apply')}
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 0,
      title: (
        <div className="tab">
          <span className="icon"><img src={TranslationBG} alt="Translation" /></span>
          <span className="label">{lang('Translation')}</span>
        </div>
      ),
    },
    {
      id: 1,
      title: (
        <div className="tab comingSoon">
          <span className="icon"><img src={WritingAssistant} alt="Writing Assistant" /></span>
          <div className="comingSoonLabel">
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

  const LanguageTrigger = useCallback(() => {
    return (
      <div className="language-select" onClick={() => setShowChooseLanguageModal(true)} role="button" tabIndex={0}>
        <span className="icon"><img src={Translation} alt="Translation" /></span>
        <span className="text">{LangSelected ? JSON.parse(LangSelected).label : lang('Choose language')}</span>
      </div>
    );
  }, [LangSelected, lang]);

  useEffect(() => {
    if (!LangSelected || (!translateValue || translateValue === '')) return;

    const translate = async () => {
      try {
        setTranslateLoading(true);
        const resTranslate = await AiTranslateText(
          translateValue,
          JSON.parse(LangSelected).value,
        );

        setTranslated(resTranslate as string);
      } finally {
        setTranslateLoading(false);
      }
    };

    translate();
  }, [LangSelected, translateValue]);

  return (
    <div className="TranslationBox">
      {renderHeader()}
      <div className="panel">
        <ButtonList
          tabs={tabs}
          activeTab={activeTab}
          onSwitchTab={setActiveTab}
          className="tabs"
        />

        <div className="content">
          {activeTab === 0 ? (
            <div>
              {LanguageTrigger()}
              <div className="text-translate">
                <p className="info-text">
                  {translateLoading ? <Loading /> : (translated !== '' ? translated : '...')}
                </p>
              </div>
            </div>
          ) : (
            <div className="disabled-content">{lang('Coming soon')}</div>
          )}
        </div>
      </div>
      <div>
        <ChooseLanguageModal
          isShow={showChooseLanguageModal}
          onClose={() => setShowChooseLanguageModal(false)}
        />
      </div>
    </div>
  );
};

export default memo(withGlobal<TranslateBoxProps>(
  (global): Complete<StateProps> => {
    const { languages } = selectSharedSettings(global);
    return { languages };
  },
)(TranslationBox));
