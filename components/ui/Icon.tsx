import { CircleHelp } from "lucide-react-native";
import * as icons from "lucide-react-native/icons";

export type IconName = keyof typeof icons;

interface IconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

export function Icon({
  name,
  color,
  size = 24,
  className,
}: IconProps) {
  const LucideIcon = icons[name as IconName];

  if (!LucideIcon) {
    return (
      <CircleHelp
        color={color}
        size={size}
        className={className}
      />
    );
  }

  return (
    <LucideIcon
      color={color}
      size={size}
      className={className}
    />
  );
}