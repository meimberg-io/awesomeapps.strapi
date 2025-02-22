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

        // Berechne die Anzahl der verknüpften Services
        const tagsWithCount = tags.map(tag => ({
            ...tag,
            count: tag.services.length, // Anzahl der verknüpften Services
        }));

        return tagsWithCount;
    },
}));
