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
    
    // Get the service ID from the review
    let serviceId;
    if (result?.service?.id) {
        serviceId = result.service.id;
    } else if (params?.data?.service) {
        serviceId = params.data.service;
    }

    if (!serviceId) {
        return;
    }

    try {
        // Count only published reviews using Strapi's built-in count method
        const reviewCount = await strapi.db.query('api::review.review').count({
            where: {
                service: serviceId,
                isPublished: true,
            },
        });

        // Calculate average rating for published reviews
        let averageRating = 0;
        if (reviewCount > 0) {
            const reviews = await strapi.db.query('api::review.review').findMany({
                where: {
                    service: serviceId,
                    isPublished: true,
                },
                select: ['voting'],
            });

            const totalVotes = reviews.reduce((sum, review) => sum + review.voting, 0);
            averageRating = totalVotes / reviewCount;
        }

        // Update the service with cached values
        await strapi.entityService.update('api::service.service', serviceId, {
            data: {
                reviewCount,
                averageRating,
            } as any,
        });

        strapi.log.info(`Updated review stats for service ${serviceId}: count=${reviewCount}, avg=${averageRating}`);
    } catch (error) {
        strapi.log.error('Error updating service review stats:', error);
    }
}

