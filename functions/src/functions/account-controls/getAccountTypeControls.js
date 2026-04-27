module.exports = (context) => {
  const { getSmartRxConfig } = context;

  const getAccountTypeControls = async () => {
    const config = await getSmartRxConfig();
    return { ...config };
  };

  return getAccountTypeControls;
};
