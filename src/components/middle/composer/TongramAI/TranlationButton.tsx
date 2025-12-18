import './TranlationButton.scss';

import TongramAiIcon from '../../../../assets/tongramAi.svg';

type OwnProps = {
  onShow: () => void;
};

const TranlationButton = ({ onShow }: OwnProps) => {
  return (
    <div className="Tranlation">
      <button className="btn" onClick={() => onShow()}>
        <img src={TongramAiIcon} alt="Translation Icon" sizes="48px" />
      </button>
    </div>
  );
};

export default TranlationButton;
