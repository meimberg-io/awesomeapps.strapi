// import type { Core } from '@strapi/strapi';

export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({strapi}) {
        const extension = ({nexus}) => ({
            typeDefs: `
                  extend type Tag {
                    count: Int
                  }
               `,
            resolvers: {
                Tag: {
                    count: {
                        resolve: async (parent, args, context) => {
                            // Hier die Logik zur Berechnung des count-Werts einfügen
                            // Beispiel:
                            const relatedServices = await strapi.entityService.count('api::service.service', {
                                filters: { tags: { id: parent.id } },
                            });
                            //const relatedArticles = 199;

                            return relatedServices;
                        },
                    },
                },
            }
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
