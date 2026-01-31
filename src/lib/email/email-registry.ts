import React from 'react';
import { render } from '@react-email/render';

/**
 * Registry for managing pluggable email templates.
 * Allows modules to register and override email templates by ID.
 */
export class EmailRegistry {
  private static templates = new Map<string, React.ComponentType<any>>();

  /**
   * Registers an email template with a unique ID.
   * Overwrites any existing template with the same ID, allowing for customization.
   *
   * @param id - Unique identifier (e.g., 'user:welcome').
   * @param component - The React Component to render.
   */
  static register(id: string, component: React.ComponentType<any>) {
    this.templates.set(id, component);
    console.info(`[EmailRegistry] Registered template: ${id}`);
  }

  /**
   * Retrieves a registered template by ID.
   * @param id - The template ID.
   * @returns The component or undefined.
   */
  static get(id: string) {
    return this.templates.get(id);
  }

  /**
   * Renders a registered email template to HTML.
   * Throws an error if the template is not found.
   *
   * @param id - The template ID.
   * @param props - Props to pass to the component.
   */
  static async render(id: string, props: unknown): Promise<string> {
    const Component = this.get(id);
    if (!Component) {
      throw new Error(`Email template not found: ${id}`);
    }
    return render(React.createElement(Component, props as any));
  }
}
