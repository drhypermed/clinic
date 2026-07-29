export interface ActiveVisitServiceScope {
  visitId: string;
  patientFileId?: string;
  appointmentId?: string;
  branchId?: string;
}

const activeScopes = new Map<string, ActiveVisitServiceScope>();

export const setActiveVisitServiceScope = (
  userId: string,
  scope: ActiveVisitServiceScope,
) => {
  const normalizedUserId = String(userId || '').trim();
  const normalizedVisitId = String(scope.visitId || '').trim();
  if (!normalizedUserId || !normalizedVisitId) return;
  activeScopes.set(normalizedUserId, {
    ...scope,
    visitId: normalizedVisitId,
    patientFileId: String(scope.patientFileId || '').trim() || undefined,
    appointmentId: String(scope.appointmentId || '').trim() || undefined,
    branchId: String(scope.branchId || '').trim() || undefined,
  });
};

export const getActiveVisitServiceScope = (
  userId: string,
): ActiveVisitServiceScope | null =>
  activeScopes.get(String(userId || '').trim()) || null;

export const clearActiveVisitServiceScope = (
  userId: string,
  visitId?: string,
) => {
  const normalizedUserId = String(userId || '').trim();
  const current = activeScopes.get(normalizedUserId);
  if (!current) return;
  const normalizedVisitId = String(visitId || '').trim();
  if (normalizedVisitId && current.visitId !== normalizedVisitId) return;
  activeScopes.delete(normalizedUserId);
};
