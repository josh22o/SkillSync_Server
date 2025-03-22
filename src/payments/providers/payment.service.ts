import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { UpdatePaymentDto } from '../dto/updatePayment.dto';
import { Payment } from '../payment.entity';
import { RedisService } from 'src/common/redis/cache.service';

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];
  private idCounter = 1;

  constructor(private readonly redisService: RedisService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const newPayment: Payment = { id: this.idCounter++, ...createPaymentDto };
    this.payments.push(newPayment);

    // Cache the new payment
    await this.redisService.set(`payment:${newPayment.id}`, newPayment, 1800); // 30 minutes TTL

    // Invalidate the payments list cache
    await this.redisService.delete('payments:all');

    // If this payment is associated with a user, invalidate user's payments cache
    if (newPayment.userId) {
      await this.redisService.delete(`user:${newPayment.userId}:payments`);
    }

    return newPayment;
  }

  async findAll(): Promise<Payment[]> {
    // Try to get from cache first
    const cachedPayments =
      await this.redisService.get<Payment[]>('payments:all');
    if (cachedPayments) {
      return cachedPayments;
    }

    // If not in cache, store in cache (15 minutes TTL)
    await this.redisService.set('payments:all', this.payments, 900);

    return this.payments;
  }

  async findPaymentsByUserId(userId: number): Promise<Payment[]> {
    // Try to get user payments from cache
    const cacheKey = `user:${userId}:payments`;
    const cachedPayments = await this.redisService.get<Payment[]>(cacheKey);
    if (cachedPayments) {
      return cachedPayments;
    }

    // If not in cache, filter payments for this user
    const userPayments = this.payments.filter(
      (payment) => payment.userId === userId,
    );

    // Cache the filtered payments (15 minutes TTL)
    await this.redisService.set(cacheKey, userPayments, 900);

    return userPayments;
  }

  async findOne(id: number): Promise<Payment> {
    // Try to get from cache first
    const cachedPayment = await this.redisService.get<Payment>(`payment:${id}`);
    if (cachedPayment) {
      return cachedPayment;
    }

    // If not in cache, get from in-memory storage
    const payment = this.payments.find((payment) => payment.id === id);

    // Cache the result if found (30 minutes TTL)
    if (payment) {
      await this.redisService.set(`payment:${id}`, payment, 1800);
    }

    return payment;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const index = this.payments.findIndex((payment) => payment.id === id);
    if (index < 0) return null;

    // Store the old user ID before update
    const oldUserId = this.payments[index].userId;

    this.payments[index] = { ...this.payments[index], ...updatePaymentDto };

    // Update cache with new data
    await this.redisService.set(`payment:${id}`, this.payments[index], 1800);

    // Invalidate related caches
    await this.redisService.delete('payments:all');

    // If user ID changed, invalidate both old and new user payment caches
    if (oldUserId) {
      await this.redisService.delete(`user:${oldUserId}:payments`);
    }

    if (this.payments[index].userId) {
      await this.redisService.delete(
        `user:${this.payments[index].userId}:payments`,
      );
    }

    return this.payments[index];
  }

  async remove(id: number): Promise<boolean> {
    // Find the payment first to get its userId
    const payment = this.payments.find((payment) => payment.id === id);
    const userId = payment?.userId;

    const initialLength = this.payments.length;
    this.payments = this.payments.filter((payment) => payment.id !== id);

    // Delete from cache
    await this.redisService.delete(`payment:${id}`);

    // Invalidate related caches
    await this.redisService.delete('payments:all');

    if (userId) {
      await this.redisService.delete(`user:${userId}:payments`);
    }

    return this.payments.length < initialLength;
  }
}
