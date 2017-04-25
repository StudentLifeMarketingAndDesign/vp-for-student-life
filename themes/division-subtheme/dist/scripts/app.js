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

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (a) {
  for (var b = 1; b < arguments.length; b++) {
    var c = arguments[b];for (var d in c) {
      Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d]);
    }
  }return a;
},
    _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (a) {
  return typeof a === "undefined" ? "undefined" : _typeof2(a);
} : function (a) {
  return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a === "undefined" ? "undefined" : _typeof2(a);
};!function (a, b) {
  "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.LazyLoad = b();
}(undefined, function () {
  "use strict";
  var a = { elements_selector: "img", container: window, threshold: 300, throttle: 150, data_src: "original", data_srcset: "original-set", class_loading: "loading", class_loaded: "loaded", class_error: "error", class_initial: "initial", skip_invisible: !0, callback_load: null, callback_error: null, callback_set: null, callback_processed: null },
      b = !("onscroll" in window) || /glebot/.test(navigator.userAgent),
      c = function c(a, b) {
    a && a(b);
  },
      d = function d(a) {
    return a.getBoundingClientRect().top + window.pageYOffset - a.ownerDocument.documentElement.clientTop;
  },
      e = function e(a, b, c) {
    return (b === window ? window.innerHeight + window.pageYOffset : d(b) + b.offsetHeight) <= d(a) - c;
  },
      f = function f(a) {
    return a.getBoundingClientRect().left + window.pageXOffset - a.ownerDocument.documentElement.clientLeft;
  },
      g = function g(a, b, c) {
    var d = window.innerWidth;return (b === window ? d + window.pageXOffset : f(b) + d) <= f(a) - c;
  },
      h = function h(a, b, c) {
    return (b === window ? window.pageYOffset : d(b)) >= d(a) + c + a.offsetHeight;
  },
      i = function i(a, b, c) {
    return (b === window ? window.pageXOffset : f(b)) >= f(a) + c + a.offsetWidth;
  },
      j = function j(a, b, c) {
    return !(e(a, b, c) || h(a, b, c) || g(a, b, c) || i(a, b, c));
  },
      k = function k(a, b) {
    var c = new a(b),
        d = new CustomEvent("LazyLoad::Initialized", { detail: { instance: c } });window.dispatchEvent(d);
  },
      l = function l(a, b) {
    var c = a.parentElement;if ("PICTURE" === c.tagName) for (var d = 0; d < c.children.length; d++) {
      var e = c.children[d];if ("SOURCE" === e.tagName) {
        var f = e.dataset[b];f && e.setAttribute("srcset", f);
      }
    }
  },
      m = function m(a, b, c) {
    var d = a.tagName,
        e = a.dataset[c];if ("IMG" === d) {
      l(a, b);var f = a.dataset[b];return f && a.setAttribute("srcset", f), void (e && a.setAttribute("src", e));
    }if ("IFRAME" === d) return void (e && a.setAttribute("src", e));e && (a.style.backgroundImage = "url(" + e + ")");
  },
      n = function n(b) {
    this._settings = _extends({}, a, b), this._queryOriginNode = this._settings.container === window ? document : this._settings.container, this._previousLoopTime = 0, this._loopTimeout = null, this._boundHandleScroll = this.handleScroll.bind(this), this._isFirstLoop = !0, window.addEventListener("resize", this._boundHandleScroll), this.update();
  };n.prototype = { _reveal: function _reveal(a) {
      var b = this._settings,
          d = function d() {
        b && (a.removeEventListener("load", e), a.removeEventListener("error", d), a.classList.remove(b.class_loading), a.classList.add(b.class_error), c(b.callback_error, a));
      },
          e = function e() {
        b && (a.classList.remove(b.class_loading), a.classList.add(b.class_loaded), a.removeEventListener("load", e), a.removeEventListener("error", d), c(b.callback_load, a));
      };"IMG" !== a.tagName && "IFRAME" !== a.tagName || (a.addEventListener("load", e), a.addEventListener("error", d), a.classList.add(b.class_loading)), m(a, b.data_srcset, b.data_src), c(b.callback_set, a);
    }, _loopThroughElements: function _loopThroughElements() {
      var a = this._settings,
          d = this._elements,
          e = d ? d.length : 0,
          f = void 0,
          g = [],
          h = this._isFirstLoop;for (f = 0; f < e; f++) {
        var i = d[f];a.skip_invisible && null === i.offsetParent || (b || j(i, a.container, a.threshold)) && (h && i.classList.add(a.class_initial), this._reveal(i), g.push(f), i.dataset.wasProcessed = !0);
      }for (; g.length > 0;) {
        d.splice(g.pop(), 1), c(a.callback_processed, d.length);
      }0 === e && this._stopScrollHandler(), h && (this._isFirstLoop = !1);
    }, _purgeElements: function _purgeElements() {
      var a = this._elements,
          b = a.length,
          c = void 0,
          d = [];for (c = 0; c < b; c++) {
        a[c].dataset.wasProcessed && d.push(c);
      }for (; d.length > 0;) {
        a.splice(d.pop(), 1);
      }
    }, _startScrollHandler: function _startScrollHandler() {
      this._isHandlingScroll || (this._isHandlingScroll = !0, this._settings.container.addEventListener("scroll", this._boundHandleScroll));
    }, _stopScrollHandler: function _stopScrollHandler() {
      this._isHandlingScroll && (this._isHandlingScroll = !1, this._settings.container.removeEventListener("scroll", this._boundHandleScroll));
    }, handleScroll: function handleScroll() {
      var a = this,
          b = this._settings.throttle;0 !== b ? function () {
        var c = function c() {
          new Date().getTime();
        },
            d = c(),
            e = b - (d - a._previousLoopTime);e <= 0 || e > b ? (a._loopTimeout && (clearTimeout(a._loopTimeout), a._loopTimeout = null), a._previousLoopTime = d, a._loopThroughElements()) : a._loopTimeout || (a._loopTimeout = setTimeout(function () {
          this._previousLoopTime = c(), this._loopTimeout = null, this._loopThroughElements();
        }.bind(a), e));
      }() : this._loopThroughElements();
    }, update: function update() {
      this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector)), this._purgeElements(), this._loopThroughElements(), this._startScrollHandler();
    }, destroy: function destroy() {
      window.removeEventListener("resize", this._boundHandleScroll), this._loopTimeout && (clearTimeout(this._loopTimeout), this._loopTimeout = null), this._stopScrollHandler(), this._elements = null, this._queryOriginNode = null, this._settings = null;
    } };var o = window.lazyLoadOptions;return o && function (a, b) {
    var c = b.length;if (c) for (var d = 0; d < c; d++) {
      k(a, b[d]);
    } else k(a, b);
  }(n, o), n;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi50YWJzLmpzIiwibGF6eWxvYWQudHJhbnNwaWxlZC5taW4uanMiLCJmbGlja2l0eS5wa2dkLm1pbi5qcyIsImZsaWNraXR5YmctbGF6eWxvYWQuanMiLCJqcXVlcnktYXV0b2NvbXBsZXRlLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJGT1VOREFUSU9OX1ZFUlNJT04iLCJGb3VuZGF0aW9uIiwidmVyc2lvbiIsIl9wbHVnaW5zIiwiX3V1aWRzIiwicnRsIiwiYXR0ciIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwicHVzaCIsInVucmVnaXN0ZXJQbHVnaW4iLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlQXR0ciIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJlYWNoIiwiX2luaXQiLCJ0eXBlIiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJmb3VuZGF0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxlbmd0aCIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJyZWZsb3ciLCJlbGVtIiwiaSIsIiRlbGVtIiwiZmluZCIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJlIiwib3B0IiwibWFwIiwiZWwiLCJ0cmltIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZW5kIiwidCIsInN0eWxlIiwic2V0VGltZW91dCIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImFwcGVuZFRvIiwiaGVhZCIsInJlbW92ZUNsYXNzIiwiTWVkaWFRdWVyeSIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwid2luZG93IiwiZm4iLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwialF1ZXJ5IiwiQm94IiwiSW1Ob3RUb3VjaGluZ1lvdSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwiZWxlbWVudCIsInBhcmVudCIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJwYXJEaW1zIiwib2Zmc2V0IiwiaGVpZ2h0Iiwid2lkdGgiLCJ3aW5kb3dEaW1zIiwiYWxsRGlycyIsIkVycm9yIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhclJlY3QiLCJwYXJlbnROb2RlIiwid2luUmVjdCIsImJvZHkiLCJ3aW5ZIiwicGFnZVlPZmZzZXQiLCJ3aW5YIiwicGFnZVhPZmZzZXQiLCJwYXJlbnREaW1zIiwiYW5jaG9yIiwicG9zaXRpb24iLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImV2ZW50Iiwia2V5Iiwid2hpY2giLCJrZXlDb2RlIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwiZXh0ZW5kIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsImZpbHRlciIsImlzIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwidHJhcEZvY3VzIiwiJGZvY3VzYWJsZSIsIiRmaXJzdEZvY3VzYWJsZSIsImVxIiwiJGxhc3RGb2N1c2FibGUiLCJvbiIsInRhcmdldCIsInByZXZlbnREZWZhdWx0IiwiZm9jdXMiLCJyZWxlYXNlRm9jdXMiLCJvZmYiLCJrY3MiLCJrIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwiY3NzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZSIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwiYXRMZWFzdCIsInNpemUiLCJxdWVyeSIsImdldCIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwibWF0Y2hlZCIsIm5ld1NpemUiLCJjdXJyZW50U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaW5mbyIsImlkIiwiaW5zZXJ0QmVmb3JlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJzdHlsZU9iamVjdCIsInJlZHVjZSIsInJldCIsInBhcmFtIiwicGFydHMiLCJ2YWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJpc0FycmF5IiwiaW5pdENsYXNzZXMiLCJhY3RpdmVDbGFzc2VzIiwiTW90aW9uIiwiYW5pbWF0ZUluIiwiYW5pbWF0aW9uIiwiY2IiLCJhbmltYXRlIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJkdXJhdGlvbiIsImFuaW0iLCJwcm9nIiwibW92ZSIsInRzIiwiaXNJbiIsImluaXRDbGFzcyIsImFjdGl2ZUNsYXNzIiwicmVzZXQiLCJhZGRDbGFzcyIsInNob3ciLCJvZmZzZXRXaWR0aCIsIm9uZSIsImZpbmlzaCIsImhpZGUiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJOZXN0IiwiRmVhdGhlciIsIm1lbnUiLCJpdGVtcyIsInN1Yk1lbnVDbGFzcyIsInN1Ykl0ZW1DbGFzcyIsImhhc1N1YkNsYXNzIiwiJGl0ZW0iLCIkc3ViIiwiY2hpbGRyZW4iLCJCdXJuIiwiVGltZXIiLCJvcHRpb25zIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0IiwiaW5maW5pdGUiLCJwYXVzZSIsIm9uSW1hZ2VzTG9hZGVkIiwiaW1hZ2VzIiwidW5sb2FkZWQiLCJjb21wbGV0ZSIsInJlYWR5U3RhdGUiLCJzaW5nbGVJbWFnZUxvYWRlZCIsInNyYyIsInNwb3RTd2lwZSIsImVuYWJsZWQiLCJkb2N1bWVudEVsZW1lbnQiLCJtb3ZlVGhyZXNob2xkIiwidGltZVRocmVzaG9sZCIsInN0YXJ0UG9zWCIsInN0YXJ0UG9zWSIsInN0YXJ0VGltZSIsImVsYXBzZWRUaW1lIiwiaXNNb3ZpbmciLCJvblRvdWNoRW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uVG91Y2hNb3ZlIiwieCIsInRvdWNoZXMiLCJwYWdlWCIsInkiLCJwYWdlWSIsImR4IiwiZHkiLCJkaXIiLCJhYnMiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdCIsInRlYXJkb3duIiwic3BlY2lhbCIsInN3aXBlIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZmlyc3QiLCJldmVudFR5cGVzIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwic2ltdWxhdGVkRXZlbnQiLCJNb3VzZUV2ZW50Iiwic2NyZWVuWCIsInNjcmVlblkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNyZWF0ZUV2ZW50IiwiaW5pdE1vdXNlRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiTXV0YXRpb25PYnNlcnZlciIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJzdG9wUHJvcGFnYXRpb24iLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImF0dHJpYnV0ZU5hbWUiLCJjbG9zZXN0IiwiZWxlbWVudE9ic2VydmVyIiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJjaGlsZExpc3QiLCJjaGFyYWN0ZXJEYXRhIiwic3VidHJlZSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiQWNjb3JkaW9uIiwiZGVmYXVsdHMiLCIkdGFicyIsImlkeCIsIiRjb250ZW50IiwibGlua0lkIiwiJGluaXRBY3RpdmUiLCJmaXJzdFRpbWVJbml0IiwiZG93biIsIl9jaGVja0RlZXBMaW5rIiwibG9jYXRpb24iLCJoYXNoIiwiJGxpbmsiLCIkYW5jaG9yIiwiaGFzQ2xhc3MiLCJkZWVwTGlua1NtdWRnZSIsImxvYWQiLCJzY3JvbGxUb3AiLCJkZWVwTGlua1NtdWRnZURlbGF5IiwiZGVlcExpbmsiLCJfZXZlbnRzIiwiJHRhYkNvbnRlbnQiLCJ0b2dnbGUiLCJuZXh0IiwiJGEiLCJtdWx0aUV4cGFuZCIsInByZXZpb3VzIiwicHJldiIsInVwIiwidXBkYXRlSGlzdG9yeSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJmaXJzdFRpbWUiLCIkY3VycmVudEFjdGl2ZSIsInNsaWRlRG93biIsInNsaWRlU3BlZWQiLCIkYXVudHMiLCJzaWJsaW5ncyIsImFsbG93QWxsQ2xvc2VkIiwic2xpZGVVcCIsInN0b3AiLCJJbnRlcmNoYW5nZSIsInJ1bGVzIiwiY3VycmVudFBhdGgiLCJfYWRkQnJlYWtwb2ludHMiLCJfZ2VuZXJhdGVSdWxlcyIsIl9yZWZsb3ciLCJtYXRjaCIsInJ1bGUiLCJwYXRoIiwiU1BFQ0lBTF9RVUVSSUVTIiwicnVsZXNMaXN0Iiwibm9kZU5hbWUiLCJyZXNwb25zZSIsImh0bWwiLCJPZmZDYW52YXMiLCIkbGFzdFRyaWdnZXIiLCIkdHJpZ2dlcnMiLCJ0cmFuc2l0aW9uIiwiY29udGVudE92ZXJsYXkiLCJvdmVybGF5Iiwib3ZlcmxheVBvc2l0aW9uIiwic2V0QXR0cmlidXRlIiwiJG92ZXJsYXkiLCJhcHBlbmQiLCJpc1JldmVhbGVkIiwiUmVnRXhwIiwicmV2ZWFsQ2xhc3MiLCJyZXZlYWxPbiIsIl9zZXRNUUNoZWNrZXIiLCJ0cmFuc2l0aW9uVGltZSIsIm9wZW4iLCJjbG9zZSIsIl9oYW5kbGVLZXlib2FyZCIsImNsb3NlT25DbGljayIsInJldmVhbCIsIiRjbG9zZXIiLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJhbGxvd1VwIiwiYWxsb3dEb3duIiwibGFzdFkiLCJvcmlnaW5hbEV2ZW50IiwiZm9yY2VUbyIsInNjcm9sbFRvIiwiY29udGVudFNjcm9sbCIsIl9zdG9wU2Nyb2xsaW5nIiwiX3JlY29yZFNjcm9sbGFibGUiLCJfc3RvcFNjcm9sbFByb3BhZ2F0aW9uIiwiYXV0b0ZvY3VzIiwiY2FudmFzRm9jdXMiLCJUYWJzIiwiJHRhYlRpdGxlcyIsImxpbmtDbGFzcyIsImlzQWN0aXZlIiwibGlua0FjdGl2ZUNsYXNzIiwibWF0Y2hIZWlnaHQiLCIkaW1hZ2VzIiwiX3NldEhlaWdodCIsInNlbGVjdFRhYiIsIl9hZGRLZXlIYW5kbGVyIiwiX2FkZENsaWNrSGFuZGxlciIsIl9zZXRIZWlnaHRNcUhhbmRsZXIiLCJfaGFuZGxlVGFiQ2hhbmdlIiwiJGVsZW1lbnRzIiwiJHByZXZFbGVtZW50IiwiJG5leHRFbGVtZW50Iiwid3JhcE9uS2V5cyIsImxhc3QiLCJtaW4iLCJoaXN0b3J5SGFuZGxlZCIsImFjdGl2ZUNvbGxhcHNlIiwiX2NvbGxhcHNlVGFiIiwiJG9sZFRhYiIsIiR0YWJMaW5rIiwiJHRhcmdldENvbnRlbnQiLCJfb3BlblRhYiIsInBhbmVsQWN0aXZlQ2xhc3MiLCIkdGFyZ2V0X2FuY2hvciIsImlkU3RyIiwicGFuZWxDbGFzcyIsInBhbmVsIiwidGVtcCIsIl9leHRlbmRzIiwiYXNzaWduIiwiYSIsImIiLCJjIiwiZCIsIl90eXBlb2YiLCJTeW1ib2wiLCJpdGVyYXRvciIsImV4cG9ydHMiLCJtb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJMYXp5TG9hZCIsImVsZW1lbnRzX3NlbGVjdG9yIiwiY29udGFpbmVyIiwidGhyZXNob2xkIiwiZGF0YV9zcmMiLCJkYXRhX3NyY3NldCIsImNsYXNzX2xvYWRpbmciLCJjbGFzc19sb2FkZWQiLCJjbGFzc19lcnJvciIsImNsYXNzX2luaXRpYWwiLCJza2lwX2ludmlzaWJsZSIsImNhbGxiYWNrX2xvYWQiLCJjYWxsYmFja19lcnJvciIsImNhbGxiYWNrX3NldCIsImNhbGxiYWNrX3Byb2Nlc3NlZCIsIm93bmVyRG9jdW1lbnQiLCJjbGllbnRUb3AiLCJpbm5lckhlaWdodCIsIm9mZnNldEhlaWdodCIsImYiLCJjbGllbnRMZWZ0IiwiZyIsImlubmVyV2lkdGgiLCJoIiwiaiIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiaW5zdGFuY2UiLCJsIiwicGFyZW50RWxlbWVudCIsInRhZ05hbWUiLCJkYXRhc2V0IiwibSIsImJhY2tncm91bmRJbWFnZSIsIm4iLCJfc2V0dGluZ3MiLCJfcXVlcnlPcmlnaW5Ob2RlIiwiX3ByZXZpb3VzTG9vcFRpbWUiLCJfbG9vcFRpbWVvdXQiLCJfYm91bmRIYW5kbGVTY3JvbGwiLCJoYW5kbGVTY3JvbGwiLCJfaXNGaXJzdExvb3AiLCJ1cGRhdGUiLCJfcmV2ZWFsIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWRkIiwiX2xvb3BUaHJvdWdoRWxlbWVudHMiLCJfZWxlbWVudHMiLCJvZmZzZXRQYXJlbnQiLCJ3YXNQcm9jZXNzZWQiLCJwb3AiLCJfc3RvcFNjcm9sbEhhbmRsZXIiLCJfcHVyZ2VFbGVtZW50cyIsIl9zdGFydFNjcm9sbEhhbmRsZXIiLCJfaXNIYW5kbGluZ1Njcm9sbCIsImRlc3Ryb3kiLCJvIiwibGF6eUxvYWRPcHRpb25zIiwicmVxdWlyZSIsImpRdWVyeUJyaWRnZXQiLCJzIiwiciIsImNoYXJBdCIsIm9wdGlvbiIsImlzUGxhaW5PYmplY3QiLCJicmlkZ2V0IiwiRXZFbWl0dGVyIiwib25jZSIsIl9vbmNlRXZlbnRzIiwiZW1pdEV2ZW50IiwiZ2V0U2l6ZSIsIm91dGVyV2lkdGgiLCJvdXRlckhlaWdodCIsInBhZGRpbmciLCJib3JkZXJTdHlsZSIsImJvcmRlcldpZHRoIiwiYm94U2l6aW5nIiwiYXBwZW5kQ2hpbGQiLCJpc0JveFNpemVPdXRlciIsInJlbW92ZUNoaWxkIiwicXVlcnlTZWxlY3RvciIsIm5vZGVUeXBlIiwiZGlzcGxheSIsImlzQm9yZGVyQm94IiwidSIsInYiLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCIsInBhZGRpbmdUb3AiLCJwYWRkaW5nQm90dG9tIiwibWFyZ2luTGVmdCIsIm1hcmdpblJpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiUyIsImJvcmRlckxlZnRXaWR0aCIsImJvcmRlclJpZ2h0V2lkdGgiLCJFIiwiYm9yZGVyVG9wV2lkdGgiLCJib3JkZXJCb3R0b21XaWR0aCIsIkMiLCJtYXRjaGVzU2VsZWN0b3IiLCJFbGVtZW50IiwiZml6enlVSVV0aWxzIiwibW9kdWxvIiwibWFrZUFycmF5IiwicmVtb3ZlRnJvbSIsImdldFBhcmVudCIsImdldFF1ZXJ5RWxlbWVudCIsImhhbmRsZUV2ZW50IiwiZmlsdGVyRmluZEVsZW1lbnRzIiwiSFRNTEVsZW1lbnQiLCJkZWJvdW5jZU1ldGhvZCIsImRvY1JlYWR5IiwidG9EYXNoZWQiLCJodG1sSW5pdCIsImdldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsIkZsaWNraXR5IiwiQ2VsbCIsImNyZWF0ZSIsInNoaWZ0Iiwib3JpZ2luU2lkZSIsInNldFBvc2l0aW9uIiwidXBkYXRlVGFyZ2V0IiwicmVuZGVyUG9zaXRpb24iLCJzZXREZWZhdWx0VGFyZ2V0IiwiY2VsbEFsaWduIiwiZ2V0UG9zaXRpb25WYWx1ZSIsIndyYXBTaGlmdCIsInNsaWRlYWJsZVdpZHRoIiwiU2xpZGUiLCJpc09yaWdpbkxlZnQiLCJjZWxscyIsImFkZENlbGwiLCJmaXJzdE1hcmdpbiIsImdldExhc3RDZWxsIiwic2VsZWN0IiwiY2hhbmdlU2VsZWN0ZWRDbGFzcyIsInVuc2VsZWN0IiwiZ2V0Q2VsbEVsZW1lbnRzIiwiYW5pbWF0ZVByb3RvdHlwZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0YXJ0QW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJyZXN0aW5nRnJhbWVzIiwiYXBwbHlEcmFnRm9yY2UiLCJhcHBseVNlbGVjdGVkQXR0cmFjdGlvbiIsImludGVncmF0ZVBoeXNpY3MiLCJwb3NpdGlvblNsaWRlciIsInNldHRsZSIsInRyYW5zZm9ybSIsIndyYXBBcm91bmQiLCJzaGlmdFdyYXBDZWxscyIsImN1cnNvclBvc2l0aW9uIiwicmlnaHRUb0xlZnQiLCJzbGlkZXIiLCJzbGlkZXMiLCJzbGlkZXNXaWR0aCIsInBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCIsInNlbGVjdGVkU2xpZGUiLCJwZXJjZW50UG9zaXRpb24iLCJpc1BvaW50ZXJEb3duIiwiaXNGcmVlU2Nyb2xsaW5nIiwiX3NoaWZ0Q2VsbHMiLCJiZWZvcmVTaGlmdENlbGxzIiwiYWZ0ZXJTaGlmdENlbGxzIiwiX3Vuc2hpZnRDZWxscyIsInZlbG9jaXR5IiwiZ2V0RnJpY3Rpb25GYWN0b3IiLCJhcHBseUZvcmNlIiwiZ2V0UmVzdGluZ1Bvc2l0aW9uIiwiZHJhZ1giLCJzZWxlY3RlZEF0dHJhY3Rpb24iLCJmbGlja2l0eUdVSUQiLCJfY3JlYXRlIiwiYWNjZXNzaWJpbGl0eSIsImZyZWVTY3JvbGxGcmljdGlvbiIsImZyaWN0aW9uIiwibmFtZXNwYWNlSlF1ZXJ5RXZlbnRzIiwicmVzaXplIiwic2V0R2FsbGVyeVNpemUiLCJjcmVhdGVNZXRob2RzIiwiZ3VpZCIsInNlbGVjdGVkSW5kZXgiLCJ2aWV3cG9ydCIsIl9jcmVhdGVTbGlkZXIiLCJ3YXRjaENTUyIsImFjdGl2YXRlIiwiX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMiLCJyZWxvYWRDZWxscyIsInRhYkluZGV4IiwiaW5pdGlhbEluZGV4IiwiaXNJbml0QWN0aXZhdGVkIiwiY2VsbFNlbGVjdG9yIiwiX21ha2VDZWxscyIsInBvc2l0aW9uQ2VsbHMiLCJfZ2V0V3JhcFNoaWZ0Q2VsbHMiLCJnZXRMYXN0U2xpZGUiLCJfc2l6ZUNlbGxzIiwiX3Bvc2l0aW9uQ2VsbHMiLCJtYXhDZWxsSGVpZ2h0IiwidXBkYXRlU2xpZGVzIiwiX2NvbnRhaW5TbGlkZXMiLCJfZ2V0Q2FuQ2VsbEZpdCIsInVwZGF0ZVNlbGVjdGVkU2xpZGUiLCJncm91cENlbGxzIiwicGFyc2VJbnQiLCJyZXBvc2l0aW9uIiwic2V0Q2VsbEFsaWduIiwiY2VudGVyIiwiYWRhcHRpdmVIZWlnaHQiLCJfZ2V0R2FwQ2VsbHMiLCJjb250YWluIiwiRXZlbnQiLCJfd3JhcFNlbGVjdCIsImlzRHJhZ1NlbGVjdCIsInVuc2VsZWN0U2VsZWN0ZWRTbGlkZSIsInNlbGVjdGVkQ2VsbHMiLCJzZWxlY3RlZEVsZW1lbnRzIiwic2VsZWN0ZWRDZWxsIiwic2VsZWN0ZWRFbGVtZW50Iiwic2VsZWN0Q2VsbCIsImdldENlbGwiLCJnZXRDZWxscyIsImdldFBhcmVudENlbGwiLCJnZXRBZGphY2VudENlbGxFbGVtZW50cyIsInVpQ2hhbmdlIiwiY2hpbGRVSVBvaW50ZXJEb3duIiwib25yZXNpemUiLCJjb250ZW50IiwiZGVhY3RpdmF0ZSIsIm9ua2V5ZG93biIsImFjdGl2ZUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJVbmlwb2ludGVyIiwiYmluZFN0YXJ0RXZlbnQiLCJfYmluZFN0YXJ0RXZlbnQiLCJ1bmJpbmRTdGFydEV2ZW50IiwicG9pbnRlckVuYWJsZWQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0VG91Y2giLCJpZGVudGlmaWVyIiwicG9pbnRlcklkZW50aWZpZXIiLCJvbm1vdXNlZG93biIsImJ1dHRvbiIsIl9wb2ludGVyRG93biIsIm9udG91Y2hzdGFydCIsIm9uTVNQb2ludGVyRG93biIsIm9ucG9pbnRlcmRvd24iLCJwb2ludGVySWQiLCJwb2ludGVyRG93biIsIl9iaW5kUG9zdFN0YXJ0RXZlbnRzIiwibW91c2Vkb3duIiwicG9pbnRlcmRvd24iLCJNU1BvaW50ZXJEb3duIiwiX2JvdW5kUG9pbnRlckV2ZW50cyIsIl91bmJpbmRQb3N0U3RhcnRFdmVudHMiLCJvbm1vdXNlbW92ZSIsIl9wb2ludGVyTW92ZSIsIm9uTVNQb2ludGVyTW92ZSIsIm9ucG9pbnRlcm1vdmUiLCJvbnRvdWNobW92ZSIsInBvaW50ZXJNb3ZlIiwib25tb3VzZXVwIiwiX3BvaW50ZXJVcCIsIm9uTVNQb2ludGVyVXAiLCJvbnBvaW50ZXJ1cCIsIm9udG91Y2hlbmQiLCJfcG9pbnRlckRvbmUiLCJwb2ludGVyVXAiLCJwb2ludGVyRG9uZSIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib25wb2ludGVyY2FuY2VsIiwiX3BvaW50ZXJDYW5jZWwiLCJvbnRvdWNoY2FuY2VsIiwicG9pbnRlckNhbmNlbCIsImdldFBvaW50ZXJQb2ludCIsIlVuaWRyYWdnZXIiLCJiaW5kSGFuZGxlcyIsIl9iaW5kSGFuZGxlcyIsInVuYmluZEhhbmRsZXMiLCJ0b3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJoYW5kbGVzIiwiX2RyYWdQb2ludGVyRG93biIsImJsdXIiLCJwb2ludGVyRG93blBvaW50IiwiY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duIiwiX2RyYWdQb2ludGVyTW92ZSIsIl9kcmFnTW92ZSIsImlzRHJhZ2dpbmciLCJoYXNEcmFnU3RhcnRlZCIsIl9kcmFnU3RhcnQiLCJfZHJhZ1BvaW50ZXJVcCIsIl9kcmFnRW5kIiwiX3N0YXRpY0NsaWNrIiwiZHJhZ1N0YXJ0UG9pbnQiLCJpc1ByZXZlbnRpbmdDbGlja3MiLCJkcmFnU3RhcnQiLCJkcmFnTW92ZSIsImRyYWdFbmQiLCJvbmNsaWNrIiwiaXNJZ25vcmluZ01vdXNlVXAiLCJzdGF0aWNDbGljayIsImRyYWdnYWJsZSIsImRyYWdUaHJlc2hvbGQiLCJfY3JlYXRlRHJhZyIsImJpbmREcmFnIiwiX3VpQ2hhbmdlRHJhZyIsIl9jaGlsZFVJUG9pbnRlckRvd25EcmFnIiwidW5iaW5kRHJhZyIsImlzRHJhZ0JvdW5kIiwicG9pbnRlckRvd25Gb2N1cyIsIlRFWFRBUkVBIiwiSU5QVVQiLCJPUFRJT04iLCJyYWRpbyIsImNoZWNrYm94Iiwic3VibWl0IiwiaW1hZ2UiLCJmaWxlIiwicG9pbnRlckRvd25TY3JvbGwiLCJTRUxFQ1QiLCJpc1RvdWNoU2Nyb2xsaW5nIiwiZHJhZ1N0YXJ0UG9zaXRpb24iLCJwcmV2aW91c0RyYWdYIiwiZHJhZ01vdmVUaW1lIiwiZnJlZVNjcm9sbCIsImRyYWdFbmRSZXN0aW5nU2VsZWN0IiwiZHJhZ0VuZEJvb3N0U2VsZWN0IiwiZ2V0U2xpZGVEaXN0YW5jZSIsIl9nZXRDbG9zZXN0UmVzdGluZyIsImRpc3RhbmNlIiwiaW5kZXgiLCJmbG9vciIsIm9uc2Nyb2xsIiwiVGFwTGlzdGVuZXIiLCJiaW5kVGFwIiwidW5iaW5kVGFwIiwidGFwRWxlbWVudCIsImRpcmVjdGlvbiIsIngwIiwieDEiLCJ5MSIsIngyIiwieTIiLCJ4MyIsImlzRW5hYmxlZCIsImlzUHJldmlvdXMiLCJpc0xlZnQiLCJkaXNhYmxlIiwiY3JlYXRlU1ZHIiwib25UYXAiLCJjcmVhdGVFbGVtZW50TlMiLCJhcnJvd1NoYXBlIiwiZW5hYmxlIiwiZGlzYWJsZWQiLCJwcmV2TmV4dEJ1dHRvbnMiLCJfY3JlYXRlUHJldk5leHRCdXR0b25zIiwicHJldkJ1dHRvbiIsIm5leHRCdXR0b24iLCJhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsImRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJQcmV2TmV4dEJ1dHRvbiIsImhvbGRlciIsImRvdHMiLCJzZXREb3RzIiwiYWRkRG90cyIsInJlbW92ZURvdHMiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwidXBkYXRlU2VsZWN0ZWQiLCJzZWxlY3RlZERvdCIsIlBhZ2VEb3RzIiwicGFnZURvdHMiLCJfY3JlYXRlUGFnZURvdHMiLCJhY3RpdmF0ZVBhZ2VEb3RzIiwidXBkYXRlU2VsZWN0ZWRQYWdlRG90cyIsInVwZGF0ZVBhZ2VEb3RzIiwiZGVhY3RpdmF0ZVBhZ2VEb3RzIiwic3RhdGUiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwib25WaXNpYmlsaXR5UGxheSIsInZpc2liaWxpdHlQbGF5IiwicGxheSIsInRpY2siLCJhdXRvUGxheSIsImNsZWFyIiwidGltZW91dCIsInVucGF1c2UiLCJwYXVzZUF1dG9QbGF5T25Ib3ZlciIsIl9jcmVhdGVQbGF5ZXIiLCJwbGF5ZXIiLCJhY3RpdmF0ZVBsYXllciIsInN0b3BQbGF5ZXIiLCJkZWFjdGl2YXRlUGxheWVyIiwicGxheVBsYXllciIsInBhdXNlUGxheWVyIiwidW5wYXVzZVBsYXllciIsIm9ubW91c2VlbnRlciIsIm9ubW91c2VsZWF2ZSIsIlBsYXllciIsImluc2VydCIsIl9jZWxsQWRkZWRSZW1vdmVkIiwicHJlcGVuZCIsImNlbGxDaGFuZ2UiLCJjZWxsU2l6ZUNoYW5nZSIsImltZyIsImZsaWNraXR5IiwiX2NyZWF0ZUxhenlsb2FkIiwibGF6eUxvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwiTGF6eUxvYWRlciIsIl9jcmVhdGVBc05hdkZvciIsImFjdGl2YXRlQXNOYXZGb3IiLCJkZWFjdGl2YXRlQXNOYXZGb3IiLCJkZXN0cm95QXNOYXZGb3IiLCJhc05hdkZvciIsInNldE5hdkNvbXBhbmlvbiIsIm5hdkNvbXBhbmlvbiIsIm9uTmF2Q29tcGFuaW9uU2VsZWN0IiwibmF2Q29tcGFuaW9uU2VsZWN0Iiwib25OYXZTdGF0aWNDbGljayIsInJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMiLCJuYXZTZWxlY3RlZEVsZW1lbnRzIiwiY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyIsImltYWdlc0xvYWRlZCIsImVsZW1lbnRzIiwiZ2V0SW1hZ2VzIiwianFEZWZlcnJlZCIsIkRlZmVycmVkIiwiY2hlY2siLCJ1cmwiLCJJbWFnZSIsImFkZEVsZW1lbnRJbWFnZXMiLCJhZGRJbWFnZSIsImJhY2tncm91bmQiLCJhZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyIsImFkZEJhY2tncm91bmQiLCJwcm9ncmVzcyIsInByb2dyZXNzZWRDb3VudCIsImhhc0FueUJyb2tlbiIsImlzTG9hZGVkIiwibm90aWZ5IiwiZGVidWciLCJsb2ciLCJpc0NvbXBsZXRlIiwiZ2V0SXNJbWFnZUNvbXBsZXRlIiwiY29uZmlybSIsIm5hdHVyYWxXaWR0aCIsInByb3h5SW1hZ2UiLCJ1bmJpbmRFdmVudHMiLCJtYWtlSlF1ZXJ5UGx1Z2luIiwicHJvbWlzZSIsIl9jcmVhdGVJbWFnZXNMb2FkZWQiLCJmYWN0b3J5IiwidXRpbHMiLCJwcm90byIsIl9jcmVhdGVCZ0xhenlMb2FkIiwiYmdMYXp5TG9hZCIsImFkakNvdW50IiwiY2VsbEVsZW1zIiwiY2VsbEVsZW0iLCJiZ0xhenlMb2FkRWxlbSIsIkJnTGF6eUxvYWRlciIsImVzY2FwZVJlZ0V4Q2hhcnMiLCJjcmVhdGVOb2RlIiwiY29udGFpbmVyQ2xhc3MiLCJkaXYiLCJFU0MiLCJUQUIiLCJSRVRVUk4iLCJMRUZUIiwiVVAiLCJSSUdIVCIsIkRPV04iLCJBdXRvY29tcGxldGUiLCJ0aGF0IiwiYWpheFNldHRpbmdzIiwiYXV0b1NlbGVjdEZpcnN0Iiwic2VydmljZVVybCIsImxvb2t1cCIsIm9uU2VsZWN0IiwibWluQ2hhcnMiLCJtYXhIZWlnaHQiLCJkZWZlclJlcXVlc3RCeSIsInBhcmFtcyIsImZvcm1hdFJlc3VsdCIsImRlbGltaXRlciIsInpJbmRleCIsIm5vQ2FjaGUiLCJvblNlYXJjaFN0YXJ0Iiwib25TZWFyY2hDb21wbGV0ZSIsIm9uU2VhcmNoRXJyb3IiLCJwcmVzZXJ2ZUlucHV0IiwidGFiRGlzYWJsZWQiLCJkYXRhVHlwZSIsImN1cnJlbnRSZXF1ZXN0IiwidHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCIsInByZXZlbnRCYWRRdWVyaWVzIiwibG9va3VwRmlsdGVyIiwic3VnZ2VzdGlvbiIsIm9yaWdpbmFsUXVlcnkiLCJxdWVyeUxvd2VyQ2FzZSIsInBhcmFtTmFtZSIsInRyYW5zZm9ybVJlc3VsdCIsInBhcnNlSlNPTiIsInNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UiLCJub1N1Z2dlc3Rpb25Ob3RpY2UiLCJvcmllbnRhdGlvbiIsImZvcmNlRml4UG9zaXRpb24iLCJzdWdnZXN0aW9ucyIsImJhZFF1ZXJpZXMiLCJjdXJyZW50VmFsdWUiLCJpbnRlcnZhbElkIiwiY2FjaGVkUmVzcG9uc2UiLCJvbkNoYW5nZUludGVydmFsIiwib25DaGFuZ2UiLCJpc0xvY2FsIiwic3VnZ2VzdGlvbnNDb250YWluZXIiLCJub1N1Z2dlc3Rpb25zQ29udGFpbmVyIiwiY2xhc3NlcyIsInNlbGVjdGVkIiwiaGludCIsImhpbnRWYWx1ZSIsInNlbGVjdGlvbiIsImluaXRpYWxpemUiLCJzZXRPcHRpb25zIiwicGF0dGVybiIsImtpbGxlckZuIiwic3VnZ2VzdGlvblNlbGVjdG9yIiwia2lsbFN1Z2dlc3Rpb25zIiwiZGlzYWJsZUtpbGxlckZuIiwiZml4UG9zaXRpb25DYXB0dXJlIiwidmlzaWJsZSIsImZpeFBvc2l0aW9uIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkJsdXIiLCJvbkZvY3VzIiwib25WYWx1ZUNoYW5nZSIsImVuYWJsZUtpbGxlckZuIiwiYWJvcnRBamF4IiwiYWJvcnQiLCJzdXBwbGllZE9wdGlvbnMiLCJ2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdCIsInZhbGlkYXRlT3JpZW50YXRpb24iLCJjbGVhckNhY2hlIiwiY2xlYXJJbnRlcnZhbCIsIiRjb250YWluZXIiLCJjb250YWluZXJQYXJlbnQiLCJzaXRlU2VhcmNoRGl2IiwiY29udGFpbmVySGVpZ2h0Iiwic3R5bGVzIiwidmlld1BvcnRIZWlnaHQiLCJ0b3BPdmVyZmxvdyIsImJvdHRvbU92ZXJmbG93Iiwib3BhY2l0eSIsInBhcmVudE9mZnNldERpZmYiLCJzdG9wS2lsbFN1Z2dlc3Rpb25zIiwic2V0SW50ZXJ2YWwiLCJpc0N1cnNvckF0RW5kIiwidmFsTGVuZ3RoIiwic2VsZWN0aW9uU3RhcnQiLCJyYW5nZSIsImNyZWF0ZVJhbmdlIiwibW92ZVN0YXJ0Iiwic3VnZ2VzdCIsIm9uSGludCIsInNlbGVjdEhpbnQiLCJtb3ZlVXAiLCJtb3ZlRG93biIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsImZpbmRCZXN0SGludCIsImdldFF1ZXJ5Iiwib25JbnZhbGlkYXRlU2VsZWN0aW9uIiwiaXNFeGFjdE1hdGNoIiwiZ2V0U3VnZ2VzdGlvbnMiLCJnZXRTdWdnZXN0aW9uc0xvY2FsIiwibGltaXQiLCJsb29rdXBMaW1pdCIsImdyZXAiLCJxIiwiY2FjaGVLZXkiLCJpZ25vcmVQYXJhbXMiLCJpc0Z1bmN0aW9uIiwiaXNCYWRRdWVyeSIsImFqYXgiLCJkb25lIiwicmVzdWx0IiwicHJvY2Vzc1Jlc3BvbnNlIiwiZmFpbCIsImpxWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwib25IaWRlIiwic2lnbmFsSGludCIsIm5vU3VnZ2VzdGlvbnMiLCJncm91cEJ5IiwiY2xhc3NTZWxlY3RlZCIsImJlZm9yZVJlbmRlciIsImNhdGVnb3J5IiwiZm9ybWF0R3JvdXAiLCJjdXJyZW50Q2F0ZWdvcnkiLCJhZGp1c3RDb250YWluZXJXaWR0aCIsImRldGFjaCIsImVtcHR5IiwiYmVzdE1hdGNoIiwiZm91bmRNYXRjaCIsInN1YnN0ciIsImZhbGxiYWNrIiwiaW5BcnJheSIsImFjdGl2ZUl0ZW0iLCJhZGp1c3RTY3JvbGwiLCJvZmZzZXRUb3AiLCJ1cHBlckJvdW5kIiwibG93ZXJCb3VuZCIsImhlaWdodERlbHRhIiwiZ2V0VmFsdWUiLCJvblNlbGVjdENhbGxiYWNrIiwiZGlzcG9zZSIsImF1dG9jb21wbGV0ZSIsImRldmJyaWRnZUF1dG9jb21wbGV0ZSIsImRhdGFLZXkiLCJpbnB1dEVsZW1lbnQiLCJiYXNlcyIsImJhc2VIcmVmIiwiaHJlZiIsIm15TGF6eUxvYWQiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDNUMsS0FBSXk3QixPQUFPMy9CLEVBQUUsSUFBRixDQUFYO0FBQ0EsS0FBSTZwQyxRQUFRbEssS0FBS3QrQixJQUFMLENBQVUsT0FBVixDQUFaO0FBQ0EsS0FBSXdJLFFBQVE3SixFQUFFLEtBQUYsRUFBUzIvQixJQUFULEVBQWU5MUIsS0FBZixFQUFaO0FBQ0EsS0FBSUQsU0FBUzVKLEVBQUUsS0FBRixFQUFTMi9CLElBQVQsRUFBZS8xQixNQUFmLEVBQWI7QUFDQSsxQixNQUFLejJCLE1BQUwsR0FBYzhJLFFBQWQsQ0FBdUIsSUFBdkI7QUFDQTJ0QixNQUFLejJCLE1BQUwsR0FBYyt4QixPQUFkLENBQXNCLGtGQUFrRjRPLEtBQWxGLEdBQTBGLDRCQUExRixHQUF5SGhnQyxLQUF6SCxHQUFpSSxZQUFqSSxHQUFnSkQsTUFBaEosR0FBeUosNEZBQS9LO0FBQ0ErMUIsTUFBS3R0QixJQUFMO0FBQ0FuTyxHQUFFdUosY0FBRjtBQUNBLENBVEQ7O0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQS9UQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NC4wLjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBWYXJpYWJsZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IG51bGw7XG5cblx0ICAvLyBmb3JtIGlucHV0IHR5cGVzXG5cdCAgdmFyIGZvcm1JbnB1dHMgPSBbXG5cdCAgICAnaW5wdXQnLFxuXHQgICAgJ3NlbGVjdCcsXG5cdCAgICAndGV4dGFyZWEnXG5cdCAgXTtcblxuXHQgIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuXHQgIC8vIGNhbiBiZSBzYWZlbHkgaWdub3JlZCB0byBwcmV2ZW50IGZhbHNlIGtleWJvYXJkIGRldGVjdGlvblxuXHQgIHZhciBpZ25vcmVNYXAgPSBbXG5cdCAgICAxNiwgLy8gc2hpZnRcblx0ICAgIDE3LCAvLyBjb250cm9sXG5cdCAgICAxOCwgLy8gYWx0XG5cdCAgICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgICAgOTMgIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dE1hcCA9IHtcblx0ICAgICdrZXl1cCc6ICdrZXlib2FyZCcsXG5cdCAgICAnbW91c2Vkb3duJzogJ21vdXNlJyxcblx0ICAgICdtb3VzZW1vdmUnOiAnbW91c2UnLFxuXHQgICAgJ01TUG9pbnRlckRvd24nOiAncG9pbnRlcicsXG5cdCAgICAnTVNQb2ludGVyTW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVyZG93bic6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVybW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICd0b3VjaHN0YXJ0JzogJ3RvdWNoJ1xuXHQgIH07XG5cblx0ICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dFR5cGVzID0gW107XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRvdWNoIGJ1ZmZlciB0aW1lciBpcyBydW5uaW5nXG5cdCAgdmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXHQgIH07XG5cblx0ICAvLyB0b3VjaCBidWZmZXIgdGltZXJcblx0ICB2YXIgdG91Y2hUaW1lciA9IG51bGw7XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFNldCB1cFxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBzZXRVcCA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgICBzZXRJbnB1dCgpO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEV2ZW50c1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIHtcblxuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRvdWNoQnVmZmVyKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZUlucHV0KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciB1cGRhdGVJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIGV2ZW50S2V5ID0gZXZlbnQud2hpY2g7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKFxuXHQgICAgICAgIGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUgfHxcblx0ICAgICAgICBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZVxuXHQgICAgICApIHtcblxuXHQgICAgICAgIHZhciBhY3RpdmVFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0ICAgICAgICB2YXIgYWN0aXZlSW5wdXQgPSAoXG5cdCAgICAgICAgICBhY3RpdmVFbGVtICYmXG5cdCAgICAgICAgICBhY3RpdmVFbGVtLm5vZGVOYW1lICYmXG5cdCAgICAgICAgICBmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTFcblx0ICAgICAgICApID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdCAgICAgICAgaWYgKFxuXHQgICAgICAgICAgdmFsdWUgPT09ICd0b3VjaCcgfHxcblxuXHQgICAgICAgICAgLy8gaWdub3JlIG1vdXNlIG1vZGlmaWVyIGtleXNcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ21vdXNlJyAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xKSB8fFxuXG5cdCAgICAgICAgICAvLyBkb24ndCBzd2l0Y2ggaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhIGZvcm0gaW5wdXRcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBhY3RpdmVJbnB1dClcblx0ICAgICAgICApIHtcblxuXHQgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGFuZCBjYXRjaC1hbGwgdmFyaWFibGVcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgc2V0SW5wdXQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgc2V0SW5wdXQgPSBmdW5jdGlvbigpIHtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudElucHV0KTtcblxuXHQgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkge1xuXHQgICAgICBpbnB1dFR5cGVzLnB1c2goY3VycmVudElucHV0KTtcblx0ICAgICAgZG9jRWxlbS5jbGFzc05hbWUgKz0gJyB3aGF0aW5wdXQtdHlwZXMtJyArIGN1cnJlbnRJbnB1dDtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudEludGVudCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gYnVmZmVycyB0b3VjaCBldmVudHMgYmVjYXVzZSB0aGV5IGZyZXF1ZW50bHkgYWxzbyBmaXJlIG1vdXNlIGV2ZW50c1xuXHQgIHZhciB0b3VjaEJ1ZmZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIGNsZWFyIHRoZSB0aW1lciBpZiBpdCBoYXBwZW5zIHRvIGJlIHJ1bm5pbmdcblx0ICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodG91Y2hUaW1lcik7XG5cblx0ICAgIC8vIHNldCB0aGUgY3VycmVudCBpbnB1dFxuXHQgICAgdXBkYXRlSW5wdXQoZXZlbnQpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGlzQnVmZmVyaW5nIHRvIGB0cnVlYFxuXHQgICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xuXG5cdCAgICAvLyBydW4gdGhlIHRpbWVyXG5cdCAgICB0b3VjaFRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cblx0ICAgICAgLy8gaWYgdGhlIHRpbWVyIHJ1bnMgb3V0LCBzZXQgaXNCdWZmZXJpbmcgYmFjayB0byBgZmFsc2VgXG5cdCAgICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cdCAgICB9LCAyMDApO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFV0aWxpdGllc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCAgIGlmICh0eXBlb2YgZXZlbnQucG9pbnRlclR5cGUgPT09ICdudW1iZXInKSB7XG5cdCAgICAgIHJldHVybiBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXTtcblx0ICAgfSBlbHNlIHtcblx0ICAgICAgcmV0dXJuIChldmVudC5wb2ludGVyVHlwZSA9PT0gJ3BlbicpID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlOyAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICB9XG5cdCAgfTtcblxuXHQgIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuXHQgIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbigpIHtcblx0ICAgIHJldHVybiAnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgP1xuXHQgICAgICAnd2hlZWwnIDogLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cblx0ICAgICAgZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgP1xuXHQgICAgICAgICdtb3VzZXdoZWVsJyA6IC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAgICdET01Nb3VzZVNjcm9sbCc7IC8vIGxldCdzIGFzc3VtZSB0aGF0IHJlbWFpbmluZyBicm93c2VycyBhcmUgb2xkZXIgRmlyZWZveFxuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEluaXRcblxuXHQgICAgZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAgIChhbHNvIHBhc3NlcyBpZiBwb2x5ZmlsbHMgYXJlIHVzZWQpXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgaWYgKFxuXHQgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJlxuXHQgICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2Zcblx0ICApIHtcblx0ICAgIHNldFVwKCk7XG5cdCAgfVxuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBBUElcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICByZXR1cm4ge1xuXG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnbG9vc2UnfCdzdHJpY3QnXG5cdCAgICAvLyAnc3RyaWN0JyAoZGVmYXVsdCk6IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGBkYXRhLXdoYXRpbnB1dGAgYXR0cmlidXRlXG5cdCAgICAvLyAnbG9vc2UnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIG1vcmUgY3VycmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24ob3B0KSB7IHJldHVybiAob3B0ID09PSAnbG9vc2UnKSA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7IH0sXG5cblx0ICAgIC8vIHJldHVybnMgYXJyYXk6IGFsbCB0aGUgZGV0ZWN0ZWQgaW5wdXQgdHlwZXNcblx0ICAgIHR5cGVzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGlucHV0VHlwZXM7IH1cblxuXHQgIH07XG5cblx0fSgpKTtcblxuXG4vKioqLyB9XG4vKioqKioqLyBdKVxufSk7XG47IiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7XG4gIGVsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gIHJldHVybiBzdHI7XG59XG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG5mdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5Gb3VuZGF0aW9uLkJveCA9IHtcbiAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0c1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICogQHBhcmFtIHtCb29sZWFufSBsck9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayBsZWZ0IGFuZCByaWdodCB2YWx1ZXMgb25seS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIGNvbGxpc2lvbiBmcmVlLCBmYWxzZSBpZiBhIGNvbGxpc2lvbiBpbiBhbnkgZGlyZWN0aW9uLlxuICovXG5mdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgdmFyIGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoICsgcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgKyBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gZWxlRGltcy53aW5kb3dEaW1zLndpZHRoKTtcbiAgfVxuXG4gIHZhciBhbGxEaXJzID0gW2JvdHRvbSwgdG9wLCBsZWZ0LCByaWdodF07XG5cbiAgaWYgKGxyT25seSkge1xuICAgIHJldHVybiBsZWZ0ID09PSByaWdodCA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0Yk9ubHkpIHtcbiAgICByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7XG4gIH1cblxuICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG59O1xuXG4vKipcbiAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeSB8fCBIVE1MfSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBvciBET00gZWxlbWVudCBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkaW1lbnNpb25zLiBDYW4gYmUgYW55IGVsZW1lbnQgb3RoZXIgdGhhdCBkb2N1bWVudCBvciB3aW5kb3cuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0sIHRlc3Qpe1xuICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcblxuICBpZiAoZWxlbSA9PT0gd2luZG93IHx8IGVsZW0gPT09IGRvY3VtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7XG4gIH1cblxuICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBwYXJSZWN0ID0gZWxlbS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luUmVjdCA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5ZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgICAgd2luWCA9IHdpbmRvdy5wYWdlWE9mZnNldDtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgb2Zmc2V0OiB7XG4gICAgICB0b3A6IHJlY3QudG9wICsgd2luWSxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpblhcbiAgICB9LFxuICAgIHBhcmVudERpbXM6IHtcbiAgICAgIHdpZHRoOiBwYXJSZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHBhclJlY3QudG9wICsgd2luWSxcbiAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxuICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93RGltczoge1xuICAgICAgd2lkdGg6IHdpblJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHdpblJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogd2luWSxcbiAgICAgICAgbGVmdDogd2luWFxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRvcCBhbmQgbGVmdCBpbnRlZ2VyIHBpeGVsIHZhbHVlcyBmb3IgZHluYW1pY2FsbHkgcmVuZGVyZWQgZWxlbWVudHMsXG4gKiBzdWNoIGFzOiBUb29sdGlwLCBSZXZlYWwsIGFuZCBEcm9wZG93blxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICovXG5mdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgdmFyICRlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICRhbmNob3JEaW1zID0gYW5jaG9yID8gR2V0RGltZW5zaW9ucyhhbmNob3IpIDogbnVsbDtcblxuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgdG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogaXNPdmVyZmxvdyA/IGhPZmZzZXQgOiAoKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMikpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHJpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0ICsgMSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCArICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArICgkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gJGVsZURpbXMud2lkdGgpIC8gMixcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgY2FzZSAncmV2ZWFsIGZ1bGwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0IC0gJGVsZURpbXMud2lkdGgsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gIH1cbn1cblxufShqUXVlcnkpO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBrZXlDb2RlcyA9IHtcbiAgOTogJ1RBQicsXG4gIDEzOiAnRU5URVInLFxuICAyNzogJ0VTQ0FQRScsXG4gIDMyOiAnU1BBQ0UnLFxuICAzNzogJ0FSUk9XX0xFRlQnLFxuICAzODogJ0FSUk9XX1VQJyxcbiAgMzk6ICdBUlJPV19SSUdIVCcsXG4gIDQwOiAnQVJST1dfRE9XTidcbn1cblxudmFyIGNvbW1hbmRzID0ge31cblxudmFyIEtleWJvYXJkID0ge1xuICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAqL1xuICBwYXJzZUtleShldmVudCkge1xuICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgLy8gUmVtb3ZlIHVuLXByaW50YWJsZSBjaGFyYWN0ZXJzLCBlLmcuIGZvciBgZnJvbUNoYXJDb2RlYCBjYWxscyBmb3IgQ1RSTCBvbmx5IGV2ZW50c1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXFcrLywgJycpO1xuXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSBgU0hJRlRfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gYENUUkxfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSBgQUxUXyR7a2V5fWA7XG5cbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICAgIGtleSA9IGtleS5yZXBsYWNlKC9fJC8sICcnKTtcblxuICAgIHJldHVybiBrZXk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAqL1xuICBoYW5kbGVLZXkoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgdmFyIGNvbW1hbmRMaXN0ID0gY29tbWFuZHNbY29tcG9uZW50XSxcbiAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgIGNtZHMsXG4gICAgICBjb21tYW5kLFxuICAgICAgZm47XG5cbiAgICBpZiAoIWNvbW1hbmRMaXN0KSByZXR1cm4gY29uc29sZS53YXJuKCdDb21wb25lbnQgbm90IGRlZmluZWQhJyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICB9IGVsc2UgeyAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO1xuXG4gICAgICAgIGVsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgfVxuICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy5oYW5kbGVkKHJldHVyblZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZ1bmN0aW9ucy51bmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy51bmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgKiBAcmV0dXJuIHtqUXVlcnl9ICRmb2N1c2FibGUgLSBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiBgJGVsZW1lbnRgXG4gICAqL1xuICBmaW5kRm9jdXNhYmxlKCRlbGVtZW50KSB7XG4gICAgaWYoISRlbGVtZW50KSB7cmV0dXJuIGZhbHNlOyB9XG4gICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH0gLy9vbmx5IGhhdmUgdmlzaWJsZSBlbGVtZW50cyBhbmQgdGhvc2UgdGhhdCBoYXZlIGEgdGFiaW5kZXggZ3JlYXRlciBvciBlcXVhbCAwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAqL1xuXG4gIHJlZ2lzdGVyKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XG4gIH0sICBcblxuICAvKipcbiAgICogVHJhcHMgdGhlIGZvY3VzIGluIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAqL1xuICB0cmFwRm9jdXMoJGVsZW1lbnQpIHtcbiAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICRmaXJzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoMCksXG4gICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGxhc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdUQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRmaXJzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSAkZmlyc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdTSElGVF9UQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRsYXN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBSZWxlYXNlcyB0aGUgdHJhcHBlZCBmb2N1cyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHJlbGVhc2UgdGhlIGZvY3VzIGZvci5cbiAgICovXG4gIHJlbGVhc2VGb2N1cygkZWxlbWVudCkge1xuICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgfVxufVxuXG4vKlxuICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gKi9cbmZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICB2YXIgayA9IHt9O1xuICBmb3IgKHZhciBrYyBpbiBrY3MpIGtba2NzW2tjXV0gPSBrY3Nba2NdO1xuICByZXR1cm4gaztcbn1cblxuRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbmNvbnN0IGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHNlbGYucXVlcmllcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgdmFsdWU6IGBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJHtuYW1lZFF1ZXJpZXNba2V5XX0pYFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Qoc2l6ZSkge1xuICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBtYXRjaGVzIHRvIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjaywgZWl0aGVyICdzbWFsbCBvbmx5JyBvciAnc21hbGwnLiBPbWl0dGluZyAnb25seScgZmFsbHMgYmFjayB0byB1c2luZyBhdExlYXN0KCkgbWV0aG9kLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQgZG9lcyBub3QuXG4gICAqL1xuICBpcyhzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgaWYoc2l6ZS5sZW5ndGggPiAxICYmIHNpemVbMV0gPT09ICdvbmx5Jykge1xuICAgICAgaWYoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQoc2l6ZSkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICBpZih0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemUoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlZCA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgKCkgPT4ge1xuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpLCBjdXJyZW50U2l6ZSA9IHRoaXMuY3VycmVudDtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuXG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBjdXJyZW50U2l6ZV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG4vLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxud2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuICB2YXIgc3R5bGVNZWRpYSA9ICh3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWEpO1xuXG4gIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgdmFyIHN0eWxlICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgIGluZm8gICAgICAgID0gbnVsbDtcblxuICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICBzdHlsZS5pZCAgICA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW0obWVkaWEpIHtcbiAgICAgICAgdmFyIHRleHQgPSBgQG1lZGlhICR7bWVkaWF9eyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1gO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24obWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9XG59KCkpO1xuXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5mdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgaWYgKCFzdHIpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbihyZXQsIHBhcmFtKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXRba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIHN0eWxlT2JqZWN0O1xufVxuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogTW90aW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cbiAqL1xuXG5jb25zdCBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG5jb25zdCBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcblxuY29uc3QgTW90aW9uID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9LFxuXG4gIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbil7XG4gIHZhciBhbmltLCBwcm9nLCBzdGFydCA9IG51bGw7XG4gIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICBmbi5hcHBseShlbGVtKTtcbiAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlKHRzKXtcbiAgICBpZighc3RhcnQpIHN0YXJ0ID0gdHM7XG4gICAgLy8gY29uc29sZS5sb2coc3RhcnQsIHRzKTtcbiAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICBmbi5hcHBseShlbGVtKTtcblxuICAgIGlmKHByb2cgPCBkdXJhdGlvbil7IGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pOyB9XG4gICAgZWxzZXtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIH1cbiAgfVxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbn1cblxuLyoqXG4gKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICogQGZ1bmN0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICovXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgZWxlbWVudCA9ICQoZWxlbWVudCkuZXEoMCk7XG5cbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG5cbiAgZWxlbWVudFxuICAgIC5hZGRDbGFzcyhhbmltYXRpb24pXG4gICAgLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICB9KTtcblxuICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50XG4gICAgICAuY3NzKCd0cmFuc2l0aW9uJywgJycpXG4gICAgICAuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xuICB9KTtcblxuICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGVsZW1lbnQpLCBmaW5pc2gpO1xuXG4gIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIGlmICghaXNJbikgZWxlbWVudC5oaWRlKCk7XG4gICAgcmVzZXQoKTtcbiAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICB9XG5cbiAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGAke2luaXRDbGFzc30gJHthY3RpdmVDbGFzc30gJHthbmltYXRpb259YCk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbkZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE5lc3QgPSB7XG4gIEZlYXRoZXIobWVudSwgdHlwZSA9ICd6ZicpIHtcbiAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xuXG4gICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeydyb2xlJzogJ21lbnVpdGVtJ30pLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG5cbiAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAkaXRlbVxuICAgICAgICAgIC5hZGRDbGFzcyhoYXNTdWJDbGFzcylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRpdGVtLmF0dHIoeydhcmlhLWV4cGFuZGVkJzogZmFsc2V9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgJHN1YlxuICAgICAgICAgIC5hZGRDbGFzcyhgc3VibWVudSAke3N1Yk1lbnVDbGFzc31gKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgJHN1Yi5hdHRyKHsnYXJpYS1oaWRkZW4nOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYGlzLXN1Ym1lbnUtaXRlbSAke3N1Ykl0ZW1DbGFzc31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybjtcbiAgfSxcblxuICBCdXJuKG1lbnUsIHR5cGUpIHtcbiAgICB2YXIgLy9pdGVtcyA9IG1lbnUuZmluZCgnbGknKSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgbWVudVxuICAgICAgLmZpbmQoJz5saSwgLm1lbnUsIC5tZW51ID4gbGknKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3N1Yk1lbnVDbGFzc30gJHtzdWJJdGVtQ2xhc3N9ICR7aGFzU3ViQ2xhc3N9IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZWApXG4gICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykuY3NzKCdkaXNwbGF5JywgJycpO1xuXG4gICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XG4gICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG4gICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5mdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgICBuYW1lU3BhY2UgPSBPYmplY3Qua2V5cyhlbGVtLmRhdGEoKSlbMF0gfHwgJ3RpbWVyJyxcbiAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgc3RhcnQsXG4gICAgICB0aW1lcjtcblxuICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmVtYWluID0gLTE7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcbiAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBpZihvcHRpb25zLmluZmluaXRlKXtcbiAgICAgICAgX3RoaXMucmVzdGFydCgpOy8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgfVxuICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgeyBjYigpOyB9XG4gICAgfSwgcmVtYWluKTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVyc3RhcnQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cblxuICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgLy9pZihlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcbiAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJwYXVzZWQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpbWFnZXMgLSBJbWFnZShzKSB0byBjaGVjayBpZiBsb2FkZWQuXG4gKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAqL1xuZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoaW1hZ2VzLCBjYWxsYmFjayl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVubG9hZGVkID0gaW1hZ2VzLmxlbmd0aDtcblxuICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgaW1hZ2VzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgaWYgKHRoaXMuY29tcGxldGUgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykpIHtcbiAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgfVxuICAgIC8vIEZvcmNlIGxvYWQgdGhlIGltYWdlXG4gICAgZWxzZSB7XG4gICAgICAvLyBmaXggZm9yIElFLiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9qcXVlcnkvZml4aW5nLWxvYWQtaW4taWUtZm9yLWNhY2hlZC1pbWFnZXMvXG4gICAgICB2YXIgc3JjID0gJCh0aGlzKS5hdHRyKCdzcmMnKTtcbiAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgKHNyYy5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKyAobmV3IERhdGUoKS5nZXRUaW1lKCkpKTtcbiAgICAgICQodGhpcykub25lKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNpbmdsZUltYWdlTG9hZGVkKCkge1xuICAgIHVubG9hZGVkLS07XG4gICAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgfVxufVxuXG5Gb3VuZGF0aW9uLlRpbWVyID0gVGltZXI7XG5Gb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkID0gb25JbWFnZXNMb2FkZWQ7XG5cbn0oalF1ZXJ5KTtcbiIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipXb3JrIGluc3BpcmVkIGJ5IG11bHRpcGxlIGpxdWVyeSBzd2lwZSBwbHVnaW5zKipcbi8vKipEb25lIGJ5IFlvaGFpIEFyYXJhdCAqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbihmdW5jdGlvbigkKSB7XG5cbiAgJC5zcG90U3dpcGUgPSB7XG4gICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICBlbmFibGVkOiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgcHJldmVudERlZmF1bHQ6IGZhbHNlLFxuICAgIG1vdmVUaHJlc2hvbGQ6IDc1LFxuICAgIHRpbWVUaHJlc2hvbGQ6IDIwMFxuICB9O1xuXG4gIHZhciAgIHN0YXJ0UG9zWCxcbiAgICAgICAgc3RhcnRQb3NZLFxuICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgIGVsYXBzZWRUaW1lLFxuICAgICAgICBpc01vdmluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uVG91Y2hFbmQoKSB7XG4gICAgLy8gIGFsZXJ0KHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kKTtcbiAgICBpc01vdmluZyA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZSkge1xuICAgIGlmICgkLnNwb3RTd2lwZS5wcmV2ZW50RGVmYXVsdCkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgICBpZihpc01vdmluZykge1xuICAgICAgdmFyIHggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICB2YXIgeSA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgIHZhciBkeCA9IHN0YXJ0UG9zWCAtIHg7XG4gICAgICB2YXIgZHkgPSBzdGFydFBvc1kgLSB5O1xuICAgICAgdmFyIGRpcjtcbiAgICAgIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWU7XG4gICAgICBpZihNYXRoLmFicyhkeCkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAgIGRpciA9IGR4ID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgICB9XG4gICAgICAvLyBlbHNlIGlmKE1hdGguYWJzKGR5KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgIC8vICAgZGlyID0gZHkgPiAwID8gJ2Rvd24nIDogJ3VwJztcbiAgICAgIC8vIH1cbiAgICAgIGlmKGRpcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9uVG91Y2hFbmQuY2FsbCh0aGlzKTtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdzd2lwZScsIGRpcikudHJpZ2dlcihgc3dpcGUke2Rpcn1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xuICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHN0YXJ0UG9zWCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHN0YXJ0UG9zWSA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgIGlzTW92aW5nID0gdHJ1ZTtcbiAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UpO1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lciAmJiB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRlYXJkb3duKCkge1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XG4gIH1cblxuICAkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7IHNldHVwOiBpbml0IH07XG5cbiAgJC5lYWNoKFsnbGVmdCcsICd1cCcsICdkb3duJywgJ3JpZ2h0J10sIGZ1bmN0aW9uICgpIHtcbiAgICAkLmV2ZW50LnNwZWNpYWxbYHN3aXBlJHt0aGlzfWBdID0geyBzZXR1cDogZnVuY3Rpb24oKXtcbiAgICAgICQodGhpcykub24oJ3N3aXBlJywgJC5ub29wKTtcbiAgICB9IH07XG4gIH0pO1xufSkoalF1ZXJ5KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNZXRob2QgZm9yIGFkZGluZyBwc3VlZG8gZHJhZyBldmVudHMgdG8gZWxlbWVudHMgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiFmdW5jdGlvbigkKXtcbiAgJC5mbi5hZGRUb3VjaCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksZWwpe1xuICAgICAgJChlbCkuYmluZCgndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxuICAgICAgICAvL29iamVjdCBpcyBub3JtYWxpemVkIHRvIHczYyBzcGVjcyBhbmQgZG9lcyBub3QgcHJvdmlkZSB0aGUgVG91Y2hMaXN0XG4gICAgICAgIGhhbmRsZVRvdWNoKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgdmFyIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcyxcbiAgICAgICAgICBmaXJzdCA9IHRvdWNoZXNbMF0sXG4gICAgICAgICAgZXZlbnRUeXBlcyA9IHtcbiAgICAgICAgICAgIHRvdWNoc3RhcnQ6ICdtb3VzZWRvd24nLFxuICAgICAgICAgICAgdG91Y2htb3ZlOiAnbW91c2Vtb3ZlJyxcbiAgICAgICAgICAgIHRvdWNoZW5kOiAnbW91c2V1cCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHR5cGUgPSBldmVudFR5cGVzW2V2ZW50LnR5cGVdLFxuICAgICAgICAgIHNpbXVsYXRlZEV2ZW50XG4gICAgICAgIDtcblxuICAgICAgaWYoJ01vdXNlRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBuZXcgd2luZG93Lk1vdXNlRXZlbnQodHlwZSwge1xuICAgICAgICAgICdidWJibGVzJzogdHJ1ZSxcbiAgICAgICAgICAnY2FuY2VsYWJsZSc6IHRydWUsXG4gICAgICAgICAgJ3NjcmVlblgnOiBmaXJzdC5zY3JlZW5YLFxuICAgICAgICAgICdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcbiAgICAgICAgICAnY2xpZW50WCc6IGZpcnN0LmNsaWVudFgsXG4gICAgICAgICAgJ2NsaWVudFknOiBmaXJzdC5jbGllbnRZXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgICAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLypsZWZ0Ki8sIG51bGwpO1xuICAgICAgfVxuICAgICAgZmlyc3QudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICAgIH07XG4gIH07XG59KGpRdWVyeSk7XG5cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5Kipcbi8vKipuZWVkIHRvIHJlY3JlYXRlIGZ1bmN0aW9uYWxpdHkqKlxuLy8qKmFuZCB0cnkgdG8gaW1wcm92ZSBpZiBwb3NzaWJsZSoqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLyogUmVtb3ZpbmcgdGhlIGpRdWVyeSBmdW5jdGlvbiAqKioqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuKGZ1bmN0aW9uKCAkLCB3aW5kb3csIHVuZGVmaW5lZCApIHtcblxuXHR2YXIgJGRvY3VtZW50ID0gJCggZG9jdW1lbnQgKSxcblx0XHQvLyBzdXBwb3J0VG91Y2ggPSAkLm1vYmlsZS5zdXBwb3J0LnRvdWNoLFxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxuXHRcdHRvdWNoU3RvcEV2ZW50ID0gJ3RvdWNoZW5kJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaGVuZFwiIDogXCJtb3VzZXVwXCIsXG5cdFx0dG91Y2hNb3ZlRXZlbnQgPSAndG91Y2htb3ZlJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCI7XG5cblx0Ly8gc2V0dXAgbmV3IGV2ZW50IHNob3J0Y3V0c1xuXHQkLmVhY2goICggXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCBcIiArXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuXG5cdFx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIGZuICkge1xuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdFx0fTtcblxuXHRcdC8vIGpRdWVyeSA8IDEuOFxuXHRcdGlmICggJC5hdHRyRm4gKSB7XG5cdFx0XHQkLmF0dHJGblsgbmFtZSBdID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XG5cdFx0dmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG5cdFx0ZXZlbnQudHlwZSA9IGV2ZW50VHlwZTtcblx0XHRpZiAoIGJ1YmJsZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggZXZlbnQsIHVuZGVmaW5lZCwgb2JqICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xuXHRcdH1cblx0XHRldmVudC50eXBlID0gb3JpZ2luYWxUeXBlO1xuXHR9XG5cblx0Ly8gYWxzbyBoYW5kbGVzIHRhcGhvbGRcblxuXHQvLyBBbHNvIGhhbmRsZXMgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0XG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHtcblxuXHRcdC8vIE1vcmUgdGhhbiB0aGlzIGhvcml6b250YWwgZGlzcGxhY2VtZW50LCBhbmQgd2Ugd2lsbCBzdXBwcmVzcyBzY3JvbGxpbmcuXG5cdFx0c2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZDogMzAsXG5cblx0XHQvLyBNb3JlIHRpbWUgdGhhbiB0aGlzLCBhbmQgaXQgaXNuJ3QgYSBzd2lwZS5cblx0XHRkdXJhdGlvblRocmVzaG9sZDogMTAwMCxcblxuXHRcdC8vIFN3aXBlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbW9yZSB0aGFuIHRoaXMuXG5cdFx0aG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdC8vIFN3aXBlIHZlcnRpY2FsIGRpc3BsYWNlbWVudCBtdXN0IGJlIGxlc3MgdGhhbiB0aGlzLlxuXHRcdHZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Z2V0TG9jYXRpb246IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgd2luUGFnZVggPSB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuXHRcdFx0XHR4ID0gZXZlbnQuY2xpZW50WCxcblx0XHRcdFx0eSA9IGV2ZW50LmNsaWVudFk7XG5cblx0XHRcdGlmICggZXZlbnQucGFnZVkgPT09IDAgJiYgTWF0aC5mbG9vciggeSApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVkgKSB8fFxuXHRcdFx0XHRldmVudC5wYWdlWCA9PT0gMCAmJiBNYXRoLmZsb29yKCB4ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIGlPUzQgY2xpZW50WC9jbGllbnRZIGhhdmUgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHQvLyBpbiBwYWdlWC9wYWdlWS4gV2hpbGUgcGFnZVgvcGFnZS8gaGF2ZSB0aGUgdmFsdWUgMFxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0geSAtIHdpblBhZ2VZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA8ICggZXZlbnQucGFnZVkgLSB3aW5QYWdlWSkgfHwgeCA8ICggZXZlbnQucGFnZVggLSB3aW5QYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIFNvbWUgQW5kcm9pZCBicm93c2VycyBoYXZlIHRvdGFsbHkgYm9ndXMgdmFsdWVzIGZvciBjbGllbnRYL1lcblx0XHRcdFx0Ly8gd2hlbiBzY3JvbGxpbmcvem9vbWluZyBhIHBhZ2UuIERldGVjdGFibGUgc2luY2UgY2xpZW50WC9jbGllbnRZXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcblx0XHRcdFx0eCA9IGV2ZW50LnBhZ2VYIC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSBldmVudC5wYWdlWSAtIHdpblBhZ2VZO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4LFxuXHRcdFx0XHR5OiB5XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXSxcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU3dpcGU6IGZ1bmN0aW9uKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApIHtcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDEgXSAtIHN0b3AuY29vcmRzWyAxIF0gKSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS52ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkICkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcblxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIFwic3dpcGVcIiwgJC5FdmVudCggXCJzd2lwZVwiLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9KSwgdHJ1ZSApO1xuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHQvLyBUaGlzIHNlcnZlcyBhcyBhIGZsYWcgdG8gZW5zdXJlIHRoYXQgYXQgbW9zdCBvbmUgc3dpcGUgZXZlbnQgZXZlbnQgaXNcblx0XHQvLyBpbiB3b3JrIGF0IGFueSBnaXZlbiB0aW1lXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcblxuXHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsXG5cdFx0XHRcdHRoaXNPYmplY3QgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIHRoaXNPYmplY3QgKSxcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xuXG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgZXZlbnRzIGRhdGEgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWRkIHRoZSBzd2lwZSBjb250ZXh0XG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoICFldmVudHMgKSB7XG5cdFx0XHRcdGV2ZW50cyA9IHsgbGVuZ3RoOiAwIH07XG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xuXHRcdFx0fVxuXHRcdFx0ZXZlbnRzLmxlbmd0aCsrO1xuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcblxuXHRcdFx0Y29udGV4dC5zdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBCYWlsIGlmIHdlJ3JlIGFscmVhZHkgd29ya2luZyBvbiBhIHN3aXBlIGV2ZW50XG5cdFx0XHRcdGlmICggJC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IHRydWU7XG5cblx0XHRcdFx0dmFyIHN0b3AsXG5cdFx0XHRcdFx0c3RhcnQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RhcnQoIGV2ZW50ICksXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdFx0XHRlbWl0dGVkID0gZmFsc2U7XG5cblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXJ0IHx8IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHN0b3AgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RvcCggZXZlbnQgKTtcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5oYW5kbGVTd2lwZSggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKTtcblx0XHRcdFx0XHRcdGlmICggZW1pdHRlZCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZ1xuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb250ZXh0LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0XHRcdGNvbnRleHQubW92ZSA9IG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JGRvY3VtZW50Lm9uKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlIClcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHR9O1xuXHRcdFx0JHRoaXMub24oIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdH0sXG5cblx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xuXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcblx0XHRcdFx0Y29udGV4dCA9IGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZGVsZXRlIGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xuXHRcdFx0XHRpZiAoIGV2ZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29udGV4dCApIHtcblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0YXJ0ICkge1xuXHRcdFx0XHRcdCQoIHRoaXMgKS5vZmYoIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5tb3ZlICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RvcCApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdCQuZWFjaCh7XG5cdFx0c3dpcGVsZWZ0OiBcInN3aXBlLmxlZnRcIixcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcblx0fSwgZnVuY3Rpb24oIGV2ZW50LCBzb3VyY2VFdmVudCApIHtcblxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLmJpbmQoIHNvdXJjZUV2ZW50LCAkLm5vb3AgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS51bmJpbmQoIHNvdXJjZUV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59KSggalF1ZXJ5LCB0aGlzICk7XG4qL1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGAke3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgIGluIHdpbmRvdykge1xuICAgICAgcmV0dXJuIHdpbmRvd1tgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYF07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn0oKSk7XG5cbmNvbnN0IHRyaWdnZXJzID0gKGVsLCB0eXBlKSA9PiB7XG4gIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGlkID0+IHtcbiAgICAkKGAjJHtpZH1gKVsgdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKGAke3R5cGV9LnpmLnRyaWdnZXJgLCBbZWxdKTtcbiAgfSk7XG59O1xuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgZnVuY3Rpb24oKSB7XG4gIHRyaWdnZXJzKCQodGhpcyksICdvcGVuJyk7XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbi8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnY2xvc2UnKTtcbiAgfVxuICBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xuICB9IGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcigndG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uKGUpe1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBsZXQgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gIGlmKGFuaW1hdGlvbiAhPT0gJycpe1xuICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfSk7XG4gIH1lbHNle1xuICAgICQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICB9XG59KTtcblxuJChkb2N1bWVudCkub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUtZm9jdXMnKTtcbiAgJChgIyR7aWR9YCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbn0pO1xuXG4vKipcbiogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuKiBAZnVuY3Rpb25cbiogQHByaXZhdGVcbiovXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKSA9PiB7XG4gIGNoZWNrTGlzdGVuZXJzKCk7XG59KTtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gIGV2ZW50c0xpc3RlbmVyKCk7XG4gIHJlc2l6ZUxpc3RlbmVyKCk7XG4gIHNjcm9sbExpc3RlbmVyKCk7XG4gIGNsb3NlbWVMaXN0ZW5lcigpO1xufVxuXG4vLyoqKioqKioqIG9ubHkgZmlyZXMgdGhpcyBmdW5jdGlvbiBvbmNlIG9uIGxvYWQsIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHdhdGNoICoqKioqKioqXG5mdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgaWYocGx1Z2luTmFtZSl7XG4gICAgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgIH1lbHNlIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gIH1cbiAgaWYoeWV0aUJveGVzLmxlbmd0aCl7XG4gICAgbGV0IGxpc3RlbmVycyA9IHBsdWdOYW1lcy5tYXAoKG5hbWUpID0+IHtcbiAgICAgIHJldHVybiBgY2xvc2VtZS56Zi4ke25hbWV9YDtcbiAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAkKHdpbmRvdykub2ZmKGxpc3RlbmVycykub24obGlzdGVuZXJzLCBmdW5jdGlvbihlLCBwbHVnaW5JZCl7XG4gICAgICBsZXQgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgIGxldCBwbHVnaW5zID0gJChgW2RhdGEtJHtwbHVnaW59XWApLm5vdChgW2RhdGEteWV0aS1ib3g9XCIke3BsdWdpbklkfVwiXWApO1xuXG4gICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1yZXNpemVdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Jlc2l6ZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLnRyaWdnZXInKVxuICAgIC5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKHRpbWVyKXsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cblx0ICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG5cdFx0ICAgfVxuXHRcdCAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuXHRcdCAgfVxuXHRcdCAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBBY2NvcmRpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFjY29yZGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gYSBwbGFpbiBvYmplY3Qgd2l0aCBzZXR0aW5ncyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBY2NvcmRpb24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FjY29yZGlvbicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0FjY29yZGlvbicsIHtcbiAgICAgICdFTlRFUic6ICd0b2dnbGUnLFxuICAgICAgJ1NQQUNFJzogJ3RvZ2dsZScsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYWNjb3JkaW9uIGJ5IGFuaW1hdGluZyB0aGUgcHJlc2V0IGFjdGl2ZSBwYW5lKHMpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdyb2xlJywgJ3RhYmxpc3QnKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJyk7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oaWR4LCBlbCkge1xuICAgICAgdmFyICRlbCA9ICQoZWwpLFxuICAgICAgICAgICRjb250ZW50ID0gJGVsLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKSxcbiAgICAgICAgICBpZCA9ICRjb250ZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjY29yZGlvbicpLFxuICAgICAgICAgIGxpbmtJZCA9IGVsLmlkIHx8IGAke2lkfS1sYWJlbGA7XG5cbiAgICAgICRlbC5maW5kKCdhOmZpcnN0JykuYXR0cih7XG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaWQsXG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdpZCc6IGxpbmtJZCxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgICRjb250ZW50LmF0dHIoeydyb2xlJzogJ3RhYnBhbmVsJywgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZCwgJ2FyaWEtaGlkZGVuJzogdHJ1ZSwgJ2lkJzogaWR9KTtcbiAgICB9KTtcbiAgICB2YXIgJGluaXRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgdGhpcy5maXJzdFRpbWVJbml0ID0gdHJ1ZTtcbiAgICBpZigkaW5pdEFjdGl2ZS5sZW5ndGgpe1xuICAgICAgdGhpcy5kb3duKCRpbml0QWN0aXZlLCB0aGlzLmZpcnN0VGltZUluaXQpO1xuICAgICAgdGhpcy5maXJzdFRpbWVJbml0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hlY2tEZWVwTGluayA9ICgpID0+IHtcbiAgICAgIHZhciBhbmNob3IgPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIC8vbmVlZCBhIGhhc2ggYW5kIGEgcmVsZXZhbnQgYW5jaG9yIGluIHRoaXMgdGFic2V0XG4gICAgICBpZihhbmNob3IubGVuZ3RoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWYkPVwiJythbmNob3IrJ1wiXScpLFxuICAgICAgICAkYW5jaG9yID0gJChhbmNob3IpO1xuXG4gICAgICAgIGlmICgkbGluay5sZW5ndGggJiYgJGFuY2hvcikge1xuICAgICAgICAgIGlmICghJGxpbmsucGFyZW50KCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgIHRoaXMuZG93bigkYW5jaG9yLCB0aGlzLmZpcnN0VGltZUluaXQpO1xuICAgICAgICAgICAgdGhpcy5maXJzdFRpbWVJbml0ID0gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vcm9sbCB1cCBhIGxpdHRsZSB0byBzaG93IHRoZSB0aXRsZXNcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBfdGhpcy4kZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgX3RoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZGVlcGxpbmtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkZWVwbGluay56Zi5hY2NvcmRpb24nLCBbJGxpbmssICRhbmNob3JdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vdXNlIGJyb3dzZXIgdG8gb3BlbiBhIHRhYiwgaWYgaXQgZXhpc3RzIGluIHRoaXMgdGFic2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdGhpcy5fY2hlY2tEZWVwTGluaygpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgYWNjb3JkaW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKTtcbiAgICAgIHZhciAkdGFiQ29udGVudCA9ICRlbGVtLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkdGFiQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgJGVsZW0uY2hpbGRyZW4oJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbiBrZXlkb3duLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0FjY29yZGlvbicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLm5leHQoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ucHJldigpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIGNvbnRlbnQgcGFuZSdzIG9wZW4vY2xvc2Ugc3RhdGUuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0galF1ZXJ5IG9iamVjdCBvZiB0aGUgcGFuZSB0byB0b2dnbGUgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoJHRhcmdldCkge1xuICAgIGlmKCR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICB0aGlzLnVwKCR0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvd24oJHRhcmdldCk7XG4gICAgfVxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHZhciBhbmNob3IgPSAkdGFyZ2V0LnByZXYoJ2EnKS5hdHRyKCdocmVmJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBkYXRlSGlzdG9yeSkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBhY2NvcmRpb24gdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiBwYW5lIHRvIG9wZW4gKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBmaXJzdFRpbWUgLSBmbGFnIHRvIGRldGVybWluZSBpZiByZWZsb3cgc2hvdWxkIGhhcHBlbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZG93bigkdGFyZ2V0LCBmaXJzdFRpbWUpIHtcbiAgICAkdGFyZ2V0XG4gICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcbiAgICAgIC5wYXJlbnQoJ1tkYXRhLXRhYi1jb250ZW50XScpXG4gICAgICAuYWRkQmFjaygpXG4gICAgICAucGFyZW50KCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgJiYgIWZpcnN0VGltZSkge1xuICAgICAgdmFyICRjdXJyZW50QWN0aXZlID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkY3VycmVudEFjdGl2ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy51cCgkY3VycmVudEFjdGl2ZS5ub3QoJHRhcmdldCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICR0YXJnZXQuc2xpZGVEb3duKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAoKSA9PiB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIG9wZW5pbmcuXG4gICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2Rvd25cbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkb3duLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiB0cnVlLFxuICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHRhYiB0byBjbG9zZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI3VwXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdXAoJHRhcmdldCkge1xuICAgIHZhciAkYXVudHMgPSAkdGFyZ2V0LnBhcmVudCgpLnNpYmxpbmdzKCksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIGlmKCghdGhpcy5vcHRpb25zLmFsbG93QWxsQ2xvc2VkICYmICEkYXVudHMuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB8fCAhJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGb3VuZGF0aW9uLk1vdmUodGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICR0YXJnZXQsIGZ1bmN0aW9uKCl7XG4gICAgICAkdGFyZ2V0LnNsaWRlVXAoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBjb2xsYXBzaW5nIHVwLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI3VwXG4gICAgICAgICAqL1xuICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1cC56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgICAgfSk7XG4gICAgLy8gfSk7XG5cbiAgICAkdGFyZ2V0LmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSlcbiAgICAgICAgICAgLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkZXN0cm95ZWRcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdGFiLWNvbnRlbnRdJykuc3RvcCh0cnVlKS5zbGlkZVVwKDApLmNzcygnZGlzcGxheScsICcnKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5vZmYoJy56Zi5hY2NvcmRpb24nKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbkFjY29yZGlvbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGFuaW1hdGUgdGhlIG9wZW5pbmcgb2YgYW4gYWNjb3JkaW9uIHBhbmUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMjUwXG4gICAqL1xuICBzbGlkZVNwZWVkOiAyNTAsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG11bHRpRXhwYW5kOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gY2xvc2UgYWxsIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYWxsb3dBbGxDbG9zZWQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSBhY2NvcmRpb24gcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiBhY2NvcmRpb25cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oQWNjb3JkaW9uLCAnQWNjb3JkaW9uJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBJbnRlcmNoYW5nZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uaW50ZXJjaGFuZ2VcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyXG4gKi9cblxuY2xhc3MgSW50ZXJjaGFuZ2Uge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBJbnRlcmNoYW5nZS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgSW50ZXJjaGFuZ2UuZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucnVsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gJyc7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdJbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBJbnRlcmNoYW5nZSBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgaW50ZXJjaGFuZ2UgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLl9hZGRCcmVha3BvaW50cygpO1xuICAgIHRoaXMuX2dlbmVyYXRlUnVsZXMoKTtcbiAgICB0aGlzLl9yZWZsb3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuaW50ZXJjaGFuZ2UnLCBGb3VuZGF0aW9uLnV0aWwudGhyb3R0bGUoKCkgPT4ge1xuICAgICAgdGhpcy5fcmVmbG93KCk7XG4gICAgfSwgNTApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBJbnRlcmNoYW5nZSB1cG9uIERPTSBjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIHZhciBtYXRjaDtcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUsIGJ1dCBvbmx5IHNhdmUgdGhlIGxhc3QgbWF0Y2hcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucnVsZXMpIHtcbiAgICAgIGlmKHRoaXMucnVsZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHJ1bGUgPSB0aGlzLnJ1bGVzW2ldO1xuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocnVsZS5xdWVyeSkubWF0Y2hlcykge1xuICAgICAgICAgIG1hdGNoID0gcnVsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXRjaCkge1xuICAgICAgdGhpcy5yZXBsYWNlKG1hdGNoLnBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBGb3VuZGF0aW9uIGJyZWFrcG9pbnRzIGFuZCBhZGRzIHRoZW0gdG8gdGhlIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFUyBvYmplY3QuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEJyZWFrcG9pbnRzKCkge1xuICAgIGZvciAodmFyIGkgaW4gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllc1tpXTtcbiAgICAgICAgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5Lm5hbWVdID0gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgSW50ZXJjaGFuZ2UgZWxlbWVudCBmb3IgdGhlIHByb3ZpZGVkIG1lZGlhIHF1ZXJ5ICsgY29udGVudCBwYWlyaW5nc1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRoYXQgaXMgYW4gSW50ZXJjaGFuZ2UgaW5zdGFuY2VcbiAgICogQHJldHVybnMge0FycmF5fSBzY2VuYXJpb3MgLSBBcnJheSBvZiBvYmplY3RzIHRoYXQgaGF2ZSAnbXEnIGFuZCAncGF0aCcga2V5cyB3aXRoIGNvcnJlc3BvbmRpbmcga2V5c1xuICAgKi9cbiAgX2dlbmVyYXRlUnVsZXMoZWxlbWVudCkge1xuICAgIHZhciBydWxlc0xpc3QgPSBbXTtcbiAgICB2YXIgcnVsZXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJ1bGVzKSB7XG4gICAgICBydWxlcyA9IHRoaXMub3B0aW9ucy5ydWxlcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBydWxlcyA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnaW50ZXJjaGFuZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgcnVsZXMgPSAgdHlwZW9mIHJ1bGVzID09PSAnc3RyaW5nJyA/IHJ1bGVzLm1hdGNoKC9cXFsuKj9cXF0vZykgOiBydWxlcztcblxuICAgIGZvciAodmFyIGkgaW4gcnVsZXMpIHtcbiAgICAgIGlmKHJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gcnVsZXNbaV0uc2xpY2UoMSwgLTEpLnNwbGl0KCcsICcpO1xuICAgICAgICB2YXIgcGF0aCA9IHJ1bGUuc2xpY2UoMCwgLTEpLmpvaW4oJycpO1xuICAgICAgICB2YXIgcXVlcnkgPSBydWxlW3J1bGUubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgaWYgKEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV0pIHtcbiAgICAgICAgICBxdWVyeSA9IEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV07XG4gICAgICAgIH1cblxuICAgICAgICBydWxlc0xpc3QucHVzaCh7XG4gICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICBxdWVyeTogcXVlcnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ydWxlcyA9IHJ1bGVzTGlzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGBzcmNgIHByb3BlcnR5IG9mIGFuIGltYWdlLCBvciBjaGFuZ2UgdGhlIEhUTUwgb2YgYSBjb250YWluZXIsIHRvIHRoZSBzcGVjaWZpZWQgcGF0aC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gUGF0aCB0byB0aGUgaW1hZ2Ugb3IgSFRNTCBwYXJ0aWFsLlxuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcbiAgICovXG4gIHJlcGxhY2UocGF0aCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoID09PSBwYXRoKSByZXR1cm47XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICB0cmlnZ2VyID0gJ3JlcGxhY2VkLnpmLmludGVyY2hhbmdlJztcblxuICAgIC8vIFJlcGxhY2luZyBpbWFnZXNcbiAgICBpZiAodGhpcy4kZWxlbWVudFswXS5ub2RlTmFtZSA9PT0gJ0lNRycpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignc3JjJywgcGF0aCkub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xuICAgICAgfSlcbiAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNpbmcgYmFja2dyb3VuZCBpbWFnZXNcbiAgICBlbHNlIGlmIChwYXRoLm1hdGNoKC9cXC4oZ2lmfGpwZ3xqcGVnfHBuZ3xzdmd8dGlmZikoWz8jXS4qKT8vaSkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHsgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcrcGF0aCsnKScgfSlcbiAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIEhUTUxcbiAgICBlbHNlIHtcbiAgICAgICQuZ2V0KHBhdGgsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50Lmh0bWwocmVzcG9uc2UpXG4gICAgICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgICAgICQocmVzcG9uc2UpLmZvdW5kYXRpb24oKTtcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiBjb250ZW50IGluIGFuIEludGVyY2hhbmdlIGVsZW1lbnQgaXMgZG9uZSBiZWluZyBsb2FkZWQuXG4gICAgICogQGV2ZW50IEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAgICovXG4gICAgLy8gdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgLy9UT0RPIHRoaXMuXG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuSW50ZXJjaGFuZ2UuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBSdWxlcyB0byBiZSBhcHBsaWVkIHRvIEludGVyY2hhbmdlIGVsZW1lbnRzLiBTZXQgd2l0aCB0aGUgYGRhdGEtaW50ZXJjaGFuZ2VgIGFycmF5IG5vdGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/YXJyYXl9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIHJ1bGVzOiBudWxsXG59O1xuXG5JbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgPSB7XG4gICdsYW5kc2NhcGUnOiAnc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICAncG9ydHJhaXQnOiAnc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gICdyZXRpbmEnOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwgb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEludGVyY2hhbmdlLCAnSW50ZXJjaGFuZ2UnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE9mZkNhbnZhcyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgT2ZmQ2FudmFzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2ZmLWNhbnZhcyB3cmFwcGVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIE9mZkNhbnZhcyNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBpbml0aWFsaXplLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xuICAgIHRoaXMuJHRyaWdnZXJzID0gJCgpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT2ZmQ2FudmFzJylcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG9mZi1jYW52YXMgd3JhcHBlciBieSBhZGRpbmcgdGhlIGV4aXQgb3ZlcmxheSAoaWYgbmVlZGVkKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoYGlzLXRyYW5zaXRpb24tJHt0aGlzLm9wdGlvbnMudHJhbnNpdGlvbn1gKTtcblxuICAgIC8vIEZpbmQgdHJpZ2dlcnMgdGhhdCBhZmZlY3QgdGhpcyBlbGVtZW50IGFuZCBhZGQgYXJpYS1leHBhbmRlZCB0byB0aGVtXG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKGRvY3VtZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAvLyBBZGQgYW4gb3ZlcmxheSBvdmVyIHRoZSBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB2YXIgb3ZlcmxheVBvc2l0aW9uID0gJCh0aGlzLiRlbGVtZW50KS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ2ZpeGVkJyA/ICdpcy1vdmVybGF5LWZpeGVkJyA6ICdpcy1vdmVybGF5LWFic29sdXRlJztcbiAgICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdqcy1vZmYtY2FudmFzLW92ZXJsYXkgJyArIG92ZXJsYXlQb3NpdGlvbik7XG4gICAgICB0aGlzLiRvdmVybGF5ID0gJChvdmVybGF5KTtcbiAgICAgIGlmKG92ZXJsYXlQb3NpdGlvbiA9PT0gJ2lzLW92ZXJsYXktZml4ZWQnKSB7XG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID0gdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgfHwgbmV3IFJlZ0V4cCh0aGlzLm9wdGlvbnMucmV2ZWFsQ2xhc3MsICdnJykudGVzdCh0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XG4gICAgICB0aGlzLl9zZXRNUUNoZWNrZXIoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPT09IHRydWUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUoJCgnW2RhdGEtb2ZmLWNhbnZhc10nKVswXSkudHJhbnNpdGlvbkR1cmF0aW9uKSAqIDEwMDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG9mZi1jYW52YXMgd3JhcHBlciBhbmQgdGhlIGV4aXQgb3ZlcmxheS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJykub24oe1xuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgJ2tleWRvd24uemYub2ZmY2FudmFzJzogdGhpcy5faGFuZGxlS2V5Ym9hcmQuYmluZCh0aGlzKVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID8gdGhpcy4kb3ZlcmxheSA6ICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKTtcbiAgICAgICR0YXJnZXQub24oeydjbGljay56Zi5vZmZjYW52YXMnOiB0aGlzLmNsb3NlLmJpbmQodGhpcyl9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBldmVudCBsaXN0ZW5lciBmb3IgZWxlbWVudHMgdGhhdCB3aWxsIHJldmVhbCBhdCBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldE1RQ2hlY2tlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5yZXZlYWwoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pLm9uZSgnbG9hZC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgcmV2ZWFsaW5nL2hpZGluZyB0aGUgb2ZmLWNhbnZhcyBhdCBicmVha3BvaW50cywgbm90IHRoZSBzYW1lIGFzIG9wZW4uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNSZXZlYWxlZCAtIHRydWUgaWYgZWxlbWVudCBzaG91bGQgYmUgcmV2ZWFsZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgcmV2ZWFsKGlzUmV2ZWFsZWQpIHtcbiAgICB2YXIgJGNsb3NlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtY2xvc2VdJyk7XG4gICAgaWYgKGlzUmV2ZWFsZWQpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHsgJGNsb3Nlci5oaWRlKCk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gZmFsc2U7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKS5vbih7XG4gICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgJGNsb3Nlci5zaG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHNjcm9sbGluZyBvZiB0aGUgYm9keSB3aGVuIG9mZmNhbnZhcyBpcyBvcGVuIG9uIG1vYmlsZSBTYWZhcmkgYW5kIG90aGVyIHRyb3VibGVzb21lIGJyb3dzZXJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3N0b3BTY3JvbGxpbmcoZXZlbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUYWtlbiBhbmQgYWRhcHRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTY4ODk0NDcvcHJldmVudC1mdWxsLXBhZ2Utc2Nyb2xsaW5nLWlvc1xuICAvLyBPbmx5IHJlYWxseSB3b3JrcyBmb3IgeSwgbm90IHN1cmUgaG93IHRvIGV4dGVuZCB0byB4IG9yIGlmIHdlIG5lZWQgdG8uXG4gIF9yZWNvcmRTY3JvbGxhYmxlKGV2ZW50KSB7XG4gICAgbGV0IGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cblxuICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlIChjb250ZW50IG92ZXJmbG93cyksIHRoZW4uLi5cbiAgICBpZiAoZWxlbS5zY3JvbGxIZWlnaHQgIT09IGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgdG9wLCBzY3JvbGwgZG93biBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIHVwXG4gICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IDApIHtcbiAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSAxO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIGJvdHRvbSwgc2Nyb2xsIHVwIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgZG93blxuICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCAtIDE7XG4gICAgICB9XG4gICAgfVxuICAgIGVsZW0uYWxsb3dVcCA9IGVsZW0uc2Nyb2xsVG9wID4gMDtcbiAgICBlbGVtLmFsbG93RG93biA9IGVsZW0uc2Nyb2xsVG9wIDwgKGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpO1xuICAgIGVsZW0ubGFzdFkgPSBldmVudC5vcmlnaW5hbEV2ZW50LnBhZ2VZO1xuICB9XG5cbiAgX3N0b3BTY3JvbGxQcm9wYWdhdGlvbihldmVudCkge1xuICAgIGxldCBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG4gICAgbGV0IHVwID0gZXZlbnQucGFnZVkgPCBlbGVtLmxhc3RZO1xuICAgIGxldCBkb3duID0gIXVwO1xuICAgIGVsZW0ubGFzdFkgPSBldmVudC5wYWdlWTtcblxuICAgIGlmKCh1cCAmJiBlbGVtLmFsbG93VXApIHx8IChkb3duICYmIGVsZW0uYWxsb3dEb3duKSkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI29wZW5lZFxuICAgKi9cbiAgb3BlbihldmVudCwgdHJpZ2dlcikge1xuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7IHJldHVybjsgfVxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAodHJpZ2dlcikge1xuICAgICAgdGhpcy4kbGFzdFRyaWdnZXIgPSB0cmlnZ2VyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ3RvcCcpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAnYm90dG9tJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAqL1xuICAgIF90aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1vcGVuJylcblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxuICAgICAgICAudHJpZ2dlcignb3BlbmVkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgYWRkIGNsYXNzIGFuZCBkaXNhYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmFkZENsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQodGhpcy4kZWxlbWVudCksIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzRm9jdXMgPSBfdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1hdXRvZm9jdXNdJyk7XG4gICAgICAgIGlmIChjYW52YXNGb2N1cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhbnZhc0ZvY3VzLmVxKDApLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5maW5kKCdhLCBidXR0b24nKS5lcSgwKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnRyYXBGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICovXG4gIGNsb3NlKGNiKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICovXG4gICAgICAgIC50cmlnZ2VyKCdjbG9zZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW4gb3IgY2xvc2VkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICovXG4gIHRvZ2dsZShldmVudCwgdHJpZ2dlcikge1xuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgIHRoaXMuY2xvc2UoZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMub3BlbihldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09mZkNhbnZhcycsIHtcbiAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgaGFuZGxlZDogKCkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIG9mZmNhbnZhcyBwbHVnaW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKTtcbiAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbk9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAvKipcbiAgICogQWRkcyBhbiBvdmVybGF5IG9uIHRvcCBvZiBgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudFNjcm9sbDogdHJ1ZSxcblxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqL1xuICB0cmFuc2l0aW9uVGltZTogMCxcblxuICAvKipcbiAgICogVHlwZSBvZiB0cmFuc2l0aW9uIGZvciB0aGUgb2ZmY2FudmFzIG1lbnUuIE9wdGlvbnMgYXJlICdwdXNoJywgJ2RldGFjaGVkJyBvciAnc2xpZGUnLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHB1c2hcbiAgICovXG4gIHRyYW5zaXRpb246ICdwdXNoJyxcblxuICAvKipcbiAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvciBib3R0b20gb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgZm9yY2VUbzogbnVsbCxcblxuICAvKipcbiAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IGF0IHdoaWNoIHRvIHJldmVhbC4gSlMgd2lsbCB1c2UgYSBSZWdFeHAgdG8gdGFyZ2V0IHN0YW5kYXJkIGNsYXNzZXMsIGlmIGNoYW5naW5nIGNsYXNzbmFtZXMsIHBhc3MgeW91ciBjbGFzcyB3aXRoIHRoZSBgcmV2ZWFsQ2xhc3NgIG9wdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcmV2ZWFsT246IG51bGwsXG5cbiAgLyoqXG4gICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhdXRvRm9jdXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIENsYXNzIHVzZWQgdG8gZm9yY2UgYW4gb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuLiBGb3VuZGF0aW9uIGRlZmF1bHRzIGZvciB0aGlzIGFyZSBgcmV2ZWFsLWZvci1sYXJnZWAgJiBgcmV2ZWFsLWZvci1tZWRpdW1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHJldmVhbC1mb3ItXG4gICAqIEB0b2RvIGltcHJvdmUgdGhlIHJlZ2V4IHRlc3RpbmcgZm9yIHRoaXMuXG4gICAqL1xuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdHJhcEZvY3VzOiBmYWxzZVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUYWJzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50YWJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIgaWYgdGFicyBjb250YWluIGltYWdlc1xuICovXG5cbmNsYXNzIFRhYnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0YWJzLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRhYnMjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIHRhYnMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVGFicy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1RhYnMnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdUYWJzJywge1xuICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICAvLyAnVEFCJzogJ25leHQnLFxuICAgICAgLy8gJ1NISUZUX1RBQic6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFicyBieSBzaG93aW5nIGFuZCBmb2N1c2luZyAoaWYgYXV0b0ZvY3VzPXRydWUpIHRoZSBwcmVzZXQgYWN0aXZlIHRhYi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoeydyb2xlJzogJ3RhYmxpc3QnfSk7XG4gICAgdGhpcy4kdGFiVGl0bGVzID0gdGhpcy4kZWxlbWVudC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuICAgIHRoaXMuJHRhYkNvbnRlbnQgPSAkKGBbZGF0YS10YWJzLWNvbnRlbnQ9XCIke3RoaXMuJGVsZW1lbnRbMF0uaWR9XCJdYCk7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkbGluayA9ICRlbGVtLmZpbmQoJ2EnKSxcbiAgICAgICAgICBpc0FjdGl2ZSA9ICRlbGVtLmhhc0NsYXNzKGAke190aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApLFxuICAgICAgICAgIGhhc2ggPSAkbGlua1swXS5oYXNoLnNsaWNlKDEpLFxuICAgICAgICAgIGxpbmtJZCA9ICRsaW5rWzBdLmlkID8gJGxpbmtbMF0uaWQgOiBgJHtoYXNofS1sYWJlbGAsXG4gICAgICAgICAgJHRhYkNvbnRlbnQgPSAkKGAjJHtoYXNofWApO1xuXG4gICAgICAkZWxlbS5hdHRyKHsncm9sZSc6ICdwcmVzZW50YXRpb24nfSk7XG5cbiAgICAgICRsaW5rLmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnYXJpYS1jb250cm9scyc6IGhhc2gsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogaXNBY3RpdmUsXG4gICAgICAgICdpZCc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgICR0YWJDb250ZW50LmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWJwYW5lbCcsXG4gICAgICAgICdhcmlhLWhpZGRlbic6ICFpc0FjdGl2ZSxcbiAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgIGlmKGlzQWN0aXZlICYmIF90aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKXtcbiAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6ICRlbGVtLm9mZnNldCgpLnRvcCB9LCBfdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXksICgpID0+IHtcbiAgICAgICAgICAgICRsaW5rLmZvY3VzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdmFyICRpbWFnZXMgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoJ2ltZycpO1xuXG4gICAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCgkaW1hZ2VzLCB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAgLy9jdXJyZW50IGNvbnRleHQtYm91bmQgZnVuY3Rpb24gdG8gb3BlbiB0YWJzIG9uIHBhZ2UgbG9hZCBvciBoaXN0b3J5IHBvcHN0YXRlXG4gICAgdGhpcy5fY2hlY2tEZWVwTGluayA9ICgpID0+IHtcbiAgICAgIHZhciBhbmNob3IgPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIC8vbmVlZCBhIGhhc2ggYW5kIGEgcmVsZXZhbnQgYW5jaG9yIGluIHRoaXMgdGFic2V0XG4gICAgICBpZihhbmNob3IubGVuZ3RoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWYkPVwiJythbmNob3IrJ1wiXScpO1xuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RUYWIoJChhbmNob3IpLCB0cnVlKTtcblxuICAgICAgICAgIC8vcm9sbCB1cCBhIGxpdHRsZSB0byBzaG93IHRoZSB0aXRsZXNcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlKSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNkZWVwbGlua1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkZWVwbGluay56Zi50YWJzJywgWyRsaW5rLCAkKGFuY2hvcildKTtcbiAgICAgICAgIH1cbiAgICAgICB9XG4gICAgIH1cblxuICAgIC8vdXNlIGJyb3dzZXIgdG8gb3BlbiBhIHRhYiwgaWYgaXQgZXhpc3RzIGluIHRoaXMgdGFic2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdGhpcy5fY2hlY2tEZWVwTGluaygpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy5fYWRkS2V5SGFuZGxlcigpO1xuICAgIHRoaXMuX2FkZENsaWNrSGFuZGxlcigpO1xuICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgPSB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKTtcblxuICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIpO1xuICAgIH1cblxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQ2xpY2tIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub2ZmKCdjbGljay56Zi50YWJzJylcbiAgICAgIC5vbignY2xpY2suemYudGFicycsIGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWAsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJCh0aGlzKSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWJvYXJkIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkS2V5SGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLm9mZigna2V5ZG93bi56Zi50YWJzJykub24oJ2tleWRvd24uemYudGFicycsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYgKGUud2hpY2ggPT09IDkpIHJldHVybjtcblxuXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykuY2hpbGRyZW4oJ2xpJyksXG4gICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLndyYXBPbktleXMpIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9IGkgPT09IDAgPyAkZWxlbWVudHMubGFzdCgpIDogJGVsZW1lbnRzLmVxKGktMSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSBpID09PSAkZWxlbWVudHMubGVuZ3RoIC0xID8gJGVsZW1lbnRzLmZpcnN0KCkgOiAkZWxlbWVudHMuZXEoaSsxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWF4KDAsIGktMSkpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdUYWJzJywge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkZWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJHByZXZFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRuZXh0RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuIENvbGxhcHNlcyBhY3RpdmUgdGFiLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBvcGVuLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZpcmVzIFRhYnMjY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCkge1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGFjdGl2ZSBjbGFzcyBvbiB0YXJnZXQuIENvbGxhcHNlIGlmIGV4aXN0cy5cbiAgICAgKi9cbiAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApKSB7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hY3RpdmVDb2xsYXBzZSkge1xuICAgICAgICAgICAgdGhpcy5fY29sbGFwc2VUYWIoJHRhcmdldCk7XG5cbiAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjb2xsYXBzZWQgdGFicy5cbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjY29sbGFwc2VcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NvbGxhcHNlLnpmLnRhYnMnLCBbJHRhcmdldF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgJG9sZFRhYiA9IHRoaXMuJGVsZW1lbnQuXG4gICAgICAgICAgZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc30uJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApLFxuICAgICAgICAgICR0YWJMaW5rID0gJHRhcmdldC5maW5kKCdbcm9sZT1cInRhYlwiXScpLFxuICAgICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpO1xuXG4gICAgLy9jbG9zZSBvbGQgdGFiXG4gICAgdGhpcy5fY29sbGFwc2VUYWIoJG9sZFRhYik7XG5cbiAgICAvL29wZW4gbmV3IHRhYlxuICAgIHRoaXMuX29wZW5UYWIoJHRhcmdldCk7XG5cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rICYmICFoaXN0b3J5SGFuZGxlZCkge1xuICAgICAgdmFyIGFuY2hvciA9ICR0YXJnZXQuZmluZCgnYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGRhdGVIaXN0b3J5KSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkIHRhYnMuXG4gICAgICogQGV2ZW50IFRhYnMjY2hhbmdlXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UuemYudGFicycsIFskdGFyZ2V0LCAkdGFyZ2V0Q29udGVudF0pO1xuXG4gICAgLy9maXJlIHRvIGNoaWxkcmVuIGEgbXV0YXRpb24gZXZlbnRcbiAgICAkdGFyZ2V0Q29udGVudC5maW5kKFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX29wZW5UYWIoJHRhcmdldCkge1xuICAgICAgdmFyICR0YWJMaW5rID0gJHRhcmdldC5maW5kKCdbcm9sZT1cInRhYlwiXScpLFxuICAgICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpO1xuXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCk7XG5cbiAgICAgICR0YWJMaW5rLmF0dHIoeydhcmlhLXNlbGVjdGVkJzogJ3RydWUnfSk7XG5cbiAgICAgICR0YXJnZXRDb250ZW50XG4gICAgICAgIC5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKVxuICAgICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ30pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBPcGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9jb2xsYXBzZVRhYigkdGFyZ2V0KSB7XG4gICAgdmFyICR0YXJnZXRfYW5jaG9yID0gJHRhcmdldFxuICAgICAgLnJlbW92ZUNsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5maW5kKCdbcm9sZT1cInRhYlwiXScpXG4gICAgICAuYXR0cih7ICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJyB9KTtcblxuICAgICQoYCMkeyR0YXJnZXRfYW5jaG9yLmF0dHIoJ2FyaWEtY29udHJvbHMnKX1gKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAuYXR0cih7ICdhcmlhLWhpZGRlbic6ICd0cnVlJyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaWMgbWV0aG9kIGZvciBzZWxlY3RpbmcgYSBjb250ZW50IHBhbmUgdG8gZGlzcGxheS5cbiAgICogQHBhcmFtIHtqUXVlcnkgfCBTdHJpbmd9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IG9yIHN0cmluZyBvZiB0aGUgaWQgb2YgdGhlIHBhbmUgdG8gZGlzcGxheS5cbiAgICogQHBhcmFtIHtib29sZWFufSBoaXN0b3J5SGFuZGxlZCAtIGJyb3dzZXIgaGFzIGFscmVhZHkgaGFuZGxlZCBhIGhpc3RvcnkgdXBkYXRlXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgc2VsZWN0VGFiKGVsZW0sIGhpc3RvcnlIYW5kbGVkKSB7XG4gICAgdmFyIGlkU3RyO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWRTdHIgPSBlbGVtWzBdLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZFN0ciA9IGVsZW07XG4gICAgfVxuXG4gICAgaWYgKGlkU3RyLmluZGV4T2YoJyMnKSA8IDApIHtcbiAgICAgIGlkU3RyID0gYCMke2lkU3RyfWA7XG4gICAgfVxuXG4gICAgdmFyICR0YXJnZXQgPSB0aGlzLiR0YWJUaXRsZXMuZmluZChgW2hyZWYkPVwiJHtpZFN0cn1cIl1gKS5wYXJlbnQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG5cbiAgICB0aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCwgaGlzdG9yeUhhbmRsZWQpO1xuICB9O1xuICAvKipcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIGVhY2ggcGFuZWwgdG8gdGhlIGhlaWdodCBvZiB0aGUgdGFsbGVzdCBwYW5lbC5cbiAgICogSWYgZW5hYmxlZCBpbiBvcHRpb25zLCBnZXRzIGNhbGxlZCBvbiBtZWRpYSBxdWVyeSBjaGFuZ2UuXG4gICAqIElmIGxvYWRpbmcgY29udGVudCB2aWEgZXh0ZXJuYWwgc291cmNlLCBjYW4gYmUgY2FsbGVkIGRpcmVjdGx5IG9yIHdpdGggX3JlZmxvdy5cbiAgICogSWYgZW5hYmxlZCB3aXRoIGBkYXRhLW1hdGNoLWhlaWdodD1cInRydWVcImAsIHRhYnMgc2V0cyB0byBlcXVhbCBoZWlnaHRcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0SGVpZ2h0KCkge1xuICAgIHZhciBtYXggPSAwLFxuICAgICAgICBfdGhpcyA9IHRoaXM7IC8vIExvY2sgZG93biB0aGUgYHRoaXNgIHZhbHVlIGZvciB0aGUgcm9vdCB0YWJzIG9iamVjdFxuXG4gICAgdGhpcy4kdGFiQ29udGVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyksXG4gICAgICAgICAgICBpc0FjdGl2ZSA9IHBhbmVsLmhhc0NsYXNzKGAke190aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKTsgLy8gZ2V0IHRoZSBvcHRpb25zIGZyb20gdGhlIHBhcmVudCBpbnN0ZWFkIG9mIHRyeWluZyB0byBnZXQgdGhlbSBmcm9tIHRoZSBjaGlsZFxuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moeyd2aXNpYmlsaXR5JzogJ2hpZGRlbicsICdkaXNwbGF5JzogJ2Jsb2NrJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHtcbiAgICAgICAgICAgICd2aXNpYmlsaXR5JzogJycsXG4gICAgICAgICAgICAnZGlzcGxheSc6ICcnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXggPSB0ZW1wID4gbWF4ID8gdGVtcCA6IG1heDtcbiAgICAgIH0pXG4gICAgICAuY3NzKCdoZWlnaHQnLCBgJHttYXh9cHhgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiB0YWJzLlxuICAgKiBAZmlyZXMgVGFicyNkZXN0cm95ZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YClcbiAgICAgIC5vZmYoJy56Zi50YWJzJykuaGlkZSgpLmVuZCgpXG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5oaWRlKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICBpZiAodGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyICE9IG51bGwpIHtcbiAgICAgICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuVGFicy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgdGFiIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gdGFiXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgYWN0aXZlIHBhbmUgb24gbG9hZCBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogTm90IHJlY29tbWVuZGVkIGlmIG1vcmUgdGhhbiBvbmUgdGFiIHBhbmVsIHBlciBwYWdlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGtleWJvYXJkIGlucHV0IHRvICd3cmFwJyBhcm91bmQgdGhlIHRhYiBsaW5rcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgd3JhcE9uS2V5czogdHJ1ZSxcblxuICAvKipcbiAgICogQWxsb3dzIHRoZSB0YWIgY29udGVudCBwYW5lcyB0byBtYXRjaCBoZWlnaHRzIGlmIHNldCB0byB0cnVlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbWF0Y2hIZWlnaHQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgYWN0aXZlIHRhYnMgdG8gY29sbGFwc2Ugd2hlbiBjbGlja2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYWN0aXZlQ29sbGFwc2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIGBsaWAncyBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXRpdGxlJ1xuICAgKi9cbiAgbGlua0NsYXNzOiAndGFicy10aXRsZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBgbGlgIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIGxpbmtBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQgY29udGFpbmVycy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndGFicy1wYW5lbCdcbiAgICovXG4gIHBhbmVsQ2xhc3M6ICd0YWJzLXBhbmVsJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGNvbnRlbnQgY29udGFpbmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdpcy1hY3RpdmUnXG4gICAqL1xuICBwYW5lbEFjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJ1xufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFRhYnMsICdUYWJzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsInZhciBfZXh0ZW5kcz1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihhKXtmb3IodmFyIGI9MTtiPGFyZ3VtZW50cy5sZW5ndGg7YisrKXt2YXIgYz1hcmd1bWVudHNbYl07Zm9yKHZhciBkIGluIGMpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGMsZCkmJihhW2RdPWNbZF0pfXJldHVybiBhfSxfdHlwZW9mPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbihhKXtyZXR1cm4gdHlwZW9mIGF9OmZ1bmN0aW9uKGEpe3JldHVybiBhJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJmEuY29uc3RydWN0b3I9PT1TeW1ib2wmJmEhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIGF9OyFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PT0oXCJ1bmRlZmluZWRcIj09dHlwZW9mIGV4cG9ydHM/XCJ1bmRlZmluZWRcIjpfdHlwZW9mKGV4cG9ydHMpKSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShiKTphLkxhenlMb2FkPWIoKX0odGhpcyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBhPXtlbGVtZW50c19zZWxlY3RvcjpcImltZ1wiLGNvbnRhaW5lcjp3aW5kb3csdGhyZXNob2xkOjMwMCx0aHJvdHRsZToxNTAsZGF0YV9zcmM6XCJvcmlnaW5hbFwiLGRhdGFfc3Jjc2V0Olwib3JpZ2luYWwtc2V0XCIsY2xhc3NfbG9hZGluZzpcImxvYWRpbmdcIixjbGFzc19sb2FkZWQ6XCJsb2FkZWRcIixjbGFzc19lcnJvcjpcImVycm9yXCIsY2xhc3NfaW5pdGlhbDpcImluaXRpYWxcIixza2lwX2ludmlzaWJsZTohMCxjYWxsYmFja19sb2FkOm51bGwsY2FsbGJhY2tfZXJyb3I6bnVsbCxjYWxsYmFja19zZXQ6bnVsbCxjYWxsYmFja19wcm9jZXNzZWQ6bnVsbH0sYj0hKFwib25zY3JvbGxcImluIHdpbmRvdyl8fC9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksYz1mdW5jdGlvbihhLGIpe2EmJmEoYil9LGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wK3dpbmRvdy5wYWdlWU9mZnNldC1hLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcH0sZT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuKGI9PT13aW5kb3c/d2luZG93LmlubmVySGVpZ2h0K3dpbmRvdy5wYWdlWU9mZnNldDpkKGIpK2Iub2Zmc2V0SGVpZ2h0KTw9ZChhKS1jfSxmPWZ1bmN0aW9uKGEpe3JldHVybiBhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQrd2luZG93LnBhZ2VYT2Zmc2V0LWEub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50TGVmdH0sZz1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9d2luZG93LmlubmVyV2lkdGg7cmV0dXJuKGI9PT13aW5kb3c/ZCt3aW5kb3cucGFnZVhPZmZzZXQ6ZihiKStkKTw9ZihhKS1jfSxoPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4oYj09PXdpbmRvdz93aW5kb3cucGFnZVlPZmZzZXQ6ZChiKSk+PWQoYSkrYythLm9mZnNldEhlaWdodH0saT1mdW5jdGlvbihhLGIsYyl7cmV0dXJuKGI9PT13aW5kb3c/d2luZG93LnBhZ2VYT2Zmc2V0OmYoYikpPj1mKGEpK2MrYS5vZmZzZXRXaWR0aH0saj1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIShlKGEsYixjKXx8aChhLGIsYyl8fGcoYSxiLGMpfHxpKGEsYixjKSl9LGs9ZnVuY3Rpb24oYSxiKXt2YXIgYz1uZXcgYShiKSxkPW5ldyBDdXN0b21FdmVudChcIkxhenlMb2FkOjpJbml0aWFsaXplZFwiLHtkZXRhaWw6e2luc3RhbmNlOmN9fSk7d2luZG93LmRpc3BhdGNoRXZlbnQoZCl9LGw9ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLnBhcmVudEVsZW1lbnQ7aWYoXCJQSUNUVVJFXCI9PT1jLnRhZ05hbWUpZm9yKHZhciBkPTA7ZDxjLmNoaWxkcmVuLmxlbmd0aDtkKyspe3ZhciBlPWMuY2hpbGRyZW5bZF07aWYoXCJTT1VSQ0VcIj09PWUudGFnTmFtZSl7dmFyIGY9ZS5kYXRhc2V0W2JdO2YmJmUuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsZil9fX0sbT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS50YWdOYW1lLGU9YS5kYXRhc2V0W2NdO2lmKFwiSU1HXCI9PT1kKXtsKGEsYik7dmFyIGY9YS5kYXRhc2V0W2JdO3JldHVybiBmJiZhLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGYpLHZvaWQoZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNcIixlKSl9aWYoXCJJRlJBTUVcIj09PWQpcmV0dXJuIHZvaWQoZSYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNcIixlKSk7ZSYmKGEuc3R5bGUuYmFja2dyb3VuZEltYWdlPVwidXJsKFwiK2UrXCIpXCIpfSxuPWZ1bmN0aW9uKGIpe3RoaXMuX3NldHRpbmdzPV9leHRlbmRzKHt9LGEsYiksdGhpcy5fcXVlcnlPcmlnaW5Ob2RlPXRoaXMuX3NldHRpbmdzLmNvbnRhaW5lcj09PXdpbmRvdz9kb2N1bWVudDp0aGlzLl9zZXR0aW5ncy5jb250YWluZXIsdGhpcy5fcHJldmlvdXNMb29wVGltZT0wLHRoaXMuX2xvb3BUaW1lb3V0PW51bGwsdGhpcy5fYm91bmRIYW5kbGVTY3JvbGw9dGhpcy5oYW5kbGVTY3JvbGwuYmluZCh0aGlzKSx0aGlzLl9pc0ZpcnN0TG9vcD0hMCx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKSx0aGlzLnVwZGF0ZSgpfTtuLnByb3RvdHlwZT17X3JldmVhbDpmdW5jdGlvbihhKXt2YXIgYj10aGlzLl9zZXR0aW5ncyxkPWZ1bmN0aW9uIGQoKXtiJiYoYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLGUpLGEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsZCksYS5jbGFzc0xpc3QucmVtb3ZlKGIuY2xhc3NfbG9hZGluZyksYS5jbGFzc0xpc3QuYWRkKGIuY2xhc3NfZXJyb3IpLGMoYi5jYWxsYmFja19lcnJvcixhKSl9LGU9ZnVuY3Rpb24gZSgpe2ImJihhLmNsYXNzTGlzdC5yZW1vdmUoYi5jbGFzc19sb2FkaW5nKSxhLmNsYXNzTGlzdC5hZGQoYi5jbGFzc19sb2FkZWQpLGEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIixlKSxhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGQpLGMoYi5jYWxsYmFja19sb2FkLGEpKX07XCJJTUdcIiE9PWEudGFnTmFtZSYmXCJJRlJBTUVcIiE9PWEudGFnTmFtZXx8KGEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixlKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGQpLGEuY2xhc3NMaXN0LmFkZChiLmNsYXNzX2xvYWRpbmcpKSxtKGEsYi5kYXRhX3NyY3NldCxiLmRhdGFfc3JjKSxjKGIuY2FsbGJhY2tfc2V0LGEpfSxfbG9vcFRocm91Z2hFbGVtZW50czpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX3NldHRpbmdzLGQ9dGhpcy5fZWxlbWVudHMsZT1kP2QubGVuZ3RoOjAsZj12b2lkIDAsZz1bXSxoPXRoaXMuX2lzRmlyc3RMb29wO2ZvcihmPTA7ZjxlO2YrKyl7dmFyIGk9ZFtmXTthLnNraXBfaW52aXNpYmxlJiZudWxsPT09aS5vZmZzZXRQYXJlbnR8fChifHxqKGksYS5jb250YWluZXIsYS50aHJlc2hvbGQpKSYmKGgmJmkuY2xhc3NMaXN0LmFkZChhLmNsYXNzX2luaXRpYWwpLHRoaXMuX3JldmVhbChpKSxnLnB1c2goZiksaS5kYXRhc2V0Lndhc1Byb2Nlc3NlZD0hMCl9Zm9yKDtnLmxlbmd0aD4wOylkLnNwbGljZShnLnBvcCgpLDEpLGMoYS5jYWxsYmFja19wcm9jZXNzZWQsZC5sZW5ndGgpOzA9PT1lJiZ0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpLGgmJih0aGlzLl9pc0ZpcnN0TG9vcD0hMSl9LF9wdXJnZUVsZW1lbnRzOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fZWxlbWVudHMsYj1hLmxlbmd0aCxjPXZvaWQgMCxkPVtdO2ZvcihjPTA7YzxiO2MrKyl7YVtjXS5kYXRhc2V0Lndhc1Byb2Nlc3NlZCYmZC5wdXNoKGMpfWZvcig7ZC5sZW5ndGg+MDspYS5zcGxpY2UoZC5wb3AoKSwxKX0sX3N0YXJ0U2Nyb2xsSGFuZGxlcjpmdW5jdGlvbigpe3RoaXMuX2lzSGFuZGxpbmdTY3JvbGx8fCh0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsPSEwLHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpKX0sX3N0b3BTY3JvbGxIYW5kbGVyOmZ1bmN0aW9uKCl7dGhpcy5faXNIYW5kbGluZ1Njcm9sbCYmKHRoaXMuX2lzSGFuZGxpbmdTY3JvbGw9ITEsdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCkpfSxoYW5kbGVTY3JvbGw6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLGI9dGhpcy5fc2V0dGluZ3MudGhyb3R0bGU7MCE9PWI/ZnVuY3Rpb24oKXt2YXIgYz1mdW5jdGlvbigpeyhuZXcgRGF0ZSkuZ2V0VGltZSgpfSxkPWMoKSxlPWItKGQtYS5fcHJldmlvdXNMb29wVGltZSk7ZTw9MHx8ZT5iPyhhLl9sb29wVGltZW91dCYmKGNsZWFyVGltZW91dChhLl9sb29wVGltZW91dCksYS5fbG9vcFRpbWVvdXQ9bnVsbCksYS5fcHJldmlvdXNMb29wVGltZT1kLGEuX2xvb3BUaHJvdWdoRWxlbWVudHMoKSk6YS5fbG9vcFRpbWVvdXR8fChhLl9sb29wVGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5fcHJldmlvdXNMb29wVGltZT1jKCksdGhpcy5fbG9vcFRpbWVvdXQ9bnVsbCx0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCl9LmJpbmQoYSksZSkpfSgpOnRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKX0sdXBkYXRlOmZ1bmN0aW9uKCl7dGhpcy5fZWxlbWVudHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fcXVlcnlPcmlnaW5Ob2RlLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fc2V0dGluZ3MuZWxlbWVudHNfc2VsZWN0b3IpKSx0aGlzLl9wdXJnZUVsZW1lbnRzKCksdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpLHRoaXMuX3N0YXJ0U2Nyb2xsSGFuZGxlcigpfSxkZXN0cm95OmZ1bmN0aW9uKCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCksdGhpcy5fbG9vcFRpbWVvdXQmJihjbGVhclRpbWVvdXQodGhpcy5fbG9vcFRpbWVvdXQpLHRoaXMuX2xvb3BUaW1lb3V0PW51bGwpLHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCksdGhpcy5fZWxlbWVudHM9bnVsbCx0aGlzLl9xdWVyeU9yaWdpbk5vZGU9bnVsbCx0aGlzLl9zZXR0aW5ncz1udWxsfX07dmFyIG89d2luZG93LmxhenlMb2FkT3B0aW9ucztyZXR1cm4gbyYmZnVuY3Rpb24oYSxiKXt2YXIgYz1iLmxlbmd0aDtpZihjKWZvcih2YXIgZD0wO2Q8YztkKyspayhhLGJbZF0pO2Vsc2UgayhhLGIpfShuLG8pLG59KTsiLCIvKiFcbiAqIEZsaWNraXR5IFBBQ0tBR0VEIHYyLjAuNVxuICogVG91Y2gsIHJlc3BvbnNpdmUsIGZsaWNrYWJsZSBjYXJvdXNlbHNcbiAqXG4gKiBMaWNlbnNlZCBHUEx2MyBmb3Igb3BlbiBzb3VyY2UgdXNlXG4gKiBvciBGbGlja2l0eSBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cDovL2ZsaWNraXR5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTYgTWV0YWZpenp5XG4gKi9cblxuIWZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImpxdWVyeS1icmlkZ2V0L2pxdWVyeS1icmlkZ2V0XCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImpxdWVyeVwiKSk6dC5qUXVlcnlCcmlkZ2V0PWUodCx0LmpRdWVyeSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGkoaSxvLGEpe2Z1bmN0aW9uIGwodCxlLG4pe3ZhciBzLG89XCIkKCkuXCIraSsnKFwiJytlKydcIiknO3JldHVybiB0LmVhY2goZnVuY3Rpb24odCxsKXt2YXIgaD1hLmRhdGEobCxpKTtpZighaClyZXR1cm4gdm9pZCByKGkrXCIgbm90IGluaXRpYWxpemVkLiBDYW5ub3QgY2FsbCBtZXRob2RzLCBpLmUuIFwiK28pO3ZhciBjPWhbZV07aWYoIWN8fFwiX1wiPT1lLmNoYXJBdCgwKSlyZXR1cm4gdm9pZCByKG8rXCIgaXMgbm90IGEgdmFsaWQgbWV0aG9kXCIpO3ZhciBkPWMuYXBwbHkoaCxuKTtzPXZvaWQgMD09PXM/ZDpzfSksdm9pZCAwIT09cz9zOnR9ZnVuY3Rpb24gaCh0LGUpe3QuZWFjaChmdW5jdGlvbih0LG4pe3ZhciBzPWEuZGF0YShuLGkpO3M/KHMub3B0aW9uKGUpLHMuX2luaXQoKSk6KHM9bmV3IG8obixlKSxhLmRhdGEobixpLHMpKX0pfWE9YXx8ZXx8dC5qUXVlcnksYSYmKG8ucHJvdG90eXBlLm9wdGlvbnx8KG8ucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbih0KXthLmlzUGxhaW5PYmplY3QodCkmJih0aGlzLm9wdGlvbnM9YS5leHRlbmQoITAsdGhpcy5vcHRpb25zLHQpKX0pLGEuZm5baV09ZnVuY3Rpb24odCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpe3ZhciBlPXMuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGwodGhpcyx0LGUpfXJldHVybiBoKHRoaXMsdCksdGhpc30sbihhKSl9ZnVuY3Rpb24gbih0KXshdHx8dCYmdC5icmlkZ2V0fHwodC5icmlkZ2V0PWkpfXZhciBzPUFycmF5LnByb3RvdHlwZS5zbGljZSxvPXQuY29uc29sZSxyPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBvP2Z1bmN0aW9uKCl7fTpmdW5jdGlvbih0KXtvLmVycm9yKHQpfTtyZXR1cm4gbihlfHx0LmpRdWVyeSksaX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LkV2RW1pdHRlcj1lKCl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7fXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLm9uPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dmFyIGk9dGhpcy5fZXZlbnRzPXRoaXMuX2V2ZW50c3x8e30sbj1pW3RdPWlbdF18fFtdO3JldHVybiBuLmluZGV4T2YoZSk9PS0xJiZuLnB1c2goZSksdGhpc319LGUub25jZT1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3RoaXMub24odCxlKTt2YXIgaT10aGlzLl9vbmNlRXZlbnRzPXRoaXMuX29uY2VFdmVudHN8fHt9LG49aVt0XT1pW3RdfHx7fTtyZXR1cm4gbltlXT0hMCx0aGlzfX0sZS5vZmY9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49aS5pbmRleE9mKGUpO3JldHVybiBuIT0tMSYmaS5zcGxpY2UobiwxKSx0aGlzfX0sZS5lbWl0RXZlbnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49MCxzPWlbbl07ZT1lfHxbXTtmb3IodmFyIG89dGhpcy5fb25jZUV2ZW50cyYmdGhpcy5fb25jZUV2ZW50c1t0XTtzOyl7dmFyIHI9byYmb1tzXTtyJiYodGhpcy5vZmYodCxzKSxkZWxldGUgb1tzXSkscy5hcHBseSh0aGlzLGUpLG4rPXI/MDoxLHM9aVtuXX1yZXR1cm4gdGhpc319LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFtdLGZ1bmN0aW9uKCl7cmV0dXJuIGUoKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LmdldFNpemU9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3ZhciBlPXBhcnNlRmxvYXQodCksaT10LmluZGV4T2YoXCIlXCIpPT0tMSYmIWlzTmFOKGUpO3JldHVybiBpJiZlfWZ1bmN0aW9uIGUoKXt9ZnVuY3Rpb24gaSgpe2Zvcih2YXIgdD17d2lkdGg6MCxoZWlnaHQ6MCxpbm5lcldpZHRoOjAsaW5uZXJIZWlnaHQ6MCxvdXRlcldpZHRoOjAsb3V0ZXJIZWlnaHQ6MH0sZT0wO2U8aDtlKyspe3ZhciBpPWxbZV07dFtpXT0wfXJldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtyZXR1cm4gZXx8YShcIlN0eWxlIHJldHVybmVkIFwiK2UrXCIuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/IFNlZSBodHRwOi8vYml0Lmx5L2dldHNpemVidWcxXCIpLGV9ZnVuY3Rpb24gcygpe2lmKCFjKXtjPSEwO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5zdHlsZS53aWR0aD1cIjIwMHB4XCIsZS5zdHlsZS5wYWRkaW5nPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3JkZXJTdHlsZT1cInNvbGlkXCIsZS5zdHlsZS5ib3JkZXJXaWR0aD1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm94U2l6aW5nPVwiYm9yZGVyLWJveFwiO3ZhciBpPWRvY3VtZW50LmJvZHl8fGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtpLmFwcGVuZENoaWxkKGUpO3ZhciBzPW4oZSk7by5pc0JveFNpemVPdXRlcj1yPTIwMD09dChzLndpZHRoKSxpLnJlbW92ZUNoaWxkKGUpfX1mdW5jdGlvbiBvKGUpe2lmKHMoKSxcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlKSksZSYmXCJvYmplY3RcIj09dHlwZW9mIGUmJmUubm9kZVR5cGUpe3ZhciBvPW4oZSk7aWYoXCJub25lXCI9PW8uZGlzcGxheSlyZXR1cm4gaSgpO3ZhciBhPXt9O2Eud2lkdGg9ZS5vZmZzZXRXaWR0aCxhLmhlaWdodD1lLm9mZnNldEhlaWdodDtmb3IodmFyIGM9YS5pc0JvcmRlckJveD1cImJvcmRlci1ib3hcIj09by5ib3hTaXppbmcsZD0wO2Q8aDtkKyspe3ZhciB1PWxbZF0sZj1vW3VdLHA9cGFyc2VGbG9hdChmKTthW3VdPWlzTmFOKHApPzA6cH12YXIgdj1hLnBhZGRpbmdMZWZ0K2EucGFkZGluZ1JpZ2h0LGc9YS5wYWRkaW5nVG9wK2EucGFkZGluZ0JvdHRvbSxtPWEubWFyZ2luTGVmdCthLm1hcmdpblJpZ2h0LHk9YS5tYXJnaW5Ub3ArYS5tYXJnaW5Cb3R0b20sUz1hLmJvcmRlckxlZnRXaWR0aCthLmJvcmRlclJpZ2h0V2lkdGgsRT1hLmJvcmRlclRvcFdpZHRoK2EuYm9yZGVyQm90dG9tV2lkdGgsYj1jJiZyLHg9dChvLndpZHRoKTt4IT09ITEmJihhLndpZHRoPXgrKGI/MDp2K1MpKTt2YXIgQz10KG8uaGVpZ2h0KTtyZXR1cm4gQyE9PSExJiYoYS5oZWlnaHQ9QysoYj8wOmcrRSkpLGEuaW5uZXJXaWR0aD1hLndpZHRoLSh2K1MpLGEuaW5uZXJIZWlnaHQ9YS5oZWlnaHQtKGcrRSksYS5vdXRlcldpZHRoPWEud2lkdGgrbSxhLm91dGVySGVpZ2h0PWEuaGVpZ2h0K3ksYX19dmFyIHIsYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgY29uc29sZT9lOmZ1bmN0aW9uKHQpe2NvbnNvbGUuZXJyb3IodCl9LGw9W1wicGFkZGluZ0xlZnRcIixcInBhZGRpbmdSaWdodFwiLFwicGFkZGluZ1RvcFwiLFwicGFkZGluZ0JvdHRvbVwiLFwibWFyZ2luTGVmdFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpblRvcFwiLFwibWFyZ2luQm90dG9tXCIsXCJib3JkZXJMZWZ0V2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiXSxoPWwubGVuZ3RoLGM9ITE7cmV0dXJuIG99KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5tYXRjaGVzU2VsZWN0b3I9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbigpe3ZhciB0PUVsZW1lbnQucHJvdG90eXBlO2lmKHQubWF0Y2hlcylyZXR1cm5cIm1hdGNoZXNcIjtpZih0Lm1hdGNoZXNTZWxlY3RvcilyZXR1cm5cIm1hdGNoZXNTZWxlY3RvclwiO2Zvcih2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl0saT0wO2k8ZS5sZW5ndGg7aSsrKXt2YXIgbj1lW2ldLHM9bitcIk1hdGNoZXNTZWxlY3RvclwiO2lmKHRbc10pcmV0dXJuIHN9fSgpO3JldHVybiBmdW5jdGlvbihlLGkpe3JldHVybiBlW3RdKGkpfX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsW1wiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3JcIikpOnQuZml6enlVSVV0aWxzPWUodCx0Lm1hdGNoZXNTZWxlY3Rvcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXt9O2kuZXh0ZW5kPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fSxpLm1vZHVsbz1mdW5jdGlvbih0LGUpe3JldHVybih0JWUrZSklZX0saS5tYWtlQXJyYXk9ZnVuY3Rpb24odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZih0JiZcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfSxpLnJlbW92ZUZyb209ZnVuY3Rpb24odCxlKXt2YXIgaT10LmluZGV4T2YoZSk7aSE9LTEmJnQuc3BsaWNlKGksMSl9LGkuZ2V0UGFyZW50PWZ1bmN0aW9uKHQsaSl7Zm9yKDt0IT1kb2N1bWVudC5ib2R5OylpZih0PXQucGFyZW50Tm9kZSxlKHQsaSkpcmV0dXJuIHR9LGkuZ2V0UXVlcnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCk6dH0saS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LGkuZmlsdGVyRmluZEVsZW1lbnRzPWZ1bmN0aW9uKHQsbil7dD1pLm1ha2VBcnJheSh0KTt2YXIgcz1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2lmKHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7aWYoIW4pcmV0dXJuIHZvaWQgcy5wdXNoKHQpO2UodCxuKSYmcy5wdXNoKHQpO2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwobiksbz0wO288aS5sZW5ndGg7bysrKXMucHVzaChpW29dKX19KSxzfSxpLmRlYm91bmNlTWV0aG9kPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj10LnByb3RvdHlwZVtlXSxzPWUrXCJUaW1lb3V0XCI7dC5wcm90b3R5cGVbZV09ZnVuY3Rpb24oKXt2YXIgdD10aGlzW3NdO3QmJmNsZWFyVGltZW91dCh0KTt2YXIgZT1hcmd1bWVudHMsbz10aGlzO3RoaXNbc109c2V0VGltZW91dChmdW5jdGlvbigpe24uYXBwbHkobyxlKSxkZWxldGUgb1tzXX0saXx8MTAwKX19LGkuZG9jUmVhZHk9ZnVuY3Rpb24odCl7dmFyIGU9ZG9jdW1lbnQucmVhZHlTdGF0ZTtcImNvbXBsZXRlXCI9PWV8fFwiaW50ZXJhY3RpdmVcIj09ZT9zZXRUaW1lb3V0KHQpOmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsdCl9LGkudG9EYXNoZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQucmVwbGFjZSgvKC4pKFtBLVpdKS9nLGZ1bmN0aW9uKHQsZSxpKXtyZXR1cm4gZStcIi1cIitpfSkudG9Mb3dlckNhc2UoKX07dmFyIG49dC5jb25zb2xlO3JldHVybiBpLmh0bWxJbml0PWZ1bmN0aW9uKGUscyl7aS5kb2NSZWFkeShmdW5jdGlvbigpe3ZhciBvPWkudG9EYXNoZWQocykscj1cImRhdGEtXCIrbyxhPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbXCIrcitcIl1cIiksbD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLVwiK28pLGg9aS5tYWtlQXJyYXkoYSkuY29uY2F0KGkubWFrZUFycmF5KGwpKSxjPXIrXCItb3B0aW9uc1wiLGQ9dC5qUXVlcnk7aC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpLG89dC5nZXRBdHRyaWJ1dGUocil8fHQuZ2V0QXR0cmlidXRlKGMpO3RyeXtpPW8mJkpTT04ucGFyc2Uobyl9Y2F0Y2goYSl7cmV0dXJuIHZvaWQobiYmbi5lcnJvcihcIkVycm9yIHBhcnNpbmcgXCIrcitcIiBvbiBcIit0LmNsYXNzTmFtZStcIjogXCIrYSkpfXZhciBsPW5ldyBlKHQsaSk7ZCYmZC5kYXRhKHQscyxsKX0pfSl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9jZWxsXCIsW1wiZ2V0LXNpemUvZ2V0LXNpemVcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZ2V0LXNpemVcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuQ2VsbD1lKHQsdC5nZXRTaXplKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXt0aGlzLmVsZW1lbnQ9dCx0aGlzLnBhcmVudD1lLHRoaXMuY3JlYXRlKCl9dmFyIG49aS5wcm90b3R5cGU7cmV0dXJuIG4uY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIix0aGlzLng9MCx0aGlzLnNoaWZ0PTB9LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cIlwiO3ZhciB0PXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW3RdPVwiXCJ9LG4uZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1lKHRoaXMuZWxlbWVudCl9LG4uc2V0UG9zaXRpb249ZnVuY3Rpb24odCl7dGhpcy54PXQsdGhpcy51cGRhdGVUYXJnZXQoKSx0aGlzLnJlbmRlclBvc2l0aW9uKHQpfSxuLnVwZGF0ZVRhcmdldD1uLnNldERlZmF1bHRUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD1cImxlZnRcIj09dGhpcy5wYXJlbnQub3JpZ2luU2lkZT9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuc2l6ZVt0XSt0aGlzLnNpemUud2lkdGgqdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxuLnJlbmRlclBvc2l0aW9uPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW2VdPXRoaXMucGFyZW50LmdldFBvc2l0aW9uVmFsdWUodCl9LG4ud3JhcFNoaWZ0PWZ1bmN0aW9uKHQpe3RoaXMuc2hpZnQ9dCx0aGlzLnJlbmRlclBvc2l0aW9uKHRoaXMueCt0aGlzLnBhcmVudC5zbGlkZWFibGVXaWR0aCp0KX0sbi5yZW1vdmU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvc2xpZGVcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5TbGlkZT1lKCkpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3RoaXMucGFyZW50PXQsdGhpcy5pc09yaWdpbkxlZnQ9XCJsZWZ0XCI9PXQub3JpZ2luU2lkZSx0aGlzLmNlbGxzPVtdLHRoaXMub3V0ZXJXaWR0aD0wLHRoaXMuaGVpZ2h0PTB9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUuYWRkQ2VsbD1mdW5jdGlvbih0KXtpZih0aGlzLmNlbGxzLnB1c2godCksdGhpcy5vdXRlcldpZHRoKz10LnNpemUub3V0ZXJXaWR0aCx0aGlzLmhlaWdodD1NYXRoLm1heCh0LnNpemUub3V0ZXJIZWlnaHQsdGhpcy5oZWlnaHQpLDE9PXRoaXMuY2VsbHMubGVuZ3RoKXt0aGlzLng9dC54O3ZhciBlPXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLmZpcnN0TWFyZ2luPXQuc2l6ZVtlXX19LGUudXBkYXRlVGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGU9dGhpcy5nZXRMYXN0Q2VsbCgpLGk9ZT9lLnNpemVbdF06MCxuPXRoaXMub3V0ZXJXaWR0aC0odGhpcy5maXJzdE1hcmdpbitpKTt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5maXJzdE1hcmdpbituKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sZS5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxlLnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcImFkZFwiKX0sZS51bnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKX0sZS5jaGFuZ2VTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmVsZW1lbnQuY2xhc3NMaXN0W3RdKFwiaXMtc2VsZWN0ZWRcIil9KX0sZS5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSx0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYW5pbWF0ZVwiLFtcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGU9ZSh0LHQuZml6enlVSVV0aWxzKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXQucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx0LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSxuPTA7aXx8KGk9ZnVuY3Rpb24odCl7dmFyIGU9KG5ldyBEYXRlKS5nZXRUaW1lKCksaT1NYXRoLm1heCgwLDE2LShlLW4pKSxzPXNldFRpbWVvdXQodCxpKTtyZXR1cm4gbj1lK2ksc30pO3ZhciBzPXt9O3Muc3RhcnRBbmltYXRpb249ZnVuY3Rpb24oKXt0aGlzLmlzQW5pbWF0aW5nfHwodGhpcy5pc0FuaW1hdGluZz0hMCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLmFuaW1hdGUoKSl9LHMuYW5pbWF0ZT1mdW5jdGlvbigpe3RoaXMuYXBwbHlEcmFnRm9yY2UoKSx0aGlzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uKCk7dmFyIHQ9dGhpcy54O2lmKHRoaXMuaW50ZWdyYXRlUGh5c2ljcygpLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLnNldHRsZSh0KSx0aGlzLmlzQW5pbWF0aW5nKXt2YXIgZT10aGlzO2koZnVuY3Rpb24oKXtlLmFuaW1hdGUoKX0pfX07dmFyIG89ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQudHJhbnNmb3JtP1widHJhbnNmb3JtXCI6XCJXZWJraXRUcmFuc2Zvcm1cIn0oKTtyZXR1cm4gcy5wb3NpdGlvblNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PXRoaXMueDt0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGg+MSYmKHQ9ZS5tb2R1bG8odCx0aGlzLnNsaWRlYWJsZVdpZHRoKSx0LT10aGlzLnNsaWRlYWJsZVdpZHRoLHRoaXMuc2hpZnRXcmFwQ2VsbHModCkpLHQrPXRoaXMuY3Vyc29yUG9zaXRpb24sdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJm8/LXQ6dDt2YXIgaT10aGlzLmdldFBvc2l0aW9uVmFsdWUodCk7dGhpcy5zbGlkZXIuc3R5bGVbb109dGhpcy5pc0FuaW1hdGluZz9cInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiOlwidHJhbnNsYXRlWChcIitpK1wiKVwiO3ZhciBuPXRoaXMuc2xpZGVzWzBdO2lmKG4pe3ZhciBzPS10aGlzLngtbi50YXJnZXQscj1zL3RoaXMuc2xpZGVzV2lkdGg7dGhpcy5kaXNwYXRjaEV2ZW50KFwic2Nyb2xsXCIsbnVsbCxbcixzXSl9fSxzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuY2VsbHMubGVuZ3RoJiYodGhpcy54PS10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0LHRoaXMucG9zaXRpb25TbGlkZXIoKSl9LHMuZ2V0UG9zaXRpb25WYWx1ZT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbj8uMDEqTWF0aC5yb3VuZCh0L3RoaXMuc2l6ZS5pbm5lcldpZHRoKjFlNCkrXCIlXCI6TWF0aC5yb3VuZCh0KStcInB4XCJ9LHMuc2V0dGxlPWZ1bmN0aW9uKHQpe3RoaXMuaXNQb2ludGVyRG93bnx8TWF0aC5yb3VuZCgxMDAqdGhpcy54KSE9TWF0aC5yb3VuZCgxMDAqdCl8fHRoaXMucmVzdGluZ0ZyYW1lcysrLHRoaXMucmVzdGluZ0ZyYW1lcz4yJiYodGhpcy5pc0FuaW1hdGluZz0hMSxkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmcsdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNldHRsZVwiKSl9LHMuc2hpZnRXcmFwQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5jdXJzb3JQb3NpdGlvbit0O3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzLGUsLTEpO3ZhciBpPXRoaXMuc2l6ZS5pbm5lcldpZHRoLSh0K3RoaXMuc2xpZGVhYmxlV2lkdGgrdGhpcy5jdXJzb3JQb3NpdGlvbik7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyxpLDEpfSxzLl9zaGlmdENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHM9dFtuXSxvPWU+MD9pOjA7cy53cmFwU2hpZnQobyksZS09cy5zaXplLm91dGVyV2lkdGh9fSxzLl91bnNoaWZ0Q2VsbHM9ZnVuY3Rpb24odCl7aWYodCYmdC5sZW5ndGgpZm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspdFtlXS53cmFwU2hpZnQoMCl9LHMuaW50ZWdyYXRlUGh5c2ljcz1mdW5jdGlvbigpe3RoaXMueCs9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5Kj10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCl9LHMuYXBwbHlGb3JjZT1mdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Kz10fSxzLmdldEZyaWN0aW9uRmFjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIDEtdGhpcy5vcHRpb25zW3RoaXMuaXNGcmVlU2Nyb2xsaW5nP1wiZnJlZVNjcm9sbEZyaWN0aW9uXCI6XCJmcmljdGlvblwiXX0scy5nZXRSZXN0aW5nUG9zaXRpb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy54K3RoaXMudmVsb2NpdHkvKDEtdGhpcy5nZXRGcmljdGlvbkZhY3RvcigpKX0scy5hcHBseURyYWdGb3JjZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNQb2ludGVyRG93bil7dmFyIHQ9dGhpcy5kcmFnWC10aGlzLngsZT10LXRoaXMudmVsb2NpdHk7dGhpcy5hcHBseUZvcmNlKGUpfX0scy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbj1mdW5jdGlvbigpe2lmKCF0aGlzLmlzUG9pbnRlckRvd24mJiF0aGlzLmlzRnJlZVNjcm9sbGluZyYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQqLTEtdGhpcy54LGU9dCp0aGlzLm9wdGlvbnMuc2VsZWN0ZWRBdHRyYWN0aW9uO3RoaXMuYXBwbHlGb3JjZShlKX19LHN9KSxmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoXCJmbGlja2l0eS9qcy9mbGlja2l0eVwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZ2V0LXNpemUvZ2V0LXNpemVcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2NlbGxcIixcIi4vc2xpZGVcIixcIi4vYW5pbWF0ZVwiXSxmdW5jdGlvbihpLG4scyxvLHIsYSl7cmV0dXJuIGUodCxpLG4scyxvLHIsYSl9KTtlbHNlIGlmKFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzKW1vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZ2V0LXNpemVcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2NlbGxcIikscmVxdWlyZShcIi4vc2xpZGVcIikscmVxdWlyZShcIi4vYW5pbWF0ZVwiKSk7ZWxzZXt2YXIgaT10LkZsaWNraXR5O3QuRmxpY2tpdHk9ZSh0LHQuRXZFbWl0dGVyLHQuZ2V0U2l6ZSx0LmZpenp5VUlVdGlscyxpLkNlbGwsaS5TbGlkZSxpLmFuaW1hdGVQcm90b3R5cGUpfX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4scyxvLHIpe2Z1bmN0aW9uIGEodCxlKXtmb3IodD1uLm1ha2VBcnJheSh0KTt0Lmxlbmd0aDspZS5hcHBlbmRDaGlsZCh0LnNoaWZ0KCkpfWZ1bmN0aW9uIGwodCxlKXt2YXIgaT1uLmdldFF1ZXJ5RWxlbWVudCh0KTtpZighaSlyZXR1cm4gdm9pZChkJiZkLmVycm9yKFwiQmFkIGVsZW1lbnQgZm9yIEZsaWNraXR5OiBcIisoaXx8dCkpKTtpZih0aGlzLmVsZW1lbnQ9aSx0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEKXt2YXIgcz1mW3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSURdO3JldHVybiBzLm9wdGlvbihlKSxzfWgmJih0aGlzLiRlbGVtZW50PWgodGhpcy5lbGVtZW50KSksdGhpcy5vcHRpb25zPW4uZXh0ZW5kKHt9LHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMpLHRoaXMub3B0aW9uKGUpLHRoaXMuX2NyZWF0ZSgpfXZhciBoPXQualF1ZXJ5LGM9dC5nZXRDb21wdXRlZFN0eWxlLGQ9dC5jb25zb2xlLHU9MCxmPXt9O2wuZGVmYXVsdHM9e2FjY2Vzc2liaWxpdHk6ITAsY2VsbEFsaWduOlwiY2VudGVyXCIsZnJlZVNjcm9sbEZyaWN0aW9uOi4wNzUsZnJpY3Rpb246LjI4LG5hbWVzcGFjZUpRdWVyeUV2ZW50czohMCxwZXJjZW50UG9zaXRpb246ITAscmVzaXplOiEwLHNlbGVjdGVkQXR0cmFjdGlvbjouMDI1LHNldEdhbGxlcnlTaXplOiEwfSxsLmNyZWF0ZU1ldGhvZHM9W107dmFyIHA9bC5wcm90b3R5cGU7bi5leHRlbmQocCxlLnByb3RvdHlwZSkscC5fY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5ndWlkPSsrdTt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEPWUsZltlXT10aGlzLHRoaXMuc2VsZWN0ZWRJbmRleD0wLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMueD0wLHRoaXMudmVsb2NpdHk9MCx0aGlzLm9yaWdpblNpZGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicmlnaHRcIjpcImxlZnRcIix0aGlzLnZpZXdwb3J0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy52aWV3cG9ydC5jbGFzc05hbWU9XCJmbGlja2l0eS12aWV3cG9ydFwiLHRoaXMuX2NyZWF0ZVNsaWRlcigpLCh0aGlzLm9wdGlvbnMucmVzaXplfHx0aGlzLm9wdGlvbnMud2F0Y2hDU1MpJiZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSxsLmNyZWF0ZU1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzW3RdKCl9LHRoaXMpLHRoaXMub3B0aW9ucy53YXRjaENTUz90aGlzLndhdGNoQ1NTKCk6dGhpcy5hY3RpdmF0ZSgpfSxwLm9wdGlvbj1mdW5jdGlvbih0KXtuLmV4dGVuZCh0aGlzLm9wdGlvbnMsdCl9LHAuYWN0aXZhdGU9ZnVuY3Rpb24oKXtpZighdGhpcy5pc0FjdGl2ZSl7dGhpcy5pc0FjdGl2ZT0hMCx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZ0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmdldFNpemUoKTt2YXIgdD10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7YSh0LHRoaXMuc2xpZGVyKSx0aGlzLnZpZXdwb3J0LmFwcGVuZENoaWxkKHRoaXMuc2xpZGVyKSx0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3cG9ydCksdGhpcy5yZWxvYWRDZWxscygpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnRhYkluZGV4PTAsdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuZW1pdEV2ZW50KFwiYWN0aXZhdGVcIik7dmFyIGUsaT10aGlzLm9wdGlvbnMuaW5pdGlhbEluZGV4O2U9dGhpcy5pc0luaXRBY3RpdmF0ZWQ/dGhpcy5zZWxlY3RlZEluZGV4OnZvaWQgMCE9PWkmJnRoaXMuY2VsbHNbaV0/aTowLHRoaXMuc2VsZWN0KGUsITEsITApLHRoaXMuaXNJbml0QWN0aXZhdGVkPSEwfX0scC5fY3JlYXRlU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0LmNsYXNzTmFtZT1cImZsaWNraXR5LXNsaWRlclwiLHQuc3R5bGVbdGhpcy5vcmlnaW5TaWRlXT0wLHRoaXMuc2xpZGVyPXR9LHAuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCl7cmV0dXJuIG4uZmlsdGVyRmluZEVsZW1lbnRzKHQsdGhpcy5vcHRpb25zLmNlbGxTZWxlY3Rvcil9LHAucmVsb2FkQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzPXRoaXMuX21ha2VDZWxscyh0aGlzLnNsaWRlci5jaGlsZHJlbiksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCl9LHAuX21ha2VDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHQpLGk9ZS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBzKHQsdGhpcyl9LHRoaXMpO3JldHVybiBpfSxwLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LHAuZ2V0TGFzdFNsaWRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2xpZGVzW3RoaXMuc2xpZGVzLmxlbmd0aC0xXX0scC5wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKCl7dGhpcy5fc2l6ZUNlbGxzKHRoaXMuY2VsbHMpLHRoaXMuX3Bvc2l0aW9uQ2VsbHMoMCl9LHAuX3Bvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24odCl7dD10fHwwLHRoaXMubWF4Q2VsbEhlaWdodD10P3RoaXMubWF4Q2VsbEhlaWdodHx8MDowO3ZhciBlPTA7aWYodD4wKXt2YXIgaT10aGlzLmNlbGxzW3QtMV07ZT1pLngraS5zaXplLm91dGVyV2lkdGh9Zm9yKHZhciBuPXRoaXMuY2VsbHMubGVuZ3RoLHM9dDtzPG47cysrKXt2YXIgbz10aGlzLmNlbGxzW3NdO28uc2V0UG9zaXRpb24oZSksZSs9by5zaXplLm91dGVyV2lkdGgsdGhpcy5tYXhDZWxsSGVpZ2h0PU1hdGgubWF4KG8uc2l6ZS5vdXRlckhlaWdodCx0aGlzLm1heENlbGxIZWlnaHQpfXRoaXMuc2xpZGVhYmxlV2lkdGg9ZSx0aGlzLnVwZGF0ZVNsaWRlcygpLHRoaXMuX2NvbnRhaW5TbGlkZXMoKSx0aGlzLnNsaWRlc1dpZHRoPW4/dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQtdGhpcy5zbGlkZXNbMF0udGFyZ2V0OjB9LHAuX3NpemVDZWxscz1mdW5jdGlvbih0KXt0LmZvckVhY2goZnVuY3Rpb24odCl7dC5nZXRTaXplKCl9KX0scC51cGRhdGVTbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRlcz1bXSx0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9bmV3IG8odGhpcyk7dGhpcy5zbGlkZXMucHVzaCh0KTt2YXIgZT1cImxlZnRcIj09dGhpcy5vcmlnaW5TaWRlLGk9ZT9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsbj10aGlzLl9nZXRDYW5DZWxsRml0KCk7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUscyl7aWYoIXQuY2VsbHMubGVuZ3RoKXJldHVybiB2b2lkIHQuYWRkQ2VsbChlKTt2YXIgcj10Lm91dGVyV2lkdGgtdC5maXJzdE1hcmdpbisoZS5zaXplLm91dGVyV2lkdGgtZS5zaXplW2ldKTtuLmNhbGwodGhpcyxzLHIpP3QuYWRkQ2VsbChlKToodC51cGRhdGVUYXJnZXQoKSx0PW5ldyBvKHRoaXMpLHRoaXMuc2xpZGVzLnB1c2godCksdC5hZGRDZWxsKGUpKX0sdGhpcyksdC51cGRhdGVUYXJnZXQoKSx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKX19LHAuX2dldENhbkNlbGxGaXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMuZ3JvdXBDZWxscztpZighdClyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4hMX07aWYoXCJudW1iZXJcIj09dHlwZW9mIHQpe3ZhciBlPXBhcnNlSW50KHQsMTApO3JldHVybiBmdW5jdGlvbih0KXtyZXR1cm4gdCVlIT09MH19dmFyIGk9XCJzdHJpbmdcIj09dHlwZW9mIHQmJnQubWF0Y2goL14oXFxkKyklJC8pLG49aT9wYXJzZUludChpWzFdLDEwKS8xMDA6MTtyZXR1cm4gZnVuY3Rpb24odCxlKXtyZXR1cm4gZTw9KHRoaXMuc2l6ZS5pbm5lcldpZHRoKzEpKm59fSxwLl9pbml0PXAucmVwb3NpdGlvbj1mdW5jdGlvbigpe3RoaXMucG9zaXRpb25DZWxscygpLHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9LHAuZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1pKHRoaXMuZWxlbWVudCksdGhpcy5zZXRDZWxsQWxpZ24oKSx0aGlzLmN1cnNvclBvc2l0aW9uPXRoaXMuc2l6ZS5pbm5lcldpZHRoKnRoaXMuY2VsbEFsaWdufTt2YXIgdj17Y2VudGVyOntsZWZ0Oi41LHJpZ2h0Oi41fSxsZWZ0OntsZWZ0OjAscmlnaHQ6MX0scmlnaHQ6e3JpZ2h0OjAsbGVmdDoxfX07cmV0dXJuIHAuc2V0Q2VsbEFsaWduPWZ1bmN0aW9uKCl7dmFyIHQ9dlt0aGlzLm9wdGlvbnMuY2VsbEFsaWduXTt0aGlzLmNlbGxBbGlnbj10P3RbdGhpcy5vcmlnaW5TaWRlXTp0aGlzLm9wdGlvbnMuY2VsbEFsaWdufSxwLnNldEdhbGxlcnlTaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLnNldEdhbGxlcnlTaXplKXt2YXIgdD10aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2VsZWN0ZWRTbGlkZT90aGlzLnNlbGVjdGVkU2xpZGUuaGVpZ2h0OnRoaXMubWF4Q2VsbEhlaWdodDt0aGlzLnZpZXdwb3J0LnN0eWxlLmhlaWdodD10K1wicHhcIn19LHAuX2dldFdyYXBTaGlmdENlbGxzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3RoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMpLHRoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyk7dmFyIHQ9dGhpcy5jdXJzb3JQb3NpdGlvbixlPXRoaXMuY2VsbHMubGVuZ3RoLTE7dGhpcy5iZWZvcmVTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsZSwtMSksdD10aGlzLnNpemUuaW5uZXJXaWR0aC10aGlzLmN1cnNvclBvc2l0aW9uLHRoaXMuYWZ0ZXJTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsMCwxKX19LHAuX2dldEdhcENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49W107dD4wOyl7dmFyIHM9dGhpcy5jZWxsc1tlXTtpZighcylicmVhaztuLnB1c2gocyksZSs9aSx0LT1zLnNpemUub3V0ZXJXaWR0aH1yZXR1cm4gbn0scC5fY29udGFpblNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQsZT10P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixpPXQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiLG49dGhpcy5zbGlkZWFibGVXaWR0aC10aGlzLmdldExhc3RDZWxsKCkuc2l6ZVtpXSxzPW48dGhpcy5zaXplLmlubmVyV2lkdGgsbz10aGlzLmN1cnNvclBvc2l0aW9uK3RoaXMuY2VsbHNbMF0uc2l6ZVtlXSxyPW4tdGhpcy5zaXplLmlubmVyV2lkdGgqKDEtdGhpcy5jZWxsQWxpZ24pO3RoaXMuc2xpZGVzLmZvckVhY2goZnVuY3Rpb24odCl7cz90LnRhcmdldD1uKnRoaXMuY2VsbEFsaWduOih0LnRhcmdldD1NYXRoLm1heCh0LnRhcmdldCxvKSx0LnRhcmdldD1NYXRoLm1pbih0LnRhcmdldCxyKSl9LHRoaXMpfX0scC5kaXNwYXRjaEV2ZW50PWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj1lP1tlXS5jb25jYXQoaSk6aTtpZih0aGlzLmVtaXRFdmVudCh0LG4pLGgmJnRoaXMuJGVsZW1lbnQpe3QrPXRoaXMub3B0aW9ucy5uYW1lc3BhY2VKUXVlcnlFdmVudHM/XCIuZmxpY2tpdHlcIjpcIlwiO3ZhciBzPXQ7aWYoZSl7dmFyIG89aC5FdmVudChlKTtvLnR5cGU9dCxzPW99dGhpcy4kZWxlbWVudC50cmlnZ2VyKHMsaSl9fSxwLnNlbGVjdD1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0FjdGl2ZSYmKHQ9cGFyc2VJbnQodCwxMCksdGhpcy5fd3JhcFNlbGVjdCh0KSwodGhpcy5vcHRpb25zLndyYXBBcm91bmR8fGUpJiYodD1uLm1vZHVsbyh0LHRoaXMuc2xpZGVzLmxlbmd0aCkpLHRoaXMuc2xpZGVzW3RdJiYodGhpcy5zZWxlY3RlZEluZGV4PXQsdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCksaT90aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpOnRoaXMuc3RhcnRBbmltYXRpb24oKSx0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwiY2VsbFNlbGVjdFwiKSkpfSxwLl93cmFwU2VsZWN0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuc2xpZGVzLmxlbmd0aCxpPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZlPjE7aWYoIWkpcmV0dXJuIHQ7dmFyIHM9bi5tb2R1bG8odCxlKSxvPU1hdGguYWJzKHMtdGhpcy5zZWxlY3RlZEluZGV4KSxyPU1hdGguYWJzKHMrZS10aGlzLnNlbGVjdGVkSW5kZXgpLGE9TWF0aC5hYnMocy1lLXRoaXMuc2VsZWN0ZWRJbmRleCk7IXRoaXMuaXNEcmFnU2VsZWN0JiZyPG8/dCs9ZTohdGhpcy5pc0RyYWdTZWxlY3QmJmE8byYmKHQtPWUpLHQ8MD90aGlzLngtPXRoaXMuc2xpZGVhYmxlV2lkdGg6dD49ZSYmKHRoaXMueCs9dGhpcy5zbGlkZWFibGVXaWR0aCl9LHAucHJldmlvdXM9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgtMSx0LGUpfSxwLm5leHQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgrMSx0LGUpfSxwLnVwZGF0ZVNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnNsaWRlc1t0aGlzLnNlbGVjdGVkSW5kZXhdO3QmJih0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuc2VsZWN0ZWRTbGlkZT10LHQuc2VsZWN0KCksdGhpcy5zZWxlY3RlZENlbGxzPXQuY2VsbHMsdGhpcy5zZWxlY3RlZEVsZW1lbnRzPXQuZ2V0Q2VsbEVsZW1lbnRzKCksdGhpcy5zZWxlY3RlZENlbGw9dC5jZWxsc1swXSx0aGlzLnNlbGVjdGVkRWxlbWVudD10aGlzLnNlbGVjdGVkRWxlbWVudHNbMF0pfSxwLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRTbGlkZSYmdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCl9LHAuc2VsZWN0Q2VsbD1mdW5jdGlvbih0LGUsaSl7dmFyIG47XCJudW1iZXJcIj09dHlwZW9mIHQ/bj10aGlzLmNlbGxzW3RdOihcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9dGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodCkpLG49dGhpcy5nZXRDZWxsKHQpKTtmb3IodmFyIHM9MDtuJiZzPHRoaXMuc2xpZGVzLmxlbmd0aDtzKyspe3ZhciBvPXRoaXMuc2xpZGVzW3NdLHI9by5jZWxscy5pbmRleE9mKG4pO2lmKHIhPS0xKXJldHVybiB2b2lkIHRoaXMuc2VsZWN0KHMsZSxpKX19LHAuZ2V0Q2VsbD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuY2VsbHMubGVuZ3RoO2UrKyl7dmFyIGk9dGhpcy5jZWxsc1tlXTtpZihpLmVsZW1lbnQ9PXQpcmV0dXJuIGl9fSxwLmdldENlbGxzPWZ1bmN0aW9uKHQpe3Q9bi5tYWtlQXJyYXkodCk7dmFyIGU9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaT10aGlzLmdldENlbGwodCk7aSYmZS5wdXNoKGkpfSx0aGlzKSxlfSxwLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHAuZ2V0UGFyZW50Q2VsbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7cmV0dXJuIGU/ZToodD1uLmdldFBhcmVudCh0LFwiLmZsaWNraXR5LXNsaWRlciA+ICpcIiksdGhpcy5nZXRDZWxsKHQpKX0scC5nZXRBZGphY2VudENlbGxFbGVtZW50cz1mdW5jdGlvbih0LGUpe2lmKCF0KXJldHVybiB0aGlzLnNlbGVjdGVkU2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCk7ZT12b2lkIDA9PT1lP3RoaXMuc2VsZWN0ZWRJbmRleDplO3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aDtpZigxKzIqdD49aSlyZXR1cm4gdGhpcy5nZXRDZWxsRWxlbWVudHMoKTtmb3IodmFyIHM9W10sbz1lLXQ7bzw9ZSt0O28rKyl7dmFyIHI9dGhpcy5vcHRpb25zLndyYXBBcm91bmQ/bi5tb2R1bG8obyxpKTpvLGE9dGhpcy5zbGlkZXNbcl07YSYmKHM9cy5jb25jYXQoYS5nZXRDZWxsRWxlbWVudHMoKSkpfXJldHVybiBzfSxwLnVpQ2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy5lbWl0RXZlbnQoXCJ1aUNoYW5nZVwiKX0scC5jaGlsZFVJUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dGhpcy5lbWl0RXZlbnQoXCJjaGlsZFVJUG9pbnRlckRvd25cIixbdF0pfSxwLm9ucmVzaXplPWZ1bmN0aW9uKCl7dGhpcy53YXRjaENTUygpLHRoaXMucmVzaXplKCl9LG4uZGVib3VuY2VNZXRob2QobCxcIm9ucmVzaXplXCIsMTUwKSxwLnJlc2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNBY3RpdmUpe3RoaXMuZ2V0U2l6ZSgpLHRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiYodGhpcy54PW4ubW9kdWxvKHRoaXMueCx0aGlzLnNsaWRlYWJsZVdpZHRoKSksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJyZXNpemVcIik7dmFyIHQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzJiZ0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07dGhpcy5zZWxlY3RDZWxsKHQsITEsITApfX0scC53YXRjaENTUz1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy53YXRjaENTUztpZih0KXt2YXIgZT1jKHRoaXMuZWxlbWVudCxcIjphZnRlclwiKS5jb250ZW50O2UuaW5kZXhPZihcImZsaWNraXR5XCIpIT0tMT90aGlzLmFjdGl2YXRlKCk6dGhpcy5kZWFjdGl2YXRlKCl9fSxwLm9ua2V5ZG93bj1mdW5jdGlvbih0KXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKCFkb2N1bWVudC5hY3RpdmVFbGVtZW50fHxkb2N1bWVudC5hY3RpdmVFbGVtZW50PT10aGlzLmVsZW1lbnQpKWlmKDM3PT10LmtleUNvZGUpe3ZhciBlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cIm5leHRcIjpcInByZXZpb3VzXCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbZV0oKX1lbHNlIGlmKDM5PT10LmtleUNvZGUpe3ZhciBpPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbaV0oKX19LHAuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuaXNBY3RpdmUmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZGVzdHJveSgpfSksdGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy52aWV3cG9ydCksYSh0aGlzLnNsaWRlci5jaGlsZHJlbix0aGlzLmVsZW1lbnQpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcInRhYkluZGV4XCIpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmlzQWN0aXZlPSExLHRoaXMuZW1pdEV2ZW50KFwiZGVhY3RpdmF0ZVwiKSl9LHAuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLHRoaXMuZW1pdEV2ZW50KFwiZGVzdHJveVwiKSxoJiZ0aGlzLiRlbGVtZW50JiZoLnJlbW92ZURhdGEodGhpcy5lbGVtZW50LFwiZmxpY2tpdHlcIiksZGVsZXRlIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQsZGVsZXRlIGZbdGhpcy5ndWlkXX0sbi5leHRlbmQocCxyKSxsLmRhdGE9ZnVuY3Rpb24odCl7dD1uLmdldFF1ZXJ5RWxlbWVudCh0KTt2YXIgZT10JiZ0LmZsaWNraXR5R1VJRDtyZXR1cm4gZSYmZltlXX0sbi5odG1sSW5pdChsLFwiZmxpY2tpdHlcIiksaCYmaC5icmlkZ2V0JiZoLmJyaWRnZXQoXCJmbGlja2l0eVwiLGwpLGwuQ2VsbD1zLGx9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5Vbmlwb2ludGVyPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApfSxzLnVuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMSl9LHMuX2JpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKGUsaSl7aT12b2lkIDA9PT1pfHwhIWk7dmFyIG49aT9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIjt0Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZD9lW25dKFwicG9pbnRlcmRvd25cIix0aGlzKTp0Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkP2Vbbl0oXCJNU1BvaW50ZXJEb3duXCIsdGhpcyk6KGVbbl0oXCJtb3VzZWRvd25cIix0aGlzKSxlW25dKFwidG91Y2hzdGFydFwiLHRoaXMpKX0scy5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LHMuZ2V0VG91Y2g9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBpPXRbZV07aWYoaS5pZGVudGlmaWVyPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyKXJldHVybiBpfX0scy5vbm1vdXNlZG93bj1mdW5jdGlvbih0KXt2YXIgZT10LmJ1dHRvbjtlJiYwIT09ZSYmMSE9PWV8fHRoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMub250b3VjaHN0YXJ0PWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdC5jaGFuZ2VkVG91Y2hlc1swXSl9LHMub25NU1BvaW50ZXJEb3duPXMub25wb2ludGVyZG93bj1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLl9wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuaXNQb2ludGVyRG93bnx8KHRoaXMuaXNQb2ludGVyRG93bj0hMCx0aGlzLnBvaW50ZXJJZGVudGlmaWVyPXZvaWQgMCE9PWUucG9pbnRlcklkP2UucG9pbnRlcklkOmUuaWRlbnRpZmllcix0aGlzLnBvaW50ZXJEb3duKHQsZSkpfSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfTt2YXIgbz17bW91c2Vkb3duOltcIm1vdXNlbW92ZVwiLFwibW91c2V1cFwiXSx0b3VjaHN0YXJ0OltcInRvdWNobW92ZVwiLFwidG91Y2hlbmRcIixcInRvdWNoY2FuY2VsXCJdLHBvaW50ZXJkb3duOltcInBvaW50ZXJtb3ZlXCIsXCJwb2ludGVydXBcIixcInBvaW50ZXJjYW5jZWxcIl0sTVNQb2ludGVyRG93bjpbXCJNU1BvaW50ZXJNb3ZlXCIsXCJNU1BvaW50ZXJVcFwiLFwiTVNQb2ludGVyQ2FuY2VsXCJdfTtyZXR1cm4gcy5fYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbihlKXtpZihlKXt2YXIgaT1vW2UudHlwZV07aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuYWRkRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSx0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM9aX19LHMuX3VuYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyYmKHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSxkZWxldGUgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzKX0scy5vbm1vdXNlbW92ZT1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9uTVNQb2ludGVyTW92ZT1zLm9ucG9pbnRlcm1vdmU9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub250b3VjaG1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyTW92ZSh0LGUpfSxzLl9wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMucG9pbnRlck1vdmUodCxlKX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlXSl9LHMub25tb3VzZXVwPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9uTVNQb2ludGVyVXA9cy5vbnBvaW50ZXJ1cD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub250b3VjaGVuZD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJVcCh0LGUpfSxzLl9wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlclVwKHQsZSl9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSl9LHMuX3BvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dGhpcy5pc1BvaW50ZXJEb3duPSExLGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyLHRoaXMuX3VuYmluZFBvc3RTdGFydEV2ZW50cygpLHRoaXMucG9pbnRlckRvbmUoKX0scy5wb2ludGVyRG9uZT1pLHMub25NU1BvaW50ZXJDYW5jZWw9cy5vbnBvaW50ZXJjYW5jZWw9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJDYW5jZWwodCx0KX0scy5vbnRvdWNoY2FuY2VsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LGUpfSxzLl9wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJDYW5jZWwodCxlKX0scy5wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyQ2FuY2VsXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1mdW5jdGlvbih0KXtyZXR1cm57eDp0LnBhZ2VYLHk6dC5wYWdlWX19LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5VbmlkcmFnZ2VyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCEwKX0scy51bmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITEpfTt2YXIgbz10Lm5hdmlnYXRvcjtyZXR1cm4gcy5fYmluZEhhbmRsZXM9ZnVuY3Rpb24odCl7dD12b2lkIDA9PT10fHwhIXQ7dmFyIGU7ZT1vLnBvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUudG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTpvLm1zUG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS5tc1RvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06aTtmb3IodmFyIG49dD9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIixzPTA7czx0aGlzLmhhbmRsZXMubGVuZ3RoO3MrKyl7dmFyIHI9dGhpcy5oYW5kbGVzW3NdO3RoaXMuX2JpbmRTdGFydEV2ZW50KHIsdCksZShyKSxyW25dKFwiY2xpY2tcIix0aGlzKX19LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXtpZihcIklOUFVUXCI9PXQudGFyZ2V0Lm5vZGVOYW1lJiZcInJhbmdlXCI9PXQudGFyZ2V0LnR5cGUpcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bih0LGUpO3ZhciBpPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7aSYmaS5ibHVyJiZpLmJsdXIoKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9LHMuX2RyYWdQb2ludGVyRG93bj1mdW5jdGlvbih0LGkpe3RoaXMucG9pbnRlckRvd25Qb2ludD1lLmdldFBvaW50ZXJQb2ludChpKTt2YXIgbj10aGlzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bih0LGkpO24mJnQucHJldmVudERlZmF1bHQoKX0scy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7cmV0dXJuXCJTRUxFQ1RcIiE9dC50YXJnZXQubm9kZU5hbWV9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxzLl9kcmFnUG9pbnRlck1vdmU9ZnVuY3Rpb24odCxpKXt2YXIgbj1lLmdldFBvaW50ZXJQb2ludChpKSxzPXt4Om4ueC10aGlzLnBvaW50ZXJEb3duUG9pbnQueCx5Om4ueS10aGlzLnBvaW50ZXJEb3duUG9pbnQueX07cmV0dXJuIXRoaXMuaXNEcmFnZ2luZyYmdGhpcy5oYXNEcmFnU3RhcnRlZChzKSYmdGhpcy5fZHJhZ1N0YXJ0KHQsaSksc30scy5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT4zfHxNYXRoLmFicyh0LnkpPjN9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxzLl9kcmFnUG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nP3RoaXMuX2RyYWdFbmQodCxlKTp0aGlzLl9zdGF0aWNDbGljayh0LGUpfSxzLl9kcmFnU3RhcnQ9ZnVuY3Rpb24odCxpKXt0aGlzLmlzRHJhZ2dpbmc9ITAsdGhpcy5kcmFnU3RhcnRQb2ludD1lLmdldFBvaW50ZXJQb2ludChpKSx0aGlzLmlzUHJldmVudGluZ0NsaWNrcz0hMCx0aGlzLmRyYWdTdGFydCh0LGkpfSxzLmRyYWdTdGFydD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ1N0YXJ0XCIsW3QsZV0pfSxzLl9kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmRyYWdNb3ZlKHQsZSxpKX0scy5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuZW1pdEV2ZW50KFwiZHJhZ01vdmVcIixbdCxlLGldKX0scy5fZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz0hMSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzfS5iaW5kKHRoaXMpKSx0aGlzLmRyYWdFbmQodCxlKX0scy5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnRW5kXCIsW3QsZV0pfSxzLm9uY2xpY2s9ZnVuY3Rpb24odCl7dGhpcy5pc1ByZXZlbnRpbmdDbGlja3MmJnQucHJldmVudERlZmF1bHQoKX0scy5fc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPXQudHlwZSl7dmFyIGk9dC50YXJnZXQubm9kZU5hbWU7XCJJTlBVVFwiIT1pJiZcIlRFWFRBUkVBXCIhPWl8fHQudGFyZ2V0LmZvY3VzKCksdGhpcy5zdGF0aWNDbGljayh0LGUpLFwibW91c2V1cFwiIT10LnR5cGUmJih0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0lnbm9yaW5nTW91c2VVcH0uYmluZCh0aGlzKSw0MDApKX19LHMuc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInN0YXRpY0NsaWNrXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1lLmdldFBvaW50ZXJQb2ludCxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvZHJhZ1wiLFtcIi4vZmxpY2tpdHlcIixcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ1bmlkcmFnZ2VyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LlVuaWRyYWdnZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcygpe3JldHVybnt4OnQucGFnZVhPZmZzZXQseTp0LnBhZ2VZT2Zmc2V0fX1uLmV4dGVuZChlLmRlZmF1bHRzLHtkcmFnZ2FibGU6ITAsZHJhZ1RocmVzaG9sZDozfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlRHJhZ1wiKTt2YXIgbz1lLnByb3RvdHlwZTtuLmV4dGVuZChvLGkucHJvdG90eXBlKTt2YXIgcj1cImNyZWF0ZVRvdWNoXCJpbiBkb2N1bWVudCxhPSExO28uX2NyZWF0ZURyYWc9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmJpbmREcmFnKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLl91aUNoYW5nZURyYWcpLHRoaXMub24oXCJjaGlsZFVJUG9pbnRlckRvd25cIix0aGlzLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMudW5iaW5kRHJhZyksciYmIWEmJih0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixmdW5jdGlvbigpe30pLGE9ITApfSxvLmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmRyYWdnYWJsZSYmIXRoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImlzLWRyYWdnYWJsZVwiKSx0aGlzLmhhbmRsZXM9W3RoaXMudmlld3BvcnRdLHRoaXMuYmluZEhhbmRsZXMoKSx0aGlzLmlzRHJhZ0JvdW5kPSEwKX0sby51bmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMudW5iaW5kSGFuZGxlcygpLGRlbGV0ZSB0aGlzLmlzRHJhZ0JvdW5kKX0sby5fdWlDaGFuZ2VEcmFnPWZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nfSxvLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnPWZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXModCl9O3ZhciBsPXtURVhUQVJFQTohMCxJTlBVVDohMCxPUFRJT046ITB9LGg9e3JhZGlvOiEwLGNoZWNrYm94OiEwLGJ1dHRvbjohMCxzdWJtaXQ6ITAsaW1hZ2U6ITAsZmlsZTohMH07by5wb2ludGVyRG93bj1mdW5jdGlvbihlLGkpe3ZhciBuPWxbZS50YXJnZXQubm9kZU5hbWVdJiYhaFtlLnRhcmdldC50eXBlXTtpZihuKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24oZSxpKTt2YXIgbz1kb2N1bWVudC5hY3RpdmVFbGVtZW50O28mJm8uYmx1ciYmbyE9dGhpcy5lbGVtZW50JiZvIT1kb2N1bWVudC5ib2R5JiZvLmJsdXIoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXMoZSksdGhpcy5kcmFnWD10aGlzLngsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QuYWRkKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoZSksdGhpcy5wb2ludGVyRG93blNjcm9sbD1zKCksdC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlckRvd25cIixlLFtpXSl9O3ZhciBjPXt0b3VjaHN0YXJ0OiEwLE1TUG9pbnRlckRvd246ITB9LGQ9e0lOUFVUOiEwLFNFTEVDVDohMH07cmV0dXJuIG8ucG9pbnRlckRvd25Gb2N1cz1mdW5jdGlvbihlKXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmIWNbZS50eXBlXSYmIWRbZS50YXJnZXQubm9kZU5hbWVdKXt2YXIgaT10LnBhZ2VZT2Zmc2V0O3RoaXMuZWxlbWVudC5mb2N1cygpLHQucGFnZVlPZmZzZXQhPWkmJnQuc2Nyb2xsVG8odC5wYWdlWE9mZnNldCxpKX19LG8uY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3ZhciBlPVwidG91Y2hzdGFydFwiPT10LnR5cGUsaT10LnRhcmdldC5ub2RlTmFtZTtyZXR1cm4hZSYmXCJTRUxFQ1RcIiE9aX0sby5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT50aGlzLm9wdGlvbnMuZHJhZ1RocmVzaG9sZH0sby5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXtkZWxldGUgdGhpcy5pc1RvdWNoU2Nyb2xsaW5nLHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyVXBcIix0LFtlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxvLnBvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksZGVsZXRlIHRoaXMucG9pbnRlckRvd25TY3JvbGx9LG8uZHJhZ1N0YXJ0PWZ1bmN0aW9uKGUsaSl7dGhpcy5kcmFnU3RhcnRQb3NpdGlvbj10aGlzLngsdGhpcy5zdGFydEFuaW1hdGlvbigpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdTdGFydFwiLGUsW2ldKX0sby5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJNb3ZlXCIsdCxbZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxvLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wcmV2aW91c0RyYWdYPXRoaXMuZHJhZ1g7dmFyIG49dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0Py0xOjEscz10aGlzLmRyYWdTdGFydFBvc2l0aW9uK2kueCpuO2lmKCF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5zbGlkZXMubGVuZ3RoKXt2YXIgbz1NYXRoLm1heCgtdGhpcy5zbGlkZXNbMF0udGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9cz5vPy41KihzK28pOnM7dmFyIHI9TWF0aC5taW4oLXRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9czxyPy41KihzK3IpOnN9dGhpcy5kcmFnWD1zLHRoaXMuZHJhZ01vdmVUaW1lPW5ldyBEYXRlLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdNb3ZlXCIsdCxbZSxpXSl9LG8uZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYodGhpcy5pc0ZyZWVTY3JvbGxpbmc9ITApO3ZhciBpPXRoaXMuZHJhZ0VuZFJlc3RpbmdTZWxlY3QoKTtpZih0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt2YXIgbj10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO3RoaXMuaXNGcmVlU2Nyb2xsaW5nPS1uPnRoaXMuc2xpZGVzWzBdLnRhcmdldCYmLW48dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXR9ZWxzZSB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbHx8aSE9dGhpcy5zZWxlY3RlZEluZGV4fHwoaSs9dGhpcy5kcmFnRW5kQm9vc3RTZWxlY3QoKSk7ZGVsZXRlIHRoaXMucHJldmlvdXNEcmFnWCx0aGlzLmlzRHJhZ1NlbGVjdD10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCx0aGlzLnNlbGVjdChpKSxkZWxldGUgdGhpcy5pc0RyYWdTZWxlY3QsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ0VuZFwiLHQsW2VdKX0sby5kcmFnRW5kUmVzdGluZ1NlbGVjdD1mdW5jdGlvbigpe1xudmFyIHQ9dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKSxlPU1hdGguYWJzKHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCx0aGlzLnNlbGVjdGVkSW5kZXgpKSxpPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwxKSxuPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwtMSkscz1pLmRpc3RhbmNlPG4uZGlzdGFuY2U/aS5pbmRleDpuLmluZGV4O3JldHVybiBzfSxvLl9nZXRDbG9zZXN0UmVzdGluZz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPXRoaXMuc2VsZWN0ZWRJbmRleCxzPTEvMCxvPXRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQ/ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDw9ZX06ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDxlfTtvKGUscykmJihuKz1pLHM9ZSxlPXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCxuKSxudWxsIT09ZSk7KWU9TWF0aC5hYnMoZSk7cmV0dXJue2Rpc3RhbmNlOnMsaW5kZXg6bi1pfX0sby5nZXRTbGlkZURpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoLHM9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmk+MSxvPXM/bi5tb2R1bG8oZSxpKTplLHI9dGhpcy5zbGlkZXNbb107aWYoIXIpcmV0dXJuIG51bGw7dmFyIGE9cz90aGlzLnNsaWRlYWJsZVdpZHRoKk1hdGguZmxvb3IoZS9pKTowO3JldHVybiB0LShyLnRhcmdldCthKX0sby5kcmFnRW5kQm9vc3RTZWxlY3Q9ZnVuY3Rpb24oKXtpZih2b2lkIDA9PT10aGlzLnByZXZpb3VzRHJhZ1h8fCF0aGlzLmRyYWdNb3ZlVGltZXx8bmV3IERhdGUtdGhpcy5kcmFnTW92ZVRpbWU+MTAwKXJldHVybiAwO3ZhciB0PXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdGhpcy5kcmFnWCx0aGlzLnNlbGVjdGVkSW5kZXgpLGU9dGhpcy5wcmV2aW91c0RyYWdYLXRoaXMuZHJhZ1g7cmV0dXJuIHQ+MCYmZT4wPzE6dDwwJiZlPDA/LTE6MH0sby5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuZ2V0UGFyZW50Q2VsbCh0LnRhcmdldCksbj1pJiZpLmVsZW1lbnQscz1pJiZ0aGlzLmNlbGxzLmluZGV4T2YoaSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwic3RhdGljQ2xpY2tcIix0LFtlLG4sc10pfSxvLm9uc2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHQ9cygpLGU9dGhpcy5wb2ludGVyRG93blNjcm9sbC54LXQueCxpPXRoaXMucG9pbnRlckRvd25TY3JvbGwueS10Lnk7KE1hdGguYWJzKGUpPjN8fE1hdGguYWJzKGkpPjMpJiZ0aGlzLl9wb2ludGVyRG9uZSgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlRhcExpc3RlbmVyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQpe3RoaXMuYmluZFRhcCh0KX12YXIgbj1pLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtyZXR1cm4gbi5iaW5kVGFwPWZ1bmN0aW9uKHQpe3QmJih0aGlzLnVuYmluZFRhcCgpLHRoaXMudGFwRWxlbWVudD10LHRoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApKX0sbi51bmJpbmRUYXA9ZnVuY3Rpb24oKXt0aGlzLnRhcEVsZW1lbnQmJih0aGlzLl9iaW5kU3RhcnRFdmVudCh0aGlzLnRhcEVsZW1lbnQsITApLGRlbGV0ZSB0aGlzLnRhcEVsZW1lbnQpfSxuLnBvaW50ZXJVcD1mdW5jdGlvbihpLG4pe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9aS50eXBlKXt2YXIgcz1lLmdldFBvaW50ZXJQb2ludChuKSxvPXRoaXMudGFwRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxyPXQucGFnZVhPZmZzZXQsYT10LnBhZ2VZT2Zmc2V0LGw9cy54Pj1vLmxlZnQrciYmcy54PD1vLnJpZ2h0K3ImJnMueT49by50b3ArYSYmcy55PD1vLmJvdHRvbSthO2lmKGwmJnRoaXMuZW1pdEV2ZW50KFwidGFwXCIsW2ksbl0pLFwibW91c2V1cFwiIT1pLnR5cGUpe3RoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITA7dmFyIGg9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIGguaXNJZ25vcmluZ01vdXNlVXB9LDQwMCl9fX0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5wb2ludGVyRG9uZSgpLHRoaXMudW5iaW5kVGFwKCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHModCxlKXt0aGlzLmRpcmVjdGlvbj10LHRoaXMucGFyZW50PWUsdGhpcy5fY3JlYXRlKCl9ZnVuY3Rpb24gbyh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD90OlwiTSBcIit0LngwK1wiLDUwIEwgXCIrdC54MStcIixcIisodC55MSs1MCkrXCIgTCBcIit0LngyK1wiLFwiKyh0LnkyKzUwKStcIiBMIFwiK3QueDMrXCIsNTAgIEwgXCIrdC54MitcIixcIisoNTAtdC55MikrXCIgTCBcIit0LngxK1wiLFwiKyg1MC10LnkxKStcIiBaXCJ9dmFyIHI9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO3MucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZD0hMCx0aGlzLmlzUHJldmlvdXM9dGhpcy5kaXJlY3Rpb249PS0xO3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMucmlnaHRUb0xlZnQ/MTotMTt0aGlzLmlzTGVmdD10aGlzLmRpcmVjdGlvbj09dDt2YXIgZT10aGlzLmVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtlLmNsYXNzTmFtZT1cImZsaWNraXR5LXByZXYtbmV4dC1idXR0b25cIixlLmNsYXNzTmFtZSs9dGhpcy5pc1ByZXZpb3VzP1wiIHByZXZpb3VzXCI6XCIgbmV4dFwiLGUuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwiYnV0dG9uXCIpLHRoaXMuZGlzYWJsZSgpLGUuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLHRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCIpO3ZhciBpPXRoaXMuY3JlYXRlU1ZHKCk7ZS5hcHBlbmRDaGlsZChpKSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5wYXJlbnQub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuYmluZFRhcCh0aGlzLmVsZW1lbnQpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCl9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKX0scy5wcm90b3R5cGUuY3JlYXRlU1ZHPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJzdmdcIik7dC5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsXCIwIDAgMTAwIDEwMFwiKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInBhdGhcIiksaT1vKHRoaXMucGFyZW50Lm9wdGlvbnMuYXJyb3dTaGFwZSk7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZFwiLGkpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixcImFycm93XCIpLHRoaXMuaXNMZWZ0fHxlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLFwidHJhbnNsYXRlKDEwMCwgMTAwKSByb3RhdGUoMTgwKSBcIiksdC5hcHBlbmRDaGlsZChlKSx0fSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbigpe2lmKHRoaXMuaXNFbmFibGVkKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciB0PXRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy5wYXJlbnRbdF0oKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PW4uaGFuZGxlRXZlbnQscy5wcm90b3R5cGUub25jbGljaz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7dCYmdD09dGhpcy5lbGVtZW50JiZ0aGlzLm9uVGFwKCl9LHMucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkfHwodGhpcy5lbGVtZW50LmRpc2FibGVkPSExLHRoaXMuaXNFbmFibGVkPSEwKX0scy5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkJiYodGhpcy5lbGVtZW50LmRpc2FibGVkPSEwLHRoaXMuaXNFbmFibGVkPSExKX0scy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzO2lmKHRoaXMucGFyZW50Lm9wdGlvbnMud3JhcEFyb3VuZCYmdC5sZW5ndGg+MSlyZXR1cm4gdm9pZCB0aGlzLmVuYWJsZSgpO3ZhciBlPXQubGVuZ3RoP3QubGVuZ3RoLTE6MCxpPXRoaXMuaXNQcmV2aW91cz8wOmUsbj10aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4PT1pP1wiZGlzYWJsZVwiOlwiZW5hYmxlXCI7dGhpc1tuXSgpfSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LG4uZXh0ZW5kKGUuZGVmYXVsdHMse3ByZXZOZXh0QnV0dG9uczohMCxhcnJvd1NoYXBlOnt4MDoxMCx4MTo2MCx5MTo1MCx4Mjo3MCx5Mjo0MCx4MzozMH19KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnNcIik7dmFyIGE9ZS5wcm90b3R5cGU7cmV0dXJuIGEuX2NyZWF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wcmV2TmV4dEJ1dHRvbnMmJih0aGlzLnByZXZCdXR0b249bmV3IHMoKC0xKSx0aGlzKSx0aGlzLm5leHRCdXR0b249bmV3IHMoMSx0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUHJldk5leHRCdXR0b25zKSl9LGEuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGEuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm9mZihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxlLlByZXZOZXh0QnV0dG9uPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BhZ2UtZG90c1wiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKHQpe3RoaXMucGFyZW50PXQsdGhpcy5fY3JlYXRlKCl9cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaG9sZGVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvbFwiKSx0aGlzLmhvbGRlci5jbGFzc05hbWU9XCJmbGlja2l0eS1wYWdlLWRvdHNcIix0aGlzLmRvdHM9W10sdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5zZXREb3RzKCksdGhpcy5iaW5kVGFwKHRoaXMuaG9sZGVyKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5ob2xkZXIpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKX0scy5wcm90b3R5cGUuc2V0RG90cz1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcy5sZW5ndGgtdGhpcy5kb3RzLmxlbmd0aDt0PjA/dGhpcy5hZGREb3RzKHQpOnQ8MCYmdGhpcy5yZW1vdmVEb3RzKC10KX0scy5wcm90b3R5cGUuYWRkRG90cz1mdW5jdGlvbih0KXtmb3IodmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGk9W107dDspe3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtuLmNsYXNzTmFtZT1cImRvdFwiLGUuYXBwZW5kQ2hpbGQobiksaS5wdXNoKG4pLHQtLX10aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlKSx0aGlzLmRvdHM9dGhpcy5kb3RzLmNvbmNhdChpKX0scy5wcm90b3R5cGUucmVtb3ZlRG90cz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmRvdHMuc3BsaWNlKHRoaXMuZG90cy5sZW5ndGgtdCx0KTtlLmZvckVhY2goZnVuY3Rpb24odCl7dGhpcy5ob2xkZXIucmVtb3ZlQ2hpbGQodCl9LHRoaXMpfSxzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWREb3QmJih0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdFwiKSx0aGlzLmRvdHMubGVuZ3RoJiYodGhpcy5zZWxlY3RlZERvdD10aGlzLmRvdHNbdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleF0sdGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3QgaXMtc2VsZWN0ZWRcIil9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKHQpe3ZhciBlPXQudGFyZ2V0O2lmKFwiTElcIj09ZS5ub2RlTmFtZSl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgaT10aGlzLmRvdHMuaW5kZXhPZihlKTt0aGlzLnBhcmVudC5zZWxlY3QoaSl9fSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxuLmV4dGVuZChlLmRlZmF1bHRzLHtwYWdlRG90czohMH0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBhZ2VEb3RzXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYWdlRG90cyYmKHRoaXMucGFnZURvdHM9bmV3IHModGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzKSx0aGlzLm9uKFwiY2VsbENoYW5nZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJyZXNpemVcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBhZ2VEb3RzKSl9LG8uYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuYWN0aXZhdGUoKX0sby51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCgpfSxvLnVwZGF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5zZXREb3RzKCl9LG8uZGVhY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGxheWVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9mbGlja2l0eVwiXSxmdW5jdGlvbih0LGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vZmxpY2tpdHlcIikpOmUodC5FdkVtaXR0ZXIsdC5maXp6eVVJVXRpbHMsdC5GbGlja2l0eSl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt0aGlzLnBhcmVudD10LHRoaXMuc3RhdGU9XCJzdG9wcGVkXCIsbyYmKHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5Q2hhbmdlKCl9LmJpbmQodGhpcyksdGhpcy5vblZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5UGxheSgpfS5iaW5kKHRoaXMpKX12YXIgcyxvO1wiaGlkZGVuXCJpbiBkb2N1bWVudD8ocz1cImhpZGRlblwiLG89XCJ2aXNpYmlsaXR5Y2hhbmdlXCIpOlwid2Via2l0SGlkZGVuXCJpbiBkb2N1bWVudCYmKHM9XCJ3ZWJraXRIaWRkZW5cIixvPVwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiKSxuLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQucHJvdG90eXBlKSxuLnByb3RvdHlwZS5wbGF5PWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCIhPXRoaXMuc3RhdGUpe3ZhciB0PWRvY3VtZW50W3NdO2lmKG8mJnQpcmV0dXJuIHZvaWQgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSk7dGhpcy5zdGF0ZT1cInBsYXlpbmdcIixvJiZkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpLHRoaXMudGljaygpfX0sbi5wcm90b3R5cGUudGljaz1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiPT10aGlzLnN0YXRlKXt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLmF1dG9QbGF5O3Q9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDozZTM7dmFyIGU9dGhpczt0aGlzLmNsZWFyKCksdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnBhcmVudC5uZXh0KCEwKSxlLnRpY2soKX0sdCl9fSxuLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5zdGF0ZT1cInN0b3BwZWRcIix0aGlzLmNsZWFyKCksbyYmZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKX0sbi5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KX0sbi5wcm90b3R5cGUucGF1c2U9ZnVuY3Rpb24oKXtcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSYmKHRoaXMuc3RhdGU9XCJwYXVzZWRcIix0aGlzLmNsZWFyKCkpfSxuLnByb3RvdHlwZS51bnBhdXNlPWZ1bmN0aW9uKCl7XCJwYXVzZWRcIj09dGhpcy5zdGF0ZSYmdGhpcy5wbGF5KCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudFtzXTt0aGlzW3Q/XCJwYXVzZVwiOlwidW5wYXVzZVwiXSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMucGxheSgpLGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpfSxlLmV4dGVuZChpLmRlZmF1bHRzLHtwYXVzZUF1dG9QbGF5T25Ib3ZlcjohMH0pLGkuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBsYXllclwiKTt2YXIgcj1pLnByb3RvdHlwZTtyZXR1cm4gci5fY3JlYXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXI9bmV3IG4odGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBsYXllciksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGxheWVyKX0sci5hY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5hdXRvUGxheSYmKHRoaXMucGxheWVyLnBsYXkoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKSl9LHIucGxheVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBsYXkoKX0sci5zdG9wUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpfSxyLnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGF1c2UoKX0sci51bnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpfSxyLmRlYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcyl9LHIub25tb3VzZWVudGVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhdXNlQXV0b1BsYXlPbkhvdmVyJiYodGhpcy5wbGF5ZXIucGF1c2UoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKSl9LHIub25tb3VzZWxlYXZlPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpfSxpLlBsYXllcj1uLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hZGQtcmVtb3ZlLWNlbGxcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2UuYXBwZW5kQ2hpbGQodC5lbGVtZW50KX0pLGV9dmFyIHM9ZS5wcm90b3R5cGU7cmV0dXJuIHMuaW5zZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fbWFrZUNlbGxzKHQpO2lmKGkmJmkubGVuZ3RoKXt2YXIgcz10aGlzLmNlbGxzLmxlbmd0aDtlPXZvaWQgMD09PWU/czplO3ZhciBvPW4oaSkscj1lPT1zO2lmKHIpdGhpcy5zbGlkZXIuYXBwZW5kQ2hpbGQobyk7ZWxzZXt2YXIgYT10aGlzLmNlbGxzW2VdLmVsZW1lbnQ7dGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKG8sYSl9aWYoMD09PWUpdGhpcy5jZWxscz1pLmNvbmNhdCh0aGlzLmNlbGxzKTtlbHNlIGlmKHIpdGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKTtlbHNle3ZhciBsPXRoaXMuY2VsbHMuc3BsaWNlKGUscy1lKTt0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpLmNvbmNhdChsKX10aGlzLl9zaXplQ2VsbHMoaSk7dmFyIGg9ZT50aGlzLnNlbGVjdGVkSW5kZXg/MDppLmxlbmd0aDt0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKGUsaCl9fSxzLmFwcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LHRoaXMuY2VsbHMubGVuZ3RoKX0scy5wcmVwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsMCl9LHMucmVtb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlLG4scz10aGlzLmdldENlbGxzKHQpLG89MCxyPXMubGVuZ3RoO2ZvcihlPTA7ZTxyO2UrKyl7bj1zW2VdO3ZhciBhPXRoaXMuY2VsbHMuaW5kZXhPZihuKTx0aGlzLnNlbGVjdGVkSW5kZXg7by09YT8xOjB9Zm9yKGU9MDtlPHI7ZSsrKW49c1tlXSxuLnJlbW92ZSgpLGkucmVtb3ZlRnJvbSh0aGlzLmNlbGxzLG4pO3MubGVuZ3RoJiZ0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKDAsbyl9LHMuX2NlbGxBZGRlZFJlbW92ZWQ9ZnVuY3Rpb24odCxlKXtlPWV8fDAsdGhpcy5zZWxlY3RlZEluZGV4Kz1lLHRoaXMuc2VsZWN0ZWRJbmRleD1NYXRoLm1heCgwLE1hdGgubWluKHRoaXMuc2xpZGVzLmxlbmd0aC0xLHRoaXMuc2VsZWN0ZWRJbmRleCkpLHRoaXMuY2VsbENoYW5nZSh0LCEwKSx0aGlzLmVtaXRFdmVudChcImNlbGxBZGRlZFJlbW92ZWRcIixbdCxlXSl9LHMuY2VsbFNpemVDaGFuZ2U9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO2lmKGUpe2UuZ2V0U2l6ZSgpO3ZhciBpPXRoaXMuY2VsbHMuaW5kZXhPZihlKTt0aGlzLmNlbGxDaGFuZ2UoaSl9fSxzLmNlbGxDaGFuZ2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlYWJsZVdpZHRoO2lmKHRoaXMuX3Bvc2l0aW9uQ2VsbHModCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQ2hhbmdlXCIsW3RdKSx0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCl7dmFyIG49aS10aGlzLnNsaWRlYWJsZVdpZHRoO3RoaXMueCs9bip0aGlzLmNlbGxBbGlnbix0aGlzLnBvc2l0aW9uU2xpZGVyKCl9ZWxzZSBlJiZ0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpLHRoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9sYXp5bG9hZFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7aWYoXCJJTUdcIj09dC5ub2RlTmFtZSYmdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpKXJldHVyblt0XTt2YXIgZT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZF1cIik7cmV0dXJuIGkubWFrZUFycmF5KGUpfWZ1bmN0aW9uIHModCxlKXt0aGlzLmltZz10LHRoaXMuZmxpY2tpdHk9ZSx0aGlzLmxvYWQoKX1lLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVMYXp5bG9hZFwiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlTGF6eWxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy5sYXp5TG9hZCl9LG8ubGF6eUxvYWQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubGF6eUxvYWQ7aWYodCl7dmFyIGU9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDowLGk9dGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyhlKSxvPVtdO2kuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgZT1uKHQpO289by5jb25jYXQoZSl9KSxvLmZvckVhY2goZnVuY3Rpb24odCl7bmV3IHModCx0aGlzKX0sdGhpcyl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1pLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpLHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIil9LHMucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5bG9hZGVkXCIpfSxzLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenllcnJvclwiKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24odCxlKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpO3ZhciBpPXRoaXMuZmxpY2tpdHkuZ2V0UGFyZW50Q2VsbCh0aGlzLmltZyksbj1pJiZpLmVsZW1lbnQ7dGhpcy5mbGlja2l0eS5jZWxsU2l6ZUNoYW5nZShuKSx0aGlzLmltZy5jbGFzc0xpc3QuYWRkKGUpLHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudChcImxhenlMb2FkXCIsdCxuKX0sZS5MYXp5TG9hZGVyPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2luZGV4XCIsW1wiLi9mbGlja2l0eVwiLFwiLi9kcmFnXCIsXCIuL3ByZXYtbmV4dC1idXR0b25cIixcIi4vcGFnZS1kb3RzXCIsXCIuL3BsYXllclwiLFwiLi9hZGQtcmVtb3ZlLWNlbGxcIixcIi4vbGF6eWxvYWRcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCIuL2RyYWdcIikscmVxdWlyZShcIi4vcHJldi1uZXh0LWJ1dHRvblwiKSxyZXF1aXJlKFwiLi9wYWdlLWRvdHNcIikscmVxdWlyZShcIi4vcGxheWVyXCIpLHJlcXVpcmUoXCIuL2FkZC1yZW1vdmUtY2VsbFwiKSxyZXF1aXJlKFwiLi9sYXp5bG9hZFwiKSkpfSh3aW5kb3csZnVuY3Rpb24odCl7cmV0dXJuIHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS1hcy1uYXYtZm9yL2FzLW5hdi1mb3JcIixbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlLGkpe3JldHVybihlLXQpKmkrdH10LmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVBc05hdkZvclwiKTt2YXIgbj10LnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZXN0cm95XCIsdGhpcy5kZXN0cm95QXNOYXZGb3IpO3ZhciB0PXRoaXMub3B0aW9ucy5hc05hdkZvcjtpZih0KXt2YXIgZT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnNldE5hdkNvbXBhbmlvbih0KX0pfX0sbi5zZXROYXZDb21wYW5pb249ZnVuY3Rpb24oaSl7aT1lLmdldFF1ZXJ5RWxlbWVudChpKTt2YXIgbj10LmRhdGEoaSk7aWYobiYmbiE9dGhpcyl7dGhpcy5uYXZDb21wYW5pb249bjt2YXIgcz10aGlzO3RoaXMub25OYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24oKXtzLm5hdkNvbXBhbmlvblNlbGVjdCgpfSxuLm9uKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vbihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSx0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9fSxuLm5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbih0KXtpZih0aGlzLm5hdkNvbXBhbmlvbil7dmFyIGU9dGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxsc1swXSxuPXRoaXMubmF2Q29tcGFuaW9uLmNlbGxzLmluZGV4T2YoZSkscz1uK3RoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHMubGVuZ3RoLTEsbz1NYXRoLmZsb29yKGkobixzLHRoaXMubmF2Q29tcGFuaW9uLmNlbGxBbGlnbikpO2lmKHRoaXMuc2VsZWN0Q2VsbChvLCExLHQpLHRoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpLCEobz49dGhpcy5jZWxscy5sZW5ndGgpKXt2YXIgcj10aGlzLmNlbGxzLnNsaWNlKG4scysxKTt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHM9ci5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pLHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcImFkZFwiKX19fSxuLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5jbGFzc0xpc3RbdF0oXCJpcy1uYXYtc2VsZWN0ZWRcIil9KX0sbi5hY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfSxuLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHM9ZnVuY3Rpb24oKXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMmJih0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIiksZGVsZXRlIHRoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyl9LG4ub25OYXZTdGF0aWNDbGljaz1mdW5jdGlvbih0LGUsaSxuKXtcIm51bWJlclwiPT10eXBlb2YgbiYmdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0Q2VsbChuKX0sbi5kZWFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKX0sbi5kZXN0cm95QXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvbiYmKHRoaXMubmF2Q29tcGFuaW9uLm9mZihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub2ZmKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLGRlbGV0ZSB0aGlzLm5hdkNvbXBhbmlvbil9LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuaW1hZ2VzTG9hZGVkPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKFwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9ZnVuY3Rpb24gcyh0LGUsbyl7cmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBzPyhcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0KSksdGhpcy5lbGVtZW50cz1uKHQpLHRoaXMub3B0aW9ucz1pKHt9LHRoaXMub3B0aW9ucyksXCJmdW5jdGlvblwiPT10eXBlb2YgZT9vPWU6aSh0aGlzLm9wdGlvbnMsZSksbyYmdGhpcy5vbihcImFsd2F5c1wiLG8pLHRoaXMuZ2V0SW1hZ2VzKCksYSYmKHRoaXMuanFEZWZlcnJlZD1uZXcgYS5EZWZlcnJlZCksdm9pZCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5jaGVjaygpfS5iaW5kKHRoaXMpKSk6bmV3IHModCxlLG8pfWZ1bmN0aW9uIG8odCl7dGhpcy5pbWc9dH1mdW5jdGlvbiByKHQsZSl7dGhpcy51cmw9dCx0aGlzLmVsZW1lbnQ9ZSx0aGlzLmltZz1uZXcgSW1hZ2V9dmFyIGE9dC5qUXVlcnksbD10LmNvbnNvbGU7cy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSkscy5wcm90b3R5cGUub3B0aW9ucz17fSxzLnByb3RvdHlwZS5nZXRJbWFnZXM9ZnVuY3Rpb24oKXt0aGlzLmltYWdlcz1bXSx0aGlzLmVsZW1lbnRzLmZvckVhY2godGhpcy5hZGRFbGVtZW50SW1hZ2VzLHRoaXMpfSxzLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzPWZ1bmN0aW9uKHQpe1wiSU1HXCI9PXQubm9kZU5hbWUmJnRoaXMuYWRkSW1hZ2UodCksdGhpcy5vcHRpb25zLmJhY2tncm91bmQ9PT0hMCYmdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyh0KTt2YXIgZT10Lm5vZGVUeXBlO2lmKGUmJmhbZV0pe2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdcIiksbj0wO248aS5sZW5ndGg7bisrKXt2YXIgcz1pW25dO3RoaXMuYWRkSW1hZ2Uocyl9aWYoXCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKXt2YXIgbz10LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmJhY2tncm91bmQpO2ZvcihuPTA7bjxvLmxlbmd0aDtuKyspe3ZhciByPW9bbl07dGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyhyKX19fX07dmFyIGg9ezE6ITAsOTohMCwxMTohMH07cmV0dXJuIHMucHJvdG90eXBlLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzPWZ1bmN0aW9uKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7aWYoZSlmb3IodmFyIGk9L3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2ksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpO251bGwhPT1uOyl7dmFyIHM9biYmblsyXTtzJiZ0aGlzLmFkZEJhY2tncm91bmQocyx0KSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSl9fSxzLnByb3RvdHlwZS5hZGRJbWFnZT1mdW5jdGlvbih0KXt2YXIgZT1uZXcgbyh0KTt0aGlzLmltYWdlcy5wdXNoKGUpfSxzLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHIodCxlKTt0aGlzLmltYWdlcy5wdXNoKGkpfSxzLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpLG4pe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnByb2dyZXNzKHQsaSxuKX0pfXZhciBlPXRoaXM7cmV0dXJuIHRoaXMucHJvZ3Jlc3NlZENvdW50PTAsdGhpcy5oYXNBbnlCcm9rZW49ITEsdGhpcy5pbWFnZXMubGVuZ3RoP3ZvaWQgdGhpcy5pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlKXtlLm9uY2UoXCJwcm9ncmVzc1wiLHQpLGUuY2hlY2soKX0pOnZvaWQgdGhpcy5jb21wbGV0ZSgpfSxzLnByb3RvdHlwZS5wcm9ncmVzcz1mdW5jdGlvbih0LGUsaSl7dGhpcy5wcm9ncmVzc2VkQ291bnQrKyx0aGlzLmhhc0FueUJyb2tlbj10aGlzLmhhc0FueUJyb2tlbnx8IXQuaXNMb2FkZWQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHQsZV0pLHRoaXMuanFEZWZlcnJlZCYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSh0aGlzLHQpLHRoaXMucHJvZ3Jlc3NlZENvdW50PT10aGlzLmltYWdlcy5sZW5ndGgmJnRoaXMuY29tcGxldGUoKSx0aGlzLm9wdGlvbnMuZGVidWcmJmwmJmwubG9nKFwicHJvZ3Jlc3M6IFwiK2ksdCxlKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmhhc0FueUJyb2tlbj9cImZhaWxcIjpcImRvbmVcIjtpZih0aGlzLmlzQ29tcGxldGU9ITAsdGhpcy5lbWl0RXZlbnQodCxbdGhpc10pLHRoaXMuZW1pdEV2ZW50KFwiYWx3YXlzXCIsW3RoaXNdKSx0aGlzLmpxRGVmZXJyZWQpe3ZhciBlPXRoaXMuaGFzQW55QnJva2VuP1wicmVqZWN0XCI6XCJyZXNvbHZlXCI7dGhpcy5qcURlZmVycmVkW2VdKHRoaXMpfX0sby5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSksby5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3JldHVybiB0P3ZvaWQgdGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIik6KHRoaXMucHJveHlJbWFnZT1uZXcgSW1hZ2UsdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdm9pZCh0aGlzLnByb3h5SW1hZ2Uuc3JjPXRoaXMuaW1nLnNyYykpfSxvLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbWcuY29tcGxldGUmJnZvaWQgMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aH0sby5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5pbWcsZV0pfSxvLnByb3RvdHlwZS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LG8ucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMCxcIm9ubG9hZFwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCExLFwib25lcnJvclwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShvLnByb3RvdHlwZSksci5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLnVybDt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3QmJih0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKSx0aGlzLnVuYmluZEV2ZW50cygpKX0sci5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5lbGVtZW50LGVdKX0scy5tYWtlSlF1ZXJ5UGx1Z2luPWZ1bmN0aW9uKGUpe2U9ZXx8dC5qUXVlcnksZSYmKGE9ZSxhLmZuLmltYWdlc0xvYWRlZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyBzKHRoaXMsdCxlKTtyZXR1cm4gaS5qcURlZmVycmVkLnByb21pc2UoYSh0aGlzKSl9KX0scy5tYWtlSlF1ZXJ5UGx1Z2luKCksc30pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImltYWdlc2xvYWRlZFwiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LmltYWdlc0xvYWRlZCl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlSW1hZ2VzTG9hZGVkXCIpO3ZhciBuPWUucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVJbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmltYWdlc0xvYWRlZCl9LG4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGkpe3ZhciBuPWUuZ2V0UGFyZW50Q2VsbChpLmltZyk7ZS5jZWxsU2l6ZUNoYW5nZShuJiZuLmVsZW1lbnQpLGUub3B0aW9ucy5mcmVlU2Nyb2xsfHxlLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfWlmKHRoaXMub3B0aW9ucy5pbWFnZXNMb2FkZWQpe3ZhciBlPXRoaXM7aSh0aGlzLnNsaWRlcikub24oXCJwcm9ncmVzc1wiLHQpfX0sZX0pOyIsIi8qKlxuICogRmxpY2tpdHkgYmFja2dyb3VuZCBsYXp5bG9hZCB2MS4wLjBcbiAqIGxhenlsb2FkIGJhY2tncm91bmQgY2VsbCBpbWFnZXNcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2ZsaWNraXR5L2pzL2luZGV4JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdmbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgdXRpbHMgKSB7XG4vKmpzaGludCBzdHJpY3Q6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlQmdMYXp5TG9hZCcpO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVCZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLmJnTGF6eUxvYWQgKTtcbn07XG5cbnByb3RvLmJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxhenlMb2FkID0gdGhpcy5vcHRpb25zLmJnTGF6eUxvYWQ7XG4gIGlmICggIWxhenlMb2FkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGdldCBhZGphY2VudCBjZWxscywgdXNlIGxhenlMb2FkIG9wdGlvbiBmb3IgYWRqYWNlbnQgY291bnRcbiAgdmFyIGFkakNvdW50ID0gdHlwZW9mIGxhenlMb2FkID09ICdudW1iZXInID8gbGF6eUxvYWQgOiAwO1xuICB2YXIgY2VsbEVsZW1zID0gdGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyggYWRqQ291bnQgKTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2VsbEVsZW1zLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsRWxlbSA9IGNlbGxFbGVtc1tpXTtcbiAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjZWxsRWxlbSApO1xuICAgIC8vIHNlbGVjdCBsYXp5IGVsZW1zIGluIGNlbGxcbiAgICB2YXIgY2hpbGRyZW4gPSBjZWxsRWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZF0nKTtcbiAgICBmb3IgKCB2YXIgaj0wOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKysgKSB7XG4gICAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjaGlsZHJlbltqXSApO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8uYmdMYXp5TG9hZEVsZW0gPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xuICBpZiAoIGF0dHIgKSB7XG4gICAgbmV3IEJnTGF6eUxvYWRlciggZWxlbSwgYXR0ciwgdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMYXp5QkdMb2FkZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBjbGFzcyB0byBoYW5kbGUgbG9hZGluZyBpbWFnZXNcbiAqL1xuZnVuY3Rpb24gQmdMYXp5TG9hZGVyKCBlbGVtLCB1cmwsIGZsaWNraXR5ICkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5mbGlja2l0eSA9IGZsaWNraXR5O1xuICB0aGlzLmxvYWQoKTtcbn1cblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IHV0aWxzLmhhbmRsZUV2ZW50O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gbG9hZCBpbWFnZVxuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gcmVtb3ZlIGF0dHJcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyB0aGlzLnVybCArICcpJztcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5bG9hZGVkJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenllcnJvcicgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiggZXZlbnQsIGNsYXNzTmFtZSApIHtcbiAgLy8gdW5iaW5kIGV2ZW50c1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcbiAgdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KCAnYmdMYXp5TG9hZCcsIGV2ZW50LCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5CZ0xhenlMb2FkZXIgPSBCZ0xhenlMb2FkZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uIDEuMi4yN1xuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBzaW5nbGU6IHRydWUsIHRoaXM6IHRydWUsIG11bHRpdmFyOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xuXG4vLyBFeHBvc2UgcGx1Z2luIGFzIGFuIEFNRCBtb2R1bGUgaWYgQU1EIGxvYWRlciBpcyBwcmVzZW50OlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW3xcXFxce30oKVtcXF1eJCsqPy5dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9ICQubm9vcCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5raWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XG4gICAgICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLW5vLXN1Z2dlc3Rpb25cIj48L2Rpdj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gQXV0b2NvbXBsZXRlLnV0aWxzLmNyZWF0ZU5vZGUob3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcblxuICAgICAgICAgICAgLy8gT25seSBzZXQgd2lkdGggaWYgaXQgd2FzIHByb3ZpZGVkOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgb3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzaXRlU2VhcmNoRGl2ID0gJCgnLnNpdGUtc2VhcmNoJyk7XG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc2l0ZVNlYXJjaERpdi5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHNpdGVTZWFyY2hEaXYub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gc2l0ZVNlYXJjaERpdi5vdXRlcldpZHRoKCkgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byByZXN0b3JlIHZhbHVlIHdoZW4gXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXNlcnZlSW5wdXQgPT09IHRydWUsIFxuICAgICAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlIGRpZCBub3QgY2hhbmdlIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlLCBpKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lciwgdGhhdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHRoYXQuZWwub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgd2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE1hdGNoID0gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsdWUpID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xuICAgICAgICAgICAgICAgIHRoYXQuaGludCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGlzIHN0cmluZyBhcnJheSwgY29udmVydCB0aGVtIHRvIHN1cHBvcnRlZCBmb3JtYXQ6XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRhdGE6IG51bGwgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgIHJlc3VsdC5zdWdnZXN0aW9ucyA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQocmVzdWx0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubm9DYWNoZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmICFyZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXV0b2NvbXBsZXRlKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0pKTtcbiIsbnVsbF19
