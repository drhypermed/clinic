import { buildClinicalAiReportHtml } from './reportHtmlTemplate';
import type { OpenClinicalAiReportWindowInput } from './types';

export const openClinicalAiReportWindow = (input: OpenClinicalAiReportWindowInput): void => {
  if (typeof document === 'undefined') return;

  const overlayId = 'clinical-ai-report-overlay';
  const existingOverlay = document.getElementById(overlayId);
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '99999';
  overlay.style.background = 'rgba(2, 6, 23, 0.75)';
  overlay.style.backdropFilter = 'blur(2px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '12px';

  const frameWrapper = document.createElement('div');
  frameWrapper.style.width = 'min(1040px, calc(100vw - 24px))';
  frameWrapper.style.height = 'calc(100vh - 24px)';
  frameWrapper.style.background = '#ffffff';
  frameWrapper.style.borderRadius = '12px';
  frameWrapper.style.overflow = 'hidden';
  frameWrapper.style.border = '1px solid rgba(203, 213, 225, 0.95)';
  frameWrapper.style.boxShadow = '0 24px 64px rgba(2, 6, 23, 0.55)';

  const iframe = document.createElement('iframe');
  iframe.title = 'clinical-ai-report-frame';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.srcdoc = buildClinicalAiReportHtml(input);

  frameWrapper.appendChild(iframe);
  overlay.appendChild(frameWrapper);
  document.body.appendChild(overlay);

  const syncLayout = () => {
    const isMobile = window.matchMedia('(max-width: 760px)').matches;

    if (isMobile) {
      overlay.style.padding = '0';
      frameWrapper.style.width = '100vw';
      frameWrapper.style.height = '100vh';
      frameWrapper.style.borderRadius = '0';
      frameWrapper.style.border = '0';
      return;
    }

    overlay.style.padding = '12px';
    frameWrapper.style.width = 'min(1040px, calc(100vw - 24px))';
    frameWrapper.style.height = 'calc(100vh - 24px)';
    frameWrapper.style.borderRadius = '12px';
    frameWrapper.style.border = '1px solid rgba(203, 213, 225, 0.95)';
  };

  const closeOverlay = () => {
    window.removeEventListener('message', onMessage);
    window.removeEventListener('keydown', onEscape);
    window.removeEventListener('resize', syncLayout);
    overlay.remove();
  };

  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return;
    if (!event.data || typeof event.data !== 'object') return;

    const data = event.data as { type?: string };
    if (data.type === 'close-clinical-ai-report') {
      closeOverlay();
    }
  };

  const onEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeOverlay();
    }
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  });

  window.addEventListener('message', onMessage);
  window.addEventListener('keydown', onEscape);
  window.addEventListener('resize', syncLayout);
  syncLayout();
};
