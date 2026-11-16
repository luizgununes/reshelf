import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { SortDirection, SortKey } from './settings';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'es', label: 'Español' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

const DEFAULT_LANGUAGE: Language = 'en';
const STORAGE_KEY = 'language';

type Counted = (count: number) => string;

type Messages = {
  folders: string;
  language: string;
  theme: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  untitledFolder: string;
  expandFolder: (title: string) => string;
  emptyTitle: string;
  emptyDescription: string;
  bookmarkCount: Counted;
  genericError: string;
  searchPlaceholder: string;
  searchResults: Counted;
  noResultsTitle: string;
  noResultsDescription: (query: string) => string;
  undoSession: Counted;
  undoSessionHint: string;
  keepSessionHint: string;
  changesUndone: Counted;
  autoChanges: Counted;
  undoAuto: string;
  keepAuto: string;
  sortBy: string;
  order: string;
  folderOrder: string;
  youtube: string;
  autoChangesHint: string;
  sortKeys: Record<SortKey, string>;
  sortDirection: (key: SortKey, direction: SortDirection) => string;
  sortNow: string;
  sorted: Counted;
  alreadySorted: string;
  addDurations: string;
  addDurationsHint: string;
  addingDurations: (done: number, total: number) => string;
  durationsUpdated: Counted;
  durationsFailed: Counted;
  durationsNoLength: Counted;
  slowingDown: string;
  slowedDown: string;
  removeDurations: string;
  removeDurationsHint: string;
  noDurations: string;
  durationsRemoved: Counted;
  checkVideos: string;
  randomPick: string;
  randomPickHint: string;
  checkVideosHint: string;
  checkingVideos: (done: number, total: number) => string;
  unavailableFound: Counted;
  allAvailable: string;
  unknownVideos: Counted;
  removeUnavailable: Counted;
  unavailableRemoved: Counted;
  unavailableBadge: string;
  unavailableTitle: Counted;
  unavailableShowOnly: string;
  unavailableShowingOnly: string;
  showAll: string;
  dismiss: string;
  automatic: string;
  automaticOn: string;
  autoDurationLabel: string;
  autoDurationDescription: string;
  autoSortLabel: string;
  autoSortDescription: (rule: string) => string;
  selectBookmark: (title: string) => string;
  editTitle: string;
  renameFolder: string;
  selectAll: string;
  selectedCount: Counted;
  moveTo: string;
  chooseFolder: string;
  move: string;
  deleteSelected: string;
  clearSelection: string;
  moved: Counted;
  deleted: Counted;
  findDuplicates: string;
  duplicatesTitle: string;
  duplicatesDescription: string;
  noDuplicates: string;
  keeps: string;
  removes: string;
  removeThisCopy: string;
  removeDuplicates: Counted;
  duplicatesRemoved: Counted;
  cancel: string;
  downloadBackup: string;
  downloadBackupHint: string;
};

const en: Messages = {
  folders: 'Folders',
  language: 'Language',
  theme: 'Theme',
  themeSystem: 'System Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  untitledFolder: 'Untitled Folder',
  expandFolder: (title) => `Expand ${title}`,
  emptyTitle: 'This Folder Is Empty',
  emptyDescription: 'Bookmarks you save here will show up in this list.',
  bookmarkCount: (n) => (n === 1 ? '1 bookmark' : `${n} bookmarks`),
  genericError: 'Something went wrong. Try again.',
  searchPlaceholder: 'Search all bookmarks',
  searchResults: (n) => (n === 1 ? '1 Result' : `${n} Results`),
  noResultsTitle: 'Nothing Found',
  noResultsDescription: (query) => `No bookmark title or link matches "${query}".`,
  undoSession: (n) => `Undo Changes (${n})`,
  undoSessionHint: 'Revert everything Reshelf changed since you opened this tab',
  keepSessionHint: 'Keep the changes and clear the undo history',
  changesUndone: (n) => (n === 1 ? '1 action undone' : `${n} actions undone`),
  autoChanges: (n) =>
    n === 1
      ? 'Reshelf made 1 automatic change in the background.'
      : `Reshelf made ${n} automatic changes in the background.`,
  undoAuto: 'Undo Them',
  keepAuto: 'Keep',
  sortBy: 'Sort by',
  order: 'Order',
  folderOrder: 'Folder Order',
  youtube: 'YouTube',
  autoChangesHint: 'You can undo all of them or keep them.',
  sortKeys: { duration: 'Duration', title: 'Title', length: 'Title Length' },
  sortDirection: (key, direction) =>
    key === 'title'
      ? direction === 'asc'
        ? 'A to Z'
        : 'Z to A'
      : direction === 'asc'
        ? 'Shortest First'
        : 'Longest First',
  sortNow: 'Sort',
  sorted: (n) => (n === 1 ? '1 bookmark moved' : `${n} bookmarks moved`),
  alreadySorted: 'Already in order',
  addDurations: 'Add Durations',
  addDurationsHint: 'Put each YouTube video length at the start of its title',
  addingDurations: (done, total) => `Adding durations… ${done}/${total}`,
  durationsUpdated: (n) => (n === 1 ? '1 title updated' : `${n} titles updated`),
  durationsFailed: (n) => (n === 1 ? "1 video couldn't be read" : `${n} videos couldn't be read`),
  durationsNoLength: (n) => (n === 1 ? '1 live or upcoming video has no duration' : `${n} live or upcoming videos have no duration`),
  slowingDown: 'YouTube is limiting requests, going slower',
  slowedDown: 'went slower because YouTube limited requests',
  removeDurations: 'Remove Durations',
  removeDurationsHint: 'Take the duration off every title in this folder',
  noDurations: 'No titles in this folder have a duration',
  durationsRemoved: (n) => (n === 1 ? 'Duration removed from 1 title' : `Duration removed from ${n} titles`),
  checkVideos: 'Check Videos',
  randomPick: 'Random Pick',
  randomPickHint: 'Open a random bookmark from this folder in a new tab',
  checkVideosHint: 'Find videos that were deleted or made private',
  checkingVideos: (done, total) => `Checking videos… ${done}/${total}`,
  unavailableFound: (n) => (n === 1 ? '1 video is unavailable' : `${n} videos are unavailable`),
  allAvailable: 'All videos are available',
  unknownVideos: (n) => (n === 1 ? "1 couldn't be checked" : `${n} couldn't be checked`),
  removeUnavailable: (n) => `Remove Unavailable (${n})`,
  unavailableRemoved: (n) => (n === 1 ? '1 unavailable video removed' : `${n} unavailable videos removed`),
  unavailableBadge: 'Unavailable',
  unavailableTitle: (n) => (n === 1 ? '1 Unavailable Video' : `${n} Unavailable Videos`),
  unavailableShowOnly: 'Click to show only these videos.',
  unavailableShowingOnly: 'Showing only the unavailable videos.',
  showAll: 'Show All',
  dismiss: 'Dismiss',
  automatic: 'Automatic',
  automaticOn: 'On',
  autoDurationLabel: 'Add Durations to New Videos',
  autoDurationDescription: 'When a YouTube video lands in this folder, its length goes into the title.',
  autoSortLabel: 'Keep This Folder Sorted',
  autoSortDescription: (rule) => `Sorts again whenever a bookmark lands here. Current order: ${rule}.`,
  selectBookmark: (title) => `Select ${title}`,
  editTitle: 'Edit Title',
  renameFolder: 'Rename Folder',
  selectAll: 'Select All',
  selectedCount: (n) => `${n} selected`,
  moveTo: 'Move to',
  chooseFolder: 'Choose a Folder',
  move: 'Move',
  deleteSelected: 'Delete',
  clearSelection: 'Clear Selection',
  moved: (n) => (n === 1 ? '1 bookmark moved' : `${n} bookmarks moved`),
  deleted: (n) => (n === 1 ? '1 bookmark deleted' : `${n} bookmarks deleted`),
  findDuplicates: 'Find Duplicates',
  duplicatesTitle: 'Duplicate Bookmarks',
  duplicatesDescription:
    'Searches every folder. The oldest copy of each link stays and the rest are removed. A YouTube video counts as the same even when the link is different.',
  noDuplicates: 'No duplicates found.',
  keeps: 'Keeps',
  removes: 'Removes',
  removeThisCopy: 'Remove this copy',
  removeDuplicates: (n) => (n === 1 ? 'Remove 1 Duplicate' : `Remove ${n} Duplicates`),
  duplicatesRemoved: (n) => (n === 1 ? '1 duplicate removed' : `${n} duplicates removed`),
  cancel: 'Cancel',
  downloadBackup: 'Download Backup',
  downloadBackupHint: 'Your bookmarks as they were when you opened Reshelf. Chrome can import this file.',
};

const ptBR: Messages = {
  folders: 'Pastas',
  language: 'Idioma',
  theme: 'Tema',
  themeSystem: 'Tema do Sistema',
  themeLight: 'Claro',
  themeDark: 'Escuro',
  untitledFolder: 'Pasta sem Nome',
  expandFolder: (title) => `Expandir ${title}`,
  emptyTitle: 'Esta Pasta Está Vazia',
  emptyDescription: 'Os favoritos que você salvar aqui vão aparecer nesta lista.',
  bookmarkCount: (n) => (n === 1 ? '1 favorito' : `${n} favoritos`),
  genericError: 'Algo deu errado. Tente de novo.',
  searchPlaceholder: 'Buscar em todos os favoritos',
  searchResults: (n) => (n === 1 ? '1 Resultado' : `${n} Resultados`),
  noResultsTitle: 'Nada Encontrado',
  noResultsDescription: (query) => `Nenhum título ou link de favorito tem "${query}".`,
  undoSession: (n) => `Desfazer Mudanças (${n})`,
  undoSessionHint: 'Volta tudo o que o Reshelf mudou desde que você abriu esta aba',
  keepSessionHint: 'Mantém as mudanças e limpa o histórico de desfazer',
  changesUndone: (n) => (n === 1 ? '1 ação desfeita' : `${n} ações desfeitas`),
  autoChanges: (n) =>
    n === 1
      ? 'O Reshelf fez 1 mudança automática em segundo plano.'
      : `O Reshelf fez ${n} mudanças automáticas em segundo plano.`,
  undoAuto: 'Desfazer',
  keepAuto: 'Manter',
  sortBy: 'Ordenar por',
  order: 'Ordem',
  folderOrder: 'Ordem das Pastas',
  youtube: 'YouTube',
  autoChangesHint: 'Você pode desfazer todas ou mantê-las.',
  sortKeys: { duration: 'Duração', title: 'Título', length: 'Tamanho do Título' },
  sortDirection: (key, direction) =>
    key === 'title'
      ? direction === 'asc'
        ? 'A a Z'
        : 'Z a A'
      : direction === 'asc'
        ? 'Mais Curto Primeiro'
        : 'Mais Longo Primeiro',
  sortNow: 'Ordenar',
  sorted: (n) => (n === 1 ? '1 favorito mudou de lugar' : `${n} favoritos mudaram de lugar`),
  alreadySorted: 'Já está em ordem',
  addDurations: 'Adicionar Duração',
  addDurationsHint: 'Coloca a duração de cada vídeo do YouTube no começo do título',
  addingDurations: (done, total) => `Adicionando duração… ${done}/${total}`,
  durationsUpdated: (n) => (n === 1 ? '1 título atualizado' : `${n} títulos atualizados`),
  durationsFailed: (n) => (n === 1 ? 'Não foi possível ler 1 vídeo' : `Não foi possível ler ${n} vídeos`),
  durationsNoLength: (n) => (n === 1 ? '1 live ou estreia ainda sem duração' : `${n} lives ou estreias ainda sem duração`),
  slowingDown: 'O YouTube está limitando as leituras, indo mais devagar',
  slowedDown: 'foi mais devagar porque o YouTube limitou as leituras',
  removeDurations: 'Remover Duração',
  removeDurationsHint: 'Tira a duração de todos os títulos desta pasta',
  noDurations: 'Nenhum título desta pasta tem duração',
  durationsRemoved: (n) => (n === 1 ? 'Duração removida de 1 título' : `Duração removida de ${n} títulos`),
  checkVideos: 'Verificar Vídeos',
  randomPick: 'Sortear',
  randomPickHint: 'Abre um favorito aleatório desta pasta numa aba nova',
  checkVideosHint: 'Encontra vídeos que foram apagados ou ficaram privados',
  checkingVideos: (done, total) => `Verificando vídeos… ${done}/${total}`,
  unavailableFound: (n) => (n === 1 ? '1 vídeo indisponível' : `${n} vídeos indisponíveis`),
  allAvailable: 'Todos os vídeos estão disponíveis',
  unknownVideos: (n) => (n === 1 ? 'não foi possível verificar 1' : `não foi possível verificar ${n}`),
  removeUnavailable: (n) => `Remover Indisponíveis (${n})`,
  unavailableRemoved: (n) => (n === 1 ? '1 vídeo indisponível removido' : `${n} vídeos indisponíveis removidos`),
  unavailableBadge: 'Indisponível',
  unavailableTitle: (n) => (n === 1 ? '1 Vídeo Indisponível' : `${n} Vídeos Indisponíveis`),
  unavailableShowOnly: 'Clique para mostrar só esses vídeos.',
  unavailableShowingOnly: 'Mostrando só os vídeos indisponíveis.',
  showAll: 'Mostrar Todos',
  dismiss: 'Fechar',
  automatic: 'Automático',
  automaticOn: 'Ligado',
  autoDurationLabel: 'Adicionar Duração aos Vídeos Novos',
  autoDurationDescription: 'Quando um vídeo do YouTube entra nesta pasta, a duração vai para o título.',
  autoSortLabel: 'Manter Esta Pasta Ordenada',
  autoSortDescription: (rule) => `Ordena de novo sempre que um favorito entra aqui. Ordem atual: ${rule}.`,
  selectBookmark: (title) => `Selecionar ${title}`,
  editTitle: 'Editar Título',
  renameFolder: 'Renomear Pasta',
  selectAll: 'Selecionar Todos',
  selectedCount: (n) => (n === 1 ? '1 selecionado' : `${n} selecionados`),
  moveTo: 'Mover para',
  chooseFolder: 'Escolha uma Pasta',
  move: 'Mover',
  deleteSelected: 'Apagar',
  clearSelection: 'Limpar Seleção',
  moved: (n) => (n === 1 ? '1 favorito movido' : `${n} favoritos movidos`),
  deleted: (n) => (n === 1 ? '1 favorito apagado' : `${n} favoritos apagados`),
  findDuplicates: 'Encontrar Duplicados',
  duplicatesTitle: 'Favoritos Duplicados',
  duplicatesDescription:
    'Procura em todas as pastas. A cópia mais antiga de cada link fica e as outras são removidas. Um vídeo do YouTube conta como o mesmo mesmo com link diferente.',
  noDuplicates: 'Nenhum duplicado encontrado.',
  keeps: 'Fica',
  removes: 'Sai',
  removeThisCopy: 'Remover esta cópia',
  removeDuplicates: (n) => (n === 1 ? 'Remover 1 Duplicado' : `Remover ${n} Duplicados`),
  duplicatesRemoved: (n) => (n === 1 ? '1 duplicado removido' : `${n} duplicados removidos`),
  cancel: 'Cancelar',
  downloadBackup: 'Baixar Backup',
  downloadBackupHint: 'Seus favoritos como estavam quando você abriu o Reshelf. O Chrome importa esse arquivo.',
};

const es: Messages = {
  folders: 'Carpetas',
  language: 'Idioma',
  theme: 'Tema',
  themeSystem: 'Tema del Sistema',
  themeLight: 'Claro',
  themeDark: 'Oscuro',
  untitledFolder: 'Carpeta sin Nombre',
  expandFolder: (title) => `Expandir ${title}`,
  emptyTitle: 'Esta Carpeta Está Vacía',
  emptyDescription: 'Los marcadores que guardes aquí aparecerán en esta lista.',
  bookmarkCount: (n) => (n === 1 ? '1 marcador' : `${n} marcadores`),
  genericError: 'Algo salió mal. Inténtalo de nuevo.',
  searchPlaceholder: 'Buscar en todos los marcadores',
  searchResults: (n) => (n === 1 ? '1 Resultado' : `${n} Resultados`),
  noResultsTitle: 'No se Encontró Nada',
  noResultsDescription: (query) => `Ningún título o enlace de marcador contiene "${query}".`,
  undoSession: (n) => `Deshacer Cambios (${n})`,
  undoSessionHint: 'Revierte todo lo que Reshelf cambió desde que abriste esta pestaña',
  keepSessionHint: 'Mantiene los cambios y borra el historial para deshacer',
  changesUndone: (n) => (n === 1 ? '1 acción deshecha' : `${n} acciones deshechas`),
  autoChanges: (n) =>
    n === 1
      ? 'Reshelf hizo 1 cambio automático en segundo plano.'
      : `Reshelf hizo ${n} cambios automáticos en segundo plano.`,
  undoAuto: 'Deshacer',
  keepAuto: 'Mantener',
  sortBy: 'Ordenar por',
  order: 'Orden',
  folderOrder: 'Orden de las Carpetas',
  youtube: 'YouTube',
  autoChangesHint: 'Puedes deshacerlos todos o mantenerlos.',
  sortKeys: { duration: 'Duración', title: 'Título', length: 'Largo del Título' },
  sortDirection: (key, direction) =>
    key === 'title'
      ? direction === 'asc'
        ? 'A a Z'
        : 'Z a A'
      : direction === 'asc'
        ? 'Más Corto Primero'
        : 'Más Largo Primero',
  sortNow: 'Ordenar',
  sorted: (n) => (n === 1 ? '1 marcador cambió de lugar' : `${n} marcadores cambiaron de lugar`),
  alreadySorted: 'Ya está en orden',
  addDurations: 'Añadir Duración',
  addDurationsHint: 'Pone la duración de cada video de YouTube al inicio del título',
  addingDurations: (done, total) => `Añadiendo duración… ${done}/${total}`,
  durationsUpdated: (n) => (n === 1 ? '1 título actualizado' : `${n} títulos actualizados`),
  durationsFailed: (n) => (n === 1 ? 'No se pudo leer 1 video' : `No se pudieron leer ${n} videos`),
  durationsNoLength: (n) => (n === 1 ? '1 directo o estreno aún sin duración' : `${n} directos o estrenos aún sin duración`),
  slowingDown: 'YouTube está limitando las lecturas, yendo más despacio',
  slowedDown: 'fue más despacio porque YouTube limitó las lecturas',
  removeDurations: 'Quitar Duración',
  removeDurationsHint: 'Quita la duración de todos los títulos de esta carpeta',
  noDurations: 'Ningún título de esta carpeta tiene duración',
  durationsRemoved: (n) => (n === 1 ? 'Duración quitada de 1 título' : `Duración quitada de ${n} títulos`),
  checkVideos: 'Revisar Videos',
  randomPick: 'Sortear',
  randomPickHint: 'Abre un marcador aleatorio de esta carpeta en una pestaña nueva',
  checkVideosHint: 'Encuentra videos que fueron borrados o se volvieron privados',
  checkingVideos: (done, total) => `Revisando videos… ${done}/${total}`,
  unavailableFound: (n) => (n === 1 ? '1 video no disponible' : `${n} videos no disponibles`),
  allAvailable: 'Todos los videos están disponibles',
  unknownVideos: (n) => (n === 1 ? 'no se pudo revisar 1' : `no se pudieron revisar ${n}`),
  removeUnavailable: (n) => `Quitar No Disponibles (${n})`,
  unavailableRemoved: (n) => (n === 1 ? '1 video no disponible quitado' : `${n} videos no disponibles quitados`),
  unavailableBadge: 'No Disponible',
  unavailableTitle: (n) => (n === 1 ? '1 Video no Disponible' : `${n} Videos no Disponibles`),
  unavailableShowOnly: 'Haz clic para mostrar solo estos videos.',
  unavailableShowingOnly: 'Mostrando solo los videos no disponibles.',
  showAll: 'Mostrar Todos',
  dismiss: 'Cerrar',
  automatic: 'Automático',
  automaticOn: 'Activado',
  autoDurationLabel: 'Añadir Duración a los Videos Nuevos',
  autoDurationDescription: 'Cuando un video de YouTube llega a esta carpeta, la duración va al título.',
  autoSortLabel: 'Mantener Esta Carpeta Ordenada',
  autoSortDescription: (rule) => `Vuelve a ordenar cada vez que llega un marcador. Orden actual: ${rule}.`,
  selectBookmark: (title) => `Seleccionar ${title}`,
  editTitle: 'Editar Título',
  renameFolder: 'Renombrar Carpeta',
  selectAll: 'Seleccionar Todos',
  selectedCount: (n) => (n === 1 ? '1 seleccionado' : `${n} seleccionados`),
  moveTo: 'Mover a',
  chooseFolder: 'Elige una Carpeta',
  move: 'Mover',
  deleteSelected: 'Borrar',
  clearSelection: 'Limpiar Selección',
  moved: (n) => (n === 1 ? '1 marcador movido' : `${n} marcadores movidos`),
  deleted: (n) => (n === 1 ? '1 marcador borrado' : `${n} marcadores borrados`),
  findDuplicates: 'Buscar Duplicados',
  duplicatesTitle: 'Marcadores Duplicados',
  duplicatesDescription:
    'Busca en todas las carpetas. Se queda la copia más antigua de cada enlace y se quitan las demás. Un video de YouTube cuenta como el mismo aunque el enlace sea distinto.',
  noDuplicates: 'No se encontraron duplicados.',
  keeps: 'Se Queda',
  removes: 'Se Quita',
  removeThisCopy: 'Quitar esta copia',
  removeDuplicates: (n) => (n === 1 ? 'Quitar 1 Duplicado' : `Quitar ${n} Duplicados`),
  duplicatesRemoved: (n) => (n === 1 ? '1 duplicado quitado' : `${n} duplicados quitados`),
  cancel: 'Cancelar',
  downloadBackup: 'Descargar Copia',
  downloadBackupHint: 'Tus marcadores como estaban cuando abriste Reshelf. Chrome puede importar este archivo.',
};

const messages: Record<Language, Messages> = { en, 'pt-BR': ptBR, es };

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((stored) => {
      const value = stored[STORAGE_KEY];
      setLanguageState(isLanguage(value) ? value : DEFAULT_LANGUAGE);
    });
  }, []);

  useEffect(() => {
    if (language) document.documentElement.lang = language;
  }, [language]);

  if (!language) return null;

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    chrome.storage.local.set({ [STORAGE_KEY]: next });
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: messages[language] }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
