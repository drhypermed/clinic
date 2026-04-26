import React from 'react';
import DOMPurify from 'dompurify';
import { PrescriptionFooterSettings } from '../../types';
import { useSystemRequestLineSettings } from '../../hooks/useSystemRequestLineSettings';
import { DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS } from '../../services/systemRequestLineService';
import { buildTextStyles, hexToRgba } from './shared/prescriptionStyleUtils';
import { SocialIconRenderer } from '../common/SocialIconRenderer';
interface PrescriptionFooterProps {
    isDataOnlyMode: boolean; // وضع بيانات فقط (إخفاء المحتوى المرئي مع إبقاء الحجز المكاني)
    footerSize: string;      // حجم الفوتر (يتحكم في التباعد الرأسي)
    /** حجم خط الفوتر الأساسي بالـ px من إعدادات المستخدم (افتراضي 9). الأحجام الأخرى تتدرج معه. */
    footerPx?: number;
    /** لون خط الفوتر */
    footerColor?: string;
    /** نوع خط الفوتر */
    footerFontFamily?: string;
    footerSettings?: PrescriptionFooterSettings;
}
const DEFAULT_FOOTER: PrescriptionFooterSettings = {
    address: 'عنوان العيادة',
    workingHours: 'مواعيد العمل',
    consultationPeriod: 'مدة صلاحية الاستشارة',
    phoneNumber: 'رقم الهاتف',
    phoneLabel: 'للحجز والاستفسار (اتصال)',
    showPhoneIcon: true,
    whatsappNumber: 'رقم الواتساب',
    whatsappLabel: 'للحجز والاستفسار (واتساب)',
    showWhatsappIcon: true,
    socialMediaHandle: 'اسم الحساب / الصفحة',
    showSocialMedia: true
};
export const PrescriptionFooter: React.FC<PrescriptionFooterProps> = ({
    isDataOnlyMode,
    footerSize,
    footerPx,
    footerColor,
    footerFontFamily,
    footerSettings = DEFAULT_FOOTER
}) => {
    const basePx = footerPx ?? 9;
    const titlePx = basePx + 0.5;
    const linkPx = basePx + 1;
    const footerOverrides = {
        ...(footerColor ? { color: footerColor } : {}),
        ...(footerFontFamily ? { fontFamily: footerFontFamily } : {}),
    };
    const settings = footerSettings;
    const { settings: systemRequestSettings } = useSystemRequestLineSettings();
    const activeContacts = (systemRequestSettings.contacts || []).filter((item) => item.enabled !== false && (item.value || item.label || item.url));
    const bgColor = settings.backgroundColor || '#f8fafc';
    const bgOpacity = settings.backgroundColorOpacity ?? 1;
    const backgroundColorWithOpacity = bgOpacity < 1 ? hexToRgba(bgColor, bgOpacity) : bgColor;
    const borderColor = settings.topBorderColor || '#991b1b';
    const borderOpacity = settings.topBorderOpacity ?? 1;
    const borderColorWithOpacity = borderOpacity < 1 ? hexToRgba(borderColor, borderOpacity) : borderColor;
    const hasContent = (text?: string | null, html?: string | null): boolean => {
        if (html) {
            const textContent = html.replace(/<[^>]*>/g, '').trim();
            return textContent.length > 0;
        }
        if (text) {
            return text.trim().length > 0;
        }
        return false;
    };
    const renderHtmlOrText = (text?: string, html?: string, prefix?: string) => {
        if (html) {
            return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
        }
        return <span>{prefix ? `${prefix}${text || ''}` : (text || '')}</span>;
    };

    const renderCenteredLine = (content: React.ReactNode, style: React.CSSProperties) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={style}>{content}</div>
        </div>
    );
    return (
        <div
            style={{
                position: 'relative',
                padding: '4px 8px 12px 8px',
                flexShrink: 0,
                borderTop: (settings.showTopBorder !== false)
                    ? (isDataOnlyMode ? '4px solid transparent' : `4px solid ${borderColorWithOpacity}`)
                    : 'none',
                backgroundColor: isDataOnlyMode ? 'transparent' : backgroundColorWithOpacity,
                width: '100%',
                boxSizing: 'border-box',
                opacity: isDataOnlyMode ? 0 : 1,
                pointerEvents: isDataOnlyMode ? 'none' : 'auto',
                direction: 'rtl',
                overflow: 'hidden',
                ...footerOverrides,
            }}
        >
            {!isDataOnlyMode && settings.footerBackgroundImage && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${settings.footerBackgroundImage})`,
                        backgroundSize: `${settings.footerBgScale ?? 100}%`,
                        backgroundPosition: `${settings.footerBgPosX ?? 50}% ${settings.footerBgPosY ?? 50}%`,
                        backgroundRepeat: 'no-repeat',
                        opacity: settings.footerBgOpacity !== undefined ? settings.footerBgOpacity : 1,
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />
            )}
            {!isDataOnlyMode && settings.logoBase64 && (
                <img
                    src={settings.logoBase64}
                    alt="Footer Logo"
                    style={{
                        position: 'absolute',
                        top: `${settings.logoPosY ?? 50}%`,
                        [settings.logoPosX && settings.logoPosX > 50 ? 'right' : 'left']: `${settings.logoPosX && settings.logoPosX > 50 ? (100 - settings.logoPosX) : settings.logoPosX}%`,
                        width: `${settings.logoWidth ?? 80}px`,
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        maxWidth: '200px',
                        opacity: settings.logoOpacity ?? 1
                    }}
                />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
                {hasContent(settings.address, settings.addressHtml) && (
                    <div style={buildTextStyles(settings.addressStyle, {
                        fontSize: `${titlePx}px`,
                        color: '#1e293b',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif',
                        fontStyle: 'normal'
                    })}>
                        {renderHtmlOrText(settings.address, settings.addressHtml, 'عنوان العيادة: ')}
                    </div>
                )}
                {hasContent(settings.workingHours, settings.workingHoursHtml) && (
                    renderCenteredLine(
                        renderHtmlOrText(settings.workingHours, settings.workingHoursHtml, 'مواعيد العمل: '),
                        buildTextStyles(settings.workingHoursStyle, {
                            fontSize: `${titlePx}px`,
                            color: '#991b1b',
                            fontWeight: 'bold',
                            fontFamily: 'sans-serif',
                            fontStyle: 'normal'
                        })
                    )
                )}
                {hasContent(settings.consultationPeriod, settings.consultationPeriodHtml) && (
                    renderCenteredLine(
                        renderHtmlOrText(settings.consultationPeriod, settings.consultationPeriodHtml),
                        buildTextStyles(settings.consultationPeriodStyle, {
                            fontSize: `${titlePx}px`,
                            color: '#991b1b',
                            fontWeight: 'bold',
                            fontFamily: 'sans-serif',
                            fontStyle: 'normal'
                        })
                    )
                )}
                {(hasContent(settings.phoneNumber, settings.phoneNumberHtml) || hasContent(settings.phoneLabel, settings.phoneLabelHtml) || hasContent(settings.whatsappNumber, settings.whatsappNumberHtml) || hasContent(settings.whatsappLabel, settings.whatsappLabelHtml) || (settings.showSocialMedia && hasContent(settings.socialMediaHandle, settings.socialMediaHtml))) && (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px', paddingTop: '2px' }}>
                        {(hasContent(settings.phoneNumber, settings.phoneNumberHtml) || hasContent(settings.phoneLabel, settings.phoneLabelHtml) || hasContent(settings.whatsappNumber, settings.whatsappNumberHtml) || hasContent(settings.whatsappLabel, settings.whatsappLabelHtml)) && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                                {(hasContent(settings.phoneNumber, settings.phoneNumberHtml) || hasContent(settings.phoneLabel, settings.phoneLabelHtml)) && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}>
                                        {hasContent(settings.phoneLabel, settings.phoneLabelHtml) && (
                                            <span style={buildTextStyles(settings.phoneLabelStyle, {
                                                fontSize: `${basePx}px`,
                                                color: '#1e293b',
                                                fontWeight: 'bold',
                                                fontFamily: 'sans-serif',
                                                fontStyle: 'normal'
                                            })}>
                                                {settings.phoneLabelHtml ? (
                                                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.phoneLabelHtml) }} />
                                                ) : (
                                                    <span>{settings.phoneLabel || 'للحجز والاستفسار (اتصال):'}</span>
                                                )}
                                            </span>
                                        )}
                                        {hasContent(settings.phoneNumber, settings.phoneNumberHtml) && (
                                            <span dir="ltr" style={buildTextStyles(settings.phoneStyle, {
                                                fontSize: `${basePx}px`,
                                                color: '#b91c1c',
                                                fontWeight: '900',
                                                fontFamily: 'sans-serif',
                                                fontStyle: 'normal'
                                            })}>
                                                {settings.phoneNumberHtml ? (
                                                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.phoneNumberHtml) }} />
                                                ) : (
                                                    settings.phoneNumber
                                                )}
                                            </span>
                                        )}
                                        {settings.showPhoneIcon !== false && hasContent(settings.phoneNumber, settings.phoneNumberHtml) && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                style={{
                                                    width: `${settings.phoneIconStyle?.size || 10}px`,
                                                    height: `${settings.phoneIconStyle?.size || 10}px`,
                                                    color: settings.phoneIconStyle?.color || '#b91c1c',
                                                    transform: `translate(${settings.phoneIconStyle?.xOffset || 0}px, ${settings.phoneIconStyle?.yOffset || 0}px)`
                                                }}
                                            >
                                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                )}
                                {(hasContent(settings.whatsappNumber, settings.whatsappNumberHtml) || hasContent(settings.whatsappLabel, settings.whatsappLabelHtml)) && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}>
                                        {hasContent(settings.whatsappLabel, settings.whatsappLabelHtml) && (
                                            <span style={buildTextStyles(settings.whatsappLabelStyle, {
                                                fontSize: `${basePx}px`,
                                                color: '#1e293b',
                                                fontWeight: 'bold',
                                                fontFamily: 'sans-serif',
                                                fontStyle: 'normal'
                                            })}>
                                                {settings.whatsappLabelHtml ? (
                                                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.whatsappLabelHtml) }} />
                                                ) : (
                                                    <span>{settings.whatsappLabel || 'للحجز والاستفسار (واتساب):'}</span>
                                                )}
                                            </span>
                                        )}
                                        {hasContent(settings.whatsappNumber, settings.whatsappNumberHtml) && (
                                            <span dir="ltr" style={buildTextStyles(settings.whatsappStyle, {
                                                fontSize: `${basePx}px`,
                                                color: '#15803d',
                                                fontWeight: '900',
                                                fontFamily: 'sans-serif',
                                                fontStyle: 'normal'
                                            })}>
                                                {settings.whatsappNumberHtml ? (
                                                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.whatsappNumberHtml) }} />
                                                ) : (
                                                    settings.whatsappNumber
                                                )}
                                            </span>
                                        )}
                                        {settings.showWhatsappIcon !== false && hasContent(settings.whatsappNumber, settings.whatsappNumberHtml) && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{
                                                    width: `${settings.whatsappIconStyle?.size || 10}px`,
                                                    height: `${settings.whatsappIconStyle?.size || 10}px`,
                                                    color: settings.whatsappIconStyle?.color || '#16a34a',
                                                    transform: `translate(${settings.whatsappIconStyle?.xOffset || 0}px, ${settings.whatsappIconStyle?.yOffset || 0}px)`
                                                }}
                                                fill="currentColor"
                                                viewBox="0 0 448 512"
                                            >
                                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.9 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                            </svg>
                                        )}
                                    </span>
                                )}
                            </div>
                        )}
                        {settings.showSocialMedia && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '2px',
                                width: 'fit-content',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                flexWrap: 'wrap'
                            }}>
                                {(hasContent(settings.socialMediaLabel, settings.socialMediaLabelHtml)) && (
                                    <span style={buildTextStyles(settings.socialMediaLabelStyle, {
                                        fontSize: `${linkPx}px`,
                                        color: '#000000ff',
                                        fontWeight: '900',
                                        fontFamily: 'sans-serif',
                                        fontStyle: 'normal'
                                    })}>
                                        {settings.socialMediaLabelHtml ? (
                                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.socialMediaLabelHtml) }} />
                                        ) : (
                                            <span>{settings.socialMediaLabel || 'لمتابعة الفيديوهات الطبية الخاصة بنا :'}</span>
                                        )}
                                    </span>
                                )}
                                {(settings.showFacebookIcon !== false ||
                                    settings.showInstagramIcon !== false ||
                                    settings.showYouTubeIcon !== false ||
                                    settings.showTikTokIcon !== false) && (
                                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                            {settings.showFacebookIcon !== false && (
                                                <svg
                                                    style={{
                                                        width: `${settings.facebookIconStyle?.size || 12}px`,
                                                        height: `${settings.facebookIconStyle?.size || 12}px`,
                                                        color: settings.facebookIconStyle?.color || '#1877F2',
                                                        transform: `translate(${settings.facebookIconStyle?.xOffset || 0}px, ${settings.facebookIconStyle?.yOffset || 0}px)`
                                                    }}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            )}
                                            {settings.showInstagramIcon !== false && (
                                                <svg
                                                    style={{
                                                        width: `${settings.instagramIconStyle?.size || 12}px`,
                                                        height: `${settings.instagramIconStyle?.size || 12}px`,
                                                        color: settings.instagramIconStyle?.color || '#E1306C',
                                                        transform: `translate(${settings.instagramIconStyle?.xOffset || 0}px, ${settings.instagramIconStyle?.yOffset || 0}px)`
                                                    }}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            )}
                                            {settings.showYouTubeIcon !== false && (
                                                <svg
                                                    style={{
                                                        width: `${settings.youtubeIconStyle?.size || 12}px`,
                                                        height: `${settings.youtubeIconStyle?.size || 12}px`,
                                                        color: settings.youtubeIconStyle?.color || '#FF0000',
                                                        transform: `translate(${settings.youtubeIconStyle?.xOffset || 0}px, ${settings.youtubeIconStyle?.yOffset || 0}px)`
                                                    }}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            )}
                                            {settings.showTikTokIcon !== false && (
                                                <svg
                                                    style={{
                                                        width: `${settings.tiktokIconStyle?.size || 12}px`,
                                                        height: `${settings.tiktokIconStyle?.size || 12}px`,
                                                        color: settings.tiktokIconStyle?.color || '#000000',
                                                        transform: `translate(${settings.tiktokIconStyle?.xOffset || 0}px, ${settings.tiktokIconStyle?.yOffset || 0}px)`
                                                    }}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                {hasContent(settings.socialMediaHandle, settings.socialMediaHtml) && (
                                    <span style={buildTextStyles(settings.socialStyle, {
                                        fontSize: `${linkPx}px`,
                                        color: '#000000ff',
                                        fontWeight: '900',
                                        fontFamily: 'sans-serif',
                                        fontStyle: 'normal'
                                    })} dir="ltr">
                                        {settings.socialMediaHtml ? (
                                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.socialMediaHtml) }} />
                                        ) : (
                                            settings.socialMediaHandle
                                        )}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {systemRequestSettings.showLine && (
                    <div
                        style={{
                            marginTop: '8px',
                            paddingTop: '6px',
                            borderTop: '1px solid #94a3b8',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '6px',
                            width: '100%',
                            fontSize: `${systemRequestSettings.lineStyle?.fontSize || 10}px`,
                            color: systemRequestSettings.lineStyle?.textColor || '#1e293b',
                            fontWeight: systemRequestSettings.lineStyle?.fontWeight || '800',
                            fontFamily: systemRequestSettings.lineStyle?.fontFamily || 'sans-serif',
                        }}
                    >
                        <span>{systemRequestSettings.message || DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS.message}</span>
                        {activeContacts.map((contact, index) => (
                            <React.Fragment key={contact.id}>
                                {contact.url ? (
                                    <a
                                        href={contact.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: contact.color || '#334155',
                                            textDecoration: 'none',
                                            fontWeight: '900',
                                        }}
                                        aria-label={contact.label}
                                    >
                                        {systemRequestSettings.showIcons && contact.showIcon !== false && (
                                        <SocialIconRenderer icon={contact.icon} color={contact.color || '#334155'} />
                                    )}
                                        <span dir="ltr">{contact.value || contact.label}</span>
                                    </a>
                                ) : (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: contact.color || '#334155',
                                            fontWeight: '900',
                                        }}
                                    >
                                        {systemRequestSettings.showIcons && contact.showIcon !== false && (
                                        <SocialIconRenderer icon={contact.icon} color={contact.color || '#334155'} />
                                    )}
                                        <span dir="ltr">{contact.value || contact.label}</span>
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

