export class CreateReviewDto {
    readonly userId: number;
    readonly sessionId: number;
    readonly rating: number;
    readonly comment?: string;
  }
  