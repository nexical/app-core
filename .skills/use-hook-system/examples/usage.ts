import { HookSystem } from '@/lib/modules/hooks';

/**
 * 1. Define Payload Interfaces
 * MANDATORY: Avoid 'any'. Use clear, descriptive interfaces.
 */
interface OrderPayload {
  id: string;
  total: number;
  items: string[];
}

interface RequestContext {
  requestId: string;
  actorId: string;
}

/**
 * 2. Side-Effect Listener (Event)
 * Registered in a module's server-init.ts.
 */
HookSystem.on<OrderPayload, RequestContext>('order.created', async (order, context) => {
  // Perform non-blocking side effects (e.g., analytics)
  console.info(`[Analytics] Order ${order.id} created by ${context?.actorId}`);
});

/**
 * 3. Transformation Listener (Filter)
 * Registered in a module's server-init.ts.
 */
HookSystem.on<OrderPayload, RequestContext>('order.read', async (order, context) => {
  // Enrich data based on context
  if (context?.actorId === 'system') {
    return { ...order, total: 0 }; // Apply system discount
  }

  // Return undefined to opt-out of modification
  return undefined;
});

/**
 * 4. Dispatching Events
 */
export async function createOrder(order: OrderPayload, requestId: string, actorId: string) {
  // Fire-and-forget side effects
  await HookSystem.dispatch<OrderPayload, RequestContext>('order.created', order, {
    requestId,
    actorId,
  });
}

/**
 * 5. Filtering Data
 */
export async function getOrder(orderId: string, actorId: string): Promise<OrderPayload> {
  const rawOrder = { id: orderId, total: 100, items: ['item1'] };

  // Transform data through sequential pipeline
  const filteredOrder = await HookSystem.filter<OrderPayload, RequestContext>(
    'order.read',
    rawOrder,
    { requestId: 'internal', actorId },
  );

  return filteredOrder;
}
