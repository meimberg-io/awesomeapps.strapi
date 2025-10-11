/**
 * review router
 */

export default {
  routes: [
    // Standard CRUD routes (needed for GraphQL shadowCRUD)
    {
      method: 'GET',
      path: '/reviews',
      handler: 'review.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/:id',
      handler: 'review.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reviews',
      handler: 'review.create',
      config: {
        policies: ['api::member.authenticate-member'],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      handler: 'review.update',
      config: {
        policies: ['api::member.authenticate-member'],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: 'review.delete',
      config: {
        policies: ['api::member.authenticate-member'],
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: 'GET',
      path: '/reviews/service/:serviceId',
      handler: 'review.byService',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/reviews/service/:serviceId/average',
      handler: 'review.getAverageRating',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reviews/:id/helpful',
      handler: 'review.markHelpful',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
