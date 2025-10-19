/**
 * Migration script to populate reviewCount and averageRating for all existing services
 * Run this once after adding the cached fields to the schema
 * 
 * Usage: node scripts/update-review-stats.js
 */

const Strapi = require('@strapi/strapi');

async function main() {
    const strapi = await Strapi().load();
    
    console.log('Starting review stats migration...');

    try {
        // Get all services
        const services = await strapi.entityService.findMany('api::service.service', {
            fields: ['id', 'documentId', 'name'],
        });

        console.log(`Found ${services.length} services to process`);

        let updatedCount = 0;

        for (const service of services) {
            // Count only published reviews
            const reviewCount = await strapi.db.query('api::review.review').count({
                where: {
                    service: service.id,
                    isPublished: true,
                },
            });

            // Calculate average rating for published reviews
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

            // Update the service
            await strapi.db.query('api::service.service').update({
                where: { id: service.id },
                data: {
                    reviewCount,
                    averageRating,
                },
            });

            updatedCount++;
            console.log(`✓ Updated ${service.name}: ${reviewCount} reviews, avg ${averageRating.toFixed(2)}`);
        }

        console.log(`\n✓ Migration complete! Updated ${updatedCount} services.`);
    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        await strapi.destroy();
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

