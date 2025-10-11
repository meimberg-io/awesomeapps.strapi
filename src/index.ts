/**
 * Automatically set default permissions for ALL content types
 * No manual configuration needed - discovers all API content types automatically!
 */
async function setDefaultPermissions(strapi) {
    strapi.log.info('🔐 Auto-discovering and setting permissions for all content types...');

    try {
        // Get all roles
        const roles = await strapi.db.query('plugin::users-permissions.role').findMany();

        // Auto-discover all API content types
        const contentTypes = Object.keys(strapi.contentTypes).filter(
            (uid) => uid.startsWith('api::')
        );

        strapi.log.info(`📦 Found ${contentTypes.length} content types: ${contentTypes.join(', ')}`);

        // Default actions for each role type
        const defaultActions = {
            public: ['find', 'findOne'],
            authenticated: ['find', 'findOne', 'create', 'update', 'delete'],
        };

        for (const role of roles) {
            const actions = defaultActions[role.type] || [];
            if (actions.length === 0) continue;

            // Get existing permissions for this role
            const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
                where: { role: role.id },
            });

            const existingActions = new Set(existingPermissions.map(p => p.action));

            // Set permissions for each content type
            for (const contentType of contentTypes) {
                for (const action of actions) {
                    const actionName = `${contentType}.${action}`;
                    
                    if (!existingActions.has(actionName)) {
                        try {
                            await strapi.db.query('plugin::users-permissions.permission').create({
                                data: {
                                    action: actionName,
                                    role: role.id,
                                },
                            });
                            strapi.log.debug(`✅ ${role.name}: ${actionName}`);
                        } catch (err) {
                            // Action might not be available for this content type
                        }
                    }
                }
            }
        }

        strapi.log.info('✅ All permissions set automatically!');
    } catch (error) {
        strapi.log.error('❌ Error setting permissions:', error);
    }
}

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

                            const queryOptions = {
                                populate: { tags: true },
                                ...(sort && { orderBy: sort.split(",").map((s) => {
                                        const [field, direction] = s.trim().split(":");
                                        return { [field]: direction === "desc" ? "desc" : "asc" };
                                    })}),
                            };

                            const services = await strapi.entityService.findMany("api::service.service", queryOptions);

                            return tags.length === 0 ? services : services.filter(service => {
                                const serviceTagIds = service.tags.map((tag) => tag.documentId);
                                return tags.every((tagId) => serviceTagIds.includes(tagId));
                            });
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
    async bootstrap({ strapi }) {
        // Automatically set permissions for all API content types
        await setDefaultPermissions(strapi);
    },


};
