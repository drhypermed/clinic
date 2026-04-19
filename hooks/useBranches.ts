/**
 * هوك إدارة الفروع (useBranches)
 *
 * يوفر:
 * - قائمة الفروع المتاحة (branches)
 * - الفرع النشط (activeBranch) ومعرّفه (activeBranchId)
 * - دوال التبديل والإضافة والتعديل والحذف
 *
 * الفرع النشط يُحفظ في localStorage ويظل ثابتاً حتى يغيّره الطبيب يدوياً.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { branchesService, DEFAULT_BRANCH_ID } from '../services/firestore/branches';
import { createBookingSecret } from '../services/firestore/booking-secretary/helpers';
import { ensureBookingConfigUserId } from '../services/firestore/booking-secretary/secretConfig.ensure';
import type { Branch } from '../types';

interface UseBranchesReturn {
    branches: Branch[];
    activeBranchId: string;
    activeBranch: Branch | null;
    loading: boolean;
    setActiveBranchId: (branchId: string) => void;
    addBranch: (branch: Omit<Branch, 'id' | 'createdAt'>) => Promise<void>;
    updateBranch: (branch: Branch) => Promise<void>;
    deleteBranch: (branchId: string) => Promise<void>;
}

export const useBranches = (userId: string | null): UseBranchesReturn => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [activeBranchId, setActiveBranchIdState] = useState<string>(() => {
        if (!userId) return DEFAULT_BRANCH_ID;
        return branchesService.getActiveBranchId(userId);
    });
    const [loading, setLoading] = useState(true);

    // الاشتراك في قائمة الفروع
    useEffect(() => {
        if (!userId) {
            setBranches([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = branchesService.subscribeToBranches(userId, (updated) => {
            setBranches(updated);
            setLoading(false);
        });

        return unsubscribe;
    }, [userId]);

    // مزامنة آخر فرع نشط من Firestore لو الجهاز الحالي مفيهوش قيمة محفوظة (جهاز جديد مثلاً)
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const key = `dh_active_branch_${userId}`;
        const hasLocal = (() => {
            try { return Boolean(localStorage.getItem(key)); } catch { return false; }
        })();
        if (hasLocal) return; // الجهاز يتذكر الفرع — لا نحتاج لجلبه من السيرفر
        branchesService.fetchRemoteActiveBranchId(userId).then((remote) => {
            if (cancelled || !remote) return;
            setActiveBranchIdState((current) => (current === DEFAULT_BRANCH_ID ? remote : current));
            try { localStorage.setItem(key, remote); } catch { /* noop */ }
        });
        return () => { cancelled = true; };
    }, [userId]);

    // تحديث الفرع النشط في localStorage + state (مع تحذير لو فيه بيانات غير محفوظة)
    const setActiveBranchId = useCallback((branchId: string) => {
        if (!userId) return;
        if (branchId === activeBranchId) return;
        const hasDraft = Boolean(localStorage.getItem(`dh_rx_draft_v1:${userId}`));
        if (hasDraft && !window.confirm('يوجد بيانات غير محفوظة في الكشف الحالي. هل تريد تغيير الفرع؟')) return;
        branchesService.setActiveBranchId(userId, branchId);
        setActiveBranchIdState(branchId);
    }, [userId, activeBranchId]);

    // التأكد إن الفرع النشط موجود فعلاً في القائمة
    useEffect(() => {
        if (branches.length === 0) return;
        const exists = branches.some(b => b.id === activeBranchId);
        if (!exists) {
            setActiveBranchId(branches[0].id);
        }
    }, [branches, activeBranchId, setActiveBranchId]);

    const activeBranch = useMemo(
        () => branches.find(b => b.id === activeBranchId) ?? null,
        [branches, activeBranchId]
    );

    const addBranch = useCallback(async (data: Omit<Branch, 'id' | 'createdAt'>) => {
        if (!userId) return;
        const id = `branch_${Date.now()}`;
        // كل فرع جديد يحصل على كود سري مستقل للسكرتيرة
        const secretarySecret = createBookingSecret();

        // إنشاء bookingConfig document فوراً مع branchId عشان السكرتيرة تعرف الفرع
        await ensureBookingConfigUserId(secretarySecret, userId, id);

        const branch: Branch = {
            ...data,
            id,
            secretarySecret,
            createdAt: new Date().toISOString(),
            order: branches.length,
        };
        await branchesService.saveBranch(userId, branch);
    }, [userId, branches.length]);

    const updateBranch = useCallback(async (branch: Branch) => {
        if (!userId) return;
        await branchesService.saveBranch(userId, branch);
    }, [userId]);

    const deleteBranch = useCallback(async (branchId: string) => {
        if (!userId) return;
        await branchesService.deleteBranch(userId, branchId);
        // لو الفرع المحذوف هو النشط، نرجع للفرع الرئيسي
        if (activeBranchId === branchId) {
            setActiveBranchId(DEFAULT_BRANCH_ID);
        }
    }, [userId, activeBranchId, setActiveBranchId]);

    return {
        branches,
        activeBranchId,
        activeBranch,
        loading,
        setActiveBranchId,
        addBranch,
        updateBranch,
        deleteBranch,
    };
};
