/**
 * review router
 */

export default {
  routes: [
    // CRUD routes
    {
      method: 'POST',
      path: '/reviews',
      handler: 'review.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      handler: 'review.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: 'review.delete',
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
