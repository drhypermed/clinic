module.exports = (context) => {
  const {
    getDb,
    ACCOUNT_TYPE_CONTROL_DOC_ID,
    normalizeSmartRxConfig,
    admin,
    assertAdminRequest,
  } = context;

  const updateAccountTypeControls = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const incoming = request?.data || {};
    const config = normalizeSmartRxConfig(incoming);

    await getDb().collection('settings').doc(ACCOUNT_TYPE_CONTROL_DOC_ID).set({
      ...config,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminEmail,
    }, { merge: true });

    return {
      ok: true,
      config,
    };
  };

  return updateAccountTypeControls;
};
