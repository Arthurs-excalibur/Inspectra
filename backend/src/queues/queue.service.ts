import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";

type QueueJob<T> = {
  name: string;
  data: T;
};

@Injectable()
export class QueueService {
  private readonly localQueues = new Map<string, QueueJob<unknown>[]>();
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly config: ConfigService) {}

  async enqueue<T>(queueName: "browser" | "reports" | "screenshots", name: string, data: T) {
    const redisUrl = this.config.get<string>("REDIS_URL");

    if (!redisUrl) {
      const queue = this.localQueues.get(queueName) ?? [];
      queue.push({ name, data });
      this.localQueues.set(queueName, queue);
      return { id: `${queueName}:${queue.length}`, local: true };
    }

    const queue = this.getBullQueue(queueName, redisUrl);
    const job = await queue.add(name, data);
    return { id: job.id, local: false };
  }

  private getBullQueue(queueName: string, redisUrl: string) {
    const existing = this.queues.get(queueName);
    if (existing) {
      return existing;
    }

    const queue = new Queue(queueName, {
      connection: {
        url: redisUrl,
      },
    });
    this.queues.set(queueName, queue);
    return queue;
  }
}
