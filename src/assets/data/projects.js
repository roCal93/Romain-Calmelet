import kasacover from '../img/imgPortfolio/kasa.webp'
import kasaLogo from '../img/imgPortfolio/kasaLogo.webp'
import sophieBluelCover from '../img/imgPortfolio/sophieBluel.webp'
import sophieBluelLogo from '../img/imgPortfolio/sophieBluelLogo.webp'

export const projects = [
    {
        id: 1,
        name: "Kasa",
        description: "Développer en React le front-end d'une plateforme de location d'appartements, en utilisant React/Vite, React Router et Sass selon des maquettes Figma responsives. Le projet inclut une galerie d'images avec navigation circulaire et des composants Collapse animés, alimentés par des données JSON simulées. Focus sur le développement front-end moderne.",
        technologies: ["React", "React Router", "Node.js", "Vite", "Sass"],
        image: kasacover,
        logo: kasaLogo,
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
        name: "Portfolio d'architecte",
        description: "Dans ce projet, j’ai développé une page web dynamique pour une architecte d’intérieur en utilisant JavaScript et en interagissant avec une API. J’ai conçu la partie Front-End, avec une page de présentation des travaux, une interface de connexion pour l’administrateur et une modale d’upload de médias, tout en gérant les événements utilisateurs et en manipulant le DOM. Ce projet m’a permis de renforcer mes compétences en JavaScript et en communication avec une API, des savoir-faire indispensables pour le développement web moderne.",
        technologies: ["HTML5", "CSS3", "JavaScript(ES6+)", "APIs REST"],
        image: sophieBluelCover,
        logo: sophieBluelLogo,
        githubLink: "https://github.com/roCal93/Sophie_Bluel.git",
        demoLink: "https://rocal93.github.io/sophie-bluel-frontend/",
        features: [
            "Affichage d’un portfolio de projets",
            "Filtres de projets par catégorie",
            "Gestion des projets (Backoffice/Admin)",
            "Connexion et Authentification",
            "Stockage local temporaire",
            "Appels API REST",
            "Gestion d’erreurs",
            "Affichage responsive"
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