// src/api/tag/controllers/tag.ts
import { factories } from '@strapi/strapi';

console.log("👽👽👽 Hello, World XXXXXWE!");

export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
    // Custom find Methode
    async find(ctx) {
        // Tags mit Services laden
        const tags = await strapi.db.query('api::tag.tag').findMany({
            populate: { services: true }, // Services mit einbeziehen
        });

        // Berechne die Anzahl der verknüpften Services (unique by documentId, not locale)
        const tagsWithCount = tags.map(tag => {
            // Get unique service documentIds (count each service once, regardless of locale)
            const uniqueServiceIds = new Set(
                tag.services.map(service => service.documentId || service.id).filter(Boolean)
            );
            return {
                ...tag,
                count: uniqueServiceIds.size, // Anzahl der eindeutigen Services (ohne Lokalisierung)
            };
        });

        return tagsWithCount;
    },
}));
