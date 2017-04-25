/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.0.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = (function() {

	  /*
	    ---------------
	    Variables
	    ---------------
	  */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // form input types
	  var formInputs = [
	    'input',
	    'select',
	    'textarea'
	  ];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [
	    16, // shift
	    17, // control
	    18, // alt
	    91, // Windows key / left Apple cmd
	    93  // Windows menu / right Apple cmd
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    'keyup': 'keyboard',
	    'mousedown': 'mouse',
	    'mousemove': 'mouse',
	    'MSPointerDown': 'pointer',
	    'MSPointerMove': 'pointer',
	    'pointerdown': 'pointer',
	    'pointermove': 'pointer',
	    'touchstart': 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer timer is running
	  var isBuffering = false;

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  // touch buffer timer
	  var touchTimer = null;


	  /*
	    ---------------
	    Set up
	    ---------------
	  */

	  var setUp = function() {

	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };


	  /*
	    ---------------
	    Events
	    ---------------
	  */

	  var addListeners = function() {

	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      docElem.addEventListener('pointerdown', updateInput);
	      docElem.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      docElem.addEventListener('MSPointerDown', updateInput);
	      docElem.addEventListener('MSPointerMove', setIntent);
	    } else {

	      // mouse events
	      docElem.addEventListener('mousedown', updateInput);
	      docElem.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        docElem.addEventListener('touchstart', touchBuffer);
	      }
	    }

	    // mouse wheel
	    docElem.addEventListener(detectWheel(), setIntent);

	    // keyboard events
	    docElem.addEventListener('keydown', updateInput);
	    docElem.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (
	        currentInput !== value ||
	        currentIntent !== value
	      ) {

	        var activeElem = document.activeElement;
	        var activeInput = (
	          activeElem &&
	          activeElem.nodeName &&
	          formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1
	        ) ? true : false;

	        if (
	          value === 'touch' ||

	          // ignore mouse modifier keys
	          (value === 'mouse' && ignoreMap.indexOf(eventKey) === -1) ||

	          // don't switch if the current element is a form input
	          (value === 'keyboard' && activeInput)
	        ) {

	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function() {
	    docElem.setAttribute('data-whatinput', currentInput);
	    docElem.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      docElem.className += ' whatinput-types-' + currentInput;
	    }
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        docElem.setAttribute('data-whatintent', currentIntent);
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function(event) {

	    // clear the timer if it happens to be running
	    window.clearTimeout(touchTimer);

	    // set the current input
	    updateInput(event);

	    // set the isBuffering to `true`
	    isBuffering = true;

	    // run the timer
	    touchTimer = window.setTimeout(function() {

	      // if the timer runs out, set isBuffering back to `false`
	      isBuffering = false;
	    }, 200);
	  };


	  /*
	    ---------------
	    Utilities
	    ---------------
	  */

	  var pointerType = function(event) {
	   if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	   } else {
	      return (event.pointerType === 'pen') ? 'touch' : event.pointerType; // treat pen like touch
	   }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function() {
	    return 'onwheel' in document.createElement('div') ?
	      'wheel' : // Modern browsers support "wheel"

	      document.onmousewheel !== undefined ?
	        'mousewheel' : // Webkit and IE support at least "mousewheel"
	        'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
	  };


	  /*
	    ---------------
	    Init

	    don't start script unless browser cuts the mustard
	    (also passes if polyfills are used)
	    ---------------
	  */

	  if (
	    'addEventListener' in window &&
	    Array.prototype.indexOf
	  ) {
	    setUp();
	  }


	  /*
	    ---------------
	    API
	    ---------------
	  */

	  return {

	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function(opt) { return (opt === 'loose') ? currentIntent : currentInput; },

	    // returns array: all the detected input types
	    types: function() { return inputTypes; }

	  };

	}());


/***/ }
/******/ ])
});
;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('[data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        this.firstTimeInit = true;
        if ($initActive.length) {
          this.down($initActive, this.firstTimeInit);
          this.firstTimeInit = false;
        }

        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]'),
                $anchor = $(anchor);

            if ($link.length && $anchor) {
              if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
                _this2.down($anchor, _this2.firstTimeInit);
                _this2.firstTimeInit = false;
              };

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var _this = _this2;
                $(window).load(function () {
                  var offset = _this.$element.offset();
                  $('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
                });
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Accordion#deeplink
                */
              _this2.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function toggle() {
                  _this.toggle($tabContent);
                },
                next: function next() {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function previous() {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function handled() {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
        //either replace or update browser history
        if (this.options.deepLink) {
          var anchor = $target.prev('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this3 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this3.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');
        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @type {number}
     * @default 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @type {boolean}
     * @default false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @type {boolean}
     * @default false
     */
    allowAllClosed: false,
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the accordion panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open accordion
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        $(window).on('resize.zf.interchange', Foundation.util.throttle(function () {
          _this2._reflow();
        }, 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          if (this.rules.hasOwnProperty(i)) {
            var rule = this.rules[i];
            if (window.matchMedia(rule.query).matches) {
              match = rule;
            }
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          if (Foundation.MediaQuery.queries.hasOwnProperty(i)) {
            var query = Foundation.MediaQuery.queries[i];
            Interchange.SPECIAL_QUERIES[query.name] = query.value;
          }
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange');
        }

        rules = typeof rules === 'string' ? rules.match(/\[.*?\]/g) : rules;

        for (var i in rules) {
          if (rules.hasOwnProperty(i)) {
            var rule = rules[i].slice(1, -1).split(', ');
            var path = rule.slice(0, -1).join('');
            var query = rule[rule.length - 1];

            if (Interchange.SPECIAL_QUERIES[query]) {
              query = Interchange.SPECIAL_QUERIES[query];
            }

            rulesList.push({
              path: path,
              query: query
            });
          }
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).on('load', function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     * @type {?array}
     * @default null
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.keyboard
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */


    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.off('open.zf.trigger toggle.zf.trigger').on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
       * @private
       */

    }, {
      key: '_stopScrolling',
      value: function _stopScrolling(event) {
        return false;
      }

      // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
      // Only really works for y, not sure how to extend to x or if we need to.

    }, {
      key: '_recordScrollable',
      value: function _recordScrollable(event) {
        var elem = this; // called from event handler context with this as elem

        // If the element is scrollable (content overflows), then...
        if (elem.scrollHeight !== elem.clientHeight) {
          // If we're at the top, scroll down one pixel to allow scrolling up
          if (elem.scrollTop === 0) {
            elem.scrollTop = 1;
          }
          // If we're at the bottom, scroll up one pixel to allow scrolling down
          if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
          }
        }
        elem.allowUp = elem.scrollTop > 0;
        elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
        elem.lastY = event.originalEvent.pageY;
      }
    }, {
      key: '_stopScrollPropagation',
      value: function _stopScrollPropagation(event) {
        var elem = this; // called from event handler context with this as elem
        var up = event.pageY < elem.lastY;
        var down = !up;
        elem.lastY = event.pageY;

        if (up && elem.allowUp || down && elem.allowDown) {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
          this.$element.on('touchstart', this._recordScrollable);
          this.$element.on('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            var canvasFocus = _this.$element.find('[data-autofocus]');
            if (canvasFocus.length) {
              canvasFocus.eq(0).focus();
            } else {
              _this.$element.find('a, button').eq(0).focus();
            }
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
          this.$element.off('touchstart', this._recordScrollable);
          this.$element.off('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(e) {
        var _this2 = this;

        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          }
        });
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @type {boolean}
     * @default true
     */
    closeOnClick: true,

    /**
     * Adds an overlay on top of `[data-off-canvas-content]`.
     * @option
     * @type {boolean}
     * @default true
     */
    contentOverlay: true,

    /**
     * Enable/disable scrolling of the main content when an off canvas panel is open.
     * @option
     * @type {boolean}
     * @default true
     */
    contentScroll: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @type {number}
     * @default 0
     */
    transitionTime: 0,

    /**
     * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
     * @option
     * @type {string}
     * @default push
     */
    transition: 'push',

    /**
     * Force the page to scroll to top or bottom on open.
     * @option
     * @type {?string}
     * @default null
     */
    forceTo: null,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @type {boolean}
     * @default false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @type {?string}
     * @default null
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
     * @option
     * @type {boolean}
     * @default true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * @type {string}
     * @default reveal-for-
     * @todo improve the regex testing for this.
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @type {boolean}
     * @default false
     */
    trapFocus: false
  };

  // Window exports
  Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        var _this = this;

        this.$element.attr({ 'role': 'tablist' });
        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('' + _this.options.linkActiveClass),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $(window).load(function () {
              $('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function () {
                $link.focus();
              });
            });
          }
        });
        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        //current context-bound function to open tabs on page load or history popstate
        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]');
            if ($link.length) {
              _this2.selectTab($(anchor), true);

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var offset = _this2.$element.offset();
                $('html, body').animate({ scrollTop: offset.top }, _this2.options.deepLinkSmudgeDelay);
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Tabs#deeplink
                */
              _this2.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();
        this._setHeightMqHandler = null;

        if (this.options.matchHeight) {
          this._setHeightMqHandler = this._setHeight.bind(this);

          $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
        }

        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function open() {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function previous() {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function next() {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
       * @param {jQuery} $target - Tab to open.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target, historyHandled) {

        /**
         * Check for active class on target. Collapse if exists.
         */
        if ($target.hasClass('' + this.options.linkActiveClass)) {
          if (this.options.activeCollapse) {
            this._collapseTab($target);

            /**
             * Fires when the zplugin has successfully collapsed tabs.
             * @event Tabs#collapse
             */
            this.$element.trigger('collapse.zf.tabs', [$target]);
          }
          return;
        }

        var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
            $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        //close old tab
        this._collapseTab($oldTab);

        //open new tab
        this._openTab($target);

        //either replace or update browser history
        if (this.options.deepLink && !historyHandled) {
          var anchor = $target.find('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

        //fire to children a mutation event
        $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_openTab',
      value: function _openTab($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        $target.addClass('' + this.options.linkActiveClass);

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
      }

      /**
       * Collapses `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_collapseTab',
      value: function _collapseTab($target) {
        var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem, historyHandled) {
        var idStr;

        if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target, historyHandled);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * If enabled with `data-match-height="true"`, tabs sets to equal height
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0,
            _this = this; // Lock down the `this` value for the root tabs object

        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {

          var panel = $(this),
              isActive = panel.hasClass('' + _this.options.panelActiveClass); // get the options from the parent instead of trying to get them from the child

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          if (this._setHeightMqHandler != null) {
            $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
          }
        }

        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the tab panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open tab
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false,

    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * Not recommended if more than one tab panel per page.
     * @option
     * @type {boolean}
     * @default false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @type {boolean}
     * @default true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @type {boolean}
     * @default false
     */
    matchHeight: false,

    /**
     * Allows active tabs to collapse when clicked.
     * @option
     * @type {boolean}
     * @default false
     */
    activeCollapse: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @type {string}
     * @default 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the active `li` in tab link list.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    linkActiveClass: 'is-active',

    /**
     * Class applied to the content containers.
     * @option
     * @type {string}
     * @default 'tabs-panel'
     */
    panelClass: 'tabs-panel',

    /**
     * Class applied to the active content container.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    panelActiveClass: 'is-active'
  };

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = factory();
    } else {
        root.LazyLoad = factory();
    }
})(window, function () {

    var _supportsScroll = 'onscroll' in window && !/glebot/.test(navigator.userAgent);

    var _getTopOffset = function _getTopOffset(element) {
        return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
    };

    var _isBelowViewport = function _isBelowViewport(element, container, threshold) {
        var fold = container === window ? window.innerHeight + window.pageYOffset : _getTopOffset(container) + container.offsetHeight;
        return fold <= _getTopOffset(element) - threshold;
    };

    var _getLeftOffset = function _getLeftOffset(element) {
        return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
    };

    var _isAtRightOfViewport = function _isAtRightOfViewport(element, container, threshold) {
        var documentWidth = window.innerWidth;
        var fold = container === window ? documentWidth + window.pageXOffset : _getLeftOffset(container) + documentWidth;
        return fold <= _getLeftOffset(element) - threshold;
    };

    var _isAboveViewport = function _isAboveViewport(element, container, threshold) {
        var fold = container === window ? window.pageYOffset : _getTopOffset(container);
        return fold >= _getTopOffset(element) + threshold + element.offsetHeight;
    };

    var _isAtLeftOfViewport = function _isAtLeftOfViewport(element, container, threshold) {
        var fold = container === window ? window.pageXOffset : _getLeftOffset(container);
        return fold >= _getLeftOffset(element) + threshold + element.offsetWidth;
    };

    var _isInsideViewport = function _isInsideViewport(element, container, threshold) {
        return !_isBelowViewport(element, container, threshold) && !_isAboveViewport(element, container, threshold) && !_isAtRightOfViewport(element, container, threshold) && !_isAtLeftOfViewport(element, container, threshold);
    };

    var _callCallback = function _callCallback(callback, argument) {
        if (callback) {
            callback(argument);
        }
    };

    var _defaultSettings = {
        elements_selector: "img",
        container: window,
        threshold: 300,
        throttle: 150,
        data_src: "original",
        data_srcset: "original-set",
        class_loading: "loading",
        class_loaded: "loaded",
        class_error: "error",
        skip_invisible: true,
        callback_load: null,
        callback_error: null,
        callback_set: null,
        callback_processed: null
    };

    var LazyLoad = function () {
        function LazyLoad(instanceSettings) {
            _classCallCheck(this, LazyLoad);

            this._settings = Object.assign({}, _defaultSettings, instanceSettings);
            this._queryOriginNode = this._settings.container === window ? document : this._settings.container;

            this._previousLoopTime = 0;
            this._loopTimeout = null;
            this._boundHandleScroll = this.handleScroll.bind(this);

            window.addEventListener("resize", this._boundHandleScroll);
            this.update();
        }

        _createClass(LazyLoad, [{
            key: '_setSourcesForPicture',
            value: function _setSourcesForPicture(element, srcsetDataAttribute) {
                var parent = element.parentElement;
                if (parent.tagName !== 'PICTURE') {
                    return;
                }
                for (var i = 0; i < parent.children.length; i++) {
                    var pictureChild = parent.children[i];
                    if (pictureChild.tagName === 'SOURCE') {
                        var sourceSrcset = pictureChild.getAttribute('data-' + srcsetDataAttribute);
                        if (sourceSrcset) {
                            pictureChild.setAttribute('srcset', sourceSrcset);
                        }
                    }
                }
            }
        }, {
            key: '_setSources',
            value: function _setSources(element, srcsetDataAttribute, srcDataAttribute) {
                var tagName = element.tagName;
                var elementSrc = element.getAttribute('data-' + srcDataAttribute);
                if (tagName === "IMG") {
                    this._setSourcesForPicture(element, srcsetDataAttribute);
                    var imgSrcset = element.getAttribute('data-' + srcsetDataAttribute);
                    if (imgSrcset) element.setAttribute("srcset", imgSrcset);
                    if (elementSrc) element.setAttribute("src", elementSrc);
                    return;
                }
                if (tagName === "IFRAME") {
                    if (elementSrc) element.setAttribute("src", elementSrc);
                    return;
                }
                if (elementSrc) element.style.backgroundImage = "url(" + elementSrc + ")";
            }
        }, {
            key: '_showOnAppear',
            value: function _showOnAppear(element) {
                var settings = this._settings;

                var errorCallback = function errorCallback() {
                    /* As this method is asynchronous, it must be protected against external destroy() calls */
                    if (!settings) {
                        return;
                    }
                    element.removeEventListener("load", loadCallback);
                    element.removeEventListener("error", errorCallback);
                    element.classList.remove(settings.class_loading);
                    element.classList.add(settings.class_error);
                    _callCallback(settings.callback_error, element);
                };

                var loadCallback = function loadCallback() {
                    /* As this method is asynchronous, it must be protected against external destroy() calls */
                    if (!settings) {
                        return;
                    }
                    element.classList.remove(settings.class_loading);
                    element.classList.add(settings.class_loaded);
                    element.removeEventListener("load", loadCallback);
                    element.removeEventListener("error", errorCallback);
                    /* Calling LOAD callback */
                    _callCallback(settings.callback_load, element);
                };

                if (element.tagName === "IMG" || element.tagName === "IFRAME") {
                    element.addEventListener("load", loadCallback);
                    element.addEventListener("error", errorCallback);
                    element.classList.add(settings.class_loading);
                }

                this._setSources(element, settings.data_srcset, settings.data_src);
                /* Calling SET callback */
                _callCallback(settings.callback_set, element);
            }
        }, {
            key: '_loopThroughElements',
            value: function _loopThroughElements() {
                var settings = this._settings,
                    elements = this._elements,
                    elementsLength = !elements ? 0 : elements.length;
                var i = void 0,
                    processedIndexes = [];

                for (i = 0; i < elementsLength; i++) {
                    var element = elements[i];
                    /* If must skip_invisible and element is invisible, skip it */
                    if (settings.skip_invisible && element.offsetParent === null) {
                        continue;
                    }

                    if (_supportsScroll && _isInsideViewport(element, settings.container, settings.threshold)) {
                        this._showOnAppear(element);

                        /* Marking the element as processed. */
                        processedIndexes.push(i);
                        element.wasProcessed = true;
                    }
                }
                /* Removing processed elements from this._elements. */
                while (processedIndexes.length > 0) {
                    elements.splice(processedIndexes.pop(), 1);
                    /* Calling the end loop callback */
                    _callCallback(settings.callback_processed, elements.length);
                }
                /* Stop listening to scroll event when 0 elements remains */
                if (elementsLength === 0) {
                    this._stopScrollHandler();
                }
            }
        }, {
            key: '_purgeElements',
            value: function _purgeElements() {
                var elements = this._elements,
                    elementsLength = elements.length;
                var i = void 0,
                    elementsToPurge = [];

                for (i = 0; i < elementsLength; i++) {
                    var element = elements[i];
                    /* If the element has already been processed, skip it */
                    if (element.wasProcessed) {
                        elementsToPurge.push(i);
                    }
                }
                /* Removing elements to purge from this._elements. */
                while (elementsToPurge.length > 0) {
                    elements.splice(elementsToPurge.pop(), 1);
                }
            }
        }, {
            key: '_startScrollHandler',
            value: function _startScrollHandler() {
                if (!this._isHandlingScroll) {
                    this._isHandlingScroll = true;
                    this._settings.container.addEventListener("scroll", this._boundHandleScroll);
                }
            }
        }, {
            key: '_stopScrollHandler',
            value: function _stopScrollHandler() {
                if (this._isHandlingScroll) {
                    this._isHandlingScroll = false;
                    this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
                }
            }
        }, {
            key: 'handleScroll',
            value: function handleScroll() {
                var throttle = this._settings.throttle;

                if (throttle !== 0) {
                    var getTime = function getTime() {
                        new Date().getTime();
                    };
                    var now = getTime();
                    var remainingTime = throttle - (now - this._previousLoopTime);
                    if (remainingTime <= 0 || remainingTime > throttle) {
                        if (this._loopTimeout) {
                            clearTimeout(this._loopTimeout);
                            this._loopTimeout = null;
                        }
                        this._previousLoopTime = now;
                        this._loopThroughElements();
                    } else if (!this._loopTimeout) {
                        this._loopTimeout = setTimeout(function () {
                            this._previousLoopTime = getTime();
                            this._loopTimeout = null;
                            this._loopThroughElements();
                        }.bind(this), remainingTime);
                    }
                } else {
                    this._loopThroughElements();
                }
            }
        }, {
            key: 'update',
            value: function update() {
                // Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
                this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector));
                this._purgeElements();
                this._loopThroughElements();
                this._startScrollHandler();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                window.removeEventListener("resize", this._boundHandleScroll);
                if (this._loopTimeout) {
                    clearTimeout(this._loopTimeout);
                    this._loopTimeout = null;
                }
                this._stopScrollHandler();
                this._elements = null;
                this._queryOriginNode = null;
                this._settings = null;
            }
        }]);

        return LazyLoad;
    }();

    return LazyLoad;
});
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Flickity PACKAGED v2.0.5
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
 */

!function (t, e) {
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery);
}(window, function (t, e) {
  "use strict";
  function i(i, o, a) {
    function l(t, e, n) {
      var s,
          o = "$()." + i + '("' + e + '")';return t.each(function (t, l) {
        var h = a.data(l, i);if (!h) return void r(i + " not initialized. Cannot call methods, i.e. " + o);var c = h[e];if (!c || "_" == e.charAt(0)) return void r(o + " is not a valid method");var d = c.apply(h, n);s = void 0 === s ? d : s;
      }), void 0 !== s ? s : t;
    }function h(t, e) {
      t.each(function (t, n) {
        var s = a.data(n, i);s ? (s.option(e), s._init()) : (s = new o(n, e), a.data(n, i, s));
      });
    }a = a || e || t.jQuery, a && (o.prototype.option || (o.prototype.option = function (t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t));
    }), a.fn[i] = function (t) {
      if ("string" == typeof t) {
        var e = s.call(arguments, 1);return l(this, t, e);
      }return h(this, t), this;
    }, n(a));
  }function n(t) {
    !t || t && t.bridget || (t.bridget = i);
  }var s = Array.prototype.slice,
      o = t.console,
      r = "undefined" == typeof o ? function () {} : function (t) {
    o.error(t);
  };return n(e || t.jQuery), i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.EvEmitter = e();
}("undefined" != typeof window ? window : undefined, function () {
  function t() {}var e = t.prototype;return e.on = function (t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
          n = i[t] = i[t] || [];return n.indexOf(e) == -1 && n.push(e), this;
    }
  }, e.once = function (t, e) {
    if (t && e) {
      this.on(t, e);var i = this._onceEvents = this._onceEvents || {},
          n = i[t] = i[t] || {};return n[e] = !0, this;
    }
  }, e.off = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = i.indexOf(e);return n != -1 && i.splice(n, 1), this;
    }
  }, e.emitEvent = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = 0,
          s = i[n];e = e || [];for (var o = this._onceEvents && this._onceEvents[t]; s;) {
        var r = o && o[s];r && (this.off(t, s), delete o[s]), s.apply(this, e), n += r ? 0 : 1, s = i[n];
      }return this;
    }
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function () {
    return e();
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.getSize = e();
}(window, function () {
  "use strict";
  function t(t) {
    var e = parseFloat(t),
        i = t.indexOf("%") == -1 && !isNaN(e);return i && e;
  }function e() {}function i() {
    for (var t = { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 }, e = 0; e < h; e++) {
      var i = l[e];t[i] = 0;
    }return t;
  }function n(t) {
    var e = getComputedStyle(t);return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e;
  }function s() {
    if (!c) {
      c = !0;var e = document.createElement("div");e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";var i = document.body || document.documentElement;i.appendChild(e);var s = n(e);o.isBoxSizeOuter = r = 200 == t(s.width), i.removeChild(e);
    }
  }function o(e) {
    if (s(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && e.nodeType) {
      var o = n(e);if ("none" == o.display) return i();var a = {};a.width = e.offsetWidth, a.height = e.offsetHeight;for (var c = a.isBorderBox = "border-box" == o.boxSizing, d = 0; d < h; d++) {
        var u = l[d],
            f = o[u],
            p = parseFloat(f);a[u] = isNaN(p) ? 0 : p;
      }var v = a.paddingLeft + a.paddingRight,
          g = a.paddingTop + a.paddingBottom,
          m = a.marginLeft + a.marginRight,
          y = a.marginTop + a.marginBottom,
          S = a.borderLeftWidth + a.borderRightWidth,
          E = a.borderTopWidth + a.borderBottomWidth,
          b = c && r,
          x = t(o.width);x !== !1 && (a.width = x + (b ? 0 : v + S));var C = t(o.height);return C !== !1 && (a.height = C + (b ? 0 : g + E)), a.innerWidth = a.width - (v + S), a.innerHeight = a.height - (g + E), a.outerWidth = a.width + m, a.outerHeight = a.height + y, a;
    }
  }var r,
      a = "undefined" == typeof console ? e : function (t) {
    console.error(t);
  },
      l = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
      h = l.length,
      c = !1;return o;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.matchesSelector = e();
}(window, function () {
  "use strict";
  var t = function () {
    var t = Element.prototype;if (t.matches) return "matches";if (t.matchesSelector) return "matchesSelector";for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
          s = n + "MatchesSelector";if (t[s]) return s;
    }
  }();return function (e, i) {
    return e[t](i);
  };
}), function (t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector);
}(window, function (t, e) {
  var i = {};i.extend = function (t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }, i.modulo = function (t, e) {
    return (t % e + e) % e;
  }, i.makeArray = function (t) {
    var e = [];if (Array.isArray(t)) e = t;else if (t && "number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }, i.removeFrom = function (t, e) {
    var i = t.indexOf(e);i != -1 && t.splice(i, 1);
  }, i.getParent = function (t, i) {
    for (; t != document.body;) {
      if (t = t.parentNode, e(t, i)) return t;
    }
  }, i.getQueryElement = function (t) {
    return "string" == typeof t ? document.querySelector(t) : t;
  }, i.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, i.filterFindElements = function (t, n) {
    t = i.makeArray(t);var s = [];return t.forEach(function (t) {
      if (t instanceof HTMLElement) {
        if (!n) return void s.push(t);e(t, n) && s.push(t);for (var i = t.querySelectorAll(n), o = 0; o < i.length; o++) {
          s.push(i[o]);
        }
      }
    }), s;
  }, i.debounceMethod = function (t, e, i) {
    var n = t.prototype[e],
        s = e + "Timeout";t.prototype[e] = function () {
      var t = this[s];t && clearTimeout(t);var e = arguments,
          o = this;this[s] = setTimeout(function () {
        n.apply(o, e), delete o[s];
      }, i || 100);
    };
  }, i.docReady = function (t) {
    var e = document.readyState;"complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t);
  }, i.toDashed = function (t) {
    return t.replace(/(.)([A-Z])/g, function (t, e, i) {
      return e + "-" + i;
    }).toLowerCase();
  };var n = t.console;return i.htmlInit = function (e, s) {
    i.docReady(function () {
      var o = i.toDashed(s),
          r = "data-" + o,
          a = document.querySelectorAll("[" + r + "]"),
          l = document.querySelectorAll(".js-" + o),
          h = i.makeArray(a).concat(i.makeArray(l)),
          c = r + "-options",
          d = t.jQuery;h.forEach(function (t) {
        var i,
            o = t.getAttribute(r) || t.getAttribute(c);try {
          i = o && JSON.parse(o);
        } catch (a) {
          return void (n && n.error("Error parsing " + r + " on " + t.className + ": " + a));
        }var l = new e(t, i);d && d.data(t, s, l);
      });
    });
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/cell", ["get-size/get-size"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("get-size")) : (t.Flickity = t.Flickity || {}, t.Flickity.Cell = e(t, t.getSize));
}(window, function (t, e) {
  function i(t, e) {
    this.element = t, this.parent = e, this.create();
  }var n = i.prototype;return n.create = function () {
    this.element.style.position = "absolute", this.x = 0, this.shift = 0;
  }, n.destroy = function () {
    this.element.style.position = "";var t = this.parent.originSide;this.element.style[t] = "";
  }, n.getSize = function () {
    this.size = e(this.element);
  }, n.setPosition = function (t) {
    this.x = t, this.updateTarget(), this.renderPosition(t);
  }, n.updateTarget = n.setDefaultTarget = function () {
    var t = "left" == this.parent.originSide ? "marginLeft" : "marginRight";this.target = this.x + this.size[t] + this.size.width * this.parent.cellAlign;
  }, n.renderPosition = function (t) {
    var e = this.parent.originSide;this.element.style[e] = this.parent.getPositionValue(t);
  }, n.wrapShift = function (t) {
    this.shift = t, this.renderPosition(this.x + this.parent.slideableWidth * t);
  }, n.remove = function () {
    this.element.parentNode.removeChild(this.element);
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/slide", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : (t.Flickity = t.Flickity || {}, t.Flickity.Slide = e());
}(window, function () {
  "use strict";
  function t(t) {
    this.parent = t, this.isOriginLeft = "left" == t.originSide, this.cells = [], this.outerWidth = 0, this.height = 0;
  }var e = t.prototype;return e.addCell = function (t) {
    if (this.cells.push(t), this.outerWidth += t.size.outerWidth, this.height = Math.max(t.size.outerHeight, this.height), 1 == this.cells.length) {
      this.x = t.x;var e = this.isOriginLeft ? "marginLeft" : "marginRight";this.firstMargin = t.size[e];
    }
  }, e.updateTarget = function () {
    var t = this.isOriginLeft ? "marginRight" : "marginLeft",
        e = this.getLastCell(),
        i = e ? e.size[t] : 0,
        n = this.outerWidth - (this.firstMargin + i);this.target = this.x + this.firstMargin + n * this.parent.cellAlign;
  }, e.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, e.select = function () {
    this.changeSelectedClass("add");
  }, e.unselect = function () {
    this.changeSelectedClass("remove");
  }, e.changeSelectedClass = function (t) {
    this.cells.forEach(function (e) {
      e.element.classList[t]("is-selected");
    });
  }, e.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/animate", ["fizzy-ui-utils/utils"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("fizzy-ui-utils")) : (t.Flickity = t.Flickity || {}, t.Flickity.animatePrototype = e(t, t.fizzyUIUtils));
}(window, function (t, e) {
  var i = t.requestAnimationFrame || t.webkitRequestAnimationFrame,
      n = 0;i || (i = function i(t) {
    var e = new Date().getTime(),
        i = Math.max(0, 16 - (e - n)),
        s = setTimeout(t, i);return n = e + i, s;
  });var s = {};s.startAnimation = function () {
    this.isAnimating || (this.isAnimating = !0, this.restingFrames = 0, this.animate());
  }, s.animate = function () {
    this.applyDragForce(), this.applySelectedAttraction();var t = this.x;if (this.integratePhysics(), this.positionSlider(), this.settle(t), this.isAnimating) {
      var e = this;i(function () {
        e.animate();
      });
    }
  };var o = function () {
    var t = document.documentElement.style;return "string" == typeof t.transform ? "transform" : "WebkitTransform";
  }();return s.positionSlider = function () {
    var t = this.x;this.options.wrapAround && this.cells.length > 1 && (t = e.modulo(t, this.slideableWidth), t -= this.slideableWidth, this.shiftWrapCells(t)), t += this.cursorPosition, t = this.options.rightToLeft && o ? -t : t;var i = this.getPositionValue(t);this.slider.style[o] = this.isAnimating ? "translate3d(" + i + ",0,0)" : "translateX(" + i + ")";var n = this.slides[0];if (n) {
      var s = -this.x - n.target,
          r = s / this.slidesWidth;this.dispatchEvent("scroll", null, [r, s]);
    }
  }, s.positionSliderAtSelected = function () {
    this.cells.length && (this.x = -this.selectedSlide.target, this.positionSlider());
  }, s.getPositionValue = function (t) {
    return this.options.percentPosition ? .01 * Math.round(t / this.size.innerWidth * 1e4) + "%" : Math.round(t) + "px";
  }, s.settle = function (t) {
    this.isPointerDown || Math.round(100 * this.x) != Math.round(100 * t) || this.restingFrames++, this.restingFrames > 2 && (this.isAnimating = !1, delete this.isFreeScrolling, this.positionSlider(), this.dispatchEvent("settle"));
  }, s.shiftWrapCells = function (t) {
    var e = this.cursorPosition + t;this._shiftCells(this.beforeShiftCells, e, -1);var i = this.size.innerWidth - (t + this.slideableWidth + this.cursorPosition);this._shiftCells(this.afterShiftCells, i, 1);
  }, s._shiftCells = function (t, e, i) {
    for (var n = 0; n < t.length; n++) {
      var s = t[n],
          o = e > 0 ? i : 0;s.wrapShift(o), e -= s.size.outerWidth;
    }
  }, s._unshiftCells = function (t) {
    if (t && t.length) for (var e = 0; e < t.length; e++) {
      t[e].wrapShift(0);
    }
  }, s.integratePhysics = function () {
    this.x += this.velocity, this.velocity *= this.getFrictionFactor();
  }, s.applyForce = function (t) {
    this.velocity += t;
  }, s.getFrictionFactor = function () {
    return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"];
  }, s.getRestingPosition = function () {
    return this.x + this.velocity / (1 - this.getFrictionFactor());
  }, s.applyDragForce = function () {
    if (this.isPointerDown) {
      var t = this.dragX - this.x,
          e = t - this.velocity;this.applyForce(e);
    }
  }, s.applySelectedAttraction = function () {
    if (!this.isPointerDown && !this.isFreeScrolling && this.cells.length) {
      var t = this.selectedSlide.target * -1 - this.x,
          e = t * this.options.selectedAttraction;this.applyForce(e);
    }
  }, s;
}), function (t, e) {
  if ("function" == typeof define && define.amd) define("flickity/js/flickity", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate"], function (i, n, s, o, r, a) {
    return e(t, i, n, s, o, r, a);
  });else if ("object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports) module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));else {
    var i = t.Flickity;t.Flickity = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, i.Cell, i.Slide, i.animatePrototype);
  }
}(window, function (t, e, i, n, s, o, r) {
  function a(t, e) {
    for (t = n.makeArray(t); t.length;) {
      e.appendChild(t.shift());
    }
  }function l(t, e) {
    var i = n.getQueryElement(t);if (!i) return void (d && d.error("Bad element for Flickity: " + (i || t)));if (this.element = i, this.element.flickityGUID) {
      var s = f[this.element.flickityGUID];return s.option(e), s;
    }h && (this.$element = h(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e), this._create();
  }var h = t.jQuery,
      c = t.getComputedStyle,
      d = t.console,
      u = 0,
      f = {};l.defaults = { accessibility: !0, cellAlign: "center", freeScrollFriction: .075, friction: .28, namespaceJQueryEvents: !0, percentPosition: !0, resize: !0, selectedAttraction: .025, setGallerySize: !0 }, l.createMethods = [];var p = l.prototype;n.extend(p, e.prototype), p._create = function () {
    var e = this.guid = ++u;this.element.flickityGUID = e, f[e] = this, this.selectedIndex = 0, this.restingFrames = 0, this.x = 0, this.velocity = 0, this.originSide = this.options.rightToLeft ? "right" : "left", this.viewport = document.createElement("div"), this.viewport.className = "flickity-viewport", this._createSlider(), (this.options.resize || this.options.watchCSS) && t.addEventListener("resize", this), l.createMethods.forEach(function (t) {
      this[t]();
    }, this), this.options.watchCSS ? this.watchCSS() : this.activate();
  }, p.option = function (t) {
    n.extend(this.options, t);
  }, p.activate = function () {
    if (!this.isActive) {
      this.isActive = !0, this.element.classList.add("flickity-enabled"), this.options.rightToLeft && this.element.classList.add("flickity-rtl"), this.getSize();var t = this._filterFindCellElements(this.element.children);a(t, this.slider), this.viewport.appendChild(this.slider), this.element.appendChild(this.viewport), this.reloadCells(), this.options.accessibility && (this.element.tabIndex = 0, this.element.addEventListener("keydown", this)), this.emitEvent("activate");var e,
          i = this.options.initialIndex;e = this.isInitActivated ? this.selectedIndex : void 0 !== i && this.cells[i] ? i : 0, this.select(e, !1, !0), this.isInitActivated = !0;
    }
  }, p._createSlider = function () {
    var t = document.createElement("div");t.className = "flickity-slider", t.style[this.originSide] = 0, this.slider = t;
  }, p._filterFindCellElements = function (t) {
    return n.filterFindElements(t, this.options.cellSelector);
  }, p.reloadCells = function () {
    this.cells = this._makeCells(this.slider.children), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize();
  }, p._makeCells = function (t) {
    var e = this._filterFindCellElements(t),
        i = e.map(function (t) {
      return new s(t, this);
    }, this);return i;
  }, p.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, p.getLastSlide = function () {
    return this.slides[this.slides.length - 1];
  }, p.positionCells = function () {
    this._sizeCells(this.cells), this._positionCells(0);
  }, p._positionCells = function (t) {
    t = t || 0, this.maxCellHeight = t ? this.maxCellHeight || 0 : 0;var e = 0;if (t > 0) {
      var i = this.cells[t - 1];e = i.x + i.size.outerWidth;
    }for (var n = this.cells.length, s = t; s < n; s++) {
      var o = this.cells[s];o.setPosition(e), e += o.size.outerWidth, this.maxCellHeight = Math.max(o.size.outerHeight, this.maxCellHeight);
    }this.slideableWidth = e, this.updateSlides(), this._containSlides(), this.slidesWidth = n ? this.getLastSlide().target - this.slides[0].target : 0;
  }, p._sizeCells = function (t) {
    t.forEach(function (t) {
      t.getSize();
    });
  }, p.updateSlides = function () {
    if (this.slides = [], this.cells.length) {
      var t = new o(this);this.slides.push(t);var e = "left" == this.originSide,
          i = e ? "marginRight" : "marginLeft",
          n = this._getCanCellFit();this.cells.forEach(function (e, s) {
        if (!t.cells.length) return void t.addCell(e);var r = t.outerWidth - t.firstMargin + (e.size.outerWidth - e.size[i]);n.call(this, s, r) ? t.addCell(e) : (t.updateTarget(), t = new o(this), this.slides.push(t), t.addCell(e));
      }, this), t.updateTarget(), this.updateSelectedSlide();
    }
  }, p._getCanCellFit = function () {
    var t = this.options.groupCells;if (!t) return function () {
      return !1;
    };if ("number" == typeof t) {
      var e = parseInt(t, 10);return function (t) {
        return t % e !== 0;
      };
    }var i = "string" == typeof t && t.match(/^(\d+)%$/),
        n = i ? parseInt(i[1], 10) / 100 : 1;return function (t, e) {
      return e <= (this.size.innerWidth + 1) * n;
    };
  }, p._init = p.reposition = function () {
    this.positionCells(), this.positionSliderAtSelected();
  }, p.getSize = function () {
    this.size = i(this.element), this.setCellAlign(), this.cursorPosition = this.size.innerWidth * this.cellAlign;
  };var v = { center: { left: .5, right: .5 }, left: { left: 0, right: 1 }, right: { right: 0, left: 1 } };return p.setCellAlign = function () {
    var t = v[this.options.cellAlign];this.cellAlign = t ? t[this.originSide] : this.options.cellAlign;
  }, p.setGallerySize = function () {
    if (this.options.setGallerySize) {
      var t = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;this.viewport.style.height = t + "px";
    }
  }, p._getWrapShiftCells = function () {
    if (this.options.wrapAround) {
      this._unshiftCells(this.beforeShiftCells), this._unshiftCells(this.afterShiftCells);var t = this.cursorPosition,
          e = this.cells.length - 1;this.beforeShiftCells = this._getGapCells(t, e, -1), t = this.size.innerWidth - this.cursorPosition, this.afterShiftCells = this._getGapCells(t, 0, 1);
    }
  }, p._getGapCells = function (t, e, i) {
    for (var n = []; t > 0;) {
      var s = this.cells[e];if (!s) break;n.push(s), e += i, t -= s.size.outerWidth;
    }return n;
  }, p._containSlides = function () {
    if (this.options.contain && !this.options.wrapAround && this.cells.length) {
      var t = this.options.rightToLeft,
          e = t ? "marginRight" : "marginLeft",
          i = t ? "marginLeft" : "marginRight",
          n = this.slideableWidth - this.getLastCell().size[i],
          s = n < this.size.innerWidth,
          o = this.cursorPosition + this.cells[0].size[e],
          r = n - this.size.innerWidth * (1 - this.cellAlign);this.slides.forEach(function (t) {
        s ? t.target = n * this.cellAlign : (t.target = Math.max(t.target, o), t.target = Math.min(t.target, r));
      }, this);
    }
  }, p.dispatchEvent = function (t, e, i) {
    var n = e ? [e].concat(i) : i;if (this.emitEvent(t, n), h && this.$element) {
      t += this.options.namespaceJQueryEvents ? ".flickity" : "";var s = t;if (e) {
        var o = h.Event(e);o.type = t, s = o;
      }this.$element.trigger(s, i);
    }
  }, p.select = function (t, e, i) {
    this.isActive && (t = parseInt(t, 10), this._wrapSelect(t), (this.options.wrapAround || e) && (t = n.modulo(t, this.slides.length)), this.slides[t] && (this.selectedIndex = t, this.updateSelectedSlide(), i ? this.positionSliderAtSelected() : this.startAnimation(), this.options.adaptiveHeight && this.setGallerySize(), this.dispatchEvent("select"), this.dispatchEvent("cellSelect")));
  }, p._wrapSelect = function (t) {
    var e = this.slides.length,
        i = this.options.wrapAround && e > 1;if (!i) return t;var s = n.modulo(t, e),
        o = Math.abs(s - this.selectedIndex),
        r = Math.abs(s + e - this.selectedIndex),
        a = Math.abs(s - e - this.selectedIndex);!this.isDragSelect && r < o ? t += e : !this.isDragSelect && a < o && (t -= e), t < 0 ? this.x -= this.slideableWidth : t >= e && (this.x += this.slideableWidth);
  }, p.previous = function (t, e) {
    this.select(this.selectedIndex - 1, t, e);
  }, p.next = function (t, e) {
    this.select(this.selectedIndex + 1, t, e);
  }, p.updateSelectedSlide = function () {
    var t = this.slides[this.selectedIndex];t && (this.unselectSelectedSlide(), this.selectedSlide = t, t.select(), this.selectedCells = t.cells, this.selectedElements = t.getCellElements(), this.selectedCell = t.cells[0], this.selectedElement = this.selectedElements[0]);
  }, p.unselectSelectedSlide = function () {
    this.selectedSlide && this.selectedSlide.unselect();
  }, p.selectCell = function (t, e, i) {
    var n;"number" == typeof t ? n = this.cells[t] : ("string" == typeof t && (t = this.element.querySelector(t)), n = this.getCell(t));for (var s = 0; n && s < this.slides.length; s++) {
      var o = this.slides[s],
          r = o.cells.indexOf(n);if (r != -1) return void this.select(s, e, i);
    }
  }, p.getCell = function (t) {
    for (var e = 0; e < this.cells.length; e++) {
      var i = this.cells[e];if (i.element == t) return i;
    }
  }, p.getCells = function (t) {
    t = n.makeArray(t);var e = [];return t.forEach(function (t) {
      var i = this.getCell(t);i && e.push(i);
    }, this), e;
  }, p.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, p.getParentCell = function (t) {
    var e = this.getCell(t);return e ? e : (t = n.getParent(t, ".flickity-slider > *"), this.getCell(t));
  }, p.getAdjacentCellElements = function (t, e) {
    if (!t) return this.selectedSlide.getCellElements();e = void 0 === e ? this.selectedIndex : e;var i = this.slides.length;if (1 + 2 * t >= i) return this.getCellElements();for (var s = [], o = e - t; o <= e + t; o++) {
      var r = this.options.wrapAround ? n.modulo(o, i) : o,
          a = this.slides[r];a && (s = s.concat(a.getCellElements()));
    }return s;
  }, p.uiChange = function () {
    this.emitEvent("uiChange");
  }, p.childUIPointerDown = function (t) {
    this.emitEvent("childUIPointerDown", [t]);
  }, p.onresize = function () {
    this.watchCSS(), this.resize();
  }, n.debounceMethod(l, "onresize", 150), p.resize = function () {
    if (this.isActive) {
      this.getSize(), this.options.wrapAround && (this.x = n.modulo(this.x, this.slideableWidth)), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("resize");var t = this.selectedElements && this.selectedElements[0];this.selectCell(t, !1, !0);
    }
  }, p.watchCSS = function () {
    var t = this.options.watchCSS;if (t) {
      var e = c(this.element, ":after").content;e.indexOf("flickity") != -1 ? this.activate() : this.deactivate();
    }
  }, p.onkeydown = function (t) {
    if (this.options.accessibility && (!document.activeElement || document.activeElement == this.element)) if (37 == t.keyCode) {
      var e = this.options.rightToLeft ? "next" : "previous";this.uiChange(), this[e]();
    } else if (39 == t.keyCode) {
      var i = this.options.rightToLeft ? "previous" : "next";this.uiChange(), this[i]();
    }
  }, p.deactivate = function () {
    this.isActive && (this.element.classList.remove("flickity-enabled"), this.element.classList.remove("flickity-rtl"), this.cells.forEach(function (t) {
      t.destroy();
    }), this.unselectSelectedSlide(), this.element.removeChild(this.viewport), a(this.slider.children, this.element), this.options.accessibility && (this.element.removeAttribute("tabIndex"), this.element.removeEventListener("keydown", this)), this.isActive = !1, this.emitEvent("deactivate"));
  }, p.destroy = function () {
    this.deactivate(), t.removeEventListener("resize", this), this.emitEvent("destroy"), h && this.$element && h.removeData(this.element, "flickity"), delete this.element.flickityGUID, delete f[this.guid];
  }, n.extend(p, r), l.data = function (t) {
    t = n.getQueryElement(t);var e = t && t.flickityGUID;return e && f[e];
  }, n.htmlInit(l, "flickity"), h && h.bridget && h.bridget("flickity", l), l.Cell = s, l;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unipointer/unipointer", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.Unipointer = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindStartEvent = function (t) {
    this._bindStartEvent(t, !0);
  }, s.unbindStartEvent = function (t) {
    this._bindStartEvent(t, !1);
  }, s._bindStartEvent = function (e, i) {
    i = void 0 === i || !!i;var n = i ? "addEventListener" : "removeEventListener";t.navigator.pointerEnabled ? e[n]("pointerdown", this) : t.navigator.msPointerEnabled ? e[n]("MSPointerDown", this) : (e[n]("mousedown", this), e[n]("touchstart", this));
  }, s.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, s.getTouch = function (t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e];if (i.identifier == this.pointerIdentifier) return i;
    }
  }, s.onmousedown = function (t) {
    var e = t.button;e && 0 !== e && 1 !== e || this._pointerDown(t, t);
  }, s.ontouchstart = function (t) {
    this._pointerDown(t, t.changedTouches[0]);
  }, s.onMSPointerDown = s.onpointerdown = function (t) {
    this._pointerDown(t, t);
  }, s._pointerDown = function (t, e) {
    this.isPointerDown || (this.isPointerDown = !0, this.pointerIdentifier = void 0 !== e.pointerId ? e.pointerId : e.identifier, this.pointerDown(t, e));
  }, s.pointerDown = function (t, e) {
    this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  };var o = { mousedown: ["mousemove", "mouseup"], touchstart: ["touchmove", "touchend", "touchcancel"], pointerdown: ["pointermove", "pointerup", "pointercancel"], MSPointerDown: ["MSPointerMove", "MSPointerUp", "MSPointerCancel"] };return s._bindPostStartEvents = function (e) {
    if (e) {
      var i = o[e.type];i.forEach(function (e) {
        t.addEventListener(e, this);
      }, this), this._boundPointerEvents = i;
    }
  }, s._unbindPostStartEvents = function () {
    this._boundPointerEvents && (this._boundPointerEvents.forEach(function (e) {
      t.removeEventListener(e, this);
    }, this), delete this._boundPointerEvents);
  }, s.onmousemove = function (t) {
    this._pointerMove(t, t);
  }, s.onMSPointerMove = s.onpointermove = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerMove(t, t);
  }, s.ontouchmove = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerMove(t, e);
  }, s._pointerMove = function (t, e) {
    this.pointerMove(t, e);
  }, s.pointerMove = function (t, e) {
    this.emitEvent("pointerMove", [t, e]);
  }, s.onmouseup = function (t) {
    this._pointerUp(t, t);
  }, s.onMSPointerUp = s.onpointerup = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerUp(t, t);
  }, s.ontouchend = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerUp(t, e);
  }, s._pointerUp = function (t, e) {
    this._pointerDone(), this.pointerUp(t, e);
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]);
  }, s._pointerDone = function () {
    this.isPointerDown = !1, delete this.pointerIdentifier, this._unbindPostStartEvents(), this.pointerDone();
  }, s.pointerDone = i, s.onMSPointerCancel = s.onpointercancel = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerCancel(t, t);
  }, s.ontouchcancel = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerCancel(t, e);
  }, s._pointerCancel = function (t, e) {
    this._pointerDone(), this.pointerCancel(t, e);
  }, s.pointerCancel = function (t, e) {
    this.emitEvent("pointerCancel", [t, e]);
  }, n.getPointerPoint = function (t) {
    return { x: t.pageX, y: t.pageY };
  }, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unidragger/unidragger", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.Unidragger = e(t, t.Unipointer);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindHandles = function () {
    this._bindHandles(!0);
  }, s.unbindHandles = function () {
    this._bindHandles(!1);
  };var o = t.navigator;return s._bindHandles = function (t) {
    t = void 0 === t || !!t;var e;e = o.pointerEnabled ? function (e) {
      e.style.touchAction = t ? "none" : "";
    } : o.msPointerEnabled ? function (e) {
      e.style.msTouchAction = t ? "none" : "";
    } : i;for (var n = t ? "addEventListener" : "removeEventListener", s = 0; s < this.handles.length; s++) {
      var r = this.handles[s];this._bindStartEvent(r, t), e(r), r[n]("click", this);
    }
  }, s.pointerDown = function (t, e) {
    if ("INPUT" == t.target.nodeName && "range" == t.target.type) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(t, e);var i = document.activeElement;i && i.blur && i.blur(), this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  }, s._dragPointerDown = function (t, i) {
    this.pointerDownPoint = e.getPointerPoint(i);var n = this.canPreventDefaultOnPointerDown(t, i);n && t.preventDefault();
  }, s.canPreventDefaultOnPointerDown = function (t) {
    return "SELECT" != t.target.nodeName;
  }, s.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.emitEvent("pointerMove", [t, e, i]), this._dragMove(t, e, i);
  }, s._dragPointerMove = function (t, i) {
    var n = e.getPointerPoint(i),
        s = { x: n.x - this.pointerDownPoint.x, y: n.y - this.pointerDownPoint.y };return !this.isDragging && this.hasDragStarted(s) && this._dragStart(t, i), s;
  }, s.hasDragStarted = function (t) {
    return Math.abs(t.x) > 3 || Math.abs(t.y) > 3;
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]), this._dragPointerUp(t, e);
  }, s._dragPointerUp = function (t, e) {
    this.isDragging ? this._dragEnd(t, e) : this._staticClick(t, e);
  }, s._dragStart = function (t, i) {
    this.isDragging = !0, this.dragStartPoint = e.getPointerPoint(i), this.isPreventingClicks = !0, this.dragStart(t, i);
  }, s.dragStart = function (t, e) {
    this.emitEvent("dragStart", [t, e]);
  }, s._dragMove = function (t, e, i) {
    this.isDragging && this.dragMove(t, e, i);
  }, s.dragMove = function (t, e, i) {
    t.preventDefault(), this.emitEvent("dragMove", [t, e, i]);
  }, s._dragEnd = function (t, e) {
    this.isDragging = !1, setTimeout(function () {
      delete this.isPreventingClicks;
    }.bind(this)), this.dragEnd(t, e);
  }, s.dragEnd = function (t, e) {
    this.emitEvent("dragEnd", [t, e]);
  }, s.onclick = function (t) {
    this.isPreventingClicks && t.preventDefault();
  }, s._staticClick = function (t, e) {
    if (!this.isIgnoringMouseUp || "mouseup" != t.type) {
      var i = t.target.nodeName;"INPUT" != i && "TEXTAREA" != i || t.target.focus(), this.staticClick(t, e), "mouseup" != t.type && (this.isIgnoringMouseUp = !0, setTimeout(function () {
        delete this.isIgnoringMouseUp;
      }.bind(this), 400));
    }
  }, s.staticClick = function (t, e) {
    this.emitEvent("staticClick", [t, e]);
  }, n.getPointerPoint = e.getPointerPoint, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/drag", ["./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("unidragger"), require("fizzy-ui-utils")) : t.Flickity = e(t, t.Flickity, t.Unidragger, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s() {
    return { x: t.pageXOffset, y: t.pageYOffset };
  }n.extend(e.defaults, { draggable: !0, dragThreshold: 3 }), e.createMethods.push("_createDrag");var o = e.prototype;n.extend(o, i.prototype);var r = "createTouch" in document,
      a = !1;o._createDrag = function () {
    this.on("activate", this.bindDrag), this.on("uiChange", this._uiChangeDrag), this.on("childUIPointerDown", this._childUIPointerDownDrag), this.on("deactivate", this.unbindDrag), r && !a && (t.addEventListener("touchmove", function () {}), a = !0);
  }, o.bindDrag = function () {
    this.options.draggable && !this.isDragBound && (this.element.classList.add("is-draggable"), this.handles = [this.viewport], this.bindHandles(), this.isDragBound = !0);
  }, o.unbindDrag = function () {
    this.isDragBound && (this.element.classList.remove("is-draggable"), this.unbindHandles(), delete this.isDragBound);
  }, o._uiChangeDrag = function () {
    delete this.isFreeScrolling;
  }, o._childUIPointerDownDrag = function (t) {
    t.preventDefault(), this.pointerDownFocus(t);
  };var l = { TEXTAREA: !0, INPUT: !0, OPTION: !0 },
      h = { radio: !0, checkbox: !0, button: !0, submit: !0, image: !0, file: !0 };o.pointerDown = function (e, i) {
    var n = l[e.target.nodeName] && !h[e.target.type];if (n) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(e, i);var o = document.activeElement;o && o.blur && o != this.element && o != document.body && o.blur(), this.pointerDownFocus(e), this.dragX = this.x, this.viewport.classList.add("is-pointer-down"), this._bindPostStartEvents(e), this.pointerDownScroll = s(), t.addEventListener("scroll", this), this.dispatchEvent("pointerDown", e, [i]);
  };var c = { touchstart: !0, MSPointerDown: !0 },
      d = { INPUT: !0, SELECT: !0 };return o.pointerDownFocus = function (e) {
    if (this.options.accessibility && !c[e.type] && !d[e.target.nodeName]) {
      var i = t.pageYOffset;this.element.focus(), t.pageYOffset != i && t.scrollTo(t.pageXOffset, i);
    }
  }, o.canPreventDefaultOnPointerDown = function (t) {
    var e = "touchstart" == t.type,
        i = t.target.nodeName;return !e && "SELECT" != i;
  }, o.hasDragStarted = function (t) {
    return Math.abs(t.x) > this.options.dragThreshold;
  }, o.pointerUp = function (t, e) {
    delete this.isTouchScrolling, this.viewport.classList.remove("is-pointer-down"), this.dispatchEvent("pointerUp", t, [e]), this._dragPointerUp(t, e);
  }, o.pointerDone = function () {
    t.removeEventListener("scroll", this), delete this.pointerDownScroll;
  }, o.dragStart = function (e, i) {
    this.dragStartPosition = this.x, this.startAnimation(), t.removeEventListener("scroll", this), this.dispatchEvent("dragStart", e, [i]);
  }, o.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.dispatchEvent("pointerMove", t, [e, i]), this._dragMove(t, e, i);
  }, o.dragMove = function (t, e, i) {
    t.preventDefault(), this.previousDragX = this.dragX;var n = this.options.rightToLeft ? -1 : 1,
        s = this.dragStartPosition + i.x * n;if (!this.options.wrapAround && this.slides.length) {
      var o = Math.max(-this.slides[0].target, this.dragStartPosition);s = s > o ? .5 * (s + o) : s;var r = Math.min(-this.getLastSlide().target, this.dragStartPosition);s = s < r ? .5 * (s + r) : s;
    }this.dragX = s, this.dragMoveTime = new Date(), this.dispatchEvent("dragMove", t, [e, i]);
  }, o.dragEnd = function (t, e) {
    this.options.freeScroll && (this.isFreeScrolling = !0);var i = this.dragEndRestingSelect();if (this.options.freeScroll && !this.options.wrapAround) {
      var n = this.getRestingPosition();this.isFreeScrolling = -n > this.slides[0].target && -n < this.getLastSlide().target;
    } else this.options.freeScroll || i != this.selectedIndex || (i += this.dragEndBoostSelect());delete this.previousDragX, this.isDragSelect = this.options.wrapAround, this.select(i), delete this.isDragSelect, this.dispatchEvent("dragEnd", t, [e]);
  }, o.dragEndRestingSelect = function () {
    var t = this.getRestingPosition(),
        e = Math.abs(this.getSlideDistance(-t, this.selectedIndex)),
        i = this._getClosestResting(t, e, 1),
        n = this._getClosestResting(t, e, -1),
        s = i.distance < n.distance ? i.index : n.index;return s;
  }, o._getClosestResting = function (t, e, i) {
    for (var n = this.selectedIndex, s = 1 / 0, o = this.options.contain && !this.options.wrapAround ? function (t, e) {
      return t <= e;
    } : function (t, e) {
      return t < e;
    }; o(e, s) && (n += i, s = e, e = this.getSlideDistance(-t, n), null !== e);) {
      e = Math.abs(e);
    }return { distance: s, index: n - i };
  }, o.getSlideDistance = function (t, e) {
    var i = this.slides.length,
        s = this.options.wrapAround && i > 1,
        o = s ? n.modulo(e, i) : e,
        r = this.slides[o];if (!r) return null;var a = s ? this.slideableWidth * Math.floor(e / i) : 0;return t - (r.target + a);
  }, o.dragEndBoostSelect = function () {
    if (void 0 === this.previousDragX || !this.dragMoveTime || new Date() - this.dragMoveTime > 100) return 0;var t = this.getSlideDistance(-this.dragX, this.selectedIndex),
        e = this.previousDragX - this.dragX;return t > 0 && e > 0 ? 1 : t < 0 && e < 0 ? -1 : 0;
  }, o.staticClick = function (t, e) {
    var i = this.getParentCell(t.target),
        n = i && i.element,
        s = i && this.cells.indexOf(i);this.dispatchEvent("staticClick", t, [e, n, s]);
  }, o.onscroll = function () {
    var t = s(),
        e = this.pointerDownScroll.x - t.x,
        i = this.pointerDownScroll.y - t.y;(Math.abs(e) > 3 || Math.abs(i) > 3) && this._pointerDone();
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("tap-listener/tap-listener", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.TapListener = e(t, t.Unipointer);
}(window, function (t, e) {
  function i(t) {
    this.bindTap(t);
  }var n = i.prototype = Object.create(e.prototype);return n.bindTap = function (t) {
    t && (this.unbindTap(), this.tapElement = t, this._bindStartEvent(t, !0));
  }, n.unbindTap = function () {
    this.tapElement && (this._bindStartEvent(this.tapElement, !0), delete this.tapElement);
  }, n.pointerUp = function (i, n) {
    if (!this.isIgnoringMouseUp || "mouseup" != i.type) {
      var s = e.getPointerPoint(n),
          o = this.tapElement.getBoundingClientRect(),
          r = t.pageXOffset,
          a = t.pageYOffset,
          l = s.x >= o.left + r && s.x <= o.right + r && s.y >= o.top + a && s.y <= o.bottom + a;if (l && this.emitEvent("tap", [i, n]), "mouseup" != i.type) {
        this.isIgnoringMouseUp = !0;var h = this;setTimeout(function () {
          delete h.isIgnoringMouseUp;
        }, 400);
      }
    }
  }, n.destroy = function () {
    this.pointerDone(), this.unbindTap();
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/prev-next-button", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  "use strict";
  function s(t, e) {
    this.direction = t, this.parent = e, this._create();
  }function o(t) {
    return "string" == typeof t ? t : "M " + t.x0 + ",50 L " + t.x1 + "," + (t.y1 + 50) + " L " + t.x2 + "," + (t.y2 + 50) + " L " + t.x3 + ",50  L " + t.x2 + "," + (50 - t.y2) + " L " + t.x1 + "," + (50 - t.y1) + " Z";
  }var r = "http://www.w3.org/2000/svg";s.prototype = new i(), s.prototype._create = function () {
    this.isEnabled = !0, this.isPrevious = this.direction == -1;var t = this.parent.options.rightToLeft ? 1 : -1;this.isLeft = this.direction == t;var e = this.element = document.createElement("button");e.className = "flickity-prev-next-button", e.className += this.isPrevious ? " previous" : " next", e.setAttribute("type", "button"), this.disable(), e.setAttribute("aria-label", this.isPrevious ? "previous" : "next");var i = this.createSVG();e.appendChild(i), this.on("tap", this.onTap), this.parent.on("select", this.update.bind(this)), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.bindTap(this.element), this.element.addEventListener("click", this), this.parent.element.appendChild(this.element);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.element), i.prototype.destroy.call(this), this.element.removeEventListener("click", this);
  }, s.prototype.createSVG = function () {
    var t = document.createElementNS(r, "svg");t.setAttribute("viewBox", "0 0 100 100");var e = document.createElementNS(r, "path"),
        i = o(this.parent.options.arrowShape);return e.setAttribute("d", i), e.setAttribute("class", "arrow"), this.isLeft || e.setAttribute("transform", "translate(100, 100) rotate(180) "), t.appendChild(e), t;
  }, s.prototype.onTap = function () {
    if (this.isEnabled) {
      this.parent.uiChange();var t = this.isPrevious ? "previous" : "next";this.parent[t]();
    }
  }, s.prototype.handleEvent = n.handleEvent, s.prototype.onclick = function () {
    var t = document.activeElement;t && t == this.element && this.onTap();
  }, s.prototype.enable = function () {
    this.isEnabled || (this.element.disabled = !1, this.isEnabled = !0);
  }, s.prototype.disable = function () {
    this.isEnabled && (this.element.disabled = !0, this.isEnabled = !1);
  }, s.prototype.update = function () {
    var t = this.parent.slides;if (this.parent.options.wrapAround && t.length > 1) return void this.enable();var e = t.length ? t.length - 1 : 0,
        i = this.isPrevious ? 0 : e,
        n = this.parent.selectedIndex == i ? "disable" : "enable";this[n]();
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, n.extend(e.defaults, { prevNextButtons: !0, arrowShape: { x0: 10, x1: 60, y1: 50, x2: 70, y2: 40, x3: 30 } }), e.createMethods.push("_createPrevNextButtons");var a = e.prototype;return a._createPrevNextButtons = function () {
    this.options.prevNextButtons && (this.prevButton = new s(-1, this), this.nextButton = new s(1, this), this.on("activate", this.activatePrevNextButtons));
  }, a.activatePrevNextButtons = function () {
    this.prevButton.activate(), this.nextButton.activate(), this.on("deactivate", this.deactivatePrevNextButtons);
  }, a.deactivatePrevNextButtons = function () {
    this.prevButton.deactivate(), this.nextButton.deactivate(), this.off("deactivate", this.deactivatePrevNextButtons);
  }, e.PrevNextButton = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/page-dots", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s(t) {
    this.parent = t, this._create();
  }s.prototype = new i(), s.prototype._create = function () {
    this.holder = document.createElement("ol"), this.holder.className = "flickity-page-dots", this.dots = [], this.on("tap", this.onTap), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.setDots(), this.bindTap(this.holder), this.parent.element.appendChild(this.holder);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.holder), i.prototype.destroy.call(this);
  }, s.prototype.setDots = function () {
    var t = this.parent.slides.length - this.dots.length;t > 0 ? this.addDots(t) : t < 0 && this.removeDots(-t);
  }, s.prototype.addDots = function (t) {
    for (var e = document.createDocumentFragment(), i = []; t;) {
      var n = document.createElement("li");n.className = "dot", e.appendChild(n), i.push(n), t--;
    }this.holder.appendChild(e), this.dots = this.dots.concat(i);
  }, s.prototype.removeDots = function (t) {
    var e = this.dots.splice(this.dots.length - t, t);e.forEach(function (t) {
      this.holder.removeChild(t);
    }, this);
  }, s.prototype.updateSelected = function () {
    this.selectedDot && (this.selectedDot.className = "dot"), this.dots.length && (this.selectedDot = this.dots[this.parent.selectedIndex], this.selectedDot.className = "dot is-selected");
  }, s.prototype.onTap = function (t) {
    var e = t.target;if ("LI" == e.nodeName) {
      this.parent.uiChange();var i = this.dots.indexOf(e);this.parent.select(i);
    }
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, e.PageDots = s, n.extend(e.defaults, { pageDots: !0 }), e.createMethods.push("_createPageDots");var o = e.prototype;return o._createPageDots = function () {
    this.options.pageDots && (this.pageDots = new s(this), this.on("activate", this.activatePageDots), this.on("select", this.updateSelectedPageDots), this.on("cellChange", this.updatePageDots), this.on("resize", this.updatePageDots), this.on("deactivate", this.deactivatePageDots));
  }, o.activatePageDots = function () {
    this.pageDots.activate();
  }, o.updateSelectedPageDots = function () {
    this.pageDots.updateSelected();
  }, o.updatePageDots = function () {
    this.pageDots.setDots();
  }, o.deactivatePageDots = function () {
    this.pageDots.deactivate();
  }, e.PageDots = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/player", ["ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity"], function (t, i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity")) : e(t.EvEmitter, t.fizzyUIUtils, t.Flickity);
}(window, function (t, e, i) {
  function n(t) {
    this.parent = t, this.state = "stopped", o && (this.onVisibilityChange = function () {
      this.visibilityChange();
    }.bind(this), this.onVisibilityPlay = function () {
      this.visibilityPlay();
    }.bind(this));
  }var s, o;"hidden" in document ? (s = "hidden", o = "visibilitychange") : "webkitHidden" in document && (s = "webkitHidden", o = "webkitvisibilitychange"), n.prototype = Object.create(t.prototype), n.prototype.play = function () {
    if ("playing" != this.state) {
      var t = document[s];if (o && t) return void document.addEventListener(o, this.onVisibilityPlay);this.state = "playing", o && document.addEventListener(o, this.onVisibilityChange), this.tick();
    }
  }, n.prototype.tick = function () {
    if ("playing" == this.state) {
      var t = this.parent.options.autoPlay;t = "number" == typeof t ? t : 3e3;var e = this;this.clear(), this.timeout = setTimeout(function () {
        e.parent.next(!0), e.tick();
      }, t);
    }
  }, n.prototype.stop = function () {
    this.state = "stopped", this.clear(), o && document.removeEventListener(o, this.onVisibilityChange);
  }, n.prototype.clear = function () {
    clearTimeout(this.timeout);
  }, n.prototype.pause = function () {
    "playing" == this.state && (this.state = "paused", this.clear());
  }, n.prototype.unpause = function () {
    "paused" == this.state && this.play();
  }, n.prototype.visibilityChange = function () {
    var t = document[s];this[t ? "pause" : "unpause"]();
  }, n.prototype.visibilityPlay = function () {
    this.play(), document.removeEventListener(o, this.onVisibilityPlay);
  }, e.extend(i.defaults, { pauseAutoPlayOnHover: !0 }), i.createMethods.push("_createPlayer");var r = i.prototype;return r._createPlayer = function () {
    this.player = new n(this), this.on("activate", this.activatePlayer), this.on("uiChange", this.stopPlayer), this.on("pointerDown", this.stopPlayer), this.on("deactivate", this.deactivatePlayer);
  }, r.activatePlayer = function () {
    this.options.autoPlay && (this.player.play(), this.element.addEventListener("mouseenter", this));
  }, r.playPlayer = function () {
    this.player.play();
  }, r.stopPlayer = function () {
    this.player.stop();
  }, r.pausePlayer = function () {
    this.player.pause();
  }, r.unpausePlayer = function () {
    this.player.unpause();
  }, r.deactivatePlayer = function () {
    this.player.stop(), this.element.removeEventListener("mouseenter", this);
  }, r.onmouseenter = function () {
    this.options.pauseAutoPlayOnHover && (this.player.pause(), this.element.addEventListener("mouseleave", this));
  }, r.onmouseleave = function () {
    this.player.unpause(), this.element.removeEventListener("mouseleave", this);
  }, i.Player = n, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/add-remove-cell", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  function n(t) {
    var e = document.createDocumentFragment();return t.forEach(function (t) {
      e.appendChild(t.element);
    }), e;
  }var s = e.prototype;return s.insert = function (t, e) {
    var i = this._makeCells(t);if (i && i.length) {
      var s = this.cells.length;e = void 0 === e ? s : e;var o = n(i),
          r = e == s;if (r) this.slider.appendChild(o);else {
        var a = this.cells[e].element;this.slider.insertBefore(o, a);
      }if (0 === e) this.cells = i.concat(this.cells);else if (r) this.cells = this.cells.concat(i);else {
        var l = this.cells.splice(e, s - e);this.cells = this.cells.concat(i).concat(l);
      }this._sizeCells(i);var h = e > this.selectedIndex ? 0 : i.length;this._cellAddedRemoved(e, h);
    }
  }, s.append = function (t) {
    this.insert(t, this.cells.length);
  }, s.prepend = function (t) {
    this.insert(t, 0);
  }, s.remove = function (t) {
    var e,
        n,
        s = this.getCells(t),
        o = 0,
        r = s.length;for (e = 0; e < r; e++) {
      n = s[e];var a = this.cells.indexOf(n) < this.selectedIndex;o -= a ? 1 : 0;
    }for (e = 0; e < r; e++) {
      n = s[e], n.remove(), i.removeFrom(this.cells, n);
    }s.length && this._cellAddedRemoved(0, o);
  }, s._cellAddedRemoved = function (t, e) {
    e = e || 0, this.selectedIndex += e, this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex)), this.cellChange(t, !0), this.emitEvent("cellAddedRemoved", [t, e]);
  }, s.cellSizeChange = function (t) {
    var e = this.getCell(t);if (e) {
      e.getSize();var i = this.cells.indexOf(e);this.cellChange(i);
    }
  }, s.cellChange = function (t, e) {
    var i = this.slideableWidth;if (this._positionCells(t), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("cellChange", [t]), this.options.freeScroll) {
      var n = i - this.slideableWidth;this.x += n * this.cellAlign, this.positionSlider();
    } else e && this.positionSliderAtSelected(), this.select(this.selectedIndex);
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/lazyload", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  "use strict";
  function n(t) {
    if ("IMG" == t.nodeName && t.getAttribute("data-flickity-lazyload")) return [t];var e = t.querySelectorAll("img[data-flickity-lazyload]");return i.makeArray(e);
  }function s(t, e) {
    this.img = t, this.flickity = e, this.load();
  }e.createMethods.push("_createLazyload");var o = e.prototype;return o._createLazyload = function () {
    this.on("select", this.lazyLoad);
  }, o.lazyLoad = function () {
    var t = this.options.lazyLoad;if (t) {
      var e = "number" == typeof t ? t : 0,
          i = this.getAdjacentCellElements(e),
          o = [];i.forEach(function (t) {
        var e = n(t);o = o.concat(e);
      }), o.forEach(function (t) {
        new s(t, this);
      }, this);
    }
  }, s.prototype.handleEvent = i.handleEvent, s.prototype.load = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.img.getAttribute("data-flickity-lazyload"), this.img.removeAttribute("data-flickity-lazyload");
  }, s.prototype.onload = function (t) {
    this.complete(t, "flickity-lazyloaded");
  }, s.prototype.onerror = function (t) {
    this.complete(t, "flickity-lazyerror");
  }, s.prototype.complete = function (t, e) {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);var i = this.flickity.getParentCell(this.img),
        n = i && i.element;this.flickity.cellSizeChange(n), this.img.classList.add(e), this.flickity.dispatchEvent("lazyLoad", t, n);
  }, e.LazyLoader = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/index", ["./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = e(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload")));
}(window, function (t) {
  return t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity-as-nav-for/as-nav-for", ["flickity/js/index", "fizzy-ui-utils/utils"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("flickity"), require("fizzy-ui-utils")) : t.Flickity = e(t.Flickity, t.fizzyUIUtils);
}(window, function (t, e) {
  function i(t, e, i) {
    return (e - t) * i + t;
  }t.createMethods.push("_createAsNavFor");var n = t.prototype;return n._createAsNavFor = function () {
    this.on("activate", this.activateAsNavFor), this.on("deactivate", this.deactivateAsNavFor), this.on("destroy", this.destroyAsNavFor);var t = this.options.asNavFor;if (t) {
      var e = this;setTimeout(function () {
        e.setNavCompanion(t);
      });
    }
  }, n.setNavCompanion = function (i) {
    i = e.getQueryElement(i);var n = t.data(i);if (n && n != this) {
      this.navCompanion = n;var s = this;this.onNavCompanionSelect = function () {
        s.navCompanionSelect();
      }, n.on("select", this.onNavCompanionSelect), this.on("staticClick", this.onNavStaticClick), this.navCompanionSelect(!0);
    }
  }, n.navCompanionSelect = function (t) {
    if (this.navCompanion) {
      var e = this.navCompanion.selectedCells[0],
          n = this.navCompanion.cells.indexOf(e),
          s = n + this.navCompanion.selectedCells.length - 1,
          o = Math.floor(i(n, s, this.navCompanion.cellAlign));if (this.selectCell(o, !1, t), this.removeNavSelectedElements(), !(o >= this.cells.length)) {
        var r = this.cells.slice(n, s + 1);this.navSelectedElements = r.map(function (t) {
          return t.element;
        }), this.changeNavSelectedClass("add");
      }
    }
  }, n.changeNavSelectedClass = function (t) {
    this.navSelectedElements.forEach(function (e) {
      e.classList[t]("is-nav-selected");
    });
  }, n.activateAsNavFor = function () {
    this.navCompanionSelect(!0);
  }, n.removeNavSelectedElements = function () {
    this.navSelectedElements && (this.changeNavSelectedClass("remove"), delete this.navSelectedElements);
  }, n.onNavStaticClick = function (t, e, i, n) {
    "number" == typeof n && this.navCompanion.selectCell(n);
  }, n.deactivateAsNavFor = function () {
    this.removeNavSelectedElements();
  }, n.destroyAsNavFor = function () {
    this.navCompanion && (this.navCompanion.off("select", this.onNavCompanionSelect), this.off("staticClick", this.onNavStaticClick), delete this.navCompanion);
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("imagesloaded/imagesloaded", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i(t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }function n(t) {
    var e = [];if (Array.isArray(t)) e = t;else if ("number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }function s(t, e, o) {
    return this instanceof s ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? o = e : i(this.options, e), o && this.on("always", o), this.getImages(), a && (this.jqDeferred = new a.Deferred()), void setTimeout(function () {
      this.check();
    }.bind(this))) : new s(t, e, o);
  }function o(t) {
    this.img = t;
  }function r(t, e) {
    this.url = t, this.element = e, this.img = new Image();
  }var a = t.jQuery,
      l = t.console;s.prototype = Object.create(e.prototype), s.prototype.options = {}, s.prototype.getImages = function () {
    this.images = [], this.elements.forEach(this.addElementImages, this);
  }, s.prototype.addElementImages = function (t) {
    "IMG" == t.nodeName && this.addImage(t), this.options.background === !0 && this.addElementBackgroundImages(t);var e = t.nodeType;if (e && h[e]) {
      for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
        var s = i[n];this.addImage(s);
      }if ("string" == typeof this.options.background) {
        var o = t.querySelectorAll(this.options.background);for (n = 0; n < o.length; n++) {
          var r = o[n];this.addElementBackgroundImages(r);
        }
      }
    }
  };var h = { 1: !0, 9: !0, 11: !0 };return s.prototype.addElementBackgroundImages = function (t) {
    var e = getComputedStyle(t);if (e) for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
      var s = n && n[2];s && this.addBackground(s, t), n = i.exec(e.backgroundImage);
    }
  }, s.prototype.addImage = function (t) {
    var e = new o(t);this.images.push(e);
  }, s.prototype.addBackground = function (t, e) {
    var i = new r(t, e);this.images.push(i);
  }, s.prototype.check = function () {
    function t(t, i, n) {
      setTimeout(function () {
        e.progress(t, i, n);
      });
    }var e = this;return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (e) {
      e.once("progress", t), e.check();
    }) : void this.complete();
  }, s.prototype.progress = function (t, e, i) {
    this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && l && l.log("progress: " + i, t, e);
  }, s.prototype.complete = function () {
    var t = this.hasAnyBroken ? "fail" : "done";if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
      var e = this.hasAnyBroken ? "reject" : "resolve";this.jqDeferred[e](this);
    }
  }, o.prototype = Object.create(e.prototype), o.prototype.check = function () {
    var t = this.getIsImageComplete();return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image(), this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void (this.proxyImage.src = this.img.src));
  }, o.prototype.getIsImageComplete = function () {
    return this.img.complete && void 0 !== this.img.naturalWidth;
  }, o.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.img, e]);
  }, o.prototype.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, o.prototype.onload = function () {
    this.confirm(!0, "onload"), this.unbindEvents();
  }, o.prototype.onerror = function () {
    this.confirm(!1, "onerror"), this.unbindEvents();
  }, o.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype = Object.create(o.prototype), r.prototype.check = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;var t = this.getIsImageComplete();t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents());
  }, r.prototype.unbindEvents = function () {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.element, e]);
  }, s.makeJQueryPlugin = function (e) {
    e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function (t, e) {
      var i = new s(this, t, e);return i.jqDeferred.promise(a(this));
    });
  }, s.makeJQueryPlugin(), s;
}), function (t, e) {
  "function" == typeof define && define.amd ? define(["flickity/js/index", "imagesloaded/imagesloaded"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("flickity"), require("imagesloaded")) : t.Flickity = e(t, t.Flickity, t.imagesLoaded);
}(window, function (t, e, i) {
  "use strict";
  e.createMethods.push("_createImagesLoaded");var n = e.prototype;return n._createImagesLoaded = function () {
    this.on("activate", this.imagesLoaded);
  }, n.imagesLoaded = function () {
    function t(t, i) {
      var n = e.getParentCell(i.img);e.cellSizeChange(n && n.element), e.options.freeScroll || e.positionSliderAtSelected();
    }if (this.options.imagesLoaded) {
      var e = this;i(this.slider).on("progress", t);
    }
  }, e;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Flickity background lazyload v1.0.0
 * lazyload background cell images
 */

/*jshint browser: true, unused: true, undef: true */

(function (window, factory) {
  // universal module definition
  /*globals define, module, require */
  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['flickity/js/index', 'fizzy-ui-utils/utils'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('flickity'), require('fizzy-ui-utils'));
  } else {
    // browser global
    factory(window.Flickity, window.fizzyUIUtils);
  }
})(window, function factory(Flickity, utils) {
  /*jshint strict: true */
  'use strict';

  Flickity.createMethods.push('_createBgLazyLoad');

  var proto = Flickity.prototype;

  proto._createBgLazyLoad = function () {
    this.on('select', this.bgLazyLoad);
  };

  proto.bgLazyLoad = function () {
    var lazyLoad = this.options.bgLazyLoad;
    if (!lazyLoad) {
      return;
    }

    // get adjacent cells, use lazyLoad option for adjacent count
    var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
    var cellElems = this.getAdjacentCellElements(adjCount);

    for (var i = 0; i < cellElems.length; i++) {
      var cellElem = cellElems[i];
      this.bgLazyLoadElem(cellElem);
      // select lazy elems in cell
      var children = cellElem.querySelectorAll('[data-flickity-bg-lazyload]');
      for (var j = 0; j < children.length; j++) {
        this.bgLazyLoadElem(children[j]);
      }
    }
  };

  proto.bgLazyLoadElem = function (elem) {
    var attr = elem.getAttribute('data-flickity-bg-lazyload');
    if (attr) {
      new BgLazyLoader(elem, attr, this);
    }
  };

  // -------------------------- LazyBGLoader -------------------------- //

  /**
   * class to handle loading images
   */
  function BgLazyLoader(elem, url, flickity) {
    this.element = elem;
    this.url = url;
    this.img = new Image();
    this.flickity = flickity;
    this.load();
  }

  BgLazyLoader.prototype.handleEvent = utils.handleEvent;

  BgLazyLoader.prototype.load = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    // load image
    this.img.src = this.url;
    // remove attr
    this.element.removeAttribute('data-flickity-bg-lazyload');
  };

  BgLazyLoader.prototype.onload = function (event) {
    this.element.style.backgroundImage = 'url(' + this.url + ')';
    this.complete(event, 'flickity-bg-lazyloaded');
  };

  BgLazyLoader.prototype.onerror = function (event) {
    this.complete(event, 'flickity-bg-lazyerror');
  };

  BgLazyLoader.prototype.complete = function (event, className) {
    // unbind events
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);

    this.element.classList.add(className);
    this.flickity.dispatchEvent('bgLazyLoad', event, this.element);
  };

  // -----  ----- //

  Flickity.BgLazyLoader = BgLazyLoader;

  return Flickity;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
*  Ajax Autocomplete for jQuery, version 1.2.27
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var utils = function () {
        return {
            escapeRegExChars: function escapeRegExChars(value) {
                return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
            },
            createNode: function createNode(containerClass) {
                var div = document.createElement('div');
                div.className = containerClass;
                div.style.position = 'absolute';
                div.style.display = 'none';
                return div;
            }
        };
    }(),
        keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    function Autocomplete(el, options) {
        var noop = $.noop,
            that = this,
            defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: document.body,
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: Autocomplete.formatResult,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: function lookupFilter(suggestion, originalQuery, queryLowerCase) {
                return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
            },
            paramName: 'query',
            transformResult: function transformResult(response) {
                return typeof response === 'string' ? $.parseJSON(response) : response;
            },
            showNoSuggestionNotice: false,
            noSuggestionNotice: 'No results',
            orientation: 'bottom',
            forceFixPosition: false
        };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function initialize() {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if (!$(e.target).closest('.' + that.options.containerClass).length) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>').html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
                return false;
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) {
                that.onKeyPress(e);
            });
            that.el.on('keyup.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('blur.autocomplete', function () {
                that.onBlur();
            });
            that.el.on('focus.autocomplete', function () {
                that.onFocus();
            });
            that.el.on('change.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('input.autocomplete', function (e) {
                that.onKeyUp(e);
            });
        },

        onFocus: function onFocus() {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function onBlur() {
            this.enableKillerFn();
        },

        abortAjax: function abortAjax() {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function setOptions(suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },

        clearCache: function clearCache() {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function clear() {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function disable() {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function enable() {
            this.disabled = false;
        },

        fixPosition: function fixPosition() {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }
            var siteSearchDiv = $('.site-search');
            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = siteSearchDiv.outerHeight(),
                offset = siteSearchDiv.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = Math.max(topOverflow, bottomOverflow) === topOverflow ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                if (!that.visible) {
                    $container.css('opacity', 0).show();
                }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible) {
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = siteSearchDiv.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function enableKillerFn() {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function disableKillerFn() {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function killSuggestions() {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    // No need to restore value when 
                    // preserveInput === true, 
                    // because we did not change it
                    if (!that.options.preserveInput) {
                        that.el.val(that.currentValue);
                    }

                    that.hide();
                }

                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function stopKillSuggestions() {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function isCursorAtEnd() {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function onKeyPress(e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function onKeyUp(e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function onValueChange() {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function isExactMatch(query) {
            var suggestions = this.suggestions;

            return suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase();
        },

        getQuery: function getQuery(value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function getSuggestionsLocal(query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function getSuggestions(q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function isBadQuery(q) {
            if (!this.options.preventBadQueries) {
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function hide() {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function suggest() {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function formatGroup(suggestion, index) {
                var currentCategory = suggestion.data[groupBy];

                if (category === currentCategory) {
                    return '';
                }

                category = currentCategory;

                return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
            };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy) {
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function noSuggestions() {
            var that = this,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function adjustContainerWidth() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        },

        findBestHint: function findBestHint() {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function signalHint(suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function verifySuggestionsFormat(suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function validateOrientation(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function processResponse(result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function activate(index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function selectHint() {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function select(i) {
            var that = this;
            that.hide();
            that.onSelect(i);
            that.disableKillerFn();
        },

        moveUp: function moveUp() {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function moveDown() {
            var that = this;

            if (that.selectedIndex === that.suggestions.length - 1) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function adjustScroll(index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function onSelect(index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function getValue(value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function dispose() {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
});
'use strict';

var _$$flickity;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

$(document).foundation();

var bases = document.getElementsByTagName('base');
var baseHref = null;

if (bases.length > 0) {
	baseHref = bases[0].href;
}
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Lazy Loading Images:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var myLazyLoad = new LazyLoad({
	// example of options object -> see options section
	elements_selector: ".dp-lazy"
	// throttle: 200,
	// data_src: "src",
	// data_srcset: "srcset",
	// callback_set: function() { /* ... */ }
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Big Carousel (Home Page):
/*-------------------------------------------------*/
/*-------------------------------------------------*/

var $carousel = $('.carousel').flickity((_$$flickity = {
	imagesLoaded: true,
	percentPosition: false,
	selectedAttraction: 0.015,
	friction: 0.3,
	prevNextButtons: false,
	draggable: true,
	autoPlay: true
}, _defineProperty(_$$flickity, 'autoPlay', 8000), _defineProperty(_$$flickity, 'pauseAutoPlayOnHover', false), _defineProperty(_$$flickity, 'bgLazyLoad', true), _$$flickity));

var $imgs = $carousel.find('.carousel-cell .cell-bg');
// get transform property
var docStyle = document.documentElement.style;
var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
// get Flickity instance
var flkty = $carousel.data('flickity');

$carousel.on('scroll.flickity', function () {
	flkty.slides.forEach(function (slide, i) {
		var img = $imgs[i];
		var x = (slide.target + flkty.x) * -1 / 3;
		img.style[transformProp] = 'translateX(' + x + 'px)';
	});
});

$('.carousel-nav-cell').click(function () {
	flkty.stopPlayer();
});

var $gallery = $('.carousel').flickity();

function onLoadeddata(event) {
	var cell = $gallery.flickity('getParentCell', event.target);
	$gallery.flickity('cellSizeChange', cell && cell.element);
}

$gallery.find('video').each(function (i, video) {
	video.play();
	$(video).on('loadeddata', onLoadeddata);
});
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Slideshow block (in content):
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var $slideshow = $('.slideshow').flickity({
	//adaptiveHeight: true,
	imagesLoaded: true,
	lazyLoad: true
});

var slideshowflk = $slideshow.data('flickity');

$slideshow.on('select.flickity', function () {
	console.log('Flickity select ' + slideshowflk.selectedIndex);
	//slideshowflk.reloadCells();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Start Foundation Orbit Slider:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// var sliderOptions = {
// 	containerClass: 'slider__slides',
// 	slideClass: 'slider__slide',
// 	nextClass: 'slider__nav--next',
// 	prevClass: 'slider__nav--previous',

// };


// var slider = new Foundation.Orbit($('.slider'), sliderOptions);

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Wrap every iframe in a flex video class to prevent layout breakage
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('iframe').each(function () {
	$(this).wrap("<div class='flex-video widescreen'></div>");
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Distinguish dropdowns on mobile/desktop:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

$('.nav__item--parent').click(function (event) {
	if (whatInput.ask() === 'touch') {
		// do touch input things
		if (!$(this).hasClass('nav__item--is-hovered')) {
			event.preventDefault();
			$('.nav__item--parent').removeClass('nav__item--is-hovered');
			$(this).toggleClass('nav__item--is-hovered');
		}
	} else if (whatInput.ask() === 'mouse') {
		// do mouse things
	}
});

//If anything in the main content container is clicked, remove faux hover class.
$('#main-content__container').click(function () {
	$('.nav__item').removeClass('nav__item--is-hovered');
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Site Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function toggleSearchClasses() {
	$("body").toggleClass("body--search-active");
	$("#site-search__form").toggleClass("site-search__form--is-inactive site-search__form--is-active");
	$("#site-search").toggleClass("site-search--is-inactive site-search--is-active");
	$(".header__screen").toggleClass("header__screen--grayscale");
	$(".main-content__container").toggleClass("main-content__container--grayscale");
	$(".nav__wrapper").toggleClass("nav__wrapper--grayscale");
	$(".nav__link--search").toggleClass("nav__link--search-is-active");

	//HACK: wait for 5ms before changing focus. I don't think I need this anymore actually..
	setTimeout(function () {
		$(".nav__wrapper").toggleClass("nav__wrapper--search-is-active");
	}, 5);

	$(".nav").toggleClass("nav--search-is-active");
}

$(".nav__link--search").click(function () {
	toggleSearchClasses();
	if ($("#mobile-nav__wrapper").hasClass("mobile-nav__wrapper--mobile-menu-is-active")) {
		toggleMobileMenuClasses();
		$("#site-search").appendTo('#header').addClass('site-search--mobile');
	}
	document.getElementById("site-search__input").focus();
});

$(".nav__link--search-cancel").click(function () {
	toggleSearchClasses();
	document.getElementById("site-search__input").blur();
});

//When search form is out of focus, deactivate it.
$("#site-search__form").focusout(function () {
	if ($("#site-search__form").hasClass("site-search__form--is-active")) {
		//Comment out the following line if you need to use WebKit/Blink inspector tool on the search (so it doesn't lose focus):
		//toggleSearchClasses();
	}
});

$('input[name="Search"]').autocomplete({
	serviceUrl: baseHref + '/home/autoComplete',
	deferRequestBy: 100,
	triggerSelectOnValidInput: false,
	minChars: 2,
	autoSelectFirst: true,
	type: 'post',
	onSelect: function onSelect(suggestion) {
		$('#site-search__form').submit();
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

if (Foundation.MediaQuery.atLeast('medium')) {
	// True if medium or large
	// False if small
	$("#site-search").addClass("site-search--desktop");
} else {
	$("#site-search").addClass("site-search--mobile");
}

$(".nav__toggle--search").click(function () {
	toggleSearchClasses();

	//append our site search div to the header.
	$("#site-search").appendTo('#header').addClass('site-search--mobile');
	document.getElementById("site-search__input").focus();
});

//If we're resizing from mobile to anything else, toggle the mobile search if it's active.
$(window).on('changed.zf.mediaquery', function (event, newSize, oldSize) {

	if (newSize == "medium") {
		//alert('hey');
		$("#site-search").removeClass("site-search--mobile");
		$("#site-search").addClass("site-search--desktop");

		$("#site-search").appendTo("#nav");

		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	} else if (newSize == "mobile") {
		$("#site-search").appendTo('#header');
		$("#site-search").removeClass("site-search--desktop");
		$("#site-search").addClass("site-search--mobile");
		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Nav:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

/* new stuff added my Brandon - lazy coding */
$('.nav__toggle--menu').on('click', function () {
	$('.nav__menu-icon').toggleClass('is-clicked');
	$("#nav__menu-icon").toggleClass("nav__menu-icon--menu-is-active");
	$(this).parent().toggleClass('open');
});

$('.second-level--open').click(function () {
	$(this).parent().toggleClass('nav__item--opened');
	if ($(this).next().attr('aria-hidden') == 'true') {
		$(this).next().attr('aria-hidden', 'false');
	} else {
		$(this).next().attr('aria-hidden', 'true');
	}

	if ($(this).attr('aria-expanded') == 'false') {
		$(this).attr('aria-expanded', 'true');
	} else {
		$(this).next().attr('aria-expanded', 'false');
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Background Video
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('.backgroundvideo__link').click(function (e) {
	var that = $(this);
	var video = that.data('video');
	var width = $('img', that).width();
	var height = $('img', that).height();
	that.parent().addClass('on');
	that.parent().prepend('<div class="flex-video widescreen"><iframe src="http://www.youtube.com/embed/' + video + '?rel=0&autoplay=1" width="' + width + '" height="' + height + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>');
	that.hide();
	e.preventDefault();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Automatic full height silder, not working yet..
/*-------------------------------------------------*/
/*-------------------------------------------------*/

// function setDimensions(){
//    var windowsHeight = $(window).height();

//    $('.orbit-container').css('height', windowsHeight + 'px');
//   // $('.orbit-container').css('max-height', windowsHeight + 'px');

//    $('.orbit-slide').css('height', windowsHeight + 'px');
//    $('.orbit-slide').css('max-height', windowsHeight + 'px');
// }

// $(window).resize(function() {
//     setDimensions();
// });

// setDimensions();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi50YWJzLmpzIiwibGF6eWxvYWQudHJhbnNwaWxlZC5qcyIsImZsaWNraXR5LnBrZ2QubWluLmpzIiwiZmxpY2tpdHliZy1sYXp5bG9hZC5qcyIsImpxdWVyeS1hdXRvY29tcGxldGUuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJydGwiLCJhdHRyIiwicGx1Z2luIiwibmFtZSIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ0b0xvd2VyQ2FzZSIsInV1aWQiLCJHZXRZb0RpZ2l0cyIsIiRlbGVtZW50IiwiZGF0YSIsInRyaWdnZXIiLCJwdXNoIiwidW5yZWdpc3RlclBsdWdpbiIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVBdHRyIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsImVhY2giLCJfaW5pdCIsInR5cGUiLCJfdGhpcyIsImZucyIsInBsZ3MiLCJmb3JFYWNoIiwicCIsImZvdW5kYXRpb24iLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibGVuZ3RoIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJ0Iiwic3R5bGUiLCJzZXRUaW1lb3V0IiwidHJpZ2dlckhhbmRsZXIiLCJ1dGlsIiwidGhyb3R0bGUiLCJmdW5jIiwiZGVsYXkiLCJ0aW1lciIsImNvbnRleHQiLCJhcmdzIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJNZWRpYVF1ZXJ5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwicGx1Z0NsYXNzIiwidW5kZWZpbmVkIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJ3aW5kb3ciLCJmbiIsIkRhdGUiLCJub3ciLCJnZXRUaW1lIiwidmVuZG9ycyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJjYWxsYmFjayIsIm5leHRUaW1lIiwibWF4IiwiY2xlYXJUaW1lb3V0IiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInJlcGxhY2UiLCJqUXVlcnkiLCJCb3giLCJJbU5vdFRvdWNoaW5nWW91IiwiR2V0RGltZW5zaW9ucyIsIkdldE9mZnNldHMiLCJlbGVtZW50IiwicGFyZW50IiwibHJPbmx5IiwidGJPbmx5IiwiZWxlRGltcyIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsInBhckRpbXMiLCJvZmZzZXQiLCJoZWlnaHQiLCJ3aWR0aCIsIndpbmRvd0RpbXMiLCJhbGxEaXJzIiwiRXJyb3IiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFyUmVjdCIsInBhcmVudE5vZGUiLCJ3aW5SZWN0IiwiYm9keSIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJwb3NpdGlvbiIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJrZXlDb2RlcyIsImNvbW1hbmRzIiwiS2V5Ym9hcmQiLCJnZXRLZXlDb2RlcyIsInBhcnNlS2V5IiwiZXZlbnQiLCJrZXkiLCJ3aGljaCIsImtleUNvZGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ0b1VwcGVyQ2FzZSIsInNoaWZ0S2V5IiwiY3RybEtleSIsImFsdEtleSIsImhhbmRsZUtleSIsImNvbXBvbmVudCIsImZ1bmN0aW9ucyIsImNvbW1hbmRMaXN0IiwiY21kcyIsImNvbW1hbmQiLCJsdHIiLCJleHRlbmQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZWQiLCJ1bmhhbmRsZWQiLCJmaW5kRm9jdXNhYmxlIiwiZmlsdGVyIiwiaXMiLCJyZWdpc3RlciIsImNvbXBvbmVudE5hbWUiLCJ0cmFwRm9jdXMiLCIkZm9jdXNhYmxlIiwiJGZpcnN0Rm9jdXNhYmxlIiwiZXEiLCIkbGFzdEZvY3VzYWJsZSIsIm9uIiwidGFyZ2V0IiwicHJldmVudERlZmF1bHQiLCJmb2N1cyIsInJlbGVhc2VGb2N1cyIsIm9mZiIsImtjcyIsImsiLCJrYyIsImRlZmF1bHRRdWVyaWVzIiwibGFuZHNjYXBlIiwicG9ydHJhaXQiLCJyZXRpbmEiLCJxdWVyaWVzIiwiY3VycmVudCIsInNlbGYiLCJleHRyYWN0ZWRTdHlsZXMiLCJjc3MiLCJuYW1lZFF1ZXJpZXMiLCJwYXJzZVN0eWxlVG9PYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInZhbHVlIiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwiZ2V0IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpbmZvIiwiaWQiLCJpbnNlcnRCZWZvcmUiLCJnZXRDb21wdXRlZFN0eWxlIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJ0ZXh0Iiwic3R5bGVTaGVldCIsImNzc1RleHQiLCJ0ZXh0Q29udGVudCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImlzQXJyYXkiLCJpbml0Q2xhc3NlcyIsImFjdGl2ZUNsYXNzZXMiLCJNb3Rpb24iLCJhbmltYXRlSW4iLCJhbmltYXRpb24iLCJjYiIsImFuaW1hdGUiLCJhbmltYXRlT3V0IiwiTW92ZSIsImR1cmF0aW9uIiwiYW5pbSIsInByb2ciLCJtb3ZlIiwidHMiLCJpc0luIiwiaW5pdENsYXNzIiwiYWN0aXZlQ2xhc3MiLCJyZXNldCIsImFkZENsYXNzIiwic2hvdyIsIm9mZnNldFdpZHRoIiwib25lIiwiZmluaXNoIiwiaGlkZSIsInRyYW5zaXRpb25EdXJhdGlvbiIsIk5lc3QiLCJGZWF0aGVyIiwibWVudSIsIml0ZW1zIiwic3ViTWVudUNsYXNzIiwic3ViSXRlbUNsYXNzIiwiaGFzU3ViQ2xhc3MiLCIkaXRlbSIsIiRzdWIiLCJjaGlsZHJlbiIsIkJ1cm4iLCJUaW1lciIsIm9wdGlvbnMiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJpbmZpbml0ZSIsInBhdXNlIiwib25JbWFnZXNMb2FkZWQiLCJpbWFnZXMiLCJ1bmxvYWRlZCIsImNvbXBsZXRlIiwicmVhZHlTdGF0ZSIsInNpbmdsZUltYWdlTG9hZGVkIiwic3JjIiwic3BvdFN3aXBlIiwiZW5hYmxlZCIsImRvY3VtZW50RWxlbWVudCIsIm1vdmVUaHJlc2hvbGQiLCJ0aW1lVGhyZXNob2xkIiwic3RhcnRQb3NYIiwic3RhcnRQb3NZIiwic3RhcnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJpc01vdmluZyIsIm9uVG91Y2hFbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25Ub3VjaE1vdmUiLCJ4IiwidG91Y2hlcyIsInBhZ2VYIiwieSIsInBhZ2VZIiwiZHgiLCJkeSIsImRpciIsImFicyIsIm9uVG91Y2hTdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0IiwidGVhcmRvd24iLCJzcGVjaWFsIiwic3dpcGUiLCJzZXR1cCIsIm5vb3AiLCJhZGRUb3VjaCIsImhhbmRsZVRvdWNoIiwiY2hhbmdlZFRvdWNoZXMiLCJmaXJzdCIsImV2ZW50VHlwZXMiLCJ0b3VjaHN0YXJ0IiwidG91Y2htb3ZlIiwidG91Y2hlbmQiLCJzaW11bGF0ZWRFdmVudCIsIk1vdXNlRXZlbnQiLCJzY3JlZW5YIiwic2NyZWVuWSIsImNsaWVudFgiLCJjbGllbnRZIiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJNdXRhdGlvbk9ic2VydmVyIiwicHJlZml4ZXMiLCJ0cmlnZ2VycyIsInN0b3BQcm9wYWdhdGlvbiIsImZhZGVPdXQiLCJjaGVja0xpc3RlbmVycyIsImV2ZW50c0xpc3RlbmVyIiwicmVzaXplTGlzdGVuZXIiLCJzY3JvbGxMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsIm5vdCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCIkdGFyZ2V0IiwiYXR0cmlidXRlTmFtZSIsImNsb3Nlc3QiLCJlbGVtZW50T2JzZXJ2ZXIiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsImNoaWxkTGlzdCIsImNoYXJhY3RlckRhdGEiLCJzdWJ0cmVlIiwiYXR0cmlidXRlRmlsdGVyIiwiSUhlYXJZb3UiLCJBY2NvcmRpb24iLCJkZWZhdWx0cyIsIiR0YWJzIiwiaWR4IiwiJGNvbnRlbnQiLCJsaW5rSWQiLCIkaW5pdEFjdGl2ZSIsImZpcnN0VGltZUluaXQiLCJkb3duIiwiX2NoZWNrRGVlcExpbmsiLCJsb2NhdGlvbiIsImhhc2giLCIkbGluayIsIiRhbmNob3IiLCJoYXNDbGFzcyIsImRlZXBMaW5rU211ZGdlIiwibG9hZCIsInNjcm9sbFRvcCIsImRlZXBMaW5rU211ZGdlRGVsYXkiLCJkZWVwTGluayIsIl9ldmVudHMiLCIkdGFiQ29udGVudCIsInRvZ2dsZSIsIm5leHQiLCIkYSIsIm11bHRpRXhwYW5kIiwicHJldmlvdXMiLCJwcmV2IiwidXAiLCJ1cGRhdGVIaXN0b3J5IiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsImZpcnN0VGltZSIsIiRjdXJyZW50QWN0aXZlIiwic2xpZGVEb3duIiwic2xpZGVTcGVlZCIsIiRhdW50cyIsInNpYmxpbmdzIiwiYWxsb3dBbGxDbG9zZWQiLCJzbGlkZVVwIiwic3RvcCIsIkludGVyY2hhbmdlIiwicnVsZXMiLCJjdXJyZW50UGF0aCIsIl9hZGRCcmVha3BvaW50cyIsIl9nZW5lcmF0ZVJ1bGVzIiwiX3JlZmxvdyIsIm1hdGNoIiwicnVsZSIsInBhdGgiLCJTUEVDSUFMX1FVRVJJRVMiLCJydWxlc0xpc3QiLCJub2RlTmFtZSIsInJlc3BvbnNlIiwiaHRtbCIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsInRyYW5zaXRpb24iLCJjb250ZW50T3ZlcmxheSIsIm92ZXJsYXkiLCJvdmVybGF5UG9zaXRpb24iLCJzZXRBdHRyaWJ1dGUiLCIkb3ZlcmxheSIsImFwcGVuZCIsImlzUmV2ZWFsZWQiLCJSZWdFeHAiLCJyZXZlYWxDbGFzcyIsInJldmVhbE9uIiwiX3NldE1RQ2hlY2tlciIsInRyYW5zaXRpb25UaW1lIiwib3BlbiIsImNsb3NlIiwiX2hhbmRsZUtleWJvYXJkIiwiY2xvc2VPbkNsaWNrIiwicmV2ZWFsIiwiJGNsb3NlciIsInNjcm9sbEhlaWdodCIsImNsaWVudEhlaWdodCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIm9yaWdpbmFsRXZlbnQiLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJhdXRvRm9jdXMiLCJjYW52YXNGb2N1cyIsIlRhYnMiLCIkdGFiVGl0bGVzIiwibGlua0NsYXNzIiwiaXNBY3RpdmUiLCJsaW5rQWN0aXZlQ2xhc3MiLCJtYXRjaEhlaWdodCIsIiRpbWFnZXMiLCJfc2V0SGVpZ2h0Iiwic2VsZWN0VGFiIiwiX2FkZEtleUhhbmRsZXIiLCJfYWRkQ2xpY2tIYW5kbGVyIiwiX3NldEhlaWdodE1xSGFuZGxlciIsIl9oYW5kbGVUYWJDaGFuZ2UiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJ3cmFwT25LZXlzIiwibGFzdCIsIm1pbiIsImhpc3RvcnlIYW5kbGVkIiwiYWN0aXZlQ29sbGFwc2UiLCJfY29sbGFwc2VUYWIiLCIkb2xkVGFiIiwiJHRhYkxpbmsiLCIkdGFyZ2V0Q29udGVudCIsIl9vcGVuVGFiIiwicGFuZWxBY3RpdmVDbGFzcyIsIiR0YXJnZXRfYW5jaG9yIiwiaWRTdHIiLCJwYW5lbENsYXNzIiwicGFuZWwiLCJ0ZW1wIiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsImRlZmluZVByb3BlcnR5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfdHlwZW9mIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJvYmoiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsInJvb3QiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwiZXhwb3J0cyIsIm1vZHVsZSIsIkxhenlMb2FkIiwiX3N1cHBvcnRzU2Nyb2xsIiwiX2dldFRvcE9mZnNldCIsIm93bmVyRG9jdW1lbnQiLCJjbGllbnRUb3AiLCJfaXNCZWxvd1ZpZXdwb3J0IiwiY29udGFpbmVyIiwidGhyZXNob2xkIiwiZm9sZCIsImlubmVySGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwiX2dldExlZnRPZmZzZXQiLCJjbGllbnRMZWZ0IiwiX2lzQXRSaWdodE9mVmlld3BvcnQiLCJkb2N1bWVudFdpZHRoIiwiaW5uZXJXaWR0aCIsIl9pc0Fib3ZlVmlld3BvcnQiLCJfaXNBdExlZnRPZlZpZXdwb3J0IiwiX2lzSW5zaWRlVmlld3BvcnQiLCJfY2FsbENhbGxiYWNrIiwiYXJndW1lbnQiLCJfZGVmYXVsdFNldHRpbmdzIiwiZWxlbWVudHNfc2VsZWN0b3IiLCJkYXRhX3NyYyIsImRhdGFfc3Jjc2V0IiwiY2xhc3NfbG9hZGluZyIsImNsYXNzX2xvYWRlZCIsImNsYXNzX2Vycm9yIiwic2tpcF9pbnZpc2libGUiLCJjYWxsYmFja19sb2FkIiwiY2FsbGJhY2tfZXJyb3IiLCJjYWxsYmFja19zZXQiLCJjYWxsYmFja19wcm9jZXNzZWQiLCJpbnN0YW5jZVNldHRpbmdzIiwiX3NldHRpbmdzIiwiYXNzaWduIiwiX3F1ZXJ5T3JpZ2luTm9kZSIsIl9wcmV2aW91c0xvb3BUaW1lIiwiX2xvb3BUaW1lb3V0IiwiX2JvdW5kSGFuZGxlU2Nyb2xsIiwiaGFuZGxlU2Nyb2xsIiwidXBkYXRlIiwiX3NldFNvdXJjZXNGb3JQaWN0dXJlIiwic3Jjc2V0RGF0YUF0dHJpYnV0ZSIsInBhcmVudEVsZW1lbnQiLCJ0YWdOYW1lIiwicGljdHVyZUNoaWxkIiwic291cmNlU3Jjc2V0IiwiZ2V0QXR0cmlidXRlIiwiX3NldFNvdXJjZXMiLCJzcmNEYXRhQXR0cmlidXRlIiwiZWxlbWVudFNyYyIsImltZ1NyY3NldCIsImJhY2tncm91bmRJbWFnZSIsIl9zaG93T25BcHBlYXIiLCJzZXR0aW5ncyIsImVycm9yQ2FsbGJhY2siLCJsb2FkQ2FsbGJhY2siLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhZGQiLCJfbG9vcFRocm91Z2hFbGVtZW50cyIsImVsZW1lbnRzIiwiX2VsZW1lbnRzIiwiZWxlbWVudHNMZW5ndGgiLCJwcm9jZXNzZWRJbmRleGVzIiwib2Zmc2V0UGFyZW50Iiwid2FzUHJvY2Vzc2VkIiwicG9wIiwiX3N0b3BTY3JvbGxIYW5kbGVyIiwiX3B1cmdlRWxlbWVudHMiLCJlbGVtZW50c1RvUHVyZ2UiLCJfc3RhcnRTY3JvbGxIYW5kbGVyIiwiX2lzSGFuZGxpbmdTY3JvbGwiLCJyZW1haW5pbmdUaW1lIiwiZGVzdHJveSIsInJlcXVpcmUiLCJqUXVlcnlCcmlkZ2V0IiwibyIsImEiLCJsIiwibiIsInMiLCJoIiwiciIsImMiLCJjaGFyQXQiLCJkIiwib3B0aW9uIiwiaXNQbGFpbk9iamVjdCIsImJyaWRnZXQiLCJFdkVtaXR0ZXIiLCJvbmNlIiwiX29uY2VFdmVudHMiLCJlbWl0RXZlbnQiLCJnZXRTaXplIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwicGFkZGluZyIsImJvcmRlclN0eWxlIiwiYm9yZGVyV2lkdGgiLCJib3hTaXppbmciLCJhcHBlbmRDaGlsZCIsImlzQm94U2l6ZU91dGVyIiwicmVtb3ZlQ2hpbGQiLCJxdWVyeVNlbGVjdG9yIiwibm9kZVR5cGUiLCJkaXNwbGF5IiwiaXNCb3JkZXJCb3giLCJ1IiwiZiIsInYiLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCIsImciLCJwYWRkaW5nVG9wIiwicGFkZGluZ0JvdHRvbSIsIm0iLCJtYXJnaW5MZWZ0IiwibWFyZ2luUmlnaHQiLCJtYXJnaW5Ub3AiLCJtYXJnaW5Cb3R0b20iLCJTIiwiYm9yZGVyTGVmdFdpZHRoIiwiYm9yZGVyUmlnaHRXaWR0aCIsIkUiLCJib3JkZXJUb3BXaWR0aCIsImJvcmRlckJvdHRvbVdpZHRoIiwiYiIsIkMiLCJtYXRjaGVzU2VsZWN0b3IiLCJFbGVtZW50IiwiZml6enlVSVV0aWxzIiwibW9kdWxvIiwibWFrZUFycmF5IiwicmVtb3ZlRnJvbSIsImdldFBhcmVudCIsImdldFF1ZXJ5RWxlbWVudCIsImhhbmRsZUV2ZW50IiwiZmlsdGVyRmluZEVsZW1lbnRzIiwiSFRNTEVsZW1lbnQiLCJkZWJvdW5jZU1ldGhvZCIsImRvY1JlYWR5IiwidG9EYXNoZWQiLCJodG1sSW5pdCIsIkpTT04iLCJwYXJzZSIsIkZsaWNraXR5IiwiQ2VsbCIsImNyZWF0ZSIsInNoaWZ0Iiwib3JpZ2luU2lkZSIsInNldFBvc2l0aW9uIiwidXBkYXRlVGFyZ2V0IiwicmVuZGVyUG9zaXRpb24iLCJzZXREZWZhdWx0VGFyZ2V0IiwiY2VsbEFsaWduIiwiZ2V0UG9zaXRpb25WYWx1ZSIsIndyYXBTaGlmdCIsInNsaWRlYWJsZVdpZHRoIiwiU2xpZGUiLCJpc09yaWdpbkxlZnQiLCJjZWxscyIsImFkZENlbGwiLCJmaXJzdE1hcmdpbiIsImdldExhc3RDZWxsIiwic2VsZWN0IiwiY2hhbmdlU2VsZWN0ZWRDbGFzcyIsInVuc2VsZWN0IiwiZ2V0Q2VsbEVsZW1lbnRzIiwiYW5pbWF0ZVByb3RvdHlwZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0YXJ0QW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJyZXN0aW5nRnJhbWVzIiwiYXBwbHlEcmFnRm9yY2UiLCJhcHBseVNlbGVjdGVkQXR0cmFjdGlvbiIsImludGVncmF0ZVBoeXNpY3MiLCJwb3NpdGlvblNsaWRlciIsInNldHRsZSIsInRyYW5zZm9ybSIsIndyYXBBcm91bmQiLCJzaGlmdFdyYXBDZWxscyIsImN1cnNvclBvc2l0aW9uIiwicmlnaHRUb0xlZnQiLCJzbGlkZXIiLCJzbGlkZXMiLCJzbGlkZXNXaWR0aCIsInBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCIsInNlbGVjdGVkU2xpZGUiLCJwZXJjZW50UG9zaXRpb24iLCJpc1BvaW50ZXJEb3duIiwiaXNGcmVlU2Nyb2xsaW5nIiwiX3NoaWZ0Q2VsbHMiLCJiZWZvcmVTaGlmdENlbGxzIiwiYWZ0ZXJTaGlmdENlbGxzIiwiX3Vuc2hpZnRDZWxscyIsInZlbG9jaXR5IiwiZ2V0RnJpY3Rpb25GYWN0b3IiLCJhcHBseUZvcmNlIiwiZ2V0UmVzdGluZ1Bvc2l0aW9uIiwiZHJhZ1giLCJzZWxlY3RlZEF0dHJhY3Rpb24iLCJmbGlja2l0eUdVSUQiLCJfY3JlYXRlIiwiYWNjZXNzaWJpbGl0eSIsImZyZWVTY3JvbGxGcmljdGlvbiIsImZyaWN0aW9uIiwibmFtZXNwYWNlSlF1ZXJ5RXZlbnRzIiwicmVzaXplIiwic2V0R2FsbGVyeVNpemUiLCJjcmVhdGVNZXRob2RzIiwiZ3VpZCIsInNlbGVjdGVkSW5kZXgiLCJ2aWV3cG9ydCIsIl9jcmVhdGVTbGlkZXIiLCJ3YXRjaENTUyIsImFjdGl2YXRlIiwiX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMiLCJyZWxvYWRDZWxscyIsInRhYkluZGV4IiwiaW5pdGlhbEluZGV4IiwiaXNJbml0QWN0aXZhdGVkIiwiY2VsbFNlbGVjdG9yIiwiX21ha2VDZWxscyIsInBvc2l0aW9uQ2VsbHMiLCJfZ2V0V3JhcFNoaWZ0Q2VsbHMiLCJnZXRMYXN0U2xpZGUiLCJfc2l6ZUNlbGxzIiwiX3Bvc2l0aW9uQ2VsbHMiLCJtYXhDZWxsSGVpZ2h0IiwidXBkYXRlU2xpZGVzIiwiX2NvbnRhaW5TbGlkZXMiLCJfZ2V0Q2FuQ2VsbEZpdCIsInVwZGF0ZVNlbGVjdGVkU2xpZGUiLCJncm91cENlbGxzIiwicGFyc2VJbnQiLCJyZXBvc2l0aW9uIiwic2V0Q2VsbEFsaWduIiwiY2VudGVyIiwiYWRhcHRpdmVIZWlnaHQiLCJfZ2V0R2FwQ2VsbHMiLCJjb250YWluIiwiRXZlbnQiLCJfd3JhcFNlbGVjdCIsImlzRHJhZ1NlbGVjdCIsInVuc2VsZWN0U2VsZWN0ZWRTbGlkZSIsInNlbGVjdGVkQ2VsbHMiLCJzZWxlY3RlZEVsZW1lbnRzIiwic2VsZWN0ZWRDZWxsIiwic2VsZWN0ZWRFbGVtZW50Iiwic2VsZWN0Q2VsbCIsImdldENlbGwiLCJnZXRDZWxscyIsImdldFBhcmVudENlbGwiLCJnZXRBZGphY2VudENlbGxFbGVtZW50cyIsInVpQ2hhbmdlIiwiY2hpbGRVSVBvaW50ZXJEb3duIiwib25yZXNpemUiLCJjb250ZW50IiwiZGVhY3RpdmF0ZSIsIm9ua2V5ZG93biIsImFjdGl2ZUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJVbmlwb2ludGVyIiwiYmluZFN0YXJ0RXZlbnQiLCJfYmluZFN0YXJ0RXZlbnQiLCJ1bmJpbmRTdGFydEV2ZW50IiwicG9pbnRlckVuYWJsZWQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0VG91Y2giLCJpZGVudGlmaWVyIiwicG9pbnRlcklkZW50aWZpZXIiLCJvbm1vdXNlZG93biIsImJ1dHRvbiIsIl9wb2ludGVyRG93biIsIm9udG91Y2hzdGFydCIsIm9uTVNQb2ludGVyRG93biIsIm9ucG9pbnRlcmRvd24iLCJwb2ludGVySWQiLCJwb2ludGVyRG93biIsIl9iaW5kUG9zdFN0YXJ0RXZlbnRzIiwibW91c2Vkb3duIiwicG9pbnRlcmRvd24iLCJNU1BvaW50ZXJEb3duIiwiX2JvdW5kUG9pbnRlckV2ZW50cyIsIl91bmJpbmRQb3N0U3RhcnRFdmVudHMiLCJvbm1vdXNlbW92ZSIsIl9wb2ludGVyTW92ZSIsIm9uTVNQb2ludGVyTW92ZSIsIm9ucG9pbnRlcm1vdmUiLCJvbnRvdWNobW92ZSIsInBvaW50ZXJNb3ZlIiwib25tb3VzZXVwIiwiX3BvaW50ZXJVcCIsIm9uTVNQb2ludGVyVXAiLCJvbnBvaW50ZXJ1cCIsIm9udG91Y2hlbmQiLCJfcG9pbnRlckRvbmUiLCJwb2ludGVyVXAiLCJwb2ludGVyRG9uZSIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib25wb2ludGVyY2FuY2VsIiwiX3BvaW50ZXJDYW5jZWwiLCJvbnRvdWNoY2FuY2VsIiwicG9pbnRlckNhbmNlbCIsImdldFBvaW50ZXJQb2ludCIsIlVuaWRyYWdnZXIiLCJiaW5kSGFuZGxlcyIsIl9iaW5kSGFuZGxlcyIsInVuYmluZEhhbmRsZXMiLCJ0b3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJoYW5kbGVzIiwiX2RyYWdQb2ludGVyRG93biIsImJsdXIiLCJwb2ludGVyRG93blBvaW50IiwiY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duIiwiX2RyYWdQb2ludGVyTW92ZSIsIl9kcmFnTW92ZSIsImlzRHJhZ2dpbmciLCJoYXNEcmFnU3RhcnRlZCIsIl9kcmFnU3RhcnQiLCJfZHJhZ1BvaW50ZXJVcCIsIl9kcmFnRW5kIiwiX3N0YXRpY0NsaWNrIiwiZHJhZ1N0YXJ0UG9pbnQiLCJpc1ByZXZlbnRpbmdDbGlja3MiLCJkcmFnU3RhcnQiLCJkcmFnTW92ZSIsImRyYWdFbmQiLCJvbmNsaWNrIiwiaXNJZ25vcmluZ01vdXNlVXAiLCJzdGF0aWNDbGljayIsImRyYWdnYWJsZSIsImRyYWdUaHJlc2hvbGQiLCJfY3JlYXRlRHJhZyIsImJpbmREcmFnIiwiX3VpQ2hhbmdlRHJhZyIsIl9jaGlsZFVJUG9pbnRlckRvd25EcmFnIiwidW5iaW5kRHJhZyIsImlzRHJhZ0JvdW5kIiwicG9pbnRlckRvd25Gb2N1cyIsIlRFWFRBUkVBIiwiSU5QVVQiLCJPUFRJT04iLCJyYWRpbyIsImNoZWNrYm94Iiwic3VibWl0IiwiaW1hZ2UiLCJmaWxlIiwicG9pbnRlckRvd25TY3JvbGwiLCJTRUxFQ1QiLCJpc1RvdWNoU2Nyb2xsaW5nIiwiZHJhZ1N0YXJ0UG9zaXRpb24iLCJwcmV2aW91c0RyYWdYIiwiZHJhZ01vdmVUaW1lIiwiZnJlZVNjcm9sbCIsImRyYWdFbmRSZXN0aW5nU2VsZWN0IiwiZHJhZ0VuZEJvb3N0U2VsZWN0IiwiZ2V0U2xpZGVEaXN0YW5jZSIsIl9nZXRDbG9zZXN0UmVzdGluZyIsImRpc3RhbmNlIiwiaW5kZXgiLCJmbG9vciIsIm9uc2Nyb2xsIiwiVGFwTGlzdGVuZXIiLCJiaW5kVGFwIiwidW5iaW5kVGFwIiwidGFwRWxlbWVudCIsImRpcmVjdGlvbiIsIngwIiwieDEiLCJ5MSIsIngyIiwieTIiLCJ4MyIsImlzRW5hYmxlZCIsImlzUHJldmlvdXMiLCJpc0xlZnQiLCJkaXNhYmxlIiwiY3JlYXRlU1ZHIiwib25UYXAiLCJjcmVhdGVFbGVtZW50TlMiLCJhcnJvd1NoYXBlIiwiZW5hYmxlIiwiZGlzYWJsZWQiLCJwcmV2TmV4dEJ1dHRvbnMiLCJfY3JlYXRlUHJldk5leHRCdXR0b25zIiwicHJldkJ1dHRvbiIsIm5leHRCdXR0b24iLCJhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsImRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJQcmV2TmV4dEJ1dHRvbiIsImhvbGRlciIsImRvdHMiLCJzZXREb3RzIiwiYWRkRG90cyIsInJlbW92ZURvdHMiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwidXBkYXRlU2VsZWN0ZWQiLCJzZWxlY3RlZERvdCIsIlBhZ2VEb3RzIiwicGFnZURvdHMiLCJfY3JlYXRlUGFnZURvdHMiLCJhY3RpdmF0ZVBhZ2VEb3RzIiwidXBkYXRlU2VsZWN0ZWRQYWdlRG90cyIsInVwZGF0ZVBhZ2VEb3RzIiwiZGVhY3RpdmF0ZVBhZ2VEb3RzIiwic3RhdGUiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwib25WaXNpYmlsaXR5UGxheSIsInZpc2liaWxpdHlQbGF5IiwicGxheSIsInRpY2siLCJhdXRvUGxheSIsImNsZWFyIiwidGltZW91dCIsInVucGF1c2UiLCJwYXVzZUF1dG9QbGF5T25Ib3ZlciIsIl9jcmVhdGVQbGF5ZXIiLCJwbGF5ZXIiLCJhY3RpdmF0ZVBsYXllciIsInN0b3BQbGF5ZXIiLCJkZWFjdGl2YXRlUGxheWVyIiwicGxheVBsYXllciIsInBhdXNlUGxheWVyIiwidW5wYXVzZVBsYXllciIsIm9ubW91c2VlbnRlciIsIm9ubW91c2VsZWF2ZSIsIlBsYXllciIsImluc2VydCIsIl9jZWxsQWRkZWRSZW1vdmVkIiwicHJlcGVuZCIsImNlbGxDaGFuZ2UiLCJjZWxsU2l6ZUNoYW5nZSIsImltZyIsImZsaWNraXR5IiwiX2NyZWF0ZUxhenlsb2FkIiwibGF6eUxvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwiTGF6eUxvYWRlciIsIl9jcmVhdGVBc05hdkZvciIsImFjdGl2YXRlQXNOYXZGb3IiLCJkZWFjdGl2YXRlQXNOYXZGb3IiLCJkZXN0cm95QXNOYXZGb3IiLCJhc05hdkZvciIsInNldE5hdkNvbXBhbmlvbiIsIm5hdkNvbXBhbmlvbiIsIm9uTmF2Q29tcGFuaW9uU2VsZWN0IiwibmF2Q29tcGFuaW9uU2VsZWN0Iiwib25OYXZTdGF0aWNDbGljayIsInJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMiLCJuYXZTZWxlY3RlZEVsZW1lbnRzIiwiY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyIsImltYWdlc0xvYWRlZCIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwidXJsIiwiSW1hZ2UiLCJhZGRFbGVtZW50SW1hZ2VzIiwiYWRkSW1hZ2UiLCJiYWNrZ3JvdW5kIiwiYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMiLCJhZGRCYWNrZ3JvdW5kIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc2VkQ291bnQiLCJoYXNBbnlCcm9rZW4iLCJpc0xvYWRlZCIsIm5vdGlmeSIsImRlYnVnIiwibG9nIiwiaXNDb21wbGV0ZSIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwidW5iaW5kRXZlbnRzIiwibWFrZUpRdWVyeVBsdWdpbiIsInByb21pc2UiLCJfY3JlYXRlSW1hZ2VzTG9hZGVkIiwidXRpbHMiLCJwcm90byIsIl9jcmVhdGVCZ0xhenlMb2FkIiwiYmdMYXp5TG9hZCIsImFkakNvdW50IiwiY2VsbEVsZW1zIiwiY2VsbEVsZW0iLCJiZ0xhenlMb2FkRWxlbSIsImoiLCJCZ0xhenlMb2FkZXIiLCJlc2NhcGVSZWdFeENoYXJzIiwiY3JlYXRlTm9kZSIsImNvbnRhaW5lckNsYXNzIiwiZGl2IiwiRVNDIiwiVEFCIiwiUkVUVVJOIiwiTEVGVCIsIlVQIiwiUklHSFQiLCJET1dOIiwiQXV0b2NvbXBsZXRlIiwidGhhdCIsImFqYXhTZXR0aW5ncyIsImF1dG9TZWxlY3RGaXJzdCIsInNlcnZpY2VVcmwiLCJsb29rdXAiLCJvblNlbGVjdCIsIm1pbkNoYXJzIiwibWF4SGVpZ2h0IiwiZGVmZXJSZXF1ZXN0QnkiLCJwYXJhbXMiLCJmb3JtYXRSZXN1bHQiLCJkZWxpbWl0ZXIiLCJ6SW5kZXgiLCJub0NhY2hlIiwib25TZWFyY2hTdGFydCIsIm9uU2VhcmNoQ29tcGxldGUiLCJvblNlYXJjaEVycm9yIiwicHJlc2VydmVJbnB1dCIsInRhYkRpc2FibGVkIiwiZGF0YVR5cGUiLCJjdXJyZW50UmVxdWVzdCIsInRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQiLCJwcmV2ZW50QmFkUXVlcmllcyIsImxvb2t1cEZpbHRlciIsInN1Z2dlc3Rpb24iLCJvcmlnaW5hbFF1ZXJ5IiwicXVlcnlMb3dlckNhc2UiLCJwYXJhbU5hbWUiLCJ0cmFuc2Zvcm1SZXN1bHQiLCJwYXJzZUpTT04iLCJzaG93Tm9TdWdnZXN0aW9uTm90aWNlIiwibm9TdWdnZXN0aW9uTm90aWNlIiwib3JpZW50YXRpb24iLCJmb3JjZUZpeFBvc2l0aW9uIiwic3VnZ2VzdGlvbnMiLCJiYWRRdWVyaWVzIiwiY3VycmVudFZhbHVlIiwiaW50ZXJ2YWxJZCIsImNhY2hlZFJlc3BvbnNlIiwib25DaGFuZ2VJbnRlcnZhbCIsIm9uQ2hhbmdlIiwiaXNMb2NhbCIsInN1Z2dlc3Rpb25zQ29udGFpbmVyIiwibm9TdWdnZXN0aW9uc0NvbnRhaW5lciIsImNsYXNzZXMiLCJzZWxlY3RlZCIsImhpbnQiLCJoaW50VmFsdWUiLCJzZWxlY3Rpb24iLCJpbml0aWFsaXplIiwic2V0T3B0aW9ucyIsInBhdHRlcm4iLCJraWxsZXJGbiIsInN1Z2dlc3Rpb25TZWxlY3RvciIsImtpbGxTdWdnZXN0aW9ucyIsImRpc2FibGVLaWxsZXJGbiIsImZpeFBvc2l0aW9uQ2FwdHVyZSIsInZpc2libGUiLCJmaXhQb3NpdGlvbiIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwib25CbHVyIiwib25Gb2N1cyIsIm9uVmFsdWVDaGFuZ2UiLCJlbmFibGVLaWxsZXJGbiIsImFib3J0QWpheCIsImFib3J0Iiwic3VwcGxpZWRPcHRpb25zIiwidmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQiLCJ2YWxpZGF0ZU9yaWVudGF0aW9uIiwiY2xlYXJDYWNoZSIsImNsZWFySW50ZXJ2YWwiLCIkY29udGFpbmVyIiwiY29udGFpbmVyUGFyZW50Iiwic2l0ZVNlYXJjaERpdiIsImNvbnRhaW5lckhlaWdodCIsInN0eWxlcyIsInZpZXdQb3J0SGVpZ2h0IiwidG9wT3ZlcmZsb3ciLCJib3R0b21PdmVyZmxvdyIsIm9wYWNpdHkiLCJwYXJlbnRPZmZzZXREaWZmIiwic3RvcEtpbGxTdWdnZXN0aW9ucyIsInNldEludGVydmFsIiwiaXNDdXJzb3JBdEVuZCIsInZhbExlbmd0aCIsInNlbGVjdGlvblN0YXJ0IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsIm1vdmVTdGFydCIsInN1Z2dlc3QiLCJvbkhpbnQiLCJzZWxlY3RIaW50IiwibW92ZVVwIiwibW92ZURvd24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJmaW5kQmVzdEhpbnQiLCJnZXRRdWVyeSIsIm9uSW52YWxpZGF0ZVNlbGVjdGlvbiIsImlzRXhhY3RNYXRjaCIsImdldFN1Z2dlc3Rpb25zIiwiZ2V0U3VnZ2VzdGlvbnNMb2NhbCIsImxpbWl0IiwibG9va3VwTGltaXQiLCJncmVwIiwicSIsImNhY2hlS2V5IiwiaWdub3JlUGFyYW1zIiwiaXNGdW5jdGlvbiIsImlzQmFkUXVlcnkiLCJhamF4IiwiZG9uZSIsInJlc3VsdCIsInByb2Nlc3NSZXNwb25zZSIsImZhaWwiLCJqcVhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIm9uSGlkZSIsInNpZ25hbEhpbnQiLCJub1N1Z2dlc3Rpb25zIiwiZ3JvdXBCeSIsImNsYXNzU2VsZWN0ZWQiLCJiZWZvcmVSZW5kZXIiLCJjYXRlZ29yeSIsImZvcm1hdEdyb3VwIiwiY3VycmVudENhdGVnb3J5IiwiYWRqdXN0Q29udGFpbmVyV2lkdGgiLCJkZXRhY2giLCJlbXB0eSIsImJlc3RNYXRjaCIsImZvdW5kTWF0Y2giLCJzdWJzdHIiLCJmYWxsYmFjayIsImluQXJyYXkiLCJhY3RpdmVJdGVtIiwiYWRqdXN0U2Nyb2xsIiwib2Zmc2V0VG9wIiwidXBwZXJCb3VuZCIsImxvd2VyQm91bmQiLCJoZWlnaHREZWx0YSIsImdldFZhbHVlIiwib25TZWxlY3RDYWxsYmFjayIsImRpc3Bvc2UiLCJhdXRvY29tcGxldGUiLCJkZXZicmlkZ2VBdXRvY29tcGxldGUiLCJkYXRhS2V5IiwiaW5wdXRFbGVtZW50IiwiYmFzZXMiLCJiYXNlSHJlZiIsImhyZWYiLCJteUxhenlMb2FkIiwiJGNhcm91c2VsIiwiJGltZ3MiLCJkb2NTdHlsZSIsInRyYW5zZm9ybVByb3AiLCJmbGt0eSIsInNsaWRlIiwiY2xpY2siLCIkZ2FsbGVyeSIsIm9uTG9hZGVkZGF0YSIsImNlbGwiLCJ2aWRlbyIsIiRzbGlkZXNob3ciLCJzbGlkZXNob3dmbGsiLCJ3cmFwIiwid2hhdElucHV0IiwiYXNrIiwidG9nZ2xlQ2xhc3MiLCJ0b2dnbGVTZWFyY2hDbGFzc2VzIiwidG9nZ2xlTW9iaWxlTWVudUNsYXNzZXMiLCJnZXRFbGVtZW50QnlJZCIsImZvY3Vzb3V0Iiwib2xkU2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaFZBLENBQUMsVUFBU0EsQ0FBVCxFQUFZOztBQUViOztBQUVBLE1BQUlDLHFCQUFxQixPQUF6Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsYUFBYTtBQUNmQyxhQUFTRixrQkFETTs7QUFHZjs7O0FBR0FHLGNBQVUsRUFOSzs7QUFRZjs7O0FBR0FDLFlBQVEsRUFYTzs7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LEtBQUYsRUFBUytoQyxJQUFULEVBQWVuNEIsTUFBZixFQUFiO0FBQ0FtNEIsTUFBSzc0QixNQUFMLEdBQWM4SSxRQUFkLENBQXVCLElBQXZCO0FBQ0ErdkIsTUFBSzc0QixNQUFMLEdBQWNvMEIsT0FBZCxDQUFzQixrRkFBa0YyTyxLQUFsRixHQUEwRiw0QkFBMUYsR0FBeUhwaUMsS0FBekgsR0FBaUksWUFBakksR0FBZ0pELE1BQWhKLEdBQXlKLDRGQUEvSztBQUNBbTRCLE1BQUsxdkIsSUFBTDtBQUNBbk8sR0FBRXVKLGNBQUY7QUFDQSxDQVREOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUEvVEEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMC42XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVmFyaWFibGVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gW1xuXHQgICAgJ2lucHV0Jyxcblx0ICAgICdzZWxlY3QnLFxuXHQgICAgJ3RleHRhcmVhJ1xuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gW1xuXHQgICAgMTYsIC8vIHNoaWZ0XG5cdCAgICAxNywgLy8gY29udHJvbFxuXHQgICAgMTgsIC8vIGFsdFxuXHQgICAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICAgIDkzICAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICAna2V5dXAnOiAna2V5Ym9hcmQnLFxuXHQgICAgJ21vdXNlZG93bic6ICdtb3VzZScsXG5cdCAgICAnbW91c2Vtb3ZlJzogJ21vdXNlJyxcblx0ICAgICdNU1BvaW50ZXJEb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ01TUG9pbnRlck1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcmRvd24nOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcm1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAndG91Y2hzdGFydCc6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgLy8gdG91Y2ggYnVmZmVyIHRpbWVyXG5cdCAgdmFyIHRvdWNoVGltZXIgPSBudWxsO1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBTZXQgdXBcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBFdmVudHNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChcblx0ICAgICAgICBjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8XG5cdCAgICAgICAgY3VycmVudEludGVudCAhPT0gdmFsdWVcblx0ICAgICAgKSB7XG5cblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gKFxuXHQgICAgICAgICAgYWN0aXZlRWxlbSAmJlxuXHQgICAgICAgICAgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJlxuXHQgICAgICAgICAgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xXG5cdCAgICAgICAgKSA/IHRydWUgOiBmYWxzZTtcblxuXHQgICAgICAgIGlmIChcblx0ICAgICAgICAgIHZhbHVlID09PSAndG91Y2gnIHx8XG5cblx0ICAgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgICAodmFsdWUgPT09ICdtb3VzZScgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkgfHxcblxuXHQgICAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgICAodmFsdWUgPT09ICdrZXlib2FyZCcgJiYgYWN0aXZlSW5wdXQpXG5cdCAgICAgICAgKSB7XG5cblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24oKSB7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBjbGVhciB0aGUgdGltZXIgaWYgaXQgaGFwcGVucyB0byBiZSBydW5uaW5nXG5cdCAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvdWNoVGltZXIpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblxuXHQgICAgLy8gc2V0IHRoZSBpc0J1ZmZlcmluZyB0byBgdHJ1ZWBcblx0ICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblxuXHQgICAgLy8gcnVuIHRoZSB0aW1lclxuXHQgICAgdG91Y2hUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdCAgICAgIC8vIGlmIHRoZSB0aW1lciBydW5zIG91dCwgc2V0IGlzQnVmZmVyaW5nIGJhY2sgdG8gYGZhbHNlYFxuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXHQgICAgfSwgMjAwKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBVdGlsaXRpZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbihldmVudCkge1xuXHQgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nKSA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTsgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpID9cblx0ICAgICAgJ3doZWVsJyA6IC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXG5cdCAgICAgIGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID9cblx0ICAgICAgICAnbW91c2V3aGVlbCcgOiAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgICAnRE9NTW91c2VTY3JvbGwnOyAvLyBsZXQncyBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBJbml0XG5cblx0ICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgICAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIGlmIChcblx0ICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiZcblx0ICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG5cdCAgKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgQVBJXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgcmV0dXJuIHtcblxuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gKG9wdCA9PT0gJ2xvb3NlJykgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0OyB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24oKSB7IHJldHVybiBpbnB1dFR5cGVzOyB9XG5cblx0ICB9O1xuXG5cdH0oKSk7XG5cblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpeyByZXR1cm4gZmFsc2U7IH1cbiAgbGV0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuXG5cdCAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuXHRcdCAgfVxuXHRcdCAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuXHRcdCAgIH1cblx0XHQgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcblx0XHQgIH1cblx0XHQgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy9ub3RoaW5nXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIC8vZm9yIGVhY2ggZWxlbWVudCB0aGF0IG5lZWRzIHRvIGxpc3RlbiBmb3IgcmVzaXppbmcsIHNjcm9sbGluZywgb3IgbXV0YXRpb24gYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZShub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBbUEhdXG4vLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xuRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4vLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpIHtcbiAgICAgIHZhciAkZWwgPSAkKGVsKSxcbiAgICAgICAgICAkY29udGVudCA9ICRlbC5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICAkY29udGVudC5hdHRyKHsncm9sZSc6ICd0YWJwYW5lbCcsICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWQsICdhcmlhLWhpZGRlbic6IHRydWUsICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IHRydWU7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKSxcbiAgICAgICAgJGFuY2hvciA9ICQoYW5jaG9yKTtcblxuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoICYmICRhbmNob3IpIHtcbiAgICAgICAgICBpZiAoISRsaW5rLnBhcmVudCgnW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJykuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oJGFuY2hvciwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3RoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYuYWNjb3JkaW9uJywgWyRsaW5rLCAkYW5jaG9yXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIGFjY29yZGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJHRhYkNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICRlbGVtLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb24ga2V5ZG93bi56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBjb250ZW50IHBhbmUncyBvcGVuL2Nsb3NlIHN0YXRlLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIGpRdWVyeSBvYmplY3Qgb2YgdGhlIHBhbmUgdG8gdG9nZ2xlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCR0YXJnZXQpIHtcbiAgICBpZigkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgdGhpcy51cCgkdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgIH1cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5wcmV2KCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgYWNjb3JkaW9uIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gcGFuZSB0byBvcGVuIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3RUaW1lIC0gZmxhZyB0byBkZXRlcm1pbmUgaWYgcmVmbG93IHNob3VsZCBoYXBwZW4uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZG93blxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRvd24oJHRhcmdldCwgZmlyc3RUaW1lKSB7XG4gICAgJHRhcmdldFxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpXG4gICAgICAucGFyZW50KCdbZGF0YS10YWItY29udGVudF0nKVxuICAgICAgLmFkZEJhY2soKVxuICAgICAgLnBhcmVudCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kICYmICFmaXJzdFRpbWUpIHtcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJGN1cnJlbnRBY3RpdmUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMudXAoJGN1cnJlbnRBY3RpdmUubm90KCR0YXJnZXQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkdGFyZ2V0LnNsaWRlRG93bih0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgKCkgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkb3duXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZG93bi56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogdHJ1ZSxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiB0YWIgdG8gY2xvc2UgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZpcmVzIEFjY29yZGlvbiN1cFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHVwKCR0YXJnZXQpIHtcbiAgICB2YXIgJGF1bnRzID0gJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZigoIXRoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCAmJiAhJGF1bnRzLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkgfHwgISR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZVVwKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgJHRhcmdldC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgICAgICAgIC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZGVzdHJveWVkXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLnN0b3AodHJ1ZSkuc2xpZGVVcCgwKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykub2ZmKCcuemYuYWNjb3JkaW9uJyk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtdWx0aUV4cGFuZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGNsb3NlIGFsbCBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgYWNjb3JkaW9uIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gYWNjb3JkaW9uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogSW50ZXJjaGFuZ2UgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmludGVyY2hhbmdlXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxuICovXG5cbmNsYXNzIEludGVyY2hhbmdlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgSW50ZXJjaGFuZ2UuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEludGVyY2hhbmdlLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50UGF0aCA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnSW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgSW50ZXJjaGFuZ2UgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IGludGVyY2hhbmdlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fYWRkQnJlYWtwb2ludHMoKTtcbiAgICB0aGlzLl9nZW5lcmF0ZVJ1bGVzKCk7XG4gICAgdGhpcy5fcmVmbG93KCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBJbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLmludGVyY2hhbmdlJywgRm91bmRhdGlvbi51dGlsLnRocm90dGxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3JlZmxvdygpO1xuICAgIH0sIDUwKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlLCBidXQgb25seSBzYXZlIHRoZSBsYXN0IG1hdGNoXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnJ1bGVzKSB7XG4gICAgICBpZih0aGlzLnJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gdGhpcy5ydWxlc1tpXTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHJ1bGUucXVlcnkpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHRoaXMucmVwbGFjZShtYXRjaC5wYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCcmVha3BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpIGluIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXNbaV07XG4gICAgICAgIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeS5uYW1lXSA9IHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIEludGVyY2hhbmdlIGVsZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBtZWRpYSBxdWVyeSArIGNvbnRlbnQgcGFpcmluZ3NcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0aGF0IGlzIGFuIEludGVyY2hhbmdlIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcbiAgICovXG4gIF9nZW5lcmF0ZVJ1bGVzKGVsZW1lbnQpIHtcbiAgICB2YXIgcnVsZXNMaXN0ID0gW107XG4gICAgdmFyIHJ1bGVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ydWxlcykge1xuICAgICAgcnVsZXMgPSB0aGlzLm9wdGlvbnMucnVsZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ2ludGVyY2hhbmdlJyk7XG4gICAgfVxuICAgIFxuICAgIHJ1bGVzID0gIHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycgPyBydWxlcy5tYXRjaCgvXFxbLio/XFxdL2cpIDogcnVsZXM7XG5cbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7XG4gICAgICBpZihydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcbiAgICAgICAgdmFyIHBhdGggPSBydWxlLnNsaWNlKDAsIC0xKS5qb2luKCcnKTtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gcnVsZVtydWxlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGlmIChJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldKSB7XG4gICAgICAgICAgcXVlcnkgPSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVsZXNMaXN0LnB1c2goe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgcXVlcnk6IHF1ZXJ5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucnVsZXMgPSBydWxlc0xpc3Q7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBgc3JjYCBwcm9wZXJ0eSBvZiBhbiBpbWFnZSwgb3IgY2hhbmdlIHRoZSBIVE1MIG9mIGEgY29udGFpbmVyLCB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggdG8gdGhlIGltYWdlIG9yIEhUTUwgcGFydGlhbC5cbiAgICogQGZpcmVzIEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAqL1xuICByZXBsYWNlKHBhdGgpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aCA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgdHJpZ2dlciA9ICdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZSc7XG5cbiAgICAvLyBSZXBsYWNpbmcgaW1hZ2VzXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0ubm9kZU5hbWUgPT09ICdJTUcnKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIGJhY2tncm91bmQgaW1hZ2VzXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3xwbmd8c3ZnfHRpZmYpKFs/I10uKik/L2kpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyh7ICdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnK3BhdGgrJyknIH0pXG4gICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBIVE1MXG4gICAgZWxzZSB7XG4gICAgICAkLmdldChwYXRoLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBfdGhpcy4kZWxlbWVudC5odG1sKHJlc3BvbnNlKVxuICAgICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgICAgICAkKHJlc3BvbnNlKS5mb3VuZGF0aW9uKCk7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gY29udGVudCBpbiBhbiBJbnRlcmNoYW5nZSBlbGVtZW50IGlzIGRvbmUgYmVpbmcgbG9hZGVkLlxuICAgICAqIEBldmVudCBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgICAqL1xuICAgIC8vIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBpbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIC8vVE9ETyB0aGlzLlxuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkludGVyY2hhbmdlLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogUnVsZXMgdG8gYmUgYXBwbGllZCB0byBJbnRlcmNoYW5nZSBlbGVtZW50cy4gU2V0IHdpdGggdGhlIGBkYXRhLWludGVyY2hhbmdlYCBhcnJheSBub3RhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P2FycmF5fVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBydWxlczogbnVsbFxufTtcblxuSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTID0ge1xuICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgJ3BvcnRyYWl0JzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAncmV0aW5hJzogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksIG9ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBPZmZDYW52YXMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIE9mZkNhbnZhcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT2ZmQ2FudmFzJywge1xuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICB9KTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKGBpcy10cmFuc2l0aW9uLSR7dGhpcy5vcHRpb25zLnRyYW5zaXRpb259YCk7XG5cbiAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgIHRoaXMuJHRyaWdnZXJzID0gJChkb2N1bWVudClcbiAgICAgIC5maW5kKCdbZGF0YS1vcGVuPVwiJytpZCsnXCJdLCBbZGF0YS1jbG9zZT1cIicraWQrJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJytpZCsnXCJdJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgdGhpcy4kb3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgICBpZihvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJyk7XG4gICAgICAkdGFyZ2V0Lm9uKHsnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7ICRjbG9zZXIuaGlkZSgpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJykub24oe1xuICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICRjbG9zZXIuc2hvdygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgLy8gT25seSByZWFsbHkgd29ya3MgZm9yIHksIG5vdCBzdXJlIGhvdyB0byBleHRlbmQgdG8geCBvciBpZiB3ZSBuZWVkIHRvLlxuICBfcmVjb3JkU2Nyb2xsYWJsZShldmVudCkge1xuICAgIGxldCBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG5cbiAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZSAoY29udGVudCBvdmVyZmxvd3MpLCB0aGVuLi4uXG4gICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIHRvcCwgc2Nyb2xsIGRvd24gb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyB1cFxuICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSAwKSB7XG4gICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBib3R0b20sIHNjcm9sbCB1cCBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIGRvd25cbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQgLSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtLmFsbG93VXAgPSBlbGVtLnNjcm9sbFRvcCA+IDA7XG4gICAgZWxlbS5hbGxvd0Rvd24gPSBlbGVtLnNjcm9sbFRvcCA8IChlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KTtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgfVxuXG4gIF9zdG9wU2Nyb2xsUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuICAgIGxldCB1cCA9IGV2ZW50LnBhZ2VZIDwgZWxlbS5sYXN0WTtcbiAgICBsZXQgZG93biA9ICF1cDtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQucGFnZVk7XG5cbiAgICBpZigodXAgJiYgZWxlbS5hbGxvd1VwKSB8fCAoZG93biAmJiBlbGVtLmFsbG93RG93bikpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNvcGVuZWRcbiAgICovXG4gIG9wZW4oZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgKi9cbiAgICBfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcbiAgICAgICAgLnRyaWdnZXIoJ29wZW5lZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIGFkZCBjbGFzcyBhbmQgZGlzYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ZvY3VzID0gX3RoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYXV0b2ZvY3VzXScpO1xuICAgICAgICBpZiAoY2FudmFzRm9jdXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYW52YXNGb2N1cy5lcSgwKS5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC50cmFwRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYiB0byBmaXJlIGFmdGVyIGNsb3N1cmUuXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjY2xvc2VkXG4gICAqL1xuICBjbG9zZShjYikge1xuICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAqL1xuICAgICAgICAudHJpZ2dlcignY2xvc2VkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgcmVtb3ZlIGNsYXNzIGFuZCByZS1lbmFibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWxlYXNlRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqL1xuICB0b2dnbGUoZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7XG4gICAgICB0aGlzLmNsb3NlKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGlucHV0IHdoZW4gZGV0ZWN0ZWQuIFdoZW4gdGhlIGVzY2FwZSBrZXkgaXMgcHJlc3NlZCwgdGhlIG9mZi1jYW52YXMgbWVudSBjbG9zZXMsIGFuZCBmb2N1cyBpcyByZXN0b3JlZCB0byB0aGUgZWxlbWVudCB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaGFuZGxlS2V5Ym9hcmQoZSkge1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPZmZDYW52YXMnLCB7XG4gICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyLmZvY3VzKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIGhhbmRsZWQ6ICgpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBvZmZjYW52YXMgcGx1Z2luLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5vZmZjYW52YXMnKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5PZmZDYW52YXMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgdXNlciB0byBjbGljayBvdXRzaWRlIG9mIHRoZSBtZW51IHRvIGNsb3NlIGl0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gb3ZlcmxheSBvbiB0b3Agb2YgYFtkYXRhLW9mZi1jYW52YXMtY29udGVudF1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjb250ZW50T3ZlcmxheTogdHJ1ZSxcblxuICAvKipcbiAgICogRW5hYmxlL2Rpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBtYWluIGNvbnRlbnQgd2hlbiBhbiBvZmYgY2FudmFzIHBhbmVsIGlzIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRTY3JvbGw6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIGluIG1zIHRoZSBvcGVuIGFuZCBjbG9zZSB0cmFuc2l0aW9uIHJlcXVpcmVzLiBJZiBub25lIHNlbGVjdGVkLCBwdWxscyBmcm9tIGJvZHkgc3R5bGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMFxuICAgKi9cbiAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBwdXNoXG4gICAqL1xuICB0cmFuc2l0aW9uOiAncHVzaCcsXG5cbiAgLyoqXG4gICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIGZvcmNlVG86IG51bGwsXG5cbiAgLyoqXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAvKipcbiAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIHJldmVhbE9uOiBudWxsLFxuXG4gIC8qKlxuICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCByZXZlYWwtZm9yLVxuICAgKiBAdG9kbyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgKi9cbiAgcmV2ZWFsQ2xhc3M6ICdyZXZlYWwtZm9yLScsXG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIG9wdGlvbmFsIGZvY3VzIHRyYXBwaW5nIHdoZW4gb3BlbmluZyBhbiBvZmZjYW52YXMuIFNldHMgdGFiaW5kZXggb2YgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XSB0byAtMSBmb3IgYWNjZXNzaWJpbGl0eSBwdXJwb3Nlcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHRyYXBGb2N1czogZmFsc2Vcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKE9mZkNhbnZhcywgJ09mZkNhbnZhcycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogVGFicyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24udGFic1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyIGlmIHRhYnMgY29udGFpbiBpbWFnZXNcbiAqL1xuXG5jbGFzcyBUYWJzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGFicy5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBUYWJzI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byB0YWJzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRhYnMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUYWJzJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignVGFicycsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cycsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJ1xuICAgICAgLy8gJ1RBQic6ICduZXh0JyxcbiAgICAgIC8vICdTSElGVF9UQUInOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRhYnMgYnkgc2hvd2luZyBhbmQgZm9jdXNpbmcgKGlmIGF1dG9Gb2N1cz10cnVlKSB0aGUgcHJlc2V0IGFjdGl2ZSB0YWIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHsncm9sZSc6ICd0YWJsaXN0J30pO1xuICAgIHRoaXMuJHRhYlRpdGxlcyA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcbiAgICB0aGlzLiR0YWJDb250ZW50ID0gJChgW2RhdGEtdGFicy1jb250ZW50PVwiJHt0aGlzLiRlbGVtZW50WzBdLmlkfVwiXWApO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgJGxpbmsgPSAkZWxlbS5maW5kKCdhJyksXG4gICAgICAgICAgaXNBY3RpdmUgPSAkZWxlbS5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICBoYXNoID0gJGxpbmtbMF0uaGFzaC5zbGljZSgxKSxcbiAgICAgICAgICBsaW5rSWQgPSAkbGlua1swXS5pZCA/ICRsaW5rWzBdLmlkIDogYCR7aGFzaH0tbGFiZWxgLFxuICAgICAgICAgICR0YWJDb250ZW50ID0gJChgIyR7aGFzaH1gKTtcblxuICAgICAgJGVsZW0uYXR0cih7J3JvbGUnOiAncHJlc2VudGF0aW9uJ30pO1xuXG4gICAgICAkbGluay5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBoYXNoLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGlzQWN0aXZlLFxuICAgICAgICAnaWQnOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICAkdGFiQ29udGVudC5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFicGFuZWwnLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiAhaXNBY3RpdmUsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICBpZihpc0FjdGl2ZSAmJiBfdGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XG4gICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkZWxlbS5vZmZzZXQoKS50b3AgfSwgX3RoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5LCAoKSA9PiB7XG4gICAgICAgICAgICAkbGluay5mb2N1cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kdGFiQ29udGVudC5maW5kKCdpbWcnKTtcblxuICAgICAgaWYgKCRpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgIC8vY3VycmVudCBjb250ZXh0LWJvdW5kIGZ1bmN0aW9uIHRvIG9wZW4gdGFicyBvbiBwYWdlIGxvYWQgb3IgaGlzdG9yeSBwb3BzdGF0ZVxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKTtcbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0VGFiKCQoYW5jaG9yKSwgdHJ1ZSk7XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCB0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjZGVlcGxpbmtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYudGFicycsIFskbGluaywgJChhbmNob3IpXSk7XG4gICAgICAgICB9XG4gICAgICAgfVxuICAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICB0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcbiAgICB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcyk7XG5cbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZENsaWNrSGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9mZignY2xpY2suemYudGFicycpXG4gICAgICAub24oJ2NsaWNrLnpmLnRhYnMnLCBgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCQodGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5vZmYoJ2tleWRvd24uemYudGFicycpLm9uKCdrZXlkb3duLnpmLnRhYnMnLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmIChlLndoaWNoID09PSA5KSByZXR1cm47XG5cblxuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgJGVsZW1lbnRzID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLFxuICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy53cmFwT25LZXlzKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSBpID09PSAwID8gJGVsZW1lbnRzLmxhc3QoKSA6ICRlbGVtZW50cy5lcShpLTEpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gaSA9PT0gJGVsZW1lbnRzLmxlbmd0aCAtMSA/ICRlbGVtZW50cy5maXJzdCgpIDogJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1pbihpKzEsICRlbGVtZW50cy5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnVGFicycsIHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJGVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRwcmV2RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkbmV4dEVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLiBDb2xsYXBzZXMgYWN0aXZlIHRhYi5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gb3Blbi5cbiAgICogQHBhcmFtIHtib29sZWFufSBoaXN0b3J5SGFuZGxlZCAtIGJyb3dzZXIgaGFzIGFscmVhZHkgaGFuZGxlZCBhIGhpc3RvcnkgdXBkYXRlXG4gICAqIEBmaXJlcyBUYWJzI2NoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCwgaGlzdG9yeUhhbmRsZWQpIHtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBhY3RpdmUgY2xhc3Mgb24gdGFyZ2V0LiBDb2xsYXBzZSBpZiBleGlzdHMuXG4gICAgICovXG4gICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSkge1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYWN0aXZlQ29sbGFwc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlVGFiKCR0YXJnZXQpO1xuXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY29sbGFwc2VkIHRhYnMuXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2NvbGxhcHNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjb2xsYXBzZS56Zi50YWJzJywgWyR0YXJnZXRdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyICRvbGRUYWIgPSB0aGlzLiRlbGVtZW50LlxuICAgICAgICAgIGZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9LiR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgIC8vY2xvc2Ugb2xkIHRhYlxuICAgIHRoaXMuX2NvbGxhcHNlVGFiKCRvbGRUYWIpO1xuXG4gICAgLy9vcGVuIG5ldyB0YWJcbiAgICB0aGlzLl9vcGVuVGFiKCR0YXJnZXQpO1xuXG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluayAmJiAhaGlzdG9yeUhhbmRsZWQpIHtcbiAgICAgIHZhciBhbmNob3IgPSAkdGFyZ2V0LmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBkYXRlSGlzdG9yeSkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZCB0YWJzLlxuICAgICAqIEBldmVudCBUYWJzI2NoYW5nZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLnpmLnRhYnMnLCBbJHRhcmdldCwgJHRhcmdldENvbnRlbnRdKTtcblxuICAgIC8vZmlyZSB0byBjaGlsZHJlbiBhIG11dGF0aW9uIGV2ZW50XG4gICAgJHRhcmdldENvbnRlbnQuZmluZChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIik7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBPcGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9vcGVuVGFiKCR0YXJnZXQpIHtcbiAgICAgIHZhciAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgICAgJHRhcmdldC5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApO1xuXG4gICAgICAkdGFiTGluay5hdHRyKHsnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJ30pO1xuXG4gICAgICAkdGFyZ2V0Q29udGVudFxuICAgICAgICAuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgICAgLmF0dHIoeydhcmlhLWhpZGRlbic6ICdmYWxzZSd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfY29sbGFwc2VUYWIoJHRhcmdldCkge1xuICAgIHZhciAkdGFyZ2V0X2FuY2hvciA9ICR0YXJnZXRcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApXG4gICAgICAuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgLmF0dHIoeyAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0X2FuY2hvci5hdHRyKCdhcmlhLWNvbnRyb2xzJyl9YClcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKVxuICAgICAgLmF0dHIoeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIG1ldGhvZCBmb3Igc2VsZWN0aW5nIGEgY29udGVudCBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHwgU3RyaW5nfSBlbGVtIC0galF1ZXJ5IG9iamVjdCBvciBzdHJpbmcgb2YgdGhlIGlkIG9mIHRoZSBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNlbGVjdFRhYihlbGVtLCBoaXN0b3J5SGFuZGxlZCkge1xuICAgIHZhciBpZFN0cjtcblxuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkU3RyID0gZWxlbVswXS5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRTdHIgPSBlbGVtO1xuICAgIH1cblxuICAgIGlmIChpZFN0ci5pbmRleE9mKCcjJykgPCAwKSB7XG4gICAgICBpZFN0ciA9IGAjJHtpZFN0cn1gO1xuICAgIH1cblxuICAgIHZhciAkdGFyZ2V0ID0gdGhpcy4kdGFiVGl0bGVzLmZpbmQoYFtocmVmJD1cIiR7aWRTdHJ9XCJdYCkucGFyZW50KGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuXG4gICAgdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiBlYWNoIHBhbmVsIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgcGFuZWwuXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxuICAgKiBJZiBsb2FkaW5nIGNvbnRlbnQgdmlhIGV4dGVybmFsIHNvdXJjZSwgY2FuIGJlIGNhbGxlZCBkaXJlY3RseSBvciB3aXRoIF9yZWZsb3cuXG4gICAqIElmIGVuYWJsZWQgd2l0aCBgZGF0YS1tYXRjaC1oZWlnaHQ9XCJ0cnVlXCJgLCB0YWJzIHNldHMgdG8gZXF1YWwgaGVpZ2h0XG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldEhlaWdodCgpIHtcbiAgICB2YXIgbWF4ID0gMCxcbiAgICAgICAgX3RoaXMgPSB0aGlzOyAvLyBMb2NrIGRvd24gdGhlIGB0aGlzYCB2YWx1ZSBmb3IgdGhlIHJvb3QgdGFicyBvYmplY3RcblxuICAgIHRoaXMuJHRhYkNvbnRlbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmNzcygnaGVpZ2h0JywgJycpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcGFuZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgaXNBY3RpdmUgPSBwYW5lbC5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YCk7IC8vIGdldCB0aGUgb3B0aW9ucyBmcm9tIHRoZSBwYXJlbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ2V0IHRoZW0gZnJvbSB0aGUgY2hpbGRcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICdoaWRkZW4nLCAnZGlzcGxheSc6ICdibG9jayd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7XG4gICAgICAgICAgICAndmlzaWJpbGl0eSc6ICcnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICB9KVxuICAgICAgLmNzcygnaGVpZ2h0JywgYCR7bWF4fXB4YCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gdGFicy5cbiAgICogQGZpcmVzIFRhYnMjZGVzdHJveWVkXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApXG4gICAgICAub2ZmKCcuemYudGFicycpLmhpZGUoKS5lbmQoKVxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuaGlkZSgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgaWYgKHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciAhPSBudWxsKSB7XG4gICAgICAgICAkKHdpbmRvdykub2ZmKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRhYnMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIHRhYiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIHRhYlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIGFjdGl2ZSBwYW5lIG9uIGxvYWQgaWYgc2V0IHRvIHRydWUuXG4gICAqIE5vdCByZWNvbW1lbmRlZCBpZiBtb3JlIHRoYW4gb25lIHRhYiBwYW5lbCBwZXIgcGFnZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9Gb2N1czogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBrZXlib2FyZCBpbnB1dCB0byAnd3JhcCcgYXJvdW5kIHRoZSB0YWIgbGlua3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIHdyYXBPbktleXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdGFiIGNvbnRlbnQgcGFuZXMgdG8gbWF0Y2ggaGVpZ2h0cyBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG1hdGNoSGVpZ2h0OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGFjdGl2ZSB0YWJzIHRvIGNvbGxhcHNlIHdoZW4gY2xpY2tlZC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFjdGl2ZUNvbGxhcHNlOiBmYWxzZSxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byBgbGlgJ3MgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndGFicy10aXRsZSdcbiAgICovXG4gIGxpbmtDbGFzczogJ3RhYnMtdGl0bGUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgYGxpYCBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdpcy1hY3RpdmUnXG4gICAqL1xuICBsaW5rQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBjb250ZW50IGNvbnRhaW5lcnMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtcGFuZWwnXG4gICAqL1xuICBwYW5lbENsYXNzOiAndGFicy1wYW5lbCcsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBjb250ZW50IGNvbnRhaW5lci5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgcGFuZWxBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihUYWJzLCAnVGFicycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihleHBvcnRzKSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuTGF6eUxvYWQgPSBmYWN0b3J5KCk7XG4gICAgfVxufSkod2luZG93LCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgX3N1cHBvcnRzU2Nyb2xsID0gJ29uc2Nyb2xsJyBpbiB3aW5kb3cgJiYgIS9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICB2YXIgX2dldFRvcE9mZnNldCA9IGZ1bmN0aW9uIF9nZXRUb3BPZmZzZXQoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcDtcbiAgICB9O1xuXG4gICAgdmFyIF9pc0JlbG93Vmlld3BvcnQgPSBmdW5jdGlvbiBfaXNCZWxvd1ZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyB3aW5kb3cuaW5uZXJIZWlnaHQgKyB3aW5kb3cucGFnZVlPZmZzZXQgOiBfZ2V0VG9wT2Zmc2V0KGNvbnRhaW5lcikgKyBjb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICByZXR1cm4gZm9sZCA8PSBfZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgX2dldExlZnRPZmZzZXQgPSBmdW5jdGlvbiBfZ2V0TGVmdE9mZnNldChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnQ7XG4gICAgfTtcblxuICAgIHZhciBfaXNBdFJpZ2h0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIF9pc0F0UmlnaHRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBkb2N1bWVudFdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyBkb2N1bWVudFdpZHRoICsgd2luZG93LnBhZ2VYT2Zmc2V0IDogX2dldExlZnRPZmZzZXQoY29udGFpbmVyKSArIGRvY3VtZW50V2lkdGg7XG4gICAgICAgIHJldHVybiBmb2xkIDw9IF9nZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgX2lzQWJvdmVWaWV3cG9ydCA9IGZ1bmN0aW9uIF9pc0Fib3ZlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWU9mZnNldCA6IF9nZXRUb3BPZmZzZXQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gX2dldFRvcE9mZnNldChlbGVtZW50KSArIHRocmVzaG9sZCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIH07XG5cbiAgICB2YXIgX2lzQXRMZWZ0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIF9pc0F0TGVmdE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWE9mZnNldCA6IF9nZXRMZWZ0T2Zmc2V0KGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBmb2xkID49IF9nZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpICsgdGhyZXNob2xkICsgZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICB9O1xuXG4gICAgdmFyIF9pc0luc2lkZVZpZXdwb3J0ID0gZnVuY3Rpb24gX2lzSW5zaWRlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgcmV0dXJuICFfaXNCZWxvd1ZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhX2lzQWJvdmVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIV9pc0F0UmlnaHRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhX2lzQXRMZWZ0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCk7XG4gICAgfTtcblxuICAgIHZhciBfY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gX2NhbGxDYWxsYmFjayhjYWxsYmFjaywgYXJndW1lbnQpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhhcmd1bWVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIF9kZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcImltZ1wiLFxuICAgICAgICBjb250YWluZXI6IHdpbmRvdyxcbiAgICAgICAgdGhyZXNob2xkOiAzMDAsXG4gICAgICAgIHRocm90dGxlOiAxNTAsXG4gICAgICAgIGRhdGFfc3JjOiBcIm9yaWdpbmFsXCIsXG4gICAgICAgIGRhdGFfc3Jjc2V0OiBcIm9yaWdpbmFsLXNldFwiLFxuICAgICAgICBjbGFzc19sb2FkaW5nOiBcImxvYWRpbmdcIixcbiAgICAgICAgY2xhc3NfbG9hZGVkOiBcImxvYWRlZFwiLFxuICAgICAgICBjbGFzc19lcnJvcjogXCJlcnJvclwiLFxuICAgICAgICBza2lwX2ludmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgY2FsbGJhY2tfbG9hZDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfZXJyb3I6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX3NldDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfcHJvY2Vzc2VkOiBudWxsXG4gICAgfTtcblxuICAgIHZhciBMYXp5TG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gTGF6eUxvYWQoaW5zdGFuY2VTZXR0aW5ncykge1xuICAgICAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExhenlMb2FkKTtcblxuICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBfZGVmYXVsdFNldHRpbmdzLCBpbnN0YW5jZVNldHRpbmdzKTtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZSA9IHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93ID8gZG9jdW1lbnQgOiB0aGlzLl9zZXR0aW5ncy5jb250YWluZXI7XG5cbiAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwgPSB0aGlzLmhhbmRsZVNjcm9sbC5iaW5kKHRoaXMpO1xuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NyZWF0ZUNsYXNzKExhenlMb2FkLCBbe1xuICAgICAgICAgICAga2V5OiAnX3NldFNvdXJjZXNGb3JQaWN0dXJlJyxcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0U291cmNlc0ZvclBpY3R1cmUoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lICE9PSAnUElDVFVSRScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGljdHVyZUNoaWxkID0gcGFyZW50LmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGljdHVyZUNoaWxkLnRhZ05hbWUgPT09ICdTT1VSQ0UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc291cmNlU3Jjc2V0ID0gcGljdHVyZUNoaWxkLmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgc3Jjc2V0RGF0YUF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlU3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGljdHVyZUNoaWxkLnNldEF0dHJpYnV0ZSgnc3Jjc2V0Jywgc291cmNlU3Jjc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiAnX3NldFNvdXJjZXMnLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRTb3VyY2VzKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUsIHNyY0RhdGFBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZTtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudFNyYyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBzcmNEYXRhQXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRTb3VyY2VzRm9yUGljdHVyZShlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltZ1NyY3NldCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBzcmNzZXREYXRhQXR0cmlidXRlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1NyY3NldCkgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgaW1nU3Jjc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRTcmMpIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRTcmMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YWdOYW1lID09PSBcIklGUkFNRVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50U3JjKSBlbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY1wiLCBlbGVtZW50U3JjKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudFNyYykgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGVsZW1lbnRTcmMgKyBcIilcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiAnX3Nob3dPbkFwcGVhcicsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX3Nob3dPbkFwcGVhcihlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fc2V0dGluZ3M7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JDYWxsYmFjayA9IGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2Vycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgX2NhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19lcnJvciwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBsb2FkQ2FsbGJhY2sgPSBmdW5jdGlvbiBsb2FkQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2xvYWRlZCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIC8qIENhbGxpbmcgTE9BRCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgICAgICBfY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX2xvYWQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSBcIklNR1wiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJRlJBTUVcIikge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U291cmNlcyhlbGVtZW50LCBzZXR0aW5ncy5kYXRhX3NyY3NldCwgc2V0dGluZ3MuZGF0YV9zcmMpO1xuICAgICAgICAgICAgICAgIC8qIENhbGxpbmcgU0VUIGNhbGxiYWNrICovXG4gICAgICAgICAgICAgICAgX2NhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19zZXQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBrZXk6ICdfbG9vcFRocm91Z2hFbGVtZW50cycsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2xvb3BUaHJvdWdoRWxlbWVudHMoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzTGVuZ3RoID0gIWVsZW1lbnRzID8gMCA6IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgLyogSWYgbXVzdCBza2lwX2ludmlzaWJsZSBhbmQgZWxlbWVudCBpcyBpbnZpc2libGUsIHNraXAgaXQgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNraXBfaW52aXNpYmxlICYmIGVsZW1lbnQub2Zmc2V0UGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfc3VwcG9ydHNTY3JvbGwgJiYgX2lzSW5zaWRlVmlld3BvcnQoZWxlbWVudCwgc2V0dGluZ3MuY29udGFpbmVyLCBzZXR0aW5ncy50aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93T25BcHBlYXIoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIE1hcmtpbmcgdGhlIGVsZW1lbnQgYXMgcHJvY2Vzc2VkLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC53YXNQcm9jZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIFJlbW92aW5nIHByb2Nlc3NlZCBlbGVtZW50cyBmcm9tIHRoaXMuX2VsZW1lbnRzLiAqL1xuICAgICAgICAgICAgICAgIHdoaWxlIChwcm9jZXNzZWRJbmRleGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc3BsaWNlKHByb2Nlc3NlZEluZGV4ZXMucG9wKCksIDEpO1xuICAgICAgICAgICAgICAgICAgICAvKiBDYWxsaW5nIHRoZSBlbmQgbG9vcCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgICAgICBfY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX3Byb2Nlc3NlZCwgZWxlbWVudHMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogU3RvcCBsaXN0ZW5pbmcgdG8gc2Nyb2xsIGV2ZW50IHdoZW4gMCBlbGVtZW50cyByZW1haW5zICovXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBrZXk6ICdfcHVyZ2VFbGVtZW50cycsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX3B1cmdlRWxlbWVudHMoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1RvUHVyZ2UgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgIC8qIElmIHRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkLCBza2lwIGl0ICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lndhc1Byb2Nlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNUb1B1cmdlLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogUmVtb3ZpbmcgZWxlbWVudHMgdG8gcHVyZ2UgZnJvbSB0aGlzLl9lbGVtZW50cy4gKi9cbiAgICAgICAgICAgICAgICB3aGlsZSAoZWxlbWVudHNUb1B1cmdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc3BsaWNlKGVsZW1lbnRzVG9QdXJnZS5wb3AoKSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBrZXk6ICdfc3RhcnRTY3JvbGxIYW5kbGVyJyxcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RhcnRTY3JvbGxIYW5kbGVyKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiAnX3N0b3BTY3JvbGxIYW5kbGVyJyxcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNIYW5kbGluZ1Njcm9sbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBrZXk6ICdoYW5kbGVTY3JvbGwnLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVNjcm9sbCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhyb3R0bGUgPSB0aGlzLl9zZXR0aW5ncy50aHJvdHRsZTtcblxuICAgICAgICAgICAgICAgIGlmICh0aHJvdHRsZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ2V0VGltZSA9IGZ1bmN0aW9uIGdldFRpbWUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vdyA9IGdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZ1RpbWUgPSB0aHJvdHRsZSAtIChub3cgLSB0aGlzLl9wcmV2aW91c0xvb3BUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ1RpbWUgPD0gMCB8fCByZW1haW5pbmdUaW1lID4gdGhyb3R0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IGdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCByZW1haW5pbmdUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGtleTogJ3VwZGF0ZScsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnRzIHRvIGFycmF5IHRoZSBub2Rlc2V0IG9idGFpbmVkIHF1ZXJ5aW5nIHRoZSBET00gZnJvbSBfcXVlcnlPcmlnaW5Ob2RlIHdpdGggZWxlbWVudHNfc2VsZWN0b3JcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3NldHRpbmdzLmVsZW1lbnRzX3NlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHVyZ2VFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGFydFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiAnZGVzdHJveScsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvb3BUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVlcnlPcmlnaW5Ob2RlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcblxuICAgICAgICByZXR1cm4gTGF6eUxvYWQ7XG4gICAgfSgpO1xuXG4gICAgcmV0dXJuIExhenlMb2FkO1xufSk7XG4iLCIvKiFcbiAqIEZsaWNraXR5IFBBQ0tBR0VEIHYyLjAuNVxuICogVG91Y2gsIHJlc3BvbnNpdmUsIGZsaWNrYWJsZSBjYXJvdXNlbHNcbiAqXG4gKiBMaWNlbnNlZCBHUEx2MyBmb3Igb3BlbiBzb3VyY2UgdXNlXG4gKiBvciBGbGlja2l0eSBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cDovL2ZsaWNraXR5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTYgTWV0YWZpenp5XG4gKi9cblxuIWZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImpxdWVyeS1icmlkZ2V0L2pxdWVyeS1icmlkZ2V0XCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImpxdWVyeVwiKSk6dC5qUXVlcnlCcmlkZ2V0PWUodCx0LmpRdWVyeSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGkoaSxvLGEpe2Z1bmN0aW9uIGwodCxlLG4pe3ZhciBzLG89XCIkKCkuXCIraSsnKFwiJytlKydcIiknO3JldHVybiB0LmVhY2goZnVuY3Rpb24odCxsKXt2YXIgaD1hLmRhdGEobCxpKTtpZighaClyZXR1cm4gdm9pZCByKGkrXCIgbm90IGluaXRpYWxpemVkLiBDYW5ub3QgY2FsbCBtZXRob2RzLCBpLmUuIFwiK28pO3ZhciBjPWhbZV07aWYoIWN8fFwiX1wiPT1lLmNoYXJBdCgwKSlyZXR1cm4gdm9pZCByKG8rXCIgaXMgbm90IGEgdmFsaWQgbWV0aG9kXCIpO3ZhciBkPWMuYXBwbHkoaCxuKTtzPXZvaWQgMD09PXM/ZDpzfSksdm9pZCAwIT09cz9zOnR9ZnVuY3Rpb24gaCh0LGUpe3QuZWFjaChmdW5jdGlvbih0LG4pe3ZhciBzPWEuZGF0YShuLGkpO3M/KHMub3B0aW9uKGUpLHMuX2luaXQoKSk6KHM9bmV3IG8obixlKSxhLmRhdGEobixpLHMpKX0pfWE9YXx8ZXx8dC5qUXVlcnksYSYmKG8ucHJvdG90eXBlLm9wdGlvbnx8KG8ucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbih0KXthLmlzUGxhaW5PYmplY3QodCkmJih0aGlzLm9wdGlvbnM9YS5leHRlbmQoITAsdGhpcy5vcHRpb25zLHQpKX0pLGEuZm5baV09ZnVuY3Rpb24odCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpe3ZhciBlPXMuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGwodGhpcyx0LGUpfXJldHVybiBoKHRoaXMsdCksdGhpc30sbihhKSl9ZnVuY3Rpb24gbih0KXshdHx8dCYmdC5icmlkZ2V0fHwodC5icmlkZ2V0PWkpfXZhciBzPUFycmF5LnByb3RvdHlwZS5zbGljZSxvPXQuY29uc29sZSxyPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBvP2Z1bmN0aW9uKCl7fTpmdW5jdGlvbih0KXtvLmVycm9yKHQpfTtyZXR1cm4gbihlfHx0LmpRdWVyeSksaX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LkV2RW1pdHRlcj1lKCl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7fXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLm9uPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dmFyIGk9dGhpcy5fZXZlbnRzPXRoaXMuX2V2ZW50c3x8e30sbj1pW3RdPWlbdF18fFtdO3JldHVybiBuLmluZGV4T2YoZSk9PS0xJiZuLnB1c2goZSksdGhpc319LGUub25jZT1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3RoaXMub24odCxlKTt2YXIgaT10aGlzLl9vbmNlRXZlbnRzPXRoaXMuX29uY2VFdmVudHN8fHt9LG49aVt0XT1pW3RdfHx7fTtyZXR1cm4gbltlXT0hMCx0aGlzfX0sZS5vZmY9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49aS5pbmRleE9mKGUpO3JldHVybiBuIT0tMSYmaS5zcGxpY2UobiwxKSx0aGlzfX0sZS5lbWl0RXZlbnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49MCxzPWlbbl07ZT1lfHxbXTtmb3IodmFyIG89dGhpcy5fb25jZUV2ZW50cyYmdGhpcy5fb25jZUV2ZW50c1t0XTtzOyl7dmFyIHI9byYmb1tzXTtyJiYodGhpcy5vZmYodCxzKSxkZWxldGUgb1tzXSkscy5hcHBseSh0aGlzLGUpLG4rPXI/MDoxLHM9aVtuXX1yZXR1cm4gdGhpc319LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFtdLGZ1bmN0aW9uKCl7cmV0dXJuIGUoKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LmdldFNpemU9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3ZhciBlPXBhcnNlRmxvYXQodCksaT10LmluZGV4T2YoXCIlXCIpPT0tMSYmIWlzTmFOKGUpO3JldHVybiBpJiZlfWZ1bmN0aW9uIGUoKXt9ZnVuY3Rpb24gaSgpe2Zvcih2YXIgdD17d2lkdGg6MCxoZWlnaHQ6MCxpbm5lcldpZHRoOjAsaW5uZXJIZWlnaHQ6MCxvdXRlcldpZHRoOjAsb3V0ZXJIZWlnaHQ6MH0sZT0wO2U8aDtlKyspe3ZhciBpPWxbZV07dFtpXT0wfXJldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtyZXR1cm4gZXx8YShcIlN0eWxlIHJldHVybmVkIFwiK2UrXCIuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/IFNlZSBodHRwOi8vYml0Lmx5L2dldHNpemVidWcxXCIpLGV9ZnVuY3Rpb24gcygpe2lmKCFjKXtjPSEwO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5zdHlsZS53aWR0aD1cIjIwMHB4XCIsZS5zdHlsZS5wYWRkaW5nPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3JkZXJTdHlsZT1cInNvbGlkXCIsZS5zdHlsZS5ib3JkZXJXaWR0aD1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm94U2l6aW5nPVwiYm9yZGVyLWJveFwiO3ZhciBpPWRvY3VtZW50LmJvZHl8fGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtpLmFwcGVuZENoaWxkKGUpO3ZhciBzPW4oZSk7by5pc0JveFNpemVPdXRlcj1yPTIwMD09dChzLndpZHRoKSxpLnJlbW92ZUNoaWxkKGUpfX1mdW5jdGlvbiBvKGUpe2lmKHMoKSxcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlKSksZSYmXCJvYmplY3RcIj09dHlwZW9mIGUmJmUubm9kZVR5cGUpe3ZhciBvPW4oZSk7aWYoXCJub25lXCI9PW8uZGlzcGxheSlyZXR1cm4gaSgpO3ZhciBhPXt9O2Eud2lkdGg9ZS5vZmZzZXRXaWR0aCxhLmhlaWdodD1lLm9mZnNldEhlaWdodDtmb3IodmFyIGM9YS5pc0JvcmRlckJveD1cImJvcmRlci1ib3hcIj09by5ib3hTaXppbmcsZD0wO2Q8aDtkKyspe3ZhciB1PWxbZF0sZj1vW3VdLHA9cGFyc2VGbG9hdChmKTthW3VdPWlzTmFOKHApPzA6cH12YXIgdj1hLnBhZGRpbmdMZWZ0K2EucGFkZGluZ1JpZ2h0LGc9YS5wYWRkaW5nVG9wK2EucGFkZGluZ0JvdHRvbSxtPWEubWFyZ2luTGVmdCthLm1hcmdpblJpZ2h0LHk9YS5tYXJnaW5Ub3ArYS5tYXJnaW5Cb3R0b20sUz1hLmJvcmRlckxlZnRXaWR0aCthLmJvcmRlclJpZ2h0V2lkdGgsRT1hLmJvcmRlclRvcFdpZHRoK2EuYm9yZGVyQm90dG9tV2lkdGgsYj1jJiZyLHg9dChvLndpZHRoKTt4IT09ITEmJihhLndpZHRoPXgrKGI/MDp2K1MpKTt2YXIgQz10KG8uaGVpZ2h0KTtyZXR1cm4gQyE9PSExJiYoYS5oZWlnaHQ9QysoYj8wOmcrRSkpLGEuaW5uZXJXaWR0aD1hLndpZHRoLSh2K1MpLGEuaW5uZXJIZWlnaHQ9YS5oZWlnaHQtKGcrRSksYS5vdXRlcldpZHRoPWEud2lkdGgrbSxhLm91dGVySGVpZ2h0PWEuaGVpZ2h0K3ksYX19dmFyIHIsYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgY29uc29sZT9lOmZ1bmN0aW9uKHQpe2NvbnNvbGUuZXJyb3IodCl9LGw9W1wicGFkZGluZ0xlZnRcIixcInBhZGRpbmdSaWdodFwiLFwicGFkZGluZ1RvcFwiLFwicGFkZGluZ0JvdHRvbVwiLFwibWFyZ2luTGVmdFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpblRvcFwiLFwibWFyZ2luQm90dG9tXCIsXCJib3JkZXJMZWZ0V2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiXSxoPWwubGVuZ3RoLGM9ITE7cmV0dXJuIG99KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5tYXRjaGVzU2VsZWN0b3I9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbigpe3ZhciB0PUVsZW1lbnQucHJvdG90eXBlO2lmKHQubWF0Y2hlcylyZXR1cm5cIm1hdGNoZXNcIjtpZih0Lm1hdGNoZXNTZWxlY3RvcilyZXR1cm5cIm1hdGNoZXNTZWxlY3RvclwiO2Zvcih2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl0saT0wO2k8ZS5sZW5ndGg7aSsrKXt2YXIgbj1lW2ldLHM9bitcIk1hdGNoZXNTZWxlY3RvclwiO2lmKHRbc10pcmV0dXJuIHN9fSgpO3JldHVybiBmdW5jdGlvbihlLGkpe3JldHVybiBlW3RdKGkpfX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsW1wiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3JcIikpOnQuZml6enlVSVV0aWxzPWUodCx0Lm1hdGNoZXNTZWxlY3Rvcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXt9O2kuZXh0ZW5kPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fSxpLm1vZHVsbz1mdW5jdGlvbih0LGUpe3JldHVybih0JWUrZSklZX0saS5tYWtlQXJyYXk9ZnVuY3Rpb24odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZih0JiZcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfSxpLnJlbW92ZUZyb209ZnVuY3Rpb24odCxlKXt2YXIgaT10LmluZGV4T2YoZSk7aSE9LTEmJnQuc3BsaWNlKGksMSl9LGkuZ2V0UGFyZW50PWZ1bmN0aW9uKHQsaSl7Zm9yKDt0IT1kb2N1bWVudC5ib2R5OylpZih0PXQucGFyZW50Tm9kZSxlKHQsaSkpcmV0dXJuIHR9LGkuZ2V0UXVlcnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCk6dH0saS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LGkuZmlsdGVyRmluZEVsZW1lbnRzPWZ1bmN0aW9uKHQsbil7dD1pLm1ha2VBcnJheSh0KTt2YXIgcz1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2lmKHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7aWYoIW4pcmV0dXJuIHZvaWQgcy5wdXNoKHQpO2UodCxuKSYmcy5wdXNoKHQpO2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwobiksbz0wO288aS5sZW5ndGg7bysrKXMucHVzaChpW29dKX19KSxzfSxpLmRlYm91bmNlTWV0aG9kPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj10LnByb3RvdHlwZVtlXSxzPWUrXCJUaW1lb3V0XCI7dC5wcm90b3R5cGVbZV09ZnVuY3Rpb24oKXt2YXIgdD10aGlzW3NdO3QmJmNsZWFyVGltZW91dCh0KTt2YXIgZT1hcmd1bWVudHMsbz10aGlzO3RoaXNbc109c2V0VGltZW91dChmdW5jdGlvbigpe24uYXBwbHkobyxlKSxkZWxldGUgb1tzXX0saXx8MTAwKX19LGkuZG9jUmVhZHk9ZnVuY3Rpb24odCl7dmFyIGU9ZG9jdW1lbnQucmVhZHlTdGF0ZTtcImNvbXBsZXRlXCI9PWV8fFwiaW50ZXJhY3RpdmVcIj09ZT9zZXRUaW1lb3V0KHQpOmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsdCl9LGkudG9EYXNoZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQucmVwbGFjZSgvKC4pKFtBLVpdKS9nLGZ1bmN0aW9uKHQsZSxpKXtyZXR1cm4gZStcIi1cIitpfSkudG9Mb3dlckNhc2UoKX07dmFyIG49dC5jb25zb2xlO3JldHVybiBpLmh0bWxJbml0PWZ1bmN0aW9uKGUscyl7aS5kb2NSZWFkeShmdW5jdGlvbigpe3ZhciBvPWkudG9EYXNoZWQocykscj1cImRhdGEtXCIrbyxhPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbXCIrcitcIl1cIiksbD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLVwiK28pLGg9aS5tYWtlQXJyYXkoYSkuY29uY2F0KGkubWFrZUFycmF5KGwpKSxjPXIrXCItb3B0aW9uc1wiLGQ9dC5qUXVlcnk7aC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpLG89dC5nZXRBdHRyaWJ1dGUocil8fHQuZ2V0QXR0cmlidXRlKGMpO3RyeXtpPW8mJkpTT04ucGFyc2Uobyl9Y2F0Y2goYSl7cmV0dXJuIHZvaWQobiYmbi5lcnJvcihcIkVycm9yIHBhcnNpbmcgXCIrcitcIiBvbiBcIit0LmNsYXNzTmFtZStcIjogXCIrYSkpfXZhciBsPW5ldyBlKHQsaSk7ZCYmZC5kYXRhKHQscyxsKX0pfSl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9jZWxsXCIsW1wiZ2V0LXNpemUvZ2V0LXNpemVcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZ2V0LXNpemVcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuQ2VsbD1lKHQsdC5nZXRTaXplKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXt0aGlzLmVsZW1lbnQ9dCx0aGlzLnBhcmVudD1lLHRoaXMuY3JlYXRlKCl9dmFyIG49aS5wcm90b3R5cGU7cmV0dXJuIG4uY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIix0aGlzLng9MCx0aGlzLnNoaWZ0PTB9LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cIlwiO3ZhciB0PXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW3RdPVwiXCJ9LG4uZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1lKHRoaXMuZWxlbWVudCl9LG4uc2V0UG9zaXRpb249ZnVuY3Rpb24odCl7dGhpcy54PXQsdGhpcy51cGRhdGVUYXJnZXQoKSx0aGlzLnJlbmRlclBvc2l0aW9uKHQpfSxuLnVwZGF0ZVRhcmdldD1uLnNldERlZmF1bHRUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD1cImxlZnRcIj09dGhpcy5wYXJlbnQub3JpZ2luU2lkZT9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuc2l6ZVt0XSt0aGlzLnNpemUud2lkdGgqdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxuLnJlbmRlclBvc2l0aW9uPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW2VdPXRoaXMucGFyZW50LmdldFBvc2l0aW9uVmFsdWUodCl9LG4ud3JhcFNoaWZ0PWZ1bmN0aW9uKHQpe3RoaXMuc2hpZnQ9dCx0aGlzLnJlbmRlclBvc2l0aW9uKHRoaXMueCt0aGlzLnBhcmVudC5zbGlkZWFibGVXaWR0aCp0KX0sbi5yZW1vdmU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvc2xpZGVcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5TbGlkZT1lKCkpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3RoaXMucGFyZW50PXQsdGhpcy5pc09yaWdpbkxlZnQ9XCJsZWZ0XCI9PXQub3JpZ2luU2lkZSx0aGlzLmNlbGxzPVtdLHRoaXMub3V0ZXJXaWR0aD0wLHRoaXMuaGVpZ2h0PTB9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUuYWRkQ2VsbD1mdW5jdGlvbih0KXtpZih0aGlzLmNlbGxzLnB1c2godCksdGhpcy5vdXRlcldpZHRoKz10LnNpemUub3V0ZXJXaWR0aCx0aGlzLmhlaWdodD1NYXRoLm1heCh0LnNpemUub3V0ZXJIZWlnaHQsdGhpcy5oZWlnaHQpLDE9PXRoaXMuY2VsbHMubGVuZ3RoKXt0aGlzLng9dC54O3ZhciBlPXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLmZpcnN0TWFyZ2luPXQuc2l6ZVtlXX19LGUudXBkYXRlVGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGU9dGhpcy5nZXRMYXN0Q2VsbCgpLGk9ZT9lLnNpemVbdF06MCxuPXRoaXMub3V0ZXJXaWR0aC0odGhpcy5maXJzdE1hcmdpbitpKTt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5maXJzdE1hcmdpbituKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sZS5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxlLnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcImFkZFwiKX0sZS51bnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKX0sZS5jaGFuZ2VTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmVsZW1lbnQuY2xhc3NMaXN0W3RdKFwiaXMtc2VsZWN0ZWRcIil9KX0sZS5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSx0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYW5pbWF0ZVwiLFtcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGU9ZSh0LHQuZml6enlVSVV0aWxzKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXQucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx0LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSxuPTA7aXx8KGk9ZnVuY3Rpb24odCl7dmFyIGU9KG5ldyBEYXRlKS5nZXRUaW1lKCksaT1NYXRoLm1heCgwLDE2LShlLW4pKSxzPXNldFRpbWVvdXQodCxpKTtyZXR1cm4gbj1lK2ksc30pO3ZhciBzPXt9O3Muc3RhcnRBbmltYXRpb249ZnVuY3Rpb24oKXt0aGlzLmlzQW5pbWF0aW5nfHwodGhpcy5pc0FuaW1hdGluZz0hMCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLmFuaW1hdGUoKSl9LHMuYW5pbWF0ZT1mdW5jdGlvbigpe3RoaXMuYXBwbHlEcmFnRm9yY2UoKSx0aGlzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uKCk7dmFyIHQ9dGhpcy54O2lmKHRoaXMuaW50ZWdyYXRlUGh5c2ljcygpLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLnNldHRsZSh0KSx0aGlzLmlzQW5pbWF0aW5nKXt2YXIgZT10aGlzO2koZnVuY3Rpb24oKXtlLmFuaW1hdGUoKX0pfX07dmFyIG89ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQudHJhbnNmb3JtP1widHJhbnNmb3JtXCI6XCJXZWJraXRUcmFuc2Zvcm1cIn0oKTtyZXR1cm4gcy5wb3NpdGlvblNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PXRoaXMueDt0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGg+MSYmKHQ9ZS5tb2R1bG8odCx0aGlzLnNsaWRlYWJsZVdpZHRoKSx0LT10aGlzLnNsaWRlYWJsZVdpZHRoLHRoaXMuc2hpZnRXcmFwQ2VsbHModCkpLHQrPXRoaXMuY3Vyc29yUG9zaXRpb24sdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJm8/LXQ6dDt2YXIgaT10aGlzLmdldFBvc2l0aW9uVmFsdWUodCk7dGhpcy5zbGlkZXIuc3R5bGVbb109dGhpcy5pc0FuaW1hdGluZz9cInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiOlwidHJhbnNsYXRlWChcIitpK1wiKVwiO3ZhciBuPXRoaXMuc2xpZGVzWzBdO2lmKG4pe3ZhciBzPS10aGlzLngtbi50YXJnZXQscj1zL3RoaXMuc2xpZGVzV2lkdGg7dGhpcy5kaXNwYXRjaEV2ZW50KFwic2Nyb2xsXCIsbnVsbCxbcixzXSl9fSxzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuY2VsbHMubGVuZ3RoJiYodGhpcy54PS10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0LHRoaXMucG9zaXRpb25TbGlkZXIoKSl9LHMuZ2V0UG9zaXRpb25WYWx1ZT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbj8uMDEqTWF0aC5yb3VuZCh0L3RoaXMuc2l6ZS5pbm5lcldpZHRoKjFlNCkrXCIlXCI6TWF0aC5yb3VuZCh0KStcInB4XCJ9LHMuc2V0dGxlPWZ1bmN0aW9uKHQpe3RoaXMuaXNQb2ludGVyRG93bnx8TWF0aC5yb3VuZCgxMDAqdGhpcy54KSE9TWF0aC5yb3VuZCgxMDAqdCl8fHRoaXMucmVzdGluZ0ZyYW1lcysrLHRoaXMucmVzdGluZ0ZyYW1lcz4yJiYodGhpcy5pc0FuaW1hdGluZz0hMSxkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmcsdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNldHRsZVwiKSl9LHMuc2hpZnRXcmFwQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5jdXJzb3JQb3NpdGlvbit0O3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzLGUsLTEpO3ZhciBpPXRoaXMuc2l6ZS5pbm5lcldpZHRoLSh0K3RoaXMuc2xpZGVhYmxlV2lkdGgrdGhpcy5jdXJzb3JQb3NpdGlvbik7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyxpLDEpfSxzLl9zaGlmdENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHM9dFtuXSxvPWU+MD9pOjA7cy53cmFwU2hpZnQobyksZS09cy5zaXplLm91dGVyV2lkdGh9fSxzLl91bnNoaWZ0Q2VsbHM9ZnVuY3Rpb24odCl7aWYodCYmdC5sZW5ndGgpZm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspdFtlXS53cmFwU2hpZnQoMCl9LHMuaW50ZWdyYXRlUGh5c2ljcz1mdW5jdGlvbigpe3RoaXMueCs9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5Kj10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCl9LHMuYXBwbHlGb3JjZT1mdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Kz10fSxzLmdldEZyaWN0aW9uRmFjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIDEtdGhpcy5vcHRpb25zW3RoaXMuaXNGcmVlU2Nyb2xsaW5nP1wiZnJlZVNjcm9sbEZyaWN0aW9uXCI6XCJmcmljdGlvblwiXX0scy5nZXRSZXN0aW5nUG9zaXRpb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy54K3RoaXMudmVsb2NpdHkvKDEtdGhpcy5nZXRGcmljdGlvbkZhY3RvcigpKX0scy5hcHBseURyYWdGb3JjZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNQb2ludGVyRG93bil7dmFyIHQ9dGhpcy5kcmFnWC10aGlzLngsZT10LXRoaXMudmVsb2NpdHk7dGhpcy5hcHBseUZvcmNlKGUpfX0scy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbj1mdW5jdGlvbigpe2lmKCF0aGlzLmlzUG9pbnRlckRvd24mJiF0aGlzLmlzRnJlZVNjcm9sbGluZyYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQqLTEtdGhpcy54LGU9dCp0aGlzLm9wdGlvbnMuc2VsZWN0ZWRBdHRyYWN0aW9uO3RoaXMuYXBwbHlGb3JjZShlKX19LHN9KSxmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoXCJmbGlja2l0eS9qcy9mbGlja2l0eVwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZ2V0LXNpemUvZ2V0LXNpemVcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2NlbGxcIixcIi4vc2xpZGVcIixcIi4vYW5pbWF0ZVwiXSxmdW5jdGlvbihpLG4scyxvLHIsYSl7cmV0dXJuIGUodCxpLG4scyxvLHIsYSl9KTtlbHNlIGlmKFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzKW1vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZ2V0LXNpemVcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2NlbGxcIikscmVxdWlyZShcIi4vc2xpZGVcIikscmVxdWlyZShcIi4vYW5pbWF0ZVwiKSk7ZWxzZXt2YXIgaT10LkZsaWNraXR5O3QuRmxpY2tpdHk9ZSh0LHQuRXZFbWl0dGVyLHQuZ2V0U2l6ZSx0LmZpenp5VUlVdGlscyxpLkNlbGwsaS5TbGlkZSxpLmFuaW1hdGVQcm90b3R5cGUpfX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4scyxvLHIpe2Z1bmN0aW9uIGEodCxlKXtmb3IodD1uLm1ha2VBcnJheSh0KTt0Lmxlbmd0aDspZS5hcHBlbmRDaGlsZCh0LnNoaWZ0KCkpfWZ1bmN0aW9uIGwodCxlKXt2YXIgaT1uLmdldFF1ZXJ5RWxlbWVudCh0KTtpZighaSlyZXR1cm4gdm9pZChkJiZkLmVycm9yKFwiQmFkIGVsZW1lbnQgZm9yIEZsaWNraXR5OiBcIisoaXx8dCkpKTtpZih0aGlzLmVsZW1lbnQ9aSx0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEKXt2YXIgcz1mW3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSURdO3JldHVybiBzLm9wdGlvbihlKSxzfWgmJih0aGlzLiRlbGVtZW50PWgodGhpcy5lbGVtZW50KSksdGhpcy5vcHRpb25zPW4uZXh0ZW5kKHt9LHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMpLHRoaXMub3B0aW9uKGUpLHRoaXMuX2NyZWF0ZSgpfXZhciBoPXQualF1ZXJ5LGM9dC5nZXRDb21wdXRlZFN0eWxlLGQ9dC5jb25zb2xlLHU9MCxmPXt9O2wuZGVmYXVsdHM9e2FjY2Vzc2liaWxpdHk6ITAsY2VsbEFsaWduOlwiY2VudGVyXCIsZnJlZVNjcm9sbEZyaWN0aW9uOi4wNzUsZnJpY3Rpb246LjI4LG5hbWVzcGFjZUpRdWVyeUV2ZW50czohMCxwZXJjZW50UG9zaXRpb246ITAscmVzaXplOiEwLHNlbGVjdGVkQXR0cmFjdGlvbjouMDI1LHNldEdhbGxlcnlTaXplOiEwfSxsLmNyZWF0ZU1ldGhvZHM9W107dmFyIHA9bC5wcm90b3R5cGU7bi5leHRlbmQocCxlLnByb3RvdHlwZSkscC5fY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5ndWlkPSsrdTt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEPWUsZltlXT10aGlzLHRoaXMuc2VsZWN0ZWRJbmRleD0wLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMueD0wLHRoaXMudmVsb2NpdHk9MCx0aGlzLm9yaWdpblNpZGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicmlnaHRcIjpcImxlZnRcIix0aGlzLnZpZXdwb3J0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy52aWV3cG9ydC5jbGFzc05hbWU9XCJmbGlja2l0eS12aWV3cG9ydFwiLHRoaXMuX2NyZWF0ZVNsaWRlcigpLCh0aGlzLm9wdGlvbnMucmVzaXplfHx0aGlzLm9wdGlvbnMud2F0Y2hDU1MpJiZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSxsLmNyZWF0ZU1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzW3RdKCl9LHRoaXMpLHRoaXMub3B0aW9ucy53YXRjaENTUz90aGlzLndhdGNoQ1NTKCk6dGhpcy5hY3RpdmF0ZSgpfSxwLm9wdGlvbj1mdW5jdGlvbih0KXtuLmV4dGVuZCh0aGlzLm9wdGlvbnMsdCl9LHAuYWN0aXZhdGU9ZnVuY3Rpb24oKXtpZighdGhpcy5pc0FjdGl2ZSl7dGhpcy5pc0FjdGl2ZT0hMCx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZ0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmdldFNpemUoKTt2YXIgdD10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7YSh0LHRoaXMuc2xpZGVyKSx0aGlzLnZpZXdwb3J0LmFwcGVuZENoaWxkKHRoaXMuc2xpZGVyKSx0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3cG9ydCksdGhpcy5yZWxvYWRDZWxscygpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnRhYkluZGV4PTAsdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuZW1pdEV2ZW50KFwiYWN0aXZhdGVcIik7dmFyIGUsaT10aGlzLm9wdGlvbnMuaW5pdGlhbEluZGV4O2U9dGhpcy5pc0luaXRBY3RpdmF0ZWQ/dGhpcy5zZWxlY3RlZEluZGV4OnZvaWQgMCE9PWkmJnRoaXMuY2VsbHNbaV0/aTowLHRoaXMuc2VsZWN0KGUsITEsITApLHRoaXMuaXNJbml0QWN0aXZhdGVkPSEwfX0scC5fY3JlYXRlU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0LmNsYXNzTmFtZT1cImZsaWNraXR5LXNsaWRlclwiLHQuc3R5bGVbdGhpcy5vcmlnaW5TaWRlXT0wLHRoaXMuc2xpZGVyPXR9LHAuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCl7cmV0dXJuIG4uZmlsdGVyRmluZEVsZW1lbnRzKHQsdGhpcy5vcHRpb25zLmNlbGxTZWxlY3Rvcil9LHAucmVsb2FkQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzPXRoaXMuX21ha2VDZWxscyh0aGlzLnNsaWRlci5jaGlsZHJlbiksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCl9LHAuX21ha2VDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHQpLGk9ZS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBzKHQsdGhpcyl9LHRoaXMpO3JldHVybiBpfSxwLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LHAuZ2V0TGFzdFNsaWRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2xpZGVzW3RoaXMuc2xpZGVzLmxlbmd0aC0xXX0scC5wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKCl7dGhpcy5fc2l6ZUNlbGxzKHRoaXMuY2VsbHMpLHRoaXMuX3Bvc2l0aW9uQ2VsbHMoMCl9LHAuX3Bvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24odCl7dD10fHwwLHRoaXMubWF4Q2VsbEhlaWdodD10P3RoaXMubWF4Q2VsbEhlaWdodHx8MDowO3ZhciBlPTA7aWYodD4wKXt2YXIgaT10aGlzLmNlbGxzW3QtMV07ZT1pLngraS5zaXplLm91dGVyV2lkdGh9Zm9yKHZhciBuPXRoaXMuY2VsbHMubGVuZ3RoLHM9dDtzPG47cysrKXt2YXIgbz10aGlzLmNlbGxzW3NdO28uc2V0UG9zaXRpb24oZSksZSs9by5zaXplLm91dGVyV2lkdGgsdGhpcy5tYXhDZWxsSGVpZ2h0PU1hdGgubWF4KG8uc2l6ZS5vdXRlckhlaWdodCx0aGlzLm1heENlbGxIZWlnaHQpfXRoaXMuc2xpZGVhYmxlV2lkdGg9ZSx0aGlzLnVwZGF0ZVNsaWRlcygpLHRoaXMuX2NvbnRhaW5TbGlkZXMoKSx0aGlzLnNsaWRlc1dpZHRoPW4/dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQtdGhpcy5zbGlkZXNbMF0udGFyZ2V0OjB9LHAuX3NpemVDZWxscz1mdW5jdGlvbih0KXt0LmZvckVhY2goZnVuY3Rpb24odCl7dC5nZXRTaXplKCl9KX0scC51cGRhdGVTbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRlcz1bXSx0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9bmV3IG8odGhpcyk7dGhpcy5zbGlkZXMucHVzaCh0KTt2YXIgZT1cImxlZnRcIj09dGhpcy5vcmlnaW5TaWRlLGk9ZT9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsbj10aGlzLl9nZXRDYW5DZWxsRml0KCk7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUscyl7aWYoIXQuY2VsbHMubGVuZ3RoKXJldHVybiB2b2lkIHQuYWRkQ2VsbChlKTt2YXIgcj10Lm91dGVyV2lkdGgtdC5maXJzdE1hcmdpbisoZS5zaXplLm91dGVyV2lkdGgtZS5zaXplW2ldKTtuLmNhbGwodGhpcyxzLHIpP3QuYWRkQ2VsbChlKToodC51cGRhdGVUYXJnZXQoKSx0PW5ldyBvKHRoaXMpLHRoaXMuc2xpZGVzLnB1c2godCksdC5hZGRDZWxsKGUpKX0sdGhpcyksdC51cGRhdGVUYXJnZXQoKSx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKX19LHAuX2dldENhbkNlbGxGaXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMuZ3JvdXBDZWxscztpZighdClyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4hMX07aWYoXCJudW1iZXJcIj09dHlwZW9mIHQpe3ZhciBlPXBhcnNlSW50KHQsMTApO3JldHVybiBmdW5jdGlvbih0KXtyZXR1cm4gdCVlIT09MH19dmFyIGk9XCJzdHJpbmdcIj09dHlwZW9mIHQmJnQubWF0Y2goL14oXFxkKyklJC8pLG49aT9wYXJzZUludChpWzFdLDEwKS8xMDA6MTtyZXR1cm4gZnVuY3Rpb24odCxlKXtyZXR1cm4gZTw9KHRoaXMuc2l6ZS5pbm5lcldpZHRoKzEpKm59fSxwLl9pbml0PXAucmVwb3NpdGlvbj1mdW5jdGlvbigpe3RoaXMucG9zaXRpb25DZWxscygpLHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9LHAuZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1pKHRoaXMuZWxlbWVudCksdGhpcy5zZXRDZWxsQWxpZ24oKSx0aGlzLmN1cnNvclBvc2l0aW9uPXRoaXMuc2l6ZS5pbm5lcldpZHRoKnRoaXMuY2VsbEFsaWdufTt2YXIgdj17Y2VudGVyOntsZWZ0Oi41LHJpZ2h0Oi41fSxsZWZ0OntsZWZ0OjAscmlnaHQ6MX0scmlnaHQ6e3JpZ2h0OjAsbGVmdDoxfX07cmV0dXJuIHAuc2V0Q2VsbEFsaWduPWZ1bmN0aW9uKCl7dmFyIHQ9dlt0aGlzLm9wdGlvbnMuY2VsbEFsaWduXTt0aGlzLmNlbGxBbGlnbj10P3RbdGhpcy5vcmlnaW5TaWRlXTp0aGlzLm9wdGlvbnMuY2VsbEFsaWdufSxwLnNldEdhbGxlcnlTaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLnNldEdhbGxlcnlTaXplKXt2YXIgdD10aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2VsZWN0ZWRTbGlkZT90aGlzLnNlbGVjdGVkU2xpZGUuaGVpZ2h0OnRoaXMubWF4Q2VsbEhlaWdodDt0aGlzLnZpZXdwb3J0LnN0eWxlLmhlaWdodD10K1wicHhcIn19LHAuX2dldFdyYXBTaGlmdENlbGxzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3RoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMpLHRoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyk7dmFyIHQ9dGhpcy5jdXJzb3JQb3NpdGlvbixlPXRoaXMuY2VsbHMubGVuZ3RoLTE7dGhpcy5iZWZvcmVTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsZSwtMSksdD10aGlzLnNpemUuaW5uZXJXaWR0aC10aGlzLmN1cnNvclBvc2l0aW9uLHRoaXMuYWZ0ZXJTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsMCwxKX19LHAuX2dldEdhcENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49W107dD4wOyl7dmFyIHM9dGhpcy5jZWxsc1tlXTtpZighcylicmVhaztuLnB1c2gocyksZSs9aSx0LT1zLnNpemUub3V0ZXJXaWR0aH1yZXR1cm4gbn0scC5fY29udGFpblNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQsZT10P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixpPXQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiLG49dGhpcy5zbGlkZWFibGVXaWR0aC10aGlzLmdldExhc3RDZWxsKCkuc2l6ZVtpXSxzPW48dGhpcy5zaXplLmlubmVyV2lkdGgsbz10aGlzLmN1cnNvclBvc2l0aW9uK3RoaXMuY2VsbHNbMF0uc2l6ZVtlXSxyPW4tdGhpcy5zaXplLmlubmVyV2lkdGgqKDEtdGhpcy5jZWxsQWxpZ24pO3RoaXMuc2xpZGVzLmZvckVhY2goZnVuY3Rpb24odCl7cz90LnRhcmdldD1uKnRoaXMuY2VsbEFsaWduOih0LnRhcmdldD1NYXRoLm1heCh0LnRhcmdldCxvKSx0LnRhcmdldD1NYXRoLm1pbih0LnRhcmdldCxyKSl9LHRoaXMpfX0scC5kaXNwYXRjaEV2ZW50PWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj1lP1tlXS5jb25jYXQoaSk6aTtpZih0aGlzLmVtaXRFdmVudCh0LG4pLGgmJnRoaXMuJGVsZW1lbnQpe3QrPXRoaXMub3B0aW9ucy5uYW1lc3BhY2VKUXVlcnlFdmVudHM/XCIuZmxpY2tpdHlcIjpcIlwiO3ZhciBzPXQ7aWYoZSl7dmFyIG89aC5FdmVudChlKTtvLnR5cGU9dCxzPW99dGhpcy4kZWxlbWVudC50cmlnZ2VyKHMsaSl9fSxwLnNlbGVjdD1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0FjdGl2ZSYmKHQ9cGFyc2VJbnQodCwxMCksdGhpcy5fd3JhcFNlbGVjdCh0KSwodGhpcy5vcHRpb25zLndyYXBBcm91bmR8fGUpJiYodD1uLm1vZHVsbyh0LHRoaXMuc2xpZGVzLmxlbmd0aCkpLHRoaXMuc2xpZGVzW3RdJiYodGhpcy5zZWxlY3RlZEluZGV4PXQsdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCksaT90aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpOnRoaXMuc3RhcnRBbmltYXRpb24oKSx0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwiY2VsbFNlbGVjdFwiKSkpfSxwLl93cmFwU2VsZWN0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuc2xpZGVzLmxlbmd0aCxpPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZlPjE7aWYoIWkpcmV0dXJuIHQ7dmFyIHM9bi5tb2R1bG8odCxlKSxvPU1hdGguYWJzKHMtdGhpcy5zZWxlY3RlZEluZGV4KSxyPU1hdGguYWJzKHMrZS10aGlzLnNlbGVjdGVkSW5kZXgpLGE9TWF0aC5hYnMocy1lLXRoaXMuc2VsZWN0ZWRJbmRleCk7IXRoaXMuaXNEcmFnU2VsZWN0JiZyPG8/dCs9ZTohdGhpcy5pc0RyYWdTZWxlY3QmJmE8byYmKHQtPWUpLHQ8MD90aGlzLngtPXRoaXMuc2xpZGVhYmxlV2lkdGg6dD49ZSYmKHRoaXMueCs9dGhpcy5zbGlkZWFibGVXaWR0aCl9LHAucHJldmlvdXM9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgtMSx0LGUpfSxwLm5leHQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgrMSx0LGUpfSxwLnVwZGF0ZVNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnNsaWRlc1t0aGlzLnNlbGVjdGVkSW5kZXhdO3QmJih0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuc2VsZWN0ZWRTbGlkZT10LHQuc2VsZWN0KCksdGhpcy5zZWxlY3RlZENlbGxzPXQuY2VsbHMsdGhpcy5zZWxlY3RlZEVsZW1lbnRzPXQuZ2V0Q2VsbEVsZW1lbnRzKCksdGhpcy5zZWxlY3RlZENlbGw9dC5jZWxsc1swXSx0aGlzLnNlbGVjdGVkRWxlbWVudD10aGlzLnNlbGVjdGVkRWxlbWVudHNbMF0pfSxwLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRTbGlkZSYmdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCl9LHAuc2VsZWN0Q2VsbD1mdW5jdGlvbih0LGUsaSl7dmFyIG47XCJudW1iZXJcIj09dHlwZW9mIHQ/bj10aGlzLmNlbGxzW3RdOihcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9dGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodCkpLG49dGhpcy5nZXRDZWxsKHQpKTtmb3IodmFyIHM9MDtuJiZzPHRoaXMuc2xpZGVzLmxlbmd0aDtzKyspe3ZhciBvPXRoaXMuc2xpZGVzW3NdLHI9by5jZWxscy5pbmRleE9mKG4pO2lmKHIhPS0xKXJldHVybiB2b2lkIHRoaXMuc2VsZWN0KHMsZSxpKX19LHAuZ2V0Q2VsbD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuY2VsbHMubGVuZ3RoO2UrKyl7dmFyIGk9dGhpcy5jZWxsc1tlXTtpZihpLmVsZW1lbnQ9PXQpcmV0dXJuIGl9fSxwLmdldENlbGxzPWZ1bmN0aW9uKHQpe3Q9bi5tYWtlQXJyYXkodCk7dmFyIGU9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaT10aGlzLmdldENlbGwodCk7aSYmZS5wdXNoKGkpfSx0aGlzKSxlfSxwLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHAuZ2V0UGFyZW50Q2VsbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7cmV0dXJuIGU/ZToodD1uLmdldFBhcmVudCh0LFwiLmZsaWNraXR5LXNsaWRlciA+ICpcIiksdGhpcy5nZXRDZWxsKHQpKX0scC5nZXRBZGphY2VudENlbGxFbGVtZW50cz1mdW5jdGlvbih0LGUpe2lmKCF0KXJldHVybiB0aGlzLnNlbGVjdGVkU2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCk7ZT12b2lkIDA9PT1lP3RoaXMuc2VsZWN0ZWRJbmRleDplO3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aDtpZigxKzIqdD49aSlyZXR1cm4gdGhpcy5nZXRDZWxsRWxlbWVudHMoKTtmb3IodmFyIHM9W10sbz1lLXQ7bzw9ZSt0O28rKyl7dmFyIHI9dGhpcy5vcHRpb25zLndyYXBBcm91bmQ/bi5tb2R1bG8obyxpKTpvLGE9dGhpcy5zbGlkZXNbcl07YSYmKHM9cy5jb25jYXQoYS5nZXRDZWxsRWxlbWVudHMoKSkpfXJldHVybiBzfSxwLnVpQ2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy5lbWl0RXZlbnQoXCJ1aUNoYW5nZVwiKX0scC5jaGlsZFVJUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dGhpcy5lbWl0RXZlbnQoXCJjaGlsZFVJUG9pbnRlckRvd25cIixbdF0pfSxwLm9ucmVzaXplPWZ1bmN0aW9uKCl7dGhpcy53YXRjaENTUygpLHRoaXMucmVzaXplKCl9LG4uZGVib3VuY2VNZXRob2QobCxcIm9ucmVzaXplXCIsMTUwKSxwLnJlc2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNBY3RpdmUpe3RoaXMuZ2V0U2l6ZSgpLHRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiYodGhpcy54PW4ubW9kdWxvKHRoaXMueCx0aGlzLnNsaWRlYWJsZVdpZHRoKSksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJyZXNpemVcIik7dmFyIHQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzJiZ0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07dGhpcy5zZWxlY3RDZWxsKHQsITEsITApfX0scC53YXRjaENTUz1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy53YXRjaENTUztpZih0KXt2YXIgZT1jKHRoaXMuZWxlbWVudCxcIjphZnRlclwiKS5jb250ZW50O2UuaW5kZXhPZihcImZsaWNraXR5XCIpIT0tMT90aGlzLmFjdGl2YXRlKCk6dGhpcy5kZWFjdGl2YXRlKCl9fSxwLm9ua2V5ZG93bj1mdW5jdGlvbih0KXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKCFkb2N1bWVudC5hY3RpdmVFbGVtZW50fHxkb2N1bWVudC5hY3RpdmVFbGVtZW50PT10aGlzLmVsZW1lbnQpKWlmKDM3PT10LmtleUNvZGUpe3ZhciBlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cIm5leHRcIjpcInByZXZpb3VzXCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbZV0oKX1lbHNlIGlmKDM5PT10LmtleUNvZGUpe3ZhciBpPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbaV0oKX19LHAuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuaXNBY3RpdmUmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZGVzdHJveSgpfSksdGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy52aWV3cG9ydCksYSh0aGlzLnNsaWRlci5jaGlsZHJlbix0aGlzLmVsZW1lbnQpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcInRhYkluZGV4XCIpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmlzQWN0aXZlPSExLHRoaXMuZW1pdEV2ZW50KFwiZGVhY3RpdmF0ZVwiKSl9LHAuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLHRoaXMuZW1pdEV2ZW50KFwiZGVzdHJveVwiKSxoJiZ0aGlzLiRlbGVtZW50JiZoLnJlbW92ZURhdGEodGhpcy5lbGVtZW50LFwiZmxpY2tpdHlcIiksZGVsZXRlIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQsZGVsZXRlIGZbdGhpcy5ndWlkXX0sbi5leHRlbmQocCxyKSxsLmRhdGE9ZnVuY3Rpb24odCl7dD1uLmdldFF1ZXJ5RWxlbWVudCh0KTt2YXIgZT10JiZ0LmZsaWNraXR5R1VJRDtyZXR1cm4gZSYmZltlXX0sbi5odG1sSW5pdChsLFwiZmxpY2tpdHlcIiksaCYmaC5icmlkZ2V0JiZoLmJyaWRnZXQoXCJmbGlja2l0eVwiLGwpLGwuQ2VsbD1zLGx9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5Vbmlwb2ludGVyPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApfSxzLnVuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMSl9LHMuX2JpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKGUsaSl7aT12b2lkIDA9PT1pfHwhIWk7dmFyIG49aT9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIjt0Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZD9lW25dKFwicG9pbnRlcmRvd25cIix0aGlzKTp0Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkP2Vbbl0oXCJNU1BvaW50ZXJEb3duXCIsdGhpcyk6KGVbbl0oXCJtb3VzZWRvd25cIix0aGlzKSxlW25dKFwidG91Y2hzdGFydFwiLHRoaXMpKX0scy5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LHMuZ2V0VG91Y2g9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBpPXRbZV07aWYoaS5pZGVudGlmaWVyPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyKXJldHVybiBpfX0scy5vbm1vdXNlZG93bj1mdW5jdGlvbih0KXt2YXIgZT10LmJ1dHRvbjtlJiYwIT09ZSYmMSE9PWV8fHRoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMub250b3VjaHN0YXJ0PWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdC5jaGFuZ2VkVG91Y2hlc1swXSl9LHMub25NU1BvaW50ZXJEb3duPXMub25wb2ludGVyZG93bj1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLl9wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuaXNQb2ludGVyRG93bnx8KHRoaXMuaXNQb2ludGVyRG93bj0hMCx0aGlzLnBvaW50ZXJJZGVudGlmaWVyPXZvaWQgMCE9PWUucG9pbnRlcklkP2UucG9pbnRlcklkOmUuaWRlbnRpZmllcix0aGlzLnBvaW50ZXJEb3duKHQsZSkpfSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfTt2YXIgbz17bW91c2Vkb3duOltcIm1vdXNlbW92ZVwiLFwibW91c2V1cFwiXSx0b3VjaHN0YXJ0OltcInRvdWNobW92ZVwiLFwidG91Y2hlbmRcIixcInRvdWNoY2FuY2VsXCJdLHBvaW50ZXJkb3duOltcInBvaW50ZXJtb3ZlXCIsXCJwb2ludGVydXBcIixcInBvaW50ZXJjYW5jZWxcIl0sTVNQb2ludGVyRG93bjpbXCJNU1BvaW50ZXJNb3ZlXCIsXCJNU1BvaW50ZXJVcFwiLFwiTVNQb2ludGVyQ2FuY2VsXCJdfTtyZXR1cm4gcy5fYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbihlKXtpZihlKXt2YXIgaT1vW2UudHlwZV07aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuYWRkRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSx0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM9aX19LHMuX3VuYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyYmKHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSxkZWxldGUgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzKX0scy5vbm1vdXNlbW92ZT1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9uTVNQb2ludGVyTW92ZT1zLm9ucG9pbnRlcm1vdmU9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub250b3VjaG1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyTW92ZSh0LGUpfSxzLl9wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMucG9pbnRlck1vdmUodCxlKX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlXSl9LHMub25tb3VzZXVwPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9uTVNQb2ludGVyVXA9cy5vbnBvaW50ZXJ1cD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub250b3VjaGVuZD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJVcCh0LGUpfSxzLl9wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlclVwKHQsZSl9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSl9LHMuX3BvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dGhpcy5pc1BvaW50ZXJEb3duPSExLGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyLHRoaXMuX3VuYmluZFBvc3RTdGFydEV2ZW50cygpLHRoaXMucG9pbnRlckRvbmUoKX0scy5wb2ludGVyRG9uZT1pLHMub25NU1BvaW50ZXJDYW5jZWw9cy5vbnBvaW50ZXJjYW5jZWw9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJDYW5jZWwodCx0KX0scy5vbnRvdWNoY2FuY2VsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LGUpfSxzLl9wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJDYW5jZWwodCxlKX0scy5wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyQ2FuY2VsXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1mdW5jdGlvbih0KXtyZXR1cm57eDp0LnBhZ2VYLHk6dC5wYWdlWX19LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5VbmlkcmFnZ2VyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCEwKX0scy51bmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITEpfTt2YXIgbz10Lm5hdmlnYXRvcjtyZXR1cm4gcy5fYmluZEhhbmRsZXM9ZnVuY3Rpb24odCl7dD12b2lkIDA9PT10fHwhIXQ7dmFyIGU7ZT1vLnBvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUudG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTpvLm1zUG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS5tc1RvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06aTtmb3IodmFyIG49dD9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIixzPTA7czx0aGlzLmhhbmRsZXMubGVuZ3RoO3MrKyl7dmFyIHI9dGhpcy5oYW5kbGVzW3NdO3RoaXMuX2JpbmRTdGFydEV2ZW50KHIsdCksZShyKSxyW25dKFwiY2xpY2tcIix0aGlzKX19LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXtpZihcIklOUFVUXCI9PXQudGFyZ2V0Lm5vZGVOYW1lJiZcInJhbmdlXCI9PXQudGFyZ2V0LnR5cGUpcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bih0LGUpO3ZhciBpPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7aSYmaS5ibHVyJiZpLmJsdXIoKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9LHMuX2RyYWdQb2ludGVyRG93bj1mdW5jdGlvbih0LGkpe3RoaXMucG9pbnRlckRvd25Qb2ludD1lLmdldFBvaW50ZXJQb2ludChpKTt2YXIgbj10aGlzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bih0LGkpO24mJnQucHJldmVudERlZmF1bHQoKX0scy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7cmV0dXJuXCJTRUxFQ1RcIiE9dC50YXJnZXQubm9kZU5hbWV9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxzLl9kcmFnUG9pbnRlck1vdmU9ZnVuY3Rpb24odCxpKXt2YXIgbj1lLmdldFBvaW50ZXJQb2ludChpKSxzPXt4Om4ueC10aGlzLnBvaW50ZXJEb3duUG9pbnQueCx5Om4ueS10aGlzLnBvaW50ZXJEb3duUG9pbnQueX07cmV0dXJuIXRoaXMuaXNEcmFnZ2luZyYmdGhpcy5oYXNEcmFnU3RhcnRlZChzKSYmdGhpcy5fZHJhZ1N0YXJ0KHQsaSksc30scy5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT4zfHxNYXRoLmFicyh0LnkpPjN9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxzLl9kcmFnUG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nP3RoaXMuX2RyYWdFbmQodCxlKTp0aGlzLl9zdGF0aWNDbGljayh0LGUpfSxzLl9kcmFnU3RhcnQ9ZnVuY3Rpb24odCxpKXt0aGlzLmlzRHJhZ2dpbmc9ITAsdGhpcy5kcmFnU3RhcnRQb2ludD1lLmdldFBvaW50ZXJQb2ludChpKSx0aGlzLmlzUHJldmVudGluZ0NsaWNrcz0hMCx0aGlzLmRyYWdTdGFydCh0LGkpfSxzLmRyYWdTdGFydD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ1N0YXJ0XCIsW3QsZV0pfSxzLl9kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmRyYWdNb3ZlKHQsZSxpKX0scy5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuZW1pdEV2ZW50KFwiZHJhZ01vdmVcIixbdCxlLGldKX0scy5fZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz0hMSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzfS5iaW5kKHRoaXMpKSx0aGlzLmRyYWdFbmQodCxlKX0scy5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnRW5kXCIsW3QsZV0pfSxzLm9uY2xpY2s9ZnVuY3Rpb24odCl7dGhpcy5pc1ByZXZlbnRpbmdDbGlja3MmJnQucHJldmVudERlZmF1bHQoKX0scy5fc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPXQudHlwZSl7dmFyIGk9dC50YXJnZXQubm9kZU5hbWU7XCJJTlBVVFwiIT1pJiZcIlRFWFRBUkVBXCIhPWl8fHQudGFyZ2V0LmZvY3VzKCksdGhpcy5zdGF0aWNDbGljayh0LGUpLFwibW91c2V1cFwiIT10LnR5cGUmJih0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0lnbm9yaW5nTW91c2VVcH0uYmluZCh0aGlzKSw0MDApKX19LHMuc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInN0YXRpY0NsaWNrXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1lLmdldFBvaW50ZXJQb2ludCxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvZHJhZ1wiLFtcIi4vZmxpY2tpdHlcIixcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ1bmlkcmFnZ2VyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LlVuaWRyYWdnZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcygpe3JldHVybnt4OnQucGFnZVhPZmZzZXQseTp0LnBhZ2VZT2Zmc2V0fX1uLmV4dGVuZChlLmRlZmF1bHRzLHtkcmFnZ2FibGU6ITAsZHJhZ1RocmVzaG9sZDozfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlRHJhZ1wiKTt2YXIgbz1lLnByb3RvdHlwZTtuLmV4dGVuZChvLGkucHJvdG90eXBlKTt2YXIgcj1cImNyZWF0ZVRvdWNoXCJpbiBkb2N1bWVudCxhPSExO28uX2NyZWF0ZURyYWc9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmJpbmREcmFnKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLl91aUNoYW5nZURyYWcpLHRoaXMub24oXCJjaGlsZFVJUG9pbnRlckRvd25cIix0aGlzLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMudW5iaW5kRHJhZyksciYmIWEmJih0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixmdW5jdGlvbigpe30pLGE9ITApfSxvLmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmRyYWdnYWJsZSYmIXRoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImlzLWRyYWdnYWJsZVwiKSx0aGlzLmhhbmRsZXM9W3RoaXMudmlld3BvcnRdLHRoaXMuYmluZEhhbmRsZXMoKSx0aGlzLmlzRHJhZ0JvdW5kPSEwKX0sby51bmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMudW5iaW5kSGFuZGxlcygpLGRlbGV0ZSB0aGlzLmlzRHJhZ0JvdW5kKX0sby5fdWlDaGFuZ2VEcmFnPWZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nfSxvLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnPWZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXModCl9O3ZhciBsPXtURVhUQVJFQTohMCxJTlBVVDohMCxPUFRJT046ITB9LGg9e3JhZGlvOiEwLGNoZWNrYm94OiEwLGJ1dHRvbjohMCxzdWJtaXQ6ITAsaW1hZ2U6ITAsZmlsZTohMH07by5wb2ludGVyRG93bj1mdW5jdGlvbihlLGkpe3ZhciBuPWxbZS50YXJnZXQubm9kZU5hbWVdJiYhaFtlLnRhcmdldC50eXBlXTtpZihuKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24oZSxpKTt2YXIgbz1kb2N1bWVudC5hY3RpdmVFbGVtZW50O28mJm8uYmx1ciYmbyE9dGhpcy5lbGVtZW50JiZvIT1kb2N1bWVudC5ib2R5JiZvLmJsdXIoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXMoZSksdGhpcy5kcmFnWD10aGlzLngsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QuYWRkKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoZSksdGhpcy5wb2ludGVyRG93blNjcm9sbD1zKCksdC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlckRvd25cIixlLFtpXSl9O3ZhciBjPXt0b3VjaHN0YXJ0OiEwLE1TUG9pbnRlckRvd246ITB9LGQ9e0lOUFVUOiEwLFNFTEVDVDohMH07cmV0dXJuIG8ucG9pbnRlckRvd25Gb2N1cz1mdW5jdGlvbihlKXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmIWNbZS50eXBlXSYmIWRbZS50YXJnZXQubm9kZU5hbWVdKXt2YXIgaT10LnBhZ2VZT2Zmc2V0O3RoaXMuZWxlbWVudC5mb2N1cygpLHQucGFnZVlPZmZzZXQhPWkmJnQuc2Nyb2xsVG8odC5wYWdlWE9mZnNldCxpKX19LG8uY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3ZhciBlPVwidG91Y2hzdGFydFwiPT10LnR5cGUsaT10LnRhcmdldC5ub2RlTmFtZTtyZXR1cm4hZSYmXCJTRUxFQ1RcIiE9aX0sby5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT50aGlzLm9wdGlvbnMuZHJhZ1RocmVzaG9sZH0sby5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXtkZWxldGUgdGhpcy5pc1RvdWNoU2Nyb2xsaW5nLHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyVXBcIix0LFtlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxvLnBvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksZGVsZXRlIHRoaXMucG9pbnRlckRvd25TY3JvbGx9LG8uZHJhZ1N0YXJ0PWZ1bmN0aW9uKGUsaSl7dGhpcy5kcmFnU3RhcnRQb3NpdGlvbj10aGlzLngsdGhpcy5zdGFydEFuaW1hdGlvbigpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdTdGFydFwiLGUsW2ldKX0sby5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJNb3ZlXCIsdCxbZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxvLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wcmV2aW91c0RyYWdYPXRoaXMuZHJhZ1g7dmFyIG49dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0Py0xOjEscz10aGlzLmRyYWdTdGFydFBvc2l0aW9uK2kueCpuO2lmKCF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5zbGlkZXMubGVuZ3RoKXt2YXIgbz1NYXRoLm1heCgtdGhpcy5zbGlkZXNbMF0udGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9cz5vPy41KihzK28pOnM7dmFyIHI9TWF0aC5taW4oLXRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9czxyPy41KihzK3IpOnN9dGhpcy5kcmFnWD1zLHRoaXMuZHJhZ01vdmVUaW1lPW5ldyBEYXRlLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdNb3ZlXCIsdCxbZSxpXSl9LG8uZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYodGhpcy5pc0ZyZWVTY3JvbGxpbmc9ITApO3ZhciBpPXRoaXMuZHJhZ0VuZFJlc3RpbmdTZWxlY3QoKTtpZih0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt2YXIgbj10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO3RoaXMuaXNGcmVlU2Nyb2xsaW5nPS1uPnRoaXMuc2xpZGVzWzBdLnRhcmdldCYmLW48dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXR9ZWxzZSB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbHx8aSE9dGhpcy5zZWxlY3RlZEluZGV4fHwoaSs9dGhpcy5kcmFnRW5kQm9vc3RTZWxlY3QoKSk7ZGVsZXRlIHRoaXMucHJldmlvdXNEcmFnWCx0aGlzLmlzRHJhZ1NlbGVjdD10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCx0aGlzLnNlbGVjdChpKSxkZWxldGUgdGhpcy5pc0RyYWdTZWxlY3QsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ0VuZFwiLHQsW2VdKX0sby5kcmFnRW5kUmVzdGluZ1NlbGVjdD1mdW5jdGlvbigpe1xudmFyIHQ9dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKSxlPU1hdGguYWJzKHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCx0aGlzLnNlbGVjdGVkSW5kZXgpKSxpPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwxKSxuPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwtMSkscz1pLmRpc3RhbmNlPG4uZGlzdGFuY2U/aS5pbmRleDpuLmluZGV4O3JldHVybiBzfSxvLl9nZXRDbG9zZXN0UmVzdGluZz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPXRoaXMuc2VsZWN0ZWRJbmRleCxzPTEvMCxvPXRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQ/ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDw9ZX06ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDxlfTtvKGUscykmJihuKz1pLHM9ZSxlPXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCxuKSxudWxsIT09ZSk7KWU9TWF0aC5hYnMoZSk7cmV0dXJue2Rpc3RhbmNlOnMsaW5kZXg6bi1pfX0sby5nZXRTbGlkZURpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoLHM9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmk+MSxvPXM/bi5tb2R1bG8oZSxpKTplLHI9dGhpcy5zbGlkZXNbb107aWYoIXIpcmV0dXJuIG51bGw7dmFyIGE9cz90aGlzLnNsaWRlYWJsZVdpZHRoKk1hdGguZmxvb3IoZS9pKTowO3JldHVybiB0LShyLnRhcmdldCthKX0sby5kcmFnRW5kQm9vc3RTZWxlY3Q9ZnVuY3Rpb24oKXtpZih2b2lkIDA9PT10aGlzLnByZXZpb3VzRHJhZ1h8fCF0aGlzLmRyYWdNb3ZlVGltZXx8bmV3IERhdGUtdGhpcy5kcmFnTW92ZVRpbWU+MTAwKXJldHVybiAwO3ZhciB0PXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdGhpcy5kcmFnWCx0aGlzLnNlbGVjdGVkSW5kZXgpLGU9dGhpcy5wcmV2aW91c0RyYWdYLXRoaXMuZHJhZ1g7cmV0dXJuIHQ+MCYmZT4wPzE6dDwwJiZlPDA/LTE6MH0sby5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuZ2V0UGFyZW50Q2VsbCh0LnRhcmdldCksbj1pJiZpLmVsZW1lbnQscz1pJiZ0aGlzLmNlbGxzLmluZGV4T2YoaSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwic3RhdGljQ2xpY2tcIix0LFtlLG4sc10pfSxvLm9uc2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHQ9cygpLGU9dGhpcy5wb2ludGVyRG93blNjcm9sbC54LXQueCxpPXRoaXMucG9pbnRlckRvd25TY3JvbGwueS10Lnk7KE1hdGguYWJzKGUpPjN8fE1hdGguYWJzKGkpPjMpJiZ0aGlzLl9wb2ludGVyRG9uZSgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlRhcExpc3RlbmVyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQpe3RoaXMuYmluZFRhcCh0KX12YXIgbj1pLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtyZXR1cm4gbi5iaW5kVGFwPWZ1bmN0aW9uKHQpe3QmJih0aGlzLnVuYmluZFRhcCgpLHRoaXMudGFwRWxlbWVudD10LHRoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApKX0sbi51bmJpbmRUYXA9ZnVuY3Rpb24oKXt0aGlzLnRhcEVsZW1lbnQmJih0aGlzLl9iaW5kU3RhcnRFdmVudCh0aGlzLnRhcEVsZW1lbnQsITApLGRlbGV0ZSB0aGlzLnRhcEVsZW1lbnQpfSxuLnBvaW50ZXJVcD1mdW5jdGlvbihpLG4pe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9aS50eXBlKXt2YXIgcz1lLmdldFBvaW50ZXJQb2ludChuKSxvPXRoaXMudGFwRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxyPXQucGFnZVhPZmZzZXQsYT10LnBhZ2VZT2Zmc2V0LGw9cy54Pj1vLmxlZnQrciYmcy54PD1vLnJpZ2h0K3ImJnMueT49by50b3ArYSYmcy55PD1vLmJvdHRvbSthO2lmKGwmJnRoaXMuZW1pdEV2ZW50KFwidGFwXCIsW2ksbl0pLFwibW91c2V1cFwiIT1pLnR5cGUpe3RoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITA7dmFyIGg9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIGguaXNJZ25vcmluZ01vdXNlVXB9LDQwMCl9fX0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5wb2ludGVyRG9uZSgpLHRoaXMudW5iaW5kVGFwKCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHModCxlKXt0aGlzLmRpcmVjdGlvbj10LHRoaXMucGFyZW50PWUsdGhpcy5fY3JlYXRlKCl9ZnVuY3Rpb24gbyh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD90OlwiTSBcIit0LngwK1wiLDUwIEwgXCIrdC54MStcIixcIisodC55MSs1MCkrXCIgTCBcIit0LngyK1wiLFwiKyh0LnkyKzUwKStcIiBMIFwiK3QueDMrXCIsNTAgIEwgXCIrdC54MitcIixcIisoNTAtdC55MikrXCIgTCBcIit0LngxK1wiLFwiKyg1MC10LnkxKStcIiBaXCJ9dmFyIHI9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO3MucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZD0hMCx0aGlzLmlzUHJldmlvdXM9dGhpcy5kaXJlY3Rpb249PS0xO3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMucmlnaHRUb0xlZnQ/MTotMTt0aGlzLmlzTGVmdD10aGlzLmRpcmVjdGlvbj09dDt2YXIgZT10aGlzLmVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtlLmNsYXNzTmFtZT1cImZsaWNraXR5LXByZXYtbmV4dC1idXR0b25cIixlLmNsYXNzTmFtZSs9dGhpcy5pc1ByZXZpb3VzP1wiIHByZXZpb3VzXCI6XCIgbmV4dFwiLGUuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwiYnV0dG9uXCIpLHRoaXMuZGlzYWJsZSgpLGUuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLHRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCIpO3ZhciBpPXRoaXMuY3JlYXRlU1ZHKCk7ZS5hcHBlbmRDaGlsZChpKSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5wYXJlbnQub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuYmluZFRhcCh0aGlzLmVsZW1lbnQpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCl9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKX0scy5wcm90b3R5cGUuY3JlYXRlU1ZHPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJzdmdcIik7dC5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsXCIwIDAgMTAwIDEwMFwiKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInBhdGhcIiksaT1vKHRoaXMucGFyZW50Lm9wdGlvbnMuYXJyb3dTaGFwZSk7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZFwiLGkpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixcImFycm93XCIpLHRoaXMuaXNMZWZ0fHxlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLFwidHJhbnNsYXRlKDEwMCwgMTAwKSByb3RhdGUoMTgwKSBcIiksdC5hcHBlbmRDaGlsZChlKSx0fSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbigpe2lmKHRoaXMuaXNFbmFibGVkKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciB0PXRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy5wYXJlbnRbdF0oKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PW4uaGFuZGxlRXZlbnQscy5wcm90b3R5cGUub25jbGljaz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7dCYmdD09dGhpcy5lbGVtZW50JiZ0aGlzLm9uVGFwKCl9LHMucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkfHwodGhpcy5lbGVtZW50LmRpc2FibGVkPSExLHRoaXMuaXNFbmFibGVkPSEwKX0scy5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkJiYodGhpcy5lbGVtZW50LmRpc2FibGVkPSEwLHRoaXMuaXNFbmFibGVkPSExKX0scy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzO2lmKHRoaXMucGFyZW50Lm9wdGlvbnMud3JhcEFyb3VuZCYmdC5sZW5ndGg+MSlyZXR1cm4gdm9pZCB0aGlzLmVuYWJsZSgpO3ZhciBlPXQubGVuZ3RoP3QubGVuZ3RoLTE6MCxpPXRoaXMuaXNQcmV2aW91cz8wOmUsbj10aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4PT1pP1wiZGlzYWJsZVwiOlwiZW5hYmxlXCI7dGhpc1tuXSgpfSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LG4uZXh0ZW5kKGUuZGVmYXVsdHMse3ByZXZOZXh0QnV0dG9uczohMCxhcnJvd1NoYXBlOnt4MDoxMCx4MTo2MCx5MTo1MCx4Mjo3MCx5Mjo0MCx4MzozMH19KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnNcIik7dmFyIGE9ZS5wcm90b3R5cGU7cmV0dXJuIGEuX2NyZWF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wcmV2TmV4dEJ1dHRvbnMmJih0aGlzLnByZXZCdXR0b249bmV3IHMoKC0xKSx0aGlzKSx0aGlzLm5leHRCdXR0b249bmV3IHMoMSx0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUHJldk5leHRCdXR0b25zKSl9LGEuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGEuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm9mZihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxlLlByZXZOZXh0QnV0dG9uPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BhZ2UtZG90c1wiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKHQpe3RoaXMucGFyZW50PXQsdGhpcy5fY3JlYXRlKCl9cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaG9sZGVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvbFwiKSx0aGlzLmhvbGRlci5jbGFzc05hbWU9XCJmbGlja2l0eS1wYWdlLWRvdHNcIix0aGlzLmRvdHM9W10sdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5zZXREb3RzKCksdGhpcy5iaW5kVGFwKHRoaXMuaG9sZGVyKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5ob2xkZXIpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKX0scy5wcm90b3R5cGUuc2V0RG90cz1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcy5sZW5ndGgtdGhpcy5kb3RzLmxlbmd0aDt0PjA/dGhpcy5hZGREb3RzKHQpOnQ8MCYmdGhpcy5yZW1vdmVEb3RzKC10KX0scy5wcm90b3R5cGUuYWRkRG90cz1mdW5jdGlvbih0KXtmb3IodmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGk9W107dDspe3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtuLmNsYXNzTmFtZT1cImRvdFwiLGUuYXBwZW5kQ2hpbGQobiksaS5wdXNoKG4pLHQtLX10aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlKSx0aGlzLmRvdHM9dGhpcy5kb3RzLmNvbmNhdChpKX0scy5wcm90b3R5cGUucmVtb3ZlRG90cz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmRvdHMuc3BsaWNlKHRoaXMuZG90cy5sZW5ndGgtdCx0KTtlLmZvckVhY2goZnVuY3Rpb24odCl7dGhpcy5ob2xkZXIucmVtb3ZlQ2hpbGQodCl9LHRoaXMpfSxzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWREb3QmJih0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdFwiKSx0aGlzLmRvdHMubGVuZ3RoJiYodGhpcy5zZWxlY3RlZERvdD10aGlzLmRvdHNbdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleF0sdGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3QgaXMtc2VsZWN0ZWRcIil9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKHQpe3ZhciBlPXQudGFyZ2V0O2lmKFwiTElcIj09ZS5ub2RlTmFtZSl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgaT10aGlzLmRvdHMuaW5kZXhPZihlKTt0aGlzLnBhcmVudC5zZWxlY3QoaSl9fSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxuLmV4dGVuZChlLmRlZmF1bHRzLHtwYWdlRG90czohMH0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBhZ2VEb3RzXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYWdlRG90cyYmKHRoaXMucGFnZURvdHM9bmV3IHModGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzKSx0aGlzLm9uKFwiY2VsbENoYW5nZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJyZXNpemVcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBhZ2VEb3RzKSl9LG8uYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuYWN0aXZhdGUoKX0sby51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCgpfSxvLnVwZGF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5zZXREb3RzKCl9LG8uZGVhY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGxheWVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9mbGlja2l0eVwiXSxmdW5jdGlvbih0LGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vZmxpY2tpdHlcIikpOmUodC5FdkVtaXR0ZXIsdC5maXp6eVVJVXRpbHMsdC5GbGlja2l0eSl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt0aGlzLnBhcmVudD10LHRoaXMuc3RhdGU9XCJzdG9wcGVkXCIsbyYmKHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5Q2hhbmdlKCl9LmJpbmQodGhpcyksdGhpcy5vblZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5UGxheSgpfS5iaW5kKHRoaXMpKX12YXIgcyxvO1wiaGlkZGVuXCJpbiBkb2N1bWVudD8ocz1cImhpZGRlblwiLG89XCJ2aXNpYmlsaXR5Y2hhbmdlXCIpOlwid2Via2l0SGlkZGVuXCJpbiBkb2N1bWVudCYmKHM9XCJ3ZWJraXRIaWRkZW5cIixvPVwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiKSxuLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQucHJvdG90eXBlKSxuLnByb3RvdHlwZS5wbGF5PWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCIhPXRoaXMuc3RhdGUpe3ZhciB0PWRvY3VtZW50W3NdO2lmKG8mJnQpcmV0dXJuIHZvaWQgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSk7dGhpcy5zdGF0ZT1cInBsYXlpbmdcIixvJiZkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpLHRoaXMudGljaygpfX0sbi5wcm90b3R5cGUudGljaz1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiPT10aGlzLnN0YXRlKXt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLmF1dG9QbGF5O3Q9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDozZTM7dmFyIGU9dGhpczt0aGlzLmNsZWFyKCksdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnBhcmVudC5uZXh0KCEwKSxlLnRpY2soKX0sdCl9fSxuLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5zdGF0ZT1cInN0b3BwZWRcIix0aGlzLmNsZWFyKCksbyYmZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKX0sbi5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KX0sbi5wcm90b3R5cGUucGF1c2U9ZnVuY3Rpb24oKXtcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSYmKHRoaXMuc3RhdGU9XCJwYXVzZWRcIix0aGlzLmNsZWFyKCkpfSxuLnByb3RvdHlwZS51bnBhdXNlPWZ1bmN0aW9uKCl7XCJwYXVzZWRcIj09dGhpcy5zdGF0ZSYmdGhpcy5wbGF5KCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudFtzXTt0aGlzW3Q/XCJwYXVzZVwiOlwidW5wYXVzZVwiXSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMucGxheSgpLGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpfSxlLmV4dGVuZChpLmRlZmF1bHRzLHtwYXVzZUF1dG9QbGF5T25Ib3ZlcjohMH0pLGkuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBsYXllclwiKTt2YXIgcj1pLnByb3RvdHlwZTtyZXR1cm4gci5fY3JlYXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXI9bmV3IG4odGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBsYXllciksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGxheWVyKX0sci5hY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5hdXRvUGxheSYmKHRoaXMucGxheWVyLnBsYXkoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKSl9LHIucGxheVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBsYXkoKX0sci5zdG9wUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpfSxyLnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGF1c2UoKX0sci51bnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpfSxyLmRlYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcyl9LHIub25tb3VzZWVudGVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhdXNlQXV0b1BsYXlPbkhvdmVyJiYodGhpcy5wbGF5ZXIucGF1c2UoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKSl9LHIub25tb3VzZWxlYXZlPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpfSxpLlBsYXllcj1uLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hZGQtcmVtb3ZlLWNlbGxcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2UuYXBwZW5kQ2hpbGQodC5lbGVtZW50KX0pLGV9dmFyIHM9ZS5wcm90b3R5cGU7cmV0dXJuIHMuaW5zZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fbWFrZUNlbGxzKHQpO2lmKGkmJmkubGVuZ3RoKXt2YXIgcz10aGlzLmNlbGxzLmxlbmd0aDtlPXZvaWQgMD09PWU/czplO3ZhciBvPW4oaSkscj1lPT1zO2lmKHIpdGhpcy5zbGlkZXIuYXBwZW5kQ2hpbGQobyk7ZWxzZXt2YXIgYT10aGlzLmNlbGxzW2VdLmVsZW1lbnQ7dGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKG8sYSl9aWYoMD09PWUpdGhpcy5jZWxscz1pLmNvbmNhdCh0aGlzLmNlbGxzKTtlbHNlIGlmKHIpdGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKTtlbHNle3ZhciBsPXRoaXMuY2VsbHMuc3BsaWNlKGUscy1lKTt0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpLmNvbmNhdChsKX10aGlzLl9zaXplQ2VsbHMoaSk7dmFyIGg9ZT50aGlzLnNlbGVjdGVkSW5kZXg/MDppLmxlbmd0aDt0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKGUsaCl9fSxzLmFwcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LHRoaXMuY2VsbHMubGVuZ3RoKX0scy5wcmVwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsMCl9LHMucmVtb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlLG4scz10aGlzLmdldENlbGxzKHQpLG89MCxyPXMubGVuZ3RoO2ZvcihlPTA7ZTxyO2UrKyl7bj1zW2VdO3ZhciBhPXRoaXMuY2VsbHMuaW5kZXhPZihuKTx0aGlzLnNlbGVjdGVkSW5kZXg7by09YT8xOjB9Zm9yKGU9MDtlPHI7ZSsrKW49c1tlXSxuLnJlbW92ZSgpLGkucmVtb3ZlRnJvbSh0aGlzLmNlbGxzLG4pO3MubGVuZ3RoJiZ0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKDAsbyl9LHMuX2NlbGxBZGRlZFJlbW92ZWQ9ZnVuY3Rpb24odCxlKXtlPWV8fDAsdGhpcy5zZWxlY3RlZEluZGV4Kz1lLHRoaXMuc2VsZWN0ZWRJbmRleD1NYXRoLm1heCgwLE1hdGgubWluKHRoaXMuc2xpZGVzLmxlbmd0aC0xLHRoaXMuc2VsZWN0ZWRJbmRleCkpLHRoaXMuY2VsbENoYW5nZSh0LCEwKSx0aGlzLmVtaXRFdmVudChcImNlbGxBZGRlZFJlbW92ZWRcIixbdCxlXSl9LHMuY2VsbFNpemVDaGFuZ2U9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO2lmKGUpe2UuZ2V0U2l6ZSgpO3ZhciBpPXRoaXMuY2VsbHMuaW5kZXhPZihlKTt0aGlzLmNlbGxDaGFuZ2UoaSl9fSxzLmNlbGxDaGFuZ2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlYWJsZVdpZHRoO2lmKHRoaXMuX3Bvc2l0aW9uQ2VsbHModCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQ2hhbmdlXCIsW3RdKSx0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCl7dmFyIG49aS10aGlzLnNsaWRlYWJsZVdpZHRoO3RoaXMueCs9bip0aGlzLmNlbGxBbGlnbix0aGlzLnBvc2l0aW9uU2xpZGVyKCl9ZWxzZSBlJiZ0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpLHRoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9sYXp5bG9hZFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7aWYoXCJJTUdcIj09dC5ub2RlTmFtZSYmdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpKXJldHVyblt0XTt2YXIgZT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZF1cIik7cmV0dXJuIGkubWFrZUFycmF5KGUpfWZ1bmN0aW9uIHModCxlKXt0aGlzLmltZz10LHRoaXMuZmxpY2tpdHk9ZSx0aGlzLmxvYWQoKX1lLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVMYXp5bG9hZFwiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlTGF6eWxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy5sYXp5TG9hZCl9LG8ubGF6eUxvYWQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubGF6eUxvYWQ7aWYodCl7dmFyIGU9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDowLGk9dGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyhlKSxvPVtdO2kuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgZT1uKHQpO289by5jb25jYXQoZSl9KSxvLmZvckVhY2goZnVuY3Rpb24odCl7bmV3IHModCx0aGlzKX0sdGhpcyl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1pLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpLHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIil9LHMucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5bG9hZGVkXCIpfSxzLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenllcnJvclwiKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24odCxlKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpO3ZhciBpPXRoaXMuZmxpY2tpdHkuZ2V0UGFyZW50Q2VsbCh0aGlzLmltZyksbj1pJiZpLmVsZW1lbnQ7dGhpcy5mbGlja2l0eS5jZWxsU2l6ZUNoYW5nZShuKSx0aGlzLmltZy5jbGFzc0xpc3QuYWRkKGUpLHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudChcImxhenlMb2FkXCIsdCxuKX0sZS5MYXp5TG9hZGVyPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2luZGV4XCIsW1wiLi9mbGlja2l0eVwiLFwiLi9kcmFnXCIsXCIuL3ByZXYtbmV4dC1idXR0b25cIixcIi4vcGFnZS1kb3RzXCIsXCIuL3BsYXllclwiLFwiLi9hZGQtcmVtb3ZlLWNlbGxcIixcIi4vbGF6eWxvYWRcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCIuL2RyYWdcIikscmVxdWlyZShcIi4vcHJldi1uZXh0LWJ1dHRvblwiKSxyZXF1aXJlKFwiLi9wYWdlLWRvdHNcIikscmVxdWlyZShcIi4vcGxheWVyXCIpLHJlcXVpcmUoXCIuL2FkZC1yZW1vdmUtY2VsbFwiKSxyZXF1aXJlKFwiLi9sYXp5bG9hZFwiKSkpfSh3aW5kb3csZnVuY3Rpb24odCl7cmV0dXJuIHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS1hcy1uYXYtZm9yL2FzLW5hdi1mb3JcIixbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlLGkpe3JldHVybihlLXQpKmkrdH10LmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVBc05hdkZvclwiKTt2YXIgbj10LnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZXN0cm95XCIsdGhpcy5kZXN0cm95QXNOYXZGb3IpO3ZhciB0PXRoaXMub3B0aW9ucy5hc05hdkZvcjtpZih0KXt2YXIgZT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnNldE5hdkNvbXBhbmlvbih0KX0pfX0sbi5zZXROYXZDb21wYW5pb249ZnVuY3Rpb24oaSl7aT1lLmdldFF1ZXJ5RWxlbWVudChpKTt2YXIgbj10LmRhdGEoaSk7aWYobiYmbiE9dGhpcyl7dGhpcy5uYXZDb21wYW5pb249bjt2YXIgcz10aGlzO3RoaXMub25OYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24oKXtzLm5hdkNvbXBhbmlvblNlbGVjdCgpfSxuLm9uKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vbihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSx0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9fSxuLm5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbih0KXtpZih0aGlzLm5hdkNvbXBhbmlvbil7dmFyIGU9dGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxsc1swXSxuPXRoaXMubmF2Q29tcGFuaW9uLmNlbGxzLmluZGV4T2YoZSkscz1uK3RoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHMubGVuZ3RoLTEsbz1NYXRoLmZsb29yKGkobixzLHRoaXMubmF2Q29tcGFuaW9uLmNlbGxBbGlnbikpO2lmKHRoaXMuc2VsZWN0Q2VsbChvLCExLHQpLHRoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpLCEobz49dGhpcy5jZWxscy5sZW5ndGgpKXt2YXIgcj10aGlzLmNlbGxzLnNsaWNlKG4scysxKTt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHM9ci5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pLHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcImFkZFwiKX19fSxuLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5jbGFzc0xpc3RbdF0oXCJpcy1uYXYtc2VsZWN0ZWRcIil9KX0sbi5hY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfSxuLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHM9ZnVuY3Rpb24oKXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMmJih0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIiksZGVsZXRlIHRoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyl9LG4ub25OYXZTdGF0aWNDbGljaz1mdW5jdGlvbih0LGUsaSxuKXtcIm51bWJlclwiPT10eXBlb2YgbiYmdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0Q2VsbChuKX0sbi5kZWFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKX0sbi5kZXN0cm95QXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvbiYmKHRoaXMubmF2Q29tcGFuaW9uLm9mZihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub2ZmKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLGRlbGV0ZSB0aGlzLm5hdkNvbXBhbmlvbil9LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuaW1hZ2VzTG9hZGVkPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKFwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9ZnVuY3Rpb24gcyh0LGUsbyl7cmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBzPyhcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0KSksdGhpcy5lbGVtZW50cz1uKHQpLHRoaXMub3B0aW9ucz1pKHt9LHRoaXMub3B0aW9ucyksXCJmdW5jdGlvblwiPT10eXBlb2YgZT9vPWU6aSh0aGlzLm9wdGlvbnMsZSksbyYmdGhpcy5vbihcImFsd2F5c1wiLG8pLHRoaXMuZ2V0SW1hZ2VzKCksYSYmKHRoaXMuanFEZWZlcnJlZD1uZXcgYS5EZWZlcnJlZCksdm9pZCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5jaGVjaygpfS5iaW5kKHRoaXMpKSk6bmV3IHModCxlLG8pfWZ1bmN0aW9uIG8odCl7dGhpcy5pbWc9dH1mdW5jdGlvbiByKHQsZSl7dGhpcy51cmw9dCx0aGlzLmVsZW1lbnQ9ZSx0aGlzLmltZz1uZXcgSW1hZ2V9dmFyIGE9dC5qUXVlcnksbD10LmNvbnNvbGU7cy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSkscy5wcm90b3R5cGUub3B0aW9ucz17fSxzLnByb3RvdHlwZS5nZXRJbWFnZXM9ZnVuY3Rpb24oKXt0aGlzLmltYWdlcz1bXSx0aGlzLmVsZW1lbnRzLmZvckVhY2godGhpcy5hZGRFbGVtZW50SW1hZ2VzLHRoaXMpfSxzLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzPWZ1bmN0aW9uKHQpe1wiSU1HXCI9PXQubm9kZU5hbWUmJnRoaXMuYWRkSW1hZ2UodCksdGhpcy5vcHRpb25zLmJhY2tncm91bmQ9PT0hMCYmdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyh0KTt2YXIgZT10Lm5vZGVUeXBlO2lmKGUmJmhbZV0pe2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdcIiksbj0wO248aS5sZW5ndGg7bisrKXt2YXIgcz1pW25dO3RoaXMuYWRkSW1hZ2Uocyl9aWYoXCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKXt2YXIgbz10LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmJhY2tncm91bmQpO2ZvcihuPTA7bjxvLmxlbmd0aDtuKyspe3ZhciByPW9bbl07dGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyhyKX19fX07dmFyIGg9ezE6ITAsOTohMCwxMTohMH07cmV0dXJuIHMucHJvdG90eXBlLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzPWZ1bmN0aW9uKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7aWYoZSlmb3IodmFyIGk9L3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2ksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpO251bGwhPT1uOyl7dmFyIHM9biYmblsyXTtzJiZ0aGlzLmFkZEJhY2tncm91bmQocyx0KSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSl9fSxzLnByb3RvdHlwZS5hZGRJbWFnZT1mdW5jdGlvbih0KXt2YXIgZT1uZXcgbyh0KTt0aGlzLmltYWdlcy5wdXNoKGUpfSxzLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHIodCxlKTt0aGlzLmltYWdlcy5wdXNoKGkpfSxzLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpLG4pe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnByb2dyZXNzKHQsaSxuKX0pfXZhciBlPXRoaXM7cmV0dXJuIHRoaXMucHJvZ3Jlc3NlZENvdW50PTAsdGhpcy5oYXNBbnlCcm9rZW49ITEsdGhpcy5pbWFnZXMubGVuZ3RoP3ZvaWQgdGhpcy5pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlKXtlLm9uY2UoXCJwcm9ncmVzc1wiLHQpLGUuY2hlY2soKX0pOnZvaWQgdGhpcy5jb21wbGV0ZSgpfSxzLnByb3RvdHlwZS5wcm9ncmVzcz1mdW5jdGlvbih0LGUsaSl7dGhpcy5wcm9ncmVzc2VkQ291bnQrKyx0aGlzLmhhc0FueUJyb2tlbj10aGlzLmhhc0FueUJyb2tlbnx8IXQuaXNMb2FkZWQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHQsZV0pLHRoaXMuanFEZWZlcnJlZCYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSh0aGlzLHQpLHRoaXMucHJvZ3Jlc3NlZENvdW50PT10aGlzLmltYWdlcy5sZW5ndGgmJnRoaXMuY29tcGxldGUoKSx0aGlzLm9wdGlvbnMuZGVidWcmJmwmJmwubG9nKFwicHJvZ3Jlc3M6IFwiK2ksdCxlKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmhhc0FueUJyb2tlbj9cImZhaWxcIjpcImRvbmVcIjtpZih0aGlzLmlzQ29tcGxldGU9ITAsdGhpcy5lbWl0RXZlbnQodCxbdGhpc10pLHRoaXMuZW1pdEV2ZW50KFwiYWx3YXlzXCIsW3RoaXNdKSx0aGlzLmpxRGVmZXJyZWQpe3ZhciBlPXRoaXMuaGFzQW55QnJva2VuP1wicmVqZWN0XCI6XCJyZXNvbHZlXCI7dGhpcy5qcURlZmVycmVkW2VdKHRoaXMpfX0sby5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSksby5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3JldHVybiB0P3ZvaWQgdGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIik6KHRoaXMucHJveHlJbWFnZT1uZXcgSW1hZ2UsdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdm9pZCh0aGlzLnByb3h5SW1hZ2Uuc3JjPXRoaXMuaW1nLnNyYykpfSxvLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbWcuY29tcGxldGUmJnZvaWQgMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aH0sby5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5pbWcsZV0pfSxvLnByb3RvdHlwZS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LG8ucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMCxcIm9ubG9hZFwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCExLFwib25lcnJvclwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShvLnByb3RvdHlwZSksci5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLnVybDt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3QmJih0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKSx0aGlzLnVuYmluZEV2ZW50cygpKX0sci5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5lbGVtZW50LGVdKX0scy5tYWtlSlF1ZXJ5UGx1Z2luPWZ1bmN0aW9uKGUpe2U9ZXx8dC5qUXVlcnksZSYmKGE9ZSxhLmZuLmltYWdlc0xvYWRlZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyBzKHRoaXMsdCxlKTtyZXR1cm4gaS5qcURlZmVycmVkLnByb21pc2UoYSh0aGlzKSl9KX0scy5tYWtlSlF1ZXJ5UGx1Z2luKCksc30pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImltYWdlc2xvYWRlZFwiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LmltYWdlc0xvYWRlZCl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlSW1hZ2VzTG9hZGVkXCIpO3ZhciBuPWUucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVJbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmltYWdlc0xvYWRlZCl9LG4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGkpe3ZhciBuPWUuZ2V0UGFyZW50Q2VsbChpLmltZyk7ZS5jZWxsU2l6ZUNoYW5nZShuJiZuLmVsZW1lbnQpLGUub3B0aW9ucy5mcmVlU2Nyb2xsfHxlLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfWlmKHRoaXMub3B0aW9ucy5pbWFnZXNMb2FkZWQpe3ZhciBlPXRoaXM7aSh0aGlzLnNsaWRlcikub24oXCJwcm9ncmVzc1wiLHQpfX0sZX0pOyIsIi8qKlxuICogRmxpY2tpdHkgYmFja2dyb3VuZCBsYXp5bG9hZCB2MS4wLjBcbiAqIGxhenlsb2FkIGJhY2tncm91bmQgY2VsbCBpbWFnZXNcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2ZsaWNraXR5L2pzL2luZGV4JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdmbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgdXRpbHMgKSB7XG4vKmpzaGludCBzdHJpY3Q6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlQmdMYXp5TG9hZCcpO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVCZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLmJnTGF6eUxvYWQgKTtcbn07XG5cbnByb3RvLmJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxhenlMb2FkID0gdGhpcy5vcHRpb25zLmJnTGF6eUxvYWQ7XG4gIGlmICggIWxhenlMb2FkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGdldCBhZGphY2VudCBjZWxscywgdXNlIGxhenlMb2FkIG9wdGlvbiBmb3IgYWRqYWNlbnQgY291bnRcbiAgdmFyIGFkakNvdW50ID0gdHlwZW9mIGxhenlMb2FkID09ICdudW1iZXInID8gbGF6eUxvYWQgOiAwO1xuICB2YXIgY2VsbEVsZW1zID0gdGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyggYWRqQ291bnQgKTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2VsbEVsZW1zLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsRWxlbSA9IGNlbGxFbGVtc1tpXTtcbiAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjZWxsRWxlbSApO1xuICAgIC8vIHNlbGVjdCBsYXp5IGVsZW1zIGluIGNlbGxcbiAgICB2YXIgY2hpbGRyZW4gPSBjZWxsRWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZF0nKTtcbiAgICBmb3IgKCB2YXIgaj0wOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKysgKSB7XG4gICAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjaGlsZHJlbltqXSApO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8uYmdMYXp5TG9hZEVsZW0gPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xuICBpZiAoIGF0dHIgKSB7XG4gICAgbmV3IEJnTGF6eUxvYWRlciggZWxlbSwgYXR0ciwgdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMYXp5QkdMb2FkZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBjbGFzcyB0byBoYW5kbGUgbG9hZGluZyBpbWFnZXNcbiAqL1xuZnVuY3Rpb24gQmdMYXp5TG9hZGVyKCBlbGVtLCB1cmwsIGZsaWNraXR5ICkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5mbGlja2l0eSA9IGZsaWNraXR5O1xuICB0aGlzLmxvYWQoKTtcbn1cblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IHV0aWxzLmhhbmRsZUV2ZW50O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gbG9hZCBpbWFnZVxuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gcmVtb3ZlIGF0dHJcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyB0aGlzLnVybCArICcpJztcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5bG9hZGVkJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenllcnJvcicgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiggZXZlbnQsIGNsYXNzTmFtZSApIHtcbiAgLy8gdW5iaW5kIGV2ZW50c1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcbiAgdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KCAnYmdMYXp5TG9hZCcsIGV2ZW50LCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5CZ0xhenlMb2FkZXIgPSBCZ0xhenlMb2FkZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uIDEuMi4yN1xuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBzaW5nbGU6IHRydWUsIHRoaXM6IHRydWUsIG11bHRpdmFyOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xuXG4vLyBFeHBvc2UgcGx1Z2luIGFzIGFuIEFNRCBtb2R1bGUgaWYgQU1EIGxvYWRlciBpcyBwcmVzZW50OlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW3xcXFxce30oKVtcXF1eJCsqPy5dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9ICQubm9vcCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5raWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XG4gICAgICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLW5vLXN1Z2dlc3Rpb25cIj48L2Rpdj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gQXV0b2NvbXBsZXRlLnV0aWxzLmNyZWF0ZU5vZGUob3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcblxuICAgICAgICAgICAgLy8gT25seSBzZXQgd2lkdGggaWYgaXQgd2FzIHByb3ZpZGVkOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgb3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzaXRlU2VhcmNoRGl2ID0gJCgnLnNpdGUtc2VhcmNoJyk7XG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc2l0ZVNlYXJjaERpdi5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHNpdGVTZWFyY2hEaXYub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gc2l0ZVNlYXJjaERpdi5vdXRlcldpZHRoKCkgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byByZXN0b3JlIHZhbHVlIHdoZW4gXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXNlcnZlSW5wdXQgPT09IHRydWUsIFxuICAgICAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlIGRpZCBub3QgY2hhbmdlIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlLCBpKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lciwgdGhhdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHRoYXQuZWwub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgd2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE1hdGNoID0gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsdWUpID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xuICAgICAgICAgICAgICAgIHRoYXQuaGludCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGlzIHN0cmluZyBhcnJheSwgY29udmVydCB0aGVtIHRvIHN1cHBvcnRlZCBmb3JtYXQ6XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRhdGE6IG51bGwgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgIHJlc3VsdC5zdWdnZXN0aW9ucyA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQocmVzdWx0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubm9DYWNoZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmICFyZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXV0b2NvbXBsZXRlKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0pKTtcbiIsIlxuJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG52YXIgYmFzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpO1xudmFyIGJhc2VIcmVmID0gbnVsbDtcblxuaWYgKGJhc2VzLmxlbmd0aCA+IDApIHtcbiAgICBiYXNlSHJlZiA9IGJhc2VzWzBdLmhyZWY7XG59XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIExhenkgTG9hZGluZyBJbWFnZXM6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbnZhciBteUxhenlMb2FkID0gbmV3IExhenlMb2FkKHtcbiAgICAvLyBleGFtcGxlIG9mIG9wdGlvbnMgb2JqZWN0IC0+IHNlZSBvcHRpb25zIHNlY3Rpb25cbiAgICBlbGVtZW50c19zZWxlY3RvcjogXCIuZHAtbGF6eVwiXG4gICAgLy8gdGhyb3R0bGU6IDIwMCxcbiAgICAvLyBkYXRhX3NyYzogXCJzcmNcIixcbiAgICAvLyBkYXRhX3NyY3NldDogXCJzcmNzZXRcIixcbiAgICAvLyBjYWxsYmFja19zZXQ6IGZ1bmN0aW9uKCkgeyAvKiAuLi4gKi8gfVxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gQmlnIENhcm91c2VsIChIb21lIFBhZ2UpOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbnZhciAkY2Fyb3VzZWwgPSAkKCcuY2Fyb3VzZWwnKS5mbGlja2l0eSh7XG5cdGltYWdlc0xvYWRlZDogdHJ1ZSxcblx0cGVyY2VudFBvc2l0aW9uOiBmYWxzZSxcblx0c2VsZWN0ZWRBdHRyYWN0aW9uOiAwLjAxNSxcblx0ZnJpY3Rpb246IDAuMyxcblx0cHJldk5leHRCdXR0b25zOiBmYWxzZSxcblx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRhdXRvUGxheTogdHJ1ZSxcblx0YXV0b1BsYXk6IDgwMDAsXG5cdHBhdXNlQXV0b1BsYXlPbkhvdmVyOiBmYWxzZSxcblx0YmdMYXp5TG9hZDogdHJ1ZSxcbn0pO1xuXG52YXIgJGltZ3MgPSAkY2Fyb3VzZWwuZmluZCgnLmNhcm91c2VsLWNlbGwgLmNlbGwtYmcnKTtcbi8vIGdldCB0cmFuc2Zvcm0gcHJvcGVydHlcbnZhciBkb2NTdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcbnZhciB0cmFuc2Zvcm1Qcm9wID0gdHlwZW9mIGRvY1N0eWxlLnRyYW5zZm9ybSA9PSAnc3RyaW5nJyA/XG4gICd0cmFuc2Zvcm0nIDogJ1dlYmtpdFRyYW5zZm9ybSc7XG4vLyBnZXQgRmxpY2tpdHkgaW5zdGFuY2VcbnZhciBmbGt0eSA9ICRjYXJvdXNlbC5kYXRhKCdmbGlja2l0eScpO1xuXG4kY2Fyb3VzZWwub24oICdzY3JvbGwuZmxpY2tpdHknLCBmdW5jdGlvbigpIHtcbiAgZmxrdHkuc2xpZGVzLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSwgaSApIHtcbiAgICB2YXIgaW1nID0gJGltZ3NbaV07XG4gICAgdmFyIHggPSAoIHNsaWRlLnRhcmdldCArIGZsa3R5LnggKSAqIC0xLzM7XG4gICAgaW1nLnN0eWxlWyB0cmFuc2Zvcm1Qcm9wIF0gPSAndHJhbnNsYXRlWCgnICsgeCAgKyAncHgpJztcbiAgfSk7XG59KTtcblxuJCgnLmNhcm91c2VsLW5hdi1jZWxsJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdGZsa3R5LnN0b3BQbGF5ZXIoKTtcbn0pO1xuXG52YXIgJGdhbGxlcnkgPSAkKCcuY2Fyb3VzZWwnKS5mbGlja2l0eSgpO1xuXG5mdW5jdGlvbiBvbkxvYWRlZGRhdGEoIGV2ZW50ICkge1xuXHR2YXIgY2VsbCA9ICRnYWxsZXJ5LmZsaWNraXR5KCAnZ2V0UGFyZW50Q2VsbCcsIGV2ZW50LnRhcmdldCApO1xuXHQkZ2FsbGVyeS5mbGlja2l0eSggJ2NlbGxTaXplQ2hhbmdlJywgY2VsbCAmJiBjZWxsLmVsZW1lbnQgKTtcbn1cblxuJGdhbGxlcnkuZmluZCgndmlkZW8nKS5lYWNoKCBmdW5jdGlvbiggaSwgdmlkZW8gKSB7XG5cdHZpZGVvLnBsYXkoKTtcblx0JCggdmlkZW8gKS5vbiggJ2xvYWRlZGRhdGEnLCBvbkxvYWRlZGRhdGEgKTtcbn0pO1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBTbGlkZXNob3cgYmxvY2sgKGluIGNvbnRlbnQpOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG52YXIgJHNsaWRlc2hvdyA9ICQoJy5zbGlkZXNob3cnKS5mbGlja2l0eSh7XG5cdC8vYWRhcHRpdmVIZWlnaHQ6IHRydWUsXG5cdGltYWdlc0xvYWRlZDogdHJ1ZSxcblx0bGF6eUxvYWQ6IHRydWVcbn0pO1xuXG52YXIgc2xpZGVzaG93ZmxrID0gJHNsaWRlc2hvdy5kYXRhKCdmbGlja2l0eScpO1xuXG4kc2xpZGVzaG93Lm9uKCAnc2VsZWN0LmZsaWNraXR5JywgZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKCAnRmxpY2tpdHkgc2VsZWN0ICcgKyBzbGlkZXNob3dmbGsuc2VsZWN0ZWRJbmRleCApO1xuXHQvL3NsaWRlc2hvd2Zsay5yZWxvYWRDZWxscygpO1xuXG59KVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFN0YXJ0IEZvdW5kYXRpb24gT3JiaXQgU2xpZGVyOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyB2YXIgc2xpZGVyT3B0aW9ucyA9IHtcbi8vIFx0Y29udGFpbmVyQ2xhc3M6ICdzbGlkZXJfX3NsaWRlcycsXG4vLyBcdHNsaWRlQ2xhc3M6ICdzbGlkZXJfX3NsaWRlJyxcbi8vIFx0bmV4dENsYXNzOiAnc2xpZGVyX19uYXYtLW5leHQnLFxuLy8gXHRwcmV2Q2xhc3M6ICdzbGlkZXJfX25hdi0tcHJldmlvdXMnLFxuXG4vLyB9O1xuXG5cbi8vIHZhciBzbGlkZXIgPSBuZXcgRm91bmRhdGlvbi5PcmJpdCgkKCcuc2xpZGVyJyksIHNsaWRlck9wdGlvbnMpO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vV3JhcCBldmVyeSBpZnJhbWUgaW4gYSBmbGV4IHZpZGVvIGNsYXNzIHRvIHByZXZlbnQgbGF5b3V0IGJyZWFrYWdlXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiQoJ2lmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcblx0JCh0aGlzKS53cmFwKCBcIjxkaXYgY2xhc3M9J2ZsZXgtdmlkZW8gd2lkZXNjcmVlbic+PC9kaXY+XCIgKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9EaXN0aW5ndWlzaCBkcm9wZG93bnMgb24gbW9iaWxlL2Rlc2t0b3A6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuJCgnLm5hdl9faXRlbS0tcGFyZW50JykuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHdoYXRJbnB1dC5hc2soKSA9PT0gJ3RvdWNoJykge1xuICAgIC8vIGRvIHRvdWNoIGlucHV0IHRoaW5nc1xuICAgIGlmKCEkKHRoaXMpLmhhc0NsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKSl7XG5cdCAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgJCgnLm5hdl9faXRlbS0tcGFyZW50JykucmVtb3ZlQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpO1xuXHQgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnbmF2X19pdGVtLS1pcy1ob3ZlcmVkJylcbiAgICB9XG4gIH0gZWxzZSBpZiAod2hhdElucHV0LmFzaygpID09PSAnbW91c2UnKSB7XG4gICAgLy8gZG8gbW91c2UgdGhpbmdzXG4gIH1cbn0pO1xuXG4vL0lmIGFueXRoaW5nIGluIHRoZSBtYWluIGNvbnRlbnQgY29udGFpbmVyIGlzIGNsaWNrZWQsIHJlbW92ZSBmYXV4IGhvdmVyIGNsYXNzLlxuJCgnI21haW4tY29udGVudF9fY29udGFpbmVyJykuY2xpY2soZnVuY3Rpb24oKXtcblx0JCgnLm5hdl9faXRlbScpLnJlbW92ZUNsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9TaXRlIFNlYXJjaDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5mdW5jdGlvbiB0b2dnbGVTZWFyY2hDbGFzc2VzKCl7XG5cdCQoXCJib2R5XCIpLnRvZ2dsZUNsYXNzKFwiYm9keS0tc2VhcmNoLWFjdGl2ZVwiKTtcblx0JChcIiNzaXRlLXNlYXJjaF9fZm9ybVwiKS50b2dnbGVDbGFzcyhcInNpdGUtc2VhcmNoX19mb3JtLS1pcy1pbmFjdGl2ZSBzaXRlLXNlYXJjaF9fZm9ybS0taXMtYWN0aXZlXCIpO1xuXHQkKFwiI3NpdGUtc2VhcmNoXCIpLnRvZ2dsZUNsYXNzKFwic2l0ZS1zZWFyY2gtLWlzLWluYWN0aXZlIHNpdGUtc2VhcmNoLS1pcy1hY3RpdmVcIik7XG5cdCQoXCIuaGVhZGVyX19zY3JlZW5cIikudG9nZ2xlQ2xhc3MoXCJoZWFkZXJfX3NjcmVlbi0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm1haW4tY29udGVudF9fY29udGFpbmVyXCIpLnRvZ2dsZUNsYXNzKFwibWFpbi1jb250ZW50X19jb250YWluZXItLWdyYXlzY2FsZVwiKTtcblx0JChcIi5uYXZfX3dyYXBwZXJcIikudG9nZ2xlQ2xhc3MoXCJuYXZfX3dyYXBwZXItLWdyYXlzY2FsZVwiKTtcblx0JChcIi5uYXZfX2xpbmstLXNlYXJjaFwiKS50b2dnbGVDbGFzcyhcIm5hdl9fbGluay0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblxuXHQvL0hBQ0s6IHdhaXQgZm9yIDVtcyBiZWZvcmUgY2hhbmdpbmcgZm9jdXMuIEkgZG9uJ3QgdGhpbmsgSSBuZWVkIHRoaXMgYW55bW9yZSBhY3R1YWxseS4uXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0ICAkKFwiLm5hdl9fd3JhcHBlclwiKS50b2dnbGVDbGFzcyhcIm5hdl9fd3JhcHBlci0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblx0fSwgNSk7XG5cblx0JChcIi5uYXZcIikudG9nZ2xlQ2xhc3MoXCJuYXYtLXNlYXJjaC1pcy1hY3RpdmVcIik7XG5cbn1cblxuJChcIi5uYXZfX2xpbmstLXNlYXJjaFwiKS5jbGljayhmdW5jdGlvbigpe1xuICBcdHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcbiAgXHRpZigkKFwiI21vYmlsZS1uYXZfX3dyYXBwZXJcIikuaGFzQ2xhc3MoXCJtb2JpbGUtbmF2X193cmFwcGVyLS1tb2JpbGUtbWVudS1pcy1hY3RpdmVcIikpe1xuICBcdFx0dG9nZ2xlTW9iaWxlTWVudUNsYXNzZXMoKTtcbiAgXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKS5hZGRDbGFzcygnc2l0ZS1zZWFyY2gtLW1vYmlsZScpO1xuICBcdH1cbiAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5mb2N1cygpO1xufSk7XG5cbiQoXCIubmF2X19saW5rLS1zZWFyY2gtY2FuY2VsXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaXRlLXNlYXJjaF9faW5wdXRcIikuYmx1cigpO1xufSk7XG5cbi8vV2hlbiBzZWFyY2ggZm9ybSBpcyBvdXQgb2YgZm9jdXMsIGRlYWN0aXZhdGUgaXQuXG4kKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7XG4gIFx0aWYoJChcIiNzaXRlLXNlYXJjaF9fZm9ybVwiKS5oYXNDbGFzcyhcInNpdGUtc2VhcmNoX19mb3JtLS1pcy1hY3RpdmVcIikpe1xuICBcdFx0Ly9Db21tZW50IG91dCB0aGUgZm9sbG93aW5nIGxpbmUgaWYgeW91IG5lZWQgdG8gdXNlIFdlYktpdC9CbGluayBpbnNwZWN0b3IgdG9vbCBvbiB0aGUgc2VhcmNoIChzbyBpdCBkb2Vzbid0IGxvc2UgZm9jdXMpOlxuICBcdFx0Ly90b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG4gIFx0fVxufSk7XG5cbiQoJ2lucHV0W25hbWU9XCJTZWFyY2hcIl0nKS5hdXRvY29tcGxldGUoe1xuICAgIHNlcnZpY2VVcmw6IGJhc2VIcmVmKycvaG9tZS9hdXRvQ29tcGxldGUnLFxuICAgIGRlZmVyUmVxdWVzdEJ5OiAxMDAsXG4gICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogZmFsc2UsXG4gICAgbWluQ2hhcnM6IDIsXG4gICAgYXV0b1NlbGVjdEZpcnN0OiB0cnVlLFxuICAgIHR5cGU6ICdwb3N0JyxcbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgJCgnI3NpdGUtc2VhcmNoX19mb3JtJykuc3VibWl0KCk7XG4gICAgfVxufSk7XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL01vYmlsZSBTZWFyY2g6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCdtZWRpdW0nKSkge1xuICAvLyBUcnVlIGlmIG1lZGl1bSBvciBsYXJnZVxuICAvLyBGYWxzZSBpZiBzbWFsbFxuICAkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLWRlc2t0b3BcIik7XG59ZWxzZXtcblx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1tb2JpbGVcIik7XG59XG5cblxuJChcIi5uYXZfX3RvZ2dsZS0tc2VhcmNoXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gIFx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXG5cblxuICBcdC8vYXBwZW5kIG91ciBzaXRlIHNlYXJjaCBkaXYgdG8gdGhlIGhlYWRlci5cbiAgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKCcjaGVhZGVyJykuYWRkQ2xhc3MoJ3NpdGUtc2VhcmNoLS1tb2JpbGUnKTtcbiAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5mb2N1cygpO1xufSk7XG5cbi8vSWYgd2UncmUgcmVzaXppbmcgZnJvbSBtb2JpbGUgdG8gYW55dGhpbmcgZWxzZSwgdG9nZ2xlIHRoZSBtb2JpbGUgc2VhcmNoIGlmIGl0J3MgYWN0aXZlLlxuJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbihldmVudCwgbmV3U2l6ZSwgb2xkU2l6ZSkge1xuXG5cdCBpZiAobmV3U2l6ZSA9PSBcIm1lZGl1bVwiKSB7XG5cdCBcdC8vYWxlcnQoJ2hleScpO1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLnJlbW92ZUNsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcblx0IFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1kZXNrdG9wXCIpO1xuXG5cdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbyhcIiNuYXZcIik7XG5cblxuXHQgXHRpZigkKFwiI3NpdGUtc2VhcmNoXCIpLmhhc0NsYXNzKFwic2l0ZS1zZWFyY2gtLWlzLWFjdGl2ZVwiKSl7XG5cdCBcdFx0Ly8gdG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXHQgXHR9XG5cdCB9ZWxzZSBpZihuZXdTaXplID09IFwibW9iaWxlXCIpe1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKCcjaGVhZGVyJyk7XG4gXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikucmVtb3ZlQ2xhc3MoXCJzaXRlLXNlYXJjaC0tZGVza3RvcFwiKTtcbiBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1tb2JpbGVcIik7XG5cdCBcdGlmKCQoXCIjc2l0ZS1zZWFyY2hcIikuaGFzQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtYWN0aXZlXCIpKXtcblx0IFx0XHQvLyB0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cdCBcdH1cblx0IH1cblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9Nb2JpbGUgTmF2OlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8qIG5ldyBzdHVmZiBhZGRlZCBteSBCcmFuZG9uIC0gbGF6eSBjb2RpbmcgKi9cbiQoJy5uYXZfX3RvZ2dsZS0tbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdCQoJy5uYXZfX21lbnUtaWNvbicpLnRvZ2dsZUNsYXNzKCdpcy1jbGlja2VkJyk7XG5cdCQoXCIjbmF2X19tZW51LWljb25cIikudG9nZ2xlQ2xhc3MoXCJuYXZfX21lbnUtaWNvbi0tbWVudS1pcy1hY3RpdmVcIik7XG5cdCQodGhpcykucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbn0pO1xuXG4kKCcuc2Vjb25kLWxldmVsLS1vcGVuJykuY2xpY2soZnVuY3Rpb24oKXtcblx0JCh0aGlzKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnbmF2X19pdGVtLS1vcGVuZWQnKTtcblx0aWYgKCQodGhpcykubmV4dCgpLmF0dHIoJ2FyaWEtaGlkZGVuJykgPT0gJ3RydWUnKSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxuXHR9IGVsc2Uge1xuXHRcdCQodGhpcykubmV4dCgpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuXHR9XG5cblx0aWYgKCQodGhpcykuYXR0cignYXJpYS1leHBhbmRlZCcpID09ICdmYWxzZScpIHtcblx0XHQkKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpXG5cdH0gZWxzZSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG5cdH1cbn0pO1xuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gQmFja2dyb3VuZCBWaWRlb1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4kKCcuYmFja2dyb3VuZHZpZGVvX19saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XG5cdHZhciB0aGF0ID0gJCh0aGlzKTtcblx0dmFyIHZpZGVvID0gdGhhdC5kYXRhKCd2aWRlbycpO1xuXHR2YXIgd2lkdGggPSAkKCdpbWcnLCB0aGF0KS53aWR0aCgpO1xuXHR2YXIgaGVpZ2h0ID0gJCgnaW1nJywgdGhhdCkuaGVpZ2h0KCk7XG5cdHRoYXQucGFyZW50KCkuYWRkQ2xhc3MoJ29uJyk7XG5cdHRoYXQucGFyZW50KCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZsZXgtdmlkZW8gd2lkZXNjcmVlblwiPjxpZnJhbWUgc3JjPVwiaHR0cDovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgdmlkZW8gKyAnP3JlbD0wJmF1dG9wbGF5PTFcIiB3aWR0aD1cIicgKyB3aWR0aCArICdcIiBoZWlnaHQ9XCInICsgaGVpZ2h0ICsgJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdEFsbG93RnVsbFNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dGdWxsU2NyZWVuPjwvaWZyYW1lPjwvZGl2PicpO1xuXHR0aGF0LmhpZGUoKTtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5cblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vQXV0b21hdGljIGZ1bGwgaGVpZ2h0IHNpbGRlciwgbm90IHdvcmtpbmcgeWV0Li5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vLyBmdW5jdGlvbiBzZXREaW1lbnNpb25zKCl7XG4vLyAgICB2YXIgd2luZG93c0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcblxuLy8gICAgJCgnLm9yYml0LWNvbnRhaW5lcicpLmNzcygnaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuLy8gICAvLyAkKCcub3JiaXQtY29udGFpbmVyJykuY3NzKCdtYXgtaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuXG4vLyAgICAkKCcub3JiaXQtc2xpZGUnKS5jc3MoJ2hlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcbi8vICAgICQoJy5vcmJpdC1zbGlkZScpLmNzcygnbWF4LWhlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcbi8vIH1cblxuLy8gJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbi8vICAgICBzZXREaW1lbnNpb25zKCk7XG4vLyB9KTtcblxuLy8gc2V0RGltZW5zaW9ucygpOyJdfQ==
