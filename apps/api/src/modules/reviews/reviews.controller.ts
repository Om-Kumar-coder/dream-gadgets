import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { IsString, IsNumber, IsOptional, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  comment: string;

  @IsString()
  clientName: string;
}

@ApiTags('Reviews')
@Controller('public/products')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for a product' })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const reviews = await this.reviewsService.getReviews(id, page ?? 1, limit ?? 20);
    const summary = await this.reviewsService.getRatingSummary(id);
    return { data: reviews, summary };
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add a review for a product' })
  async createReview(
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub ?? null;
    const review = await this.reviewsService.createReview(id, {
      rating: dto.rating,
      comment: dto.comment,
      clientName: dto.clientName,
      userId,
    });
    return { data: review };
  }
}
