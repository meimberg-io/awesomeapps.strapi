const plugins = {
    graphql: {
        enabled: true,
        config: {
            shadowCRUD: true, // Automatische CRUD-Operationen für GraphQL aktivieren
            playgroundAlways: true, // GraphQL-Playground aktiv lassen
            defaultLimit: 100, // Standard-Limit für Abfragen
            maxLimit: 200, // Maximales Abfrageergebnis
        },
    },

};

export default plugins;
