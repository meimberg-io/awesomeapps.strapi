/**
 * Custom service routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/services/refresh-review-stats',
      handler: 'service.refreshReviewStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

