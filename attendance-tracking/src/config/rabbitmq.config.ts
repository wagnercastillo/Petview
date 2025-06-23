export const RABBITMQ_QUEUES = {
  EMPLOYEE_VALIDATION: 'employee_validation_queue',
  ATTENDANCE_RESPONSES: 'attendance_responses_queue',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  VALIDATE_EMPLOYEE: 'validate_employee',
  EMPLOYEE_VALIDATED: 'employee_validated',
  EMPLOYEE_REJECTED: 'employee_rejected',
} as const;

export const RABBITMQ_CONFIG = {
  urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq-pentview:5672'],
  queueOptions: {
    durable: true,
    arguments: {
      'x-message-ttl': 86400000, // 24 horas
    },
  },
  socketOptions: {
    keepAlive: true,
    heartbeat: 30,
  },
};
