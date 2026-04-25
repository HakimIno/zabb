import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import type React from 'react';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectItem {
  id: string;
  label: string;
  value: any;
  subtitle?: string;
  icon?: string;
}

interface BottomSheetSelectProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  handleSheetChanges: (index: number) => void;
  title: string;
  data: SelectItem[];
  onSelect: (item: SelectItem) => void;
  selectedValue?: any;
  searchable?: boolean;
  snapPoints: string[];
}

const BottomSheetSelect = ({
  bottomSheetRef,
  handleSheetChanges,
  title,
  data,
  onSelect,
  selectedValue,
  searchable = false,
  snapPoints,
}: BottomSheetSelectProps) => {
  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, [bottomSheetRef]);

  const handleItemSelect = useCallback(
    (item: SelectItem) => {
      onSelect(item);
      handleClose();
    },
    [onSelect, handleClose]
  );

  const renderItem = useCallback(
    ({ item }: { item: SelectItem }) => {
      const isSelected = selectedValue && item.value === selectedValue;

      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.itemContainer, isSelected && styles.selectedItem]}
            onPress={() => handleItemSelect(item)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              {item.icon && <Text style={styles.itemIcon}>{item.icon}</Text>}
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemLabel, isSelected && styles.selectedItemText]}>
                  {item.label}
                </Text>
                {item.subtitle && (
                  <Text style={[styles.itemSubtitle, isSelected && styles.selectedItemSubtitle]}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [selectedValue, handleItemSelect]
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
    ),
    [title, handleClose]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
    >
      <BottomSheetFlatList
        data={data}
        keyExtractor={(item: SelectItem) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: '#000000',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 1,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  selectedItemText: {
    color: '#000000',
    fontWeight: '600',
  },
  selectedItemSubtitle: {
    color: '#000000',
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomSheetSelect;
