/**
 * service controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::service.service', ({ strapi }) => ({
  // Custom action to refresh review statistics for all services
  async refreshReviewStats(ctx) {
    try {
      const services = await strapi.entityService.findMany('api::service.service', {
        fields: ['id', 'name'],
      });

      let updatedCount = 0;

      for (const service of services) {
        const reviewCount = await strapi.db.query('api::review.review').count({
          where: {
            service: service.id,
            isPublished: true,
          },
        });

        let averageRating = 0;
        if (reviewCount > 0) {
          const reviews = await strapi.db.query('api::review.review').findMany({
            where: {
              service: service.id,
              isPublished: true,
            },
            select: ['voting'],
          });

          const totalVotes = reviews.reduce((sum, review) => sum + review.voting, 0);
          averageRating = totalVotes / reviewCount;
        }

        await strapi.db.query('api::service.service').update({
          where: { id: service.id },
          data: {
            reviewCount,
            averageRating,
          },
        });

        if (reviewCount > 0) {
          updatedCount++;
          strapi.log.info(`Updated ${service.name}: ${reviewCount} reviews, avg ${averageRating.toFixed(2)}`);
        }
      }

      ctx.body = { 
        success: true, 
        message: `Updated review stats for ${updatedCount} services with reviews`,
        totalServices: services.length
      };
    } catch (error) {
      strapi.log.error('Error refreshing review stats:', error);
      ctx.throw(500, 'Failed to refresh review stats');
    }
  }
}));
