import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ required: true, type: String })
  employee_id: string;

  @Prop({ required: true, type: String })
  date: string; // Formato: YYYY-MM-DD

  @Prop({ required: true, type: String })
  time: string; // Formato: HH:MM:SS

  @Prop({
    required: true,
    enum: ['entry', 'exit'],
    type: String,
  })
  type: 'entry' | 'exit';

  @Prop({
    required: true,
    enum: ['pending', 'validated', 'rejected'],
    type: String,
    default: 'pending',
  })
  status: 'pending' | 'validated' | 'rejected';

  @Prop({ required: false, type: String })
  rejection_reason?: string;

  @Prop({ required: false, type: String })
  employee_name?: string;

  @Prop({ required: false, type: Date })
  validated_at?: Date;

  @Prop()
  validation_notes?: string;

  @Prop({ default: 0 })
  retry_count?: number;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ employee_id: 1, date: 1 });
AttendanceSchema.index({ date: 1, time: 1 });
AttendanceSchema.index({ status: 1 });
