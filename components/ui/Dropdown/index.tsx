// components/ui/Dropdown.tsx
import React, { createContext, ReactNode, useContext, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { AppText } from "../AppText";
import { Colors } from "theme/colors";
import { Icon } from "../Icon";

type Position = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type DropdownContextType = {
    isOpen: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
    triggerPosition: Position | null;
    triggerRef: React.RefObject<View | null>;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

function useDropdown() {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error("Componentes do Dropdown devem ser usados dentro de <DropdownMenu />");
    }
    return context;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
    const triggerRef = useRef<View>(null);

    const toggleMenu = () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        requestAnimationFrame(() => {
            triggerRef.current?.measureInWindow((x, y, width, height) => {
                if (x === undefined || y === undefined) return;

                setTriggerPosition({ x, y, width, height });
                setIsOpen(true);
            });
        });
    };

    const closeMenu = () => setIsOpen(false);

    return (
        <DropdownContext.Provider
            value={{ isOpen, toggleMenu, closeMenu, triggerPosition, triggerRef }}
        >
            <View>{children}</View>
        </DropdownContext.Provider>
    );
}

export function DropdownTrigger({ children, type }: { children?: ReactNode; type?: string }) {
    const { toggleMenu, triggerRef } = useDropdown();

    const isButton = type === "button";
    const isElement = type === "element";

    return (
        <View ref={triggerRef} collapsable={false} className="rounded-xl overflow-hidden">
            <Pressable
                onPress={toggleMenu}
                className={
                    isElement
                        ? ""
                        : isButton
                            ? "flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                            : "p-2 rounded-lg items-center justify-center active:bg-white/5"
                }
                android_ripple={isElement ? undefined : { color: Colors.primary + "25" }}
                style={{ backgroundColor: isButton ? Colors.primary : "transparent" }}
            >
                {isElement ? (
                    children
                ) : isButton ? (
                    <AppText className="text-xs font-body-bold" variant="button">
                        Gerenciar
                    </AppText>
                ) : (
                    children || <Icon name="EllipsisVertical" size={18} color={Colors.textSecondary} />
                )}
            </Pressable>
        </View>
    );
}

export function DropdownContent({ children, width = 190 }: { children: ReactNode; width?: number }) {
    const { isOpen, closeMenu, triggerPosition } = useDropdown();

    if (!isOpen || !triggerPosition) {
        return null;
    }

    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    const isRightAligned = triggerPosition.x + width > screenWidth - 16;
    const left = isRightAligned
        ? Math.max(16, triggerPosition.x + triggerPosition.width - width)
        : Math.max(16, triggerPosition.x);

    let top = triggerPosition.y + triggerPosition.height + 8;
    const estimatedHeight = 150;
    if (top + estimatedHeight > screenHeight - 20) {
        top = Math.max(20, triggerPosition.y - estimatedHeight - 8);
    }

    return (
        <Modal
            transparent={true}
            visible={isOpen}
            animationType="fade"
            onRequestClose={closeMenu}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={closeMenu}>
                <View style={StyleSheet.absoluteFill} className="bg-black/40">
                    <TouchableWithoutFeedback>
                        <View
                            className="absolute rounded-2xl p-1.5 border shadow-2xl"
                            style={{
                                top,
                                left,
                                width,
                                backgroundColor: Colors.surfaceContainerHigh,
                                borderColor: Colors.border + "66",
                                elevation: 12,
                                zIndex: 9999,
                            }}
                        >
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

export function DropdownItem({
    children,
    onPress,
    icon,
    destructive,
}: {
    children: ReactNode;
    onPress: () => void;
    icon?: string;
    destructive?: boolean;
}) {
    const { closeMenu } = useDropdown();

    const handlePress = () => {
        closeMenu();
        requestAnimationFrame(() => {
            onPress();
        });
    };

    const textColor = destructive ? Colors.error : Colors.textPrimary;

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center gap-2.5 px-3 py-2.5 rounded-xl active:bg-white/5"
            android_ripple={{ color: destructive ? Colors.error + "20" : Colors.primary + "20" }}
        >
            {icon && (
                <Icon
                    name={icon as any}
                    size={16}
                    color={textColor}
                />
            )}
            <AppText
                style={{ color: textColor }}
                className={`text-xs flex-1 ${destructive ? "font-body-bold" : "font-body-medium"}`}
            >
                {children}
            </AppText>
        </Pressable>
    );
}