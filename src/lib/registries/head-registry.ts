export interface HeadEntry {
  /**
   * The tag type, e.g. 'meta', 'link', 'script', 'title'
   */
  tag: 'meta' | 'link' | 'script' | 'style' | 'title' | 'base';
  /**
   * Key-value attributes for the tag.
   * e.g. { name: "description", content: "..." }
   */
  props?: Record<string, string | number | boolean>;
  /**
   * Optional inner content (for script/style/title)
   */
  content?: string;
  /**
   * Optional key for deduping/overriding.
   * If multiple entries share the same key, the last one wins.
   */
  key?: string;
}

class HeadRegistryClass {
  private entries: HeadEntry[] = [];
  private keyedEntries: Map<string, HeadEntry> = new Map();

  /**
   * Register a head entry.
   */
  register(entry: HeadEntry) {
    if (entry.key) {
      // If key exists, replace it (maintain order if possible? Map iterates by insertion order)
      // But simpler to just use Map for keyed ones.
      this.keyedEntries.set(entry.key, entry);
    } else {
      this.entries.push(entry);
    }
  }

  /**
   * Get all entries.
   * Combines keyed and unkeyed entries.
   */
  getEntries(): HeadEntry[] {
    return [...this.entries, ...Array.from(this.keyedEntries.values())];
  }

  /**
   * Clear all entries (mostly for testing cleanup)
   */
  clear() {
    this.entries = [];
    this.keyedEntries.clear();
  }
}

export const HeadRegistry = new HeadRegistryClass();
