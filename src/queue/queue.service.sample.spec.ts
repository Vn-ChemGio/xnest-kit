import { QueueService } from './queue.service.sample';

const mockAdd = jest.fn();
const mockGetJob = jest.fn();
const mockGetJobs = jest.fn();
const mockGetJobCountByTypes = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockRemoveRepeatable = jest.fn();
const mockRetry = jest.fn();
const mockFlowAdd = jest.fn();

const mockQueue = {
  add: mockAdd,
  getJob: mockGetJob,
  getJobs: mockGetJobs,
  getJobCountByTypes: mockGetJobCountByTypes,
  pause: mockPause,
  resume: mockResume,
  removeRepeatable: mockRemoveRepeatable,
};

const mockFlowProducer = {
  add: mockFlowAdd,
};

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QueueService(mockQueue as never, mockFlowProducer as never);
  });

  describe('sendEmail', () => {
    it('should add a job with exponential backoff and TTL cleanup', async () => {
      const expectedJob = { id: 'job-1' };
      mockAdd.mockResolvedValue(expectedJob);

      const result = await service.sendEmail('a@b.com', 'Hello', '<p>Body</p>');

      expect(mockAdd).toHaveBeenCalledWith(
        'send-email',
        { to: 'a@b.com', subject: 'Hello', body: '<p>Body</p>' },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      );
      expect(result).toBe(expectedJob);
    });
  });

  describe('sendDelayedEmail', () => {
    it('should add a delayed job with fixed backoff', async () => {
      const expectedJob = { id: 'job-2' };
      mockAdd.mockResolvedValue(expectedJob);

      const result = await service.sendDelayedEmail('a@b.com', 5000);

      expect(mockAdd).toHaveBeenCalledWith(
        'send-email',
        { to: 'a@b.com', subject: 'Welcome!', body: 'Thanks for signing up' },
        {
          delay: 5000,
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
        },
      );
      expect(result).toBe(expectedJob);
    });
  });

  describe('sendPriorityEmail', () => {
    it('should add a high-priority job with exponential backoff', async () => {
      const expectedJob = { id: 'job-3' };
      mockAdd.mockResolvedValue(expectedJob);

      const result = await service.sendPriorityEmail();

      expect(mockAdd).toHaveBeenCalledWith(
        'send-email',
        {
          to: 'urgent@example.com',
          subject: 'Password Reset',
          body: '...',
        },
        {
          priority: 1,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
      expect(result).toBe(expectedJob);
    });
  });

  describe('scheduleDailyDigest', () => {
    it('should add a cron repeatable job', async () => {
      const expectedJob = { id: 'job-4' };
      mockAdd.mockResolvedValue(expectedJob);

      const result = await service.scheduleDailyDigest();

      expect(mockAdd).toHaveBeenCalledWith(
        'daily-digest',
        { type: 'daily-newsletter' },
        {
          repeat: { pattern: '0 8 * * *' },
          attempts: 3,
          backoff: { type: 'fixed', delay: 60000 },
        },
      );
      expect(result).toBe(expectedJob);
    });
  });

  describe('removeDailyDigest', () => {
    it('should remove the repeatable job', async () => {
      mockRemoveRepeatable.mockResolvedValue(true);

      const result = await service.removeDailyDigest();

      expect(mockRemoveRepeatable).toHaveBeenCalledWith('daily-digest', {
        pattern: '0 8 * * *',
      });
      expect(result).toBe(true);
    });
  });

  describe('placeOrder', () => {
    it('should add a flow with children', async () => {
      const expectedResult = {
        job: { id: 'parent-1' },
        children: [{ job: { id: 'child-1' } }, { job: { id: 'child-2' } }],
      };
      mockFlowAdd.mockResolvedValue(expectedResult);

      const result = await service.placeOrder('ord-123');

      expect(mockFlowAdd).toHaveBeenCalledWith({
        name: 'place-order',
        queueName: 'order',
        data: { orderId: 'ord-123' },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
        children: [
          {
            name: 'charge-payment',
            data: { orderId: 'ord-123', amount: 49.99 },
            queueName: 'payment',
            opts: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 1000 },
            },
          },
          {
            name: 'reserve-inventory',
            data: { orderId: 'ord-123', sku: 'PROD-001' },
            queueName: 'inventory',
            opts: {
              attempts: 3,
              backoff: { type: 'fixed', delay: 5000 },
            },
          },
        ],
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe('retryFailedJob', () => {
    it('should retry an existing failed job', async () => {
      const mockJob = { retry: mockRetry };
      mockGetJob.mockResolvedValue(mockJob);
      mockRetry.mockResolvedValue(undefined);

      const result = await service.retryFailedJob('failed-1');

      expect(mockGetJob).toHaveBeenCalledWith('failed-1');
      expect(mockRetry).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw if job not found', async () => {
      mockGetJob.mockResolvedValue(null);

      await expect(service.retryFailedJob('nonexistent')).rejects.toThrow(
        'Job nonexistent not found',
      );
    });
  });

  describe('retryAllFailed', () => {
    it('should retry all failed jobs and return count', async () => {
      const jobs = [
        { retry: jest.fn() },
        { retry: jest.fn() },
        { retry: jest.fn() },
      ];
      mockGetJobs.mockResolvedValue(jobs);

      const result = await service.retryAllFailed();

      expect(mockGetJobs).toHaveBeenCalledWith(['failed']);
      expect(jobs[0].retry).toHaveBeenCalled();
      expect(jobs[1].retry).toHaveBeenCalled();
      expect(jobs[2].retry).toHaveBeenCalled();
      expect(result).toBe(3);
    });

    it('should return 0 when no failed jobs', async () => {
      mockGetJobs.mockResolvedValue([]);

      const result = await service.retryAllFailed();

      expect(result).toBe(0);
    });
  });

  describe('getJobStatus', () => {
    it('should return the job for a given ID', async () => {
      const mockJob = { id: 'job-1', data: {} };
      mockGetJob.mockResolvedValue(mockJob);

      const result = await service.getJobStatus('job-1');

      expect(mockGetJob).toHaveBeenCalledWith('job-1');
      expect(result).toBe(mockJob);
    });

    it('should return null for nonexistent job', async () => {
      mockGetJob.mockResolvedValue(null);

      const result = await service.getJobStatus('missing');

      expect(result).toBeNull();
    });
  });

  describe('getQueueMetrics', () => {
    it('should return counts for all job states', async () => {
      mockGetJobCountByTypes
        .mockResolvedValueOnce(10) // waiting
        .mockResolvedValueOnce(3) // active
        .mockResolvedValueOnce(450) // completed
        .mockResolvedValueOnce(2) // failed
        .mockResolvedValueOnce(1); // delayed

      const result = await service.getQueueMetrics();

      expect(result).toEqual({
        waiting: 10,
        active: 3,
        completed: 450,
        failed: 2,
        delayed: 1,
      });
    });
  });

  describe('pauseQueue', () => {
    it('should pause the queue', async () => {
      await service.pauseQueue();
      expect(mockPause).toHaveBeenCalled();
    });
  });

  describe('resumeQueue', () => {
    it('should resume the queue', async () => {
      await service.resumeQueue();
      expect(mockResume).toHaveBeenCalled();
    });
  });
});
