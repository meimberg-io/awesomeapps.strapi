/**
 * member router
 */

export default {
  routes: [
    // Default CRUD routes (via GraphQL)
    {
      method: 'GET',
      path: '/members',
      handler: 'member.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id',
      handler: 'member.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: 'POST',
      path: '/members/me',
      handler: 'member.me',
      config: {
        auth: false, // Public endpoint - called during OAuth login
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/profile',
      handler: 'member.profile',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/members/:id/profile',
      handler: 'member.updateProfile',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/favorites',
      handler: 'member.getFavorites',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/members/:id/favorites',
      handler: 'member.addFavorite',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/members/:id/favorites/:serviceId',
      handler: 'member.removeFavorite',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/favorites/:serviceId/check',
      handler: 'member.checkFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/reviews',
      handler: 'member.getReviews',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/statistics',
      handler: 'member.getStatistics',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
