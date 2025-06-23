import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  // Variables de entorno general
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .port()
    .default(3002),

  // Variables de MongoDB
  MONGODB_URI: Joi.string()
    .uri()
    .required()
    .description('URI de conexión a MongoDB'),

  MONGODB_DATABASE: Joi.string()
    .default('attendance_db'),

  // Variables de RabbitMQ
  RABBITMQ_URL: Joi.string()
    .uri()
    .required()
    .description('URL de conexión a RabbitMQ'),

  RABBITMQ_USER: Joi.string()
    .default('admin'),

  RABBITMQ_PASSWORD: Joi.string()
    .default('admin123'),
});