var s, 
Parallax = {
	settings: {
		screensClass: 'screen',
		defaultScreen: 0
	},


	// vars
	screens: [],
	currentScreen: null,
	nextScreen: null,
	prevScreen: null,
	innerHeight: null,
	innerWidth: null,
	

	// set initial screen positions
	gotoScreen: function(n) {
		if(this.screens.length === 0) {
			this.screens = document.getElementsByClassName(s.screensClass);	
		};
		if (n > this.screens.length-1) n = this.screens.length-1;
		if (n < 0) n = 0;

		for (var i = 0; i < this.screens.length; i++) {
			var left = (i - n)*this.innerWidth;
			var screen = this.screens[i];
			screen.style.left = left+'px';
		};
		this.currentScreen = n;
		if (n+1 < this.screens.length) {
			this.nextScreen = this.screens[n+1];
			this.nextScreen.style.MozTransition = 'none';
		} else {
			this.nextScreen = null;
		}
		if (n-1 < 0) {
			this.prevScreen = null;
		} else {
			this.prevScreen = this.screens[n-1];
			this.prevScreen.style.MozTransition = 'none';
		}


		// animate background
		if (Parallax.background.containerElem !== null) {
			var screenBackgroundOffset = Parallax.currentScreen*(Parallax.background.offsetWidth/Parallax.screens.length);

	        var backgroundPositionProp = screenBackgroundOffset+'px '+Parallax.background.offsetHeight+'px';
			
			Parallax.background.containerElem.style.backgroundPosition = backgroundPositionProp;
		}
        //console.log(screenBackgroundOffset);
        //console.log(screenBackgroundOffset+(leftPos/Parallax.screens.length));



		this.setScreenGesture();
	},

	setScreenGesture: function() {
		// setup gestures
		var screen = this.screens[this.currentScreen];
		if (screen.dataset.gd) { 
			return false;
		} else {
			screen.dataset.gd=true;
		}
		this.screenSwipeMngr.gestureDetector = new GestureDetector(screen);
		this.screenSwipeMngr.screen = screen;
		['touchstart','touchend','mousedown', 'mouseup', 'pan', 'tap', 'swipe'].forEach(function(evt) {
			screen.addEventListener(evt,
				this.screenSwipeMngr[evt].bind(this.screenSwipeMngr));
		}, this);
		this.screenSwipeMngr.gestureDetector.startDetecting()
	},


	screenSwipeMngr: {
        TRANSITION_SPEED: 1.8,
        TRANSITION_FRACTION: 0.50,
        DEFAULT_TRANSITION: 'all 0.2s ease-in-out',

        gestureDetector: null,
        screen: null,
        winWidth: null,

        touchstart: function screenSwipe_touchstart(e) {
            e.preventDefault();
            // console.log('touchstart',e.target.id);
            this.winWidth = window.innerWidth;
            Parallax.screens[Parallax.currentScreen].style.MozTransition = 'none';
            if (Parallax.prevScreen) Parallax.prevScreen.style.MozTransition = 'none';
            if (Parallax.nextScreen) Parallax.nextScreen.style.MozTransition = 'none';
        },
        touchend: function screenSwipe_touchend(e) {
        	// console.log('touchend',e.target.id);
            Parallax.screens[Parallax.currentScreen].style.MozTransition = this.DEFAULT_TRANSITION;
            Parallax.screens[Parallax.currentScreen].style.transform = '';
            if (Parallax.prevScreen) {
            	Parallax.prevScreen.style.MozTransition = this.DEFAULT_TRANSITION;
            	Parallax.prevScreen.style.transform = '';
            }
			if (Parallax.nextScreen) {
				Parallax.nextScreen.style.MozTransition = this.DEFAULT_TRANSITION;
				Parallax.nextScreen.style.transform = '';
			}
			
        },
        mousedown: function screenSwipe_mousedown(e) {
            this.touchstart(e);
        },

        mouseup: function screenSwipe_mouseup(e) {
			this.touchend(e); 
        },
        
        pan: function screenSwipe_pan(e) {
        	var leftPos = e.detail.absolute.dx;
        	translate = 'translateX('+leftPos+'px)';
        	Parallax.screens[Parallax.currentScreen].style.transform = translate;
            if (Parallax.prevScreen) Parallax.prevScreen.style.transform = translate;
            if (Parallax.nextScreen) Parallax.nextScreen.style.transform = translate;
        },

        tap: function screenSwipe_tap(e) {
        },

        swipe: function screenSwipe_swipe(e) {
            
            // We only want to deal with left to right swipes
            var fastenough = e.detail.vx > this.TRANSITION_SPEED;
            var distance = e.detail.start.screenX - e.detail.end.screenX;
            var farenough = Math.abs(distance) > this.winWidth * this.TRANSITION_FRACTION;
            if (farenough || fastenough) {
                var toScreen;
                if (e.detail.direction === 'left') {
                	toScreen = Parallax.currentScreen+1;

                } else if (e.detail.direction === 'right') {
                	toScreen = Parallax.currentScreen-1;
                }

                Parallax.screens[Parallax.currentScreen].style.transform = '';
                if (toScreen !== 'undefined') {
                	Parallax.screens[toScreen].style.transform = '';
                	Parallax.screens[toScreen].style.MozTransition = this.DEFAULT_TRANSITION;
                }

                console.log("Changing screens from:",Parallax.currentScreen, "to:", toScreen);
                Parallax.gotoScreen(toScreen);
                
                return;
            }
        }
        
    },

    background: {
    	// const
    	ZOOMIMAGE: 1.3,

    	// final zoomed bg image size
    	offsetHeight: null,
    	offsetWidth: null,
    	

    	// vars
    	containerElem: null,
    	
    	load: function(url) {
	    	var image = new Image();
	    	image.onload = function() {
	    		Parallax.background.containerElem = document.getElementsByTagName('body')[0];
	    		Parallax.background.containerElem.style.backgroundImage = 'url('+this.src+')'
	    		Parallax.background.fitImage(image);
	    	};
	    	image.src = url;

	    	
    	},
    	fitImage: function(image) {
    		var container = Parallax.background.containerElem;
    		var containerRatio = container.offsetHeight/container.offsetWidth;
    		var imageRatio = image.height/image.width;
    		
    		var backgroundSize;
    		if (containerRatio > imageRatio) {
    		 	backgroundSize = {
    		 		w: parseInt(container.offsetHeight/imageRatio),
    		 		h: container.offsetHeight
    		 	}
    		} else {
    			backgroundSize = {
    		 		w: container.offsetWidth,
    		 		h: parseInt(container.offsetWidth*imageRatio)
    		 	}
    		};
    		
    		// zoom for parallax
    		
    		var backgroundSizeProp = (backgroundSize.w*this.ZOOMIMAGE)+'px '+(backgroundSize.h*this.ZOOMIMAGE)+'px';
    		container.style.backgroundSize = backgroundSizeProp;

    		// center image
    		this.offsetHeight = (container.offsetHeight-(backgroundSize.h*this.ZOOMIMAGE))/2;
    		this.offsetWidth = (container.offsetWidth-(backgroundSize.w*this.ZOOMIMAGE))/2;
    		var backgroundPositionProp = this.offsetWidth+'px '+this.offsetHeight+'px';
    		container.style.backgroundPosition = backgroundPositionProp;

    		
    	}
    },

	resize: function(evt) {
		this.innerHeight = window.innerHeight;
		this.innerWidth = window.innerWidth;
	},


	init: function() {
		window.addEventListener("resize", this.resize);
		this.resize();
		this.gotoScreen(s.defaultScreen);
		
		this.background.load('images/wallpaper/yakushima.jpg');

	}
};

(function() {
	s = Parallax.settings;
	Parallax.init();
})();