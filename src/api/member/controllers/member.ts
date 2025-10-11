/**
 * member controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::member.member' as any, ({ strapi }) => ({
  /**
   * Get current member (from OAuth session)
   * POST /api/members/me
   */
  async me(ctx) {
    try {
      const { email, name, picture, provider, sub } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Find or create member from OAuth data
      const member = await strapi.service('api::member.member').findOrCreateFromOAuth({
        email,
        name,
        avatarUrl: picture,
        provider: provider || 'google',
        oauthId: sub,
      });

      return ctx.send({
        data: member,
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get member profile with statistics
   * GET /api/members/:id/profile
   */
  async profile(ctx) {
    try {
      const { id } = ctx.params;

      const member = await strapi.service('api::member.member').findOneWithRelations(parseInt(id));
      if (!member) {
        return ctx.notFound('Member not found');
      }

      const statistics = await strapi.service('api::member.member').getStatistics(parseInt(id));

      return ctx.send({
        data: {
          ...member,
          statistics,
        },
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Update member profile
   * PUT /api/members/:id/profile
   */
  async updateProfile(ctx) {
    try {
      const { id } = ctx.params;
      const { username, displayName, bio } = ctx.request.body;

      const updatedMember = await strapi.service('api::member.member').updateProfile(
        parseInt(id),
        { username, displayName, bio }
      );

      return ctx.send({
        data: updatedMember,
      });
    } catch (error) {
      if (error.message === 'Username already taken') {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Add service to favorites
   * POST /api/members/:id/favorites
   */
  async addFavorite(ctx) {
    try {
      const { id } = ctx.params;
      const { serviceId } = ctx.request.body;

      if (!serviceId) {
        return ctx.badRequest('serviceId is required');
      }

      const result = await strapi.service('api::member.member').addFavorite(
        parseInt(id),
        parseInt(serviceId)
      );

      return ctx.send(result);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Remove service from favorites
   * DELETE /api/members/:id/favorites/:serviceId
   */
  async removeFavorite(ctx) {
    try {
      const { id, serviceId } = ctx.params;

      const result = await strapi.service('api::member.member').removeFavorite(
        parseInt(id),
        parseInt(serviceId)
      );

      return ctx.send(result);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Check if service is favorited
   * GET /api/members/:id/favorites/:serviceId/check
   */
  async checkFavorite(ctx) {
    try {
      const { id, serviceId } = ctx.params;

      const isFavorite = await strapi.service('api::member.member').isFavorite(
        parseInt(id),
        parseInt(serviceId)
      );

      return ctx.send({
        isFavorite,
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get member favorites
   * GET /api/members/:id/favorites
   */
  async getFavorites(ctx) {
    try {
      const { id } = ctx.params;

      const member = await strapi.service('api::member.member').findOneWithRelations(parseInt(id));
      if (!member) {
        return ctx.notFound('Member not found');
      }

      return ctx.send({
        data: member.favorites || [],
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get member reviews
   * GET /api/members/:id/reviews
   */
  async getReviews(ctx) {
    try {
      const { id } = ctx.params;

      const reviews = await strapi.service('api::review.review').getMemberReviews(parseInt(id));

      return ctx.send({
        data: reviews,
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get member statistics
   * GET /api/members/:id/statistics
   */
  async getStatistics(ctx) {
    try {
      const { id } = ctx.params;

      const statistics = await strapi.service('api::member.member').getStatistics(parseInt(id));

      return ctx.send({
        data: statistics,
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },
}));
