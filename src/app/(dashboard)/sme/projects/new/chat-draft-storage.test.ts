import { afterEach, describe, expect, it } from "vitest";

import {
  clearChatDraft,
  draftStorageKey,
  loadChatDraft,
  saveChatDraft,
  type ChatDraft,
} from "./chat-draft-storage";

let originalLocalStorageDescriptor: PropertyDescriptor | undefined;

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    dump() {
      return Object.fromEntries(store.entries());
    },
  } as const;
}

function installLocalStorageMock() {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  originalLocalStorageDescriptor = original;
  const mock = createLocalStorageMock();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: mock,
  });

  return {
    mock,
    restore() {
      if (original) {
        Object.defineProperty(globalThis, "localStorage", original);
        return;
      }
      Reflect.deleteProperty(globalThis, "localStorage");
    },
  };
}

afterEach(() => {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, "localStorage", originalLocalStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("chat draft storage", () => {
  it("builds a stable per-user storage key", () => {
    expect(draftStorageKey("user-1")).toBe("vnsme.chatBriefDraft.v1.user-1");
  });

  it("serializes and restores a draft with schemaVersion", () => {
    const { mock, restore } = installLocalStorageMock();
    const draft: ChatDraft = {
      schemaVersion: 1,
      messages: [
        { id: "m1", role: "assistant", content: "Chào bạn", suggestions: ["A", "B"] },
      ],
      parsedData: {
        title: "Nền tảng quản lý kho",
        description: "Mô tả",
        standardizedBrief: "",
        expectedOutput: "Web dashboard",
        requiredSkills: "React, Node.js",
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "5 triệu",
      },
      coverage: {
        businessContext: "complete",
        deliverableScope: "partial",
        requiredSkills: "complete",
        timelineBudget: "missing",
      },
      updatedAt: 1_717_171_717_171,
    };

    try {
      saveChatDraft("user-1", draft);

      const stored = mock.getItem(draftStorageKey("user-1"));
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored ?? "{}")).toEqual(draft);
      expect(loadChatDraft("user-1")).toEqual(draft);
    } finally {
      restore();
    }
  });

  it("returns null when payload is invalid JSON", () => {
    const { mock, restore } = installLocalStorageMock();

    try {
      mock.setItem(draftStorageKey("user-1"), "{");

      expect(loadChatDraft("user-1")).toBeNull();
    } finally {
      restore();
    }
  });

  it("returns null when schema version does not match", () => {
    const { mock, restore } = installLocalStorageMock();

    try {
      mock.setItem(
        draftStorageKey("user-1"),
        JSON.stringify({
          schemaVersion: 2,
          messages: [],
          parsedData: null,
          coverage: null,
          updatedAt: 123,
        }),
      );

      expect(loadChatDraft("user-1")).toBeNull();
    } finally {
      restore();
    }
  });

  it("returns null when parsedData is malformed", () => {
    const { mock, restore } = installLocalStorageMock();

    try {
      mock.setItem(
        draftStorageKey("user-1"),
        JSON.stringify({
          schemaVersion: 1,
          messages: [],
          parsedData: {
            title: "A",
            description: "B",
            expectedOutput: "C",
          },
          coverage: null,
          updatedAt: 123,
        }),
      );

      expect(loadChatDraft("user-1")).toBeNull();
    } finally {
      restore();
    }
  });

  it("returns null when coverage is malformed", () => {
    const { mock, restore } = installLocalStorageMock();

    try {
      mock.setItem(
        draftStorageKey("user-1"),
        JSON.stringify({
          schemaVersion: 1,
          messages: [],
          parsedData: null,
          coverage: {
            businessContext: "complete",
            deliverableScope: "done",
            requiredSkills: "complete",
            timelineBudget: "missing",
          },
          updatedAt: 123,
        }),
      );

      expect(loadChatDraft("user-1")).toBeNull();
    } finally {
      restore();
    }
  });

  it("clears a saved draft", () => {
    const { mock, restore } = installLocalStorageMock();
    const draft: ChatDraft = {
      schemaVersion: 1,
      messages: [],
      parsedData: null,
      coverage: null,
      updatedAt: 123,
    };

    try {
      saveChatDraft("user-1", draft);
      clearChatDraft("user-1");

      expect(mock.getItem(draftStorageKey("user-1"))).toBeNull();
      expect(loadChatDraft("user-1")).toBeNull();
    } finally {
      restore();
    }
  });

  it("keeps drafts isolated per user id", () => {
    const { restore } = installLocalStorageMock();
    const draftA: ChatDraft = {
      schemaVersion: 1,
      messages: [{ id: "a", role: "assistant", content: "draft-a" }],
      parsedData: null,
      coverage: null,
      updatedAt: 123,
    };
    const draftB: ChatDraft = {
      schemaVersion: 1,
      messages: [{ id: "b", role: "assistant", content: "draft-b" }],
      parsedData: null,
      coverage: null,
      updatedAt: 456,
    };

    try {
      saveChatDraft("user-a", draftA);
      saveChatDraft("user-b", draftB);
      clearChatDraft("user-a");

      expect(loadChatDraft("user-a")).toBeNull();
      expect(loadChatDraft("user-b")).toEqual(draftB);
    } finally {
      restore();
    }
  });

  it("safely no-ops when browser storage is unavailable", () => {
    expect(() => saveChatDraft("user-1", {
      schemaVersion: 1,
      messages: [],
      parsedData: null,
      coverage: null,
      updatedAt: 123,
    })).not.toThrow();

    expect(loadChatDraft("user-1")).toBeNull();

    expect(() => clearChatDraft("user-1")).not.toThrow();
  });
});
