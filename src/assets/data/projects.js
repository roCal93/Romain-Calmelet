import kasaCover from '../img/imgPortfolio/kasa.webp'
import kasaLogo from '../img/imgPortfolio/kasaLogo.webp'
import sophieBluelCover from '../img/imgPortfolio/sophieBluel.webp'
import sophieBluelLogo from '../img/imgPortfolio/sophieBluelLogo.webp'
import ohMyFoodCover from '../img/imgPortfolio/ohMyFood.webp'
import ohMyFoodLogo from '../img/imgPortfolio/ohMyFoodLogo.webp'
import portfolioCover from '../img/imgPortfolio/portfolioCover.webp'
import portfolioLogo from '../img/imgPortfolio/portfolioLogo.webp'


export const projects = [
    {
        id: 1,
        name: "Plateforme de location",
        description: "Développer en React le front-end d'une plateforme de location d'appartements, en utilisant React/Vite, React Router et Sass selon des maquettes Figma responsives. Le projet inclut une galerie d'images avec navigation circulaire et des composants Collapse animés, alimentés par des données JSON simulées. Focus sur le développement front-end moderne.",
        technologies: ["React", "React Router", "Node.js", "Vite", "Sass"],
        image: kasaCover,
        logo: kasaLogo,
        githubLink: "https://github.com/roCal93/Kasa.git",
        demoLink: "https://roCal93.github.io/Kasa",
        features: [
            "Initialisation d'une application avec Vite",
            "Configuration de la navigation entre les pages de l'application avec React Router",
            "Développement de l'interface d'un site web avec des composants React",
            "Mise en œuvre d'animations CSS",
            "Développement d'une interface web avec Sass"
        ]
    },
    {
        id: 2,
        name: "Portfolio d'architecte",
        description: "Dans ce projet, J’ai développé une page web dynamique pour une architecte d’intérieur en JavaScript, avec une galerie de projets, une interface de connexion admin et une modale d’upload, tout en interagissant avec une API et en manipulant le DOM. Ce projet a renforcé mes compétences en JavaScript et en communication avec une API.",
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
        name: "Plateforme de réservation",
        description: "Dans ce projet, j’ai intégré une maquette mobile-first à partir de designs Figma, en y ajoutant des animations CSS pour améliorer l’expérience utilisateur. J’ai structuré les styles avec Sass et versionné le projet via Git et GitHub. Ce travail m’a permis de consolider mes compétences en intégration responsive et en animation front-end.",
        technologies: ["HTML5", "CSS3", "Sass", "Animations CSS", "Figma", "Git", "GitHub"],
        image: ohMyFoodCover,
        logo: ohMyFoodLogo,
        githubLink: "https://github.com/roCal93/ohMyFood",
        demoLink: "https://rocal93.github.io/ohMyFood/",
        features: [
            "Intégration mobile-first",
            "Responsive design",
            "Animations CSS",
            "Utilisation de Sass",
            "Versionnage avec Git",
            "Lecture de maquettes Figma",
        ]
    },
    {
        id: 4,
        name: "Mon portfolio",
        description: "Dans ce projet, j’ai choisi React et React Router pour développer mon portfolio, alliant performance, modularité et navigation sans rechargement de page. Il présente mon parcours, mes compétences, mes réalisations et permet une navigation dynamique entre les différentes sections.",
        technologies: ["React", "React Router", "React Responsive", "Sass", "Vite", "ESLint", "gh-pages"],
        image: portfolioCover,
        logo: portfolioLogo,
        githubLink: "https://github.com/roCal93/Romain-Calmelet",
        features: [
            "Navigation entre différentes sections du site grâce à React Router.",
            "Scroll, drag & drop, navigation au clavier et avec la molette.",
            "Affichage détaillé d’un projet dans une modale (popup) au clic",
            "Design responsive pour s’adapter à tous les écrans.",
            "Navigation fluide entre les pages/sections du portfolio.",
            "Expérience utilisateur améliorée par des transitions et animations modernes.",
            "Accessibilité : navigation possible au clavier, organisation sémantique."
        ]
    },

];