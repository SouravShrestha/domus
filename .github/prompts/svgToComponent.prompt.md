# SVG to Icon Component

Convert SVG files into React Native icon components.

## Naming Convention

Convert the SVG filename to PascalCase and append `Icon`:
- `paper-plane.svg` → `PaperPlaneIcon`
- `arrow_left.svg` → `ArrowLeftIcon`

## Component Template

Create `src/components/icons/[IconName]Icon.tsx`:

```tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

const [IconName]Icon: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "black" }) => (
  <Svg width={width} height={height} viewBox="[original viewBox]" fill="none">
    <Path d="[path data]" fill={color} />
  </Svg>
);

export default [IconName]Icon;
```

## Export

Add to `src/components/icons/index.tsx` in alphabetical order:

```tsx
export { default as [IconName]Icon } from "./[IconName]Icon";
```

## Checklist

1. Create component file with correct naming
2. Preserve original `viewBox` from SVG
3. Convert all `<path>` elements to `<Path>` components with `fill={color}`
4. Export from index file alphabetically
5. Verify no linter errors

