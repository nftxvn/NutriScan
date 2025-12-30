import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { X, Check } from "lucide-react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
}

// Generate arrays for day, month, year
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(2000, 0, 1),
  minimumDate = new Date(1900, 0, 1),
  maximumDate = new Date(),
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Generate year range
  const years: number[] = [];
  for (let y = maximumDate.getFullYear(); y >= minimumDate.getFullYear(); y--) {
    years.push(y);
  }

  // Days in current selected month
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Reset day if it exceeds max days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth]);

  // Slide animation
  useEffect(() => {
    if (visible) {
      // Reset to initial date when opening
      setSelectedDay(initialDate.getDate());
      setSelectedMonth(initialDate.getMonth());
      setSelectedYear(initialDate.getFullYear());
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Scroll to selected items on mount
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollToIndex(dayScrollRef, selectedDay - 1);
        scrollToIndex(monthScrollRef, selectedMonth);
        const yearIndex = years.findIndex(y => y === selectedYear);
        scrollToIndex(yearScrollRef, yearIndex);
      }, 100);
    }
  }, [visible]);

  const scrollToIndex = (ref: React.RefObject<ScrollView | null>, index: number) => {
    ref.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: false,
    });
  };

  const handleScroll = (
    event: any,
    items: (number | string)[],
    setter: (val: number) => void,
    isMonth = false
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      if (isMonth) {
        setter(index);
      } else {
        setter(items[index] as number);
      }
    }
  };

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onConfirm(date);
    onClose();
  };

  const renderPickerColumn = (
    items: (number | string)[],
    selectedValue: number | string,
    scrollRef: React.RefObject<ScrollView | null>,
    onScroll: (e: any) => void,
    isMonth = false
  ) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
        >
          {items.map((item, index) => {
            const isSelected = isMonth 
              ? index === selectedValue 
              : item === selectedValue;
            return (
              <View key={index} style={styles.pickerItem}>
                <Text style={[
                  styles.pickerItemText,
                  isSelected && styles.pickerItemTextSelected,
                ]}>
                  {isMonth ? item : String(item).padStart(2, "0")}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <X size={22} color="#888" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Date of Birth</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Check size={22} color="#d3f660" />
            </TouchableOpacity>
          </View>

          {/* Selected Date Preview */}
          <Text style={styles.datePreview}>
            {selectedDay.toString().padStart(2, "0")} {MONTHS[selectedMonth]} {selectedYear}
          </Text>

          {/* Picker */}
          <View style={styles.pickerContainer}>
            {/* Selection Highlight */}
            <View style={styles.selectionHighlight} />

            {/* Day Picker */}
            {renderPickerColumn(
              days,
              selectedDay,
              dayScrollRef,
              (e) => handleScroll(e, days, setSelectedDay)
            )}

            {/* Month Picker */}
            {renderPickerColumn(
              MONTHS,
              selectedMonth,
              monthScrollRef,
              (e) => handleScroll(e, MONTHS, setSelectedMonth, true),
              true
            )}

            {/* Year Picker */}
            {renderPickerColumn(
              years,
              selectedYear,
              yearScrollRef,
              (e) => handleScroll(e, years, setSelectedYear)
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  datePreview: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d3f660",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    height: PICKER_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  selectionHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(211, 246, 96, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(211, 246, 96, 0.3)",
  },
  pickerColumn: {
    flex: 1,
    height: PICKER_HEIGHT,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 18,
    color: "#555",
    fontWeight: "500",
  },
  pickerItemTextSelected: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  confirmButton: {
    backgroundColor: "#d3f660",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
