class Slides {
  constructor() {
    this.slides = []; // array to hold the slide elements
    this.currentSlideIndex = 0; // keep track of the current slide
    this.baseUrl = 'https://floaties.s3.amazonaws.com/img/'
    this.isPlaying = false // flag to indicate if the slideshow is playing
  }

  // create an individual slide from image data
  createSlide(data) {
    const img = document.createElement("img");
    img.setAttribute("src", `${this.baseUrl}${data.name}`);
    if(data.name.includes("svg")) {
      img.setAttribute('width', '1200px')
    } 
    img.setAttribute("sizes", "(min-width: 800px) 50vw, 100vw")
    const div = document.createElement("div");
    div.classList.add("slides");
    div.appendChild(img);
    return div;
  }

  // render the slides to the DOM
  renderSlides(imgData) {
    const slideshowContainer = document.querySelector(".slideshow-container");
    slideshowContainer.replaceChildren();

    imgData.forEach((img) => {
        const slide = this.createSlide(img);
        slideshowContainer.appendChild(slide);
    });
  }

  // move to the next or previous slide
  navigateSlides(direction) {
    this.showSlides(direction);
  }
  
  // set the current slide index
  setSlideIndex(newIndex = 0) {
    this.currentSlideIndex = newIndex
  }

  // show the current slide and hide all other slides
  showSlides(direction = 0) {
    this.slides = this.getSlidesElement() // load our slides into the global object
    let slides = this.slides;
    let newIndex = this.currentSlideIndex + direction;
    this.albumLength = slides.length
    this.currentSlideIndex = newIndex < 0 ? slides.length - 1 : newIndex % slides.length;

    // Remove fade class from all slides first to prevent conflicts
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.remove('fade');
      slides[i].style.display = "none";
      slides[i].style.opacity = ""; // Reset any inline opacity
    }

    if(this.isPlaying) {
      // For slideshow: start slide hidden with fade class, then show to trigger animation
      slides[this.currentSlideIndex].style.opacity = "0";
      slides[this.currentSlideIndex].style.display = "block";
      slides[this.currentSlideIndex].classList.add('fade');
      // Force a reflow to ensure opacity change is applied before animation
      slides[this.currentSlideIndex].offsetHeight;
    } else {
      // For manual navigation: just show the slide without fade
      slides[this.currentSlideIndex].style.opacity = "1";
      slides[this.currentSlideIndex].style.display = "block";
    }
  }

  // return the slide element from the DOM
  getSlidesElement() {
    return document.getElementsByClassName("slides")
  }
}

class Album {
  constructor(data) {
    this.title = data.title;
    this.tags = data.tags;
    this.attributions = data.attributions;
    this.titleAttr = data.attributions.title_attr
    this.worksAttr = data.attributions.works_attr;
    this.link = data.link;
    this.images = data.images;
    this.template = data.content_template
    this.albumLength = 0 // we set this in extractImageData
    this.albumIndex = 0
  }

  // render the album and update the display of the album's data
  loadAlbum(albumIndex) {
    this.updateAlbumDataDisplay()
    this.getImageDataForRendering()
    this.albumIndex = albumIndex
  }

  // extract image references from the content template
  extractImageReferences(contentTemplate) {
    const re = /{.*}/g
    const editedTemplate = contentTemplate.replaceAll('}{', '}\n{')
    return editedTemplate.match(re)
  }
  
  // remove the scale value from the image reference
  removeScale(imageReference) {
    if (imageReference.includes('scale')) {
      const ix = imageReference.search(' scale')
      return imageReference.slice(0, ix) + '}'
    } else {
      return imageReference
    }
  }
  
  // extract image data from the template
  extractImageData(contentTemplate, images) {
    const imageReferences = this.extractImageReferences(contentTemplate)
    const cleanedReferences = imageReferences.map(this.removeScale)
    const imageLookup = images.reduce((obj, cur) => (
      { ...obj, [cur.image_ref]: {"name": cur.name}}), {})
  
    return cleanedReferences.map(ref => imageLookup[ref])
  }

  // clean the formatting in the attribution field
  cleanAttribution(attribution) {
    const re = /by([^\s:])/
    const matches = attribution.match(re)
    if(matches) {
      attribution = attribution.replace(' by', ' by ')
    }

    return attribution
  }

  // format album data into an HTML string, then parse into DOM element
  formatAlbumData(title, titleAttr, worksAttr, tags, link) {
    console.log('=== formatAlbumData called ===');
    console.log('Title:', title);
    console.log('TitleAttr:', titleAttr);
    console.log('WorksAttr:', worksAttr);
    
    let albumData = `<div>`;
    
    // Top content (title and titleAttr)
    albumData += `<div class="top-content">`;
    albumData += `<p class="album-title">${title}</p>`;
    if (titleAttr.length > 0) {
      albumData += `<p><i>- ${titleAttr}</i></p>`;
    }
    albumData += `</div>`;
    
    // Bottom content (worksAttr, tags, link) - fixed near play button
    albumData += `<div class="bottom-content">`;
    if (worksAttr.length > 0) {
      albumData += `<p>${worksAttr}</p>`;
    }
    albumData += `<div class="tags">${tags}</div>`;
    albumData += `<div><a href=${link}>Link</a></div>`;
    albumData += `</div>`;
    
    albumData += `</div>`;
    
    console.log('Generated HTML:', albumData);
    const element = htmlToElement(albumData);
    console.log('DOM Element:', element);
    
    return element;
  }

  // get album fields from an album
  getAlbumData(album) {
    this.title = album.title;
    this.tags = album.tags;
    this.attributions = album.attributions;
    this.titleAttr = album.attributions.title_attr
    this.worksAttr = this.cleanAttribution(album.attributions.works_attr);
    this.link = album.link;
    this.images = album.images;
    this.template = album.content_template         
  }

  // update the album data on screen
  updateAlbumDataDisplay() {
    const albumDataContainer = document.getElementsByClassName("album-data")[0];
    albumDataContainer.replaceChildren();
    const albumData = this.formatAlbumData(this.title, this.titleAttr, this.worksAttr, this.tags, this.link);
    albumDataContainer.appendChild(albumData);
    
    // Resize album titles to fit their containers
    // Increased delay to prevent layout jank during navigation
    setTimeout(() => resizeAlbumTitles(), 50); // Allow DOM to fully settle
  }

  // get image data for rendering
  getImageDataForRendering() {
    const imageData = this.extractImageData(this.template, this.images)
    this.albumLength = imageData.length
    return imageData
  }
}

class Slideshow {
  constructor(floaties) {
    this.slideIndex = 0;
    this.albumCollection = floaties; // array of albums
    this.randomAlbums = this.shuffleIndexes(this.albumCollection); // [7, 4, 1, etc.] values correspond to place in albumCollection
    this.randomAlbumsIx = 0; // pointer to current place in randomAlbums
    this.isPlaying = false;
    this.playMode = ""
    this.slides = new Slides();
    this.album = new Album(this.albumCollection[0])
    this.timeOutId = 0
    this.router = null; // Will be initialized later
  }

  // fisher-yates shuffle
  shuffle(arr) {
    let i = arr.length
    let j = 0
    let temp = {}

    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
  }

  // use fisher-yates to shuffle indexes of a given array
  shuffleIndexes(arr) {
    let indexes = arr.map( (e,i) => i)
    return this.shuffle(indexes)
  }

  // initialize URL router
  initializeRouter() {
    this.router = new URLRouter(this);
    this.router.initialize();
  }

  // move to next or previous album
  navigateAlbum(direction = 0) {
    let newIndex = this.album.albumIndex + direction;
    this.album.albumIndex = newIndex < 0 ? this.albumCollection.length - 1 : newIndex % this.albumCollection.length;
    this.loadAlbum(this.album.albumIndex)
    this.displaySlides()
    this.updateAlbumCounter()
    
    // Update URL if router is available
    if (this.router) {
      this.router.updateURL();
    }
  }

  // gets album data and loads it into the state
  loadAlbum(albumIndex = 0) {
    this.album.getAlbumData(this.albumCollection[albumIndex])
    this.album.loadAlbum(albumIndex)
    this.updateAlbumCounter()
  }

  // renders the slides from the album, shows current slide and counter
  displaySlides(slideIndex = 0) {
    this.slides.renderSlides(this.album.getImageDataForRendering())
    this.slides.setSlideIndex(slideIndex)
    this.slides.showSlides()
    this.updateSlidesCounter(this.slides.currentSlideIndex, this.slides.slides.length)
  }

  // navigate next/previous slide
  navigateSlides(direction = 0) {
    this.slides.navigateSlides(direction);
    this.updateSlidesCounter(this.slides.currentSlideIndex, this.slides.slides.length)
    
    // Update URL if router is available (use setTimeout to ensure slide index is updated)
    if (this.router) {
      setTimeout(() => {
        this.router.updateURL();
      }, 0);
    }
  }

  // update album counter
  updateAlbumCounter(){
    const albumCounterDiv = document.getElementsByClassName("album-counter")[0]
    const currentCollection = formatNumber(this.album.albumIndex + 1)
    const totalCollections = formatNumber(this.albumCollection.length)
    albumCounterDiv.innerHTML = `Collection ${currentCollection} of ${totalCollections}<br /><br />`
  }

  // update slide counter
  updateSlidesCounter(){
    const slideCounterDiv = document.getElementsByClassName("slide-counter")[0]
    slideCounterDiv.innerHTML = `Image ${this.slides.currentSlideIndex + 1} of ${this.slides.slides.length}`
  }

  // sets state variables before playing, resets them when paused
  playSlideshow(playbackOption) {
    const isPlaying = !this.isPlaying;
    this.isPlaying = isPlaying;
    this.slides.isPlaying = this.isPlaying
    this.playMode = playbackOption

    if(this.isPlaying) {
        this.playSlides(playbackOption);
    } else {
      clearTimeout(this.timeOutId)
      this.playMode = ""

      if (this.slides.currentSlideIndex == this.slides.slides.length) {
        this.slides.currentSlideIndex -= 1
      }
      const currentSlide = this.slides.getSlidesElement()[this.slides.currentSlideIndex];
      currentSlide.classList.remove('fade');
      currentSlide.style.opacity = ""; // Reset opacity when stopping
      if(playbackOption != 'random'){
        this.slides.showSlides(-1)
      }
    }
    this.toggleNavigation(playbackOption);
  }

  // main slideshow loop
  playSlides() {
    if(this.isPlaying) {
      this.timeOutId = setTimeout(() => this.playSlides(this.playMode), 9000)
    
      if(this.playMode == 'set') {
        this.playImageSet()
      } else if(this.playMode == 'all') {
        this.playAllSets()
      } else if(this.playMode = 'random') {
        this.playRandomImages()
      }
    }
  }

  // play through the entire collection
  playAllSets() {
      if (this.slides.currentSlideIndex == this.album.albumLength) {
        this.album.albumIndex += 1
        this.album.albumIndex = this.album.albumIndex == this.albumCollection.length ? 0 : this.album.albumIndex;

        this.album.getAlbumData(this.albumCollection[this.album.albumIndex])
        this.album.loadAlbum(this.album.albumIndex)
        this.updateAlbumCounter()
        this.displaySlides()
      }
      this.playImageSet()
  }
  
  // slideshow of random images
  playRandomImages() {
    this.getRandomImage()
    this.randomAlbumsIx += 1
  }

  // loop through a set
  playImageSet() {
      this.displaySlides(this.slides.currentSlideIndex)
      this.slides.setSlideIndex(this.slides.currentSlideIndex + 1)
  }

  // gets a random album's data and loads it
  getRandomAlbum() {
    this.album.albumIndex = this.randomAlbums[this.randomAlbumsIx]
    this.album.getAlbumData(this.albumCollection[this.album.albumIndex])
    this.album.loadAlbum(this.album.albumIndex)
    this.updateAlbumCounter()
    this.randomAlbumsIx += 1
  }

  getRandomImage() {
    this.getRandomAlbum()
    let randomImageIx = this.shuffleIndexes(this.albumCollection[this.album.albumIndex]['images'])[0]
    this.displaySlides(randomImageIx)
  }

  // shows a random album 
  randomAlbum() {
    this.getRandomAlbum()
    this.displaySlides()
    
    // Update URL if router is available
    if (this.router) {
      this.router.updateURL();
    }
  }

  // turn navigation on or off when the slideshow is playing
  toggleNavigation(currentPlayBackOption = "") {
    // Disable individual slide navigation buttons instead of the whole container
    const prevSlide = document.getElementById('prev-slide')
    const nextSlide = document.getElementById('next-slide')
    const albumNavigation = document.querySelector(".album-navigation")

    prevSlide.classList.toggle("disable");
    nextSlide.classList.toggle("disable");
    albumNavigation.classList.toggle("disable");

    const elements = {
      set: document.getElementById('play-set'),
      all: document.getElementById('play-all'),
      random: document.getElementById('play-random')
    }

    Object.keys(elements).forEach(key => {
      if (key !== currentPlayBackOption) {
          elements[key].classList.toggle("disable");
      }
    });
  }
}


function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.children[0];
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Make formatNumber available globally for testing
window.formatNumber = formatNumber;

// Dynamic content resizing function - images only, titles are fixed at 28px
function resizeAlbumTitles() {
  console.log('=== Starting dynamic image resizing (titles fixed at 28px) ===');
  
  // Only resize images - titles are now fixed at 28px in CSS
  resizeImages();
  
  console.log('=== Image resizing complete ===');
}

function resizeImages() {
  const images = document.querySelectorAll('.slideshow-container img');
  console.log(`Resizing ${images.length} images using calc() approach`);
  
  images.forEach(img => {
    // Calculate total vertical spacing used by other elements
    // Updated based on current CSS: layout padding + title space + button space
    const layoutPadding = 32; // Only top padding from .layout-container (bottom removed)
    const titleSpace = 100; // Title + reduced margins
    const buttonSpace = 80; // Navigation buttons (reduced margins)
    const safetyMargin = 30; // Extra safety margin for consistency
    
    const totalVerticalSpacing = layoutPadding + titleSpace + buttonSpace + safetyMargin;
    
    console.log(`Calculated vertical spacing: ${totalVerticalSpacing}px`);
    
    // Set image to use remaining viewport height with object-fit
    img.style.maxHeight = `calc(100vh - ${totalVerticalSpacing}px)`;
    img.style.objectFit = 'contain'; // Maintain aspect ratio
    img.style.width = '100%';
    img.style.height = 'auto';
    
    console.log(`Set image max-height to: calc(100vh - ${totalVerticalSpacing}px)`);
  });
}


// Helper function to detect vertical scrollbars
function hasVerticalScrollbars() {
  // Check if document height exceeds viewport height
  return document.documentElement.scrollHeight > window.innerHeight;
}

// Make functions available globally for testing
window.resizeAlbumTitles = resizeAlbumTitles;
window.resizeImages = resizeImages;

class URLRouter {
  constructor(slideshow) {
    this.slideshow = slideshow;
    this.isUpdating = false; // Prevent infinite loops
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handleURLChange();
    });
    
    // Listen for hash changes
    window.addEventListener('hashchange', (event) => {
      this.handleURLChange();
    });
  }

  // Parse current URL and extract collection ID and slide number
  parseURL() {
    const hash = window.location.hash;
    console.log('URLRouter: Parsing URL hash:', hash);
    
    if (!hash || hash === '#') {
      return { collectionId: null, slideNum: null };
    }

    // Match patterns: #collection/{id} or #collection/{id}/slide/{number}
    const collectionMatch = hash.match(/^#collection\/([^\/]+)(?:\/slide\/(\d+))?$/);
    
    if (!collectionMatch) {
      console.log('URLRouter: Malformed URL, using defaults');
      return { collectionId: null, slideNum: null };
    }

    const collectionId = collectionMatch[1];
    const slideNum = collectionMatch[2] ? parseInt(collectionMatch[2], 10) : null;
    
    console.log('URLRouter: Parsed - Collection ID:', collectionId, 'Slide:', slideNum);
    return { collectionId, slideNum };
  }

  // Find album index by collection ID
  findAlbumIndexById(collectionId) {
    if (!collectionId) return 0;
    
    const index = this.slideshow.albumCollection.findIndex(album => album.id === collectionId);
    console.log('URLRouter: Found album index', index, 'for collection ID', collectionId);
    return index >= 0 ? index : 0;
  }

  // Handle URL changes from browser navigation
  handleURLChange() {
    if (this.isUpdating) {
      console.log('URLRouter: Skipping URL change handling (currently updating)');
      return;
    }

    console.log('URLRouter: Handling URL change');
    const { collectionId, slideNum } = this.parseURL();
    
    // Find and load the specified collection
    const albumIndex = this.findAlbumIndexById(collectionId);
    const slideIndex = slideNum ? Math.max(0, slideNum - 1) : 0; // Convert to 0-indexed
    
    console.log('URLRouter: Navigating to album', albumIndex, 'slide', slideIndex);
    
    // Update slideshow state without triggering URL updates
    this.isUpdating = true;
    
    if (this.slideshow.album.albumIndex !== albumIndex) {
      this.slideshow.loadAlbum(albumIndex);
      this.slideshow.displaySlides(slideIndex);
    } else if (this.slideshow.slides.currentSlideIndex !== slideIndex) {
      this.slideshow.slides.setSlideIndex(slideIndex);
      this.slideshow.slides.showSlides(0);
      this.slideshow.updateSlidesCounter(this.slideshow.slides.currentSlideIndex, this.slideshow.slides.slides.length);
    }
    
    this.updatePageTitle();
    this.isUpdating = false;
  }

  // Generate URL for current state
  generateURL() {
    const currentAlbum = this.slideshow.albumCollection[this.slideshow.album.albumIndex];
    const currentSlideIndex = this.slideshow.slides.currentSlideIndex;
    
    if (!currentAlbum || !currentAlbum.id) {
      console.log('URLRouter: No valid album data for URL generation');
      return '#';
    }

    let url = `#collection/${currentAlbum.id}`;
    
    // Only include slide number if not on first slide
    if (currentSlideIndex > 0) {
      url += `/slide/${currentSlideIndex + 1}`; // Convert to 1-indexed
    }
    
    console.log('URLRouter: Generated URL:', url);
    return url;
  }

  // Update browser URL and title
  updateURL() {
    if (this.isUpdating) {
      console.log('URLRouter: Skipping URL update (currently handling URL change)');
      return;
    }

    const newURL = this.generateURL();
    const currentURL = window.location.hash;
    
    if (newURL !== currentURL) {
      console.log('URLRouter: Updating URL from', currentURL, 'to', newURL);
      window.history.pushState(null, '', newURL);
      this.updatePageTitle();
    }
  }

  // Update page title with collection information
  updatePageTitle() {
    const currentAlbum = this.slideshow.albumCollection[this.slideshow.album.albumIndex];
    if (currentAlbum && currentAlbum.title) {
      const title = `${currentAlbum.title} - Museo`;
      console.log('URLRouter: Updating page title to:', title);
      document.title = title;
    }
  }

  // Initialize router with current URL state
  initialize() {
    console.log('URLRouter: Initializing');
    const { collectionId, slideNum } = this.parseURL();
    
    if (collectionId) {
      // URL specifies a collection, load it
      this.handleURLChange();
    } else {
      // No URL state, update URL to reflect current state
      this.updateURL();
    }
  }
}

async function fetchAllData() {
  const response = await fetch("https://floaties.s3.us-west-1.amazonaws.com/floaties.json");
  const data = await response.json();
  return data.reverse()
}

async function loadFunctionality() {
  const data = await fetchAllData()
  const slideshow = new Slideshow(data)
  
  // Make slideshow available globally for testing
  window.slideshow = slideshow;

  const prevSlide = document.getElementById('prev-slide');
  prevSlide.addEventListener('click', () => slideshow.navigateSlides(-1), false );

  const playPause = document.getElementById('play-pause')
  playPause.addEventListener('click', () => {
    if (slideshow.isPlaying) {
      slideshow.playSlideshow(slideshow.playMode) // Stop current playback
      playPause.textContent = 'Play'
    } else {
      slideshow.playSlideshow("set") // Start playing current set
      playPause.textContent = 'Pause'
    }
  }, false )

  const nextSlide = document.getElementById('next-slide')
  nextSlide.addEventListener('click', () => slideshow.navigateSlides(1), false )

  const prevAlbum = document.getElementById('prev-album')
  prevAlbum.addEventListener('click', () => slideshow.navigateAlbum(-1), false )

  const randomAlbum = document.getElementById('random-album')
  randomAlbum.addEventListener('click', () => slideshow.randomAlbum(), false )

  const nextAlbum = document.getElementById('next-album')
  nextAlbum.addEventListener('click', () => slideshow.navigateAlbum(1), false )

  const playSet = document.getElementById('play-set')
  playSet.addEventListener('click', () => {
    slideshow.playSlideshow("set")
    playPause.textContent = slideshow.isPlaying ? 'Pause' : 'Play'
  }, false )

  const playAll = document.getElementById('play-all')
  playAll.addEventListener('click', () => {
    slideshow.playSlideshow("all")
    playPause.textContent = slideshow.isPlaying ? 'Pause' : 'Play'
  }, false )

  const playRandom = document.getElementById('play-random')
  playRandom.addEventListener('click', () => {
    slideshow.playSlideshow("random")
    playPause.textContent = slideshow.isPlaying ? 'Pause' : 'Play'
  }, false )

  slideshow.loadAlbum()
  slideshow.displaySlides()
  
  // Initialize router after slideshow is set up
  slideshow.initializeRouter()
}

loadFunctionality()