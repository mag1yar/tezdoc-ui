import { Link } from '@tanstack/react-router';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  BreadcrumbItem as BreadcrumbItemType,
  BreadcrumbSibling,
  useBreadcrumb,
} from '@/shared/lib/breadcrumb';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './dropdown-menu';

/**
 * Smart adaptive breadcrumb component (VS Code-like behavior)
 *
 * Features:
 * - Auto-generates breadcrumbs from TanStack Router matches
 * - Adaptive hiding based on measured width (items overflow into ellipsis menu)
 * - Siblings dropdown on each breadcrumb item
 * - Submenu support for hidden items in ellipsis dropdown
 * - ResizeObserver-based responsive behavior
 */
export function SmartBreadcrumbs() {
  const { visibleItems, hiddenItems, shouldShow, containerRef } = useBreadcrumb();

  if (!shouldShow) return null;

  const hasHiddenItems = hiddenItems.length > 0;

  return (
    <div className="flex-1 min-w-0">
      <Breadcrumb>
        <BreadcrumbList ref={containerRef}>
          {/* Ellipsis dropdown for hidden items */}
          {hasHiddenItems && (
            <>
              <BreadcrumbItem data-breadcrumb-item>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 items-center justify-center gap-1 rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Show hidden breadcrumbs</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {hiddenItems.map((item) => (
                      <BreadcrumbItemWithSiblings key={item.routeId} item={item} isInEllipsis />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          {/* Visible items */}
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;

            return (
              <div key={item.routeId} className="contents">
                <BreadcrumbItem data-breadcrumb-item>
                  <BreadcrumbItemWithSiblings item={item} isLast={isLast} />
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/**
 * Breadcrumb item with siblings dropdown
 * Used both in main breadcrumb and in ellipsis submenu
 */
interface BreadcrumbItemWithSiblingsProps {
  item: BreadcrumbItemType;
  isLast?: boolean;
  isInEllipsis?: boolean;
}

function BreadcrumbItemWithSiblings({
  item,
  isLast = false,
  isInEllipsis = false,
}: BreadcrumbItemWithSiblingsProps) {
  const hasSiblings = item.siblings.length > 0;

  // Item in ellipsis dropdown
  if (isInEllipsis) {
    // Just a link (no siblings in ellipsis)
    return (
      <DropdownMenuItem asChild>
        <Link to={item.pathname} className="flex items-center gap-2">
          {item.label}
        </Link>
      </DropdownMenuItem>
    );
  }

  // Visible item - siblings dropdown ONLY on last item
  if (isLast && hasSiblings) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="group flex cursor-pointer items-center gap-1 font-normal text-foreground transition-colors hover:text-foreground/80">
          {item.label}
          <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto max-w-[90vw] sm:max-w-md">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Navigate to
          </DropdownMenuLabel>
          {item.siblings.map((sibling) => (
            <SiblingMenuItem key={sibling.path} sibling={sibling} currentPath={item.pathname} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Last item without siblings - just text
  if (isLast) {
    return (
      <span className="flex items-center gap-1 font-normal text-foreground">{item.label}</span>
    );
  }

  // All other items - regular clickable links
  return (
    <BreadcrumbLink asChild>
      <Link to={item.pathname} className="flex items-center gap-1">
        {item.label}
      </Link>
    </BreadcrumbLink>
  );
}

/**
 * Single sibling menu item
 */
interface SiblingMenuItemProps {
  sibling: BreadcrumbSibling;
  currentPath: string;
}

function SiblingMenuItem({ sibling, currentPath }: SiblingMenuItemProps) {
  // Check if this sibling belongs to the same category/section as current page
  // For example: currentPath="/converters/length" should match sibling.path="/converters/length/meters/feet"
  const isActive = sibling.path.startsWith(currentPath);

  return (
    <DropdownMenuItem key={sibling.path} asChild disabled={isActive}>
      <Link to={sibling.path} className="flex items-center gap-2" data-active={isActive}>
        <div className="flex min-w-0 flex-col">
          <span className="truncate">{sibling.label}</span>
          {sibling.description && (
            <span className="truncate text-xs text-muted-foreground">{sibling.description}</span>
          )}
        </div>
      </Link>
    </DropdownMenuItem>
  );
}
