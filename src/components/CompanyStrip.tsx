import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCompanyStore } from '../store/companyStore';
import { useSyncStore } from '../store/syncStore';
import { Colors, Typography } from '../theme';

// OG .NET company strip (Row 0 of every report page): a primary-coloured bar with
// the company name and "Last Synced: X" centred in small white text.
const CompanyStripBase: React.FC = () => {
  const companyName = useCompanyStore((s) => s.selectedCompany?.name);
  // vv_address — the company's own address, shown under its name like the .NET app.
  const companyAddress = useCompanyStore((s) => s.selectedCompany?.city);
  const lastSynced = useSyncStore((s) => s.lastSynced);

  if (!companyName) return null;

  return (
    <View style={styles.strip}>
      <Text style={styles.company} numberOfLines={1}>
        {companyName}
      </Text>
      {companyAddress ? (
        <Text style={styles.address} numberOfLines={2}>
          {companyAddress}
        </Text>
      ) : null}
      <Text style={styles.synced} numberOfLines={1}>
        Last Synced: {lastSynced || '—'}
      </Text>
    </View>
  );
};

export const CompanyStrip = React.memo(CompanyStripBase);

const styles = StyleSheet.create({
  strip: {
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    alignItems: 'center',
  },
  company: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textWhite,
  },
  address: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 1,
    paddingHorizontal: 12,
  },
  synced: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
});
