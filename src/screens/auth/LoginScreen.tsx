import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/src/components/ui/button';
import { Text as UIText } from '@/src/components/ui/text';
import { Icon } from '@/src/components/ui/icon';
import { useAuth } from '@/src/hooks/useAuth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULT_COUNTRY, Country, COUNTRIES } from '@/src/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetSelect from '@/src/components/common/bottom-sheet-select';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOTP } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('BottomSheet index changed to:', index);
  }, []);

  const handleCountrySelect = useCallback((item: any) => {
    setSelectedCountry(item.value);
  }, []);

  // Transform countries data for BottomSheetSelect
  const countryData = useMemo(() => {
    return COUNTRIES.map(country => ({
      id: country.code,
      label: country.name,
      value: country,
      subtitle: country.dialCode,
      icon: country.flag,
    }));
  }, []);
  const handlePhoneLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกเบอร์มือถือ');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/\s/g, '')}`;

    const phonePattern = new RegExp(`^\\${selectedCountry.dialCode}[0-9]{8,12}$`);
    if (!phonePattern.test(fullPhoneNumber)) {
      Alert.alert('ข้อผิดพลาด', ERROR_MESSAGES.INVALID_PHONE);
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOTP(fullPhoneNumber);
      if (result.success) {
        Alert.alert('สำเร็จ', SUCCESS_MESSAGES.OTP_SENT);
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implement Google login
    Alert.alert('ข้อมูล', 'Google Login จะเปิดใช้งานเร็วๆ นี้');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6">
            {/* Phone Login Form */}
            <UIText className="text-sm text-foreground mb-2 mx-1 font-anuphan-medium">
              กรอกเบอร์โทรศัพท์ของคุณ
            </UIText>
            <View className="mb-6">


              {/* Phone Number Input */}
              <View className="flex-row items-center border border-border rounded-lg bg-background">
                <TouchableOpacity
                  className="flex-row items-center px-3  border-r border-border"
                  onPress={() => bottomSheetRef.current?.expand()}
                >
                  <UIText className="text-xl mr-2 font-anuphan">{selectedCountry.flag}</UIText>
                  <UIText className="text-muted-foreground text-sm font-anuphan">
                    {selectedCountry.dialCode}
                  </UIText>
                </TouchableOpacity>
                <TextInput
                  className="flex-1 py-3 px-3 text-foreground"
                  placeholder={selectedCountry.code === 'TH' ? "8X-XXX-XXXX" : "XXXXXXXXXX"}
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              <Button
                className="mt-4"
                onPress={handlePhoneLogin}
                disabled={isLoading}
              >
                <Ionicons name="chatbubble-ellipses" size={20} className=" mr-2" color="#fff" />
                <UIText className="text-primary-foreground font-anuphan-medium">
                  {isLoading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
                </UIText>
              </Button>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-3">
              <View className="flex-1 h-px bg-border" />
              <UIText className="px-4 text-muted-foreground text-xs font-anuphan">
                หรือ
              </UIText>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Login */}
            <Button
              variant="outline"
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className="mb-2"
            >
              <Ionicons name="logo-google" size={20} color="#000" />
              <UIText className="text-foreground font-anuphan-medium">
                เข้าสู่ระบบด้วย Google
              </UIText>
            </Button>

            {/* Terms */}
            <View className="mt-12">
              <UIText className="text-xs text-muted-foreground text-center leading-5 font-anuphan">
                การเข้าสู่ระบบแสดงว่าคุณยอมรับ{' '}
                <UIText className="text-primary underline text-xs font-anuphan">
                  ข้อกำหนดการใช้งาน
                </UIText>
                {' '}และ{' '}
                <UIText className="text-primary underline text-xs font-anuphan">
                  นโยบายความเป็นส่วนตัว
                </UIText>
              </UIText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BottomSheet Component */}
      <BottomSheetSelect
        bottomSheetRef={bottomSheetRef}
        handleSheetChanges={handleSheetChanges}
        title="เลือกประเทศ"
        data={countryData}
        onSelect={handleCountrySelect}
        selectedValue={selectedCountry}
        snapPoints={['100%']}
      />
    </SafeAreaView>
  );
}
