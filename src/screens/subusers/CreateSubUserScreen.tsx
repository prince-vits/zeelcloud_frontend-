import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientHeader } from '../../components/GradientHeader';
import { SubUserForm } from './SubUserForm';
import { useSubUserStore } from '../../store/subUserStore';
import { Colors, Spacing } from '../../theme';
import type { SubUserStackParamList } from '../../types';

export const CreateSubUserScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const { addSubUser } = useSubUserStore();

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Create Sub User"
        subtitle="Add a new sub user and set access"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SubUserForm
            submitLabel="Create Sub User"
            submitIcon="account-plus-outline"
            onSubmit={(values) => {
              addSubUser(values);
              Alert.alert('Sub User Created', `${values.name} has been added.`);
              navigation.goBack();
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.md },
});
