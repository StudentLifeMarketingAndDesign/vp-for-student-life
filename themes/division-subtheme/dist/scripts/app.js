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
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function (a, b) {
  "function" == typeof define && define.amd ? define([], b) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? module.exports = b() : a.LazyLoad = b();
}(window, function () {
  var a = "onscroll" in window && !/glebot/.test(navigator.userAgent),
      b = function b(a) {
    return a.getBoundingClientRect().top + window.pageYOffset - a.ownerDocument.documentElement.clientTop;
  },
      c = function c(a, _c, d) {
    return (_c === window ? window.innerHeight + window.pageYOffset : b(_c) + _c.offsetHeight) <= b(a) - d;
  },
      d = function d(a) {
    return a.getBoundingClientRect().left + window.pageXOffset - a.ownerDocument.documentElement.clientLeft;
  },
      e = function e(a, b, c) {
    var e = window.innerWidth;return (b === window ? e + window.pageXOffset : d(b) + e) <= d(a) - c;
  },
      f = function f(a, c, d) {
    return (c === window ? window.pageYOffset : b(c)) >= b(a) + d + a.offsetHeight;
  },
      g = function g(a, b, c) {
    return (b === window ? window.pageXOffset : d(b)) >= d(a) + c + a.offsetWidth;
  },
      h = function h(a, b, d) {
    return !(c(a, b, d) || f(a, b, d) || e(a, b, d) || g(a, b, d));
  },
      i = function i(a, b) {
    a && a(b);
  },
      j = { elements_selector: "img", container: window, threshold: 300, throttle: 150, data_src: "original", data_srcset: "original-set", class_loading: "loading", class_loaded: "loaded", class_error: "error", skip_invisible: !0, callback_load: null, callback_error: null, callback_set: null, callback_processed: null };
  var k = function () {
    function k(a) {
      _classCallCheck(this, k);

      this._settings = Object.assign({}, j, a), this._queryOriginNode = this._settings.container === window ? document : this._settings.container, this._previousLoopTime = 0, this._loopTimeout = null, this._boundHandleScroll = this.handleScroll.bind(this), window.addEventListener("resize", this._boundHandleScroll), this.update();
    }

    _createClass(k, [{
      key: "_setSourcesForPicture",
      value: function _setSourcesForPicture(a, b) {
        var c = a.parentElement;if ("PICTURE" === c.tagName) for (var _a = 0; _a < c.children.length; _a++) {
          var _d = c.children[_a];if ("SOURCE" === _d.tagName) {
            var _a2 = _d.getAttribute("data-" + b);_a2 && _d.setAttribute("srcset", _a2);
          }
        }
      }
    }, {
      key: "_setSources",
      value: function _setSources(a, b, c) {
        var d = a.tagName,
            e = a.getAttribute("data-" + c);if ("IMG" === d) {
          this._setSourcesForPicture(a, b);var _c2 = a.getAttribute("data-" + b);return _c2 && a.setAttribute("srcset", _c2), void (e && a.setAttribute("src", e));
        }if ("IFRAME" === d) return void (e && a.setAttribute("src", e));e && (a.style.backgroundImage = "url(" + e + ")");
      }
    }, {
      key: "_showOnAppear",
      value: function _showOnAppear(a) {
        var b = this._settings,
            c = function c() {
          b && (a.removeEventListener("load", d), a.removeEventListener("error", c), a.classList.remove(b.class_loading), a.classList.add(b.class_error), i(b.callback_error, a));
        },
            d = function d() {
          b && (a.classList.remove(b.class_loading), a.classList.add(b.class_loaded), a.removeEventListener("load", d), a.removeEventListener("error", c), i(b.callback_load, a));
        };"IMG" !== a.tagName && "IFRAME" !== a.tagName || (a.addEventListener("load", d), a.addEventListener("error", c), a.classList.add(b.class_loading)), this._setSources(a, b.data_srcset, b.data_src), i(b.callback_set, a);
      }
    }, {
      key: "_loopThroughElements",
      value: function _loopThroughElements() {
        var b = this._settings,
            c = this._elements,
            d = c ? c.length : 0;var e = void 0,
            f = [];for (e = 0; e < d; e++) {
          var _d2 = c[e];b.skip_invisible && null === _d2.offsetParent || a && h(_d2, b.container, b.threshold) && (this._showOnAppear(_d2), f.push(e), _d2.wasProcessed = !0);
        }for (; f.length > 0;) {
          c.splice(f.pop(), 1), i(b.callback_processed, c.length);
        }0 === d && this._stopScrollHandler();
      }
    }, {
      key: "_purgeElements",
      value: function _purgeElements() {
        var a = this._elements,
            b = a.length;var c = void 0,
            d = [];for (c = 0; c < b; c++) {
          var _b = a[c];_b.wasProcessed && d.push(c);
        }for (; d.length > 0;) {
          a.splice(d.pop(), 1);
        }
      }
    }, {
      key: "_startScrollHandler",
      value: function _startScrollHandler() {
        this._isHandlingScroll || (this._isHandlingScroll = !0, this._settings.container.addEventListener("scroll", this._boundHandleScroll));
      }
    }, {
      key: "_stopScrollHandler",
      value: function _stopScrollHandler() {
        this._isHandlingScroll && (this._isHandlingScroll = !1, this._settings.container.removeEventListener("scroll", this._boundHandleScroll));
      }
    }, {
      key: "handleScroll",
      value: function handleScroll() {
        var a = this._settings.throttle;if (0 !== a) {
          var _b2 = function _b2() {
            new Date().getTime();
          };var _c3 = _b2(),
              _d3 = a - (_c3 - this._previousLoopTime);_d3 <= 0 || _d3 > a ? (this._loopTimeout && (clearTimeout(this._loopTimeout), this._loopTimeout = null), this._previousLoopTime = _c3, this._loopThroughElements()) : this._loopTimeout || (this._loopTimeout = setTimeout(function () {
            this._previousLoopTime = _b2(), this._loopTimeout = null, this._loopThroughElements();
          }.bind(this), _d3));
        } else this._loopThroughElements();
      }
    }, {
      key: "update",
      value: function update() {
        this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector)), this._purgeElements(), this._loopThroughElements(), this._startScrollHandler();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        window.removeEventListener("resize", this._boundHandleScroll), this._loopTimeout && (clearTimeout(this._loopTimeout), this._loopTimeout = null), this._stopScrollHandler(), this._elements = null, this._queryOriginNode = null, this._settings = null;
      }
    }]);

    return k;
  }();

  return k;
});
//# sourceMappingURL=lazyload.min.js.map
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi50YWJzLmpzIiwibGF6eWxvYWQubWluLmpzIiwiZmxpY2tpdHkucGtnZC5taW4uanMiLCJmbGlja2l0eWJnLWxhenlsb2FkLmpzIiwianF1ZXJ5LWF1dG9jb21wbGV0ZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyIkIiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJsZW5ndGgiLCJuYW1lc3BhY2UiLCJNYXRoIiwicm91bmQiLCJwb3ciLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwicmVmbG93IiwiZWxlbSIsImkiLCIkZWxlbSIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwiZSIsIm9wdCIsIm1hcCIsImVsIiwidHJpbSIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImVuZCIsInQiLCJzdHlsZSIsInNldFRpbWVvdXQiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsIk1lZGlhUXVlcnkiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwbHVnQ2xhc3MiLCJ1bmRlZmluZWQiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsIndpbmRvdyIsImZuIiwiRGF0ZSIsIm5vdyIsImdldFRpbWUiLCJ2ZW5kb3JzIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImpRdWVyeSIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImVsZW1lbnQiLCJwYXJlbnQiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwicGFyRGltcyIsIm9mZnNldCIsImhlaWdodCIsIndpZHRoIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYXJSZWN0IiwicGFyZW50Tm9kZSIsIndpblJlY3QiLCJib2R5Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInBvc2l0aW9uIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJldmVudCIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsImV4dGVuZCIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJpcyIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCJlcSIsIiRsYXN0Rm9jdXNhYmxlIiwib24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwib2ZmIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm1hdGNoZWQiLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93Iiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJmaW5pc2giLCJoaWRlIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsImNoaWxkcmVuIiwiQnVybiIsIlRpbWVyIiwib3B0aW9ucyIsIm5hbWVTcGFjZSIsInJlbWFpbiIsImlzUGF1c2VkIiwicmVzdGFydCIsImluZmluaXRlIiwicGF1c2UiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwiY29tcGxldGUiLCJyZWFkeVN0YXRlIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcmMiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwiZG9jdW1lbnRFbGVtZW50IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXQiLCJ0ZWFyZG93biIsInNwZWNpYWwiLCJzd2lwZSIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwiY2xvc2VtZUxpc3RlbmVyIiwieWV0aUJveGVzIiwicGx1Z05hbWVzIiwibGlzdGVuZXJzIiwiam9pbiIsInBsdWdpbklkIiwibm90IiwiZGVib3VuY2UiLCIkbm9kZXMiLCJub2RlcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uIiwibXV0YXRpb25SZWNvcmRzTGlzdCIsIiR0YXJnZXQiLCJhdHRyaWJ1dGVOYW1lIiwiY2xvc2VzdCIsImVsZW1lbnRPYnNlcnZlciIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJJSGVhcllvdSIsIkFjY29yZGlvbiIsImRlZmF1bHRzIiwiJHRhYnMiLCJpZHgiLCIkY29udGVudCIsImxpbmtJZCIsIiRpbml0QWN0aXZlIiwiZmlyc3RUaW1lSW5pdCIsImRvd24iLCJfY2hlY2tEZWVwTGluayIsImxvY2F0aW9uIiwiaGFzaCIsIiRsaW5rIiwiJGFuY2hvciIsImhhc0NsYXNzIiwiZGVlcExpbmtTbXVkZ2UiLCJsb2FkIiwic2Nyb2xsVG9wIiwiZGVlcExpbmtTbXVkZ2VEZWxheSIsImRlZXBMaW5rIiwiX2V2ZW50cyIsIiR0YWJDb250ZW50IiwidG9nZ2xlIiwibmV4dCIsIiRhIiwibXVsdGlFeHBhbmQiLCJwcmV2aW91cyIsInByZXYiLCJ1cCIsInVwZGF0ZUhpc3RvcnkiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwicmVwbGFjZVN0YXRlIiwiZmlyc3RUaW1lIiwiJGN1cnJlbnRBY3RpdmUiLCJzbGlkZURvd24iLCJzbGlkZVNwZWVkIiwiJGF1bnRzIiwic2libGluZ3MiLCJhbGxvd0FsbENsb3NlZCIsInNsaWRlVXAiLCJzdG9wIiwiSW50ZXJjaGFuZ2UiLCJydWxlcyIsImN1cnJlbnRQYXRoIiwiX2FkZEJyZWFrcG9pbnRzIiwiX2dlbmVyYXRlUnVsZXMiLCJfcmVmbG93IiwibWF0Y2giLCJydWxlIiwicGF0aCIsIlNQRUNJQUxfUVVFUklFUyIsInJ1bGVzTGlzdCIsIm5vZGVOYW1lIiwicmVzcG9uc2UiLCJodG1sIiwiT2ZmQ2FudmFzIiwiJGxhc3RUcmlnZ2VyIiwiJHRyaWdnZXJzIiwidHJhbnNpdGlvbiIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsInNldEF0dHJpYnV0ZSIsIiRvdmVybGF5IiwiYXBwZW5kIiwiaXNSZXZlYWxlZCIsIlJlZ0V4cCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJvcGVuIiwiY2xvc2UiLCJfaGFuZGxlS2V5Ym9hcmQiLCJjbG9zZU9uQ2xpY2siLCJyZXZlYWwiLCIkY2xvc2VyIiwic2Nyb2xsSGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiYWxsb3dVcCIsImFsbG93RG93biIsImxhc3RZIiwib3JpZ2luYWxFdmVudCIsImZvcmNlVG8iLCJzY3JvbGxUbyIsImNvbnRlbnRTY3JvbGwiLCJfc3RvcFNjcm9sbGluZyIsIl9yZWNvcmRTY3JvbGxhYmxlIiwiX3N0b3BTY3JvbGxQcm9wYWdhdGlvbiIsImF1dG9Gb2N1cyIsImNhbnZhc0ZvY3VzIiwiVGFicyIsIiR0YWJUaXRsZXMiLCJsaW5rQ2xhc3MiLCJpc0FjdGl2ZSIsImxpbmtBY3RpdmVDbGFzcyIsIm1hdGNoSGVpZ2h0IiwiJGltYWdlcyIsIl9zZXRIZWlnaHQiLCJzZWxlY3RUYWIiLCJfYWRkS2V5SGFuZGxlciIsIl9hZGRDbGlja0hhbmRsZXIiLCJfc2V0SGVpZ2h0TXFIYW5kbGVyIiwiX2hhbmRsZVRhYkNoYW5nZSIsIiRlbGVtZW50cyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIndyYXBPbktleXMiLCJsYXN0IiwibWluIiwiaGlzdG9yeUhhbmRsZWQiLCJhY3RpdmVDb2xsYXBzZSIsIl9jb2xsYXBzZVRhYiIsIiRvbGRUYWIiLCIkdGFiTGluayIsIiR0YXJnZXRDb250ZW50IiwiX29wZW5UYWIiLCJwYW5lbEFjdGl2ZUNsYXNzIiwiJHRhcmdldF9hbmNob3IiLCJpZFN0ciIsInBhbmVsQ2xhc3MiLCJwYW5lbCIsInRlbXAiLCJhIiwiYiIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJMYXp5TG9hZCIsIm93bmVyRG9jdW1lbnQiLCJjbGllbnRUb3AiLCJjIiwiZCIsImlubmVySGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwiY2xpZW50TGVmdCIsImlubmVyV2lkdGgiLCJmIiwiZyIsImgiLCJqIiwiZWxlbWVudHNfc2VsZWN0b3IiLCJjb250YWluZXIiLCJ0aHJlc2hvbGQiLCJkYXRhX3NyYyIsImRhdGFfc3Jjc2V0IiwiY2xhc3NfbG9hZGluZyIsImNsYXNzX2xvYWRlZCIsImNsYXNzX2Vycm9yIiwic2tpcF9pbnZpc2libGUiLCJjYWxsYmFja19sb2FkIiwiY2FsbGJhY2tfZXJyb3IiLCJjYWxsYmFja19zZXQiLCJjYWxsYmFja19wcm9jZXNzZWQiLCJfc2V0dGluZ3MiLCJhc3NpZ24iLCJfcXVlcnlPcmlnaW5Ob2RlIiwiX3ByZXZpb3VzTG9vcFRpbWUiLCJfbG9vcFRpbWVvdXQiLCJfYm91bmRIYW5kbGVTY3JvbGwiLCJoYW5kbGVTY3JvbGwiLCJ1cGRhdGUiLCJwYXJlbnRFbGVtZW50IiwidGFnTmFtZSIsImdldEF0dHJpYnV0ZSIsIl9zZXRTb3VyY2VzRm9yUGljdHVyZSIsImJhY2tncm91bmRJbWFnZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsIl9zZXRTb3VyY2VzIiwiX2VsZW1lbnRzIiwib2Zmc2V0UGFyZW50IiwiX3Nob3dPbkFwcGVhciIsIndhc1Byb2Nlc3NlZCIsInBvcCIsIl9zdG9wU2Nyb2xsSGFuZGxlciIsIl9pc0hhbmRsaW5nU2Nyb2xsIiwiX2xvb3BUaHJvdWdoRWxlbWVudHMiLCJfcHVyZ2VFbGVtZW50cyIsIl9zdGFydFNjcm9sbEhhbmRsZXIiLCJyZXF1aXJlIiwialF1ZXJ5QnJpZGdldCIsIm8iLCJsIiwibiIsInMiLCJyIiwiY2hhckF0Iiwib3B0aW9uIiwiaXNQbGFpbk9iamVjdCIsImJyaWRnZXQiLCJFdkVtaXR0ZXIiLCJvbmNlIiwiX29uY2VFdmVudHMiLCJlbWl0RXZlbnQiLCJnZXRTaXplIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwicGFkZGluZyIsImJvcmRlclN0eWxlIiwiYm9yZGVyV2lkdGgiLCJib3hTaXppbmciLCJhcHBlbmRDaGlsZCIsImlzQm94U2l6ZU91dGVyIiwicmVtb3ZlQ2hpbGQiLCJxdWVyeVNlbGVjdG9yIiwibm9kZVR5cGUiLCJkaXNwbGF5IiwiaXNCb3JkZXJCb3giLCJ1IiwidiIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJtIiwibWFyZ2luTGVmdCIsIm1hcmdpblJpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiUyIsImJvcmRlckxlZnRXaWR0aCIsImJvcmRlclJpZ2h0V2lkdGgiLCJFIiwiYm9yZGVyVG9wV2lkdGgiLCJib3JkZXJCb3R0b21XaWR0aCIsIkMiLCJtYXRjaGVzU2VsZWN0b3IiLCJFbGVtZW50IiwiZml6enlVSVV0aWxzIiwibW9kdWxvIiwibWFrZUFycmF5IiwicmVtb3ZlRnJvbSIsImdldFBhcmVudCIsImdldFF1ZXJ5RWxlbWVudCIsImhhbmRsZUV2ZW50IiwiZmlsdGVyRmluZEVsZW1lbnRzIiwiSFRNTEVsZW1lbnQiLCJkZWJvdW5jZU1ldGhvZCIsImRvY1JlYWR5IiwidG9EYXNoZWQiLCJodG1sSW5pdCIsIkpTT04iLCJwYXJzZSIsIkZsaWNraXR5IiwiQ2VsbCIsImNyZWF0ZSIsInNoaWZ0IiwiZGVzdHJveSIsIm9yaWdpblNpZGUiLCJzZXRQb3NpdGlvbiIsInVwZGF0ZVRhcmdldCIsInJlbmRlclBvc2l0aW9uIiwic2V0RGVmYXVsdFRhcmdldCIsImNlbGxBbGlnbiIsImdldFBvc2l0aW9uVmFsdWUiLCJ3cmFwU2hpZnQiLCJzbGlkZWFibGVXaWR0aCIsIlNsaWRlIiwiaXNPcmlnaW5MZWZ0IiwiY2VsbHMiLCJhZGRDZWxsIiwiZmlyc3RNYXJnaW4iLCJnZXRMYXN0Q2VsbCIsInNlbGVjdCIsImNoYW5nZVNlbGVjdGVkQ2xhc3MiLCJ1bnNlbGVjdCIsImdldENlbGxFbGVtZW50cyIsImFuaW1hdGVQcm90b3R5cGUiLCJ3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzdGFydEFuaW1hdGlvbiIsImlzQW5pbWF0aW5nIiwicmVzdGluZ0ZyYW1lcyIsImFwcGx5RHJhZ0ZvcmNlIiwiYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24iLCJpbnRlZ3JhdGVQaHlzaWNzIiwicG9zaXRpb25TbGlkZXIiLCJzZXR0bGUiLCJ0cmFuc2Zvcm0iLCJ3cmFwQXJvdW5kIiwic2hpZnRXcmFwQ2VsbHMiLCJjdXJzb3JQb3NpdGlvbiIsInJpZ2h0VG9MZWZ0Iiwic2xpZGVyIiwic2xpZGVzIiwic2xpZGVzV2lkdGgiLCJwb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQiLCJzZWxlY3RlZFNsaWRlIiwicGVyY2VudFBvc2l0aW9uIiwiaXNQb2ludGVyRG93biIsImlzRnJlZVNjcm9sbGluZyIsIl9zaGlmdENlbGxzIiwiYmVmb3JlU2hpZnRDZWxscyIsImFmdGVyU2hpZnRDZWxscyIsIl91bnNoaWZ0Q2VsbHMiLCJ2ZWxvY2l0eSIsImdldEZyaWN0aW9uRmFjdG9yIiwiYXBwbHlGb3JjZSIsImdldFJlc3RpbmdQb3NpdGlvbiIsImRyYWdYIiwic2VsZWN0ZWRBdHRyYWN0aW9uIiwiZmxpY2tpdHlHVUlEIiwiX2NyZWF0ZSIsImFjY2Vzc2liaWxpdHkiLCJmcmVlU2Nyb2xsRnJpY3Rpb24iLCJmcmljdGlvbiIsIm5hbWVzcGFjZUpRdWVyeUV2ZW50cyIsInJlc2l6ZSIsInNldEdhbGxlcnlTaXplIiwiY3JlYXRlTWV0aG9kcyIsImd1aWQiLCJzZWxlY3RlZEluZGV4Iiwidmlld3BvcnQiLCJfY3JlYXRlU2xpZGVyIiwid2F0Y2hDU1MiLCJhY3RpdmF0ZSIsIl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzIiwicmVsb2FkQ2VsbHMiLCJ0YWJJbmRleCIsImluaXRpYWxJbmRleCIsImlzSW5pdEFjdGl2YXRlZCIsImNlbGxTZWxlY3RvciIsIl9tYWtlQ2VsbHMiLCJwb3NpdGlvbkNlbGxzIiwiX2dldFdyYXBTaGlmdENlbGxzIiwiZ2V0TGFzdFNsaWRlIiwiX3NpemVDZWxscyIsIl9wb3NpdGlvbkNlbGxzIiwibWF4Q2VsbEhlaWdodCIsInVwZGF0ZVNsaWRlcyIsIl9jb250YWluU2xpZGVzIiwiX2dldENhbkNlbGxGaXQiLCJ1cGRhdGVTZWxlY3RlZFNsaWRlIiwiZ3JvdXBDZWxscyIsInBhcnNlSW50IiwicmVwb3NpdGlvbiIsInNldENlbGxBbGlnbiIsImNlbnRlciIsImFkYXB0aXZlSGVpZ2h0IiwiX2dldEdhcENlbGxzIiwiY29udGFpbiIsIkV2ZW50IiwiX3dyYXBTZWxlY3QiLCJpc0RyYWdTZWxlY3QiLCJ1bnNlbGVjdFNlbGVjdGVkU2xpZGUiLCJzZWxlY3RlZENlbGxzIiwic2VsZWN0ZWRFbGVtZW50cyIsInNlbGVjdGVkQ2VsbCIsInNlbGVjdGVkRWxlbWVudCIsInNlbGVjdENlbGwiLCJnZXRDZWxsIiwiZ2V0Q2VsbHMiLCJnZXRQYXJlbnRDZWxsIiwiZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMiLCJ1aUNoYW5nZSIsImNoaWxkVUlQb2ludGVyRG93biIsIm9ucmVzaXplIiwiY29udGVudCIsImRlYWN0aXZhdGUiLCJvbmtleWRvd24iLCJhY3RpdmVFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwiVW5pcG9pbnRlciIsImJpbmRTdGFydEV2ZW50IiwiX2JpbmRTdGFydEV2ZW50IiwidW5iaW5kU3RhcnRFdmVudCIsInBvaW50ZXJFbmFibGVkIiwibXNQb2ludGVyRW5hYmxlZCIsImdldFRvdWNoIiwiaWRlbnRpZmllciIsInBvaW50ZXJJZGVudGlmaWVyIiwib25tb3VzZWRvd24iLCJidXR0b24iLCJfcG9pbnRlckRvd24iLCJvbnRvdWNoc3RhcnQiLCJvbk1TUG9pbnRlckRvd24iLCJvbnBvaW50ZXJkb3duIiwicG9pbnRlcklkIiwicG9pbnRlckRvd24iLCJfYmluZFBvc3RTdGFydEV2ZW50cyIsIm1vdXNlZG93biIsInBvaW50ZXJkb3duIiwiTVNQb2ludGVyRG93biIsIl9ib3VuZFBvaW50ZXJFdmVudHMiLCJfdW5iaW5kUG9zdFN0YXJ0RXZlbnRzIiwib25tb3VzZW1vdmUiLCJfcG9pbnRlck1vdmUiLCJvbk1TUG9pbnRlck1vdmUiLCJvbnBvaW50ZXJtb3ZlIiwib250b3VjaG1vdmUiLCJwb2ludGVyTW92ZSIsIm9ubW91c2V1cCIsIl9wb2ludGVyVXAiLCJvbk1TUG9pbnRlclVwIiwib25wb2ludGVydXAiLCJvbnRvdWNoZW5kIiwiX3BvaW50ZXJEb25lIiwicG9pbnRlclVwIiwicG9pbnRlckRvbmUiLCJvbk1TUG9pbnRlckNhbmNlbCIsIm9ucG9pbnRlcmNhbmNlbCIsIl9wb2ludGVyQ2FuY2VsIiwib250b3VjaGNhbmNlbCIsInBvaW50ZXJDYW5jZWwiLCJnZXRQb2ludGVyUG9pbnQiLCJVbmlkcmFnZ2VyIiwiYmluZEhhbmRsZXMiLCJfYmluZEhhbmRsZXMiLCJ1bmJpbmRIYW5kbGVzIiwidG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwiaGFuZGxlcyIsIl9kcmFnUG9pbnRlckRvd24iLCJibHVyIiwicG9pbnRlckRvd25Qb2ludCIsImNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biIsIl9kcmFnUG9pbnRlck1vdmUiLCJfZHJhZ01vdmUiLCJpc0RyYWdnaW5nIiwiaGFzRHJhZ1N0YXJ0ZWQiLCJfZHJhZ1N0YXJ0IiwiX2RyYWdQb2ludGVyVXAiLCJfZHJhZ0VuZCIsIl9zdGF0aWNDbGljayIsImRyYWdTdGFydFBvaW50IiwiaXNQcmV2ZW50aW5nQ2xpY2tzIiwiZHJhZ1N0YXJ0IiwiZHJhZ01vdmUiLCJkcmFnRW5kIiwib25jbGljayIsImlzSWdub3JpbmdNb3VzZVVwIiwic3RhdGljQ2xpY2siLCJkcmFnZ2FibGUiLCJkcmFnVGhyZXNob2xkIiwiX2NyZWF0ZURyYWciLCJiaW5kRHJhZyIsIl91aUNoYW5nZURyYWciLCJfY2hpbGRVSVBvaW50ZXJEb3duRHJhZyIsInVuYmluZERyYWciLCJpc0RyYWdCb3VuZCIsInBvaW50ZXJEb3duRm9jdXMiLCJURVhUQVJFQSIsIklOUFVUIiwiT1BUSU9OIiwicmFkaW8iLCJjaGVja2JveCIsInN1Ym1pdCIsImltYWdlIiwiZmlsZSIsInBvaW50ZXJEb3duU2Nyb2xsIiwiU0VMRUNUIiwiaXNUb3VjaFNjcm9sbGluZyIsImRyYWdTdGFydFBvc2l0aW9uIiwicHJldmlvdXNEcmFnWCIsImRyYWdNb3ZlVGltZSIsImZyZWVTY3JvbGwiLCJkcmFnRW5kUmVzdGluZ1NlbGVjdCIsImRyYWdFbmRCb29zdFNlbGVjdCIsImdldFNsaWRlRGlzdGFuY2UiLCJfZ2V0Q2xvc2VzdFJlc3RpbmciLCJkaXN0YW5jZSIsImluZGV4IiwiZmxvb3IiLCJvbnNjcm9sbCIsIlRhcExpc3RlbmVyIiwiYmluZFRhcCIsInVuYmluZFRhcCIsInRhcEVsZW1lbnQiLCJkaXJlY3Rpb24iLCJ4MCIsIngxIiwieTEiLCJ4MiIsInkyIiwieDMiLCJpc0VuYWJsZWQiLCJpc1ByZXZpb3VzIiwiaXNMZWZ0IiwiZGlzYWJsZSIsImNyZWF0ZVNWRyIsIm9uVGFwIiwiY3JlYXRlRWxlbWVudE5TIiwiYXJyb3dTaGFwZSIsImVuYWJsZSIsImRpc2FibGVkIiwicHJldk5leHRCdXR0b25zIiwiX2NyZWF0ZVByZXZOZXh0QnV0dG9ucyIsInByZXZCdXR0b24iLCJuZXh0QnV0dG9uIiwiYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJkZWFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiUHJldk5leHRCdXR0b24iLCJob2xkZXIiLCJkb3RzIiwic2V0RG90cyIsImFkZERvdHMiLCJyZW1vdmVEb3RzIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsInVwZGF0ZVNlbGVjdGVkIiwic2VsZWN0ZWREb3QiLCJQYWdlRG90cyIsInBhZ2VEb3RzIiwiX2NyZWF0ZVBhZ2VEb3RzIiwiYWN0aXZhdGVQYWdlRG90cyIsInVwZGF0ZVNlbGVjdGVkUGFnZURvdHMiLCJ1cGRhdGVQYWdlRG90cyIsImRlYWN0aXZhdGVQYWdlRG90cyIsInN0YXRlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwidmlzaWJpbGl0eUNoYW5nZSIsIm9uVmlzaWJpbGl0eVBsYXkiLCJ2aXNpYmlsaXR5UGxheSIsInBsYXkiLCJ0aWNrIiwiYXV0b1BsYXkiLCJjbGVhciIsInRpbWVvdXQiLCJ1bnBhdXNlIiwicGF1c2VBdXRvUGxheU9uSG92ZXIiLCJfY3JlYXRlUGxheWVyIiwicGxheWVyIiwiYWN0aXZhdGVQbGF5ZXIiLCJzdG9wUGxheWVyIiwiZGVhY3RpdmF0ZVBsYXllciIsInBsYXlQbGF5ZXIiLCJwYXVzZVBsYXllciIsInVucGF1c2VQbGF5ZXIiLCJvbm1vdXNlZW50ZXIiLCJvbm1vdXNlbGVhdmUiLCJQbGF5ZXIiLCJpbnNlcnQiLCJfY2VsbEFkZGVkUmVtb3ZlZCIsInByZXBlbmQiLCJjZWxsQ2hhbmdlIiwiY2VsbFNpemVDaGFuZ2UiLCJpbWciLCJmbGlja2l0eSIsIl9jcmVhdGVMYXp5bG9hZCIsImxhenlMb2FkIiwib25sb2FkIiwib25lcnJvciIsIkxhenlMb2FkZXIiLCJfY3JlYXRlQXNOYXZGb3IiLCJhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVzdHJveUFzTmF2Rm9yIiwiYXNOYXZGb3IiLCJzZXROYXZDb21wYW5pb24iLCJuYXZDb21wYW5pb24iLCJvbk5hdkNvbXBhbmlvblNlbGVjdCIsIm5hdkNvbXBhbmlvblNlbGVjdCIsIm9uTmF2U3RhdGljQ2xpY2siLCJyZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzIiwibmF2U2VsZWN0ZWRFbGVtZW50cyIsImNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MiLCJpbWFnZXNMb2FkZWQiLCJlbGVtZW50cyIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwidXJsIiwiSW1hZ2UiLCJhZGRFbGVtZW50SW1hZ2VzIiwiYWRkSW1hZ2UiLCJiYWNrZ3JvdW5kIiwiYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMiLCJhZGRCYWNrZ3JvdW5kIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc2VkQ291bnQiLCJoYXNBbnlCcm9rZW4iLCJpc0xvYWRlZCIsIm5vdGlmeSIsImRlYnVnIiwibG9nIiwiaXNDb21wbGV0ZSIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwidW5iaW5kRXZlbnRzIiwibWFrZUpRdWVyeVBsdWdpbiIsInByb21pc2UiLCJfY3JlYXRlSW1hZ2VzTG9hZGVkIiwiZmFjdG9yeSIsInV0aWxzIiwicHJvdG8iLCJfY3JlYXRlQmdMYXp5TG9hZCIsImJnTGF6eUxvYWQiLCJhZGpDb3VudCIsImNlbGxFbGVtcyIsImNlbGxFbGVtIiwiYmdMYXp5TG9hZEVsZW0iLCJCZ0xhenlMb2FkZXIiLCJlc2NhcGVSZWdFeENoYXJzIiwiY3JlYXRlTm9kZSIsImNvbnRhaW5lckNsYXNzIiwiZGl2IiwiRVNDIiwiVEFCIiwiUkVUVVJOIiwiTEVGVCIsIlVQIiwiUklHSFQiLCJET1dOIiwiQXV0b2NvbXBsZXRlIiwidGhhdCIsImFqYXhTZXR0aW5ncyIsImF1dG9TZWxlY3RGaXJzdCIsInNlcnZpY2VVcmwiLCJsb29rdXAiLCJvblNlbGVjdCIsIm1pbkNoYXJzIiwibWF4SGVpZ2h0IiwiZGVmZXJSZXF1ZXN0QnkiLCJwYXJhbXMiLCJmb3JtYXRSZXN1bHQiLCJkZWxpbWl0ZXIiLCJ6SW5kZXgiLCJub0NhY2hlIiwib25TZWFyY2hTdGFydCIsIm9uU2VhcmNoQ29tcGxldGUiLCJvblNlYXJjaEVycm9yIiwicHJlc2VydmVJbnB1dCIsInRhYkRpc2FibGVkIiwiZGF0YVR5cGUiLCJjdXJyZW50UmVxdWVzdCIsInRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQiLCJwcmV2ZW50QmFkUXVlcmllcyIsImxvb2t1cEZpbHRlciIsInN1Z2dlc3Rpb24iLCJvcmlnaW5hbFF1ZXJ5IiwicXVlcnlMb3dlckNhc2UiLCJwYXJhbU5hbWUiLCJ0cmFuc2Zvcm1SZXN1bHQiLCJwYXJzZUpTT04iLCJzaG93Tm9TdWdnZXN0aW9uTm90aWNlIiwibm9TdWdnZXN0aW9uTm90aWNlIiwib3JpZW50YXRpb24iLCJmb3JjZUZpeFBvc2l0aW9uIiwic3VnZ2VzdGlvbnMiLCJiYWRRdWVyaWVzIiwiY3VycmVudFZhbHVlIiwiaW50ZXJ2YWxJZCIsImNhY2hlZFJlc3BvbnNlIiwib25DaGFuZ2VJbnRlcnZhbCIsIm9uQ2hhbmdlIiwiaXNMb2NhbCIsInN1Z2dlc3Rpb25zQ29udGFpbmVyIiwibm9TdWdnZXN0aW9uc0NvbnRhaW5lciIsImNsYXNzZXMiLCJzZWxlY3RlZCIsImhpbnQiLCJoaW50VmFsdWUiLCJzZWxlY3Rpb24iLCJpbml0aWFsaXplIiwic2V0T3B0aW9ucyIsInBhdHRlcm4iLCJraWxsZXJGbiIsInN1Z2dlc3Rpb25TZWxlY3RvciIsImtpbGxTdWdnZXN0aW9ucyIsImRpc2FibGVLaWxsZXJGbiIsImZpeFBvc2l0aW9uQ2FwdHVyZSIsInZpc2libGUiLCJmaXhQb3NpdGlvbiIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwib25CbHVyIiwib25Gb2N1cyIsIm9uVmFsdWVDaGFuZ2UiLCJlbmFibGVLaWxsZXJGbiIsImFib3J0QWpheCIsImFib3J0Iiwic3VwcGxpZWRPcHRpb25zIiwidmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQiLCJ2YWxpZGF0ZU9yaWVudGF0aW9uIiwiY2xlYXJDYWNoZSIsImNsZWFySW50ZXJ2YWwiLCIkY29udGFpbmVyIiwiY29udGFpbmVyUGFyZW50Iiwic2l0ZVNlYXJjaERpdiIsImNvbnRhaW5lckhlaWdodCIsInN0eWxlcyIsInZpZXdQb3J0SGVpZ2h0IiwidG9wT3ZlcmZsb3ciLCJib3R0b21PdmVyZmxvdyIsIm9wYWNpdHkiLCJwYXJlbnRPZmZzZXREaWZmIiwic3RvcEtpbGxTdWdnZXN0aW9ucyIsInNldEludGVydmFsIiwiaXNDdXJzb3JBdEVuZCIsInZhbExlbmd0aCIsInNlbGVjdGlvblN0YXJ0IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsIm1vdmVTdGFydCIsInN1Z2dlc3QiLCJvbkhpbnQiLCJzZWxlY3RIaW50IiwibW92ZVVwIiwibW92ZURvd24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJmaW5kQmVzdEhpbnQiLCJnZXRRdWVyeSIsIm9uSW52YWxpZGF0ZVNlbGVjdGlvbiIsImlzRXhhY3RNYXRjaCIsImdldFN1Z2dlc3Rpb25zIiwiZ2V0U3VnZ2VzdGlvbnNMb2NhbCIsImxpbWl0IiwibG9va3VwTGltaXQiLCJncmVwIiwicSIsImNhY2hlS2V5IiwiaWdub3JlUGFyYW1zIiwiaXNGdW5jdGlvbiIsImlzQmFkUXVlcnkiLCJhamF4IiwiZG9uZSIsInJlc3VsdCIsInByb2Nlc3NSZXNwb25zZSIsImZhaWwiLCJqcVhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIm9uSGlkZSIsInNpZ25hbEhpbnQiLCJub1N1Z2dlc3Rpb25zIiwiZ3JvdXBCeSIsImNsYXNzU2VsZWN0ZWQiLCJiZWZvcmVSZW5kZXIiLCJjYXRlZ29yeSIsImZvcm1hdEdyb3VwIiwiY3VycmVudENhdGVnb3J5IiwiYWRqdXN0Q29udGFpbmVyV2lkdGgiLCJkZXRhY2giLCJlbXB0eSIsImJlc3RNYXRjaCIsImZvdW5kTWF0Y2giLCJzdWJzdHIiLCJmYWxsYmFjayIsImluQXJyYXkiLCJhY3RpdmVJdGVtIiwiYWRqdXN0U2Nyb2xsIiwib2Zmc2V0VG9wIiwidXBwZXJCb3VuZCIsImxvd2VyQm91bmQiLCJoZWlnaHREZWx0YSIsImdldFZhbHVlIiwib25TZWxlY3RDYWxsYmFjayIsImRpc3Bvc2UiLCJhdXRvY29tcGxldGUiLCJkZXZicmlkZ2VBdXRvY29tcGxldGUiLCJkYXRhS2V5IiwiaW5wdXRFbGVtZW50IiwiaW5zdGFuY2UiLCJiYXNlcyIsImJhc2VIcmVmIiwiaHJlZiIsIm15TGF6eUxvYWQiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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OztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFuVEEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMC42XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVmFyaWFibGVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gW1xuXHQgICAgJ2lucHV0Jyxcblx0ICAgICdzZWxlY3QnLFxuXHQgICAgJ3RleHRhcmVhJ1xuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gW1xuXHQgICAgMTYsIC8vIHNoaWZ0XG5cdCAgICAxNywgLy8gY29udHJvbFxuXHQgICAgMTgsIC8vIGFsdFxuXHQgICAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICAgIDkzICAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICAna2V5dXAnOiAna2V5Ym9hcmQnLFxuXHQgICAgJ21vdXNlZG93bic6ICdtb3VzZScsXG5cdCAgICAnbW91c2Vtb3ZlJzogJ21vdXNlJyxcblx0ICAgICdNU1BvaW50ZXJEb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ01TUG9pbnRlck1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcmRvd24nOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcm1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAndG91Y2hzdGFydCc6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgLy8gdG91Y2ggYnVmZmVyIHRpbWVyXG5cdCAgdmFyIHRvdWNoVGltZXIgPSBudWxsO1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBTZXQgdXBcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBFdmVudHNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChcblx0ICAgICAgICBjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8XG5cdCAgICAgICAgY3VycmVudEludGVudCAhPT0gdmFsdWVcblx0ICAgICAgKSB7XG5cblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gKFxuXHQgICAgICAgICAgYWN0aXZlRWxlbSAmJlxuXHQgICAgICAgICAgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJlxuXHQgICAgICAgICAgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xXG5cdCAgICAgICAgKSA/IHRydWUgOiBmYWxzZTtcblxuXHQgICAgICAgIGlmIChcblx0ICAgICAgICAgIHZhbHVlID09PSAndG91Y2gnIHx8XG5cblx0ICAgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgICAodmFsdWUgPT09ICdtb3VzZScgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkgfHxcblxuXHQgICAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgICAodmFsdWUgPT09ICdrZXlib2FyZCcgJiYgYWN0aXZlSW5wdXQpXG5cdCAgICAgICAgKSB7XG5cblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24oKSB7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBjbGVhciB0aGUgdGltZXIgaWYgaXQgaGFwcGVucyB0byBiZSBydW5uaW5nXG5cdCAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvdWNoVGltZXIpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblxuXHQgICAgLy8gc2V0IHRoZSBpc0J1ZmZlcmluZyB0byBgdHJ1ZWBcblx0ICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblxuXHQgICAgLy8gcnVuIHRoZSB0aW1lclxuXHQgICAgdG91Y2hUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdCAgICAgIC8vIGlmIHRoZSB0aW1lciBydW5zIG91dCwgc2V0IGlzQnVmZmVyaW5nIGJhY2sgdG8gYGZhbHNlYFxuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXHQgICAgfSwgMjAwKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBVdGlsaXRpZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbihldmVudCkge1xuXHQgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nKSA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTsgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpID9cblx0ICAgICAgJ3doZWVsJyA6IC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXG5cdCAgICAgIGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID9cblx0ICAgICAgICAnbW91c2V3aGVlbCcgOiAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgICAnRE9NTW91c2VTY3JvbGwnOyAvLyBsZXQncyBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBJbml0XG5cblx0ICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgICAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIGlmIChcblx0ICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiZcblx0ICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG5cdCAgKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgQVBJXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgcmV0dXJuIHtcblxuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gKG9wdCA9PT0gJ2xvb3NlJykgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0OyB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24oKSB7IHJldHVybiBpbnB1dFR5cGVzOyB9XG5cblx0ICB9O1xuXG5cdH0oKSk7XG5cblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpeyByZXR1cm4gZmFsc2U7IH1cbiAgbGV0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuXG5cdCAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuXHRcdCAgfVxuXHRcdCAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuXHRcdCAgIH1cblx0XHQgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcblx0XHQgIH1cblx0XHQgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy9ub3RoaW5nXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIC8vZm9yIGVhY2ggZWxlbWVudCB0aGF0IG5lZWRzIHRvIGxpc3RlbiBmb3IgcmVzaXppbmcsIHNjcm9sbGluZywgb3IgbXV0YXRpb24gYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZShub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBbUEhdXG4vLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xuRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4vLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpIHtcbiAgICAgIHZhciAkZWwgPSAkKGVsKSxcbiAgICAgICAgICAkY29udGVudCA9ICRlbC5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICAkY29udGVudC5hdHRyKHsncm9sZSc6ICd0YWJwYW5lbCcsICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWQsICdhcmlhLWhpZGRlbic6IHRydWUsICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IHRydWU7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKSxcbiAgICAgICAgJGFuY2hvciA9ICQoYW5jaG9yKTtcblxuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoICYmICRhbmNob3IpIHtcbiAgICAgICAgICBpZiAoISRsaW5rLnBhcmVudCgnW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJykuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oJGFuY2hvciwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3RoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYuYWNjb3JkaW9uJywgWyRsaW5rLCAkYW5jaG9yXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIGFjY29yZGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJHRhYkNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICRlbGVtLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb24ga2V5ZG93bi56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBjb250ZW50IHBhbmUncyBvcGVuL2Nsb3NlIHN0YXRlLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIGpRdWVyeSBvYmplY3Qgb2YgdGhlIHBhbmUgdG8gdG9nZ2xlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCR0YXJnZXQpIHtcbiAgICBpZigkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgdGhpcy51cCgkdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgIH1cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5wcmV2KCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgYWNjb3JkaW9uIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gcGFuZSB0byBvcGVuIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3RUaW1lIC0gZmxhZyB0byBkZXRlcm1pbmUgaWYgcmVmbG93IHNob3VsZCBoYXBwZW4uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZG93blxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRvd24oJHRhcmdldCwgZmlyc3RUaW1lKSB7XG4gICAgJHRhcmdldFxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpXG4gICAgICAucGFyZW50KCdbZGF0YS10YWItY29udGVudF0nKVxuICAgICAgLmFkZEJhY2soKVxuICAgICAgLnBhcmVudCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kICYmICFmaXJzdFRpbWUpIHtcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJGN1cnJlbnRBY3RpdmUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMudXAoJGN1cnJlbnRBY3RpdmUubm90KCR0YXJnZXQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkdGFyZ2V0LnNsaWRlRG93bih0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgKCkgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkb3duXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZG93bi56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogdHJ1ZSxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiB0YWIgdG8gY2xvc2UgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZpcmVzIEFjY29yZGlvbiN1cFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHVwKCR0YXJnZXQpIHtcbiAgICB2YXIgJGF1bnRzID0gJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZigoIXRoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCAmJiAhJGF1bnRzLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkgfHwgISR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZVVwKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgJHRhcmdldC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgICAgICAgIC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZGVzdHJveWVkXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLnN0b3AodHJ1ZSkuc2xpZGVVcCgwKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykub2ZmKCcuemYuYWNjb3JkaW9uJyk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtdWx0aUV4cGFuZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGNsb3NlIGFsbCBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgYWNjb3JkaW9uIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gYWNjb3JkaW9uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogSW50ZXJjaGFuZ2UgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmludGVyY2hhbmdlXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxuICovXG5cbmNsYXNzIEludGVyY2hhbmdlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgSW50ZXJjaGFuZ2UuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEludGVyY2hhbmdlLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50UGF0aCA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnSW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgSW50ZXJjaGFuZ2UgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IGludGVyY2hhbmdlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fYWRkQnJlYWtwb2ludHMoKTtcbiAgICB0aGlzLl9nZW5lcmF0ZVJ1bGVzKCk7XG4gICAgdGhpcy5fcmVmbG93KCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBJbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLmludGVyY2hhbmdlJywgRm91bmRhdGlvbi51dGlsLnRocm90dGxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3JlZmxvdygpO1xuICAgIH0sIDUwKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlLCBidXQgb25seSBzYXZlIHRoZSBsYXN0IG1hdGNoXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnJ1bGVzKSB7XG4gICAgICBpZih0aGlzLnJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gdGhpcy5ydWxlc1tpXTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHJ1bGUucXVlcnkpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHRoaXMucmVwbGFjZShtYXRjaC5wYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCcmVha3BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpIGluIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXNbaV07XG4gICAgICAgIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeS5uYW1lXSA9IHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIEludGVyY2hhbmdlIGVsZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBtZWRpYSBxdWVyeSArIGNvbnRlbnQgcGFpcmluZ3NcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0aGF0IGlzIGFuIEludGVyY2hhbmdlIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcbiAgICovXG4gIF9nZW5lcmF0ZVJ1bGVzKGVsZW1lbnQpIHtcbiAgICB2YXIgcnVsZXNMaXN0ID0gW107XG4gICAgdmFyIHJ1bGVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ydWxlcykge1xuICAgICAgcnVsZXMgPSB0aGlzLm9wdGlvbnMucnVsZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ2ludGVyY2hhbmdlJyk7XG4gICAgfVxuICAgIFxuICAgIHJ1bGVzID0gIHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycgPyBydWxlcy5tYXRjaCgvXFxbLio/XFxdL2cpIDogcnVsZXM7XG5cbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7XG4gICAgICBpZihydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcbiAgICAgICAgdmFyIHBhdGggPSBydWxlLnNsaWNlKDAsIC0xKS5qb2luKCcnKTtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gcnVsZVtydWxlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGlmIChJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldKSB7XG4gICAgICAgICAgcXVlcnkgPSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVsZXNMaXN0LnB1c2goe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgcXVlcnk6IHF1ZXJ5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucnVsZXMgPSBydWxlc0xpc3Q7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBgc3JjYCBwcm9wZXJ0eSBvZiBhbiBpbWFnZSwgb3IgY2hhbmdlIHRoZSBIVE1MIG9mIGEgY29udGFpbmVyLCB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggdG8gdGhlIGltYWdlIG9yIEhUTUwgcGFydGlhbC5cbiAgICogQGZpcmVzIEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAqL1xuICByZXBsYWNlKHBhdGgpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aCA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgdHJpZ2dlciA9ICdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZSc7XG5cbiAgICAvLyBSZXBsYWNpbmcgaW1hZ2VzXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0ubm9kZU5hbWUgPT09ICdJTUcnKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIGJhY2tncm91bmQgaW1hZ2VzXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3xwbmd8c3ZnfHRpZmYpKFs/I10uKik/L2kpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyh7ICdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnK3BhdGgrJyknIH0pXG4gICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBIVE1MXG4gICAgZWxzZSB7XG4gICAgICAkLmdldChwYXRoLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBfdGhpcy4kZWxlbWVudC5odG1sKHJlc3BvbnNlKVxuICAgICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgICAgICAkKHJlc3BvbnNlKS5mb3VuZGF0aW9uKCk7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gY29udGVudCBpbiBhbiBJbnRlcmNoYW5nZSBlbGVtZW50IGlzIGRvbmUgYmVpbmcgbG9hZGVkLlxuICAgICAqIEBldmVudCBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgICAqL1xuICAgIC8vIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBpbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIC8vVE9ETyB0aGlzLlxuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkludGVyY2hhbmdlLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogUnVsZXMgdG8gYmUgYXBwbGllZCB0byBJbnRlcmNoYW5nZSBlbGVtZW50cy4gU2V0IHdpdGggdGhlIGBkYXRhLWludGVyY2hhbmdlYCBhcnJheSBub3RhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P2FycmF5fVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBydWxlczogbnVsbFxufTtcblxuSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTID0ge1xuICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgJ3BvcnRyYWl0JzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAncmV0aW5hJzogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksIG9ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBPZmZDYW52YXMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIE9mZkNhbnZhcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT2ZmQ2FudmFzJywge1xuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICB9KTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKGBpcy10cmFuc2l0aW9uLSR7dGhpcy5vcHRpb25zLnRyYW5zaXRpb259YCk7XG5cbiAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgIHRoaXMuJHRyaWdnZXJzID0gJChkb2N1bWVudClcbiAgICAgIC5maW5kKCdbZGF0YS1vcGVuPVwiJytpZCsnXCJdLCBbZGF0YS1jbG9zZT1cIicraWQrJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJytpZCsnXCJdJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgdGhpcy4kb3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgICBpZihvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJyk7XG4gICAgICAkdGFyZ2V0Lm9uKHsnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7ICRjbG9zZXIuaGlkZSgpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJykub24oe1xuICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICRjbG9zZXIuc2hvdygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgLy8gT25seSByZWFsbHkgd29ya3MgZm9yIHksIG5vdCBzdXJlIGhvdyB0byBleHRlbmQgdG8geCBvciBpZiB3ZSBuZWVkIHRvLlxuICBfcmVjb3JkU2Nyb2xsYWJsZShldmVudCkge1xuICAgIGxldCBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG5cbiAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZSAoY29udGVudCBvdmVyZmxvd3MpLCB0aGVuLi4uXG4gICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIHRvcCwgc2Nyb2xsIGRvd24gb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyB1cFxuICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSAwKSB7XG4gICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBib3R0b20sIHNjcm9sbCB1cCBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIGRvd25cbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQgLSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtLmFsbG93VXAgPSBlbGVtLnNjcm9sbFRvcCA+IDA7XG4gICAgZWxlbS5hbGxvd0Rvd24gPSBlbGVtLnNjcm9sbFRvcCA8IChlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KTtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgfVxuXG4gIF9zdG9wU2Nyb2xsUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuICAgIGxldCB1cCA9IGV2ZW50LnBhZ2VZIDwgZWxlbS5sYXN0WTtcbiAgICBsZXQgZG93biA9ICF1cDtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQucGFnZVk7XG5cbiAgICBpZigodXAgJiYgZWxlbS5hbGxvd1VwKSB8fCAoZG93biAmJiBlbGVtLmFsbG93RG93bikpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNvcGVuZWRcbiAgICovXG4gIG9wZW4oZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgKi9cbiAgICBfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcbiAgICAgICAgLnRyaWdnZXIoJ29wZW5lZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIGFkZCBjbGFzcyBhbmQgZGlzYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ZvY3VzID0gX3RoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYXV0b2ZvY3VzXScpO1xuICAgICAgICBpZiAoY2FudmFzRm9jdXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYW52YXNGb2N1cy5lcSgwKS5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC50cmFwRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYiB0byBmaXJlIGFmdGVyIGNsb3N1cmUuXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjY2xvc2VkXG4gICAqL1xuICBjbG9zZShjYikge1xuICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgICAqL1xuICAgICAgICAudHJpZ2dlcignY2xvc2VkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgcmVtb3ZlIGNsYXNzIGFuZCByZS1lbmFibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkucmVtb3ZlQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFwRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWxlYXNlRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG9mZi1jYW52YXMgbWVudSBvcGVuIG9yIGNsb3NlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqL1xuICB0b2dnbGUoZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpKSB7XG4gICAgICB0aGlzLmNsb3NlKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGtleWJvYXJkIGlucHV0IHdoZW4gZGV0ZWN0ZWQuIFdoZW4gdGhlIGVzY2FwZSBrZXkgaXMgcHJlc3NlZCwgdGhlIG9mZi1jYW52YXMgbWVudSBjbG9zZXMsIGFuZCBmb2N1cyBpcyByZXN0b3JlZCB0byB0aGUgZWxlbWVudCB0aGF0IG9wZW5lZCB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaGFuZGxlS2V5Ym9hcmQoZSkge1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdPZmZDYW52YXMnLCB7XG4gICAgICBjbG9zZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyLmZvY3VzKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIGhhbmRsZWQ6ICgpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBvZmZjYW52YXMgcGx1Z2luLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5vZmZjYW52YXMnKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5PZmZDYW52YXMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgdXNlciB0byBjbGljayBvdXRzaWRlIG9mIHRoZSBtZW51IHRvIGNsb3NlIGl0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gb3ZlcmxheSBvbiB0b3Agb2YgYFtkYXRhLW9mZi1jYW52YXMtY29udGVudF1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjb250ZW50T3ZlcmxheTogdHJ1ZSxcblxuICAvKipcbiAgICogRW5hYmxlL2Rpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBtYWluIGNvbnRlbnQgd2hlbiBhbiBvZmYgY2FudmFzIHBhbmVsIGlzIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRTY3JvbGw6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIGluIG1zIHRoZSBvcGVuIGFuZCBjbG9zZSB0cmFuc2l0aW9uIHJlcXVpcmVzLiBJZiBub25lIHNlbGVjdGVkLCBwdWxscyBmcm9tIGJvZHkgc3R5bGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMFxuICAgKi9cbiAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBwdXNoXG4gICAqL1xuICB0cmFuc2l0aW9uOiAncHVzaCcsXG5cbiAgLyoqXG4gICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIGZvcmNlVG86IG51bGwsXG5cbiAgLyoqXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAvKipcbiAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIHJldmVhbE9uOiBudWxsLFxuXG4gIC8qKlxuICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCByZXZlYWwtZm9yLVxuICAgKiBAdG9kbyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgKi9cbiAgcmV2ZWFsQ2xhc3M6ICdyZXZlYWwtZm9yLScsXG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIG9wdGlvbmFsIGZvY3VzIHRyYXBwaW5nIHdoZW4gb3BlbmluZyBhbiBvZmZjYW52YXMuIFNldHMgdGFiaW5kZXggb2YgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XSB0byAtMSBmb3IgYWNjZXNzaWJpbGl0eSBwdXJwb3Nlcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHRyYXBGb2N1czogZmFsc2Vcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKE9mZkNhbnZhcywgJ09mZkNhbnZhcycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogVGFicyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24udGFic1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyIGlmIHRhYnMgY29udGFpbiBpbWFnZXNcbiAqL1xuXG5jbGFzcyBUYWJzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGFicy5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBUYWJzI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byB0YWJzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRhYnMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUYWJzJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignVGFicycsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cycsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJ1xuICAgICAgLy8gJ1RBQic6ICduZXh0JyxcbiAgICAgIC8vICdTSElGVF9UQUInOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRhYnMgYnkgc2hvd2luZyBhbmQgZm9jdXNpbmcgKGlmIGF1dG9Gb2N1cz10cnVlKSB0aGUgcHJlc2V0IGFjdGl2ZSB0YWIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHsncm9sZSc6ICd0YWJsaXN0J30pO1xuICAgIHRoaXMuJHRhYlRpdGxlcyA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcbiAgICB0aGlzLiR0YWJDb250ZW50ID0gJChgW2RhdGEtdGFicy1jb250ZW50PVwiJHt0aGlzLiRlbGVtZW50WzBdLmlkfVwiXWApO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgJGxpbmsgPSAkZWxlbS5maW5kKCdhJyksXG4gICAgICAgICAgaXNBY3RpdmUgPSAkZWxlbS5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICBoYXNoID0gJGxpbmtbMF0uaGFzaC5zbGljZSgxKSxcbiAgICAgICAgICBsaW5rSWQgPSAkbGlua1swXS5pZCA/ICRsaW5rWzBdLmlkIDogYCR7aGFzaH0tbGFiZWxgLFxuICAgICAgICAgICR0YWJDb250ZW50ID0gJChgIyR7aGFzaH1gKTtcblxuICAgICAgJGVsZW0uYXR0cih7J3JvbGUnOiAncHJlc2VudGF0aW9uJ30pO1xuXG4gICAgICAkbGluay5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBoYXNoLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGlzQWN0aXZlLFxuICAgICAgICAnaWQnOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICAkdGFiQ29udGVudC5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFicGFuZWwnLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiAhaXNBY3RpdmUsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICBpZihpc0FjdGl2ZSAmJiBfdGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XG4gICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkZWxlbS5vZmZzZXQoKS50b3AgfSwgX3RoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5LCAoKSA9PiB7XG4gICAgICAgICAgICAkbGluay5mb2N1cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kdGFiQ29udGVudC5maW5kKCdpbWcnKTtcblxuICAgICAgaWYgKCRpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgIC8vY3VycmVudCBjb250ZXh0LWJvdW5kIGZ1bmN0aW9uIHRvIG9wZW4gdGFicyBvbiBwYWdlIGxvYWQgb3IgaGlzdG9yeSBwb3BzdGF0ZVxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKTtcbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0VGFiKCQoYW5jaG9yKSwgdHJ1ZSk7XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCB0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjZGVlcGxpbmtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYudGFicycsIFskbGluaywgJChhbmNob3IpXSk7XG4gICAgICAgICB9XG4gICAgICAgfVxuICAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICB0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcbiAgICB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcyk7XG5cbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZENsaWNrSGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9mZignY2xpY2suemYudGFicycpXG4gICAgICAub24oJ2NsaWNrLnpmLnRhYnMnLCBgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCQodGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5vZmYoJ2tleWRvd24uemYudGFicycpLm9uKCdrZXlkb3duLnpmLnRhYnMnLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmIChlLndoaWNoID09PSA5KSByZXR1cm47XG5cblxuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgJGVsZW1lbnRzID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLFxuICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy53cmFwT25LZXlzKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSBpID09PSAwID8gJGVsZW1lbnRzLmxhc3QoKSA6ICRlbGVtZW50cy5lcShpLTEpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gaSA9PT0gJGVsZW1lbnRzLmxlbmd0aCAtMSA/ICRlbGVtZW50cy5maXJzdCgpIDogJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1pbihpKzEsICRlbGVtZW50cy5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnVGFicycsIHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJGVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRwcmV2RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkbmV4dEVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLiBDb2xsYXBzZXMgYWN0aXZlIHRhYi5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gb3Blbi5cbiAgICogQHBhcmFtIHtib29sZWFufSBoaXN0b3J5SGFuZGxlZCAtIGJyb3dzZXIgaGFzIGFscmVhZHkgaGFuZGxlZCBhIGhpc3RvcnkgdXBkYXRlXG4gICAqIEBmaXJlcyBUYWJzI2NoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCwgaGlzdG9yeUhhbmRsZWQpIHtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBhY3RpdmUgY2xhc3Mgb24gdGFyZ2V0LiBDb2xsYXBzZSBpZiBleGlzdHMuXG4gICAgICovXG4gICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSkge1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYWN0aXZlQ29sbGFwc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlVGFiKCR0YXJnZXQpO1xuXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY29sbGFwc2VkIHRhYnMuXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2NvbGxhcHNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjb2xsYXBzZS56Zi50YWJzJywgWyR0YXJnZXRdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyICRvbGRUYWIgPSB0aGlzLiRlbGVtZW50LlxuICAgICAgICAgIGZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9LiR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgIC8vY2xvc2Ugb2xkIHRhYlxuICAgIHRoaXMuX2NvbGxhcHNlVGFiKCRvbGRUYWIpO1xuXG4gICAgLy9vcGVuIG5ldyB0YWJcbiAgICB0aGlzLl9vcGVuVGFiKCR0YXJnZXQpO1xuXG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluayAmJiAhaGlzdG9yeUhhbmRsZWQpIHtcbiAgICAgIHZhciBhbmNob3IgPSAkdGFyZ2V0LmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBkYXRlSGlzdG9yeSkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZCB0YWJzLlxuICAgICAqIEBldmVudCBUYWJzI2NoYW5nZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLnpmLnRhYnMnLCBbJHRhcmdldCwgJHRhcmdldENvbnRlbnRdKTtcblxuICAgIC8vZmlyZSB0byBjaGlsZHJlbiBhIG11dGF0aW9uIGV2ZW50XG4gICAgJHRhcmdldENvbnRlbnQuZmluZChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIik7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBPcGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9vcGVuVGFiKCR0YXJnZXQpIHtcbiAgICAgIHZhciAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgICAgJHRhcmdldC5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApO1xuXG4gICAgICAkdGFiTGluay5hdHRyKHsnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJ30pO1xuXG4gICAgICAkdGFyZ2V0Q29udGVudFxuICAgICAgICAuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgICAgLmF0dHIoeydhcmlhLWhpZGRlbic6ICdmYWxzZSd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfY29sbGFwc2VUYWIoJHRhcmdldCkge1xuICAgIHZhciAkdGFyZ2V0X2FuY2hvciA9ICR0YXJnZXRcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApXG4gICAgICAuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgLmF0dHIoeyAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0X2FuY2hvci5hdHRyKCdhcmlhLWNvbnRyb2xzJyl9YClcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKVxuICAgICAgLmF0dHIoeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIG1ldGhvZCBmb3Igc2VsZWN0aW5nIGEgY29udGVudCBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHwgU3RyaW5nfSBlbGVtIC0galF1ZXJ5IG9iamVjdCBvciBzdHJpbmcgb2YgdGhlIGlkIG9mIHRoZSBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNlbGVjdFRhYihlbGVtLCBoaXN0b3J5SGFuZGxlZCkge1xuICAgIHZhciBpZFN0cjtcblxuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkU3RyID0gZWxlbVswXS5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRTdHIgPSBlbGVtO1xuICAgIH1cblxuICAgIGlmIChpZFN0ci5pbmRleE9mKCcjJykgPCAwKSB7XG4gICAgICBpZFN0ciA9IGAjJHtpZFN0cn1gO1xuICAgIH1cblxuICAgIHZhciAkdGFyZ2V0ID0gdGhpcy4kdGFiVGl0bGVzLmZpbmQoYFtocmVmJD1cIiR7aWRTdHJ9XCJdYCkucGFyZW50KGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuXG4gICAgdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiBlYWNoIHBhbmVsIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgcGFuZWwuXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxuICAgKiBJZiBsb2FkaW5nIGNvbnRlbnQgdmlhIGV4dGVybmFsIHNvdXJjZSwgY2FuIGJlIGNhbGxlZCBkaXJlY3RseSBvciB3aXRoIF9yZWZsb3cuXG4gICAqIElmIGVuYWJsZWQgd2l0aCBgZGF0YS1tYXRjaC1oZWlnaHQ9XCJ0cnVlXCJgLCB0YWJzIHNldHMgdG8gZXF1YWwgaGVpZ2h0XG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldEhlaWdodCgpIHtcbiAgICB2YXIgbWF4ID0gMCxcbiAgICAgICAgX3RoaXMgPSB0aGlzOyAvLyBMb2NrIGRvd24gdGhlIGB0aGlzYCB2YWx1ZSBmb3IgdGhlIHJvb3QgdGFicyBvYmplY3RcblxuICAgIHRoaXMuJHRhYkNvbnRlbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmNzcygnaGVpZ2h0JywgJycpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcGFuZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgaXNBY3RpdmUgPSBwYW5lbC5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YCk7IC8vIGdldCB0aGUgb3B0aW9ucyBmcm9tIHRoZSBwYXJlbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ2V0IHRoZW0gZnJvbSB0aGUgY2hpbGRcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICdoaWRkZW4nLCAnZGlzcGxheSc6ICdibG9jayd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7XG4gICAgICAgICAgICAndmlzaWJpbGl0eSc6ICcnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICB9KVxuICAgICAgLmNzcygnaGVpZ2h0JywgYCR7bWF4fXB4YCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gdGFicy5cbiAgICogQGZpcmVzIFRhYnMjZGVzdHJveWVkXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApXG4gICAgICAub2ZmKCcuemYudGFicycpLmhpZGUoKS5lbmQoKVxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuaGlkZSgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgaWYgKHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciAhPSBudWxsKSB7XG4gICAgICAgICAkKHdpbmRvdykub2ZmKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRhYnMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIHRhYiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIHRhYlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIGFjdGl2ZSBwYW5lIG9uIGxvYWQgaWYgc2V0IHRvIHRydWUuXG4gICAqIE5vdCByZWNvbW1lbmRlZCBpZiBtb3JlIHRoYW4gb25lIHRhYiBwYW5lbCBwZXIgcGFnZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9Gb2N1czogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBrZXlib2FyZCBpbnB1dCB0byAnd3JhcCcgYXJvdW5kIHRoZSB0YWIgbGlua3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIHdyYXBPbktleXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdGFiIGNvbnRlbnQgcGFuZXMgdG8gbWF0Y2ggaGVpZ2h0cyBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG1hdGNoSGVpZ2h0OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGFjdGl2ZSB0YWJzIHRvIGNvbGxhcHNlIHdoZW4gY2xpY2tlZC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFjdGl2ZUNvbGxhcHNlOiBmYWxzZSxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byBgbGlgJ3MgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndGFicy10aXRsZSdcbiAgICovXG4gIGxpbmtDbGFzczogJ3RhYnMtdGl0bGUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgYGxpYCBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdpcy1hY3RpdmUnXG4gICAqL1xuICBsaW5rQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBjb250ZW50IGNvbnRhaW5lcnMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtcGFuZWwnXG4gICAqL1xuICBwYW5lbENsYXNzOiAndGFicy1wYW5lbCcsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBjb250ZW50IGNvbnRhaW5lci5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgcGFuZWxBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihUYWJzLCAnVGFicycpO1xuXG59KGpRdWVyeSk7XG4iLCIhZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGIpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWIoKTphLkxhenlMb2FkPWIoKX0od2luZG93LGZ1bmN0aW9uKCl7Y29uc3QgYT1cIm9uc2Nyb2xsXCJpbiB3aW5kb3cmJiEvZ2xlYm90Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLGI9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wK3dpbmRvdy5wYWdlWU9mZnNldC1hLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcH0sYz1mdW5jdGlvbihhLGMsZCl7cmV0dXJuKGM9PT13aW5kb3c/d2luZG93LmlubmVySGVpZ2h0K3dpbmRvdy5wYWdlWU9mZnNldDpiKGMpK2Mub2Zmc2V0SGVpZ2h0KTw9YihhKS1kfSxkPWZ1bmN0aW9uKGEpe3JldHVybiBhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQrd2luZG93LnBhZ2VYT2Zmc2V0LWEub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50TGVmdH0sZT1mdW5jdGlvbihhLGIsYyl7Y29uc3QgZT13aW5kb3cuaW5uZXJXaWR0aDtyZXR1cm4oYj09PXdpbmRvdz9lK3dpbmRvdy5wYWdlWE9mZnNldDpkKGIpK2UpPD1kKGEpLWN9LGY9ZnVuY3Rpb24oYSxjLGQpe3JldHVybihjPT09d2luZG93P3dpbmRvdy5wYWdlWU9mZnNldDpiKGMpKT49YihhKStkK2Eub2Zmc2V0SGVpZ2h0fSxnPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4oYj09PXdpbmRvdz93aW5kb3cucGFnZVhPZmZzZXQ6ZChiKSk+PWQoYSkrYythLm9mZnNldFdpZHRofSxoPWZ1bmN0aW9uKGEsYixkKXtyZXR1cm4hKGMoYSxiLGQpfHxmKGEsYixkKXx8ZShhLGIsZCl8fGcoYSxiLGQpKX0saT1mdW5jdGlvbihhLGIpe2EmJmEoYil9LGo9e2VsZW1lbnRzX3NlbGVjdG9yOlwiaW1nXCIsY29udGFpbmVyOndpbmRvdyx0aHJlc2hvbGQ6MzAwLHRocm90dGxlOjE1MCxkYXRhX3NyYzpcIm9yaWdpbmFsXCIsZGF0YV9zcmNzZXQ6XCJvcmlnaW5hbC1zZXRcIixjbGFzc19sb2FkaW5nOlwibG9hZGluZ1wiLGNsYXNzX2xvYWRlZDpcImxvYWRlZFwiLGNsYXNzX2Vycm9yOlwiZXJyb3JcIixza2lwX2ludmlzaWJsZTohMCxjYWxsYmFja19sb2FkOm51bGwsY2FsbGJhY2tfZXJyb3I6bnVsbCxjYWxsYmFja19zZXQ6bnVsbCxjYWxsYmFja19wcm9jZXNzZWQ6bnVsbH07Y2xhc3Mga3tjb25zdHJ1Y3RvcihhKXt0aGlzLl9zZXR0aW5ncz1PYmplY3QuYXNzaWduKHt9LGosYSksdGhpcy5fcXVlcnlPcmlnaW5Ob2RlPXRoaXMuX3NldHRpbmdzLmNvbnRhaW5lcj09PXdpbmRvdz9kb2N1bWVudDp0aGlzLl9zZXR0aW5ncy5jb250YWluZXIsdGhpcy5fcHJldmlvdXNMb29wVGltZT0wLHRoaXMuX2xvb3BUaW1lb3V0PW51bGwsdGhpcy5fYm91bmRIYW5kbGVTY3JvbGw9dGhpcy5oYW5kbGVTY3JvbGwuYmluZCh0aGlzKSx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKSx0aGlzLnVwZGF0ZSgpfV9zZXRTb3VyY2VzRm9yUGljdHVyZShhLGIpe2NvbnN0IGM9YS5wYXJlbnRFbGVtZW50O2lmKFwiUElDVFVSRVwiPT09Yy50YWdOYW1lKWZvcihsZXQgYT0wO2E8Yy5jaGlsZHJlbi5sZW5ndGg7YSsrKXtsZXQgZD1jLmNoaWxkcmVuW2FdO2lmKFwiU09VUkNFXCI9PT1kLnRhZ05hbWUpe2xldCBhPWQuZ2V0QXR0cmlidXRlKFwiZGF0YS1cIitiKTthJiZkLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGEpfX19X3NldFNvdXJjZXMoYSxiLGMpe2NvbnN0IGQ9YS50YWdOYW1lLGU9YS5nZXRBdHRyaWJ1dGUoXCJkYXRhLVwiK2MpO2lmKFwiSU1HXCI9PT1kKXt0aGlzLl9zZXRTb3VyY2VzRm9yUGljdHVyZShhLGIpO2NvbnN0IGM9YS5nZXRBdHRyaWJ1dGUoXCJkYXRhLVwiK2IpO3JldHVybiBjJiZhLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGMpLHZvaWQoZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNcIixlKSl9aWYoXCJJRlJBTUVcIj09PWQpcmV0dXJuIHZvaWQoZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNcIixlKSk7ZSYmKGEuc3R5bGUuYmFja2dyb3VuZEltYWdlPVwidXJsKFwiK2UrXCIpXCIpfV9zaG93T25BcHBlYXIoYSl7Y29uc3QgYj10aGlzLl9zZXR0aW5ncyxjPWZ1bmN0aW9uKCl7YiYmKGEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIixkKSxhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGMpLGEuY2xhc3NMaXN0LnJlbW92ZShiLmNsYXNzX2xvYWRpbmcpLGEuY2xhc3NMaXN0LmFkZChiLmNsYXNzX2Vycm9yKSxpKGIuY2FsbGJhY2tfZXJyb3IsYSkpfSxkPWZ1bmN0aW9uKCl7YiYmKGEuY2xhc3NMaXN0LnJlbW92ZShiLmNsYXNzX2xvYWRpbmcpLGEuY2xhc3NMaXN0LmFkZChiLmNsYXNzX2xvYWRlZCksYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLGQpLGEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsYyksaShiLmNhbGxiYWNrX2xvYWQsYSkpfTtcIklNR1wiIT09YS50YWdOYW1lJiZcIklGUkFNRVwiIT09YS50YWdOYW1lfHwoYS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLGQpLGEuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsYyksYS5jbGFzc0xpc3QuYWRkKGIuY2xhc3NfbG9hZGluZykpLHRoaXMuX3NldFNvdXJjZXMoYSxiLmRhdGFfc3Jjc2V0LGIuZGF0YV9zcmMpLGkoYi5jYWxsYmFja19zZXQsYSl9X2xvb3BUaHJvdWdoRWxlbWVudHMoKXtjb25zdCBiPXRoaXMuX3NldHRpbmdzLGM9dGhpcy5fZWxlbWVudHMsZD1jP2MubGVuZ3RoOjA7bGV0IGUsZj1bXTtmb3IoZT0wO2U8ZDtlKyspe2xldCBkPWNbZV07Yi5za2lwX2ludmlzaWJsZSYmbnVsbD09PWQub2Zmc2V0UGFyZW50fHxhJiZoKGQsYi5jb250YWluZXIsYi50aHJlc2hvbGQpJiYodGhpcy5fc2hvd09uQXBwZWFyKGQpLGYucHVzaChlKSxkLndhc1Byb2Nlc3NlZD0hMCl9Zm9yKDtmLmxlbmd0aD4wOyljLnNwbGljZShmLnBvcCgpLDEpLGkoYi5jYWxsYmFja19wcm9jZXNzZWQsYy5sZW5ndGgpOzA9PT1kJiZ0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpfV9wdXJnZUVsZW1lbnRzKCl7Y29uc3QgYT10aGlzLl9lbGVtZW50cyxiPWEubGVuZ3RoO2xldCBjLGQ9W107Zm9yKGM9MDtjPGI7YysrKXtsZXQgYj1hW2NdO2Iud2FzUHJvY2Vzc2VkJiZkLnB1c2goYyl9Zm9yKDtkLmxlbmd0aD4wOylhLnNwbGljZShkLnBvcCgpLDEpfV9zdGFydFNjcm9sbEhhbmRsZXIoKXt0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsfHwodGhpcy5faXNIYW5kbGluZ1Njcm9sbD0hMCx0aGlzLl9zZXR0aW5ncy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKSl9X3N0b3BTY3JvbGxIYW5kbGVyKCl7dGhpcy5faXNIYW5kbGluZ1Njcm9sbCYmKHRoaXMuX2lzSGFuZGxpbmdTY3JvbGw9ITEsdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCkpfWhhbmRsZVNjcm9sbCgpe2NvbnN0IGE9dGhpcy5fc2V0dGluZ3MudGhyb3R0bGU7aWYoMCE9PWEpe2NvbnN0IGI9KCk9PnsobmV3IERhdGUpLmdldFRpbWUoKX07bGV0IGM9YigpLGQ9YS0oYy10aGlzLl9wcmV2aW91c0xvb3BUaW1lKTtkPD0wfHxkPmE/KHRoaXMuX2xvb3BUaW1lb3V0JiYoY2xlYXJUaW1lb3V0KHRoaXMuX2xvb3BUaW1lb3V0KSx0aGlzLl9sb29wVGltZW91dD1udWxsKSx0aGlzLl9wcmV2aW91c0xvb3BUaW1lPWMsdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpKTp0aGlzLl9sb29wVGltZW91dHx8KHRoaXMuX2xvb3BUaW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGlzLl9wcmV2aW91c0xvb3BUaW1lPWIoKSx0aGlzLl9sb29wVGltZW91dD1udWxsLHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKX0uYmluZCh0aGlzKSxkKSl9ZWxzZSB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCl9dXBkYXRlKCl7dGhpcy5fZWxlbWVudHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fcXVlcnlPcmlnaW5Ob2RlLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fc2V0dGluZ3MuZWxlbWVudHNfc2VsZWN0b3IpKSx0aGlzLl9wdXJnZUVsZW1lbnRzKCksdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpLHRoaXMuX3N0YXJ0U2Nyb2xsSGFuZGxlcigpfWRlc3Ryb3koKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKSx0aGlzLl9sb29wVGltZW91dCYmKGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCksdGhpcy5fbG9vcFRpbWVvdXQ9bnVsbCksdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKSx0aGlzLl9lbGVtZW50cz1udWxsLHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZT1udWxsLHRoaXMuX3NldHRpbmdzPW51bGx9fXJldHVybiBrfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sYXp5bG9hZC5taW4uanMubWFwIiwiLyohXG4gKiBGbGlja2l0eSBQQUNLQUdFRCB2Mi4wLjVcbiAqIFRvdWNoLCByZXNwb25zaXZlLCBmbGlja2FibGUgY2Fyb3VzZWxzXG4gKlxuICogTGljZW5zZWQgR1BMdjMgZm9yIG9wZW4gc291cmNlIHVzZVxuICogb3IgRmxpY2tpdHkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHA6Ly9mbGlja2l0eS5tZXRhZml6enkuY29cbiAqIENvcHlyaWdodCAyMDE2IE1ldGFmaXp6eVxuICovXG5cbiFmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJqcXVlcnktYnJpZGdldC9qcXVlcnktYnJpZGdldFwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJqcXVlcnlcIikpOnQualF1ZXJ5QnJpZGdldD1lKHQsdC5qUXVlcnkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBpKGksbyxhKXtmdW5jdGlvbiBsKHQsZSxuKXt2YXIgcyxvPVwiJCgpLlwiK2krJyhcIicrZSsnXCIpJztyZXR1cm4gdC5lYWNoKGZ1bmN0aW9uKHQsbCl7dmFyIGg9YS5kYXRhKGwsaSk7aWYoIWgpcmV0dXJuIHZvaWQgcihpK1wiIG5vdCBpbml0aWFsaXplZC4gQ2Fubm90IGNhbGwgbWV0aG9kcywgaS5lLiBcIitvKTt2YXIgYz1oW2VdO2lmKCFjfHxcIl9cIj09ZS5jaGFyQXQoMCkpcmV0dXJuIHZvaWQgcihvK1wiIGlzIG5vdCBhIHZhbGlkIG1ldGhvZFwiKTt2YXIgZD1jLmFwcGx5KGgsbik7cz12b2lkIDA9PT1zP2Q6c30pLHZvaWQgMCE9PXM/czp0fWZ1bmN0aW9uIGgodCxlKXt0LmVhY2goZnVuY3Rpb24odCxuKXt2YXIgcz1hLmRhdGEobixpKTtzPyhzLm9wdGlvbihlKSxzLl9pbml0KCkpOihzPW5ldyBvKG4sZSksYS5kYXRhKG4saSxzKSl9KX1hPWF8fGV8fHQualF1ZXJ5LGEmJihvLnByb3RvdHlwZS5vcHRpb258fChvLnByb3RvdHlwZS5vcHRpb249ZnVuY3Rpb24odCl7YS5pc1BsYWluT2JqZWN0KHQpJiYodGhpcy5vcHRpb25zPWEuZXh0ZW5kKCEwLHRoaXMub3B0aW9ucyx0KSl9KSxhLmZuW2ldPWZ1bmN0aW9uKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXt2YXIgZT1zLmNhbGwoYXJndW1lbnRzLDEpO3JldHVybiBsKHRoaXMsdCxlKX1yZXR1cm4gaCh0aGlzLHQpLHRoaXN9LG4oYSkpfWZ1bmN0aW9uIG4odCl7IXR8fHQmJnQuYnJpZGdldHx8KHQuYnJpZGdldD1pKX12YXIgcz1BcnJheS5wcm90b3R5cGUuc2xpY2Usbz10LmNvbnNvbGUscj1cInVuZGVmaW5lZFwiPT10eXBlb2Ygbz9mdW5jdGlvbigpe306ZnVuY3Rpb24odCl7by5lcnJvcih0KX07cmV0dXJuIG4oZXx8dC5qUXVlcnkpLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5FdkVtaXR0ZXI9ZSgpfShcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp0aGlzLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe312YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5vbj1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3ZhciBpPXRoaXMuX2V2ZW50cz10aGlzLl9ldmVudHN8fHt9LG49aVt0XT1pW3RdfHxbXTtyZXR1cm4gbi5pbmRleE9mKGUpPT0tMSYmbi5wdXNoKGUpLHRoaXN9fSxlLm9uY2U9ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt0aGlzLm9uKHQsZSk7dmFyIGk9dGhpcy5fb25jZUV2ZW50cz10aGlzLl9vbmNlRXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8e307cmV0dXJuIG5bZV09ITAsdGhpc319LGUub2ZmPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPWkuaW5kZXhPZihlKTtyZXR1cm4gbiE9LTEmJmkuc3BsaWNlKG4sMSksdGhpc319LGUuZW1pdEV2ZW50PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPTAscz1pW25dO2U9ZXx8W107Zm9yKHZhciBvPXRoaXMuX29uY2VFdmVudHMmJnRoaXMuX29uY2VFdmVudHNbdF07czspe3ZhciByPW8mJm9bc107ciYmKHRoaXMub2ZmKHQscyksZGVsZXRlIG9bc10pLHMuYXBwbHkodGhpcyxlKSxuKz1yPzA6MSxzPWlbbl19cmV0dXJuIHRoaXN9fSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZ2V0LXNpemUvZ2V0LXNpemVcIixbXSxmdW5jdGlvbigpe3JldHVybiBlKCl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5nZXRTaXplPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt2YXIgZT1wYXJzZUZsb2F0KHQpLGk9dC5pbmRleE9mKFwiJVwiKT09LTEmJiFpc05hTihlKTtyZXR1cm4gaSYmZX1mdW5jdGlvbiBlKCl7fWZ1bmN0aW9uIGkoKXtmb3IodmFyIHQ9e3dpZHRoOjAsaGVpZ2h0OjAsaW5uZXJXaWR0aDowLGlubmVySGVpZ2h0OjAsb3V0ZXJXaWR0aDowLG91dGVySGVpZ2h0OjB9LGU9MDtlPGg7ZSsrKXt2YXIgaT1sW2VdO3RbaV09MH1yZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7cmV0dXJuIGV8fGEoXCJTdHlsZSByZXR1cm5lZCBcIitlK1wiLiBBcmUgeW91IHJ1bm5pbmcgdGhpcyBjb2RlIGluIGEgaGlkZGVuIGlmcmFtZSBvbiBGaXJlZm94PyBTZWUgaHR0cDovL2JpdC5seS9nZXRzaXplYnVnMVwiKSxlfWZ1bmN0aW9uIHMoKXtpZighYyl7Yz0hMDt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2Uuc3R5bGUud2lkdGg9XCIyMDBweFwiLGUuc3R5bGUucGFkZGluZz1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm9yZGVyU3R5bGU9XCJzb2xpZFwiLGUuc3R5bGUuYm9yZGVyV2lkdGg9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJveFNpemluZz1cImJvcmRlci1ib3hcIjt2YXIgaT1kb2N1bWVudC5ib2R5fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7aS5hcHBlbmRDaGlsZChlKTt2YXIgcz1uKGUpO28uaXNCb3hTaXplT3V0ZXI9cj0yMDA9PXQocy53aWR0aCksaS5yZW1vdmVDaGlsZChlKX19ZnVuY3Rpb24gbyhlKXtpZihzKCksXCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZSkpLGUmJlwib2JqZWN0XCI9PXR5cGVvZiBlJiZlLm5vZGVUeXBlKXt2YXIgbz1uKGUpO2lmKFwibm9uZVwiPT1vLmRpc3BsYXkpcmV0dXJuIGkoKTt2YXIgYT17fTthLndpZHRoPWUub2Zmc2V0V2lkdGgsYS5oZWlnaHQ9ZS5vZmZzZXRIZWlnaHQ7Zm9yKHZhciBjPWEuaXNCb3JkZXJCb3g9XCJib3JkZXItYm94XCI9PW8uYm94U2l6aW5nLGQ9MDtkPGg7ZCsrKXt2YXIgdT1sW2RdLGY9b1t1XSxwPXBhcnNlRmxvYXQoZik7YVt1XT1pc05hTihwKT8wOnB9dmFyIHY9YS5wYWRkaW5nTGVmdCthLnBhZGRpbmdSaWdodCxnPWEucGFkZGluZ1RvcCthLnBhZGRpbmdCb3R0b20sbT1hLm1hcmdpbkxlZnQrYS5tYXJnaW5SaWdodCx5PWEubWFyZ2luVG9wK2EubWFyZ2luQm90dG9tLFM9YS5ib3JkZXJMZWZ0V2lkdGgrYS5ib3JkZXJSaWdodFdpZHRoLEU9YS5ib3JkZXJUb3BXaWR0aCthLmJvcmRlckJvdHRvbVdpZHRoLGI9YyYmcix4PXQoby53aWR0aCk7eCE9PSExJiYoYS53aWR0aD14KyhiPzA6ditTKSk7dmFyIEM9dChvLmhlaWdodCk7cmV0dXJuIEMhPT0hMSYmKGEuaGVpZ2h0PUMrKGI/MDpnK0UpKSxhLmlubmVyV2lkdGg9YS53aWR0aC0oditTKSxhLmlubmVySGVpZ2h0PWEuaGVpZ2h0LShnK0UpLGEub3V0ZXJXaWR0aD1hLndpZHRoK20sYS5vdXRlckhlaWdodD1hLmhlaWdodCt5LGF9fXZhciByLGE9XCJ1bmRlZmluZWRcIj09dHlwZW9mIGNvbnNvbGU/ZTpmdW5jdGlvbih0KXtjb25zb2xlLmVycm9yKHQpfSxsPVtcInBhZGRpbmdMZWZ0XCIsXCJwYWRkaW5nUmlnaHRcIixcInBhZGRpbmdUb3BcIixcInBhZGRpbmdCb3R0b21cIixcIm1hcmdpbkxlZnRcIixcIm1hcmdpblJpZ2h0XCIsXCJtYXJnaW5Ub3BcIixcIm1hcmdpbkJvdHRvbVwiLFwiYm9yZGVyTGVmdFdpZHRoXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyQm90dG9tV2lkdGhcIl0saD1sLmxlbmd0aCxjPSExO3JldHVybiBvfSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQubWF0Y2hlc1NlbGVjdG9yPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oKXt2YXIgdD1FbGVtZW50LnByb3RvdHlwZTtpZih0Lm1hdGNoZXMpcmV0dXJuXCJtYXRjaGVzXCI7aWYodC5tYXRjaGVzU2VsZWN0b3IpcmV0dXJuXCJtYXRjaGVzU2VsZWN0b3JcIjtmb3IodmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdLGk9MDtpPGUubGVuZ3RoO2krKyl7dmFyIG49ZVtpXSxzPW4rXCJNYXRjaGVzU2VsZWN0b3JcIjtpZih0W3NdKXJldHVybiBzfX0oKTtyZXR1cm4gZnVuY3Rpb24oZSxpKXtyZXR1cm4gZVt0XShpKX19KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFtcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yXCIpKTp0LmZpenp5VUlVdGlscz1lKHQsdC5tYXRjaGVzU2VsZWN0b3IpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT17fTtpLmV4dGVuZD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH0saS5tb2R1bG89ZnVuY3Rpb24odCxlKXtyZXR1cm4odCVlK2UpJWV9LGkubWFrZUFycmF5PWZ1bmN0aW9uKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYodCYmXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX0saS5yZW1vdmVGcm9tPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5pbmRleE9mKGUpO2khPS0xJiZ0LnNwbGljZShpLDEpfSxpLmdldFBhcmVudD1mdW5jdGlvbih0LGkpe2Zvcig7dCE9ZG9jdW1lbnQuYm9keTspaWYodD10LnBhcmVudE5vZGUsZSh0LGkpKXJldHVybiB0fSxpLmdldFF1ZXJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpOnR9LGkuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxpLmZpbHRlckZpbmRFbGVtZW50cz1mdW5jdGlvbih0LG4pe3Q9aS5tYWtlQXJyYXkodCk7dmFyIHM9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtpZih0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe2lmKCFuKXJldHVybiB2b2lkIHMucHVzaCh0KTtlKHQsbikmJnMucHVzaCh0KTtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKG4pLG89MDtvPGkubGVuZ3RoO28rKylzLnB1c2goaVtvXSl9fSksc30saS5kZWJvdW5jZU1ldGhvZD1mdW5jdGlvbih0LGUsaSl7dmFyIG49dC5wcm90b3R5cGVbZV0scz1lK1wiVGltZW91dFwiO3QucHJvdG90eXBlW2VdPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpc1tzXTt0JiZjbGVhclRpbWVvdXQodCk7dmFyIGU9YXJndW1lbnRzLG89dGhpczt0aGlzW3NdPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmFwcGx5KG8sZSksZGVsZXRlIG9bc119LGl8fDEwMCl9fSxpLmRvY1JlYWR5PWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LnJlYWR5U3RhdGU7XCJjb21wbGV0ZVwiPT1lfHxcImludGVyYWN0aXZlXCI9PWU/c2V0VGltZW91dCh0KTpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLHQpfSxpLnRvRGFzaGVkPWZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoLyguKShbQS1aXSkvZyxmdW5jdGlvbih0LGUsaSl7cmV0dXJuIGUrXCItXCIraX0pLnRvTG93ZXJDYXNlKCl9O3ZhciBuPXQuY29uc29sZTtyZXR1cm4gaS5odG1sSW5pdD1mdW5jdGlvbihlLHMpe2kuZG9jUmVhZHkoZnVuY3Rpb24oKXt2YXIgbz1pLnRvRGFzaGVkKHMpLHI9XCJkYXRhLVwiK28sYT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW1wiK3IrXCJdXCIpLGw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1cIitvKSxoPWkubWFrZUFycmF5KGEpLmNvbmNhdChpLm1ha2VBcnJheShsKSksYz1yK1wiLW9wdGlvbnNcIixkPXQualF1ZXJ5O2guZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaSxvPXQuZ2V0QXR0cmlidXRlKHIpfHx0LmdldEF0dHJpYnV0ZShjKTt0cnl7aT1vJiZKU09OLnBhcnNlKG8pfWNhdGNoKGEpe3JldHVybiB2b2lkKG4mJm4uZXJyb3IoXCJFcnJvciBwYXJzaW5nIFwiK3IrXCIgb24gXCIrdC5jbGFzc05hbWUrXCI6IFwiK2EpKX12YXIgbD1uZXcgZSh0LGkpO2QmJmQuZGF0YSh0LHMsbCl9KX0pfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvY2VsbFwiLFtcImdldC1zaXplL2dldC1zaXplXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImdldC1zaXplXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LkNlbGw9ZSh0LHQuZ2V0U2l6ZSkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7dGhpcy5lbGVtZW50PXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLmNyZWF0ZSgpfXZhciBuPWkucHJvdG90eXBlO3JldHVybiBuLmNyZWF0ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCIsdGhpcy54PTAsdGhpcy5zaGlmdD0wfSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJcIjt2YXIgdD10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVt0XT1cIlwifSxuLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9ZSh0aGlzLmVsZW1lbnQpfSxuLnNldFBvc2l0aW9uPWZ1bmN0aW9uKHQpe3RoaXMueD10LHRoaXMudXBkYXRlVGFyZ2V0KCksdGhpcy5yZW5kZXJQb3NpdGlvbih0KX0sbi51cGRhdGVUYXJnZXQ9bi5zZXREZWZhdWx0VGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9XCJsZWZ0XCI9PXRoaXMucGFyZW50Lm9yaWdpblNpZGU/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLnNpemVbdF0rdGhpcy5zaXplLndpZHRoKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sbi5yZW5kZXJQb3NpdGlvbj1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVtlXT10aGlzLnBhcmVudC5nZXRQb3NpdGlvblZhbHVlKHQpfSxuLndyYXBTaGlmdD1mdW5jdGlvbih0KXt0aGlzLnNoaWZ0PXQsdGhpcy5yZW5kZXJQb3NpdGlvbih0aGlzLngrdGhpcy5wYXJlbnQuc2xpZGVhYmxlV2lkdGgqdCl9LG4ucmVtb3ZlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3NsaWRlXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuU2xpZGU9ZSgpKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt0aGlzLnBhcmVudD10LHRoaXMuaXNPcmlnaW5MZWZ0PVwibGVmdFwiPT10Lm9yaWdpblNpZGUsdGhpcy5jZWxscz1bXSx0aGlzLm91dGVyV2lkdGg9MCx0aGlzLmhlaWdodD0wfXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLmFkZENlbGw9ZnVuY3Rpb24odCl7aWYodGhpcy5jZWxscy5wdXNoKHQpLHRoaXMub3V0ZXJXaWR0aCs9dC5zaXplLm91dGVyV2lkdGgsdGhpcy5oZWlnaHQ9TWF0aC5tYXgodC5zaXplLm91dGVySGVpZ2h0LHRoaXMuaGVpZ2h0KSwxPT10aGlzLmNlbGxzLmxlbmd0aCl7dGhpcy54PXQueDt2YXIgZT10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy5maXJzdE1hcmdpbj10LnNpemVbZV19fSxlLnVwZGF0ZVRhcmdldD1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixlPXRoaXMuZ2V0TGFzdENlbGwoKSxpPWU/ZS5zaXplW3RdOjAsbj10aGlzLm91dGVyV2lkdGgtKHRoaXMuZmlyc3RNYXJnaW4raSk7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuZmlyc3RNYXJnaW4rbip0aGlzLnBhcmVudC5jZWxsQWxpZ259LGUuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0sZS5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9LGUudW5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIil9LGUuY2hhbmdlU2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5lbGVtZW50LmNsYXNzTGlzdFt0XShcImlzLXNlbGVjdGVkXCIpfSl9LGUuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FuaW1hdGVcIixbXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5hbmltYXRlUHJvdG90eXBlPWUodCx0LmZpenp5VUlVdGlscykpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT10LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8dC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUsbj0wO2l8fChpPWZ1bmN0aW9uKHQpe3ZhciBlPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGk9TWF0aC5tYXgoMCwxNi0oZS1uKSkscz1zZXRUaW1lb3V0KHQsaSk7cmV0dXJuIG49ZStpLHN9KTt2YXIgcz17fTtzLnN0YXJ0QW5pbWF0aW9uPWZ1bmN0aW9uKCl7dGhpcy5pc0FuaW1hdGluZ3x8KHRoaXMuaXNBbmltYXRpbmc9ITAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy5hbmltYXRlKCkpfSxzLmFuaW1hdGU9ZnVuY3Rpb24oKXt0aGlzLmFwcGx5RHJhZ0ZvcmNlKCksdGhpcy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbigpO3ZhciB0PXRoaXMueDtpZih0aGlzLmludGVncmF0ZVBoeXNpY3MoKSx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5zZXR0bGUodCksdGhpcy5pc0FuaW1hdGluZyl7dmFyIGU9dGhpcztpKGZ1bmN0aW9uKCl7ZS5hbmltYXRlKCl9KX19O3ZhciBvPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0LnRyYW5zZm9ybT9cInRyYW5zZm9ybVwiOlwiV2Via2l0VHJhbnNmb3JtXCJ9KCk7cmV0dXJuIHMucG9zaXRpb25TbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLng7dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoPjEmJih0PWUubW9kdWxvKHQsdGhpcy5zbGlkZWFibGVXaWR0aCksdC09dGhpcy5zbGlkZWFibGVXaWR0aCx0aGlzLnNoaWZ0V3JhcENlbGxzKHQpKSx0Kz10aGlzLmN1cnNvclBvc2l0aW9uLHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZvPy10OnQ7dmFyIGk9dGhpcy5nZXRQb3NpdGlvblZhbHVlKHQpO3RoaXMuc2xpZGVyLnN0eWxlW29dPXRoaXMuaXNBbmltYXRpbmc/XCJ0cmFuc2xhdGUzZChcIitpK1wiLDAsMClcIjpcInRyYW5zbGF0ZVgoXCIraStcIilcIjt2YXIgbj10aGlzLnNsaWRlc1swXTtpZihuKXt2YXIgcz0tdGhpcy54LW4udGFyZ2V0LHI9cy90aGlzLnNsaWRlc1dpZHRoO3RoaXMuZGlzcGF0Y2hFdmVudChcInNjcm9sbFwiLG51bGwsW3Isc10pfX0scy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzLmxlbmd0aCYmKHRoaXMueD0tdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCx0aGlzLnBvc2l0aW9uU2xpZGVyKCkpfSxzLmdldFBvc2l0aW9uVmFsdWU9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMub3B0aW9ucy5wZXJjZW50UG9zaXRpb24/LjAxKk1hdGgucm91bmQodC90aGlzLnNpemUuaW5uZXJXaWR0aCoxZTQpK1wiJVwiOk1hdGgucm91bmQodCkrXCJweFwifSxzLnNldHRsZT1mdW5jdGlvbih0KXt0aGlzLmlzUG9pbnRlckRvd258fE1hdGgucm91bmQoMTAwKnRoaXMueCkhPU1hdGgucm91bmQoMTAwKnQpfHx0aGlzLnJlc3RpbmdGcmFtZXMrKyx0aGlzLnJlc3RpbmdGcmFtZXM+MiYmKHRoaXMuaXNBbmltYXRpbmc9ITEsZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZXR0bGVcIikpfSxzLnNoaWZ0V3JhcENlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuY3Vyc29yUG9zaXRpb24rdDt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyxlLC0xKTt2YXIgaT10aGlzLnNpemUuaW5uZXJXaWR0aC0odCt0aGlzLnNsaWRlYWJsZVdpZHRoK3RoaXMuY3Vyc29yUG9zaXRpb24pO3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMsaSwxKX0scy5fc2hpZnRDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciBzPXRbbl0sbz1lPjA/aTowO3Mud3JhcFNoaWZ0KG8pLGUtPXMuc2l6ZS5vdXRlcldpZHRofX0scy5fdW5zaGlmdENlbGxzPWZ1bmN0aW9uKHQpe2lmKHQmJnQubGVuZ3RoKWZvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXRbZV0ud3JhcFNoaWZ0KDApfSxzLmludGVncmF0ZVBoeXNpY3M9ZnVuY3Rpb24oKXt0aGlzLngrPXRoaXMudmVsb2NpdHksdGhpcy52ZWxvY2l0eSo9dGhpcy5nZXRGcmljdGlvbkZhY3RvcigpfSxzLmFwcGx5Rm9yY2U9ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eSs9dH0scy5nZXRGcmljdGlvbkZhY3Rvcj1mdW5jdGlvbigpe3JldHVybiAxLXRoaXMub3B0aW9uc1t0aGlzLmlzRnJlZVNjcm9sbGluZz9cImZyZWVTY3JvbGxGcmljdGlvblwiOlwiZnJpY3Rpb25cIl19LHMuZ2V0UmVzdGluZ1Bvc2l0aW9uPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMueCt0aGlzLnZlbG9jaXR5LygxLXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSl9LHMuYXBwbHlEcmFnRm9yY2U9ZnVuY3Rpb24oKXtpZih0aGlzLmlzUG9pbnRlckRvd24pe3ZhciB0PXRoaXMuZHJhZ1gtdGhpcy54LGU9dC10aGlzLnZlbG9jaXR5O3RoaXMuYXBwbHlGb3JjZShlKX19LHMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb249ZnVuY3Rpb24oKXtpZighdGhpcy5pc1BvaW50ZXJEb3duJiYhdGhpcy5pc0ZyZWVTY3JvbGxpbmcmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0Ki0xLXRoaXMueCxlPXQqdGhpcy5vcHRpb25zLnNlbGVjdGVkQXR0cmFjdGlvbjt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzfSksZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFwiZmxpY2tpdHkvanMvZmxpY2tpdHlcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImdldC1zaXplL2dldC1zaXplXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9jZWxsXCIsXCIuL3NsaWRlXCIsXCIuL2FuaW1hdGVcIl0sZnVuY3Rpb24oaSxuLHMsbyxyLGEpe3JldHVybiBlKHQsaSxuLHMsbyxyLGEpfSk7ZWxzZSBpZihcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImdldC1zaXplXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9jZWxsXCIpLHJlcXVpcmUoXCIuL3NsaWRlXCIpLHJlcXVpcmUoXCIuL2FuaW1hdGVcIikpO2Vsc2V7dmFyIGk9dC5GbGlja2l0eTt0LkZsaWNraXR5PWUodCx0LkV2RW1pdHRlcix0LmdldFNpemUsdC5maXp6eVVJVXRpbHMsaS5DZWxsLGkuU2xpZGUsaS5hbmltYXRlUHJvdG90eXBlKX19KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuLHMsbyxyKXtmdW5jdGlvbiBhKHQsZSl7Zm9yKHQ9bi5tYWtlQXJyYXkodCk7dC5sZW5ndGg7KWUuYXBwZW5kQ2hpbGQodC5zaGlmdCgpKX1mdW5jdGlvbiBsKHQsZSl7dmFyIGk9bi5nZXRRdWVyeUVsZW1lbnQodCk7aWYoIWkpcmV0dXJuIHZvaWQoZCYmZC5lcnJvcihcIkJhZCBlbGVtZW50IGZvciBGbGlja2l0eTogXCIrKGl8fHQpKSk7aWYodGhpcy5lbGVtZW50PWksdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCl7dmFyIHM9Zlt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEXTtyZXR1cm4gcy5vcHRpb24oZSksc31oJiYodGhpcy4kZWxlbWVudD1oKHRoaXMuZWxlbWVudCkpLHRoaXMub3B0aW9ucz1uLmV4dGVuZCh7fSx0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzKSx0aGlzLm9wdGlvbihlKSx0aGlzLl9jcmVhdGUoKX12YXIgaD10LmpRdWVyeSxjPXQuZ2V0Q29tcHV0ZWRTdHlsZSxkPXQuY29uc29sZSx1PTAsZj17fTtsLmRlZmF1bHRzPXthY2Nlc3NpYmlsaXR5OiEwLGNlbGxBbGlnbjpcImNlbnRlclwiLGZyZWVTY3JvbGxGcmljdGlvbjouMDc1LGZyaWN0aW9uOi4yOCxuYW1lc3BhY2VKUXVlcnlFdmVudHM6ITAscGVyY2VudFBvc2l0aW9uOiEwLHJlc2l6ZTohMCxzZWxlY3RlZEF0dHJhY3Rpb246LjAyNSxzZXRHYWxsZXJ5U2l6ZTohMH0sbC5jcmVhdGVNZXRob2RzPVtdO3ZhciBwPWwucHJvdG90eXBlO24uZXh0ZW5kKHAsZS5wcm90b3R5cGUpLHAuX2NyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuZ3VpZD0rK3U7dGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRD1lLGZbZV09dGhpcyx0aGlzLnNlbGVjdGVkSW5kZXg9MCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLng9MCx0aGlzLnZlbG9jaXR5PTAsdGhpcy5vcmlnaW5TaWRlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInJpZ2h0XCI6XCJsZWZ0XCIsdGhpcy52aWV3cG9ydD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHRoaXMudmlld3BvcnQuY2xhc3NOYW1lPVwiZmxpY2tpdHktdmlld3BvcnRcIix0aGlzLl9jcmVhdGVTbGlkZXIoKSwodGhpcy5vcHRpb25zLnJlc2l6ZXx8dGhpcy5vcHRpb25zLndhdGNoQ1NTKSYmdC5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksbC5jcmVhdGVNZXRob2RzLmZvckVhY2goZnVuY3Rpb24odCl7dGhpc1t0XSgpfSx0aGlzKSx0aGlzLm9wdGlvbnMud2F0Y2hDU1M/dGhpcy53YXRjaENTUygpOnRoaXMuYWN0aXZhdGUoKX0scC5vcHRpb249ZnVuY3Rpb24odCl7bi5leHRlbmQodGhpcy5vcHRpb25zLHQpfSxwLmFjdGl2YXRlPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNBY3RpdmUpe3RoaXMuaXNBY3RpdmU9ITAsdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5nZXRTaXplKCk7dmFyIHQ9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0aGlzLmVsZW1lbnQuY2hpbGRyZW4pO2EodCx0aGlzLnNsaWRlciksdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZCh0aGlzLnNsaWRlciksdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMudmlld3BvcnQpLHRoaXMucmVsb2FkQ2VsbHMoKSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC50YWJJbmRleD0wLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmVtaXRFdmVudChcImFjdGl2YXRlXCIpO3ZhciBlLGk9dGhpcy5vcHRpb25zLmluaXRpYWxJbmRleDtlPXRoaXMuaXNJbml0QWN0aXZhdGVkP3RoaXMuc2VsZWN0ZWRJbmRleDp2b2lkIDAhPT1pJiZ0aGlzLmNlbGxzW2ldP2k6MCx0aGlzLnNlbGVjdChlLCExLCEwKSx0aGlzLmlzSW5pdEFjdGl2YXRlZD0hMH19LHAuX2NyZWF0ZVNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dC5jbGFzc05hbWU9XCJmbGlja2l0eS1zbGlkZXJcIix0LnN0eWxlW3RoaXMub3JpZ2luU2lkZV09MCx0aGlzLnNsaWRlcj10fSxwLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQpe3JldHVybiBuLmZpbHRlckZpbmRFbGVtZW50cyh0LHRoaXMub3B0aW9ucy5jZWxsU2VsZWN0b3IpfSxwLnJlbG9hZENlbGxzPWZ1bmN0aW9uKCl7dGhpcy5jZWxscz10aGlzLl9tYWtlQ2VsbHModGhpcy5zbGlkZXIuY2hpbGRyZW4pLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpfSxwLl9tYWtlQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0KSxpPWUubWFwKGZ1bmN0aW9uKHQpe3JldHVybiBuZXcgcyh0LHRoaXMpfSx0aGlzKTtyZXR1cm4gaX0scC5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxwLmdldExhc3RTbGlkZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNsaWRlc1t0aGlzLnNsaWRlcy5sZW5ndGgtMV19LHAucG9zaXRpb25DZWxscz1mdW5jdGlvbigpe3RoaXMuX3NpemVDZWxscyh0aGlzLmNlbGxzKSx0aGlzLl9wb3NpdGlvbkNlbGxzKDApfSxwLl9wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKHQpe3Q9dHx8MCx0aGlzLm1heENlbGxIZWlnaHQ9dD90aGlzLm1heENlbGxIZWlnaHR8fDA6MDt2YXIgZT0wO2lmKHQ+MCl7dmFyIGk9dGhpcy5jZWxsc1t0LTFdO2U9aS54K2kuc2l6ZS5vdXRlcldpZHRofWZvcih2YXIgbj10aGlzLmNlbGxzLmxlbmd0aCxzPXQ7czxuO3MrKyl7dmFyIG89dGhpcy5jZWxsc1tzXTtvLnNldFBvc2l0aW9uKGUpLGUrPW8uc2l6ZS5vdXRlcldpZHRoLHRoaXMubWF4Q2VsbEhlaWdodD1NYXRoLm1heChvLnNpemUub3V0ZXJIZWlnaHQsdGhpcy5tYXhDZWxsSGVpZ2h0KX10aGlzLnNsaWRlYWJsZVdpZHRoPWUsdGhpcy51cGRhdGVTbGlkZXMoKSx0aGlzLl9jb250YWluU2xpZGVzKCksdGhpcy5zbGlkZXNXaWR0aD1uP3RoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LXRoaXMuc2xpZGVzWzBdLnRhcmdldDowfSxwLl9zaXplQ2VsbHM9ZnVuY3Rpb24odCl7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZ2V0U2l6ZSgpfSl9LHAudXBkYXRlU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkZXM9W10sdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PW5ldyBvKHRoaXMpO3RoaXMuc2xpZGVzLnB1c2godCk7dmFyIGU9XCJsZWZ0XCI9PXRoaXMub3JpZ2luU2lkZSxpPWU/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLG49dGhpcy5fZ2V0Q2FuQ2VsbEZpdCgpO3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlLHMpe2lmKCF0LmNlbGxzLmxlbmd0aClyZXR1cm4gdm9pZCB0LmFkZENlbGwoZSk7dmFyIHI9dC5vdXRlcldpZHRoLXQuZmlyc3RNYXJnaW4rKGUuc2l6ZS5vdXRlcldpZHRoLWUuc2l6ZVtpXSk7bi5jYWxsKHRoaXMscyxyKT90LmFkZENlbGwoZSk6KHQudXBkYXRlVGFyZ2V0KCksdD1uZXcgbyh0aGlzKSx0aGlzLnNsaWRlcy5wdXNoKHQpLHQuYWRkQ2VsbChlKSl9LHRoaXMpLHQudXBkYXRlVGFyZ2V0KCksdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCl9fSxwLl9nZXRDYW5DZWxsRml0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmdyb3VwQ2VsbHM7aWYoIXQpcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuITF9O2lmKFwibnVtYmVyXCI9PXR5cGVvZiB0KXt2YXIgZT1wYXJzZUludCh0LDEwKTtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQlZSE9PTB9fXZhciBpPVwic3RyaW5nXCI9PXR5cGVvZiB0JiZ0Lm1hdGNoKC9eKFxcZCspJSQvKSxuPWk/cGFyc2VJbnQoaVsxXSwxMCkvMTAwOjE7cmV0dXJuIGZ1bmN0aW9uKHQsZSl7cmV0dXJuIGU8PSh0aGlzLnNpemUuaW5uZXJXaWR0aCsxKSpufX0scC5faW5pdD1wLnJlcG9zaXRpb249ZnVuY3Rpb24oKXt0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfSxwLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9aSh0aGlzLmVsZW1lbnQpLHRoaXMuc2V0Q2VsbEFsaWduKCksdGhpcy5jdXJzb3JQb3NpdGlvbj10aGlzLnNpemUuaW5uZXJXaWR0aCp0aGlzLmNlbGxBbGlnbn07dmFyIHY9e2NlbnRlcjp7bGVmdDouNSxyaWdodDouNX0sbGVmdDp7bGVmdDowLHJpZ2h0OjF9LHJpZ2h0OntyaWdodDowLGxlZnQ6MX19O3JldHVybiBwLnNldENlbGxBbGlnbj1mdW5jdGlvbigpe3ZhciB0PXZbdGhpcy5vcHRpb25zLmNlbGxBbGlnbl07dGhpcy5jZWxsQWxpZ249dD90W3RoaXMub3JpZ2luU2lkZV06dGhpcy5vcHRpb25zLmNlbGxBbGlnbn0scC5zZXRHYWxsZXJ5U2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5zZXRHYWxsZXJ5U2l6ZSl7dmFyIHQ9dGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNlbGVjdGVkU2xpZGU/dGhpcy5zZWxlY3RlZFNsaWRlLmhlaWdodDp0aGlzLm1heENlbGxIZWlnaHQ7dGhpcy52aWV3cG9ydC5zdHlsZS5oZWlnaHQ9dCtcInB4XCJ9fSxwLl9nZXRXcmFwU2hpZnRDZWxscz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzKSx0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMpO3ZhciB0PXRoaXMuY3Vyc29yUG9zaXRpb24sZT10aGlzLmNlbGxzLmxlbmd0aC0xO3RoaXMuYmVmb3JlU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LGUsLTEpLHQ9dGhpcy5zaXplLmlubmVyV2lkdGgtdGhpcy5jdXJzb3JQb3NpdGlvbix0aGlzLmFmdGVyU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LDAsMSl9fSxwLl9nZXRHYXBDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPVtdO3Q+MDspe3ZhciBzPXRoaXMuY2VsbHNbZV07aWYoIXMpYnJlYWs7bi5wdXNoKHMpLGUrPWksdC09cy5zaXplLm91dGVyV2lkdGh9cmV0dXJuIG59LHAuX2NvbnRhaW5TbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0LGU9dD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsaT10P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIixuPXRoaXMuc2xpZGVhYmxlV2lkdGgtdGhpcy5nZXRMYXN0Q2VsbCgpLnNpemVbaV0scz1uPHRoaXMuc2l6ZS5pbm5lcldpZHRoLG89dGhpcy5jdXJzb3JQb3NpdGlvbit0aGlzLmNlbGxzWzBdLnNpemVbZV0scj1uLXRoaXMuc2l6ZS5pbm5lcldpZHRoKigxLXRoaXMuY2VsbEFsaWduKTt0aGlzLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3M/dC50YXJnZXQ9bip0aGlzLmNlbGxBbGlnbjoodC50YXJnZXQ9TWF0aC5tYXgodC50YXJnZXQsbyksdC50YXJnZXQ9TWF0aC5taW4odC50YXJnZXQscikpfSx0aGlzKX19LHAuZGlzcGF0Y2hFdmVudD1mdW5jdGlvbih0LGUsaSl7dmFyIG49ZT9bZV0uY29uY2F0KGkpOmk7aWYodGhpcy5lbWl0RXZlbnQodCxuKSxoJiZ0aGlzLiRlbGVtZW50KXt0Kz10aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzP1wiLmZsaWNraXR5XCI6XCJcIjt2YXIgcz10O2lmKGUpe3ZhciBvPWguRXZlbnQoZSk7by50eXBlPXQscz1vfXRoaXMuJGVsZW1lbnQudHJpZ2dlcihzLGkpfX0scC5zZWxlY3Q9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNBY3RpdmUmJih0PXBhcnNlSW50KHQsMTApLHRoaXMuX3dyYXBTZWxlY3QodCksKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kfHxlKSYmKHQ9bi5tb2R1bG8odCx0aGlzLnNsaWRlcy5sZW5ndGgpKSx0aGlzLnNsaWRlc1t0XSYmKHRoaXMuc2VsZWN0ZWRJbmRleD10LHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpLGk/dGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTp0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2VsZWN0XCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcImNlbGxTZWxlY3RcIikpKX0scC5fd3JhcFNlbGVjdD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnNsaWRlcy5sZW5ndGgsaT10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmZT4xO2lmKCFpKXJldHVybiB0O3ZhciBzPW4ubW9kdWxvKHQsZSksbz1NYXRoLmFicyhzLXRoaXMuc2VsZWN0ZWRJbmRleCkscj1NYXRoLmFicyhzK2UtdGhpcy5zZWxlY3RlZEluZGV4KSxhPU1hdGguYWJzKHMtZS10aGlzLnNlbGVjdGVkSW5kZXgpOyF0aGlzLmlzRHJhZ1NlbGVjdCYmcjxvP3QrPWU6IXRoaXMuaXNEcmFnU2VsZWN0JiZhPG8mJih0LT1lKSx0PDA/dGhpcy54LT10aGlzLnNsaWRlYWJsZVdpZHRoOnQ+PWUmJih0aGlzLngrPXRoaXMuc2xpZGVhYmxlV2lkdGgpfSxwLnByZXZpb3VzPWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4LTEsdCxlKX0scC5uZXh0PWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KzEsdCxlKX0scC51cGRhdGVTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5zbGlkZXNbdGhpcy5zZWxlY3RlZEluZGV4XTt0JiYodGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLnNlbGVjdGVkU2xpZGU9dCx0LnNlbGVjdCgpLHRoaXMuc2VsZWN0ZWRDZWxscz10LmNlbGxzLHRoaXMuc2VsZWN0ZWRFbGVtZW50cz10LmdldENlbGxFbGVtZW50cygpLHRoaXMuc2VsZWN0ZWRDZWxsPXQuY2VsbHNbMF0sdGhpcy5zZWxlY3RlZEVsZW1lbnQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdKX0scC51bnNlbGVjdFNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkU2xpZGUmJnRoaXMuc2VsZWN0ZWRTbGlkZS51bnNlbGVjdCgpfSxwLnNlbGVjdENlbGw9ZnVuY3Rpb24odCxlLGkpe3ZhciBuO1wibnVtYmVyXCI9PXR5cGVvZiB0P249dGhpcy5jZWxsc1t0XTooXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHQpKSxuPXRoaXMuZ2V0Q2VsbCh0KSk7Zm9yKHZhciBzPTA7biYmczx0aGlzLnNsaWRlcy5sZW5ndGg7cysrKXt2YXIgbz10aGlzLnNsaWRlc1tzXSxyPW8uY2VsbHMuaW5kZXhPZihuKTtpZihyIT0tMSlyZXR1cm4gdm9pZCB0aGlzLnNlbGVjdChzLGUsaSl9fSxwLmdldENlbGw9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmNlbGxzLmxlbmd0aDtlKyspe3ZhciBpPXRoaXMuY2VsbHNbZV07aWYoaS5lbGVtZW50PT10KXJldHVybiBpfX0scC5nZXRDZWxscz1mdW5jdGlvbih0KXt0PW4ubWFrZUFycmF5KHQpO3ZhciBlPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGk9dGhpcy5nZXRDZWxsKHQpO2kmJmUucHVzaChpKX0sdGhpcyksZX0scC5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSxwLmdldFBhcmVudENlbGw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO3JldHVybiBlP2U6KHQ9bi5nZXRQYXJlbnQodCxcIi5mbGlja2l0eS1zbGlkZXIgPiAqXCIpLHRoaXMuZ2V0Q2VsbCh0KSl9LHAuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCxlKXtpZighdClyZXR1cm4gdGhpcy5zZWxlY3RlZFNsaWRlLmdldENlbGxFbGVtZW50cygpO2U9dm9pZCAwPT09ZT90aGlzLnNlbGVjdGVkSW5kZXg6ZTt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGg7aWYoMSsyKnQ+PWkpcmV0dXJuIHRoaXMuZ2V0Q2VsbEVsZW1lbnRzKCk7Zm9yKHZhciBzPVtdLG89ZS10O288PWUrdDtvKyspe3ZhciByPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP24ubW9kdWxvKG8saSk6byxhPXRoaXMuc2xpZGVzW3JdO2EmJihzPXMuY29uY2F0KGEuZ2V0Q2VsbEVsZW1lbnRzKCkpKX1yZXR1cm4gc30scC51aUNoYW5nZT1mdW5jdGlvbigpe3RoaXMuZW1pdEV2ZW50KFwidWlDaGFuZ2VcIil9LHAuY2hpbGRVSVBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3RoaXMuZW1pdEV2ZW50KFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsW3RdKX0scC5vbnJlc2l6ZT1mdW5jdGlvbigpe3RoaXMud2F0Y2hDU1MoKSx0aGlzLnJlc2l6ZSgpfSxuLmRlYm91bmNlTWV0aG9kKGwsXCJvbnJlc2l6ZVwiLDE1MCkscC5yZXNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLmlzQWN0aXZlKXt0aGlzLmdldFNpemUoKSx0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmKHRoaXMueD1uLm1vZHVsbyh0aGlzLngsdGhpcy5zbGlkZWFibGVXaWR0aCkpLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwicmVzaXplXCIpO3ZhciB0PXRoaXMuc2VsZWN0ZWRFbGVtZW50cyYmdGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdO3RoaXMuc2VsZWN0Q2VsbCh0LCExLCEwKX19LHAud2F0Y2hDU1M9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMud2F0Y2hDU1M7aWYodCl7dmFyIGU9Yyh0aGlzLmVsZW1lbnQsXCI6YWZ0ZXJcIikuY29udGVudDtlLmluZGV4T2YoXCJmbGlja2l0eVwiKSE9LTE/dGhpcy5hY3RpdmF0ZSgpOnRoaXMuZGVhY3RpdmF0ZSgpfX0scC5vbmtleWRvd249ZnVuY3Rpb24odCl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJighZG9jdW1lbnQuYWN0aXZlRWxlbWVudHx8ZG9jdW1lbnQuYWN0aXZlRWxlbWVudD09dGhpcy5lbGVtZW50KSlpZigzNz09dC5rZXlDb2RlKXt2YXIgZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJuZXh0XCI6XCJwcmV2aW91c1wiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2VdKCl9ZWxzZSBpZigzOT09dC5rZXlDb2RlKXt2YXIgaT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2ldKCl9fSxwLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzQWN0aXZlJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbih0KXt0LmRlc3Ryb3koKX0pLHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMudmlld3BvcnQpLGEodGhpcy5zbGlkZXIuY2hpbGRyZW4sdGhpcy5lbGVtZW50KSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5pc0FjdGl2ZT0hMSx0aGlzLmVtaXRFdmVudChcImRlYWN0aXZhdGVcIikpfSxwLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSx0aGlzLmVtaXRFdmVudChcImRlc3Ryb3lcIiksaCYmdGhpcy4kZWxlbWVudCYmaC5yZW1vdmVEYXRhKHRoaXMuZWxlbWVudCxcImZsaWNraXR5XCIpLGRlbGV0ZSB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlELGRlbGV0ZSBmW3RoaXMuZ3VpZF19LG4uZXh0ZW5kKHAsciksbC5kYXRhPWZ1bmN0aW9uKHQpe3Q9bi5nZXRRdWVyeUVsZW1lbnQodCk7dmFyIGU9dCYmdC5mbGlja2l0eUdVSUQ7cmV0dXJuIGUmJmZbZV19LG4uaHRtbEluaXQobCxcImZsaWNraXR5XCIpLGgmJmguYnJpZGdldCYmaC5icmlkZ2V0KFwiZmxpY2tpdHlcIixsKSxsLkNlbGw9cyxsfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pcG9pbnRlci91bmlwb2ludGVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuVW5pcG9pbnRlcj1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKX0scy51bmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITEpfSxzLl9iaW5kU3RhcnRFdmVudD1mdW5jdGlvbihlLGkpe2k9dm9pZCAwPT09aXx8ISFpO3ZhciBuPWk/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCI7dC5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQ/ZVtuXShcInBvaW50ZXJkb3duXCIsdGhpcyk6dC5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZD9lW25dKFwiTVNQb2ludGVyRG93blwiLHRoaXMpOihlW25dKFwibW91c2Vkb3duXCIsdGhpcyksZVtuXShcInRvdWNoc3RhcnRcIix0aGlzKSl9LHMuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxzLmdldFRvdWNoPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgaT10W2VdO2lmKGkuaWRlbnRpZmllcj09dGhpcy5wb2ludGVySWRlbnRpZmllcilyZXR1cm4gaX19LHMub25tb3VzZWRvd249ZnVuY3Rpb24odCl7dmFyIGU9dC5idXR0b247ZSYmMCE9PWUmJjEhPT1lfHx0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLm9udG91Y2hzdGFydD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQuY2hhbmdlZFRvdWNoZXNbMF0pfSxzLm9uTVNQb2ludGVyRG93bj1zLm9ucG9pbnRlcmRvd249ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5fcG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLmlzUG9pbnRlckRvd258fCh0aGlzLmlzUG9pbnRlckRvd249ITAsdGhpcy5wb2ludGVySWRlbnRpZmllcj12b2lkIDAhPT1lLnBvaW50ZXJJZD9lLnBvaW50ZXJJZDplLmlkZW50aWZpZXIsdGhpcy5wb2ludGVyRG93bih0LGUpKX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX07dmFyIG89e21vdXNlZG93bjpbXCJtb3VzZW1vdmVcIixcIm1vdXNldXBcIl0sdG91Y2hzdGFydDpbXCJ0b3VjaG1vdmVcIixcInRvdWNoZW5kXCIsXCJ0b3VjaGNhbmNlbFwiXSxwb2ludGVyZG93bjpbXCJwb2ludGVybW92ZVwiLFwicG9pbnRlcnVwXCIsXCJwb2ludGVyY2FuY2VsXCJdLE1TUG9pbnRlckRvd246W1wiTVNQb2ludGVyTW92ZVwiLFwiTVNQb2ludGVyVXBcIixcIk1TUG9pbnRlckNhbmNlbFwiXX07cmV0dXJuIHMuX2JpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oZSl7aWYoZSl7dmFyIGk9b1tlLnR5cGVdO2kuZm9yRWFjaChmdW5jdGlvbihlKXt0LmFkZEV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzPWl9fSxzLl91bmJpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMmJih0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyl9LHMub25tb3VzZW1vdmU9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbk1TUG9pbnRlck1vdmU9cy5vbnBvaW50ZXJtb3ZlPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9udG91Y2htb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlck1vdmUodCxlKX0scy5fcG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLnBvaW50ZXJNb3ZlKHQsZSl9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZV0pfSxzLm9ubW91c2V1cD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbk1TUG9pbnRlclVwPXMub25wb2ludGVydXA9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9udG91Y2hlbmQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyVXAodCxlKX0scy5fcG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJVcCh0LGUpfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pfSxzLl9wb2ludGVyRG9uZT1mdW5jdGlvbigpe3RoaXMuaXNQb2ludGVyRG93bj0hMSxkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcix0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKSx0aGlzLnBvaW50ZXJEb25lKCl9LHMucG9pbnRlckRvbmU9aSxzLm9uTVNQb2ludGVyQ2FuY2VsPXMub25wb2ludGVyY2FuY2VsPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsdCl9LHMub250b3VjaGNhbmNlbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJDYW5jZWwodCxlKX0scy5fcG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyQ2FuY2VsKHQsZSl9LHMucG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlckNhbmNlbFwiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZnVuY3Rpb24odCl7cmV0dXJue3g6dC5wYWdlWCx5OnQucGFnZVl9fSxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVW5pZHJhZ2dlcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMCl9LHMudW5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCExKX07dmFyIG89dC5uYXZpZ2F0b3I7cmV0dXJuIHMuX2JpbmRIYW5kbGVzPWZ1bmN0aW9uKHQpe3Q9dm9pZCAwPT09dHx8ISF0O3ZhciBlO2U9by5wb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLnRvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06by5tc1BvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUubXNUb3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Omk7Zm9yKHZhciBuPXQ/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCIscz0wO3M8dGhpcy5oYW5kbGVzLmxlbmd0aDtzKyspe3ZhciByPXRoaXMuaGFuZGxlc1tzXTt0aGlzLl9iaW5kU3RhcnRFdmVudChyLHQpLGUocikscltuXShcImNsaWNrXCIsdGhpcyl9fSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7aWYoXCJJTlBVVFwiPT10LnRhcmdldC5ub2RlTmFtZSYmXCJyYW5nZVwiPT10LnRhcmdldC50eXBlKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24odCxlKTt2YXIgaT1kb2N1bWVudC5hY3RpdmVFbGVtZW50O2kmJmkuYmx1ciYmaS5ibHVyKCksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfSxzLl9kcmFnUG9pbnRlckRvd249ZnVuY3Rpb24odCxpKXt0aGlzLnBvaW50ZXJEb3duUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSk7dmFyIG49dGhpcy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24odCxpKTtuJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3JldHVyblwiU0VMRUNUXCIhPXQudGFyZ2V0Lm5vZGVOYW1lfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGUsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0scy5fZHJhZ1BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsaSl7dmFyIG49ZS5nZXRQb2ludGVyUG9pbnQoaSkscz17eDpuLngtdGhpcy5wb2ludGVyRG93blBvaW50LngseTpuLnktdGhpcy5wb2ludGVyRG93blBvaW50Lnl9O3JldHVybiF0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuaGFzRHJhZ1N0YXJ0ZWQocykmJnRoaXMuX2RyYWdTdGFydCh0LGkpLHN9LHMuaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+M3x8TWF0aC5hYnModC55KT4zfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0scy5fZHJhZ1BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz90aGlzLl9kcmFnRW5kKHQsZSk6dGhpcy5fc3RhdGljQ2xpY2sodCxlKX0scy5fZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsaSl7dGhpcy5pc0RyYWdnaW5nPSEwLHRoaXMuZHJhZ1N0YXJ0UG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSksdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M9ITAsdGhpcy5kcmFnU3RhcnQodCxpKX0scy5kcmFnU3RhcnQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdTdGFydFwiLFt0LGVdKX0scy5fZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNEcmFnZ2luZyYmdGhpcy5kcmFnTW92ZSh0LGUsaSl9LHMuZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLmVtaXRFdmVudChcImRyYWdNb3ZlXCIsW3QsZSxpXSl9LHMuX2RyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzUHJldmVudGluZ0NsaWNrc30uYmluZCh0aGlzKSksdGhpcy5kcmFnRW5kKHQsZSl9LHMuZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ0VuZFwiLFt0LGVdKX0scy5vbmNsaWNrPWZ1bmN0aW9uKHQpe3RoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuX3N0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT10LnR5cGUpe3ZhciBpPXQudGFyZ2V0Lm5vZGVOYW1lO1wiSU5QVVRcIiE9aSYmXCJURVhUQVJFQVwiIT1pfHx0LnRhcmdldC5mb2N1cygpLHRoaXMuc3RhdGljQ2xpY2sodCxlKSxcIm1vdXNldXBcIiE9dC50eXBlJiYodGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXB9LmJpbmQodGhpcyksNDAwKSl9fSxzLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJzdGF0aWNDbGlja1wiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQsbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2RyYWdcIixbXCIuL2ZsaWNraXR5XCIsXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidW5pZHJhZ2dlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5VbmlkcmFnZ2VyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHMoKXtyZXR1cm57eDp0LnBhZ2VYT2Zmc2V0LHk6dC5wYWdlWU9mZnNldH19bi5leHRlbmQoZS5kZWZhdWx0cyx7ZHJhZ2dhYmxlOiEwLGRyYWdUaHJlc2hvbGQ6M30pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZURyYWdcIik7dmFyIG89ZS5wcm90b3R5cGU7bi5leHRlbmQobyxpLnByb3RvdHlwZSk7dmFyIHI9XCJjcmVhdGVUb3VjaFwiaW4gZG9jdW1lbnQsYT0hMTtvLl9jcmVhdGVEcmFnPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5iaW5kRHJhZyksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5fdWlDaGFuZ2VEcmFnKSx0aGlzLm9uKFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsdGhpcy5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLnVuYmluZERyYWcpLHImJiFhJiYodC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsZnVuY3Rpb24oKXt9KSxhPSEwKX0sby5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5kcmFnZ2FibGUmJiF0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy5oYW5kbGVzPVt0aGlzLnZpZXdwb3J0XSx0aGlzLmJpbmRIYW5kbGVzKCksdGhpcy5pc0RyYWdCb3VuZD0hMCl9LG8udW5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLWRyYWdnYWJsZVwiKSx0aGlzLnVuYmluZEhhbmRsZXMoKSxkZWxldGUgdGhpcy5pc0RyYWdCb3VuZCl9LG8uX3VpQ2hhbmdlRHJhZz1mdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZ30sby5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZz1mdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wb2ludGVyRG93bkZvY3VzKHQpfTt2YXIgbD17VEVYVEFSRUE6ITAsSU5QVVQ6ITAsT1BUSU9OOiEwfSxoPXtyYWRpbzohMCxjaGVja2JveDohMCxidXR0b246ITAsc3VibWl0OiEwLGltYWdlOiEwLGZpbGU6ITB9O28ucG9pbnRlckRvd249ZnVuY3Rpb24oZSxpKXt2YXIgbj1sW2UudGFyZ2V0Lm5vZGVOYW1lXSYmIWhbZS50YXJnZXQudHlwZV07aWYobilyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKGUsaSk7dmFyIG89ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtvJiZvLmJsdXImJm8hPXRoaXMuZWxlbWVudCYmbyE9ZG9jdW1lbnQuYm9keSYmby5ibHVyKCksdGhpcy5wb2ludGVyRG93bkZvY3VzKGUpLHRoaXMuZHJhZ1g9dGhpcy54LHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LmFkZChcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKGUpLHRoaXMucG9pbnRlckRvd25TY3JvbGw9cygpLHQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJEb3duXCIsZSxbaV0pfTt2YXIgYz17dG91Y2hzdGFydDohMCxNU1BvaW50ZXJEb3duOiEwfSxkPXtJTlBVVDohMCxTRUxFQ1Q6ITB9O3JldHVybiBvLnBvaW50ZXJEb3duRm9jdXM9ZnVuY3Rpb24oZSl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJiFjW2UudHlwZV0mJiFkW2UudGFyZ2V0Lm5vZGVOYW1lXSl7dmFyIGk9dC5wYWdlWU9mZnNldDt0aGlzLmVsZW1lbnQuZm9jdXMoKSx0LnBhZ2VZT2Zmc2V0IT1pJiZ0LnNjcm9sbFRvKHQucGFnZVhPZmZzZXQsaSl9fSxvLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXt2YXIgZT1cInRvdWNoc3RhcnRcIj09dC50eXBlLGk9dC50YXJnZXQubm9kZU5hbWU7cmV0dXJuIWUmJlwiU0VMRUNUXCIhPWl9LG8uaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+dGhpcy5vcHRpb25zLmRyYWdUaHJlc2hvbGR9LG8ucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7ZGVsZXRlIHRoaXMuaXNUb3VjaFNjcm9sbGluZyx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlclVwXCIsdCxbZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0sby5wb2ludGVyRG9uZT1mdW5jdGlvbigpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLGRlbGV0ZSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsfSxvLmRyYWdTdGFydD1mdW5jdGlvbihlLGkpe3RoaXMuZHJhZ1N0YXJ0UG9zaXRpb249dGhpcy54LHRoaXMuc3RhcnRBbmltYXRpb24oKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnU3RhcnRcIixlLFtpXSl9LG8ucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyTW92ZVwiLHQsW2UsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0sby5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldmlvdXNEcmFnWD10aGlzLmRyYWdYO3ZhciBuPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD8tMToxLHM9dGhpcy5kcmFnU3RhcnRQb3NpdGlvbitpLngqbjtpZighdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuc2xpZGVzLmxlbmd0aCl7dmFyIG89TWF0aC5tYXgoLXRoaXMuc2xpZGVzWzBdLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM+bz8uNSoocytvKTpzO3ZhciByPU1hdGgubWluKC10aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM8cj8uNSoocytyKTpzfXRoaXMuZHJhZ1g9cyx0aGlzLmRyYWdNb3ZlVGltZT1uZXcgRGF0ZSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnTW92ZVwiLHQsW2UsaV0pfSxvLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmKHRoaXMuaXNGcmVlU2Nyb2xsaW5nPSEwKTt2YXIgaT10aGlzLmRyYWdFbmRSZXN0aW5nU2VsZWN0KCk7aWYodGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dmFyIG49dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTt0aGlzLmlzRnJlZVNjcm9sbGluZz0tbj50aGlzLnNsaWRlc1swXS50YXJnZXQmJi1uPHRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0fWVsc2UgdGhpcy5vcHRpb25zLmZyZWVTY3JvbGx8fGkhPXRoaXMuc2VsZWN0ZWRJbmRleHx8KGkrPXRoaXMuZHJhZ0VuZEJvb3N0U2VsZWN0KCkpO2RlbGV0ZSB0aGlzLnByZXZpb3VzRHJhZ1gsdGhpcy5pc0RyYWdTZWxlY3Q9dGhpcy5vcHRpb25zLndyYXBBcm91bmQsdGhpcy5zZWxlY3QoaSksZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0LHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdFbmRcIix0LFtlXSl9LG8uZHJhZ0VuZFJlc3RpbmdTZWxlY3Q9ZnVuY3Rpb24oKXtcbnZhciB0PXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCksZT1NYXRoLmFicyh0aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsdGhpcy5zZWxlY3RlZEluZGV4KSksaT10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsMSksbj10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsLTEpLHM9aS5kaXN0YW5jZTxuLmRpc3RhbmNlP2kuaW5kZXg6bi5pbmRleDtyZXR1cm4gc30sby5fZ2V0Q2xvc2VzdFJlc3Rpbmc9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj10aGlzLnNlbGVjdGVkSW5kZXgscz0xLzAsbz10aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP2Z1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8PWV9OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8ZX07byhlLHMpJiYobis9aSxzPWUsZT10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsbiksbnVsbCE9PWUpOyllPU1hdGguYWJzKGUpO3JldHVybntkaXN0YW5jZTpzLGluZGV4Om4taX19LG8uZ2V0U2xpZGVEaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aCxzPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZpPjEsbz1zP24ubW9kdWxvKGUsaSk6ZSxyPXRoaXMuc2xpZGVzW29dO2lmKCFyKXJldHVybiBudWxsO3ZhciBhPXM/dGhpcy5zbGlkZWFibGVXaWR0aCpNYXRoLmZsb29yKGUvaSk6MDtyZXR1cm4gdC0oci50YXJnZXQrYSl9LG8uZHJhZ0VuZEJvb3N0U2VsZWN0PWZ1bmN0aW9uKCl7aWYodm9pZCAwPT09dGhpcy5wcmV2aW91c0RyYWdYfHwhdGhpcy5kcmFnTW92ZVRpbWV8fG5ldyBEYXRlLXRoaXMuZHJhZ01vdmVUaW1lPjEwMClyZXR1cm4gMDt2YXIgdD10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXRoaXMuZHJhZ1gsdGhpcy5zZWxlY3RlZEluZGV4KSxlPXRoaXMucHJldmlvdXNEcmFnWC10aGlzLmRyYWdYO3JldHVybiB0PjAmJmU+MD8xOnQ8MCYmZTwwPy0xOjB9LG8uc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmdldFBhcmVudENlbGwodC50YXJnZXQpLG49aSYmaS5lbGVtZW50LHM9aSYmdGhpcy5jZWxscy5pbmRleE9mKGkpO3RoaXMuZGlzcGF0Y2hFdmVudChcInN0YXRpY0NsaWNrXCIsdCxbZSxuLHNdKX0sby5vbnNjcm9sbD1mdW5jdGlvbigpe3ZhciB0PXMoKSxlPXRoaXMucG9pbnRlckRvd25TY3JvbGwueC10LngsaT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnktdC55OyhNYXRoLmFicyhlKT4zfHxNYXRoLmFicyhpKT4zKSYmdGhpcy5fcG9pbnRlckRvbmUoKX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5UYXBMaXN0ZW5lcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0KXt0aGlzLmJpbmRUYXAodCl9dmFyIG49aS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cmV0dXJuIG4uYmluZFRhcD1mdW5jdGlvbih0KXt0JiYodGhpcy51bmJpbmRUYXAoKSx0aGlzLnRhcEVsZW1lbnQ9dCx0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKSl9LG4udW5iaW5kVGFwPWZ1bmN0aW9uKCl7dGhpcy50YXBFbGVtZW50JiYodGhpcy5fYmluZFN0YXJ0RXZlbnQodGhpcy50YXBFbGVtZW50LCEwKSxkZWxldGUgdGhpcy50YXBFbGVtZW50KX0sbi5wb2ludGVyVXA9ZnVuY3Rpb24oaSxuKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPWkudHlwZSl7dmFyIHM9ZS5nZXRQb2ludGVyUG9pbnQobiksbz10aGlzLnRhcEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscj10LnBhZ2VYT2Zmc2V0LGE9dC5wYWdlWU9mZnNldCxsPXMueD49by5sZWZ0K3ImJnMueDw9by5yaWdodCtyJiZzLnk+PW8udG9wK2EmJnMueTw9by5ib3R0b20rYTtpZihsJiZ0aGlzLmVtaXRFdmVudChcInRhcFwiLFtpLG5dKSxcIm1vdXNldXBcIiE9aS50eXBlKXt0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwO3ZhciBoPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSBoLmlzSWdub3JpbmdNb3VzZVVwfSw0MDApfX19LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMucG9pbnRlckRvbmUoKSx0aGlzLnVuYmluZFRhcCgpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcHJldi1uZXh0LWJ1dHRvblwiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBzKHQsZSl7dGhpcy5kaXJlY3Rpb249dCx0aGlzLnBhcmVudD1lLHRoaXMuX2NyZWF0ZSgpfWZ1bmN0aW9uIG8odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/dDpcIk0gXCIrdC54MCtcIiw1MCBMIFwiK3QueDErXCIsXCIrKHQueTErNTApK1wiIEwgXCIrdC54MitcIixcIisodC55Mis1MCkrXCIgTCBcIit0LngzK1wiLDUwICBMIFwiK3QueDIrXCIsXCIrKDUwLXQueTIpK1wiIEwgXCIrdC54MStcIixcIisoNTAtdC55MSkrXCIgWlwifXZhciByPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtzLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pc1ByZXZpb3VzPXRoaXMuZGlyZWN0aW9uPT0tMTt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLnJpZ2h0VG9MZWZ0PzE6LTE7dGhpcy5pc0xlZnQ9dGhpcy5kaXJlY3Rpb249PXQ7dmFyIGU9dGhpcy5lbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7ZS5jbGFzc05hbWU9XCJmbGlja2l0eS1wcmV2LW5leHQtYnV0dG9uXCIsZS5jbGFzc05hbWUrPXRoaXMuaXNQcmV2aW91cz9cIiBwcmV2aW91c1wiOlwiIG5leHRcIixlLnNldEF0dHJpYnV0ZShcInR5cGVcIixcImJ1dHRvblwiKSx0aGlzLmRpc2FibGUoKSxlLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIix0aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiKTt2YXIgaT10aGlzLmNyZWF0ZVNWRygpO2UuYXBwZW5kQ2hpbGQoaSksdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMucGFyZW50Lm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGUuYmluZCh0aGlzKSksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmJpbmRUYXAodGhpcy5lbGVtZW50KSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyl9LHMucHJvdG90eXBlLmNyZWF0ZVNWRz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwic3ZnXCIpO3Quc2V0QXR0cmlidXRlKFwidmlld0JveFwiLFwiMCAwIDEwMCAxMDBcIik7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJwYXRoXCIpLGk9byh0aGlzLnBhcmVudC5vcHRpb25zLmFycm93U2hhcGUpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImRcIixpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsXCJhcnJvd1wiKSx0aGlzLmlzTGVmdHx8ZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIixcInRyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDE4MCkgXCIpLHQuYXBwZW5kQ2hpbGQoZSksdH0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24oKXtpZih0aGlzLmlzRW5hYmxlZCl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgdD10aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMucGFyZW50W3RdKCl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1uLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLm9uY2xpY2s9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5hY3RpdmVFbGVtZW50O3QmJnQ9PXRoaXMuZWxlbWVudCYmdGhpcy5vblRhcCgpfSxzLnByb3RvdHlwZS5lbmFibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZHx8KHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMSx0aGlzLmlzRW5hYmxlZD0hMCl9LHMucHJvdG90eXBlLmRpc2FibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZCYmKHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMCx0aGlzLmlzRW5hYmxlZD0hMSl9LHMucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcztpZih0aGlzLnBhcmVudC5vcHRpb25zLndyYXBBcm91bmQmJnQubGVuZ3RoPjEpcmV0dXJuIHZvaWQgdGhpcy5lbmFibGUoKTt2YXIgZT10Lmxlbmd0aD90Lmxlbmd0aC0xOjAsaT10aGlzLmlzUHJldmlvdXM/MDplLG49dGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleD09aT9cImRpc2FibGVcIjpcImVuYWJsZVwiO3RoaXNbbl0oKX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxuLmV4dGVuZChlLmRlZmF1bHRzLHtwcmV2TmV4dEJ1dHRvbnM6ITAsYXJyb3dTaGFwZTp7eDA6MTAseDE6NjAseTE6NTAseDI6NzAseTI6NDAseDM6MzB9fSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUHJldk5leHRCdXR0b25zXCIpO3ZhciBhPWUucHJvdG90eXBlO3JldHVybiBhLl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zJiYodGhpcy5wcmV2QnV0dG9uPW5ldyBzKCgtMSksdGhpcyksdGhpcy5uZXh0QnV0dG9uPW5ldyBzKDEsdGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucykpfSxhLmFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxhLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5vZmYoXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sZS5QcmV2TmV4dEJ1dHRvbj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wYWdlLWRvdHNcIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcyh0KXt0aGlzLnBhcmVudD10LHRoaXMuX2NyZWF0ZSgpfXMucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmhvbGRlcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIiksdGhpcy5ob2xkZXIuY2xhc3NOYW1lPVwiZmxpY2tpdHktcGFnZS1kb3RzXCIsdGhpcy5kb3RzPVtdLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuc2V0RG90cygpLHRoaXMuYmluZFRhcCh0aGlzLmhvbGRlciksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmhvbGRlcil9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuaG9sZGVyKSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyl9LHMucHJvdG90eXBlLnNldERvdHM9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXMubGVuZ3RoLXRoaXMuZG90cy5sZW5ndGg7dD4wP3RoaXMuYWRkRG90cyh0KTp0PDAmJnRoaXMucmVtb3ZlRG90cygtdCl9LHMucHJvdG90eXBlLmFkZERvdHM9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxpPVtdO3Q7KXt2YXIgbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7bi5jbGFzc05hbWU9XCJkb3RcIixlLmFwcGVuZENoaWxkKG4pLGkucHVzaChuKSx0LS19dGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoZSksdGhpcy5kb3RzPXRoaXMuZG90cy5jb25jYXQoaSl9LHMucHJvdG90eXBlLnJlbW92ZURvdHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5kb3RzLnNwbGljZSh0aGlzLmRvdHMubGVuZ3RoLXQsdCk7ZS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXMuaG9sZGVyLnJlbW92ZUNoaWxkKHQpfSx0aGlzKX0scy5wcm90b3R5cGUudXBkYXRlU2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkRG90JiYodGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3RcIiksdGhpcy5kb3RzLmxlbmd0aCYmKHRoaXMuc2VsZWN0ZWREb3Q9dGhpcy5kb3RzW3RoaXMucGFyZW50LnNlbGVjdGVkSW5kZXhdLHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90IGlzLXNlbGVjdGVkXCIpfSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbih0KXt2YXIgZT10LnRhcmdldDtpZihcIkxJXCI9PWUubm9kZU5hbWUpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIGk9dGhpcy5kb3RzLmluZGV4T2YoZSk7dGhpcy5wYXJlbnQuc2VsZWN0KGkpfX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsbi5leHRlbmQoZS5kZWZhdWx0cyx7cGFnZURvdHM6ITB9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQYWdlRG90c1wiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGFnZURvdHMmJih0aGlzLnBhZ2VEb3RzPW5ldyBzKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQYWdlRG90cyksdGhpcy5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlU2VsZWN0ZWRQYWdlRG90cyksdGhpcy5vbihcImNlbGxDaGFuZ2VcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwicmVzaXplXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQYWdlRG90cykpfSxvLmFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmFjdGl2YXRlKCl9LG8udXBkYXRlU2VsZWN0ZWRQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMudXBkYXRlU2VsZWN0ZWQoKX0sby51cGRhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuc2V0RG90cygpfSxvLmRlYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BsYXllclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vZmxpY2tpdHlcIl0sZnVuY3Rpb24odCxpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpKTplKHQuRXZFbWl0dGVyLHQuZml6enlVSVV0aWxzLHQuRmxpY2tpdHkpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dGhpcy5wYXJlbnQ9dCx0aGlzLnN0YXRlPVwic3RvcHBlZFwiLG8mJih0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eUNoYW5nZSgpfS5iaW5kKHRoaXMpLHRoaXMub25WaXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eVBsYXkoKX0uYmluZCh0aGlzKSl9dmFyIHMsbztcImhpZGRlblwiaW4gZG9jdW1lbnQ/KHM9XCJoaWRkZW5cIixvPVwidmlzaWJpbGl0eWNoYW5nZVwiKTpcIndlYmtpdEhpZGRlblwiaW4gZG9jdW1lbnQmJihzPVwid2Via2l0SGlkZGVuXCIsbz1cIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIiksbi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0LnByb3RvdHlwZSksbi5wcm90b3R5cGUucGxheT1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiIT10aGlzLnN0YXRlKXt2YXIgdD1kb2N1bWVudFtzXTtpZihvJiZ0KXJldHVybiB2b2lkIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpO3RoaXMuc3RhdGU9XCJwbGF5aW5nXCIsbyYmZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKSx0aGlzLnRpY2soKX19LG4ucHJvdG90eXBlLnRpY2s9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSl7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5hdXRvUGxheTt0PVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6M2UzO3ZhciBlPXRoaXM7dGhpcy5jbGVhcigpLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wYXJlbnQubmV4dCghMCksZS50aWNrKCl9LHQpfX0sbi5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3RoaXMuc3RhdGU9XCJzdG9wcGVkXCIsdGhpcy5jbGVhcigpLG8mJmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSl9LG4ucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCl9LG4ucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7XCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUmJih0aGlzLnN0YXRlPVwicGF1c2VkXCIsdGhpcy5jbGVhcigpKX0sbi5wcm90b3R5cGUudW5wYXVzZT1mdW5jdGlvbigpe1wicGF1c2VkXCI9PXRoaXMuc3RhdGUmJnRoaXMucGxheSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnRbc107dGhpc1t0P1wicGF1c2VcIjpcInVucGF1c2VcIl0oKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnBsYXkoKSxkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KX0sZS5leHRlbmQoaS5kZWZhdWx0cyx7cGF1c2VBdXRvUGxheU9uSG92ZXI6ITB9KSxpLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQbGF5ZXJcIik7dmFyIHI9aS5wcm90b3R5cGU7cmV0dXJuIHIuX2NyZWF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyPW5ldyBuKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQbGF5ZXIpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBsYXllcil9LHIuYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuYXV0b1BsYXkmJih0aGlzLnBsYXllci5wbGF5KCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcykpfSxyLnBsYXlQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wbGF5KCl9LHIuc3RvcFBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKX0sci5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBhdXNlKCl9LHIudW5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKX0sci5kZWFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpfSxyLm9ubW91c2VlbnRlcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYXVzZUF1dG9QbGF5T25Ib3ZlciYmKHRoaXMucGxheWVyLnBhdXNlKCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcykpfSxyLm9ubW91c2VsZWF2ZT1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKX0saS5QbGF5ZXI9bixpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtlLmFwcGVuZENoaWxkKHQuZWxlbWVudCl9KSxlfXZhciBzPWUucHJvdG90eXBlO3JldHVybiBzLmluc2VydD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX21ha2VDZWxscyh0KTtpZihpJiZpLmxlbmd0aCl7dmFyIHM9dGhpcy5jZWxscy5sZW5ndGg7ZT12b2lkIDA9PT1lP3M6ZTt2YXIgbz1uKGkpLHI9ZT09cztpZihyKXRoaXMuc2xpZGVyLmFwcGVuZENoaWxkKG8pO2Vsc2V7dmFyIGE9dGhpcy5jZWxsc1tlXS5lbGVtZW50O3RoaXMuc2xpZGVyLmluc2VydEJlZm9yZShvLGEpfWlmKDA9PT1lKXRoaXMuY2VsbHM9aS5jb25jYXQodGhpcy5jZWxscyk7ZWxzZSBpZihyKXRoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSk7ZWxzZXt2YXIgbD10aGlzLmNlbGxzLnNwbGljZShlLHMtZSk7dGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKS5jb25jYXQobCl9dGhpcy5fc2l6ZUNlbGxzKGkpO3ZhciBoPWU+dGhpcy5zZWxlY3RlZEluZGV4PzA6aS5sZW5ndGg7dGhpcy5fY2VsbEFkZGVkUmVtb3ZlZChlLGgpfX0scy5hcHBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCx0aGlzLmNlbGxzLmxlbmd0aCl9LHMucHJlcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LDApfSxzLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZSxuLHM9dGhpcy5nZXRDZWxscyh0KSxvPTAscj1zLmxlbmd0aDtmb3IoZT0wO2U8cjtlKyspe249c1tlXTt2YXIgYT10aGlzLmNlbGxzLmluZGV4T2Yobik8dGhpcy5zZWxlY3RlZEluZGV4O28tPWE/MTowfWZvcihlPTA7ZTxyO2UrKyluPXNbZV0sbi5yZW1vdmUoKSxpLnJlbW92ZUZyb20odGhpcy5jZWxscyxuKTtzLmxlbmd0aCYmdGhpcy5fY2VsbEFkZGVkUmVtb3ZlZCgwLG8pfSxzLl9jZWxsQWRkZWRSZW1vdmVkPWZ1bmN0aW9uKHQsZSl7ZT1lfHwwLHRoaXMuc2VsZWN0ZWRJbmRleCs9ZSx0aGlzLnNlbGVjdGVkSW5kZXg9TWF0aC5tYXgoMCxNYXRoLm1pbih0aGlzLnNsaWRlcy5sZW5ndGgtMSx0aGlzLnNlbGVjdGVkSW5kZXgpKSx0aGlzLmNlbGxDaGFuZ2UodCwhMCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQWRkZWRSZW1vdmVkXCIsW3QsZV0pfSxzLmNlbGxTaXplQ2hhbmdlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtpZihlKXtlLmdldFNpemUoKTt2YXIgaT10aGlzLmNlbGxzLmluZGV4T2YoZSk7dGhpcy5jZWxsQ2hhbmdlKGkpfX0scy5jZWxsQ2hhbmdlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZWFibGVXaWR0aDtpZih0aGlzLl9wb3NpdGlvbkNlbGxzKHQpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwiY2VsbENoYW5nZVwiLFt0XSksdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwpe3ZhciBuPWktdGhpcy5zbGlkZWFibGVXaWR0aDt0aGlzLngrPW4qdGhpcy5jZWxsQWxpZ24sdGhpcy5wb3NpdGlvblNsaWRlcigpfWVsc2UgZSYmdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKSx0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvbGF6eWxvYWRcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe2lmKFwiSU1HXCI9PXQubm9kZU5hbWUmJnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSlyZXR1cm5bdF07dmFyIGU9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWRdXCIpO3JldHVybiBpLm1ha2VBcnJheShlKX1mdW5jdGlvbiBzKHQsZSl7dGhpcy5pbWc9dCx0aGlzLmZsaWNraXR5PWUsdGhpcy5sb2FkKCl9ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlTGF6eWxvYWRcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZUxhenlsb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbihcInNlbGVjdFwiLHRoaXMubGF6eUxvYWQpfSxvLmxhenlMb2FkPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmxhenlMb2FkO2lmKHQpe3ZhciBlPVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6MCxpPXRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoZSksbz1bXTtpLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGU9bih0KTtvPW8uY29uY2F0KGUpfSksby5mb3JFYWNoKGZ1bmN0aW9uKHQpe25ldyBzKHQsdGhpcyl9LHRoaXMpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9aS5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSx0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpfSxzLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWxvYWRlZFwiKX0scy5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5ZXJyb3JcIil9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKHQsZSl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKTt2YXIgaT10aGlzLmZsaWNraXR5LmdldFBhcmVudENlbGwodGhpcy5pbWcpLG49aSYmaS5lbGVtZW50O3RoaXMuZmxpY2tpdHkuY2VsbFNpemVDaGFuZ2UobiksdGhpcy5pbWcuY2xhc3NMaXN0LmFkZChlKSx0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoXCJsYXp5TG9hZFwiLHQsbil9LGUuTGF6eUxvYWRlcj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9pbmRleFwiLFtcIi4vZmxpY2tpdHlcIixcIi4vZHJhZ1wiLFwiLi9wcmV2LW5leHQtYnV0dG9uXCIsXCIuL3BhZ2UtZG90c1wiLFwiLi9wbGF5ZXJcIixcIi4vYWRkLXJlbW92ZS1jZWxsXCIsXCIuL2xhenlsb2FkXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiLi9kcmFnXCIpLHJlcXVpcmUoXCIuL3ByZXYtbmV4dC1idXR0b25cIikscmVxdWlyZShcIi4vcGFnZS1kb3RzXCIpLHJlcXVpcmUoXCIuL3BsYXllclwiKSxyZXF1aXJlKFwiLi9hZGQtcmVtb3ZlLWNlbGxcIikscmVxdWlyZShcIi4vbGF6eWxvYWRcIikpKX0od2luZG93LGZ1bmN0aW9uKHQpe3JldHVybiB0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHktYXMtbmF2LWZvci9hcy1uYXYtZm9yXCIsW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSxpKXtyZXR1cm4oZS10KSppK3R9dC5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlQXNOYXZGb3JcIik7dmFyIG49dC5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVzdHJveVwiLHRoaXMuZGVzdHJveUFzTmF2Rm9yKTt2YXIgdD10aGlzLm9wdGlvbnMuYXNOYXZGb3I7aWYodCl7dmFyIGU9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5zZXROYXZDb21wYW5pb24odCl9KX19LG4uc2V0TmF2Q29tcGFuaW9uPWZ1bmN0aW9uKGkpe2k9ZS5nZXRRdWVyeUVsZW1lbnQoaSk7dmFyIG49dC5kYXRhKGkpO2lmKG4mJm4hPXRoaXMpe3RoaXMubmF2Q29tcGFuaW9uPW47dmFyIHM9dGhpczt0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKCl7cy5uYXZDb21wYW5pb25TZWxlY3QoKX0sbi5vbihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub24oXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksdGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfX0sbi5uYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24odCl7aWYodGhpcy5uYXZDb21wYW5pb24pe3ZhciBlPXRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHNbMF0sbj10aGlzLm5hdkNvbXBhbmlvbi5jZWxscy5pbmRleE9mKGUpLHM9bit0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzLmxlbmd0aC0xLG89TWF0aC5mbG9vcihpKG4scyx0aGlzLm5hdkNvbXBhbmlvbi5jZWxsQWxpZ24pKTtpZih0aGlzLnNlbGVjdENlbGwobywhMSx0KSx0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKSwhKG8+PXRoaXMuY2VsbHMubGVuZ3RoKSl7dmFyIHI9dGhpcy5jZWxscy5zbGljZShuLHMrMSk7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzPXIubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KSx0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9fX0sbi5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuY2xhc3NMaXN0W3RdKFwiaXMtbmF2LXNlbGVjdGVkXCIpfSl9LG4uYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX0sbi5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzPWZ1bmN0aW9uKCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzJiYodGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpLGRlbGV0ZSB0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMpfSxuLm9uTmF2U3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlLGksbil7XCJudW1iZXJcIj09dHlwZW9mIG4mJnRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdENlbGwobil9LG4uZGVhY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCl9LG4uZGVzdHJveUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb24mJih0aGlzLm5hdkNvbXBhbmlvbi5vZmYoXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9mZihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSxkZWxldGUgdGhpcy5uYXZDb21wYW5pb24pfSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LmltYWdlc0xvYWRlZD1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZihcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfWZ1bmN0aW9uIHModCxlLG8pe3JldHVybiB0aGlzIGluc3RhbmNlb2Ygcz8oXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodCkpLHRoaXMuZWxlbWVudHM9bih0KSx0aGlzLm9wdGlvbnM9aSh7fSx0aGlzLm9wdGlvbnMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGU/bz1lOmkodGhpcy5vcHRpb25zLGUpLG8mJnRoaXMub24oXCJhbHdheXNcIixvKSx0aGlzLmdldEltYWdlcygpLGEmJih0aGlzLmpxRGVmZXJyZWQ9bmV3IGEuRGVmZXJyZWQpLHZvaWQgc2V0VGltZW91dChmdW5jdGlvbigpe3RoaXMuY2hlY2soKX0uYmluZCh0aGlzKSkpOm5ldyBzKHQsZSxvKX1mdW5jdGlvbiBvKHQpe3RoaXMuaW1nPXR9ZnVuY3Rpb24gcih0LGUpe3RoaXMudXJsPXQsdGhpcy5lbGVtZW50PWUsdGhpcy5pbWc9bmV3IEltYWdlfXZhciBhPXQualF1ZXJ5LGw9dC5jb25zb2xlO3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLHMucHJvdG90eXBlLm9wdGlvbnM9e30scy5wcm90b3R5cGUuZ2V0SW1hZ2VzPWZ1bmN0aW9uKCl7dGhpcy5pbWFnZXM9W10sdGhpcy5lbGVtZW50cy5mb3JFYWNoKHRoaXMuYWRkRWxlbWVudEltYWdlcyx0aGlzKX0scy5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcz1mdW5jdGlvbih0KXtcIklNR1wiPT10Lm5vZGVOYW1lJiZ0aGlzLmFkZEltYWdlKHQpLHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kPT09ITAmJnRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXModCk7dmFyIGU9dC5ub2RlVHlwZTtpZihlJiZoW2VdKXtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpLG49MDtuPGkubGVuZ3RoO24rKyl7dmFyIHM9aVtuXTt0aGlzLmFkZEltYWdlKHMpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCl7dmFyIG89dC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKTtmb3Iobj0wO248by5sZW5ndGg7bisrKXt2YXIgcj1vW25dO3RoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMocil9fX19O3ZhciBoPXsxOiEwLDk6ITAsMTE6ITB9O3JldHVybiBzLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcz1mdW5jdGlvbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO2lmKGUpZm9yKHZhciBpPS91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKTtudWxsIT09bjspe3ZhciBzPW4mJm5bMl07cyYmdGhpcy5hZGRCYWNrZ3JvdW5kKHMsdCksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpfX0scy5wcm90b3R5cGUuYWRkSW1hZ2U9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG8odCk7dGhpcy5pbWFnZXMucHVzaChlKX0scy5wcm90b3R5cGUuYWRkQmFja2dyb3VuZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyByKHQsZSk7dGhpcy5pbWFnZXMucHVzaChpKX0scy5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSxuKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wcm9ncmVzcyh0LGksbil9KX12YXIgZT10aGlzO3JldHVybiB0aGlzLnByb2dyZXNzZWRDb3VudD0wLHRoaXMuaGFzQW55QnJva2VuPSExLHRoaXMuaW1hZ2VzLmxlbmd0aD92b2lkIHRoaXMuaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5vbmNlKFwicHJvZ3Jlc3NcIix0KSxlLmNoZWNrKCl9KTp2b2lkIHRoaXMuY29tcGxldGUoKX0scy5wcm90b3R5cGUucHJvZ3Jlc3M9ZnVuY3Rpb24odCxlLGkpe3RoaXMucHJvZ3Jlc3NlZENvdW50KyssdGhpcy5oYXNBbnlCcm9rZW49dGhpcy5oYXNBbnlCcm9rZW58fCF0LmlzTG9hZGVkLHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0LGVdKSx0aGlzLmpxRGVmZXJyZWQmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkodGhpcyx0KSx0aGlzLnByb2dyZXNzZWRDb3VudD09dGhpcy5pbWFnZXMubGVuZ3RoJiZ0aGlzLmNvbXBsZXRlKCksdGhpcy5vcHRpb25zLmRlYnVnJiZsJiZsLmxvZyhcInByb2dyZXNzOiBcIitpLHQsZSl9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5oYXNBbnlCcm9rZW4/XCJmYWlsXCI6XCJkb25lXCI7aWYodGhpcy5pc0NvbXBsZXRlPSEwLHRoaXMuZW1pdEV2ZW50KHQsW3RoaXNdKSx0aGlzLmVtaXRFdmVudChcImFsd2F5c1wiLFt0aGlzXSksdGhpcy5qcURlZmVycmVkKXt2YXIgZT10aGlzLmhhc0FueUJyb2tlbj9cInJlamVjdFwiOlwicmVzb2x2ZVwiO3RoaXMuanFEZWZlcnJlZFtlXSh0aGlzKX19LG8ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLG8ucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtyZXR1cm4gdD92b2lkIHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpOih0aGlzLnByb3h5SW1hZ2U9bmV3IEltYWdlLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHZvaWQodGhpcy5wcm94eUltYWdlLnNyYz10aGlzLmltZy5zcmMpKX0sby5wcm90b3R5cGUuZ2V0SXNJbWFnZUNvbXBsZXRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW1nLmNvbXBsZXRlJiZ2b2lkIDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGh9LG8ucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuaW1nLGVdKX0sby5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxvLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITAsXCJvbmxvYWRcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMSxcIm9uZXJyb3JcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoby5wcm90b3R5cGUpLHIucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy51cmw7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTt0JiYodGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIiksdGhpcy51bmJpbmRFdmVudHMoKSl9LHIucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuZWxlbWVudCxlXSl9LHMubWFrZUpRdWVyeVBsdWdpbj1mdW5jdGlvbihlKXtlPWV8fHQualF1ZXJ5LGUmJihhPWUsYS5mbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcyh0aGlzLHQsZSk7cmV0dXJuIGkuanFEZWZlcnJlZC5wcm9taXNlKGEodGhpcykpfSl9LHMubWFrZUpRdWVyeVBsdWdpbigpLHN9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJpbWFnZXNsb2FkZWRcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5pbWFnZXNMb2FkZWQpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2UuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUltYWdlc0xvYWRlZFwiKTt2YXIgbj1lLnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlSW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5pbWFnZXNMb2FkZWQpfSxuLmltYWdlc0xvYWRlZD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpKXt2YXIgbj1lLmdldFBhcmVudENlbGwoaS5pbWcpO2UuY2VsbFNpemVDaGFuZ2UobiYmbi5lbGVtZW50KSxlLm9wdGlvbnMuZnJlZVNjcm9sbHx8ZS5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX1pZih0aGlzLm9wdGlvbnMuaW1hZ2VzTG9hZGVkKXt2YXIgZT10aGlzO2kodGhpcy5zbGlkZXIpLm9uKFwicHJvZ3Jlc3NcIix0KX19LGV9KTsiLCIvKipcbiAqIEZsaWNraXR5IGJhY2tncm91bmQgbGF6eWxvYWQgdjEuMC4wXG4gKiBsYXp5bG9hZCBiYWNrZ3JvdW5kIGNlbGwgaW1hZ2VzXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdmbGlja2l0eS9qcy9pbmRleCcsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgcmVxdWlyZSgnZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggRmxpY2tpdHksIHV0aWxzICkge1xuLypqc2hpbnQgc3RyaWN0OiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUJnTGF6eUxvYWQnKTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlQmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5iZ0xhenlMb2FkICk7XG59O1xuXG5wcm90by5iZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYXp5TG9hZCA9IHRoaXMub3B0aW9ucy5iZ0xhenlMb2FkO1xuICBpZiAoICFsYXp5TG9hZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBnZXQgYWRqYWNlbnQgY2VsbHMsIHVzZSBsYXp5TG9hZCBvcHRpb24gZm9yIGFkamFjZW50IGNvdW50XG4gIHZhciBhZGpDb3VudCA9IHR5cGVvZiBsYXp5TG9hZCA9PSAnbnVtYmVyJyA/IGxhenlMb2FkIDogMDtcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoIGFkakNvdW50ICk7XG5cbiAgZm9yICggdmFyIGk9MDsgaSA8IGNlbGxFbGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgY2VsbEVsZW0gPSBjZWxsRWxlbXNbaV07XG4gICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2VsbEVsZW0gKTtcbiAgICAvLyBzZWxlY3QgbGF6eSBlbGVtcyBpbiBjZWxsXG4gICAgdmFyIGNoaWxkcmVuID0gY2VsbEVsZW0ucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWRdJyk7XG4gICAgZm9yICggdmFyIGo9MDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrICkge1xuICAgICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2hpbGRyZW5bal0gKTtcbiAgICB9XG4gIH1cbn07XG5cbnByb3RvLmJnTGF6eUxvYWRFbGVtID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbiAgaWYgKCBhdHRyICkge1xuICAgIG5ldyBCZ0xhenlMb2FkZXIoIGVsZW0sIGF0dHIsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTGF6eUJHTG9hZGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogY2xhc3MgdG8gaGFuZGxlIGxvYWRpbmcgaW1hZ2VzXG4gKi9cbmZ1bmN0aW9uIEJnTGF6eUxvYWRlciggZWxlbSwgdXJsLCBmbGlja2l0eSApIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbTtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gIHRoaXMuZmxpY2tpdHkgPSBmbGlja2l0eTtcbiAgdGhpcy5sb2FkKCk7XG59XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGxvYWQgaW1hZ2VcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIHJlbW92ZSBhdHRyXG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgdGhpcy51cmwgKyAnKSc7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWxvYWRlZCcgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5ZXJyb3InICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oIGV2ZW50LCBjbGFzc05hbWUgKSB7XG4gIC8vIHVuYmluZCBldmVudHNcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcblxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XG4gIHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudCggJ2JnTGF6eUxvYWQnLCBldmVudCwgdGhpcy5lbGVtZW50ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuQmdMYXp5TG9hZGVyID0gQmdMYXp5TG9hZGVyO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAxLjIuMjdcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgc2luZ2xlOiB0cnVlLCB0aGlzOiB0cnVlLCBtdWx0aXZhcjogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1t8XFxcXHt9KClbXFxdXiQrKj8uXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSBjb250YWluZXJDbGFzcztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSgpKSxcblxuICAgICAgICBrZXlzID0ge1xuICAgICAgICAgICAgRVNDOiAyNyxcbiAgICAgICAgICAgIFRBQjogOSxcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXG4gICAgICAgICAgICBMRUZUOiAzNyxcbiAgICAgICAgICAgIFVQOiAzOCxcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcbiAgICAgICAgICAgIERPV046IDQwXG4gICAgICAgIH07XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGUoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG5vb3AgPSAkLm5vb3AsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcbiAgICAgICAgICAgICAgICBvblNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0OiBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaENvbXBsZXRlOiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMnLFxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9va3VwRmlsdGVyOiBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgb3JpZ2luYWxRdWVyeSwgcXVlcnlMb3dlckNhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdxdWVyeScsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcbiAgICAgICAgdGhhdC5lbCA9ICQoZWwpO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoYXQuaXNMb2NhbCA9IGZhbHNlO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbjogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJ1xuICAgICAgICB9O1xuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xuICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9ICcnO1xuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2V0IG9wdGlvbnM6XG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XG5cbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcblxuICAgIEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgY3VycmVudFZhbHVlKSB7XG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGF0dGVybiA9ICcoJyArIHV0aWxzLmVzY2FwZVJlZ0V4Q2hhcnMoY3VycmVudFZhbHVlKSArICcpJztcblxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKSwgJzxzdHJvbmc+JDE8XFwvc3Ryb25nPicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAga2lsbGVyRm46IG51bGwsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcblxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcblxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5dXAuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignY2hhbmdlLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5lbC52YWwoKS5sZW5ndGggPj0gdGhhdC5vcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBhYm9ydEFqYXg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCBzdXBwbGllZE9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XG5cbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xuICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogb3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHdoZW4gY29udGFpbmVyIGhhcyBhbHJlYWR5IGl0cyBjb250ZW50XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cbiAgICAgICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGZvcmNlIHBhcmFtZXRlciBtdXN0IGJlIGdpdmVuLlxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2l0ZVNlYXJjaERpdiA9ICQoJy5zaXRlLXNlYXJjaCcpO1xuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBzaXRlU2VhcmNoRGl2Lm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy53aWR0aCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJXaWR0aCgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvbnRhaW5lci5jc3Moc3R5bGVzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gcmVzdG9yZSB2YWx1ZSB3aGVuIFxuICAgICAgICAgICAgICAgICAgICAvLyBwcmVzZXJ2ZUlucHV0ID09PSB0cnVlLCBcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkaWQgbm90IGNoYW5nZSBpdFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYXRlZ29yeSA9IHN1Z2dlc3Rpb24uZGF0YVtncm91cEJ5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBjdXJyZW50Q2F0ZWdvcnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnkpe1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSwgaSkgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihiZWZvcmVSZW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBub1N1Z2dlc3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXG4gICAgICAgICAgICAvLyBBbHNvIGl0IGFkanVzdHMgaWYgaW5wdXQgd2lkdGggaGFzIGNoYW5nZWQuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiAhcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNoaWxkcmVuKCkuZmlyc3QoKS5yZW1vdmVDbGFzcyh0aGF0LmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBsb3dlckJvdW5kLFxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgICAgICBvZmZzZXRUb3AgPSBhY3RpdmVJdGVtLm9mZnNldFRvcDtcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XG5cbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0VG9wID4gbG93ZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2sgPSB0aGF0Lm9wdGlvbnMub25TZWxlY3QsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZ2V0VmFsdWUoc3VnZ2VzdGlvbi52YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcbiAgICAkLmZuLmF1dG9jb21wbGV0ZSA9ICQuZm4uZGV2YnJpZGdlQXV0b2NvbXBsZXRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxuICAgICAgICAvLyBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgbWF0Y2hlZCBlbGVtZW50OlxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLCJcbiQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcblxudmFyIGJhc2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2Jhc2UnKTtcbnZhciBiYXNlSHJlZiA9IG51bGw7XG5cbmlmIChiYXNlcy5sZW5ndGggPiAwKSB7XG4gICAgYmFzZUhyZWYgPSBiYXNlc1swXS5ocmVmO1xufVxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBMYXp5IExvYWRpbmcgSW1hZ2VzOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG52YXIgbXlMYXp5TG9hZCA9IG5ldyBMYXp5TG9hZCh7XG4gICAgLy8gZXhhbXBsZSBvZiBvcHRpb25zIG9iamVjdCAtPiBzZWUgb3B0aW9ucyBzZWN0aW9uXG4gICAgZWxlbWVudHNfc2VsZWN0b3I6IFwiLmRwLWxhenlcIlxuICAgIC8vIHRocm90dGxlOiAyMDAsXG4gICAgLy8gZGF0YV9zcmM6IFwic3JjXCIsXG4gICAgLy8gZGF0YV9zcmNzZXQ6IFwic3Jjc2V0XCIsXG4gICAgLy8gY2FsbGJhY2tfc2V0OiBmdW5jdGlvbigpIHsgLyogLi4uICovIH1cbn0pO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIEJpZyBDYXJvdXNlbCAoSG9tZSBQYWdlKTpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG52YXIgJGNhcm91c2VsID0gJCgnLmNhcm91c2VsJykuZmxpY2tpdHkoe1xuXHRpbWFnZXNMb2FkZWQ6IHRydWUsXG5cdHBlcmNlbnRQb3NpdGlvbjogZmFsc2UsXG5cdHNlbGVjdGVkQXR0cmFjdGlvbjogMC4wMTUsXG5cdGZyaWN0aW9uOiAwLjMsXG5cdHByZXZOZXh0QnV0dG9uczogZmFsc2UsXG5cdGRyYWdnYWJsZTogdHJ1ZSxcblx0YXV0b1BsYXk6IHRydWUsXG5cdGF1dG9QbGF5OiA4MDAwLFxuXHRwYXVzZUF1dG9QbGF5T25Ib3ZlcjogZmFsc2UsXG5cdGJnTGF6eUxvYWQ6IHRydWUsXG59KTtcblxudmFyICRpbWdzID0gJGNhcm91c2VsLmZpbmQoJy5jYXJvdXNlbC1jZWxsIC5jZWxsLWJnJyk7XG4vLyBnZXQgdHJhbnNmb3JtIHByb3BlcnR5XG52YXIgZG9jU3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XG52YXIgdHJhbnNmb3JtUHJvcCA9IHR5cGVvZiBkb2NTdHlsZS50cmFuc2Zvcm0gPT0gJ3N0cmluZycgP1xuICAndHJhbnNmb3JtJyA6ICdXZWJraXRUcmFuc2Zvcm0nO1xuLy8gZ2V0IEZsaWNraXR5IGluc3RhbmNlXG52YXIgZmxrdHkgPSAkY2Fyb3VzZWwuZGF0YSgnZmxpY2tpdHknKTtcblxuJGNhcm91c2VsLm9uKCAnc2Nyb2xsLmZsaWNraXR5JywgZnVuY3Rpb24oKSB7XG4gIGZsa3R5LnNsaWRlcy5mb3JFYWNoKCBmdW5jdGlvbiggc2xpZGUsIGkgKSB7XG4gICAgdmFyIGltZyA9ICRpbWdzW2ldO1xuICAgIHZhciB4ID0gKCBzbGlkZS50YXJnZXQgKyBmbGt0eS54ICkgKiAtMS8zO1xuICAgIGltZy5zdHlsZVsgdHJhbnNmb3JtUHJvcCBdID0gJ3RyYW5zbGF0ZVgoJyArIHggICsgJ3B4KSc7XG4gIH0pO1xufSk7XG5cbiQoJy5jYXJvdXNlbC1uYXYtY2VsbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRmbGt0eS5zdG9wUGxheWVyKCk7XG59KTtcblxudmFyICRnYWxsZXJ5ID0gJCgnLmNhcm91c2VsJykuZmxpY2tpdHkoKTtcblxuZnVuY3Rpb24gb25Mb2FkZWRkYXRhKCBldmVudCApIHtcblx0dmFyIGNlbGwgPSAkZ2FsbGVyeS5mbGlja2l0eSggJ2dldFBhcmVudENlbGwnLCBldmVudC50YXJnZXQgKTtcblx0JGdhbGxlcnkuZmxpY2tpdHkoICdjZWxsU2l6ZUNoYW5nZScsIGNlbGwgJiYgY2VsbC5lbGVtZW50ICk7XG59XG5cbiRnYWxsZXJ5LmZpbmQoJ3ZpZGVvJykuZWFjaCggZnVuY3Rpb24oIGksIHZpZGVvICkge1xuXHR2aWRlby5wbGF5KCk7XG5cdCQoIHZpZGVvICkub24oICdsb2FkZWRkYXRhJywgb25Mb2FkZWRkYXRhICk7XG59KTtcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gU2xpZGVzaG93IGJsb2NrIChpbiBjb250ZW50KTpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xudmFyICRzbGlkZXNob3cgPSAkKCcuc2xpZGVzaG93JykuZmxpY2tpdHkoe1xuXHQvL2FkYXB0aXZlSGVpZ2h0OiB0cnVlLFxuXHRpbWFnZXNMb2FkZWQ6IHRydWUsXG5cdGxhenlMb2FkOiB0cnVlXG59KTtcblxudmFyIHNsaWRlc2hvd2ZsayA9ICRzbGlkZXNob3cuZGF0YSgnZmxpY2tpdHknKTtcblxuJHNsaWRlc2hvdy5vbiggJ3NlbGVjdC5mbGlja2l0eScsIGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZyggJ0ZsaWNraXR5IHNlbGVjdCAnICsgc2xpZGVzaG93ZmxrLnNlbGVjdGVkSW5kZXggKTtcblx0Ly9zbGlkZXNob3dmbGsucmVsb2FkQ2VsbHMoKTtcbiAgXG59KVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFN0YXJ0IEZvdW5kYXRpb24gT3JiaXQgU2xpZGVyOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyB2YXIgc2xpZGVyT3B0aW9ucyA9IHtcbi8vIFx0Y29udGFpbmVyQ2xhc3M6ICdzbGlkZXJfX3NsaWRlcycsXG4vLyBcdHNsaWRlQ2xhc3M6ICdzbGlkZXJfX3NsaWRlJyxcbi8vIFx0bmV4dENsYXNzOiAnc2xpZGVyX19uYXYtLW5leHQnLFxuLy8gXHRwcmV2Q2xhc3M6ICdzbGlkZXJfX25hdi0tcHJldmlvdXMnLFxuXG4vLyB9O1xuXG5cbi8vIHZhciBzbGlkZXIgPSBuZXcgRm91bmRhdGlvbi5PcmJpdCgkKCcuc2xpZGVyJyksIHNsaWRlck9wdGlvbnMpO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vV3JhcCBldmVyeSBpZnJhbWUgaW4gYSBmbGV4IHZpZGVvIGNsYXNzIHRvIHByZXZlbnQgbGF5b3V0IGJyZWFrYWdlXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiQoJ2lmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcblx0JCh0aGlzKS53cmFwKCBcIjxkaXYgY2xhc3M9J2ZsZXgtdmlkZW8gd2lkZXNjcmVlbic+PC9kaXY+XCIgKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9EaXN0aW5ndWlzaCBkcm9wZG93bnMgb24gbW9iaWxlL2Rlc2t0b3A6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuJCgnLm5hdl9faXRlbS0tcGFyZW50JykuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHdoYXRJbnB1dC5hc2soKSA9PT0gJ3RvdWNoJykge1xuICAgIC8vIGRvIHRvdWNoIGlucHV0IHRoaW5nc1xuICAgIGlmKCEkKHRoaXMpLmhhc0NsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKSl7XG5cdCAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgJCgnLm5hdl9faXRlbS0tcGFyZW50JykucmVtb3ZlQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpO1xuXHQgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnbmF2X19pdGVtLS1pcy1ob3ZlcmVkJylcbiAgICB9XG4gIH0gZWxzZSBpZiAod2hhdElucHV0LmFzaygpID09PSAnbW91c2UnKSB7XG4gICAgLy8gZG8gbW91c2UgdGhpbmdzXG4gIH1cbn0pO1xuXG4vL0lmIGFueXRoaW5nIGluIHRoZSBtYWluIGNvbnRlbnQgY29udGFpbmVyIGlzIGNsaWNrZWQsIHJlbW92ZSBmYXV4IGhvdmVyIGNsYXNzLlxuJCgnI21haW4tY29udGVudF9fY29udGFpbmVyJykuY2xpY2soZnVuY3Rpb24oKXtcblx0JCgnLm5hdl9faXRlbScpLnJlbW92ZUNsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9TaXRlIFNlYXJjaDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5mdW5jdGlvbiB0b2dnbGVTZWFyY2hDbGFzc2VzKCl7XG5cdCQoXCJib2R5XCIpLnRvZ2dsZUNsYXNzKFwiYm9keS0tc2VhcmNoLWFjdGl2ZVwiKTtcblx0JChcIiNzaXRlLXNlYXJjaF9fZm9ybVwiKS50b2dnbGVDbGFzcyhcInNpdGUtc2VhcmNoX19mb3JtLS1pcy1pbmFjdGl2ZSBzaXRlLXNlYXJjaF9fZm9ybS0taXMtYWN0aXZlXCIpO1xuXHQkKFwiI3NpdGUtc2VhcmNoXCIpLnRvZ2dsZUNsYXNzKFwic2l0ZS1zZWFyY2gtLWlzLWluYWN0aXZlIHNpdGUtc2VhcmNoLS1pcy1hY3RpdmVcIik7XG5cdCQoXCIuaGVhZGVyX19zY3JlZW5cIikudG9nZ2xlQ2xhc3MoXCJoZWFkZXJfX3NjcmVlbi0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm1haW4tY29udGVudF9fY29udGFpbmVyXCIpLnRvZ2dsZUNsYXNzKFwibWFpbi1jb250ZW50X19jb250YWluZXItLWdyYXlzY2FsZVwiKTtcblx0JChcIi5uYXZfX3dyYXBwZXJcIikudG9nZ2xlQ2xhc3MoXCJuYXZfX3dyYXBwZXItLWdyYXlzY2FsZVwiKTtcblx0JChcIi5uYXZfX2xpbmstLXNlYXJjaFwiKS50b2dnbGVDbGFzcyhcIm5hdl9fbGluay0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblxuXHQvL0hBQ0s6IHdhaXQgZm9yIDVtcyBiZWZvcmUgY2hhbmdpbmcgZm9jdXMuIEkgZG9uJ3QgdGhpbmsgSSBuZWVkIHRoaXMgYW55bW9yZSBhY3R1YWxseS4uXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0ICAkKFwiLm5hdl9fd3JhcHBlclwiKS50b2dnbGVDbGFzcyhcIm5hdl9fd3JhcHBlci0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblx0fSwgNSk7XG5cblx0JChcIi5uYXZcIikudG9nZ2xlQ2xhc3MoXCJuYXYtLXNlYXJjaC1pcy1hY3RpdmVcIik7XG5cbn1cblxuJChcIi5uYXZfX2xpbmstLXNlYXJjaFwiKS5jbGljayhmdW5jdGlvbigpe1xuICBcdHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcbiAgXHRpZigkKFwiI21vYmlsZS1uYXZfX3dyYXBwZXJcIikuaGFzQ2xhc3MoXCJtb2JpbGUtbmF2X193cmFwcGVyLS1tb2JpbGUtbWVudS1pcy1hY3RpdmVcIikpe1xuICBcdFx0dG9nZ2xlTW9iaWxlTWVudUNsYXNzZXMoKTtcbiAgXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKS5hZGRDbGFzcygnc2l0ZS1zZWFyY2gtLW1vYmlsZScpO1xuICBcdH1cbiAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5mb2N1cygpO1xufSk7XG5cbiQoXCIubmF2X19saW5rLS1zZWFyY2gtY2FuY2VsXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaXRlLXNlYXJjaF9faW5wdXRcIikuYmx1cigpO1xufSk7XG5cbi8vV2hlbiBzZWFyY2ggZm9ybSBpcyBvdXQgb2YgZm9jdXMsIGRlYWN0aXZhdGUgaXQuXG4kKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7XG4gIFx0aWYoJChcIiNzaXRlLXNlYXJjaF9fZm9ybVwiKS5oYXNDbGFzcyhcInNpdGUtc2VhcmNoX19mb3JtLS1pcy1hY3RpdmVcIikpe1xuICBcdFx0Ly9Db21tZW50IG91dCB0aGUgZm9sbG93aW5nIGxpbmUgaWYgeW91IG5lZWQgdG8gdXNlIFdlYktpdC9CbGluayBpbnNwZWN0b3IgdG9vbCBvbiB0aGUgc2VhcmNoIChzbyBpdCBkb2Vzbid0IGxvc2UgZm9jdXMpOlxuICBcdFx0Ly90b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG4gIFx0fVxufSk7XG5cbiQoJ2lucHV0W25hbWU9XCJTZWFyY2hcIl0nKS5hdXRvY29tcGxldGUoe1xuICAgIHNlcnZpY2VVcmw6IGJhc2VIcmVmKycvaG9tZS9hdXRvQ29tcGxldGUnLFxuICAgIGRlZmVyUmVxdWVzdEJ5OiAxMDAsXG4gICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogZmFsc2UsXG4gICAgbWluQ2hhcnM6IDIsXG4gICAgYXV0b1NlbGVjdEZpcnN0OiB0cnVlLFxuICAgIHR5cGU6ICdwb3N0JyxcbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgJCgnI3NpdGUtc2VhcmNoX19mb3JtJykuc3VibWl0KCk7XG4gICAgfVxufSk7XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL01vYmlsZSBTZWFyY2g6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KCdtZWRpdW0nKSkge1xuICAvLyBUcnVlIGlmIG1lZGl1bSBvciBsYXJnZVxuICAvLyBGYWxzZSBpZiBzbWFsbFxuICAkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLWRlc2t0b3BcIik7XG59ZWxzZXtcblx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1tb2JpbGVcIik7XG59XG5cblxuJChcIi5uYXZfX3RvZ2dsZS0tc2VhcmNoXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gIFx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXG5cblxuICBcdC8vYXBwZW5kIG91ciBzaXRlIHNlYXJjaCBkaXYgdG8gdGhlIGhlYWRlci5cbiAgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKCcjaGVhZGVyJykuYWRkQ2xhc3MoJ3NpdGUtc2VhcmNoLS1tb2JpbGUnKTtcbiAgXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5mb2N1cygpO1xufSk7XG5cbi8vSWYgd2UncmUgcmVzaXppbmcgZnJvbSBtb2JpbGUgdG8gYW55dGhpbmcgZWxzZSwgdG9nZ2xlIHRoZSBtb2JpbGUgc2VhcmNoIGlmIGl0J3MgYWN0aXZlLlxuJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbihldmVudCwgbmV3U2l6ZSwgb2xkU2l6ZSkge1xuXG5cdCBpZiAobmV3U2l6ZSA9PSBcIm1lZGl1bVwiKSB7XG5cdCBcdC8vYWxlcnQoJ2hleScpO1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLnJlbW92ZUNsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcblx0IFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1kZXNrdG9wXCIpO1xuXG5cdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbyhcIiNuYXZcIik7XG5cblxuXHQgXHRpZigkKFwiI3NpdGUtc2VhcmNoXCIpLmhhc0NsYXNzKFwic2l0ZS1zZWFyY2gtLWlzLWFjdGl2ZVwiKSl7XG5cdCBcdFx0Ly8gdG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXHQgXHR9XG5cdCB9ZWxzZSBpZihuZXdTaXplID09IFwibW9iaWxlXCIpe1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKCcjaGVhZGVyJyk7XG4gXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikucmVtb3ZlQ2xhc3MoXCJzaXRlLXNlYXJjaC0tZGVza3RvcFwiKTtcbiBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1tb2JpbGVcIik7XG5cdCBcdGlmKCQoXCIjc2l0ZS1zZWFyY2hcIikuaGFzQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtYWN0aXZlXCIpKXtcblx0IFx0XHQvLyB0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cdCBcdH1cblx0IH1cblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9Nb2JpbGUgTmF2OlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8qIG5ldyBzdHVmZiBhZGRlZCBteSBCcmFuZG9uIC0gbGF6eSBjb2RpbmcgKi9cbiQoJy5uYXZfX3RvZ2dsZS0tbWVudScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdCQoJy5uYXZfX21lbnUtaWNvbicpLnRvZ2dsZUNsYXNzKCdpcy1jbGlja2VkJyk7XG5cdCQoXCIjbmF2X19tZW51LWljb25cIikudG9nZ2xlQ2xhc3MoXCJuYXZfX21lbnUtaWNvbi0tbWVudS1pcy1hY3RpdmVcIik7XG5cdCQodGhpcykucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbn0pO1xuJCgnLnNlY29uZC1sZXZlbC0tb3BlbicpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdCQodGhpcykucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ25hdl9faXRlbS0tb3BlbmVkJyk7XG59KTtcblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIEJhY2tncm91bmQgVmlkZW9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuJCgnLmJhY2tncm91bmR2aWRlb19fbGluaycpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuXHR2YXIgdGhhdCA9ICQodGhpcyk7XG5cdHZhciB2aWRlbyA9IHRoYXQuZGF0YSgndmlkZW8nKTtcblx0dmFyIHdpZHRoID0gJCgnaW1nJywgdGhhdCkud2lkdGgoKTtcblx0dmFyIGhlaWdodCA9ICQoJ2ltZycsIHRoYXQpLmhlaWdodCgpO1xuXHR0aGF0LnBhcmVudCgpLmFkZENsYXNzKCdvbicpO1xuXHR0aGF0LnBhcmVudCgpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmbGV4LXZpZGVvIHdpZGVzY3JlZW5cIj48aWZyYW1lIHNyYz1cImh0dHA6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJyArIHZpZGVvICsgJz9yZWw9MCZhdXRvcGxheT0xXCIgd2lkdGg9XCInICsgd2lkdGggKyAnXCIgaGVpZ2h0PVwiJyArIGhlaWdodCArICdcIiBmcmFtZWJvcmRlcj1cIjBcIiB3ZWJraXRBbGxvd0Z1bGxTY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93RnVsbFNjcmVlbj48L2lmcmFtZT48L2Rpdj4nKTtcblx0dGhhdC5oaWRlKCk7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL0F1dG9tYXRpYyBmdWxsIGhlaWdodCBzaWxkZXIsIG5vdCB3b3JraW5nIHlldC4uXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy8gZnVuY3Rpb24gc2V0RGltZW5zaW9ucygpe1xuLy8gICAgdmFyIHdpbmRvd3NIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbi8vICAgICQoJy5vcmJpdC1jb250YWluZXInKS5jc3MoJ2hlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcbi8vICAgLy8gJCgnLm9yYml0LWNvbnRhaW5lcicpLmNzcygnbWF4LWhlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcblxuLy8gICAgJCgnLm9yYml0LXNsaWRlJykuY3NzKCdoZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyAgICAkKCcub3JiaXQtc2xpZGUnKS5jc3MoJ21heC1oZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyB9XG5cbi8vICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4vLyAgICAgc2V0RGltZW5zaW9ucygpO1xuLy8gfSk7XG5cbi8vIHNldERpbWVuc2lvbnMoKTsiXX0=
