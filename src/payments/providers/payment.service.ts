import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { UpdatePaymentDto } from '../dto/updatePayment.dto';
import { Payment } from '../payment.entity';

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];
  private idCounter = 1;

  create(createPaymentDto: CreatePaymentDto): Payment {
    const newPayment: Payment = { id: this.idCounter++, ...createPaymentDto };
    this.payments.push(newPayment);
    return newPayment;
  }

  findAll(): Payment[] {
    return this.payments;
  }

  findOne(id: number): Payment {
    return this.payments.find(payment => payment.id === id);
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto): Payment {
    const index = this.payments.findIndex(payment => payment.id === id);
    if (index < 0) return null;
    this.payments[index] = { ...this.payments[index], ...updatePaymentDto };
    return this.payments[index];
  }

  remove(id: number): boolean {
    const initialLength = this.payments.length;
    this.payments = this.payments.filter(payment => payment.id !== id);
    return this.payments.length < initialLength;
  }
}
