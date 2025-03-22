import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from '../dto/createReviewdto';
import { UpdateReviewDto } from '../dto/updateReview.dto';
import { Review } from '../review.entity';

@Injectable()
export class ReviewService {
  private reviews: Review[] = [];
  private idCounter = 1;

  create(createReviewDto: CreateReviewDto): Review {
    const newReview: Review = { id: this.idCounter++, ...createReviewDto };
    this.reviews.push(newReview);
    return newReview;
  }

  findAll(): Review[] {
    return this.reviews;
  }

  findOne(id: number): Review {
    return this.reviews.find((review) => review.id === id);
  }

  update(id: number, updateReviewDto: UpdateReviewDto): Review {
    const index = this.reviews.findIndex((review) => review.id === id);
    if (index < 0) return null;
    this.reviews[index] = { ...this.reviews[index], ...updateReviewDto };
    return this.reviews[index];
  }

  remove(id: number): boolean {
    const initialLength = this.reviews.length;
    this.reviews = this.reviews.filter((review) => review.id !== id);
    return this.reviews.length < initialLength;
  }
}
