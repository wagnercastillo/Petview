import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttendanceModule } from './attendance/attendance.module';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        if (uri) {
          console.log('Conectando a MongoDB:', uri.replace(/\/\/.*@/, '//***:***@'));
        } else {
          console.warn('MONGODB_URI no está definido.');
        }

        return {
          uri,
          retryWrites: true,
          w: 'majority',
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          autoIndex: true,
        };
      },
      inject: [ConfigService],
    }),

    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('🔧 Configuración de la aplicación:');
    console.log('   - Puerto:', this.configService.get('PORT', 3002));
    console.log('   - Entorno:', this.configService.get('NODE_ENV', 'development'));
    console.log('   - MongoDB URI configurada:', !!this.configService.get('MONGODB_URI'));
    console.log('   - RabbitMQ URL configurada:', !!this.configService.get('RABBITMQ_URL'));
  }
}
