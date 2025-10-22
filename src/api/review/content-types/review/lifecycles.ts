import { factories } from '@strapi/strapi';

export default {
    async afterCreate(event) {
        await updateServiceReviewStats(event);
    },

    async afterUpdate(event) {
        await updateServiceReviewStats(event);
    },

    async afterDelete(event) {
        await updateServiceReviewStats(event);
    },
};

async function updateServiceReviewStats(event) {
    const { result, params } = event;
    
    // Get strapi instance
    const strapi = (global as any).strapi;
    
    if (!strapi) {
        console.error('Strapi instance not available in lifecycle hook');
        return;
    }
    
    // Get the service ID by fetching the review with populated service relation
    let serviceId = null;
    
    try {
        // Fetch the review with populated service relation to get the actual service ID
        const reviewWithService = await strapi.db.query('api::review.review').findOne({
            where: { id: result.id },
            populate: ['service']
        });
        
        if (reviewWithService?.service?.id) {
            serviceId = reviewWithService.service.id;
        } else {
            strapi.log.warn('Could not find service ID from populated relation');
            return;
        }
    } catch (error) {
        strapi.log.error('Error fetching review with service relation:', error);
        return;
    }

    try {
        // Count only published reviews using publishedAt field
        const reviewCount = await strapi.db.query('api::review.review').count({
            where: {
                service: serviceId,
                publishedAt: { $notNull: true }
            },
        });

        // Calculate average rating for published reviews
        let averageRating = 0;
        if (reviewCount > 0) {
            const reviews = await strapi.db.query('api::review.review').findMany({
                where: {
                    service: serviceId,
                    publishedAt: { $notNull: true }
                },
                select: ['voting'],
            });

            const totalVotes = reviews.reduce((sum, review) => sum + (review.voting || 0), 0);
            averageRating = totalVotes / reviewCount;
        }

        // First, get the documentId of the service to find all locale versions
        const service = await strapi.db.query('api::service.service').findOne({
            where: { id: serviceId },
            select: ['documentId'],
        });

        if (service?.documentId) {
            // Find all services with the same documentId
            const allServices = await strapi.db.query('api::service.service').findMany({
                where: { documentId: service.documentId },
                select: ['id'],
            });

            // Update each service individually
            for (const serviceToUpdate of allServices) {
                await strapi.db.query('api::service.service').update({
                    where: { id: serviceToUpdate.id },
                    data: {
                        reviewCount,
                        averageRating,
                    },
                });
            }

            strapi.log.info(`Updated review stats for all locales of service ${serviceId}: count=${reviewCount}, avg=${averageRating}`);
        } else {
            // Fallback to single service update if documentId not found
            await strapi.db.query('api::service.service').update({
                where: { id: serviceId },
                data: {
                    reviewCount,
                    averageRating,
                },
            });

            strapi.log.info(`Updated review stats for service ${serviceId}: count=${reviewCount}, avg=${averageRating}`);
        }
    } catch (error) {
        strapi.log.error('Error updating service review stats:', error);
    }
}


