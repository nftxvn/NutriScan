import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  isDestructive = false, // defaults to false for Log Out
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <TouchableOpacity 
           style={styles.backdrop} 
           activeOpacity={1} 
           onPress={onCancel}
        />
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.textCancel}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                isDestructive ? styles.buttonDestructive : styles.buttonNeutral
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.textConfirm, isDestructive && { color: 'white' }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: Math.min(width * 0.85, 400),
    backgroundColor: '#1C1C1E', // Dark mode background
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
  },
  modalMessage: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    color: '#A0A0A0', // Muted text for description
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: '#2C2C2E',
  },
  buttonDestructive: {
    backgroundColor: '#EF4444', // Red for delete
  },
  buttonNeutral: {
    backgroundColor: '#d3f660', // Theme color (lime) for logout
  },
  textCancel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  textConfirm: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
