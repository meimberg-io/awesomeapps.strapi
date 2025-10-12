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

                            strapi.log.info(`[servicesbytags] ===== RESOLVER CALLED =====`);
                            strapi.log.info(`[servicesbytags] Tags array:`, tags);
                            strapi.log.info(`[servicesbytags] Sort:`, sort);

                            const queryOptions = {
                                filters: {
                                    publishedAt: {
                                        $notNull: true,
                                    },
                                },
                                populate: ['tags', 'thumbnail', 'logo'],
                                pagination: {
                                    limit: -1  // Fetch all services without pagination
                                },
                                ...(sort && { sort: sort }),
                            };

                            strapi.log.info(`[servicesbytags] Query options:`, JSON.stringify(queryOptions, null, 2));

                            const services = await strapi.entityService.findMany("api::service.service", queryOptions);
                            
                            strapi.log.info(`[servicesbytags] Found ${services ? services.length : 0} total services from DB`);
                            
                            if (!services || services.length === 0) {
                                strapi.log.warn(`[servicesbytags] No services returned from entityService.findMany!`);
                                return [];
                            }

                            const filteredServices = tags.length === 0 ? services : services.filter(service => {
                                const serviceTagIds = service.tags ? service.tags.map((tag) => tag.documentId) : [];
                                return tags.every((tagId) => serviceTagIds.includes(tagId));
                            });

                            strapi.log.info(`[servicesbytags] Returning ${filteredServices.length} services after filtering`);
                            strapi.log.info(`[servicesbytags] ===== RESOLVER COMPLETE =====`);

                            return filteredServices;
                        }
                    }
                }
            },
            resolversConfig: {
                "Query.servicesbytags": {
                    auth: false,
                    policies: ["global::servicesbytags"],
                    resolverOf: 'api::service.service.find',
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
