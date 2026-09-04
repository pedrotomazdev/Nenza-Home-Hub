import { useState } from "react";
import { KeyboardTypeOptions, TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { Colors } from "theme/colors";
import { Icon } from "./Icon";

interface AppInputProps {
    label?: string;
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    icon?: string;
    autoFocus?: boolean;
}

export function AppInput({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    editable = true,
    multiline = false,
    numberOfLines = 1,
    icon,
    autoFocus = false,
}: AppInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className="w-full">
            {label && (
                <AppText className="mb-1.5 text-xs font-body-medium" style={{ color: Colors.textSecondary }}>
                    {label}
                </AppText>
            )}
            <View
                className="w-full rounded-xl border flex-row items-center transition-all overflow-hidden"
                style={{
                    backgroundColor: Colors.background,
                    borderColor: isFocused ? Colors.primary : Colors.border + "44",
                    minHeight: multiline ? 90 : 46,
                }}
            >
                {icon && (
                    <View className="pl-3.5 pr-1 items-center justify-center">
                        <Icon
                            name={icon}
                            color={isFocused ? Colors.primary : Colors.textSecondary}
                            size={18}
                        />
                    </View>
                )}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary + "88"}
                    className={`flex-1 py-2.5 font-body text-sm ${icon ? "pl-2 pr-4" : "px-4"}`}
                    style={{
                        color: Colors.textPrimary,
                        textAlignVertical: multiline ? "top" : "center",
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus={autoFocus}
                />
            </View>
        </View>
    );
}