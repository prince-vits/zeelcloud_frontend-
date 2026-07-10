import React from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SubUserForm } from './SubUserForm';
import { useSubUserStore } from '../../store/subUserStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { SubUserStackParamList } from '../../types';

export const EditSubUserScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const route = useRoute<RouteProp<SubUserStackParamList, 'EditSubUser'>>();
  const { getById, updateSubUser, deleteSubUser } = useSubUserStore();
  const user = getById(route.params.userId);

  const handleDelete = () => {
    if (!user) return;
    Alert.alert('Delete Sub User', `Remove ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSubUser(user.id);
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Edit Sub User"
        subtitle="Update user information and permissions"
        onBack={() => navigation.goBack()}
        rightElement={
          user ? (
            <Icon name="trash-can-outline" size={22} color={Colors.danger} onPress={handleDelete} />
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
          {user ? (
            <SubUserForm
              initial={user}
              submitLabel="Update Sub User"
              submitIcon="content-save-outline"
              showActive
              onSubmit={(values) => {
                updateSubUser(user.id, values);
                Alert.alert('Sub User Updated', `${values.name}'s details have been saved.`);
                navigation.goBack();
              }}
            />
          ) : (
            <View style={styles.missing}>
              <Icon name="account-off-outline" size={48} color={Colors.gray300} />
              <Text style={styles.missingText}>This sub user no longer exists.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.md },
  missing: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  missingText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
});
