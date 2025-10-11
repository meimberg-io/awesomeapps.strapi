/**
 * review controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::review.review' as any, ({ strapi }) => ({
  /**
   * Create a new review
   * POST /api/reviews
   */
  async create(ctx) {
    try {
      const { reviewtext, voting, memberId, serviceId } = ctx.request.body;

      if (!reviewtext || !voting || !memberId || !serviceId) {
        return ctx.badRequest('reviewtext, voting, memberId, and serviceId are required');
      }

      const review = await strapi.service('api::review.review').createReview({
        reviewtext,
        voting: parseInt(voting),
        memberId: parseInt(memberId),
        serviceId: parseInt(serviceId),
      });

      return ctx.send({
        data: review,
      });
    } catch (error) {
      if (error.message.includes('already reviewed')) {
        return ctx.badRequest(error.message);
      }
      if (error.message.includes('not found')) {
        return ctx.notFound(error.message);
      }
      if (error.message.includes('must be between')) {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Update a review
   * PUT /api/reviews/:id
   */
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { reviewtext, voting, memberId } = ctx.request.body;

      if (!memberId) {
        return ctx.badRequest('memberId is required');
      }

      const review = await strapi.service('api::review.review').updateReview(
        parseInt(id),
        parseInt(memberId),
        { reviewtext, voting: voting ? parseInt(voting) : undefined }
      );

      return ctx.send({
        data: review,
      });
    } catch (error) {
      if (error.message.includes('your own')) {
        return ctx.forbidden(error.message);
      }
      if (error.message.includes('not found')) {
        return ctx.notFound(error.message);
      }
      if (error.message.includes('must be between')) {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const { memberId } = ctx.request.body;

      if (!memberId) {
        return ctx.badRequest('memberId is required');
      }

      const result = await strapi.service('api::review.review').deleteReview(
        parseInt(id),
        parseInt(memberId)
      );

      return ctx.send(result);
    } catch (error) {
      if (error.message.includes('your own')) {
        return ctx.forbidden(error.message);
      }
      if (error.message.includes('not found')) {
        return ctx.notFound(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Get reviews for a service
   * GET /api/reviews/service/:serviceId
   */
  async byService(ctx) {
    try {
      const { serviceId } = ctx.params;
      const { page, pageSize, sortBy, sortOrder } = ctx.query;

      const result = await strapi.service('api::review.review').getServiceReviews(
        parseInt(serviceId),
        {
          page: page ? parseInt(page as string) : undefined,
          pageSize: pageSize ? parseInt(pageSize as string) : undefined,
          sortBy: sortBy as 'createdAt' | 'voting' | 'helpfulCount' | undefined,
          sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        }
      );

      return ctx.send(result);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get average rating for a service
   * GET /api/reviews/service/:serviceId/average
   */
  async getAverageRating(ctx) {
    try {
      const { serviceId } = ctx.params;

      const result = await strapi.service('api::review.review').getServiceAverageRating(
        parseInt(serviceId)
      );

      return ctx.send({
        data: result,
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  async markHelpful(ctx) {
    try {
      const { id } = ctx.params;

      const review = await strapi.service('api::review.review').incrementHelpful(parseInt(id));

      return ctx.send({
        data: review,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return ctx.notFound(error.message);
      }
      ctx.throw(500, error);
    }
  },
}));
