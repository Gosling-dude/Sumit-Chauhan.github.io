# Sumit Chauhan - Personal Portfolio Website

A modern, fully responsive, single-page portfolio website built with Tailwind CSS and vanilla JavaScript. Designed to showcase projects, skills, and experience with a clean, professional UI, animated elements, and dark mode support.

[**Have a look**](https://sumit.life/)

---


## ✨ Features

* **Modern UI/UX:** Clean design with animated gradient blobs and a sleek glassmorphism effect on cards.
* **Dark Mode:** Seamless light/dark mode toggle with persistence using `localStorage`.
* **Fully Responsive:** Adapts beautifully to all screen sizes, from mobile phones to desktops.
* **Dynamic & Interactive:**
    * **Text Rotator:** Hero section features a typing/fading text rotator for roles.
    * **Scroll Animations:** Subtle fade-in-on-scroll animations powered by the Intersection Observer API.
    * **Active Nav-Link:** Navigation links automatically highlight the section currently in view.
    * **Animated Skills:** Skill icons bounce on hover for a lively feel.
* **Zero Build Step:** Built with vanilla technologies and CDN links for simplicity. No complex build process required.

---

## 📂 Sections Overview

1.  **Hero:** Introduction with a rotating role-text, profile image, and Call-to-Action buttons (Resume, Contact).
2.  **About:** A detailed biography, education details, and key interests.
3.  **Skills:** A grid showcasing personal tech stack (Java, Python, LangChain, etc.) and competitive programming profiles with links.
4.  **Experience:** A vertical timeline of professional experience and open-source contributions.
5.  **Projects:** Featured projects displayed as interactive cards with descriptions, tech tags, and links (GitHub, Live Demo).
6.  **Achievements:** Notable accomplishments in coding competitions, hackathons, and academics.
7.  **Contact:** A simple contact section with links to Email, GitHub, and LinkedIn.
8.  **Footer:** Copyright information and a small tagline.

---

## 🚀 Getting Started

No build process is needed! You can run this project locally in two simple steps:

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Gosling-dude/your-portfolio-repo.git](https://github.com/Gosling-dude/your-portfolio-repo.git)
    ```

2.  **Open the file:**
    Navigate to the project directory and open the `index.html` file in your favorite browser.
    ```sh
    cd your-portfolio-repo
    open index.html 
    ```
    (Or simply double-click the file in your file explorer)

---

## 🎨 Customization

To make this portfolio your own, you'll need to update the content directly in `index.html`:

* **Metadata:** Change the `<title>` and `<meta name="description">` in the `<head>`.
* **Hero Section:** Update the `roles` array in the main `<script>` tag at the bottom of the file with your roles.
* **Resume Link:** Change the `href` in the "View Resume" button.
* **About Section:** Edit the text, education details (CGPA, dates), and interest tags.
* **Skills Section:**
    * Update the "Tech Stack" grid with your personal skills, names, and icons.
    * Change the links, ratings, and usernames for the "Competitive Programming" section.
* **Experience Section:** Modify the timeline items (dates, titles, descriptions, links).
* **Projects Section:** Update the project details (images, titles, descriptions, tech tags, and links).
* **Achievements Section:** Change the stats and descriptions for your achievements.
* **Contact Section:** Update the `href` attributes for your `mailto:`, GitHub, and LinkedIn links.
* **Images:** Replace `images/profile.png` and any project images with your own.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
