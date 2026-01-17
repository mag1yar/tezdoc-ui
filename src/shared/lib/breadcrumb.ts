import { useMemo, useState, useEffect } from 'react';
import { useMatches } from '@tanstack/react-router';
import { useResizeObserver } from '@mantine/hooks';

/**
 * Siblings navigation for current page (e.g., switching between /qr/url and /qr/text)
 */
export interface BreadcrumbSibling {
  /**
   * Display label
   */
  label: string;

  /**
   * Route path
   */
  path: string;

  /**
   * Optional description for dropdown
   */
  description?: string;
}

/**
 * Processed breadcrumb item ready for rendering
 */
export interface BreadcrumbItem {
  /**
   * Unique route ID
   */
  routeId: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Route pathname
   */
  pathname: string;

  /**
   * Siblings for this breadcrumb item
   */
  siblings: BreadcrumbSibling[];

  /**
   * Whether this is the last (current) item
   */
  isLast: boolean;
}

/**
 * Item with measured width for adaptive calculation
 */
export interface MeasuredBreadcrumbItem extends BreadcrumbItem {
  /**
   * Measured width of the rendered item in pixels
   */
  width: number;
}

/**
 * Breadcrumb hook return value
 */
export interface UseBreadcrumbReturn {
  /**
   * All breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Visible items after applying adaptive logic
   */
  visibleItems: BreadcrumbItem[];

  /**
   * Hidden items (shown in ellipsis dropdown)
   */
  hiddenItems: BreadcrumbItem[];

  /**
   * Whether breadcrumb should be shown
   */
  shouldShow: boolean;

  /**
   * Ref object for container (Breadcrumb.List) measurement
   */
  containerRef: React.RefObject<HTMLOListElement>;
}

/**
 * Loader data for breadcrumb
 */
export interface BreadcrumbLoaderData {
  /**
   * Breadcrumb configuration
   */
  breadcrumb?: {
    /**
     * Display label (can be dynamic from server)
     */
    title: string;

    /**
     * Custom path override
     */
    path?: string;

    /**
     * Siblings for navigation dropdown
     */
    siblings?: BreadcrumbSibling[];
  };
}

// Module augmentation removed - we now use loader instead of staticData

/**
 * Hook to generate breadcrumb items from TanStack Router matches
 * with adaptive visibility based on available width (VS Code-like behavior)
 */
export function useBreadcrumb(): UseBreadcrumbReturn {
  const matches = useMatches();
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);

  // Extract breadcrumb items from route matches
  const items = useMemo<BreadcrumbItem[]>(() => {
    const breadcrumbMatches: BreadcrumbItem[] = [];

    matches.forEach((match) => {
      console.log('Match loaderData:', match.routeId, match.loaderData);
      const breadcrumb = match.loaderData?.breadcrumb;

      if (breadcrumb) {
        breadcrumbMatches.push({
          routeId: match.routeId,
          label: breadcrumb.title,
          pathname: breadcrumb.path ?? match.pathname,
          siblings: breadcrumb.siblings || [],
          isLast: false,
        });
      }
    });

    // Deduplicate by pathname (keep first occurrence)
    const deduplicated: BreadcrumbItem[] = [];
    const seenPaths = new Set<string>();

    breadcrumbMatches.forEach((item) => {
      if (!seenPaths.has(item.pathname)) {
        seenPaths.add(item.pathname);
        deduplicated.push(item);
      }
    });

    // Update isLast flags
    deduplicated.forEach((item, index) => {
      item.isLast = index === deduplicated.length - 1;
    });

    return deduplicated;
  }, [matches]);

  // Measure container (Breadcrumb.List) width with ResizeObserver
  const [containerRef, containerRect] = useResizeObserver<HTMLOListElement>();

  // Update container width when rect changes
  useEffect(() => {
    if (containerRect.width) {
      setContainerWidth(containerRect.width);
    }
  }, [containerRect.width]);

  // Measure items width when they mount/change
  useEffect(() => {
    if (!containerRef.current) return;

    const measureItems = () => {
      const container = containerRef.current;
      if (!container) return;

      const itemElements = container.querySelectorAll('[data-breadcrumb-item]');
      const widths: number[] = [];

      itemElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        widths.push(rect.width);
      });

      setItemWidths(widths);
    };

    // Measure after DOM updates
    const timer = setTimeout(measureItems, 0);
    return () => clearTimeout(timer);
  }, [items, containerRef]);

  // Calculate visible and hidden items based on available width
  const { visibleItems, hiddenItems } = useMemo(() => {
    if (items.length === 0) {
      return { visibleItems: [], hiddenItems: [] };
    }

    // Always show last item (current page)
    if (items.length === 1) {
      return { visibleItems: items, hiddenItems: [] };
    }

    // Before measurement, show all items to prevent layout shift
    if (containerWidth === 0 || itemWidths.length === 0) {
      return { visibleItems: items, hiddenItems: [] };
    }

    // Calculate total width with separator spacing
    // Use generous values to hide items early and prevent wrapping
    const SEPARATOR_WIDTH = 24; // Gap between items
    const ELLIPSIS_WIDTH = 64; // "..." button width
    const SAFETY_BUFFER = 100; // Large buffer to prevent wrapping - hide items early!

    let totalWidth = SAFETY_BUFFER;
    const measuredItems: MeasuredBreadcrumbItem[] = items.map((item, index) => ({
      ...item,
      width: itemWidths[index] || 0,
    }));

    // Always reserve space for the last item
    const lastItem = measuredItems[measuredItems.length - 1];
    totalWidth += lastItem.width;

    // Try to fit items from right to left (starting from second-to-last)
    const visible: BreadcrumbItem[] = [lastItem];
    const hidden: BreadcrumbItem[] = [];

    for (let i = measuredItems.length - 2; i >= 0; i--) {
      const item = measuredItems[i];
      const itemWithSeparator = item.width + SEPARATOR_WIDTH;

      // Check if adding this item would exceed container width
      // If we have hidden items, account for ellipsis button
      const requiredWidth =
        totalWidth + itemWithSeparator + (hidden.length > 0 ? ELLIPSIS_WIDTH + SEPARATOR_WIDTH : 0);

      if (requiredWidth <= containerWidth) {
        visible.unshift(item);
        totalWidth += itemWithSeparator;
      } else {
        hidden.unshift(item);
      }
    }

    return { visibleItems: visible, hiddenItems: hidden };
  }, [items, containerWidth, itemWidths]);

  // Should show breadcrumb
  const shouldShow = useMemo(() => {
    return items.length >= 1;
  }, [items]);

  return {
    items,
    visibleItems,
    hiddenItems,
    shouldShow,
    containerRef,
  };
}
