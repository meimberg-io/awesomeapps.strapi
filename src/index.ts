export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({strapi}) {

        strapi.log.info("Strapi wird gestartet...");
        strapi.log.debug("DEBUG: Strapi ist jetzt im Debug-Modus aktiv!");
        const extension = ({nexus}) => ({
            typeDefs: `
                  extend type Tag {
                    count(additionalTags: [ID]!): Int
                  },
                   type Query {
                servicesbytags(tags: [ID]!, sort: String): [Service]
                  }           
               `,
            resolvers: {
                Tag: {
                    count: {
                        resolve: async (parent, args, context) => {

                            const additionalTags = args.additionalTags || [];
                            const tagIds = [...new Set([parent.documentId, ...additionalTags])];
                            const requiredTagCount = tagIds.length;

                            const subquery = strapi.db.connection('services as s')
                                .join('services_tags_lnk as st', 's.id', 'st.service_id')
                                .join('tags as t', 'st.tag_id', 't.id')
                                .whereNotNull('s.published_at')  // Services müssen veröffentlicht sein
                                .whereNotNull('t.published_at')  // Tags müssen veröffentlicht sein
                                .whereIn('t.document_id', tagIds)
                                .groupBy('s.id')
                                .havingRaw('COUNT(DISTINCT st.tag_id) = ?', [requiredTagCount])
                                .select('s.id');  // Wichtiger Fix: Hier nur die ID zurückgeben

                            const serviceCountQuery =  strapi.db.connection
                                .from(subquery.as('subquery'))  // Wrappe die Subquery
                                .count('* as total')
                                .first();

                            //console.log('Generated SQL:', serviceCountQuery.toSQL().toNative());

                            const serviceCount = await serviceCountQuery;
                            return serviceCount ? serviceCount.total : 0;

                            return serviceCount;
                        },
                    },
                },
                Query: {
                    servicesbytags: {

                        async resolve(parent, args, context) {
                            const {tags, sort} = args;

                            // Fetch all services with tags populated
                            // Review stats (count and average) are cached in the service fields
                            // Note: GraphQL permissions already filter to published services only
                            const allServices = await strapi.entityService.findMany("api::service.service", {
                                populate: { 
                                    tags: true
                                },
                            });

                            // Filter by tags if specified
                            let filtered = tags.length === 0 ? allServices : allServices.filter(service => {
                                const serviceTagIds = service.tags.map((tag) => tag.documentId);
                                return tags.every((tagId) => serviceTagIds.includes(tagId));
                            });

                            // Sort if requested
                            if (sort && filtered.length > 0) {
                                const [field, direction] = sort.split(":").map(s => s.trim());
                                filtered.sort((a, b) => {
                                    const aVal = a[field] || '';
                                    const bVal = b[field] || '';
                                    if (direction === 'desc') {
                                        return bVal > aVal ? 1 : -1;
                                    }
                                    return aVal > bVal ? 1 : -1;
                                });
                            }

                            return filtered;
                        }
                    }
                }
            },
            resolversConfig: {
                "Query.servicesbytags": {
                    auth: false,
                    policies: ["global::servicesbytags"],
                    resolverOf: 'api::service.services.find',
                },
            },

        })

        strapi.plugin('graphql').service('extension').use(extension)

    },
    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    },


};

