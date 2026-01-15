import type { FC, TeactNode } from '../../../lib/teact/teact';
import type React from '../../../lib/teact/teact';
import { memo, useMemo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type {
  ApiAvailableReaction, ApiMessage, ApiMessageOutgoingStatus, ApiThreadInfo,
} from '../../../api/types';
import { LANGUAGE_SCRIPT_MAP, SCRIPT_REGEX } from '../../../global/types/languageCode';

import { selectTranslate } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import { formatDateTimeToString, formatPastTimeShort, formatTime } from '../../../util/dates/dateFormat';
import { formatStarsAsIcon } from '../../../util/localization/format';
import { formatIntegerCompact } from '../../../util/textFormat';
import renderText from '../../common/helpers/renderText';

import useFlag from '../../../hooks/useFlag';
import useLang from '../../../hooks/useLang';
import useOldLang from '../../../hooks/useOldLang';

import AnimatedCounter from '../../common/AnimatedCounter';
import Icon from '../../common/icons/Icon';
import MessageOutgoingStatus from '../../common/MessageOutgoingStatus';

import './MessageMeta.scss';

type StateProps = {
  translate: string;
};

type OwnProps = {
  message: ApiMessage;
  withReactionOffset?: boolean;
  outgoingStatus?: ApiMessageOutgoingStatus;
  signature?: string;
  showTranslateText?: boolean;
  availableReactions?: ApiAvailableReaction[];
  noReplies?: boolean;
  repliesThreadInfo?: ApiThreadInfo;
  isTranslated?: boolean;
  isPinned?: boolean;
  withFullDate?: boolean;
  effectEmoji?: string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTranslate: (e: ApiMessage) => void;
  onTranslationClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onEffectClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  renderQuickReactionButton?: () => TeactNode | undefined;
  onOpenThread: NoneToVoidFunction;
  paidMessageStars?: number;
};

const MessageMeta: FC<OwnProps & StateProps> = ({
  message,
  outgoingStatus,
  signature,
  showTranslateText,
  withReactionOffset,
  repliesThreadInfo,
  renderQuickReactionButton,
  noReplies,
  isTranslated,
  isPinned,
  withFullDate,
  effectEmoji,
  onClick,
  onTranslate,
  onTranslationClick,
  onEffectClick,
  onOpenThread,
  paidMessageStars,
  translate,
}) => {
  const { showNotification } = getActions();

  const [isActivated, markActivated] = useFlag();

  const oldLang = useOldLang();
  const lang = useLang();

  function handleImportedClick(e: React.MouseEvent) {
    e.stopPropagation();

    showNotification({
      message: {
        key: 'ImportedInfo',
      },
    });
  }

  function handleOpenThread(e: React.MouseEvent) {
    e.stopPropagation();
    onOpenThread();
  }

  const dateTitle = useMemo(() => {
    if (!isActivated) return undefined;
    const createDateTime = formatDateTimeToString(message.date * 1000, oldLang.code, undefined, oldLang.timeFormat);
    const editDateTime = message.isEdited
      && formatDateTimeToString(message.editDate! * 1000, oldLang.code, undefined, oldLang.timeFormat);
    const forwardedDateTime = message.forwardInfo
      && formatDateTimeToString(
        (message.forwardInfo.savedDate || message.forwardInfo.date) * 1000,
        oldLang.code,
        undefined,
        oldLang.timeFormat,
      );

    let text = createDateTime;
    if (editDateTime) {
      text += '\n';
      text += lang('MessageTooltipEditedDate', { date: editDateTime });
    }
    if (forwardedDateTime) {
      text += '\n';
      text += lang('MessageTooltipForwardedDate', { date: forwardedDateTime });
    }

    return text;
    // We need to listen to timeformat change
    // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
  }, [isActivated, oldLang, message, oldLang.timeFormat]);

  const viewsTitle = useMemo(() => {
    if (!message.viewsCount) return undefined;
    let text = lang('MessageTooltipViews', {
      count: lang.number(message.viewsCount),
    }, { pluralValue: message.viewsCount });
    if (message.forwardsCount) {
      text += '\n';
      text += lang('MessageTooltipForwards', {
        count: lang.number(message.forwardsCount),
      }, { pluralValue: message.forwardsCount });
    }

    return text;
  }, [lang, message.forwardsCount, message.viewsCount]);

  const repliesTitle = useMemo(() => {
    const count = repliesThreadInfo?.messagesCount;
    if (!count) return undefined;
    return lang('MessageTooltipReplies', { count }, { pluralValue: count });
  }, [lang, repliesThreadInfo]);

  const date = useMemo(() => {
    const time = formatTime(oldLang, message.date * 1000);
    if (!withFullDate) {
      return time;
    }

    return formatPastTimeShort(oldLang, (message.forwardInfo?.date || message.date) * 1000, true);
  }, [oldLang, message.date, message.forwardInfo?.date, withFullDate]);

  const fullClassName = buildClassName(
    outgoingStatus ? 'MessageMeta' : 'MessageMeta not-outgoing',
    withReactionOffset && 'reactions-offset',
    message.forwardInfo?.isImported && 'is-imported',
  );

  function isMessageInLanguage(
    messageText: string,
    langCode: string,
  ): boolean {
    if (!messageText?.trim()) return false;

    const script = LANGUAGE_SCRIPT_MAP[langCode];
    if (!script) return false;

    const text = messageText.trim();
    const expectedRegex = SCRIPT_REGEX[script];
    if (script === 'latin' || script === 'latin-extended') {
      return expectedRegex.test(text);
    }

    for (const [key, regex] of Object.entries(SCRIPT_REGEX)) {
      if (key !== script && regex.test(text)) {
        return false;
      }
    }
    return expectedRegex.test(text);
  }

  return (
    <span
      className={fullClassName}
      dir={lang.isRtl ? 'rtl' : 'ltr'}
      onClick={outgoingStatus ? onClick : undefined}
      data-ignore-on-paste
    >
      {effectEmoji && (
        <span className="message-effect-icon" onClick={onEffectClick}>
          {renderText(effectEmoji)}
        </span>
      )}
      {isTranslated && (
        <Icon name="language" className="message-translated" onClick={onTranslationClick} />
      )}
      {Boolean(message.viewsCount) && (
        <>
          <span className="message-views" title={viewsTitle}>
            {formatIntegerCompact(lang, message.viewsCount)}
          </span>
          <Icon name="channelviews" />
        </>
      )}
      {!noReplies && Boolean(repliesThreadInfo?.messagesCount) && (
        <span onClick={handleOpenThread} className="message-replies-wrapper" title={repliesTitle}>
          <span className="message-replies">
            <AnimatedCounter text={formatIntegerCompact(lang, repliesThreadInfo.messagesCount)} />
          </span>
          <Icon name="reply-filled" />
        </span>
      )}
      {isPinned && (
        <Icon name="pinned-message" className="message-pinned" />
      )}
      {signature && (
        <span className="message-signature">{renderText(signature)}</span>
      )}
      {Boolean(paidMessageStars) && (
        <span className="message-price">
          {
            formatStarsAsIcon(lang, paidMessageStars, {
              asFont: true,
              className: 'message-price-star-icon',
              containerClassName: 'message-price-stars-container',
            })
          }
        </span>
      )}
      {outgoingStatus ? (
        <span className="message-time" title={dateTitle} onMouseEnter={markActivated}>
          {message.forwardInfo?.isImported && (
            <>
              <span className="message-imported" onClick={handleImportedClick}>
                {formatDateTimeToString(message.forwardInfo.date * 1000, lang.code, true)}
              </span>
              <span className="message-imported" onClick={handleImportedClick}>{lang('MessageMetaImported')}</span>
            </>
          )}
          {message.isEdited && `${lang('MessageMetaEdited')} `}
          {message.isVideoProcessingPending && `${lang('MessageMetaApproximate')} `}
          {date}
        </span>
      ) :
        (
          <div className="message-btn-translate">
            <div className="message-time" title={dateTitle} onMouseEnter={markActivated} onClick={onClick}>
              {message.forwardInfo?.isImported && (
                <>
                  <span className="message-imported" onClick={handleImportedClick}>
                    {formatDateTimeToString(message.forwardInfo.date * 1000, lang.code, true)}
                  </span>
                  <span className="message-imported" onClick={handleImportedClick}>{lang('MessageMetaImported')}</span>
                </>
              )}
              {message.isEdited && `${lang('MessageMetaEdited')} `}
              {message.isVideoProcessingPending && `${lang('MessageMetaApproximate')} `}
              <span>
                {date}
              </span>
            </div>
            {
              translate === 'true' && message.content.text?.entities?.length === 0
              && !isMessageInLanguage(message.content.text?.text || '', lang.languageInfo.langCode) && (
                <button className="btn-translate" onClick={() => onTranslate(message)}>
                  {showTranslateText ? 'Hide Translation' : 'Translate'}
                </button>
              )
            }
          </div>
        )}
      {outgoingStatus && (
        <MessageOutgoingStatus status={outgoingStatus} />
      )}
      {renderQuickReactionButton && renderQuickReactionButton()}
    </span>
  );
};

export default memo(
  withGlobal<OwnProps>((global): Complete<StateProps> => {
    return {
      translate: selectTranslate(global),
    };
  })(MessageMeta),
);
