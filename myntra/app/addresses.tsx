import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useTheme } from '@/src/theme';

export default function AddressesScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [addresses, setAddresses] = useState([
    {
      id: '1',
      tag: 'Home',
      name: 'Karan Kumar',
      addressLine: '123, Fashion Street, Sector 4',
      cityState: 'New Delhi, Delhi - 110001',
      phone: '9876543210',
      isDefault: true,
    },
    {
      id: '2',
      tag: 'Office',
      name: 'Karan Kumar',
      addressLine: 'Tech Park, Tower B, Phase 2',
      cityState: 'Bangalore, Karnataka - 560001',
      phone: '9876543211',
      isDefault: false,
    },
  ]);

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <ThemedView style={styles.container} colorType="background">
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: theme.colors.border }]} colorType="background">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Saved Addresses</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content}>
        {addresses.map((address) => (
          <ThemedView
            key={address.id}
            style={[styles.addressCard, { borderColor: theme.colors.border }]}
            colorType="card"
          >
            <ThemedView style={styles.cardHeader} colorType="card">
              <ThemedView style={styles.tagContainer} colorType="surface">
                <ThemedText style={styles.tagText} type="defaultSemiBold">{address.tag}</ThemedText>
              </ThemedView>
              {address.isDefault && (
                <ThemedText style={{ color: theme.colors.primary, fontSize: 12 }} type="defaultSemiBold">
                  DEFAULT
                </ThemedText>
              )}
            </ThemedView>

            <ThemedText type="defaultSemiBold" style={styles.nameText}>{address.name}</ThemedText>
            <ThemedText type="default" colorType="textMuted" style={styles.addressText}>
              {address.addressLine}
            </ThemedText>
            <ThemedText type="default" colorType="textMuted" style={styles.addressText}>
              {address.cityState}
            </ThemedText>
            <ThemedText type="default" colorType="textMuted" style={styles.phoneText}>
              Mobile: {address.phone}
            </ThemedText>

            <ThemedView style={[styles.cardFooter, { borderTopColor: theme.colors.border }]} colorType="card">
              <TouchableOpacity onPress={() => handleDelete(address.id)} style={styles.actionButton}>
                <Trash2 size={16} color={theme.colors.error} />
                <ThemedText type="defaultSemiBold" style={[styles.actionText, { color: theme.colors.error }]}>
                  Remove
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ))}

        <ThemedButton
          title="Add New Address"
          onPress={() => alert('Add Address flow is coming soon!')}
          style={styles.addButton}
        />
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
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
  },
  nameText: {
    fontSize: 15,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 14,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
  },
  addButton: {
    marginTop: 8,
  },
});
