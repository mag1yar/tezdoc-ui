import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useResizeObserver } from '@mantine/hooks';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

interface OverflowProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  renderOverflowItem?: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  /**
   * Optional manual override for visible count (disables auto-calculation if set)
   */
  buffer?: number;
  maxItems?: number;
}

export function Overflow<T>({
  items,
  renderItem,
  renderOverflowItem,
  keyExtractor,
  className,
  maxItems: manualMaxItems,
  buffer = 0,
}: OverflowProps<T>) {
  const [containerRef, rect] = useResizeObserver();
  const hiddenContainerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(items.length);
  const [isCalculated, setIsCalculated] = React.useState(false);

  React.useLayoutEffect(() => {
    if (manualMaxItems !== undefined) {
      setVisibleCount(manualMaxItems);
      setIsCalculated(true);
      return;
    }

    if (!rect.width || !hiddenContainerRef.current) return;

    const containerWidth = rect.width;
    const hiddenItems = Array.from(hiddenContainerRef.current.children) as HTMLElement[];
    // The last child is the trigger button
    const triggerBtn = hiddenItems[hiddenItems.length - 1];
    const triggerWidth = triggerBtn?.getBoundingClientRect().width || 40; // fallback width

    const gap = parseFloat(getComputedStyle(hiddenContainerRef.current).gap || '0');

    // Calculate total width needed for all items
    let totalWidthNeeded = 0;
    for (let i = 0; i < items.length; i++) {
      totalWidthNeeded += (hiddenItems[i]?.getBoundingClientRect().width || 0) + (i > 0 ? gap : 0);
    }

    // Check if everything fits within container minus buffer
    if (totalWidthNeeded <= containerWidth - buffer) {
      setVisibleCount(items.length);
    } else {
      // Must show trigger - fit as many items as possible
      const availableSpace = containerWidth - triggerWidth - gap - buffer;
      let used = 0;
      let fits = 0;
      for (let i = 0; i < items.length; i++) {
        const w = hiddenItems[i]?.getBoundingClientRect().width || 0;
        const effectiveW = w + (i > 0 ? gap : 0);
        if (used + effectiveW <= availableSpace) {
          used += effectiveW;
          fits++;
        } else {
          break;
        }
      }
      setVisibleCount(Math.max(0, fits));
    }
    setIsCalculated(true);
  }, [rect.width, items, manualMaxItems, buffer]);

  // Slices
  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  // Helper to render
  const renderItemContent = (item: T) => renderItem(item);
  const renderOverflowContent = (item: T) =>
    renderOverflowItem ? renderOverflowItem(item) : renderItem(item);

  return (
    <>
      {/* Hidden Measurement Layer */}
      {manualMaxItems === undefined && (
        <div
          ref={hiddenContainerRef}
          className={cn(
            className,
            'fixed top-0 left-0 opacity-0 pointer-events-none w-max flex flex-nowrap invisible',
          )}
          aria-hidden="true">
          {items.map((item) => (
            <div key={keyExtractor(item)}>{renderItemContent(item)}</div>
          ))}
          {/* Trigger measurement */}
          <div className="flex items-center justify-center p-2">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Real Render Layer */}
      <div
        ref={containerRef}
        className={cn('flex flex-nowrap items-center w-full min-w-0', className)}>
        {manualMaxItems !== undefined || isCalculated ? (
          <>
            {visibleItems.map((item) => (
              <div key={keyExtractor(item)} className="shrink-0">
                {renderItemContent(item)}
              </div>
            ))}

            {overflowItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowItems.map((item) => (
                    <React.Fragment key={keyExtractor(item)}>
                      {renderOverflowContent(item)}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : (
          // Initial render state: render nothing or loading to prevent flash?
          // Or render one item to hold height?
          // Rendering nothing might collapse height.
          // Let's render transparently or fully to initialize?
          // If we render fully, it might overflow ugly.
          // Render nothing to be safe until calc is done.
          <div className="w-full h-8" />
        )}
      </div>
    </>
  );
}
