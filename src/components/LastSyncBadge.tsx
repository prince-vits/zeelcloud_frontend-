import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { useSyncStore } from '../store/syncStore';
import { Colors, Typography } from '../theme';

// Compact "Last Sync" indicator shown in the top header of every screen.
//
// It subscribes to ONLY syncStore.lastSynced via a selector, and the whole
// component is React.memo'd, so it re-renders when the sync time changes and not
// when any other screen state updates — keeping it cheap to drop into every header.
const LastSyncBadgeBase: React.FC = () => {
  const lastSynced = useSyncStore((s) => s.lastSynced);

  return (
    <View style={styles.row}>
      <Icon name="sync" size={11} color={Colors.textSecondary} />
      <Text style={styles.text} numberOfLines={1}>
        Last sync: {lastSynced || 'not synced yet'}
      </Text>
    </View>
  );
};

export const LastSyncBadge = React.memo(LastSyncBadgeBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  text: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
});
