import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type BookmarkNode, countBookmarks, isFolder } from '@/lib/bookmarks';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { DuplicatesDialog } from './DuplicatesDialog';
import { LanguageSelect } from './LanguageSelect';
import { BackupButton } from './BackupButton';
import { ThemeSelect } from './ThemeSelect';
import { useI18n } from '@/lib/i18n';

type FolderTreeProps = {
  roots: BookmarkNode[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function FolderTree({ roots, selectedId, onSelect }: FolderTreeProps) {
  const { t } = useI18n();

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2.5 px-4 py-4">
        <img src="/icons/icon-32.png" alt="" className="size-7 rounded-md" />
        <span className="text-base font-semibold tracking-tight">Reshelf</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.folders}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roots.map((root) => (
                <FolderItem key={root.id} folder={root} selectedId={selectedId} onSelect={onSelect} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 border-t py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DuplicatesDialog roots={roots} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <BackupButton />
          </SidebarMenuItem>
        </SidebarMenu>
        <ThemeSelect />
        <LanguageSelect />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type FolderItemProps = {
  folder: BookmarkNode;
  selectedId: string;
  onSelect: (id: string) => void;
};

function FolderItem({ folder, selectedId, onSelect }: FolderItemProps) {
  const { t } = useI18n();
  const subfolders = (folder.children ?? []).filter(isFolder);
  const selected = folder.id === selectedId;
  const Icon = selected ? FolderOpen : Folder;

  const button = (
    <SidebarMenuButton isActive={selected} onClick={() => onSelect(folder.id)} title={folder.title}>
      <Icon />
      <span className="truncate">{folder.title || t.untitledFolder}</span>
    </SidebarMenuButton>
  );

  if (subfolders.length === 0) {
    return (
      <SidebarMenuItem>
        {button}
        <SidebarMenuBadge>{countBookmarks(folder)}</SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen={folder.parentId === '0'}
        className="group/collapsible [&[data-state=open]>button>svg]:rotate-90"
      >
        {button}
        <CollapsibleTrigger asChild>
          <SidebarMenuAction aria-label={t.expandFolder(folder.title || t.untitledFolder)}>
            <ChevronRight className="transition-transform" />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {subfolders.map((child) => (
              <FolderItem key={child.id} folder={child} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
