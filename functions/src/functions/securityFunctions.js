const makeEnforceFirestoreTextLengthOnWrite = require('./security/enforceFirestoreTextLengthOnWrite');

module.exports = (context) => {
  return {
    enforceFirestoreTextLengthOnWrite: makeEnforceFirestoreTextLengthOnWrite(context),
  };
};
