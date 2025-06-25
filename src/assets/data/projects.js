export const projects = [
    {
        id: 1,
        name: "Kasa",
        description: "Développer en React le front-end d'une plateforme de location d'appartements, en utilisant React/Vite, React Router et Sass selon des maquettes Figma responsives. Le projet inclut une galerie d'images avec navigation circulaire et des composants Collapse animés, alimentés par des données JSON simulées. Focus sur le développement front-end moderne.",
        technologies: ["React", "React Router", "Node.js", "Vite", "Sass"],
        image: "src/assets/img/imgPortfolio/kasa.png",
        logo: "src/assets/img/imgPortfolio/kasaLogo.webp",
        githubLink: "https://github.com/roCal93/Kasa.git",
        demoLink: "https://roCal93.github.io/Kasa",
        features: [
            "Initialisation d'une application avec Vite",
            "Configuration de la navigation entre les pages de l'application avec React Router",
            "Développement des éléments de l'interface d'un site web grâce à des composants React",
            "Mise en œuvre d'animations CSS",
            "Développement d'une interface web avec Sass"
        ]
    },
    {
        id: 2,
        name: "Application de Gestion de Tâches",
        description: "Gestionnaire de tâches collaboratif avec système de drag & drop",
        technologies: ["Vue.js", "Firebase", "Vuetify", "Chart.js"],
        image: "/images/taskmanager-preview.jpg",
        githubLink: "https://github.com/username/task-manager",
        demoLink: "https://taskmanager-app.web.app",
        creationDate: "2023-11",
        duration: "2 mois",
        status: "Terminé",
        features: [
            "Drag & drop des tâches",
            "Collaboration en temps réel",
            "Notifications push",
            "Statistiques et graphiques",
            "Export PDF des rapports"
        ]
    },
    {
        id: 3,
        name: "API REST Blog",
        description: "API REST complète pour un système de blog avec authentification",
        technologies: ["Node.js", "Express", "PostgreSQL", "JWT", "Docker"],
        image: "/images/api-blog-preview.jpg",
        githubLink: "https://github.com/username/blog-api",
        demoLink: "https://api-blog-docs.herokuapp.com",
        creationDate: "2023-09",
        duration: "1.5 mois",
        status: "Terminé",
        features: [
            "CRUD complet articles",
            "Système de commentaires",
            "Gestion des utilisateurs",
            "Documentation Swagger",
            "Tests unitaires Jest"
        ]
    },
    {
        id: 4,
        name: "Dashboard Analytics",
        description: "Tableau de bord interactif pour visualisation de données",
        technologies: ["Angular", "D3.js", "TypeScript", "RxJS", "Material UI"],
        image: "/images/dashboard-preview.jpg",
        githubLink: "https://github.com/username/analytics-dashboard",
        demoLink: "https://analytics-dashboard.vercel.app",
        creationDate: "2024-02",
        duration: "2.5 mois",
        status: "En cours",
        features: [
            "Graphiques interactifs",
            "Données en temps réel",
            "Export des données",
            "Thème sombre/clair",
            "Responsive design"
        ]
    },
    {
        id: 5,
        name: "Application Mobile Météo",
        description: "Application météo géolocalisée avec prévisions sur 7 jours",
        technologies: ["React Native", "Expo", "OpenWeather API", "AsyncStorage"],
        image: "/images/weather-app-preview.jpg",
        githubLink: "https://github.com/username/weather-app",
        demoLink: "https://expo.dev/@username/weather-app",
        creationDate: "2023-12",
        duration: "1 mois",
        status: "Terminé",
        features: [
            "Géolocalisation automatique",
            "Prévisions détaillées",
            "Villes favorites",
            "Notifications météo",
            "Mode hors ligne"
        ]
    }
];