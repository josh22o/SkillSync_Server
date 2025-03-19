export class CreatePaymentDto {
    readonly userId: number;
    readonly amount: number;
    readonly method: string;
    readonly status: string;
  }
  