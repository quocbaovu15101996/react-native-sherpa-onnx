"use strict";

import { Alert } from 'react-native';
export function promptChecksumFallback(issue) {
  return new Promise(resolve => {
    const reasonText = issue.reason === 'CHECKSUM_FAILED' ? 'Failed to compute checksum.' : 'Computed checksum does not match the expected value.';
    const body = `${reasonText}\n\n${issue.message}\n\nDo you want to keep the file and continue?`;
    Alert.alert('Checksum Problem', body, [{
      text: 'Delete and cancel',
      style: 'destructive',
      onPress: () => resolve(false)
    }, {
      text: 'Keep file',
      style: 'default',
      onPress: () => resolve(true)
    }]);
  });
}
//# sourceMappingURL=checksumPrompt.js.map