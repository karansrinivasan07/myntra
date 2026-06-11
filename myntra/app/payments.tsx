import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Plus, Shield } from 'lucide-react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useTheme } from '@/src/theme';

export default function PaymentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [cards, setCards] = useState([
    {
      id: '1',
      bank: 'HDFC Bank Credit Card',
      number: '•••• •••• •••• 4321',
      expiry: '09/29',
      holder: 'KARAN KUMAR',
    },
    {
      id: '2',
      bank: 'ICICI Bank Debit Card',
      number: '•••• •••• •••• 8765',
      expiry: '12/27',
      holder: 'KARAN KUMAR',
    },
  ]);

  return (
    <ThemedView style={styles.container} colorType="background">
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: theme.colors.border }]} colorType="background">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Payment Methods</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Secure badge */}
        <ThemedView style={[styles.securityBadge, { backgroundColor: theme.colors.surface }]} colorType="surface">
          <Shield size={18} color={theme.colors.success} />
          <ThemedText style={styles.securityText} type="defaultSemiBold" colorType="textMuted">
            Your payment details are secured with 256-bit encryption
          </ThemedText>
        </ThemedView>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Saved Cards</ThemedText>

        {cards.map((card) => (
          <ThemedView
            key={card.id}
            style={[styles.cardContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            colorType="card"
          >
            <ThemedView style={styles.cardHeader} colorType="card">
              <CreditCard size={24} color={theme.colors.primary} />
              <ThemedText type="defaultSemiBold" style={styles.bankText}>{card.bank}</ThemedText>
            </ThemedView>

            <ThemedText type="title" style={styles.cardNumber}>{card.number}</ThemedText>

            <ThemedView style={styles.cardDetails} colorType="card">
              <ThemedView colorType="card">
                <ThemedText type="default" colorType="textMuted" style={styles.detailsLabel}>CARDHOLDER</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.detailsValue}>{card.holder}</ThemedText>
              </ThemedView>
              <ThemedView colorType="card" style={{ alignItems: 'flex-end' }}>
                <ThemedText type="default" colorType="textMuted" style={styles.detailsLabel}>EXPIRES</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.detailsValue}>{card.expiry}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}

        <ThemedButton
          title="Add New Card"
          onPress={() => alert('Add Payment Card flow is coming soon!')}
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankText: {
    marginLeft: 10,
    fontSize: 15,
  },
  cardNumber: {
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 13,
  },
  addButton: {
    marginTop: 8,
  },
});
