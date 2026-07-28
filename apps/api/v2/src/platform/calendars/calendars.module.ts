import { Module } from "@nestjs/common";
import { AppsRepository } from "@/modules/apps/apps.repository";
import { CredentialsRepository } from "@/modules/credentials/credentials.repository";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { RedisModule } from "@/modules/redis/redis.module";
import { SelectedCalendarsRepository } from "@/modules/selected-calendars/selected-calendars.repository";
import { TokensModule } from "@/modules/tokens/tokens.module";
import { UsersModule } from "@/modules/users/users.module";
import { BookingReferencesRepository_2024_08_13 } from "@/platform/bookings/2024-08-13/repositories/booking-references.repository";
import { BookingsRepository_2024_08_13 } from "@/platform/bookings/2024-08-13/repositories/bookings.repository";
import { CalendarsRepository } from "@/platform/calendars/calendars.repository";
import { CalendarsController } from "@/platform/calendars/controllers/calendars.controller";
import { AppleCalendarService } from "@/platform/calendars/services/apple-calendar.service";
import { CalendarsService } from "@/platform/calendars/services/calendars.service";
import { CalendarsCacheService } from "@/platform/calendars/services/calendars-cache.service";
import { GoogleCalendarService } from "@/platform/calendars/services/gcal.service";
import { OutlookService } from "@/platform/calendars/services/outlook.service";

@Module({
  imports: [PrismaModule, UsersModule, TokensModule, RedisModule],
  providers: [
    CredentialsRepository,
    CalendarsService,
    CalendarsCacheService,
    OutlookService,
    GoogleCalendarService,
    AppleCalendarService,
    SelectedCalendarsRepository,
    AppsRepository,
    CalendarsRepository,
    BookingsRepository_2024_08_13,
    BookingReferencesRepository_2024_08_13,
  ],
  controllers: [CalendarsController],
  exports: [CalendarsService, GoogleCalendarService],
})
export class CalendarsModule {}
