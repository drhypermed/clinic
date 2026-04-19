module.exports = ({ getDb }) => {
  const toNumberOrNull = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const toNonNegativeInt = (value) => {
    const parsed = toNumberOrNull(value);
    if (parsed == null || parsed < 0) return 0;
    return Math.floor(parsed);
  };

  const toNonNegativeNumber = (value) => {
    const parsed = toNumberOrNull(value);
    if (parsed == null || parsed < 0) return 0;
    return parsed;
  };

  const toNormalizedRating = (value) => {
    const parsed = toNumberOrNull(value);
    if (parsed == null) return null;
    const rounded = Math.round(parsed);
    if (!Number.isFinite(rounded)) return null;
    return Math.min(5, Math.max(1, rounded));
  };

  const readRatingFromSnapshot = (snap) => {
    if (!snap || !snap.exists) return null;
    const data = snap.data();
    if (!data || typeof data !== 'object') return null;
    return toNormalizedRating(data.rating);
  };

  const onDoctorAdReviewWrite = async (event) => {
    const doctorId = String(event?.params?.doctorId || '').trim();
    if (!doctorId) return;

    const beforeRating = readRatingFromSnapshot(event?.data?.before);
    const afterRating = readRatingFromSnapshot(event?.data?.after);

    if (beforeRating === afterRating) return;

    const deltaCount = (afterRating == null ? 0 : 1) - (beforeRating == null ? 0 : 1);
    const deltaTotal = (afterRating ?? 0) - (beforeRating ?? 0);

    if (deltaCount === 0 && deltaTotal === 0) return;

    const db = getDb();
    const nowIso = new Date().toISOString();
    const doctorAdRef = db.collection('doctorAds').doc(doctorId);

    await db.runTransaction(async (transaction) => {
      const doctorAdSnap = await transaction.get(doctorAdRef);
      if (!doctorAdSnap.exists) return;

      const data = doctorAdSnap.data() || {};
      const currentCount = toNonNegativeInt(data.ratingCount);
      const currentTotal = toNonNegativeNumber(data.ratingTotal);

      let nextCount = currentCount + deltaCount;
      let nextTotal = currentTotal + deltaTotal;

      if (nextCount < 0) nextCount = 0;
      if (nextTotal < 0) nextTotal = 0;
      if (nextCount === 0) nextTotal = 0;

      const nextAverage = nextCount > 0 ? Number((nextTotal / nextCount).toFixed(2)) : null;

      transaction.update(doctorAdRef, {
        ratingCount: nextCount,
        ratingTotal: nextTotal,
        ratingAverage: nextAverage,
        updatedAt: nowIso,
      });
    });
  };

  return { onDoctorAdReviewWrite };
};
