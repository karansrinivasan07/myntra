import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Moon, Sun, Smartphone } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, ThemeMode } from '@/src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeOptions = [
    {
      id: 'system',
      label: 'System Default',
      description: 'Follow the device system appearance settings.',
      icon: Smartphone,
    },
    {
      id: 'light',
      label: 'Light Theme',
      description: 'Standard bright UI theme layout.',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Theme',
      description: 'Comfortable theme for dark environments.',
      icon: Moon,
    },
  ];

  return (
    <ThemedView style={styles.container} colorType="background">
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: theme.colors.border }]} colorType="background">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Settings</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Appearance</ThemedText>
        
        <ThemedView style={[styles.optionsContainer, { borderColor: theme.colors.border }]} colorType="card">
          {themeOptions.map((option, idx) => {
            const isSelected = themeMode === option.id;
            const IconComponent = option.icon;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }
                ]}
                onPress={() => setThemeMode(option.id as ThemeMode)}
              >
                <ThemedView style={styles.optionLeft} colorType="card">
                  <IconComponent size={22} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
                  <ThemedView style={styles.optionTextContainer} colorType="card">
                    <ThemedText type="defaultSemiBold" style={styles.optionLabel}>{option.label}</ThemedText>
                    <ThemedText type="default" colorType="textMuted" style={styles.optionDesc}>
                      {option.description}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                {isSelected && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  optionsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
