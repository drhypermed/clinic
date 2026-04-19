import React from 'react';
import DOMPurify from 'dompurify';
import { PrescriptionHeaderSettings } from '../../types';
import { buildTextStyles, hexToRgba } from './shared/prescriptionStyleUtils';

interface PrescriptionHeaderProps {
  isDataOnlyMode: boolean;
  headerSettings?: PrescriptionHeaderSettings;
}

const DEFAULT_HEADER: PrescriptionHeaderSettings = {
  doctorName: 'اسم الطبيب',
  degrees: ['الشهادة / الدرجة العلمية'],
  specialties: ['التخصص'],
};

const sanitizeHtml = (html: string) => ({ __html: DOMPurify.sanitize(html) });

const renderRichTextLine = ({
  key,
  html,
  text,
  style,
}: {
  key: string;
  html?: string;
  text?: string;
  style: React.CSSProperties;
}) => {
  if (html) {
    return <div key={key} dangerouslySetInnerHTML={sanitizeHtml(html)} style={style} />;
  }
  return <p key={key} style={style}>{text}</p>;
};

export const PrescriptionHeader: React.FC<PrescriptionHeaderProps> = ({
  isDataOnlyMode,
  headerSettings = DEFAULT_HEADER,
}) => {
  const settings = headerSettings;

  const bgColor = settings.backgroundColor || '#ffffff';
  const bgOpacity = settings.backgroundColorOpacity ?? 1;
  const backgroundColorWithOpacity = bgOpacity < 1 ? hexToRgba(bgColor, bgOpacity) : bgColor;

  const borderColor = settings.bottomBorderColor || settings.borderColor || '#7f1d1d';
  const borderOpacity = settings.bottomBorderOpacity ?? 1;
  const borderColorWithOpacity = borderOpacity < 1 ? hexToRgba(borderColor, borderOpacity) : borderColor;

  const doctorNameStyle = {
    margin: 0,
    ...buildTextStyles(settings.doctorNameStyle, {
      fontSize: '18px',
      fontWeight: '900',
      color: '#7f1d1d',
      fontFamily: 'serif',
      lineHeight: '1.2',
    }),
  };

  return (
    <div
      style={{
        position: 'relative',
        paddingTop: '24px',
        paddingBottom: '12px',
        paddingLeft: '30px',
        paddingRight: '30px',
        flexShrink: 0,
        borderBottom: '4px solid',
        borderBottomColor: isDataOnlyMode
          ? 'transparent'
          : (settings.showBottomBorder !== false ? borderColorWithOpacity : 'transparent'),
        backgroundColor: isDataOnlyMode ? 'transparent' : backgroundColorWithOpacity,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        direction: 'rtl',
        minHeight: '110px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {!isDataOnlyMode && settings.headerBackgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${settings.headerBackgroundImage})`,
            backgroundSize: `${settings.headerBgScale ?? 100}%`,
            backgroundPosition: `${settings.headerBgPosX ?? 50}% ${settings.headerBgPosY ?? 50}%`,
            backgroundRepeat: 'no-repeat',
            opacity: settings.headerBackgroundOpacity ?? 1,
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          visibility: isDataOnlyMode ? 'hidden' : 'visible',
          paddingLeft: '0px',
          marginRight: '-15px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {settings.doctorNameHtml ? (
          <div dangerouslySetInnerHTML={sanitizeHtml(settings.doctorNameHtml)} style={doctorNameStyle} />
        ) : (
          <h1 style={doctorNameStyle}>{settings.doctorName}</h1>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {settings.degrees?.map((text, idx) => {
            const html = settings.degreesHtmlLines?.[idx];
            const lineStyle = settings.degreesLineStyles?.[idx] || settings.degreesStyle;
            const defaults = {
              fontSize: idx === 0 ? '11px' : '10px',
              color: idx === 0 ? '#0f172a' : '#475569',
              fontWeight: 'bold',
              lineHeight: '1.4',
            };
            if (!text && !html) return null;
            return renderRichTextLine({
              key: `deg-${idx}`,
              html,
              text,
              style: {
                margin: idx === 0 ? 0 : '2px 0 0 0',
                ...buildTextStyles(lineStyle, defaults),
              },
            });
          })}
        </div>
      </div>

      {!isDataOnlyMode && settings.logoBase64 && (
        <div
          style={{
            position: 'absolute',
            left: `${settings.logoPosX ?? 50}%`,
            top: `${settings.logoPosY ?? 55}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            opacity: settings.logoOpacity ?? 1,
            width: `${settings.logoWidth ?? 80}px`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src={settings.logoBase64}
            alt="Clinic Logo"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      )}

      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          visibility: isDataOnlyMode ? 'hidden' : 'visible',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {settings.specialties?.map((text, idx) => {
            const html = settings.specialtiesHtmlLines?.[idx];
            const lineStyle = settings.specialtiesLineStyles?.[idx] || settings.specialtiesStyle;
            const defaults = {
              fontSize: '11px',
              color: '#334155',
              fontWeight: '800',
              lineHeight: '1.3',
            };
            if (!text && !html) return null;
            return renderRichTextLine({
              key: `spec-${idx}`,
              html,
              text,
              style: {
                margin: idx === 0 ? 0 : '4px 0 0 0',
                whiteSpace: 'nowrap',
                ...buildTextStyles(lineStyle, defaults),
              },
            });
          })}
        </div>
      </div>
    </div>
  );
};
