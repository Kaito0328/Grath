import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { VariableEntry, VariableKind } from "./types";

export interface VariableManagerState {
  entries: VariableEntry[];

  save: (args: {
    kind: VariableKind;
    name: string;
    value: string;
    latex?: string;
  }) => void;

  remove: (args: { kind: VariableKind; name: string }) => void;
  removeById: (id: string) => void;

  update: (
    id: string,
    patch: Partial<Pick<VariableEntry, "kind" | "name" | "value" | "latex">>
  ) => void;

  touch: (id: string) => void;
  listByKind: (kind: VariableKind) => VariableEntry[];
}

function makeId(kind: VariableKind, name: string) {
  return `${kind}:${name}`;
}

export const useVariableManagerStore = create<VariableManagerState>()(
  persist(
    (set, get) => ({
      entries: [],

      save: ({ kind, name, value, latex }) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const id = makeId(kind, trimmed);
        const now = Date.now();

        set((state) => {
          const existingIndex = state.entries.findIndex((e) => e.id === id);
          if (existingIndex >= 0) {
            const next = state.entries.slice();
            next[existingIndex] = {
              ...next[existingIndex],
              value,
              latex,
              updatedAt: now,
            };
            return { entries: next };
          }

          return {
            entries: [
              ...state.entries,
              {
                id,
                kind,
                name: trimmed,
                value,
                latex,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        });
      },

      remove: ({ kind, name }) => {
        const id = makeId(kind, name.trim());
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      removeById: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      update: (id, patch) => {
        const now = Date.now();

        set((state) => {
          const index = state.entries.findIndex((e) => e.id === id);
          if (index < 0) return state;

          const current = state.entries[index];
          const nextKind = (patch.kind ?? current.kind).trim();
          const nextName = (patch.name ?? current.name).trim();
          if (!nextKind || !nextName) return state;

          const nextId = makeId(nextKind, nextName);
          const nextEntry: VariableEntry = {
            ...current,
            ...patch,
            id: nextId,
            kind: nextKind,
            name: nextName,
            updatedAt: now,
          };

          const filtered = state.entries.filter((e) => e.id !== id);
          const existingIndex = filtered.findIndex((e) => e.id === nextId);
          if (existingIndex >= 0) {
            const next = filtered.slice();
            next[existingIndex] = nextEntry;
            return { entries: next };
          }

          return { entries: [...filtered, nextEntry] };
        });
      },

      touch: (id) => {
        const now = Date.now();
        set((state) => {
          const index = state.entries.findIndex((e) => e.id === id);
          if (index < 0) return state;
          const next = state.entries.slice();
          next[index] = {
            ...next[index],
            lastUsedAt: now,
          };
          return { entries: next };
        });
      },

      listByKind: (kind) => {
        return get()
          .entries.filter((e) => e.kind === kind)
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
    }),
    {
      name: "grath.variables.v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
