import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '@theme/index';

export default function MyQRScreen() {
  // TODO: Replace with member id/email once backend integration for member profile is wired.
  const value = 'taurus-member';

  return (
    <View style={styles.container}>
      <QRCode value={value} size={220} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgLight
  }
});