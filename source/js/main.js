//  defer loading of stylesheets
// var loadStyleSheet = function (src) {
//   if (document.createStyleSheet) document.createStyleSheet(src);
//   else {
//     var stylesheet = document.createElement('link');
//     stylesheet.href = src;
//     stylesheet.rel = 'stylesheet';
//     stylesheet.type = 'text/css';
//     document.getElementsByTagName('head')[0].appendChild(stylesheet);
//   }
// }

// loadStyleSheet('/css/style.min.css');

/**
* @license MIT, GPL, do whatever you want
* @requires polyfill: Array.prototype.slice fix {@link https://gist.github.com/brettz9/6093105}
*/
// array.from polyfill
if (!Array.from) {
  Array.from = function (object) {
    'use strict';
    return [].slice.call(object);
  };
}

/**
 * Array.prototype.forEach() polyfill
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

/**
 * NodeList.prototype.forEach() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
 */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// get elembt coords
var getCoords = function (elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };

}

var updateMobileVariables = function () {
  // var html = document.querySelector('html');
  window.is_iphone = /iPhone|iPod/.test(navigator.userAgent);
  if(window.is_iphone) {
    document.querySelector('html').classList.add('iphone');
  }
  window.is_ipad = /iPad/.test(navigator.userAgent);
  window.is_ios = is_iphone || is_ipad;
  window.is_android = navigator.userAgent.toLowerCase().indexOf("android") > -1;
  window.is_mobile = is_ios || is_android;

  window.is_landscape = window.height > window.width;
  window.is_portrait = !window.is_landscape;
}

// loads picture fill
//=require ../../node_modules/picturefill/dist/picturefill.min.js
// axios ajx lib
// loaded in html
// //=require ../../node_modules/axios/dist/axios.js

window.onload = function () {
  // load micromodal lib https://micromodal.now.sh/
  //=require ../../node_modules/micromodal/dist/micromodal.js
  // MicroModal.init();

  updateMobileVariables();

  // Intersection observer srcset
  var images = window.document.querySelectorAll('source, img, iframe');
  var config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '0px 0px',
    threshold: 0.01
  };

  var preloadImage = function (element) {
    if (element.dataset && element.dataset.src) {
      element.src = element.dataset.src;
    }
    if (element.dataset && element.dataset.srcset) {
      element.srcset = element.dataset.srcset
    }
  }

  // If we don't have support for intersection observer, load the images immediately
  if (!('IntersectionObserver' in window)) {
    Array.from(images).forEach(function (image) { preloadImage(image) });
  }
  else {
    // It is supported, load the images by calling our method: onIntersection
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio > 0) {
          // Stop watching and load the image
          observer.unobserve(entry.target);
          // call our method: preloadImage
          preloadImage(entry.target);
        }
      });
    }, config);
    images.forEach(function (image) {
      observer.observe(image);
    });
  }
  // io srcset

  // scroll to section
  var scrollLinks = document.querySelectorAll('.scroll-to');
  scrollLinks.forEach(function(elem) {
    elem.addEventListener('click', function(e) {
      if (document.getElementById(this.getAttribute('href').split("#")[1])) {
        e.preventDefault();
        document.getElementById(this.getAttribute('href').split("#")[1]).scrollIntoView({ block: "start", behavior: "smooth" });
      }
    })
  });
};
