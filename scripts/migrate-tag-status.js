'use strict'

require('esbuild-register/dist/node').register()
require('dotenv/config')

const { createStrapi, compileStrapi } = require('@strapi/strapi')

async function run() {
  const { distDir } = await compileStrapi()
  const strapi = await createStrapi({ distDir }).load()

  try {
    const result = await strapi.db.query('api::tag.tag').updateMany({
      where: {
        $or: [
          { tagStatus: null },
          { tagStatus: { $notIn: ['active', 'proposed', 'excluded'] } },
        ],
      },
      data: {
        tagStatus: 'active',
      },
    })

    const totalUpdated = typeof result === 'number' ? result : result?.count ?? 0
    console.log(`✅ Updated ${totalUpdated} tags to tagStatus "active".`)
  } catch (error) {
    console.error('❌ Failed to update tag status:', error)
    process.exitCode = 1
  } finally {
    await strapi.destroy()
  }
}

run()

