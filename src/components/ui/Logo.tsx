import { View, Text, Image } from 'react-native';
import { useIsDark } from '~/hooks/useTheme';

const ICON = require('../../../assets/images/icon.png');

type LogoSize = 'small' | 'medium' | 'large';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  opacity?: number;
}

const CONFIG = {
  small:  { img: 28, radius: 7,  text: 15, gap: 8 },
  medium: { img: 52, radius: 13, text: 22, gap: 10 },
  large:  { img: 88, radius: 20, text: 36, gap: 14 },
};

export default function Logo({ size = 'medium', showText = true, opacity = 1 }: LogoProps) {
  const isDark = useIsDark();
  const c = CONFIG[size];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: c.gap, opacity }}>
      <Image
        source={ICON}
        style={{ width: c.img, height: c.img, borderRadius: c.radius }}
      />
      {showText && (
        <Text style={{
          fontSize: c.text,
          fontWeight: '800',
          letterSpacing: -0.3,
          color: isDark ? '#F5F5F5' : '#1A1A1A',
        }}>
          Nearday
        </Text>
      )}
    </View>
  );
}
