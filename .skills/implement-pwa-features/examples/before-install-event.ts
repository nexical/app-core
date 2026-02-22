/**
 * Example: Local Event Interface Extension
 *
 * In the Nexus Ecosystem, 'any' is strictly forbidden.
 * For experimental browser events like 'beforeinstallprompt',
 * you MUST define a local interface that extends the base 'Event' type.
 */

/**
 * Define the structure of the beforeinstallprompt event.
 * Extends the standard DOM 'Event'.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * The platforms the app can be installed on.
   */
  readonly platforms: string[];

  /**
   * A promise that resolves when the user has responded to the install prompt.
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Shows the browser's install prompt.
   * Note: This can only be called once per event object.
   */
  prompt(): Promise<void>;
}

/**
 * Usage example in a React component or service.
 */
function handleInstallEvent(e: Event) {
  // Pattern: Casting to the local interface instead of 'any'.
  const deferredPrompt = e as BeforeInstallPromptEvent;

  // Now we have full type safety and autocompletion
  deferredPrompt
    .prompt()
    .then(() => {
      return deferredPrompt.userChoice;
    })
    .then(({ outcome }) => {
      console.info(`User choice: ${outcome}`);
    });
}

export type { BeforeInstallPromptEvent };
export { handleInstallEvent };
