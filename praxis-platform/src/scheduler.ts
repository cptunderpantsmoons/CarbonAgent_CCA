/**
 * Task Scheduler - Scheduled task management
 */

import cron from 'node-cron';
import { logger } from './utils/logger.js';

export interface ScheduledTask {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
}

export class TaskScheduler {
  private tasks = new Map<string, cron.ScheduledTask>();
  private isRunning = false;

  async initialize(): Promise<void> {
    logger.info('Initializing Task Scheduler...');
    // Scheduler is ready to accept task registrations
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Task scheduler is already running');
      return;
    }

    logger.info('Starting Task Scheduler...');

    // Start all registered tasks
    for (const [name, task] of this.tasks) {
      if (!task.getStatus() === 'executing') {
        task.start();
        logger.info(`Started scheduled task: ${name}`);
      }
    }

    this.isRunning = true;
    logger.info('Task Scheduler started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Task scheduler is not running');
      return;
    }

    logger.info('Stopping Task Scheduler...');

    // Stop all tasks
    for (const [name, task] of this.tasks) {
      task.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    }

    this.isRunning = false;
    logger.info('Task Scheduler stopped');
  }

  registerTask(task: ScheduledTask): void {
    if (this.tasks.has(task.name)) {
      logger.warn(`Task ${task.name} is already registered, skipping...`);
      return;
    }

    // Validate cron schedule
    if (!cron.validate(task.schedule)) {
      throw new Error(`Invalid cron schedule for task ${task.name}: ${task.schedule}`);
    }

    // Create scheduled task
    const scheduledTask = cron.createTask(task.schedule, async () => {
      logger.info(`Executing scheduled task: ${task.name}`);
      try {
        await task.handler();
        logger.info(`Task ${task.name} completed successfully`);
      } catch (error) {
        logger.error(`Task ${task.name} failed:`, error);
      }
    });

    this.tasks.set(task.name, scheduledTask);
    logger.info(`Registered scheduled task: ${task.name} (${task.schedule})`);

    // Auto-start if scheduler is already running
    if (this.isRunning) {
      scheduledTask.start();
    }
  }

  unregisterTask(taskName: string): void {
    const task = this.tasks.get(taskName);
    if (!task) {
      logger.warn(`Task ${taskName} not found, cannot unregister`);
      return;
    }

    task.stop();
    this.tasks.delete(taskName);
    logger.info(`Unregistered scheduled task: ${taskName}`);
  }

  getQueueDepth(): number {
    // Return number of pending/executing tasks
    return this.tasks.size;
  }

  getTaskStatus(taskName: string): string {
    const task = this.tasks.get(taskName);
    if (!task) {
      return 'not_found';
    }

    const status = task.getStatus();
    return status || 'unknown';
  }
}
