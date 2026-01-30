export const QUEUES = {
  ICELL: 'icell',
  SUBSCRIPTION_SCHEDULED_JOBS: 'subscription-scheduled-jobs',
  QUIZ_JOBS: 'quiz-jobs',
  SECURE_D: 'secure-d',
  SECURE_D_RETRY: 'secure-d-retry', // New queue for retry jobs
  TRAFFIC_MONITOR: 'traffic-monitor',
};

export const ICELL_PROCESSOR_JOBS = {
  PROCESS_SMS_REQUEST: 'process-sms-request',
  PROCESS_DATASYNC_REQUEST: 'process-datasync-request',
};

export const SUBSCRIPTION_SCHEDULED_JOBS = {
  PROCESS_SUBSCRIPTION_EXPIRATIONS: 'process-subscriptions-expirations',
};

export const QUIZ_JOBS = {
  PROCESS_QUIZ_GRADING: 'process-quiz-grading',
  PROCESS_QUIZ_WINNING_REWARDS: 'process-quiz-winning-rewards',
};

export const SECURE_D_PROCESSOR_JOBS = {
  PROCESS_SECURE_D_NOTIFICATION: 'process-secure-d-notification',
};

export const SECURE_D_RETRY_JOBS = {
  PROCESS_SECURE_D_RETRY: 'process-secure-d-retry',
};

export const TRAFFIC_MONITOR_JOBS = {
  SEND_TRAFFIC_REPORT: 'send-traffic-report',
};
