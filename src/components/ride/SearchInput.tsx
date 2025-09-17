import React from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import { Icon } from '../ui/icon';
import { XIcon, PlusIcon, ArrowDownUpIcon } from 'lucide-react-native';

type FieldType = 'pickup' | 'destination';

interface SearchInputProps {
    fieldType: FieldType;
    value: string;
    isFocused: boolean;
    placeholder: string;
    iconComponent: React.ReactNode;
    iconColor: string;
    iconUri: string;
    onTextChange: (text: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    onSubmit: () => void;
    onClear: () => void;
}

const SearchInput = React.memo<SearchInputProps>(({
    fieldType,
    value,
    isFocused,
    placeholder,
    iconComponent,
    iconColor,
    iconUri,
    onTextChange,
    onFocus,
    onBlur,
    onSubmit,
    onClear,
}) => {
    return (
        <View className="flex-row items-center gap-1.5">
            <View className={`flex-1 flex-row items-center bg-slate-100 dark:bg-neutral-900 rounded-lg p-0.5 ${
                isFocused ? 'border-gray-900 dark:border-gray-100' : 'border-gray-200 dark:border-gray-800'
            }`}>
                {iconComponent}
                <TextInput
                    value={value}
                    onChangeText={onTextChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onSubmitEditing={onSubmit}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-normal font-anuphan"
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={onClear} className="p-1">
                        <Icon as={XIcon} className="size-4 text-gray-400" />
                    </TouchableOpacity>
                )}
                {isFocused && (
                    <TouchableOpacity
                        onPress={onSubmit}
                        className={`w-8 h-8 bg-${iconColor}-100 dark:bg-${iconColor}-900/40 rounded-lg items-center justify-center mr-1`}>
                        <Image source={{ uri: iconUri }} className="size-6" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity className='w-10 h-12 flex items-center justify-center'>
                <Icon as={fieldType === 'pickup' ? PlusIcon : ArrowDownUpIcon} className='size-6 text-black dark:text-white' />
            </TouchableOpacity>
        </View>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
