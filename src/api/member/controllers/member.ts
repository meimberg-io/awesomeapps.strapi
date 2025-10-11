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

      // 1. Find or create Strapi user for authentication
      const user = await strapi.service('api::member.member').findOrCreateStrapiUser({
        email,
        name,
        provider: provider || 'google',
      });

      // 2. Find or create member linked to this user
      const member = await strapi.service('api::member.member').findOrCreateFromOAuth({
        email,
        name,
        avatarUrl: picture,
        provider: provider || 'google',
        oauthId: sub,
        strapiUserId: user.id,
      });

      // 3. Generate JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        memberId: member.id,
      });

      return ctx.send({
        jwt,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        member: member,
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
      const { serviceId, serviceDocumentId } = ctx.request.body;

      // Accept either numeric ID or documentId
      let actualServiceId;
      if (serviceDocumentId) {
        actualServiceId = await strapi.service('api::member.member').getServiceIdByDocumentId(serviceDocumentId);
      } else if (serviceId) {
        // Check if serviceId is numeric or documentId string
        const isNumeric = /^\d+$/.test(String(serviceId));
        actualServiceId = isNumeric 
          ? serviceId 
          : await strapi.service('api::member.member').getServiceIdByDocumentId(serviceId);
      }

      if (!actualServiceId) {
        return ctx.badRequest('serviceId or serviceDocumentId is required');
      }

      const result = await strapi.service('api::member.member').addFavorite(
        parseInt(id),
        parseInt(actualServiceId)
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

      // Check if serviceId is a documentId (string) or numeric ID
      // If it's not a valid number, treat it as documentId
      const isNumeric = /^\d+$/.test(serviceId);
      const actualServiceId = isNumeric
        ? serviceId
        : await strapi.service('api::member.member').getServiceIdByDocumentId(serviceId);

      if (!actualServiceId) {
        return ctx.badRequest(`Service not found with identifier: ${serviceId}`);
      }

      const result = await strapi.service('api::member.member').removeFavorite(
        parseInt(id),
        parseInt(actualServiceId)
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

      // Check if serviceId is a documentId (string) or numeric ID
      const isNumeric = /^\d+$/.test(serviceId);
      const actualServiceId = isNumeric
        ? serviceId
        : await strapi.service('api::member.member').getServiceIdByDocumentId(serviceId);

      const isFavorite = await strapi.service('api::member.member').isFavorite(
        parseInt(id),
        parseInt(actualServiceId)
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
