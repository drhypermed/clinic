import React from 'react';

import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { LoadingText } from '../../ui/LoadingText';
import { AuthPromptModal } from './AuthPromptModal';
import { AccountPanelModal } from './AccountPanelModal';
import { PublicActionsBar } from './PublicActionsBar';
import { DirectoryHeroSection } from './DirectoryHeroSection';
import { DirectoryFiltersSection } from './DirectoryFiltersSection';
import { DoctorsResultsSection } from './DoctorsResultsSection';
import { DoctorDetailsModal } from './DoctorDetailsModal';
import { BranchPickerModal } from './BranchPickerModal';
import { BookingsPanelModal } from './BookingsPanelModal';
import { DoctorReviewsModal } from './DoctorReviewsModal';
import { AdBanner } from '../../common/AdBanner';
import { AppUpdateBroadcastBanner } from '../../common/AppUpdateBroadcastBanner';
import { InAppAudienceNotificationPopup } from '../../common/InAppAudienceNotificationPopup';
import { JsonLdTag } from '../../common/JsonLdTag';
import type { PublicDoctorsDirectoryPageProps } from '../../../types';
import { usePublicDoctorsDirectoryController } from './usePublicDoctorsDirectoryController';
// Schema.org ItemList — بيورّي جوجل إن الصفحه فيها ليستة أطباء منظّمه.
// بيظهر في نتايج البحث كـRich Snippet (بعدد الأطباء وتخصّصاتهم).
import { buildDoctorsItemListSchema } from '../../../utils/doctorSchema';

export const PublicDoctorsDirectoryPage: React.FC<PublicDoctorsDirectoryPageProps> = (props) => {
  const {
    banner,
    isHomepageBannerVisible,
    loading,
    error,
    searchFilter,
    setSearchFilter,
    specialtyFilter,
    setSpecialtyFilter,
    specialties,
    governorateFilter,
    setGovernorateFilter,
    cityFilter,
    setCityFilter,
    citiesForFilter,
    topSpecialties,
    activeFiltersCount,
    filteredAds,
    ads,
    resetFilters,
    showAccountPanel,
    setShowAccountPanel,
    showBookingsPanel,
    setShowBookingsPanel,
    showDoctorReviewsModal,
    showAuthPrompt,
    authError,
    authInfo,
    authWorking,
    myBookings,
    myBookingsLoading,
    reviewFeedback,
    reviewSubmittingId,
    accountName,
    accountEmail,
    accountPhone,
    accountSaving,
    accountSaveError,
    saveAccountProfile,
    isTemporaryPublicAccount,
    isPublicEmailVerified,
    reviewsDoctor,
    doctorReviews,
    doctorReviewsLoading,
    selectedDoctor,
    selectedDoctorFilledSchedule,
    selectedDoctorRatingStats,
    setAvatarPreviewUrl,
    closeAuthPrompt,
    handlePublicGoogleLogin,
    openDoctorModal,
    closeDoctorModal,
    openDoctorReviews,
    closeDoctorReviewsModal,
    getBookingReviewDraft,
    updateBookingReviewDraft,
    submitBookingReview,
    deleteBookingReview,
    goToPublicBookingForm,
    openAuthPrompt,
    handlePublicLogout,
    handleJoinAsDoctor,
    handleContactWhatsApp,
    loadMore,
    hasMore,
    loadingMore,
    branchPickerDoctor,
    branchPickerBranches,
    selectBranchAndGoToBooking,
    closeBranchPicker,
  } = usePublicDoctorsDirectoryController(props);

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل دليل الأطباء" />;
  }

  const isLoggedIn = !!props.user;
  // JSON-LD ItemList بيتحط في <head> — بيساعد جوجل يفهم محتوى الصفحه.
  // بنستخدم filteredAds (مش ads) عشان لو المستخدم عمل فلتر، الـschema يعكس اللي ظاهر.
  const itemListSchema = filteredAds.length > 0
    ? buildDoctorsItemListSchema(filteredAds)
    : null;

  return (
    <div
      className="min-h-screen relative"
      dir="rtl"
      style={{
        // خلفيّه موحّده مع هويّة الطبيب (blue/indigo) — اتغيّرت من teal/cyan
        // عشان الجمهور يتّحد مع لون السايد بار وأزرار الحجز.
        background:
          'radial-gradient(1200px 320px at 85% -10%, rgba(59,130,246,0.25), transparent 58%),' +
          'radial-gradient(900px 280px at -12% 0%, rgba(99,102,241,0.20), transparent 60%),' +
          'linear-gradient(180deg, #dbeafe 0%, #eff6ff 50%, #f5f3ff 100%)',
      }}
    >
      {/* Schema.org ItemList — ميظهرش في الـUI بس بيتحط في <head> لجوجل */}
      <JsonLdTag id="directory-itemlist" json={itemListSchema} />

      <PublicActionsBar
        onOpenAccount={() => setShowAccountPanel(true)}
        onOpenBookings={() => setShowBookingsPanel(true)}
        onJoinAsDoctor={() => { void handleJoinAsDoctor(); }}
        onContactWhatsApp={handleContactWhatsApp}
        onLogout={() => { void handlePublicLogout(); }}
        accountName={accountName}
        isLoggedIn={isLoggedIn}
      />

      {/* Content area — offset right for the desktop sidebar */}
      <div className="md:mr-60">
        <div className="max-w-7xl mx-auto px-4 pt-3">
          <AppUpdateBroadcastBanner audience="public" scopeId={props.user?.uid || undefined} />
        </div>
        <InAppAudienceNotificationPopup audience="public" scopeIds={[props.user?.uid || '']} />

        <main className="max-w-7xl mx-auto px-4 pt-20 pb-6 md:pt-6 md:pb-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">الرئيسية</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">دليل الأطباء</span>
            {selectedDoctor && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600 truncate max-w-[200px]">{selectedDoctor.doctorName}</span>
              </>
            )}
          </div>

          <div className="space-y-6">
            {isHomepageBannerVisible && banner?.imageUrl && (
              <AdBanner
                imageUrl={banner.imageUrl}
                imageUrls={banner.imageUrls || []}
                items={banner.items || []}
                altText={banner.title || 'إعلان'}
                link={banner.targetUrl || undefined}
                className="border border-blue-100/70"
                displayHeight={banner.bannerHeight}
                rotationSeconds={banner.rotationSeconds || 5}
              />
            )}

            <DirectoryHeroSection />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-black">
                {error}
              </div>
            )}

            <DirectoryFiltersSection
              searchFilter={searchFilter}
              onSearchFilterChange={setSearchFilter}
              specialtyFilter={specialtyFilter}
              onSpecialtyFilterChange={setSpecialtyFilter}
              specialties={specialties}
              governorateFilter={governorateFilter}
              onGovernorateFilterChange={(value) => {
                setGovernorateFilter(value);
                setCityFilter('');
              }}
              cityFilter={cityFilter}
              onCityFilterChange={setCityFilter}
              citiesForFilter={citiesForFilter}
              topSpecialties={topSpecialties}
              onTopSpecialtyClick={setSpecialtyFilter}
              activeFiltersCount={activeFiltersCount}
              filteredAdsCount={filteredAds.length}
              adsCount={ads.length}
              onResetFilters={resetFilters}
            />

            <DoctorsResultsSection
              filteredAds={filteredAds}
              onResetFilters={resetFilters}
              onSelectDoctor={openDoctorModal}
              onBookDoctor={goToPublicBookingForm}
              onOpenDoctorReviews={openDoctorReviews}
              hasMore={hasMore}
              loadMore={loadMore}
              loadingMore={loadingMore}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <DoctorDetailsModal
        selectedDoctor={selectedDoctor}
        selectedDoctorFilledSchedule={selectedDoctorFilledSchedule}
        selectedDoctorRatingStats={selectedDoctorRatingStats}
        onClose={closeDoctorModal}
        onPreviewAvatar={(url) => setAvatarPreviewUrl(url)}
        onPreviewGalleryImage={(url) => setAvatarPreviewUrl(url)}
        onOpenDoctorReviews={openDoctorReviews}
      />

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={closeAuthPrompt}
        authError={authError}
        authInfo={authInfo}
        authWorking={authWorking}
        onGoogleLogin={() => { void handlePublicGoogleLogin(); }}
      />

      {/* مودال اختيار الفرع — يفتح بس لما الطبيب عنده أكتر من فرع */}
      <BranchPickerModal
        open={Boolean(branchPickerDoctor)}
        doctorName={branchPickerDoctor?.doctorName || ''}
        branches={branchPickerBranches}
        onClose={closeBranchPicker}
        onSelectBranch={selectBranchAndGoToBooking}
      />

      <BookingsPanelModal
        open={showBookingsPanel}
        onClose={() => setShowBookingsPanel(false)}
        myBookingsLoading={myBookingsLoading}
        myBookings={myBookings}
        accountName={accountName}
        reviewFeedback={reviewFeedback}
        reviewSubmittingId={reviewSubmittingId}
        getBookingReviewDraft={getBookingReviewDraft}
        updateBookingReviewDraft={updateBookingReviewDraft}
        submitBookingReview={(booking) => { void submitBookingReview(booking); }}
        deleteBookingReview={(booking) => { void deleteBookingReview(booking); }}
        onBookDoctor={goToPublicBookingForm}
      />

      <DoctorReviewsModal
        open={showDoctorReviewsModal}
        doctorName={reviewsDoctor?.doctorName || 'غير معروف'}
        reviews={doctorReviews}
        loading={doctorReviewsLoading}
        onClose={closeDoctorReviewsModal}
      />

      <AccountPanelModal
        open={showAccountPanel}
        onClose={() => setShowAccountPanel(false)}
        accountEmail={accountEmail}
        accountName={accountName}
        accountPhone={accountPhone}
        accountSaving={accountSaving}
        accountSaveError={accountSaveError}
        isTemporaryPublicAccount={isTemporaryPublicAccount}
        isPublicEmailVerified={isPublicEmailVerified}
        onOpenGoogleLogin={() => {
          setShowAccountPanel(false);
          openAuthPrompt('');
        }}
        onLogout={() => { void handlePublicLogout(); }}
        onSaveProfile={saveAccountProfile}
      />
    </div>
  );
};
