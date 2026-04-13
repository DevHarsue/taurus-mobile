import React from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { AlertBanner } from '@components/AlertBanner';
import { useLogin } from '@features/auth/hooks/useLogin';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { submit, loading, error } = useLogin();
  const {
    control: _control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  // Minimal integration (Said will replace visuals). Keeping Input controlled via setValue for now.
  return (
    <View style={styles.container}>
      {!!error && <AlertBanner message={error} variant="error" />}

      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(t) => setValue('email', t)}
        error={errors.email?.message}
      />

      <Input
        label="Contraseña"
        secureTextEntry
        onChangeText={(t) => setValue('password', t)}
        error={errors.password?.message}
      />

      <Button title="Ingresar" onPress={handleSubmit((values) => submit(values))} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  }
});