import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientHeader } from '../../components/GradientHeader';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { SubUserForm } from './SubUserForm';
import { useSubUserStore } from '../../store/subUserStore';
import { useAuthStore } from '../../store/authStore';
import { MODULE_TO_FORM_ID } from '../../constants/options';
import { showAlert } from '../../utils/alert';
import { Colors, Spacing } from '../../theme';
import type { SubUserStackParamList } from '../../types';
import type { SubUserFormValues } from './SubUserForm';
export const CreateSubUserScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const { createSubUserViaAPI } = useSubUserStore();
  const { user: currentUser } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);

  const isAdmin = currentUser?.isSubuser === false && currentUser.parentUserId === null;

  const handleSubmit = async (values: SubUserFormValues) => {
    if (!isAdmin) {
      showAlert('Error', 'You do not have permission to create sub users');
      return;
    }

    setIsCreating(true);

    try {
      const nameParts = values.name.trim().split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ');

      const formIds = values.allowedModules
        .map((moduleName) => MODULE_TO_FORM_ID[moduleName])
        .filter((id): id is number => id !== undefined);

      const createData: Parameters<typeof createSubUserViaAPI>[0] = {
        username: values.username.trim(),
        password: values.password,
        contact_no: values.phone.trim(),
        form_ids: formIds,
      };

      if (firstName.trim()) createData.first_name = firstName;
      if (lastName.trim()) createData.last_name = lastName;
      if (values.email.trim()) createData.email = values.email.trim();
      if (values.companyName.trim()) createData.company_name = values.companyName.trim();

      const newUser = await createSubUserViaAPI(createData);

      setIsCreating(false);
      navigation.popToTop();
      showAlert('Sub User Created', `${values.name || values.username} has been added.`);
    } catch (error) {
      setIsCreating(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create sub user';
      showAlert('Create Failed', errorMessage);
    }
  };

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
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {isCreating && <LoadingOverlay message="Creating sub user..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.md },
});
