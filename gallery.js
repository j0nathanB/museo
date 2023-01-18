      class Slideshow {
        constructor(floaties) {
          this.albumIndex = 0;
          this.albumLength = 0;
          this.slideIndex = 0;
          this.floatiesData = floaties; // array of albums
          this.randomAlbums = []; // [7, 4, 1, etc.] values correspond to place in floatiesData
          this.randomAlbumsIx = 0; // pointer to current place in randomAlbums
          this.isPlaying = false;
          this.playSet = false;
          this.playAll = false;
          this.playRandom = false;
        }

        initRandom() {
          this.randomAlbums = this.shuffleIndexes(this.floatiesData)
        }

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
  
        shuffleIndexes(arr) {
          let indexes = arr.map( (e,i) => i)
          return this.shuffle(indexes)
        }

        createSlide(imgHtml) {
          const url = 'https://floaties.s3.amazonaws.com/img/';
          const img = document.createElement("img");
          img.setAttribute("src", `${url}${imgHtml.name}`);
          const div = document.createElement("div");
          div.classList.add("slides");
          div.appendChild(img);
          return div;
        }

        createAndRenderSlides() {
          const album = this.floatiesData[this.albumIndex]
          const images = album['images']
          const slideshowContainer = document.querySelector(".slideshow-container");
          slideshowContainer.replaceChildren();
  
          let imgData = this.extractImageData(album, images)

          imgData.forEach((img) => {
              const slide = this.createSlide(img);
              slideshowContainer.appendChild(slide);
          });

          return imgData
        }

        extractImageReferences(contentTemplate) {
          const re = /{.*}/g
          const editedTemplate = contentTemplate.replaceAll('}{', '}\n{')
          return editedTemplate.match(re)
        }
        
        removeScale(imageReference) {
          if (imageReference.includes('scale')) {
            const ix = imageReference.search(' scale')
            return imageReference.slice(0, ix) + '}'
          } else {
            return imageReference
          }
        }
        
        extractImageData(album, images) {
          const imageReferences = this.extractImageReferences(album.content_template)
          const cleanedReferences = imageReferences.map(this.removeScale)
          const imageLookup = images.reduce((obj, cur) => (
            { ...obj, [cur.image_ref]: {"name": cur.name}}), {})
        
          return cleanedReferences.map(ref => imageLookup[ref])
        }

        navigateAlbum(direction) {
          let newIndex = this.albumIndex + direction;
          this.albumIndex = newIndex < 0 ? this.floatiesData.length - 1 : newIndex % this.floatiesData.length;
          this.loadSlidesAndAlbumData(this.albumIndex);
        }

        loadSlidesAndAlbumData(newIndex=0) {
          this.albumIndex = newIndex < 0 ? this.floatiesData.length - 1 : newIndex % this.floatiesData.length;
          const imgData = this.createAndRenderSlides()

          const album = this.floatiesData[this.albumIndex]
          this.updateAlbumData(album)

          if (!this.playRandom) {
            this.slideIndex = 0
          } else {
            this.slideIndex = this.shuffleIndexes(imgData)[0]
          }
          this.showSlides(this.slideIndex)
        }

        extractAlbumData(album) {
          return {
            albumTitle: album['title'],
            albumTags: album['tags'],
            worksAttr: album['attributions']['works_attr'],
            titleAttr: album['attributions']['title_attr'],
            link: album['link']
          }
        }
  
        cleanAttribution(attribution) {
          const re = /by([^\s:])/
          const matches = attribution.match(re)
          if(matches) {
            attribution = attribution.replace(' by', ' by ')
          }

          return attribution
        }

        formatAlbumData(title, titleAttr, worksAttr, tags, link) {
          let albumData = `<div>`;
          albumData += `<p class="album-title">${title}</p>`;
          if (titleAttr.length > 0) {
            albumData += `<p><i>- ${titleAttr}</i></p>`;
          }
          if (worksAttr.length > 0) {
            albumData += `<br/><p>${worksAttr}</p>`;
          }
          albumData += `<br/><br/><div class="tags">${tags}</div>`;
          albumData += `<br/><div><a href=${link}>Link</a></div>`;
          albumData += `<br/></div>`;
          return albumData;
        }

        populateAlbumData(album) {
          const albumData = this.extractAlbumData(album)
          albumData.worksAttr = this.cleanAttribution(albumData.worksAttr)
          const albumTitle = albumData['albumTitle']
          const titleAttr = albumData['titleAttr']
          const worksAttr = albumData['worksAttr']
          const albumTags = albumData['albumTags']
          const link = albumData['link']

          const albumDataDisplay = this.formatAlbumData(albumTitle, titleAttr, worksAttr, albumTags, link);
          return htmlToElement(albumDataDisplay)    
        }

        updateAlbumData(album) {
          const albumDataContainer = document.getElementsByClassName("album-data")[0];
          albumDataContainer.replaceChildren();
          const albumData = this.populateAlbumData(album);
          albumDataContainer.appendChild(albumData);
          this.showFraction('album', this.albumIndex, this.floatiesData.length)
        }

        navigateSlide(direction) {
          this.showSlides(direction);
        }


        showSlides(direction) {
          let slides = document.getElementsByClassName("slides");
          let newIndex = this.slideIndex + direction;
          this.albumLength = slides.length
          this.slideIndex = newIndex < 0 ? slides.length - 1 : newIndex % slides.length;

          for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
          }

          slides[this.slideIndex].style.display = "block";
          this.showFraction('slides', this.slideIndex, slides.length)
        }

        playSlideshow(option) {
          const slides = Array.from(document.getElementsByClassName('slides'))
          const isPlaying = !this.isPlaying;
          this.isPlaying = isPlaying;

          if(this.isPlaying) {
            slides.forEach(s => s.classList.add('fade'))
              this.playSet = option === 'set'
              this.playAll = option === 'all';
              this.playRandom = option === 'random';
              this.playSlides(slides);
          } else {
              slides.forEach(s => s.classList.remove('fade'))
              this.playSet = false;
              this.playAll = false;
              this.playRandom = false;
              // this.slideIndex -= 1;

          }
          this.toggleNavigation();
        }

        playSlides() {
          if(this.isPlaying) {
            // showFraction('slides', this.slideIndex, this.albumLength)
            setTimeout(() => this.playSlides(), 6000)
            this.playImageSet()
            this.playAllSets()
            this.playRandomImages()
          }
        }



        playImageSet() {
            this.showSlides(0)
            this.slideIndex += 1
        }

        playAllSets() {
          if(this.playAll) {
            if (this.slideIndex > this.albumLength - 1) {
              this.albumIndex += 1
              this.loadSlidesAndAlbumData(this.albumIndex)
              const slides = Array.from(document.getElementsByClassName('slides'))
              slides.forEach(s => s.classList.add('fade'))
              this.showSlides(0)
              this.slideIndex += 1
            }
          }
        }

        playRandomImages() {
          if(this.playRandom) {
            this.albumIndex = this.randomAlbums[this.randomAlbumsIx]
            this.loadSlidesAndAlbumData(this.albumIndex)

            let randomImageIx = this.shuffleIndexes(this.floatiesData[albumIndex]['images'])[0]
            this.slideIndex = randomImageIx
            const slides = Array.from(document.getElementsByClassName('slides'))
            slides.forEach(s => s.classList.add('fade'))
            this.showSlides(this.slideIndex)

            this.randomAlbumsIx += 1
          }    
        }

        randomAlbum() {
          this.albumIndex = this.randomAlbums[this.randomAlbumsIx]
          this.loadSlidesAndAlbumData(this.albumIndex)
  
          this.slideIndex = 0
          this.showSlides(slideIndex)
  
          this.randomAlbumsIx += 1
        }

        toggleNavigation() {
          const slideNavigation = document.querySelector(".slide-navigation-container")
          const albumNavigation = document.querySelector(".album-navigation")

          slideNavigation.classList.toggle("disable");
          albumNavigation.classList.toggle("disable");
        }

        showFraction(option, num, denom){
          if(option == 'slides') {
            const slideFractionDiv = document.getElementsByClassName("slide-fraction")[0]
            slideFractionDiv.innerHTML = `${num + 1} / ${denom}`
          } else {
            const albumFractionDiv = document.getElementsByClassName("album-fraction")[0]
            albumFractionDiv.innerHTML = `${this.albumIndex + 1} / ${denom}<br /><br />`
          }
        }

      }

      
      function htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.children[0];
      }

      async function fetchSlideData(albumIndex, slideIndex) {
        const response = await fetch("https://floaties.s3.us-west-1.amazonaws.com/floaties.json");
        const json = await response.json();
        return json
      }

      async function loadFunctionality() {
        const floaties = await fetchSlideData(0,0)
        const slideshow = new Slideshow(floaties)

        const prevSlide = document.getElementById('prev-slide');
        prevSlide.addEventListener('click', () => slideshow.navigateSlide(-1), false );

        const nextSlide = document.getElementById('next-slide')
        nextSlide.addEventListener('click', () => slideshow.navigateSlide(1), false )

        const prevAlbum = document.getElementById('prev-album')
        prevAlbum.addEventListener('click', () => slideshow.navigateAlbum(-1), false )

        const randomAlbum = document.getElementById('random-album')
        randomAlbum.addEventListener('click', () => slideshow.randomAlbum(), false )

        const nextAlbum = document.getElementById('next-album')
        nextAlbum.addEventListener('click', () => slideshow.navigateAlbum(1), false )

        const playSet = document.getElementById('play-set')
        playSet.addEventListener('click', () => slideshow.playSlideshow("set"), false )

        const playAll = document.getElementById('play-all')
        playAll.addEventListener('click', () => slideshow.playSlideshow("all"), false )

        const playRandom = document.getElementById('play-random')
        playRandom.addEventListener('click', () => slideshow.playSlideshow("random"), false )

        slideshow.initRandom()
        slideshow.loadSlidesAndAlbumData()
      }

      loadFunctionality()