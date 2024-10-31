// 视差滚动效果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.querySelector('.background-layer').style.transform = 
        `translateY(${scrolled * 0.5}px)`;
});

// 响应式导航菜单
document.querySelector('.menu-toggle').addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.nav-links').classList.toggle('active');
});

// 初始化粒子效果
window.addEventListener('load', function() {
    if (window.particlesJS) {
        particlesJS('particles', {
            particles: {
                number: {
                    value: 85,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#ffffff']
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.3,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1,
                    shadow: {
                        enable: true,
                        color: "#ffffff",
                        blur: 10
                    }
                },
                move: {
                    enable: true,
                    speed: 1.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false
                    }
                }
            },
            interactivity: {
                detect_on: 'window',
                events: {
                    onhover: {
                        enable: true,
                        mode: ['bubble', 'grab']
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 150,
                        line_linked: {
                            opacity: 0.8,
                            color: "#64ffda",
                            width: 2,
                            shadow: {
                                enable: true,
                                color: "#64ffda",
                                blur: 20
                            }
                        }
                    },
                    bubble: {
                        distance: 200,
                        size: 15,
                        duration: 1.5,
                        opacity: 0.8,
                        speed: 3,
                        color: "#64ffda",
                        stroke: {
                            width: 3,
                            color: "#ffffff"
                        },
                        shadow: {
                            enable: true,
                            color: "#64ffda",
                            blur: 25
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        });
        console.log('Particles.js initialized successfully');
    } else {
        console.error('Particles.js failed to load');
    }
}); 