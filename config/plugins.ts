const plugins = {
    graphql: {
        enabled: true,
        config: {
            shadowCRUD: true, // Automatische CRUD-Operationen für GraphQL aktivieren
            playgroundAlways: true, // GraphQL-Playground aktiv lassen
            defaultLimit: 100, // Standard-Limit für Abfragen
            maxLimit: 200, // Maximales Abfrageergebnis
            depthLimit: 10,
            amountLimit: 100,
            apolloServer: {
                introspection: true,
            },
        },
    },
    "content-manager": {
        enabled: true,
        // Hier ggf. weitere Einstellungen, falls benötigt.
    },
    i18n: {
        enabled: true,
        config: {
            defaultLocale: 'en',
            locales: ['en', 'de'],
        },
    },

};

export default plugins;
