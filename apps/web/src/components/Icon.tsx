import { icons } from 'lucide-react';

type LucideIconName = keyof typeof icons;

type IconName = Extract<
  LucideIconName,
  'Bold' | 'Italic' | 'Strikethrough' | 'Underline'
>;

const Icon = ({ name, ...props }: { name: IconName }) => {
  const IconComponent = icons[name];
  return <IconComponent {...props} />;
};

export { Icon };
export type { IconName };
