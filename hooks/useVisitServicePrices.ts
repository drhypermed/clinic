import { useEffect, useMemo, useState } from 'react';
import { financialDataService } from '../services/financial-data';

type VisitType = 'exam' | 'consultation';

interface UseVisitServicePricesArgs {
  userId?: string;
  bookingSecret?: string;
  visitDate?: string;
  visitType: VisitType;
}

export const useVisitServicePrices = ({
  userId,
  bookingSecret,
  visitType,
}: UseVisitServicePricesArgs) => {
  const [examPrice, setExamPrice] = useState(0);
  const [consultationPrice, setConsultationPrice] = useState(0);

  useEffect(() => {
    const normalizedUserId = String(userId || '').trim();
    const normalizedSecret = String(bookingSecret || '').trim();

    if (!normalizedUserId && !normalizedSecret) {
      setExamPrice(0);
      setConsultationPrice(0);
      return;
    }

    const handleUpdate = (prices: { examinationPrice?: string; consultationPrice?: string }) => {
      setExamPrice(Number(prices.examinationPrice || 0) || 0);
      setConsultationPrice(Number(prices.consultationPrice || 0) || 0);
    };

    if (normalizedSecret) {
      const unsubscribe = financialDataService.subscribeToPricesBySecret(normalizedSecret, handleUpdate);
      return () => unsubscribe();
    }

    const unsubscribe = financialDataService.subscribeToPrices(normalizedUserId, handleUpdate);
    return () => unsubscribe();
  }, [userId, bookingSecret]);

  const servicePrice = useMemo(
    () => (visitType === 'consultation' ? consultationPrice : examPrice),
    [visitType, consultationPrice, examPrice]
  );

  return {
    examPrice,
    consultationPrice,
    servicePrice,
  };
};
