import React from 'react';
import { FaCircleCheck, FaTriangleExclamation, FaFileLines } from 'react-icons/fa6';
import { getLegalPoliciesForAudience } from '../../../app/legal/policies';
import type { LegalAudience, LegalDocumentDefinition } from '../../../app/legal/types';
import {
  hasAcceptedLegalDocumentVersion,
  persistLegalDocumentConsent,
} from '../../../services/legalConsentService';
import { LegalDocumentModal } from './LegalDocumentModal';

interface LegalConsentGateProps {
  audience: LegalAudience;
  onValidityChange?: (isValid: boolean) => void;
}

export const LegalConsentGate: React.FC<LegalConsentGateProps> = ({ audience, onValidityChange }) => {
  const policies = React.useMemo(() => getLegalPoliciesForAudience(audience), [audience]);
  const [acceptedTerms, setAcceptedTerms] = React.useState<boolean>(() =>
    hasAcceptedLegalDocumentVersion(audience, policies.terms)
  );
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState<boolean>(() =>
    hasAcceptedLegalDocumentVersion(audience, policies.privacy)
  );
  const [activeDocument, setActiveDocument] = React.useState<LegalDocumentDefinition | null>(null);

  const isValid = acceptedTerms && acceptedPrivacy;

  React.useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  // ألوان موحّده (أزرق) لكل الـaudiences — الطبيب والجمهور زي بعض.
  // كنا بنميز الجمهور بالأخضر قبل كده، لكن اتوحد التصميم.
  const topBarGradient = 'from-blue-700 to-blue-500';
  const accentText = 'text-blue-700';
  const accentCheckbox = 'accent-blue-600';
  const readBtn =
    'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(37,99,235,0.45)]';

  const handleToggle = (documentDef: LegalDocumentDefinition, checked: boolean) => {
    persistLegalDocumentConsent(audience, documentDef, checked);

    if (documentDef.kind === 'terms') {
      setAcceptedTerms(checked);
      return;
    }

    setAcceptedPrivacy(checked);
  };

  return (
    <>
      <div
        className="relative bg-white rounded-2xl ring-1 ring-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.15)] p-4 space-y-3.5 overflow-hidden"
        dir="rtl"
      >
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${topBarGradient}`} />

        <div className="space-y-1 pt-1">
          <h3 className={`text-sm font-black ${accentText}`}>{policies.cardTitle}</h3>
          <p className="text-slate-700 text-xs font-semibold leading-relaxed">{policies.cardDescription}</p>
        </div>

        <div className="space-y-2.5">
          {[policies.terms, policies.privacy].map((documentDef) => {
            const isChecked = documentDef.kind === 'terms' ? acceptedTerms : acceptedPrivacy;

            return (
              <div
                key={documentDef.kind}
                className="rounded-xl ring-1 ring-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-3 flex flex-col gap-2.5 transition hover:ring-slate-300"
              >
                <div className="flex items-start gap-2.5">
                  <input
                    id={`legal-${audience}-${documentDef.kind}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => handleToggle(documentDef, event.target.checked)}
                    className={`mt-0.5 h-4 w-4 rounded border-slate-400 ${accentCheckbox} cursor-pointer`}
                  />
                  <label
                    htmlFor={`legal-${audience}-${documentDef.kind}`}
                    className="text-slate-900 text-sm font-bold leading-relaxed cursor-pointer"
                  >
                    {documentDef.consentLabel}
                  </label>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    الإصدار {documentDef.version}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveDocument(documentDef)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black text-white bg-gradient-to-b transition-all active:scale-[0.98] ${readBtn}`}
                  >
                    <FaFileLines className="w-3 h-3" />
                    قراءة الوثيقة
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`flex items-start gap-2 rounded-xl ring-1 px-3 py-2 text-xs font-bold leading-relaxed ${
            isValid
              ? 'ring-emerald-300/70 bg-emerald-50/85 text-emerald-800'
              : 'ring-amber-300/70 bg-amber-50/85 text-amber-800'
          }`}
        >
          {isValid ? (
            <FaCircleCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <FaTriangleExclamation className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          )}
          <span>
            {isValid
              ? 'تمت الموافقة على الشروط والسياسات المطلوبة ويمكنك المتابعة.'
              : 'يلزم الموافقة على الشروط وسياسة الخصوصية قبل المتابعة.'}
          </span>
        </div>
      </div>

      <LegalDocumentModal
        isOpen={Boolean(activeDocument)}
        activeDocument={activeDocument}
        onClose={() => setActiveDocument(null)}
      />
    </>
  );
};
