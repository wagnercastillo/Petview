export const EnvConfiguration = () => ({
  // Configuración general
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '', 10) || 3002,

  // Configuración de MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/attendance_db?authSource=admin',
    database: process.env.MONGODB_DATABASE || 'attendance_db',
  },

  // Configuración de RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672',
    user: process.env.RABBITMQ_USER || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'admin123',
    
    // Colas específicas para comunicación con microservicio A
    queues: {
      employeeValidation: 'employee.validation',
      employeeValidationReply: 'employee.validation.reply',
    }
  },

  // Configuración de la aplicación
  app: {
    name: 'Microservicio B - Control de Asistencia',
    version: '1.0.0',
    description: 'Sistema de registro de entradas y salidas de empleados',
  }
});