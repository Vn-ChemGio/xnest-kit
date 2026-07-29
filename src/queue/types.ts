/**
 * Configuration for a single Redis/BullMQ connection.
 */
export interface QueueConnectionConfig {
  /**
   * Unique key for this connection.
   * Used to link queues and processors to the right Redis instance.
   * @default 'default'
   */
  configKey?: string;

  /**
   * Redis connection URL.
   * e.g. 'redis://localhost:6379' or 'redis://:password@host:port/db'
   */
  url?: string;

  /**
   * Raw IORedis connection options.
   * Overrides `url` if both are present.
   */
  connection?: Record<string, unknown>;

  /**
   * Key prefix for all BullMQ keys in Redis.
   */
  prefix?: string;

  /**
   * Default job options for all queues using this connection.
   */
  defaultJobOptions?: Record<string, unknown>;
}

/**
 * Configuration for a single queue registration.
 */
export interface QueueRegisterConfig {
  /** Queue name (used for injection via @InjectQueue()). */
  name: string;

  /**
   * Connection configKey to link this queue to a Redis connection.
   * @default 'default'
   */
  configKey?: string;

  /** Default job options specific to this queue. */
  defaultJobOptions?: Record<string, unknown>;
}

/**
 * Configuration for a single flow producer registration.
 */
export interface FlowProducerRegisterConfig {
  /** Flow producer name (used for injection via @InjectFlowProducer()). */
  name: string;

  /**
   * Connection configKey to link this flow to a Redis connection.
   * @default 'default'
   */
  configKey?: string;
}

/**
 * Options for QueueModule.forRoot().
 */
export interface ConfigQueueOptions {
  /**
   * Redis connections.
   * Falls back to QUEUE_URLS env var if not provided.
   */
  connections?: QueueConnectionConfig[];

  /**
   * Queues to register.
   * Falls back to QUEUE_NAMES env var if not provided.
   */
  queues?: QueueRegisterConfig[];

  /**
   * Flow producers to register.
   * Falls back to QUEUE_FLOWS env var if not provided.
   */
  flows?: FlowProducerRegisterConfig[];

  /**
   * Register QueueModule as a global module.
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Resolved queue configuration returned by configQueue().
 */
export interface ResolvedQueueConfig {
  /** Resolved Redis connections. */
  connections: QueueConnectionConfig[];

  /** Resolved queue registrations. */
  queues: QueueRegisterConfig[];

  /** Resolved flow producer registrations. */
  flows: FlowProducerRegisterConfig[];

  /** Whether the module is global. */
  isGlobal: boolean;
}
