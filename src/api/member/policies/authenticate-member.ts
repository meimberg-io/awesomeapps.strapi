/**
 * `authenticate-member` policy
 * 
 * Validates JWT and ensures user is authenticated
 */

export default (policyContext, config, { strapi }) => {
  const { state } = policyContext;
  
  // JWT is validated by Strapi's middleware
  // User is available in state.user if valid
  if (!state.user) {
    return false; // Not authenticated
  }

  // Extract member ID from JWT payload
  // This was included when we issued the token
  policyContext.state.memberId = state.user.memberId;
  
  return true; // Allow access
};

