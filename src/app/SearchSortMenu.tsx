import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SortDirection, SortKey, SortRule } from '@/lib/settings';
import { ArrowDownUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const SORT_KEYS: SortKey[] = ['duration', 'title', 'length'];
const DIRECTIONS: SortDirection[] = ['asc', 'desc'];
const NONE = 'none';

type SearchSortMenuProps = { rule: SortRule | null; onChange: (rule: SortRule | null) => void };

export function SearchSortMenu({ rule, onChange }: SearchSortMenuProps) {
  const { t } = useI18n();
  const direction = rule?.direction ?? 'asc';
  const label = rule ? `${t.sortKeys[rule.key]} · ${t.sortDirection(rule.key, rule.direction)}` : t.folderOrder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowDownUp />
          {label}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t.sortBy}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={rule?.key ?? NONE}
            onValueChange={(key) => onChange(key === NONE ? null : { key: key as SortKey, direction })}
          >
            <DropdownMenuRadioItem value={NONE}>{t.folderOrder}</DropdownMenuRadioItem>
            {SORT_KEYS.map((key) => (
              <DropdownMenuRadioItem key={key} value={key}>
                {t.sortKeys[key]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {rule && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t.order}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={rule.direction}
                onValueChange={(value) => onChange({ ...rule, direction: value as SortDirection })}
              >
                {DIRECTIONS.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value}>
                    {t.sortDirection(rule.key, value)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
