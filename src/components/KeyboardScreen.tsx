import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ScrollViewProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface IKeyboardScreenProps extends Omit<ScrollViewProps, 'contentContainerStyle'> {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraBottomPadding?: number;
  dismissOnTap?: boolean;
}

export function KeyboardScreen({
  children,
  contentContainerStyle,
  extraBottomPadding = 32,
  dismissOnTap = true,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  style,
  ...rest
}: IKeyboardScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPadding =
    keyboardHeight > 0
      ? keyboardHeight + extraBottomPadding
      : insets.bottom + extraBottomPadding;

  const inner = (
    <ScrollView
      ref={scrollRef}
      style={[styles.flex, style]}
      contentContainerStyle={[{ paddingBottom: bottomPadding }, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardDismissMode="interactive"
      {...rest}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {dismissOnTap ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>{inner}</View>
        </TouchableWithoutFeedback>
      ) : (
        inner
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
