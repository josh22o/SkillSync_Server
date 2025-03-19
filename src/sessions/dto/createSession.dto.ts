export class CreateSessionDto {
    readonly mentorId: number;
    readonly menteeId: number;
    readonly scheduledAt: Date; // ISO string format recommended
    readonly status: string;
  }
  