import { describe, expect, it } from 'vitest';
import { USER_GUIDE_ALL_TOPICS } from '../../../components/landing/user-guide/userGuideData';

const topicHeadings = (topicId: string) => {
  const topic = USER_GUIDE_ALL_TOPICS.find((item) => item.id === topicId);
  if (!topic) throw new Error(`Missing guide topic: ${topicId}`);
  return topic.sections.map((section) => section.heading).filter(Boolean);
};

describe('visit services user guide', () => {
  it('places each service-fee explanation under its intended topic', () => {
    expect(topicHeadings('prescription')).toContain('🧾 إضافة خدمة/رسوم أثناء الكشف');
    expect(topicHeadings('records')).toContain('هل رسوم الزيارة بتظهر كسجل طبي؟');
    expect(topicHeadings('patientFiles')).toContain('خدمات أضيفت من الكشف أو السكرتارية');
    expect(topicHeadings('financialReports')).toContain('🧾 الخدمات والرسوم في التقارير');
    expect(topicHeadings('secretary')).toContain('🧾 إضافة خدمة/رسوم من كارت الموعد');

    expect(topicHeadings('appointments')).not.toContain('خدمات أضيفت من الكشف أو السكرتارية');
    expect(topicHeadings('medicalAssistant')).not.toContain('🧾 الخدمات والرسوم في التقارير');
  });
});
