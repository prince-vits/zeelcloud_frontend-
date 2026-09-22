import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { DateField } from '../../components/DateField';
import { SelectField } from '../../components/SelectField';
import { InputField } from '../../components/InputField';
import { Checkbox } from '../../components/Checkbox';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { machineWiseApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OG_START_DATE, todayIso } from '../../utils/formatDate';
import type {
  MachineWiseFilter,
  MachineWiseFilterOptions,
  MachineWiseReportType,
  MachineWiseShortageUnit,
  MachineWiseStackParamList,
  MachineWiseStockType,
  MachineWiseViewMode,
} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<MachineWiseStackParamList, 'MachineWiseFilter'>;
};

const FALLBACK_REPORT_TYPES: { value: MachineWiseReportType; label: string; icon: string }[] = [
  { value: 'machine', label: 'Machine Wise', icon: 'cog-outline' },
  { value: 'party', label: 'Party Wise', icon: 'account-group-outline' },
  { value: 'job_party', label: 'Job Party Wise', icon: 'briefcase-outline' },
  { value: 'beam', label: 'Beam Wise', icon: 'layers-outline' },
  { value: 'g_quality', label: 'G.Quality Wise', icon: 'texture-box' },
  { value: 'job_party_g_quality', label: 'Job Party + G.Quality', icon: 'file-tree-outline' },
  { value: 'ends', label: 'Ends Wise', icon: 'ray-start-end' },
];

const FALLBACK_STOCK_TYPES: { value: MachineWiseStockType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'loading', label: 'Loading Beam' },
  { value: 'bhidan', label: 'Bhidan Beam' },
  { value: 'godown', label: 'Godown' },
];

const ALL_OPTION = 'All';

export const MachineWiseFilterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [options, setOptions] = useState<MachineWiseFilterOptions | null>(null);

  const [reportType, setReportType] = useState<MachineWiseReportType>('machine');
  const [viewMode, setViewMode] = useState<MachineWiseViewMode>('detail');
  const [stockType, setStockType] = useState<MachineWiseStockType>('all');
  const [machine, setMachine] = useState(ALL_OPTION);
  const [party, setParty] = useState(ALL_OPTION);
  const [jobParty, setJobParty] = useState(ALL_OPTION);
  const [gQuality, setGQuality] = useState(ALL_OPTION);
  const [grayQuality, setGrayQuality] = useState(false);
  const [qualityDesignReq, setQualityDesignReq] = useState(false);
  const [bhidanFrom, setBhidanFrom] = useState(OG_START_DATE);
  const [bhidanTo, setBhidanTo] = useState(todayIso());
  const [useProductionDate, setUseProductionDate] = useState(false);
  const [productionFrom, setProductionFrom] = useState(OG_START_DATE);
  const [productionTo, setProductionTo] = useState(todayIso());
  const [shortageUnit, setShortageUnit] = useState<MachineWiseShortageUnit>('taka');
  const [shortageValue, setShortageValue] = useState('0');

  useEffect(() => {
    let alive = true;
    setLoadingFilters(true);
    machineWiseApi
      .getFilters()
      .then((data) => {
        if (alive) setOptions(data);
      })
      .catch(() => {
        if (alive) setOptions(null);
      })
      .finally(() => {
        if (alive) setLoadingFilters(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const reportTypes = useMemo(() => {
    if (options?.reportTypes?.length) {
      return options.reportTypes.map((rt) => ({
        value: rt.value as MachineWiseReportType,
        label: rt.label,
        icon: FALLBACK_REPORT_TYPES.find((f) => f.value === rt.value)?.icon ?? 'chart-bar',
      }));
    }
    return FALLBACK_REPORT_TYPES;
  }, [options]);

  const stockTypes = options?.stockTypes?.length
    ? options.stockTypes.map((st) => ({
        value: st.value as MachineWiseStockType,
        label: st.label,
      }))
    : FALLBACK_STOCK_TYPES;

  const machineOptions = useMemo(() => {
    const list = (options?.machines ?? []).map((m) =>
      m.vv_mc_name ? `${m.vv_mc_no} — ${m.vv_mc_name}` : m.vv_mc_no,
    );
    return [ALL_OPTION, ...list.filter(Boolean)];
  }, [options]);

  const partyOptions = useMemo(() => {
    const list = (options?.parties ?? []).map((p) => p.vv_party_name || String(p.vn_party_id));
    return [ALL_OPTION, ...list.filter(Boolean)];
  }, [options]);

  const jobPartyOptions = useMemo(() => {
    const list = (options?.jobParties ?? []).map(
      (p) => p.vv_job_party_name || String(p.vn_job_party_id),
    );
    return [ALL_OPTION, ...list.filter(Boolean)];
  }, [options]);

  const gQualityOptions = useMemo(() => {
    const list = (options?.gQualities ?? []).map(
      (q) => q.vv_g_item_name || String(q.vn_g_item),
    );
    return [ALL_OPTION, ...list.filter(Boolean)];
  }, [options]);

  const resolveMachineValue = (label: string): string | undefined => {
    if (!label || label === ALL_OPTION) return undefined;
    const mcNo = label.split(' — ')[0]?.trim();
    return mcNo || undefined;
  };

  const resolvePartyValue = (label: string): string | undefined => {
    if (!label || label === ALL_OPTION) return undefined;
    const match = options?.parties?.find(
      (p) => p.vv_party_name === label || String(p.vn_party_id) === label,
    );
    return match ? String(match.vn_party_id) : label;
  };

  const resolveJobPartyValue = (label: string): string | undefined => {
    if (!label || label === ALL_OPTION) return undefined;
    const match = options?.jobParties?.find(
      (p) => p.vv_job_party_name === label || String(p.vn_job_party_id) === label,
    );
    return match ? String(match.vn_job_party_id) : label;
  };

  const resolveGQualityValue = (label: string): string | undefined => {
    if (!label || label === ALL_OPTION) return undefined;
    const match = options?.gQualities?.find(
      (q) => q.vv_g_item_name === label || String(q.vn_g_item) === label,
    );
    return match ? String(match.vn_g_item) : label;
  };

  const handleGenerate = () => {
    const filter: MachineWiseFilter = {
      reportType,
      view: viewMode,
      stockType,
      companyId: String(selectedCompany?.recordId || selectedCompany?.id || ''),
      machine: resolveMachineValue(machine),
      party: resolvePartyValue(party),
      jobParty: resolveJobPartyValue(jobParty),
      gQuality: resolveGQualityValue(gQuality),
      grayQuality,
      qualityDesignReq,
      bhidanFrom,
      bhidanTo,
      useProductionDate,
      productionFrom: useProductionDate ? productionFrom : undefined,
      productionTo: useProductionDate ? productionTo : undefined,
      shortageUnit,
      shortageValue,
    };
    navigation.navigate('MachineWiseReport', { filter });
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Machine Wise Beam Stock"
        subtitle={selectedCompany?.name}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Report Type</Text>
          <View style={styles.chipsRow}>
            {reportTypes.map((rt) => (
              <TouchableOpacity
                key={rt.value}
                style={[styles.chip, reportType === rt.value && styles.chipActive]}
                onPress={() => setReportType(rt.value)}
                activeOpacity={0.8}
              >
                <Icon
                  name={rt.icon}
                  size={14}
                  color={reportType === rt.value ? Colors.textWhite : Colors.gradientStart}
                />
                <Text style={[styles.chipText, reportType === rt.value && styles.chipTextActive]}>
                  {rt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>View</Text>
          <View style={styles.chipsRow}>
            {([
              { value: 'detail' as const, label: 'Detail' },
              { value: 'summary' as const, label: 'Summary' },
            ]).map((v) => (
              <TouchableOpacity
                key={v.value}
                style={[styles.chip, viewMode === v.value && styles.chipActive]}
                onPress={() => setViewMode(v.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, viewMode === v.value && styles.chipTextActive]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, styles.mt]}>Stock Type</Text>
          <View style={styles.chipsRow}>
            {stockTypes.map((st) => (
              <TouchableOpacity
                key={st.value}
                style={[styles.chip, stockType === st.value && styles.chipActive]}
                onPress={() => setStockType(st.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, stockType === st.value && styles.chipTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Filters</Text>
          <SelectField
            label="Machine"
            value={machine === ALL_OPTION ? '' : machine}
            options={machineOptions}
            onSelect={setMachine}
            placeholder="All machines"
            onClear={() => setMachine(ALL_OPTION)}
          />
          <SelectField
            label="Party"
            value={party === ALL_OPTION ? '' : party}
            options={partyOptions}
            onSelect={setParty}
            placeholder="All parties"
            onClear={() => setParty(ALL_OPTION)}
          />
          <SelectField
            label="Job Party"
            value={jobParty === ALL_OPTION ? '' : jobParty}
            options={jobPartyOptions}
            onSelect={setJobParty}
            placeholder="All job parties"
            onClear={() => setJobParty(ALL_OPTION)}
          />
          <SelectField
            label="G. Quality"
            value={gQuality === ALL_OPTION ? '' : gQuality}
            options={gQualityOptions}
            onSelect={setGQuality}
            placeholder="All qualities"
            onClear={() => setGQuality(ALL_OPTION)}
          />
          <View style={styles.checkRow}>
            <Checkbox
              label="Require Gray Quality"
              checked={grayQuality}
              onToggle={() => setGrayQuality((v) => !v)}
            />
            <Checkbox
              label="Require Design"
              checked={qualityDesignReq}
              onToggle={() => setQualityDesignReq((v) => !v)}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Bhidan Date Range</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DateField label="From" value={bhidanFrom} defaultDate={OG_START_DATE} onChange={setBhidanFrom} />
            </View>
            <Icon name="arrow-right" size={18} color={Colors.gray400} style={styles.dateArrow} />
            <View style={styles.dateField}>
              <DateField label="To" value={bhidanTo} onChange={setBhidanTo} />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Use Production Date</Text>
            <Switch
              value={useProductionDate}
              onValueChange={setUseProductionDate}
              trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
              thumbColor={useProductionDate ? Colors.primary : Colors.gray400}
            />
          </View>
          {useProductionDate ? (
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <DateField label="Prod From" value={productionFrom} defaultDate={OG_START_DATE} onChange={setProductionFrom} />
              </View>
              <Icon name="arrow-right" size={18} color={Colors.gray400} style={styles.dateArrow} />
              <View style={styles.dateField}>
                <DateField label="Prod To" value={productionTo} onChange={setProductionTo} />
              </View>
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Above Shortage</Text>
          <View style={styles.chipsRow}>
            {([
              { value: 'taka' as const, label: 'Taka' },
              { value: 'meter' as const, label: 'Meter %' },
            ]).map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.chip, shortageUnit === u.value && styles.chipActive]}
                onPress={() => setShortageUnit(u.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, shortageUnit === u.value && styles.chipTextActive]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <InputField
            label={shortageUnit === 'meter' ? 'Shortage % (0 = off)' : 'Shortage Taka (0 = off)'}
            value={shortageValue}
            onChangeText={setShortageValue}
            keyboardType="numeric"
            placeholder="0"
          />
        </Card>

        <PrimaryButton
          title="Generate Report"
          onPress={handleGenerate}
          icon="chart-bar"
          style={styles.generateBtn}
        />
      </ScrollView>
      <LoadingOverlay visible={loadingFilters} message="Loading filters..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mt: { marginTop: Spacing.md },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.gradientStart,
    backgroundColor: Colors.primaryLight,
  },
  chipActive: {
    backgroundColor: Colors.gradientStart,
    borderColor: Colors.gradientStart,
  },
  chipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gradientStart,
    fontWeight: Typography.fontWeights.medium,
  },
  chipTextActive: { color: Colors.textWhite },
  checkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateField: { flex: 1 },
  dateArrow: { marginHorizontal: Spacing.sm, marginTop: 24 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  switchLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  generateBtn: { marginTop: Spacing.sm },
});
