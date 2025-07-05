document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    const tripTabs = document.querySelectorAll('.trip-tab');
    const tripTabContents = document.querySelectorAll('.trip-tab-content');

    const showSection = (targetId) => {
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === targetId);
        });
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.dataset.target;
            showSection(targetId);
        });
    });

    // --- Trip Planner Tab Logic ---
    tripTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            tripTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tripTabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== `${target}-tab-content`);
            });
        });
    });

    // Initialize the dashboard
    showSection('movie-search'); // Default section
    document.querySelector('.trip-tab[data-tab="booking"]').classList.add('active'); // Default trip tab
    
    // Initialize all feature modules
    if (typeof window.initMovies === 'function') window.initMovies();
    if (typeof window.initSmsBlaster === 'function') window.initSmsBlaster();
    if (typeof window.initTripPlanner === 'function') window.initTripPlanner();
    if (typeof window.initQrPayment === 'function') window.initQrPayment();
});
