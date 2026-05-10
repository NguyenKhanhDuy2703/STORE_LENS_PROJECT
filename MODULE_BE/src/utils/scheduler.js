/**
 * scheduler.js — Background job scheduler
 * 
 * Gọi các worker định kỳ:
 * - Camera health check mỗi 30 giây
 * - LocationStats processing mỗi phút
 */

const logger = require('./logging');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  addJob(name, fn, intervalMs, { maxRetries = 3, retryDelay = 5000 } = {}) {
    if (this.jobs.has(name)) {
      logger.warn(`[scheduler] Job "${name}" already exists. Skipping.`);
      return;
    }

    const interval = setInterval(async () => {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          await fn();
          break; // Success
        } catch (err) {
          retries++;
          if (retries >= maxRetries) {
            logger.error(`[scheduler] Job "${name}" failed after ${maxRetries} retries: ${err.message}`);
          } else {
            logger.warn(`[scheduler] Job "${name}" retry ${retries}/${maxRetries - 1} after ${retryDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    }, intervalMs);

    this.jobs.set(name, { interval, intervalMs, fn });
    logger.info(`[scheduler] Started job: ${name} (interval: ${intervalMs}ms)`);
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      clearInterval(job.interval);
      this.jobs.delete(name);
      logger.info(`[scheduler] Stopped job: ${name}`);
    }
  }

  stopAll() {
    for (const [name, { interval }] of this.jobs) {
      clearInterval(interval);
      logger.info(`[scheduler] Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  getStatus() {
    return Array.from(this.jobs.entries()).map(([name, { intervalMs }]) => ({
      name,
      interval: `${intervalMs}ms`,
      status: 'running'
    }));
  }
}

module.exports = new Scheduler();
