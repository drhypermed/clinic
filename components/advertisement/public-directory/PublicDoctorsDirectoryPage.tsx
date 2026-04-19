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
import { BookingsPanelModal } from './BookingsPanelModal';
import { DoctorReviewsModal } from './DoctorReviewsModal';
import { AdBanner } from '../../common/AdBanner';
import { AppUpdateBroadcastBanner } from '../../common/AppUpdateBroadcastBanner';
import { InAppAudienceNotificationPopup } from '../../common/InAppAudienceNotificationPopup';
import type { PublicDoctorsDirectoryPageProps } from '../../../types';
import { usePublicDoctorsDirectoryController } from './usePublicDoctorsDirectoryController';

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
    stats,
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
  } = usePublicDoctorsDirectoryController(props);

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل دليل الأطباء" />;
  }

  const isLoggedIn = !!props.user;

  return (
    <div
      className="min-h-screen relative"
      dir="rtl"
      style={{
        background:
          'radial-gradient(1200px 320px at 85% -10%, rgba(14,165,233,0.28), transparent 58%),' +
          'radial-gradient(900px 280px at -12% 0%, rgba(16,185,129,0.22), transparent 60%),' +
          'linear-gradient(180deg, #e0f2fe 0%, #cffafe 50%, #ecfeff 100%)',
      }}
    >
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
            <span className="hover:text-teal-600 cursor-pointer transition-colors">الرئيسية</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">دليل الأطباء</span>
            {selectedDoctor && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-teal-600 truncate max-w-[200px]">{selectedDoctor.doctorName}</span>
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
                className="border border-cyan-100/70"
                displayHeight={banner.bannerHeight}
                rotationSeconds={banner.rotationSeconds || 5}
              />
            )}

            <DirectoryHeroSection stats={stats} />

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
        onBookDoctor={goToPublicBookingForm}
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
        isTemporaryPublicAccount={isTemporaryPublicAccount}
        isPublicEmailVerified={isPublicEmailVerified}
        onOpenGoogleLogin={() => {
          setShowAccountPanel(false);
          openAuthPrompt('');
        }}
        onLogout={() => { void handlePublicLogout(); }}
      />
    </div>
  );
};
