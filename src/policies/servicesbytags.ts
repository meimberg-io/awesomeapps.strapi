// ./src/policies/servicesbytags.ts

export default async function servicesbytags(
    ctx: any,              // Koa-/Strapi-Context
    config: any,           // Config
    { strapi }: { strapi: any }  // Strapi-Instanz
): Promise<boolean> {
    // Beispiel: Zugriff für alle
    return true;
}
