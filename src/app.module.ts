import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { UsersModule } from './users/users.module';
import { MentorsModule } from './mentors/mentor.module';
import { MenteesModule } from './mentees/mentees.module';
import { SessionsModule } from './sessions/sessions.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()), // Ensure it returns TypeOrmModuleOptions
    UsersModule,
    MentorsModule,
    MenteesModule,
    SessionsModule,
    PaymentsModule,
    ReviewsModule,
    AuthModule,
  ],
})
export class AppModule {}
