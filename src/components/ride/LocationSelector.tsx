import { StyleSheet, Text, TouchableOpacity, View, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { Icon } from '../ui/icon'
import { XIcon, PlusIcon, ArrowDownUpIcon } from 'lucide-react-native'
import { Ionicons } from '@expo/vector-icons';

interface LocationSelectorProps {
    onCancel: () => void;
    onSelectPickupLocation: (location: string) => void;
    onSelectDestination: (location: string) => void;
}

const LocationSelector = ({ onCancel, onSelectPickupLocation, onSelectDestination }: LocationSelectorProps) => {
    const [pickupText, setPickupText] = useState('');
    const [destinationText, setDestinationText] = useState('');
    const [focusedField, setFocusedField] = useState<'pickup' | 'destination' | null>(null);

    const handlePickupSubmit = () => {
        if (pickupText.trim()) {
            onSelectPickupLocation(pickupText);
        }
    };

    const handleDestinationSubmit = () => {
        if (destinationText.trim()) {
            onSelectDestination(destinationText);
        }
    };

    return (
        <View className="flex-1 ">
            {/* Header */}
            <View className="flex-row items-center justify-between p-2 border-b border-gray-100 dark:border-neutral-950">
                <Text className="text-xl font-medium text-gray-900 dark:text-gray-100 font-anuphan-semibold">
                    เลือกตำแหน่ง
                </Text>
                <TouchableOpacity onPress={onCancel} className="p-0">
                    <Icon as={XIcon} className="size-5 text-gray-500" />
                </TouchableOpacity>
            </View>

            {/* Location Inputs */}
            <View className=" flex flex-col gap-1">
                {/* Pickup Location */}
                <View className={`flex-row items-center bg-gray-50 dark:bg-neutral-900 rounded-lg p-1  ${focusedField === 'pickup'
                    ? 'border-gray-900 dark:border-gray-100'
                    : 'border-gray-200 dark:border-gray-800'
                    }`}>
                    <View className='w-10 h-10  bg-green-100 dark:bg-green-900 rounded-lg items-center justify-center mr-2'>
                        <View className="w-6 h-6 bg-gray-100 dark:bg-green-950 rounded-full items-center justify-center">
                            <View className="w-4 h-4 bg-green-500 rounded-full" />
                        </View>
                    </View>
                    <TextInput
                        value={pickupText}
                        onChangeText={setPickupText}
                        onFocus={() => setFocusedField('pickup')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="ค้นหาจุดรับ..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-normal font-anuphan"
                        returnKeyType="search"
                    />
                    {pickupText.length > 0 && (
                        <TouchableOpacity onPress={() => setPickupText('')} className="p-1">
                            <Icon as={XIcon} className="size-4 text-gray-400" />
                        </TouchableOpacity>
                    )}

                    <View className='flex flex-row items-center justify-start gap-1'>
                        <TouchableOpacity
                            onPress={handlePickupSubmit}
                            className='w-10 h-10 bg-green-100/40 dark:bg-green-900/40 rounded-lg items-center justify-center'>
                            <Image source={{ uri: "https://img.icons8.com/deco-glyph/48/40C057/map-marker.png" }} className="size-6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='w-10 h-10 rounded-lg bg-slate-50 dark:bg-neutral-900 flex items-center justify-center'>
                            <Icon as={PlusIcon} className='size-6 text-white' />
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Destination */}
                <View className="flex flex-col gap-0.5">
                    <View className={`flex-row items-center bg-gray-50 dark:bg-neutral-900 rounded-lg p-1  ${focusedField === 'destination'
                        ? 'border-gray-900 dark:border-gray-100'
                        : 'border-gray-200 dark:border-gray-800'
                        }`}>
                        <View className='w-10 h-10  bg-indigo-100 dark:bg-indigo-900 rounded-lg items-center justify-center mr-2'>
                            <View className="w-6 h-6 bg-gray-100 dark:bg-indigo-950 rounded-full items-center justify-center">
                                <View className="w-4 h-4 bg-indigo-500 rounded-full" />
                            </View>
                        </View>
                        <TextInput
                            value={destinationText}
                            onChangeText={setDestinationText}
                            onFocus={() => setFocusedField('destination')}
                            onBlur={() => setFocusedField(null)}
                            onSubmitEditing={handleDestinationSubmit}
                            placeholder="ค้นหาปลายทาง..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-normal font-anuphan"
                            returnKeyType="search"
                        />
                        {destinationText.length > 0 && (
                            <TouchableOpacity onPress={() => setDestinationText('')} className="p-1">
                                <Icon as={XIcon} className="size-4 text-gray-400" />
                            </TouchableOpacity>
                        )}
                        <View className='flex flex-row items-center justify-start gap-1'>
                            <TouchableOpacity
                                onPress={handleDestinationSubmit}
                                className='w-10 h-10 bg-indigo-100/40 dark:bg-indigo-900/40 rounded-lg items-center justify-center'>
                                <Image source={{ uri: "https://img.icons8.com/deco-glyph/48/7950F2/map-marker.png" }} className="size-6" />

                            </TouchableOpacity>
                            <TouchableOpacity
                                className='w-10 h-10 rounded-lg bg-slate-50 dark:bg-neutral-900 flex items-center justify-center'>
                                <Icon as={ArrowDownUpIcon} className='size-6 text-white' />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

        </View>
    )
}

export default LocationSelector