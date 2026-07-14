import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/** Cross-platform alert — web supports confirm/cancel via window.confirm. */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS === 'web') {
    if (!buttons || buttons.length <= 1) {
      window.alert(message ? `${title}\n\n${message}` : title);
      buttons?.[0]?.onPress?.();
      return;
    }

    const cancelButton = buttons.find((button) => button.style === 'cancel');
    const confirmButton = buttons.find((button) => button.style !== 'cancel') ?? buttons[buttons.length - 1];
    const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);

    if (confirmed) {
      confirmButton?.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
    return;
  }

  Alert.alert(title, message, buttons);
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: { confirmText?: string; cancelText?: string; destructive?: boolean },
): void {
  showAlert(title, message, [
    { text: options?.cancelText ?? 'Cancel', style: 'cancel' },
    {
      text: options?.confirmText ?? 'OK',
      style: options?.destructive ? 'destructive' : 'default',
      onPress: () => {
        void Promise.resolve(onConfirm());
      },
    },
  ]);
}
