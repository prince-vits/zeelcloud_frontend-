import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
import { CompanyStrip } from '../../components/CompanyStrip';
import { gpRegisterApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { GpRegisterStackParamList, GpRegisterEntry } from '../../types';
import { toDDMMYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<GpRegisterStackParamList, 'GpRegister'>;
  route: RouteProp<GpRegisterStackParamList, 'GpRegister'>;
};

export const GpRegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [entries, setEntries] = useState<GpRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, companyId: String(selectedCompany?.recordId || selectedCompany?.id) };
    gpRegisterApi.getEntries(filter).then((data) => {
      setEntries(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [route.params.filter, selectedCompany?.recordId, selectedCompany?.id]);

  const lowerSearch = search.toLowerCase();
  const filtered = entries.filter(
    (e) =>
      e.partyName.toLowerCase().includes(lowerSearch) ||
      e.entryNo.toLowerCase().includes(lowerSearch) ||
      e.billNo.toLowerCase().includes(lowerSearch) ||
      e.date.includes(lowerSearch)
  );

  const totalAmount = filtered.reduce((sum, item) => sum + (item.amount || 0), 0);

  const columns: GridColumn<GpRegisterEntry>[] = [
    { 
      key: 'entryNo', 
      label: 'Entry No\nDate', 
      flex: 0.9, 
      align: 'left', 
      render: (inv) => (
        <View style={styles.stackedCell}>
          <Text style={styles.stackedTop}>{inv.entryNo}</Text>
          <Text style={styles.stackedBottom}>{toDDMMYY(inv.date)}</Text>
        </View>
      ) 
    },
    { key: 'billNo', label: 'Bill no', flex: 0.8, render: (inv) => <GridText color={Colors.danger} bold>{inv.billNo}</GridText> },
    { key: 'partyName', label: 'Party Name', flex: 1.8, align: 'left', render: (inv) => <GridText align="left">{inv.partyName}</GridText> },
    { key: 'amount', label: 'Amount', flex: 1.2, align: 'right', render: (inv) => <GridText align="right">{`₹ ${inv.amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</GridText> },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader title="GP Register" subtitle="Job Work Entries" onBack={() => navigation.goBack()} />
      <CompanyStrip />
      
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search Party, Bill No, Date, Amount" />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount: </Text>
          <Text style={styles.totalValue}>{`₹ ${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</Text>
        </View>
      </View>
      
      <View style={styles.tableWrapper}>
        <GridTable
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyText="No GP entries found"
          onRowPress={(item) => navigation.navigate('GpRegisterDetail', { entryId: item.id })}
        />
      </View>
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs
  },
  totalLabel: { 
    fontSize: Typography.fontSizes.base, 
    fontWeight: Typography.fontWeights.semiBold, 
    color: Colors.textSecondary 
  },
  totalValue: { 
    fontSize: Typography.fontSizes.lg, 
    fontWeight: Typography.fontWeights.bold, 
    color: Colors.textPrimary 
  },
  tableWrapper: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: Spacing.md
  },
  stackedCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stackedTop: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  stackedBottom: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  }
});
