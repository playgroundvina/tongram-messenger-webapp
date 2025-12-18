import './TranslationButton.scss';

import TongramAiIcon from '../../../../assets/tongramAi.svg';

type OwnProps = {
  onShow: () => void;
};

const TranslationButton = ({ onShow }: OwnProps) => {
  return (
    <div className="Translation">
      <button className="btn" onClick={() => onShow()}>
        <img src={TongramAiIcon} alt="Translation Icon" sizes="48px" />
      </button>
    </div>
  );
};

export default TranslationButton;
