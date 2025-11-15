var isMenuOpen = false;
var menuIcon = document.querySelector(".menuicon"); // Moved outside function for persistent access

function toggleMenu() {
    var menu = document.querySelector(".menu");
    var root = getComputedStyle(document.documentElement);
    if (isMenuOpen) {
        isMenuOpen = false;
        menu.style.transform = "translateX(-100%)";
        menuIcon.style.color = root.getPropertyValue("--text-color").trim();
        menuIcon.classList.remove('menuicon-active'); // Remove active class for animation
    } else {
        isMenuOpen = true;
        menu.style.transform = "translateX(0%)";
        menuIcon.style.color = root.getPropertyValue("--rev-text-color").trim();
        menuIcon.classList.add('menuicon-active'); // Add active class for animation
    }
}

// Parallax effect for section1 image
document.addEventListener('scroll', function() {
    const section1Img = document.querySelector('.section1 img');
    const scrollPosition = window.scrollY;

    // Adjust the multiplier to control the parallax speed
    section1Img.style.transform = `translateY(${scrollPosition * 0.3}px)`;
});

// Section fade-in animation on scroll (including new sections)
const sectionsToAnimate = document.querySelectorAll('.section2, .section3, .section4, .section6'); // Added .section6

function checkSlide() {
    sectionsToAnimate.forEach(section => {
        const slideInAt = (window.scrollY + window.innerHeight) - section.offsetHeight / 2.5;
        const sectionBottom = section.offsetTop + section.offsetHeight;
        const isHalfShown = slideInAt > section.offsetTop;
        const isNotScrolledPast = window.scrollY < sectionBottom;

        if (isHalfShown && isNotScrolledPast) {
            section.classList.add('active-section');
        } else {
            section.classList.remove('active-section'); // Optional: Remove if you want animation only once
        }
    });
}

window.addEventListener('scroll', checkSlide);
checkSlide(); // Initial check on page load