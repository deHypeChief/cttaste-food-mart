import { describe, it, expect } from 'bun:test';
import { initializeCronJobs, stopCronJobs, areCronJobsRunning, getCronStats } from '../utils/cron/index';

describe('Cron Job System', () => {
    
    it('should initialize cron jobs', async () => {
        const cronScheduler = await initializeCronJobs();
        expect(cronScheduler).toBeDefined();
        expect(areCronJobsRunning()).toBe(true);
    });

    it('should get cron stats', async () => {
        const stats = await getCronStats();
        expect(stats).toBeDefined();
        expect(stats).toHaveProperty('isRunning');
        expect(stats).toHaveProperty('stats');
        expect(stats).toHaveProperty('lastHealthCheck');
    });

    it('should stop cron jobs', async () => {
        await stopCronJobs();
        expect(areCronJobsRunning()).toBe(false);
    });

    // Integration test with actual task verification
    it('should handle task verification process', async () => {
        // This would require actual database setup and tasks
        // For now, just verify the service can be created
        const { default: TaskVerificationCronService } = await import('../utils/cron/taskVerification.cron');
        const service = new TaskVerificationCronService();
        
        expect(service).toBeDefined();
        expect(typeof service.getVerificationStats).toBe('function');
        
        // Cleanup
        await service.cleanup();
    });
});

describe('Task Verification Cron Service', () => {
    it('should create instance', async () => {
        const { default: TaskVerificationCronService } = await import('../utils/cron/taskVerification.cron');
        const service = new TaskVerificationCronService();
        
        expect(service).toBeDefined();
        
        // Test stats method
        const stats = await service.getVerificationStats();
        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('pending');
        expect(stats).toHaveProperty('completed');
        expect(stats).toHaveProperty('expired');
        expect(stats).toHaveProperty('notActive');
        
        // Cleanup
        await service.cleanup();
    });
});
