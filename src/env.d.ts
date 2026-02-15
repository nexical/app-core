/* eslint-disable */
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    navData?: {
      context?: Record<string, any>;
      [key: string]: any;
    };

    actor?: ActorMap[keyof ActorMap];
    actorType?: string;
  }

  // Interface for modules to register their actor types
  interface ActorMap { }
}
