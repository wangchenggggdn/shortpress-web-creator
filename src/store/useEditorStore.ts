import { create } from 'zustand';
import { Website, Version, Page, Section, HistoryRecord } from '@/types/editor';

interface EditorStore {
    // State
    website: Website | null;
    currentVersion: Version | null;
    currentPage: string | null;
    currentSection: string | null;
    selectedComponent: string | null;
    isDirty: boolean;
    history: HistoryRecord[];
    currentHistoryIndex: number;

    // Actions
    setWebsite: (website: Website) => void;
    setCurrentVersion: (version: Version) => void;
    setCurrentPage: (pageId: string | null) => void;
    setCurrentSection: (sectionId: string | null) => void;
    setSelectedComponent: (componentId: string | null) => void;

    // History actions
    addToHistory: (action: string, description: string) => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;

    // Page actions
    addPage: (page: Page) => void;
    updatePage: (pageId: string, updates: Partial<Page>) => void;
    deletePage: (pageId: string) => void;

    // Section actions
    addSection: (pageId: string, section: Section) => void;
    updateSection: (pageId: string, sectionId: string, updates: Partial<Section>) => void;
    deleteSection: (pageId: string, sectionId: string) => void;
    reorderSections: (pageId: string, sectionIds: string[]) => void;

    // Save action
    saveVersion: () => void;
}

const useEditorStore = create<EditorStore>((set, get) => ({
    // Initial state
    website: null,
    currentVersion: null,
    currentPage: null,
    currentSection: null,
    selectedComponent: null,
    isDirty: false,
    history: [],
    currentHistoryIndex: -1,

    // Basic actions
    setWebsite: (website) => set({ website }),
    setCurrentVersion: (version) => set({ currentVersion: version }),
    setCurrentPage: (pageId) => set({ currentPage: pageId }),
    setCurrentSection: (sectionId) => set({ currentSection: sectionId }),
    setSelectedComponent: (componentId) => set({ selectedComponent: componentId }),

    // History actions
    addToHistory: (action, description) => {
        const { currentVersion, history, currentHistoryIndex } = get();
        if (!currentVersion) return;

        // Remove any future history if we're not at the latest point
        const newHistory = history.slice(0, currentHistoryIndex + 1);

        // Add new history record
        const record: HistoryRecord = {
            version: JSON.parse(JSON.stringify(currentVersion)), // Deep clone
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
        if (currentHistoryIndex <= 0) return;

        const previousRecord = history[currentHistoryIndex - 1];
        set({
            currentVersion: JSON.parse(JSON.stringify(previousRecord.version)), // Deep clone
            currentHistoryIndex: currentHistoryIndex - 1
        });
    },

    redo: () => {
        const { history, currentHistoryIndex } = get();
        if (currentHistoryIndex >= history.length - 1) return;

        const nextRecord = history[currentHistoryIndex + 1];
        set({
            currentVersion: JSON.parse(JSON.stringify(nextRecord.version)), // Deep clone
            currentHistoryIndex: currentHistoryIndex + 1
        });
    },

    clearHistory: () => set({ history: [], currentHistoryIndex: -1 }),

    // Page actions
    addPage: (page) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const newVersion = {
                ...state.currentVersion,
                pages: [...state.currentVersion.pages, page]
            };
            get().addToHistory('add_page', `Added page: ${page.name}`);
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
            get().addToHistory('update_page', `Updated page: ${updates.name || pageId}`);
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
            get().addToHistory('delete_page', `Deleted page: ${page?.name || pageId}`);
            return {
                currentVersion: newVersion,
                currentPage: state.currentPage === pageId ? null : state.currentPage
            };
        }),

    // Section actions
    addSection: (pageId, section) =>
        set((state) => {
            if (!state.currentVersion) return state;
            const newVersion = {
                ...state.currentVersion,
                pages: state.currentVersion.pages.map((page) =>
                    page.id === pageId
                        ? { ...page, sections: [...page.sections, section] }
                        : page
                )
            };
            get().addToHistory('add_section', `Added section: ${section.params.title || section.type}`);
            return { currentVersion: newVersion };
        }),

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
            get().addToHistory('update_section', `Updated section: ${updates.params?.title || sectionId}`);
            return { currentVersion: newVersion };
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
            get().addToHistory('delete_section', `Deleted section: ${section?.params.title || sectionId}`);
            return {
                currentVersion: newVersion,
                currentSection: state.currentSection === sectionId ? null : state.currentSection
            };
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
            get().addToHistory('reorder_sections', `Reordered sections in page: ${page?.name || pageId}`);
            return { currentVersion: newVersion };
        }),

    // Save action
    saveVersion: () => {
        set({ isDirty: false });
        get().clearHistory();
    }
}));

export default useEditorStore; 