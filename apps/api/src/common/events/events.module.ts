import { Global, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { RealtimeModule } from '../../modules/realtime/realtime.module';

@Global()
@Module({
  imports: [RealtimeModule],
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {}
