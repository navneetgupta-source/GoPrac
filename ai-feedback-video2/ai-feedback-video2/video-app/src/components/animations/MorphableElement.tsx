import { CSSProperties, ReactNode } from 'react';

type MorphableElementProps = {
  elementId: string;
  baseStyle?: CSSProperties;
  children: ReactNode;
};

/**
 * Simple wrapper for elements - morph feature temporarily disabled for refinement
 */
export const MorphableElement: React.FC<MorphableElementProps> = ({
  elementId,
  baseStyle = {},
  children,
}) => {
  return (
    <div data-morph-id={elementId} style={baseStyle}>
      {children}
    </div>
  );
};
