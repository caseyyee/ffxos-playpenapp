var Apps = [
    {
        'name': 'Parallax homescreen concept',
        'url': 'parallax/index.html'
    },
    {
        'name': 'App cold start transition 1',
        'url': 'homescreen-app-coldstart1/index.html'
    },
    {
        'name': 'App cold start transition 2',
        'url': 'homescreen-app-coldstart2/index.html'
    },
    {
        'name': 'App cold start transition 3',
        'url': 'homescreen-app-coldstart3/index.html'
    },

    
];


var intro, s,
PlaygroudApp = {
    settings: {
        introScreen: document.getElementById("intro"),
        mainScreen: document.getElementById("main")
    },
    // main screens
    main: {
        settings: {
            apps: document.getElementById('apps')
        },

        init: function() {
            this.showApps();
        },

        launchApp: function(e) {
            
            window.location = e.target.dataset.url;
            
        },

        showApps: function() {
            var length = Apps.length,
                list = [];
                
            for (var i = 0; i < length; i++) {
                var li = document.createElement("li");
                var span = document.createElement("span");
                span.dataset.url = Apps[i].url;
                span.addEventListener("click", this.launchApp);
                span.appendChild(document.createTextNode(Apps[i].name));
                li.style.transitionDelay = (i*0.08)+"s";
                li.appendChild(span);
                main.s.apps.appendChild(li);
                list.push(li);
            }

            setTimeout(function() {
                for (var a=0; a<list.length; a++) {
                    list[a].classList.add('show');
                }
            }, 0);



        }

    },


    // intro screens
    intro: {
        settings: {
            menu: document.getElementById("menu"),
            options: document.getElementById("options")
        },
        transitioning: false,

        init: function() {
            intro.s.menu.addEventListener("click", this.toggleMenu);

            intro.screenSwipeMngr.gestureDetector = new GestureDetector(s.introScreen);
            intro.screenSwipeMngr.screen = s.introScreen;
            ['touchstart','touchend','mousedown', 'mouseup', 'pan', 'tap', 'swipe'].forEach(function(evt) {
                s.introScreen.addEventListener(evt,
                    intro.screenSwipeMngr[evt].bind(intro.screenSwipeMngr));
                }, this);
            intro.screenSwipeMngr.gestureDetector.startDetecting()
        },

        toggleMenu: function(evt) {
            intro.s.options.classList.toggle("show");
        },

        hideIntro: function() {
            s.introScreen.addEventListener("transitionend", intro.introHidden)  ;
        },

        introHidden: function(evt) {
            this.removeEventListener('transitionend', intro.introHidden);
            s.introScreen.style.MozTransition = this.DEFAULT_TRANSITION;
            s.introScreen.style.transform = '';
            intro.transitioning = false;
            if (intro.s.options.classList.contains("show")) {
                intro.toggleMenu();
            }
            s.introScreen.style.display = "none";
            PlaygroudApp.main.init();
        },

        screenSwipeMngr: {
            TRANSITION_SPEED: 1.8,
            TRANSITION_FRACTION: 0.50,
            DEFAULT_TRANSITION: 'transform 0.2s ease-in-out, height 0.2s ease-in-out',

            gestureDetector: null,
            browser: null,
            screen: null,
            winHeight: null,

            touchstart: function screenSwipe_touchstart(e) {
                e.preventDefault();
                
                this.winHeight = window.innerHeight;
                this.screen.style.MozTransition = 'none';
            },
            touchend: function screenSwipe_touchend(e) {
                if (intro.transitioning) {
                    return false;
                }
                this.screen.style.transform = '';
                this.screen.style.MozTransition = this.DEFAULT_TRANSITION;
            },
            mousedown: function screenSwipe_mousedown(e) {
                this.touchstart(e);
            },

            mouseup: function screenSwipe_mouseup(e) {
              this.touchend(e); 
            },
            
            pan: function screenSwipe_pan(e) {
                var topPos = e.detail.absolute.dy;
                if (topPos > 0) {
                    return false;
                }
                this.screen.style.transform = 'translateY('+topPos+'px)';
            },

            tap: function screenSwipe_tap(e) {
                
                // this.screen.style.MozTransition = this.DEFAULT_TRANSITION;
                // this.browser.showPageScreen();
            },

            swipe: function screenSwipe_swipe(e) {
                
                // We only want to deal with left to right swipes
                var fastenough = e.detail.vx > this.TRANSITION_SPEED;
                var distance = e.detail.start.screenY - e.detail.end.screenY;
                var farenough = Math.abs(distance) > this.winHeight * this.TRANSITION_FRACTION;
                if (farenough || fastenough) {
                    console.log("go!");
                    intro.transitioning = true;
                    this.screen.style.MozTransition = this.DEFAULT_TRANSITION;
                    this.screen.style.transform = 'translateY(-'+this.winHeight+'px)';
                
                    intro.hideIntro();
                    return;
                }
            }
        },
    },
    
    
    init: function() {
        intro = PlaygroudApp.intro;
        intro.s = intro.settings;
        main = PlaygroudApp.main;
        main.s = main.settings;
        s = PlaygroudApp.settings;
        
        intro.init();
    }
};

(function() {
    PlaygroudApp.init();
})();

