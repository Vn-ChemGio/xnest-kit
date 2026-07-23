/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * In-App notification provider via Socket.IO.
 *
 * Requires: `npm install socket.io`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { InAppSendInput } from './inapp.channel';

/** Lazy-loaded socket.io reference. */
const getSocketIo = lazyImport<{
  new (
    port?: number,
    options?: Record<string, unknown>,
  ): Record<string, unknown>;
}>('socket.io', 'InAppSocketProvider');

/**
 * In-App provider using Socket.IO.
 *
 * Emits real-time notifications to connected clients.
 *
 * @example
 * ```typescript
 * import { InAppSocketProvider } from 'xnest-kit/notification/channel/inapp';
 *
 * const provider = new InAppSocketProvider({ port: 3001 });
 * ```
 */
export class InAppSocketProvider implements NotificationProvider<InAppSendInput> {
  readonly name = 'socket-io';
  readonly channel = 'inapp';

  private server: any = null;

  constructor(
    private readonly options: { port?: number } & Record<string, unknown> = {},
  ) {}

  private getServer(): any {
    if (!this.server) {
      const Server = getSocketIo();
      this.server = new Server(this.options.port, {
        cors: { origin: '*' },
        ...this.options,
      });
    }
    return this.server;
  }

  send(input: InAppSendInput): Promise<ProviderResult> {
    try {
      const server = this.getServer();
      const notification = {
        title: input.title,
        body: input.body,
        type: input.type ?? 'info',
        actionUrl: input.actionUrl,
        icon: input.icon,
        metadata: input.metadata,
        expiresAt: input.expiresAt,
        timestamp: new Date().toISOString(),
      };

      const users = Array.isArray(input.userId) ? input.userId : [input.userId];

      for (const userId of users) {
        server.to(`user:${userId}`).emit('notification', notification);
      }

      return Promise.resolve({
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `inapp-${Date.now()}`,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Socket.IO error';
      return Promise.resolve({
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      });
    }
  }

  /**
   * Get the underlying Socket.IO server instance.
   *
   * @returns The Socket.IO server
   */

  getIOServer(): any {
    return this.getServer();
  }
}

/**
 * Check if socket.io is installed.
 *
 * @returns true if `socket.io` can be resolved
 */
export function isSocketIoInstalled(): boolean {
  return isPackageInstalled('socket.io');
}
