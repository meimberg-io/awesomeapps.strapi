/**
 * review service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::review.review', ({ strapi }) => ({
  /**
   * Create a new review
   */
  async createReview(reviewData: {
    reviewtext: string;
    voting: number;
    memberId: number;
    serviceId: number;
  }) {
    const { reviewtext, voting, memberId, serviceId } = reviewData;

    // Validation
    if (!reviewtext || reviewtext.length < 10 || reviewtext.length > 2000) {
      throw new Error('Review text must be between 10 and 2000 characters');
    }

    if (voting < 1 || voting > 5) {
      throw new Error('Voting must be between 1 and 5');
    }

    // Check if member exists
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if service exists
    const service = await strapi.db.query('api::service.service').findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Check if member already reviewed this service
    const existingReview = await strapi.db.query('api::review.review').findOne({
      where: {
        member: memberId,
        service: serviceId,
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this service. Please update your existing review.');
    }

    // Create the review
    const review = await strapi.db.query('api::review.review').create({
      data: {
        reviewtext,
        voting,
        member: memberId,
        service: serviceId,
        isPublished: true,
        helpfulCount: 0,
      },
      populate: {
        member: {
          select: ['username', 'displayName', 'avatarUrl'],
        },
        service: {
          select: ['name', 'slug'],
        },
      },
    });

    return review;
  },

  /**
   * Update an existing review
   */
  async updateReview(reviewId: number, memberId: number, updateData: {
    reviewtext?: string;
    voting?: number;
  }) {
    const { reviewtext, voting } = updateData;

    // Find the review
    const review = await strapi.db.query('api::review.review').findOne({
      where: { id: reviewId },
      populate: ['member'],
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Check if the member owns this review
    if (review.member.id !== memberId) {
      throw new Error('You can only update your own reviews');
    }

    // Validation
    if (reviewtext && (reviewtext.length < 10 || reviewtext.length > 2000)) {
      throw new Error('Review text must be between 10 and 2000 characters');
    }

    if (voting && (voting < 1 || voting > 5)) {
      throw new Error('Voting must be between 1 and 5');
    }

    // Update the review
    const updatedReview = await strapi.db.query('api::review.review').update({
      where: { id: reviewId },
      data: {
        ...(reviewtext && { reviewtext }),
        ...(voting && { voting }),
      },
      populate: {
        member: {
          select: ['username', 'displayName', 'avatarUrl'],
        },
        service: {
          select: ['name', 'slug'],
        },
      },
    });

    return updatedReview;
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number, memberId: number) {
    // Find the review
    const review = await strapi.db.query('api::review.review').findOne({
      where: { id: reviewId },
      populate: ['member'],
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Check if the member owns this review
    if (review.member.id !== memberId) {
      throw new Error('You can only delete your own reviews');
    }

    // Delete the review
    await strapi.db.query('api::review.review').delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Review deleted successfully' };
  },

  /**
   * Get reviews for a service
   */
  async getServiceReviews(serviceId: number, options: {
    page?: number;
    pageSize?: number;
    sortBy?: 'createdAt' | 'voting' | 'helpfulCount';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const reviews = await strapi.db.query('api::review.review').findMany({
      where: {
        service: serviceId,
        isPublished: true,
      },
      populate: {
        member: {
          select: ['username', 'displayName', 'avatarUrl'],
        },
      },
      orderBy: { [sortBy]: sortOrder },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // Get total count for pagination
    const total = await strapi.db.query('api::review.review').count({
      where: {
        service: serviceId,
        isPublished: true,
      },
    });

    return {
      data: reviews,
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    };
  },

  /**
   * Get reviews by a member
   */
  async getMemberReviews(memberId: number) {
    return await strapi.db.query('api::review.review').findMany({
      where: {
        member: memberId,
      },
      populate: {
        service: {
          select: ['name', 'slug', 'logo', 'thumbnail'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get average rating for a service
   */
  async getServiceAverageRating(serviceId: number) {
    const reviews = await strapi.db.query('api::review.review').findMany({
      where: {
        service: serviceId,
        isPublished: true,
      },
      select: ['voting'],
    });

    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.voting, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: reviews.length,
    };
  },

  /**
   * Increment helpful count
   */
  async incrementHelpful(reviewId: number) {
    const review = await strapi.db.query('api::review.review').findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return await strapi.db.query('api::review.review').update({
      where: { id: reviewId },
      data: {
        helpfulCount: (review.helpfulCount || 0) + 1,
      },
    });
  },
}));
