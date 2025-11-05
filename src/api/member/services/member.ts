/**
 * member service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::member.member' as any, ({ strapi }) => ({
  /**
   * Find or create a Strapi user for authentication
   */
  async findOrCreateStrapiUser(oauthData: {
    email: string;
    name?: string;
    provider: 'google' | 'github' | 'azure-ad';
  }) {
    const { email, name, provider } = oauthData;

    // Try to find existing user
    let user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (!user) {
      // Get the authenticated role
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      // Create new user
      user = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: email.split('@')[0] + '_' + provider + '_' + Date.now(),
          email,
          confirmed: true,
          blocked: false,
          provider: provider,
          role: authenticatedRole.id,
        },
      });
    }

    return user;
  },

  /**
   * Find or create a member from OAuth data
   */
  async findOrCreateFromOAuth(oauthData: {
    email: string;
    name?: string;
    avatarUrl?: string;
    provider: 'google' | 'github' | 'azure-ad';
    oauthId: string;
    strapiUserId?: number;
  }) {
    const { email, name, avatarUrl, provider, oauthId, strapiUserId } = oauthData;

    // Try to find existing member by email
    let member = await strapi.db.query('api::member.member').findOne({
      where: { email },
      populate: ['favorites', 'reviews'],
    });

    if (member) {
      // Update existing member
      member = await strapi.db.query('api::member.member').update({
        where: { id: member.id },
        data: {
          lastlogin: new Date(),
          avatarUrl: avatarUrl || member.avatarUrl,
          displayName: name || member.displayName,
          oauthProvider: provider,
          oauthId: oauthId,
          ...(strapiUserId && { strapiUser: strapiUserId }),
        },
        populate: ['favorites', 'reviews', 'strapiUser'],
      });
    } else {
      // Create new member
      // Generate a unique username from email
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await strapi.db.query('api::member.member').findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      member = await strapi.db.query('api::member.member').create({
        data: {
          email,
          username,
          displayName: name || email.split('@')[0],
          avatarUrl,
          oauthProvider: provider,
          oauthId,
          lastlogin: new Date(),
          isActive: true,
          ...(strapiUserId && { strapiUser: strapiUserId }),
        },
        populate: ['favorites', 'reviews', 'strapiUser'],
      });
    }

    return member;
  },

  /**
   * Get member by ID with relations
   */
  async findOneWithRelations(id: number, locale: string = 'de') {
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id },
      populate: {
        favorites: {
          populate: ['logo', 'thumbnail', 'tags', 'localizations'],
        },
        reviews: {
          populate: ['service'],
        },
      },
    });

    // If locale is specified and different from default, try to get localized versions
    if (member && member.favorites && locale !== 'de') {
      member.favorites = await Promise.all(
        member.favorites.map(async (service: any) => {
          // Try to find the localized version
          const localizedService = await strapi.db.query('api::service.service').findOne({
            where: { 
              locale,
              documentId: service.documentId,
            },
            populate: ['logo', 'thumbnail', 'tags'],
          });
          
          // Return localized version if it exists, otherwise return original
          return localizedService || service;
        })
      );
    }

    return member;
  },

  /**
   * Get service numeric ID from documentId
   */
  async getServiceIdByDocumentId(documentId: string) {
    const service = await strapi.db.query('api::service.service').findOne({
      where: { documentId },
      select: ['id'],
    });
    return service?.id;
  },

  /**
   * Add service to favorites
   */
  async addFavorite(memberId: number, serviceId: number) {
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id: memberId },
      populate: ['favorites'],
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if already favorited
    const isFavorited = member.favorites?.some((fav: any) => fav.id === serviceId);
    if (isFavorited) {
      return { success: false, message: 'Already in favorites' };
    }

    // Add to favorites
    const currentFavoriteIds = member.favorites?.map((fav: any) => fav.id) || [];
    await strapi.db.query('api::member.member').update({
      where: { id: memberId },
      data: {
        favorites: [...currentFavoriteIds, serviceId],
      },
    });

    return { success: true, message: 'Added to favorites' };
  },

  /**
   * Remove service from favorites
   */
  async removeFavorite(memberId: number, serviceId: number) {
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id: memberId },
      populate: ['favorites'],
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Remove from favorites
    const currentFavoriteIds = member.favorites?.map((fav: any) => fav.id) || [];
    // Ensure both IDs are numbers for comparison
    const serviceIdNum = parseInt(String(serviceId));
    const newFavoriteIds = currentFavoriteIds.filter((id: number) => {
      const currentIdNum = parseInt(String(id));
      return currentIdNum !== serviceIdNum;
    });

    await strapi.db.query('api::member.member').update({
      where: { id: memberId },
      data: {
        favorites: newFavoriteIds,
      },
    });

    return { success: true, message: 'Removed from favorites' };
  },

  /**
   * Check if service is favorited by member
   */
  async isFavorite(memberId: number, serviceId: number) {
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id: memberId },
      populate: ['favorites'],
    });

    if (!member) {
      return false;
    }

    return member.favorites?.some((fav: any) => fav.id === serviceId) || false;
  },

  /**
   * Update member profile
   */
  async updateProfile(memberId: number, profileData: {
    username?: string;
    displayName?: string;
    bio?: string;
  }) {
    const { username, displayName, bio } = profileData;

    // If username is being changed, check if it's unique
    if (username) {
      const existing = await strapi.db.query('api::member.member').findOne({
        where: { 
          username,
          id: { $ne: memberId },
        },
      });

      if (existing) {
        throw new Error('Username already taken');
      }
    }

    return await strapi.db.query('api::member.member').update({
      where: { id: memberId },
      data: {
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
      },
      populate: ['favorites', 'reviews'],
    });
  },

  /**
   * Get member statistics
   */
  async getStatistics(memberId: number) {
    const member = await strapi.db.query('api::member.member').findOne({
      where: { id: memberId },
      populate: ['favorites', 'reviews'],
    });

    if (!member) {
      throw new Error('Member not found');
    }

    return {
      reviewCount: member.reviews?.length || 0,
      favoriteCount: member.favorites?.length || 0,
      memberSince: member.createdAt,
      lastLogin: member.lastlogin,
    };
  },
}));
