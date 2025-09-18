import kasaCover from '../img/imgPortfolio/kasa.webp'
import kasaLogo from '../img/imgPortfolio/kasaLogo.webp'
import sophieBluelCover from '../img/imgPortfolio/sophieBluel.webp'
import sophieBluelLogo from '../img/imgPortfolio/sophieBluelLogo.webp'
import ohMyFoodCover from '../img/imgPortfolio/ohMyFood.webp'
import ohMyFoodLogo from '../img/imgPortfolio/ohMyFoodLogo.webp'
import portfolioCover from '../img/imgPortfolio/portfolioCover.webp'
import portfolioLogo from '../img/imgPortfolio/portfolioLogo.webp'
import blogLogo from '../img/imgPortfolio/blogLogo.webp'
import blogCover from '../img/imgPortfolio/blogLogo.webp'

// Données des projets avec traductions
export const projectsData = {
    fr: [
        {
            id: 1,
            name: "Plateforme de location",
            description: "Dans ce projet, j'ai développé en React le front-end d'une plateforme de location d'appartements, en utilisant React/Vite, React Router et Sass selon des maquettes Figma responsives. Le projet inclut une galerie d'images avec navigation circulaire et des composants Collapse animés, alimentés par des données JSON simulées. Focus sur le développement front-end moderne.",
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
            description: "Dans ce projet, j'ai développé une page web dynamique pour une architecte d'intérieur en JavaScript, avec une galerie de projets, une interface de connexion admin et une modale d'upload, tout en interagissant avec une API et en manipulant le DOM. Ce projet a renforcé mes compétences en JavaScript et en communication avec une API.",
            technologies: ["HTML5", "CSS3", "JavaScript(ES6+)", "APIs REST"],
            image: sophieBluelCover,
            logo: sophieBluelLogo,
            githubLink: "https://github.com/roCal93/Sophie_Bluel.git",
            demoLink: "https://rocal93.github.io/sophie-bluel-frontend/",
            features: [
                "Affichage d'un portfolio de projets",
                "Filtres de projets par catégorie",
                "Gestion des projets (Backoffice/Admin)",
                "Connexion et Authentification",
                "Stockage local temporaire",
                "Appels API REST",
                "Gestion d'erreurs",
                "Affichage responsive"
            ]
        },
        {
            id: 3,
            name: "Plateforme de réservation",
            description: "Dans ce projet, j'ai intégré une maquette mobile-first à partir de designs Figma, en y ajoutant des animations CSS pour améliorer l'expérience utilisateur. J'ai structuré les styles avec Sass et versionné le projet via Git et GitHub. Ce travail m'a permis de consolider mes compétences en intégration responsive et en animation front-end.",
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
                "Lecture de maquettes Figma"
            ]
        },
        {
            id: 4,
            name: "Exemple Blog CodeIgniter Bootstrap",
            description: "Ce projet est un exemple de blog développé avec CodeIgniter et Bootstrap, illustrant l'intégration d'un framework PHP léger avec un framework CSS pour réaliser une application web complète, moderne et responsive. Il propose la gestion d'articles, d'utilisateur et une interface d'administration.",
            technologies: ["PHP", "CodeIgniter", "Bootstrap", "MySQL", "HTML", "CSS", "JavaScript"],
            image: blogCover,
            logo: blogLogo,
            githubLink: "https://github.com/roCal93/exemple-blog-codeigniter-bootstrap-code",
            demoLink: "https://exemple-blog-codeigniter-bootstrap.up.railway.app/blog",
            features: [
                "Création, modification et suppression d'articles de blog",
                "Interface d'administration sécurisée",
                "Utilisation de Bootstrap pour un design responsive",
                "Utilisation de CodeIgniter pour une structure MVC claire",
                "Connexion et gestion des utilisateurs",
                "Affichage dynamique des articles et tri par date et par auteur"
            ]
        },
        {
            id: 5,
            name: "Mon portfolio",
            description: "Dans ce projet, j'ai choisi React et React Router pour développer mon portfolio, alliant performance, modularité et navigation sans rechargement de page. Il présente mon parcours, mes compétences, mes réalisations et permet une navigation dynamique entre les différentes sections.",
            technologies: ["React", "React Router", "React Responsive", "Sass", "Vite", "ESLint", "gh-pages"],
            image: portfolioCover,
            logo: portfolioLogo,
            githubLink: "https://github.com/roCal93/Romain-Calmelet",
            features: [
                "Navigation entre différentes sections du site grâce à React Router",
                "Scroll, drag & drop, navigation au clavier et avec la molette",
                "Affichage détaillé d'un projet dans une modale (popup) au clic",
                "Design responsive pour s'adapter à tous les écrans",
                "Navigation fluide entre les pages/sections du portfolio",
                "Expérience utilisateur améliorée par des transitions et animations modernes",
                "Accessibilité: navigation possible au clavier, organisation sémantique"
            ]
        },
    ],
    en: [
        {
            id: 1,
            name: "Rental Platform",
            description: "In this project, I developed the front-end of an apartment rental platform using React/Vite, React Router, and Sass based on responsive Figma mockups. The project includes an image gallery with circular navigation and animated Collapse components, powered by simulated JSON data. Focused on modern front-end development.",
            technologies: ["React", "React Router", "Node.js", "Vite", "Sass"],
            image: kasaCover,
            logo: kasaLogo,
            githubLink: "https://github.com/roCal93/Kasa.git",
            demoLink: "https://roCal93.github.io/Kasa",
            features: [
                "Application initialization with Vite",
                "Navigation configuration between application pages with React Router",
                "Website interface development with React components",
                "CSS animations implementation",
                "Web interface development with Sass"
            ]
        },
        {
            id: 2,
            name: "Architect Portfolio",
            description: "In this project, I developed a dynamic web page for an interior architect in JavaScript, with a project gallery, admin login interface and upload modal, while interacting with an API and manipulating the DOM. This project strengthened my JavaScript skills and API communication.",
            technologies: ["HTML5", "CSS3", "JavaScript(ES6+)", "REST APIs"],
            image: sophieBluelCover,
            logo: sophieBluelLogo,
            githubLink: "https://github.com/roCal93/Sophie_Bluel.git",
            demoLink: "https://rocal93.github.io/sophie-bluel-frontend/",
            features: [
                "Project portfolio display",
                "Project filters by category",
                "Project management (Backoffice/Admin)",
                "Login and Authentication",
                "Temporary local storage",
                "REST API calls",
                "Error handling",
                "Responsive display"
            ]
        },
        {
            id: 3,
            name: "Booking Platform",
            description: "In this project, I integrated a mobile-first mockup from Figma designs, adding CSS animations to improve user experience. I structured the styles with Sass and versioned the project via Git and GitHub. This work allowed me to consolidate my skills in responsive integration and front-end animation.",
            technologies: ["HTML5", "CSS3", "Sass", "CSS Animations", "Figma", "Git", "GitHub"],
            image: ohMyFoodCover,
            logo: ohMyFoodLogo,
            githubLink: "https://github.com/roCal93/ohMyFood",
            demoLink: "https://rocal93.github.io/ohMyFood/",
            features: [
                "Mobile-first integration",
                "Responsive design",
                "CSS animations",
                "Sass usage",
                "Git versioning",
                "Figma mockup reading"
            ]
        },
        {
            id: 4,
            name: "CodeIgniter Bootstrap Blog Example",
            description: "This project is a blog example developed with CodeIgniter and Bootstrap, illustrating the integration of a lightweight PHP framework with a CSS framework to create a complete, modern, and responsive web application. It features article and user management, as well as an admin interface.",
            technologies: ["PHP", "CodeIgniter", "Bootstrap", "MySQL", "HTML", "CSS", "JavaScript"],
            image: blogCover,
            logo: blogLogo,
            githubLink: "https://github.com/roCal93/exemple-blog-codeigniter-bootstrap-code",
            demoLink: "https://exemple-blog-codeigniter-bootstrap.up.railway.app/blog",
            features: [
                "Create, edit, and delete blog articles",
                "Secured admin interface",
                "Bootstrap for responsive design",
                "CodeIgniter for clear MVC structure",
                "User login and management",
                "Dynamic article display and sorting by date and author"
            ]
        },
        {
            id: 5,
            name: "My Portfolio",
            description: "In this project, I chose React and React Router to develop my portfolio, combining performance, modularity and navigation without page reload. It presents my background, skills, achievements and allows dynamic navigation between different sections.",
            technologies: ["React", "React Router", "React Responsive", "Sass", "Vite", "ESLint", "gh-pages"],
            image: portfolioCover,
            logo: portfolioLogo,
            githubLink: "https://github.com/roCal93/Romain-Calmelet",
            features: [
                "Navigation between different site sections with React Router",
                "Scroll, drag & drop, keyboard and mouse wheel navigation",
                "Detailed project display in a modal (popup) on click",
                "Responsive design to adapt to all screens",
                "Smooth navigation between portfolio pages/sections",
                "Enhanced user experience through modern transitions and animations",
                "Accessibility: keyboard navigation possible, semantic organization"
            ]
        }
    ]
};

// Hook personnalisé pour récupérer les projets traduits
export const useProjects = (language) => {
    return projectsData[language] || projectsData.fr;
};