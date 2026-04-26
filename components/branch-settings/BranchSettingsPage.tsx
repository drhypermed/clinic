/**
 * صفحة إعدادات الفروع (BranchSettingsPage)
 *
 * تتيح للطبيب:
 * 1. اختيار الفرع النشط.
 * 2. إضافة / تعديل / حذف فروع العيادة.
 *
 * التصميم مطابق لصفحة "كشف جديد" (نفس الألوان والستايل).
 */

import React, { useState } from 'react';
import type { Branch } from '../../types';
import { DEFAULT_BRANCH_ID } from '../../services/firestore/branches';

interface BranchSettingsPageProps {
    branches: Branch[];
    activeBranchId: string;
    loading?: boolean;
    onSetActiveBranch: (branchId: string) => void;
    onAddBranch: (data: Omit<Branch, 'id' | 'createdAt'>) => Promise<void>;
    onUpdateBranch: (branch: Branch) => Promise<void>;
    onDeleteBranch: (branchId: string) => Promise<void>;
    onBack: () => void;
}

const BRANCH_COLORS = [
    'from-warning-500 to-warning-600',
    'from-brand-500 to-brand-600',
    'from-success-500 to-brand-600',
    'from-slate-500 to-slate-600',
    'from-danger-500 to-slate-600',
    'from-brand-500 to-brand-600',
];

export const BranchSettingsPage: React.FC<BranchSettingsPageProps> = ({
    branches,
    activeBranchId,
    onSetActiveBranch,
    onAddBranch,
    onUpdateBranch,
    onDeleteBranch,
    onBack,
    loading = false,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const resetForm = () => {
        setFormName('');
        setFormAddress('');
        setFormPhone('');
        setIsAdding(false);
        setEditingId(null);
    };

    const startAdd = () => {
        setFormName('');
        setFormAddress('');
        setFormPhone('');
        setEditingId(null);
        setIsAdding(true);
    };

    const startEdit = (branch: Branch) => {
        setEditingId(branch.id);
        setFormName(branch.name);
        setFormAddress(branch.address || '');
        setFormPhone(branch.phone || '');
        setIsAdding(false);
    };

    const handleSave = async () => {
        const trimmedName = formName.trim();
        if (!trimmedName) return;
        setSaving(true);
        try {
            if (editingId) {
                const existing = branches.find(b => b.id === editingId);
                if (existing) {
                    await onUpdateBranch({
                        ...existing,
                        name: trimmedName,
                        address: formAddress.trim() || undefined,
                        phone: formPhone.trim() || undefined,
                    });
                }
            } else {
                await onAddBranch({
                    name: trimmedName,
                    address: formAddress.trim() || undefined,
                    phone: formPhone.trim() || undefined,
                });
            }
            resetForm();
        } catch (error) {
            console.error('Error saving branch:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (branchId: string) => {
        setSaving(true);
        try {
            await onDeleteBranch(branchId);
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Error deleting branch:', error);
        } finally {
            setSaving(false);
        }
    };

    const isFormOpen = isAdding || !!editingId;

    const cardStyle: React.CSSProperties = {
        background: '#ffffff',
        border: '1px solid rgba(148,163,184,0.3)',
        borderRadius: '22px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 4px 16px -8px rgba(15,23,42,0.08), 0 16px 36px -20px rgba(15,23,42,0.07)',
        padding: '0.75rem 0.85rem 0.75rem',
    };
    const inputStyle: React.CSSProperties = {
        background: '#ffffff',
        border: '1px solid rgba(148,163,184,0.32)',
        borderRight: '2px solid rgba(59,130,246,0.3)',
        borderRadius: '14px',
        padding: '0.6rem 0.85rem',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.05)',
        outline: 'none',
    };
    const accentBar = (color: string): React.CSSProperties => ({
        background: color, opacity: 0.72, position: 'absolute' as const, top: 0, right: '10px', left: '10px', height: '4px', borderRadius: '999px',
    });
    const sideBar = (color: string): React.CSSProperties => ({
        background: color, opacity: 0.78, width: '4px', height: '24px', borderRadius: '999px', flexShrink: 0,
    });

    const hasBranches = branches.length > 0;

    return (
        <div
            className="min-h-screen w-full"
            dir="rtl"
            style={{
                background: 'radial-gradient(1200px 320px at 85% -10%, rgba(14,165,233,0.42), transparent 58%), radial-gradient(900px 280px at -12% 0%, rgba(16,185,129,0.35), transparent 60%), linear-gradient(180deg, #e0f2fe 0%, #cffafe 50%, #ecfeff 100%)',
            }}
        >
            <div className="max-w-3xl mx-auto px-3 sm:px-5 py-3 sm:py-4 space-y-2.5">

                {/* Header */}
                <div className="relative overflow-hidden dh-stagger-1" style={cardStyle}>
                    <div style={accentBar('linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')} />
                    <div className="flex items-center gap-3 mt-0.5">
                        <button onClick={onBack} className="w-9 h-9 rounded-[14px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0" style={{ border: '1px solid rgba(148,163,184,0.32)' }}>
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="flex items-center gap-2 flex-1">
                            <div style={sideBar('linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')} />
                            <h1 className="text-[0.95rem] font-black text-slate-900 tracking-tight">إعدادات الفروع</h1>
                        </div>
                        {!isFormOpen && (
                            <button onClick={startAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white transition-all active:scale-[0.97] shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: '1px solid rgba(37,99,235,0.62)', borderRadius: '14px', boxShadow: '0 12px 24px -22px rgba(37,99,235,0.54)' }}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                فرع جديد
                            </button>
                        )}
                    </div>
                </div>

                {/* Add/Edit Form */}
                {isFormOpen && (
                    <div className="relative overflow-hidden dh-stagger-2" style={cardStyle}>
                        <div style={accentBar(editingId ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')} />
                        <div className="flex items-center gap-2 mb-3 mt-0.5">
                            <div style={sideBar(editingId ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')} />
                            <h2 className="text-[0.95rem] font-black text-slate-900 tracking-tight">{editingId ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}</h2>
                        </div>
                        <div className="space-y-2.5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 mb-1 mr-1">اسم الفرع *</label>
                                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="مثال: فرع المعادي" autoFocus className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-300" style={inputStyle} dir="rtl" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 mb-1 mr-1">العنوان</label>
                                <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="مثال: شارع 9 المعادي" className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-300" style={inputStyle} dir="rtl" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 mb-1 mr-1">التليفون</label>
                                <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="01012345678" className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-300 text-left" style={inputStyle} dir="ltr" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleSave} disabled={!formName.trim() || saving} className="flex-1 text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50" style={{ background: !formName.trim() || saving ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: '1px solid rgba(37,99,235,0.62)', borderRadius: '14px', padding: '0.55rem 1rem', boxShadow: !formName.trim() || saving ? 'none' : '0 12px 24px -22px rgba(37,99,235,0.54)' }}>
                                {saving ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>جاري الحفظ</span> : (editingId ? 'حفظ التعديلات' : 'إضافة الفرع')}
                            </button>
                            <button onClick={resetForm} disabled={saving} className="px-4 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-[0.98]" style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.32)', borderRadius: '14px', padding: '0.55rem 1rem' }}>إلغاء</button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !hasBranches && (
                    <div className="relative overflow-hidden" style={cardStyle}>
                        <div style={accentBar('linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)')} />
                        <div className="flex items-center justify-center py-8 gap-3">
                            <svg className="w-5 h-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            <p className="text-sm font-bold text-slate-400">جاري تحميل الفروع...</p>
                        </div>
                    </div>
                )}

                {/* Active Branch Selection */}
                {hasBranches && (
                <div className="relative overflow-hidden dh-stagger-2" style={cardStyle}>
                    <div style={accentBar('linear-gradient(135deg, #059669 0%, #10b981 100%)')} />
                    <div className="flex items-center gap-2 mb-2 mt-0.5">
                        <div style={sideBar('linear-gradient(135deg, #059669 0%, #10b981 100%)')} />
                        <h2 className="text-[0.95rem] font-black text-slate-900 tracking-tight">الفرع النشط</h2>
                        <span className="text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-200">
                            {branches.find(b => b.id === activeBranchId)?.name || ''}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {branches.map((branch, index) => {
                            const isActive = activeBranchId === branch.id;
                            return (
                                <button
                                    key={branch.id}
                                    onClick={() => onSetActiveBranch(branch.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 transition-all text-right ${
                                        isActive ? 'shadow-md' : 'hover:bg-slate-50'
                                    }`}
                                    style={{
                                        borderRadius: '16px',
                                        ...(isActive ? {
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                            border: '1px solid rgba(37,99,235,0.62)',
                                            boxShadow: '0 8px 20px -8px rgba(37,99,235,0.45)',
                                        } : {
                                            background: '#f8fafc',
                                            border: '1px solid rgba(148,163,184,0.25)',
                                        }),
                                    }}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                                            isActive ? '' : `bg-gradient-to-br ${BRANCH_COLORS[index % BRANCH_COLORS.length]}`
                                        }`}
                                        style={isActive ? { background: 'rgba(255,255,255,0.2)' } : { boxShadow: '0 2px 8px -2px rgba(0,0,0,0.15)' }}
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                            {branch.name}
                                        </p>
                                        {branch.address && (
                                            <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>{branch.address}</p>
                                        )}
                                        {branch.phone && (
                                            <p className={`text-[11px] mt-0.5 ${isActive ? 'text-brand-200' : 'text-slate-400'}`} dir="ltr">{branch.phone}</p>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        {isActive ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-black text-white/90">نشط</span>
                                                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                )}

                {/* Branch List — Management */}
                {hasBranches && (
                <div className="relative overflow-hidden dh-stagger-3" style={cardStyle}>
                    <div style={accentBar('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')} />
                    <div className="flex items-center gap-2 mb-2 mt-0.5">
                        <div style={sideBar('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')} />
                        <h2 className="text-[0.95rem] font-black text-slate-900 tracking-tight">إدارة الفروع</h2>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {branches.length} {branches.length === 1 ? 'فرع' : 'فروع'}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {branches.map((branch, index) => (
                            <div
                                key={branch.id}
                                className="flex items-center gap-3 px-3.5 py-3 group transition-colors hover:bg-slate-50/80"
                                style={{
                                    borderRadius: '16px',
                                    background: '#f8fafc',
                                    border: '1px solid rgba(148,163,184,0.2)',
                                }}
                            >
                                <div
                                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-gradient-to-br ${BRANCH_COLORS[index % BRANCH_COLORS.length]}`}
                                    style={{ boxShadow: '0 2px 8px -2px rgba(0,0,0,0.15)' }}
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-bold text-sm text-slate-800">{branch.name}</p>
                                        {branch.id === activeBranchId && (
                                            <span className="text-[9px] font-black text-success-600 bg-success-50 px-1.5 py-0.5 rounded-md border border-success-200">نشط</span>
                                        )}
                                        {branch.id === DEFAULT_BRANCH_ID && (
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">رئيسي</span>
                                        )}
                                    </div>
                                    {branch.address ? (
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{branch.address}</p>
                                    ) : (
                                        <p className="text-xs text-warning-500 mt-0.5 flex items-center gap-1">
                                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                            </svg>
                                            اضغط تعديل لإضافة العنوان والتليفون
                                        </p>
                                    )}
                                    {branch.phone && <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">{branch.phone}</p>}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(branch)}
                                        className="w-8 h-8 rounded-[10px] hover:bg-white hover:shadow-sm flex items-center justify-center transition-all"
                                        style={{ border: '1px solid transparent' }}
                                        title="تعديل"
                                    >
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    {branch.id !== DEFAULT_BRANCH_ID && (
                                        <>
                                            {deleteConfirmId === branch.id ? (
                                                <div className="flex items-center gap-1 mr-1">
                                                    <button
                                                        onClick={() => handleDelete(branch.id)}
                                                        disabled={saving}
                                                        className="px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors"
                                                        style={{ background: '#dc2626', borderRadius: '10px' }}
                                                    >
                                                        {saving ? '...' : 'حذف'}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 bg-white transition-colors"
                                                        style={{ border: '1px solid rgba(148,163,184,0.3)', borderRadius: '10px' }}
                                                    >
                                                        لا
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(branch.id)}
                                                    className="w-8 h-8 rounded-[10px] hover:bg-danger-50 hover:shadow-sm flex items-center justify-center transition-all"
                                                    title="حذف"
                                                >
                                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-danger-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                )}

            </div>
        </div>
    );
};
