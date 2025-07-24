import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface BaseScreenProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCredit?: boolean;
}

export const BaseScreen: React.FC<BaseScreenProps> = ({ title, subtitle, children, showCredit = true }) => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  >
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}
      {subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
      <View style={styles.contentBox}>{children}</View>
    </ScrollView>
    {showCredit && (
      <View style={styles.creditoBox}>
        <Text style={styles.creditoText}>Desenvolvido por Luis Eduardo Rodrigues Royo</Text>
      </View>
    )}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#003c3c',
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  creditoBox: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  creditoText: {
    color: '#ccc',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
}); 