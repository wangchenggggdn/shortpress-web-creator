import { create } from 'zustand';
import { EditWebsite, Version, Page, Section, HistoryRecord, SectionType, DataSourceType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import { createUniqueUUID } from '@/utils/public';

const generateUniqueId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${uuidv4()}`;
};

interface EditorStore {
    // State
    editWebsite: EditWebsite | null;
    currentVersion: Version | null;
    currentPage: string | null;
    currentSection: Section | null;
    selectedComponent: string | null;
    isDirty: boolean;
    history: HistoryRecord[];
    currentHistoryIndex: number;

    // Actions
    setEditWebsite: (website: EditWebsite) => void;
    setCurrentVersion: (version: Version) => void;
    setCurrentPage: (pageId: string | null) => void;
    setCurrentSection: (section: Section | null) => void;
    setSelectedComponent: (componentId: string | null) => void;

    // History actions
    addToHistory: (newVersion: Version, action: string, description: string) => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;

    // Page actions
    addPage: (page: Page) => void;
    updatePage: (pageId: string, updates: Partial<Page>) => void;
    updatePages: (updates: { id: string; updates: Partial<Page> }[]) => void;
    deletePage: (pageId: string) => void;

    // Section actions
    addSection: (pageId: string, sectionType: SectionType) => Section | null;
    updateSection: (pageId: string, sectionId: string, updates: Partial<Section>) => void;
    updateShareSection: (sectionId: string, updates: Partial<Section>) => void;
    deleteSection: (pageId: string, sectionId: string) => void;
    reorderSections: (pageId: string, sectionIds: string[]) => void;

    // Save action
    saveVersion: () => void;

    // New actions
    initializeHistory: (initialVersion: Version) => void;

    isSharedSectionFunc: (sectionN: Section) => boolean;
}

const createSection = (type: SectionType, existingSections: Section[] = []): Section => ({
    id: createUniqueUUID(existingSections.map(s => s.id)),
    title: type,
    type,
    order: 0,
    params: {
        extend: {},
    }
});

const useEditorStore = create<EditorStore>((set, get) => ({
    // Initial state
    editWebsite: null,
    currentVersion: null,
    currentPage: null,
    currentSection: null,
    selectedComponent: null,
    isDirty: false,
    history: [],
    currentHistoryIndex: -1,

    // Basic actions
    setEditWebsite: (website) => set({ editWebsite: website }),
    setCurrentVersion: (version) => set({ currentVersion: version }),
    setCurrentPage: (pageId) => set({ currentPage: pageId }),
    setCurrentSection: (section) => set({ currentSection: section }),
    setSelectedComponent: (componentId) => set({ selectedComponent: componentId }),

    // History actions
    addToHistory: (newVersion: Version, action: string, description: string) => {
        const { history, currentHistoryIndex } = get();

        newVersion.id = createUniqueUUID(history.map(h => h.version.id));
        // Remove any future history if we're not at the latest point
        const newHistory = history.slice(0, currentHistoryIndex + 1);

        // Add new history record with the new version (post-operation state)
        const record: HistoryRecord = {
            version: JSON.parse(JSON.stringify(newVersion)),
            timestamp: Date.now(),
            action,
            description
        };

        set({
            history: [...newHistory, record],
            currentHistoryIndex: newHistory.length,
            isDirty: true
        });
    },

    undo: () => {
        const { history, currentHistoryIndex } = get();
        // Can only undo if we have at least 2 records (initial state + 1 change)
        if (currentHistoryIndex < 0) return;

        const targetState = history[currentHistoryIndex - 1];

        if (!targetState) return;

        set({
            currentVersion: JSON.parse(JSON.stringify(targetState.version)),
            currentHistoryIndex: currentHistoryIndex - 1,
            isDirty: true
        });
    },

    redo: () => {
        const { history, currentHistoryIndex } = get();
        // Can only redo if we have future history
        if (currentHistoryIndex >= history.length - 1) return;

        const targetState = history[currentHistoryIndex + 1];
        if (!targetState) return;

        set({
            currentVersion: JSON.parse(JSON.stringify(targetState.version)),
            currentHistoryIndex: currentHistoryIndex + 1,
            isDirty: true
        });
    },

    clearHistory: () => set({ history: [], currentHistoryIndex: -1 }),

    // Page actions
    addPage: (page) =>
        set((state) => {
            if (!state.currentVersion) return state;

            // 确保 page.id 是唯一的
            const pageId = generateUniqueId('page');
            const newPage = {
                ...page,
                id: pageId
            };

            const newVersion = {
                ...state.currentVersion,
                pages: [...state.currentVersion.pages, newPage]
            };
            get().addToHistory(newVersion, 'add_page', `Added page: ${page.name}`);
            return { currentVersion: newVersion };
        }),

    updatePage: (pageId, updates) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) =>
                    page.id === pageId ? { ...page, ...updates } : page
                )
            };
            get().addToHistory(newVersion, 'update_page', `Updated page: ${updates.name || pageId}`);
            return { currentVersion: newVersion };
        }),

    updatePages: (updates) =>
        set((state) => {
            if (!state.currentVersion) return state;

            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) => {
                    const update = updates.find(u => u.id === page.id);
                    return update ? { ...page, ...update.updates } : page;
                })
            };

            // 添加到历史记录
            get().addToHistory(
                newVersion,
                'update_pages',
                `Updated multiple pages: ${updates.map(u => u.id).join(', ')}`
            );

            return { currentVersion: newVersion };
        }),

    deletePage: (pageId) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const page = state.currentVersion.pages.find(p => p.id === pageId);
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.filter((page) => page.id !== pageId)
            };
            get().addToHistory(newVersion, 'delete_page', `Deleted page: ${page?.name || pageId}`);
            return {
                currentVersion: newVersion,
                currentPage: state.currentPage === pageId ? null : state.currentPage
            };
        }),

    // Section actions
    addSection: (pageId: string, sectionType: SectionType) => {
        const { currentVersion } = get();
        if (!currentVersion) return null;

        const page = currentVersion.pages.find((p: Page) => p.id === pageId);
        if (!page) return null;
        // Create new section with correct order
        const newSection = {
            ...createSection(sectionType, page.sections),
            order: page.sections.length // Set order to current length
        };

        const newVersion = JSON.parse(JSON.stringify(currentVersion));
        const targetPage = newVersion.pages.find((p: Page) => p.id === pageId);
        if (!targetPage) return null;

        // Add section and ensure all sections have correct order
        targetPage.sections.push(newSection);
        targetPage.sections = targetPage.sections.map((section: Section, index: number) => ({
            ...section,
            order: index
        }));

        set({ currentVersion: newVersion });
        get().addToHistory(newVersion, 'add_section', `Added section: ${sectionType}`);
        return newSection;
    },

    updateSection: (pageId, sectionId, updates) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) =>
                    page.id === pageId
                        ? {
                            ...page,
                            sections: page.sections.map((section) =>
                                section.id === sectionId
                                    ? { ...section, ...updates }
                                    : section
                            )
                        }
                        : page
                )
            };
            get().addToHistory(newVersion, 'update_section', `Updated section: ${updates.type || sectionId}`);
            return { currentVersion: newVersion, currentSection: state.currentSection?.id === sectionId ? { ...state.currentSection, ...updates } : state.currentSection };
        }),

    deleteSection: (pageId, sectionId) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const page = state.currentVersion.pages.find(p => p.id === pageId);
            const section = page?.sections.find(s => s.id === sectionId);
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) =>
                    page.id === pageId
                        ? {
                            ...page,
                            sections: page.sections.filter(
                                (section) => section.id !== sectionId
                            )
                        }
                        : page
                )
            };
            get().addToHistory(newVersion, 'delete_section', `Deleted section: ${section?.type || sectionId}`);
            return {
                currentVersion: newVersion,
                currentSection: state.currentSection?.id === sectionId ? null : state.currentSection
            };
        }),

    updateShareSection: (sectionId, updates) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const shareSections = state.currentVersion.shareSections;
            const newVersion = {
                ...state.currentVersion,
                shareSections: shareSections.map((section) =>
                    section.id === sectionId ? { ...section, ...updates } : section
                )
            };
            get().addToHistory(newVersion, 'update_section', `Updated section: ${updates.type || sectionId}`);
            return { currentVersion: newVersion, currentSection: state.currentSection?.id === sectionId ? { ...state.currentSection, ...updates } : state.currentSection };
        }),

    reorderSections: (pageId, sectionIds) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const page = state.currentVersion.pages.find(p => p.id === pageId);
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) =>
                    page.id === pageId
                        ? {
                            ...page,
                            sections: sectionIds
                                .map((id) => page.sections.find((s) => s.id === id))
                                .filter((s): s is Section => s !== undefined)
                                .map((section, index) => ({
                                    ...section,
                                    order: index
                                }))
                        }
                        : page
                )
            };
            get().addToHistory(newVersion, 'reorder_sections', `Reordered sections in page: ${page?.name || pageId}`);
            return { currentVersion: newVersion };
        }),

    // Save action
    saveVersion: () => {
        set({ isDirty: false });
        get().clearHistory();
    },

    // New actions
    initializeHistory: (initialVersion: Version) => {
        const initialRecord: HistoryRecord = {
            version: JSON.parse(JSON.stringify(initialVersion)),
            timestamp: Date.now(),
            action: 'initialize',
            description: 'Initial state'
        };

        set({
            history: [initialRecord],
            currentHistoryIndex: 0,
            currentVersion: initialVersion,
            isDirty: false
        });
    },

    isSharedSectionFunc: (sectionN: Section) => {
        const { currentVersion } = get();
        if (!currentVersion || !sectionN) return false;
        return currentVersion.shareSections.some(section => section.id === sectionN.id);
    }
}));

export default useEditorStore; 