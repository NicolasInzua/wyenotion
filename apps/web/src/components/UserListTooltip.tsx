import {
  shift,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useState } from 'react';

interface UserCounterProps {
  userNames: string[];
}

export function UserListTooltip({ userNames }: UserCounterProps) {
  const usersCount = userNames.length;

  const [isOpen, setIsOpen] = useState(false);
  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [shift()],
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <div
        ref={refs.setReference}
        className="text-sm text-gray-500 font-medium cursor-default"
        {...getReferenceProps()}
      >
        Current Users: {usersCount}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-10 p-2 shadow border border-stone-200 bg-white rounded-lg"
        >
          <ul>
            {userNames.map((user, index) => (
              <li key={index} className="text-xs">
                {user}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
