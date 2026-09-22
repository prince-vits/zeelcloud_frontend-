import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { SubUserForm } from './SubUserForm';
import { useSubUserStore } from '../../store/subUserStore';
import { useAuthStore } from '../../store/authStore';
import { MODULE_TO_FORM_ID } from '../../constants/options';
import { confirmAction, showAlert } from '../../utils/alert';
import { Colors, Typography, Spacing } from '../../theme';
import type { SubUser, SubUserStackParamList } from '../../types';
import type { SubUserFormValues } from './SubUserForm';

export const EditSubUserScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const route = useRoute<RouteProp<SubUserStackParamList, 'EditSubUser'>>();
  const { getById, fetchSubUserById, updateSubUserViaAPI, deactivateSubUserViaAPI } = useSubUserStore();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<SubUser | undefined>(() => getById(route.params.userId));
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const isAdmin = currentUser?.isSubuser === false && currentUser.parentUserId === null;

  useEffect(() => {
    setIsLoading(true);
    fetchSubUserById(route.params.userId)
      .then((subUser) => setUser(subUser ?? getById(route.params.userId)))
      .finally(() => setIsLoading(false));
  }, [fetchSubUserById, getById, route.params.userId]);

  const handleDeactivate = () => {
    if (!user || !user.isActive) return;

    confirmAction(
      'Deactivate Sub User',
      `Deactivate ${user.name}? They will no longer be able to sign in.`,
      async () => {
        setIsDeactivating(true);
        try {
          await deactivateSubUserViaAPI(user.id);
          navigation.popToTop();
          showAlert('Sub User Deactivated', `${user.name} has been deactivated.`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate sub user';
          showAlert('Deactivate Failed', errorMessage);
        } finally {
          setIsDeactivating(false);
        }
      },
      { confirmText: 'Deactivate', destructive: true },
    );
  };

  const handleSubmit = async (values: SubUserFormValues) => {
    if (!user || !isAdmin) {
      showAlert('Error', 'You do not have permission to update this sub user');
      return;
    }

    setIsUpdating(true);

    try {
      const nameParts = values.name.trim().split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ');

      const updateData: Record<string, unknown> = {};

      if (firstName.trim()) updateData.first_name = firstName;
      if (lastName.trim()) updateData.last_name = lastName;
      if (values.email?.trim()) updateData.email = values.email.trim();
      if (values.password?.trim()) updateData.password = values.password;
      if (values.companyName?.trim()) updateData.company_name = values.companyName.trim();
      if (values.phone?.trim()) updateData.contact_no = values.phone.trim();

      updateData.is_active = values.isActive;
      updateData.is_sales_order_creation_allowed = values.isSalesOrderCreationAllowed;

      if (values.allowedModules.length > 0) {
        updateData.form_ids = values.allowedModules
          .map((moduleName) => MODULE_TO_FORM_ID[moduleName])
          .filter((id): id is number => id !== undefined);
      } else {
        updateData.form_ids = [];
      }

      const updatedUser = await updateSubUserViaAPI(
        user.id,
        updateData as Parameters<typeof updateSubUserViaAPI>[1],
      );

      setUser(updatedUser);
      showAlert('Success', `${values.name}'s details have been updated.`, [
        {
          text: 'OK',
          onPress: () => navigation.replace('SubUserDetail', { userId: user.id }),
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sub user';
      showAlert('Update Failed', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Edit Sub User"
        subtitle="Update user information and permissions"
        onBack={() => navigation.goBack()}
        rightElement={
          user && isAdmin && user.isActive ? (
            <TouchableOpacity onPress={handleDeactivate} activeOpacity={0.7} style={styles.deactivateBtn}>
              <Icon name="account-off-outline" size={22} color={Colors.danger} />
            </TouchableOpacity>
          ) : undefined
        }
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
          {isLoading ? (
            <View style={styles.missing}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : !isAdmin ? (
            <View style={styles.missing}>
              <Icon name="shield-lock-outline" size={48} color={Colors.gray300} />
              <Text style={styles.missingText}>Admin access required to edit sub users.</Text>
            </View>
          ) : user ? (
            <SubUserForm
              initial={user}
              submitLabel="Update Sub User"
              submitIcon="content-save-outline"
              showActive
              onSubmit={handleSubmit}
            />
          ) : (
            <View style={styles.missing}>
              <Icon name="account-off-outline" size={48} color={Colors.gray300} />
              <Text style={styles.missingText}>This sub user no longer exists.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {isUpdating ? <LoadingOverlay message="Updating sub user..." /> : null}
      {isDeactivating ? <LoadingOverlay message="Deactivating sub user..." /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  missing: { alignItems: 'center', marginTop: Spacing.xl * 2, gap: Spacing.md },
  missingText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.gray600,
    textAlign: 'center',
  },
  deactivateBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
