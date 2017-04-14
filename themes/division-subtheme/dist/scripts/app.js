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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi50YWJzLmpzIiwibGF6eWxvYWQubWluLmpzIiwiZmxpY2tpdHkucGtnZC5taW4uanMiLCJmbGlja2l0eWJnLWxhenlsb2FkLmpzIiwianF1ZXJ5LWF1dG9jb21wbGV0ZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyIkIiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJsZW5ndGgiLCJuYW1lc3BhY2UiLCJNYXRoIiwicm91bmQiLCJwb3ciLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwicmVmbG93IiwiZWxlbSIsImkiLCIkZWxlbSIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwiZSIsIm9wdCIsIm1hcCIsImVsIiwidHJpbSIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImVuZCIsInQiLCJzdHlsZSIsInNldFRpbWVvdXQiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsIk1lZGlhUXVlcnkiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwbHVnQ2xhc3MiLCJ1bmRlZmluZWQiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsIndpbmRvdyIsImZuIiwiRGF0ZSIsIm5vdyIsImdldFRpbWUiLCJ2ZW5kb3JzIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImpRdWVyeSIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImVsZW1lbnQiLCJwYXJlbnQiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwicGFyRGltcyIsIm9mZnNldCIsImhlaWdodCIsIndpZHRoIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYXJSZWN0IiwicGFyZW50Tm9kZSIsIndpblJlY3QiLCJib2R5Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInBvc2l0aW9uIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJldmVudCIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsImV4dGVuZCIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJpcyIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCJlcSIsIiRsYXN0Rm9jdXNhYmxlIiwib24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwib2ZmIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm1hdGNoZWQiLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93Iiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJmaW5pc2giLCJoaWRlIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsImNoaWxkcmVuIiwiQnVybiIsIlRpbWVyIiwib3B0aW9ucyIsIm5hbWVTcGFjZSIsInJlbWFpbiIsImlzUGF1c2VkIiwicmVzdGFydCIsImluZmluaXRlIiwicGF1c2UiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwiY29tcGxldGUiLCJyZWFkeVN0YXRlIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcmMiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwiZG9jdW1lbnRFbGVtZW50IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXQiLCJ0ZWFyZG93biIsInNwZWNpYWwiLCJzd2lwZSIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwiY2xvc2VtZUxpc3RlbmVyIiwieWV0aUJveGVzIiwicGx1Z05hbWVzIiwibGlzdGVuZXJzIiwiam9pbiIsInBsdWdpbklkIiwibm90IiwiZGVib3VuY2UiLCIkbm9kZXMiLCJub2RlcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uIiwibXV0YXRpb25SZWNvcmRzTGlzdCIsIiR0YXJnZXQiLCJhdHRyaWJ1dGVOYW1lIiwiY2xvc2VzdCIsImVsZW1lbnRPYnNlcnZlciIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJJSGVhcllvdSIsIkFjY29yZGlvbiIsImRlZmF1bHRzIiwiJHRhYnMiLCJpZHgiLCIkY29udGVudCIsImxpbmtJZCIsIiRpbml0QWN0aXZlIiwiZmlyc3RUaW1lSW5pdCIsImRvd24iLCJfY2hlY2tEZWVwTGluayIsImxvY2F0aW9uIiwiaGFzaCIsIiRsaW5rIiwiJGFuY2hvciIsImhhc0NsYXNzIiwiZGVlcExpbmtTbXVkZ2UiLCJsb2FkIiwic2Nyb2xsVG9wIiwiZGVlcExpbmtTbXVkZ2VEZWxheSIsImRlZXBMaW5rIiwiX2V2ZW50cyIsIiR0YWJDb250ZW50IiwidG9nZ2xlIiwibmV4dCIsIiRhIiwibXVsdGlFeHBhbmQiLCJwcmV2aW91cyIsInByZXYiLCJ1cCIsInVwZGF0ZUhpc3RvcnkiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwicmVwbGFjZVN0YXRlIiwiZmlyc3RUaW1lIiwiJGN1cnJlbnRBY3RpdmUiLCJzbGlkZURvd24iLCJzbGlkZVNwZWVkIiwiJGF1bnRzIiwic2libGluZ3MiLCJhbGxvd0FsbENsb3NlZCIsInNsaWRlVXAiLCJzdG9wIiwiSW50ZXJjaGFuZ2UiLCJydWxlcyIsImN1cnJlbnRQYXRoIiwiX2FkZEJyZWFrcG9pbnRzIiwiX2dlbmVyYXRlUnVsZXMiLCJfcmVmbG93IiwibWF0Y2giLCJydWxlIiwicGF0aCIsIlNQRUNJQUxfUVVFUklFUyIsInJ1bGVzTGlzdCIsIm5vZGVOYW1lIiwicmVzcG9uc2UiLCJodG1sIiwiT2ZmQ2FudmFzIiwiJGxhc3RUcmlnZ2VyIiwiJHRyaWdnZXJzIiwidHJhbnNpdGlvbiIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsInNldEF0dHJpYnV0ZSIsIiRvdmVybGF5IiwiYXBwZW5kIiwiaXNSZXZlYWxlZCIsIlJlZ0V4cCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJvcGVuIiwiY2xvc2UiLCJfaGFuZGxlS2V5Ym9hcmQiLCJjbG9zZU9uQ2xpY2siLCJyZXZlYWwiLCIkY2xvc2VyIiwic2Nyb2xsSGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiYWxsb3dVcCIsImFsbG93RG93biIsImxhc3RZIiwib3JpZ2luYWxFdmVudCIsImZvcmNlVG8iLCJzY3JvbGxUbyIsImNvbnRlbnRTY3JvbGwiLCJfc3RvcFNjcm9sbGluZyIsIl9yZWNvcmRTY3JvbGxhYmxlIiwiX3N0b3BTY3JvbGxQcm9wYWdhdGlvbiIsImF1dG9Gb2N1cyIsImNhbnZhc0ZvY3VzIiwiVGFicyIsIiR0YWJUaXRsZXMiLCJsaW5rQ2xhc3MiLCJpc0FjdGl2ZSIsImxpbmtBY3RpdmVDbGFzcyIsIm1hdGNoSGVpZ2h0IiwiJGltYWdlcyIsIl9zZXRIZWlnaHQiLCJzZWxlY3RUYWIiLCJfYWRkS2V5SGFuZGxlciIsIl9hZGRDbGlja0hhbmRsZXIiLCJfc2V0SGVpZ2h0TXFIYW5kbGVyIiwiX2hhbmRsZVRhYkNoYW5nZSIsIiRlbGVtZW50cyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIndyYXBPbktleXMiLCJsYXN0IiwibWluIiwiaGlzdG9yeUhhbmRsZWQiLCJhY3RpdmVDb2xsYXBzZSIsIl9jb2xsYXBzZVRhYiIsIiRvbGRUYWIiLCIkdGFiTGluayIsIiR0YXJnZXRDb250ZW50IiwiX29wZW5UYWIiLCJwYW5lbEFjdGl2ZUNsYXNzIiwiJHRhcmdldF9hbmNob3IiLCJpZFN0ciIsInBhbmVsQ2xhc3MiLCJwYW5lbCIsInRlbXAiLCJhIiwiYiIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJMYXp5TG9hZCIsIm93bmVyRG9jdW1lbnQiLCJjbGllbnRUb3AiLCJjIiwiZCIsImlubmVySGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwiY2xpZW50TGVmdCIsImlubmVyV2lkdGgiLCJmIiwiZyIsImgiLCJqIiwiZWxlbWVudHNfc2VsZWN0b3IiLCJjb250YWluZXIiLCJ0aHJlc2hvbGQiLCJkYXRhX3NyYyIsImRhdGFfc3Jjc2V0IiwiY2xhc3NfbG9hZGluZyIsImNsYXNzX2xvYWRlZCIsImNsYXNzX2Vycm9yIiwic2tpcF9pbnZpc2libGUiLCJjYWxsYmFja19sb2FkIiwiY2FsbGJhY2tfZXJyb3IiLCJjYWxsYmFja19zZXQiLCJjYWxsYmFja19wcm9jZXNzZWQiLCJfc2V0dGluZ3MiLCJhc3NpZ24iLCJfcXVlcnlPcmlnaW5Ob2RlIiwiX3ByZXZpb3VzTG9vcFRpbWUiLCJfbG9vcFRpbWVvdXQiLCJfYm91bmRIYW5kbGVTY3JvbGwiLCJoYW5kbGVTY3JvbGwiLCJ1cGRhdGUiLCJwYXJlbnRFbGVtZW50IiwidGFnTmFtZSIsImdldEF0dHJpYnV0ZSIsIl9zZXRTb3VyY2VzRm9yUGljdHVyZSIsImJhY2tncm91bmRJbWFnZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsIl9zZXRTb3VyY2VzIiwiX2VsZW1lbnRzIiwib2Zmc2V0UGFyZW50IiwiX3Nob3dPbkFwcGVhciIsIndhc1Byb2Nlc3NlZCIsInBvcCIsIl9zdG9wU2Nyb2xsSGFuZGxlciIsIl9pc0hhbmRsaW5nU2Nyb2xsIiwiX2xvb3BUaHJvdWdoRWxlbWVudHMiLCJfcHVyZ2VFbGVtZW50cyIsIl9zdGFydFNjcm9sbEhhbmRsZXIiLCJyZXF1aXJlIiwialF1ZXJ5QnJpZGdldCIsIm8iLCJsIiwibiIsInMiLCJyIiwiY2hhckF0Iiwib3B0aW9uIiwiaXNQbGFpbk9iamVjdCIsImJyaWRnZXQiLCJFdkVtaXR0ZXIiLCJvbmNlIiwiX29uY2VFdmVudHMiLCJlbWl0RXZlbnQiLCJnZXRTaXplIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwicGFkZGluZyIsImJvcmRlclN0eWxlIiwiYm9yZGVyV2lkdGgiLCJib3hTaXppbmciLCJhcHBlbmRDaGlsZCIsImlzQm94U2l6ZU91dGVyIiwicmVtb3ZlQ2hpbGQiLCJxdWVyeVNlbGVjdG9yIiwibm9kZVR5cGUiLCJkaXNwbGF5IiwiaXNCb3JkZXJCb3giLCJ1IiwidiIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJtIiwibWFyZ2luTGVmdCIsIm1hcmdpblJpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiUyIsImJvcmRlckxlZnRXaWR0aCIsImJvcmRlclJpZ2h0V2lkdGgiLCJFIiwiYm9yZGVyVG9wV2lkdGgiLCJib3JkZXJCb3R0b21XaWR0aCIsIkMiLCJtYXRjaGVzU2VsZWN0b3IiLCJFbGVtZW50IiwiZml6enlVSVV0aWxzIiwibW9kdWxvIiwibWFrZUFycmF5IiwicmVtb3ZlRnJvbSIsImdldFBhcmVudCIsImdldFF1ZXJ5RWxlbWVudCIsImhhbmRsZUV2ZW50IiwiZmlsdGVyRmluZEVsZW1lbnRzIiwiSFRNTEVsZW1lbnQiLCJkZWJvdW5jZU1ldGhvZCIsImRvY1JlYWR5IiwidG9EYXNoZWQiLCJodG1sSW5pdCIsIkpTT04iLCJwYXJzZSIsIkZsaWNraXR5IiwiQ2VsbCIsImNyZWF0ZSIsInNoaWZ0IiwiZGVzdHJveSIsIm9yaWdpblNpZGUiLCJzZXRQb3NpdGlvbiIsInVwZGF0ZVRhcmdldCIsInJlbmRlclBvc2l0aW9uIiwic2V0RGVmYXVsdFRhcmdldCIsImNlbGxBbGlnbiIsImdldFBvc2l0aW9uVmFsdWUiLCJ3cmFwU2hpZnQiLCJzbGlkZWFibGVXaWR0aCIsIlNsaWRlIiwiaXNPcmlnaW5MZWZ0IiwiY2VsbHMiLCJhZGRDZWxsIiwiZmlyc3RNYXJnaW4iLCJnZXRMYXN0Q2VsbCIsInNlbGVjdCIsImNoYW5nZVNlbGVjdGVkQ2xhc3MiLCJ1bnNlbGVjdCIsImdldENlbGxFbGVtZW50cyIsImFuaW1hdGVQcm90b3R5cGUiLCJ3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzdGFydEFuaW1hdGlvbiIsImlzQW5pbWF0aW5nIiwicmVzdGluZ0ZyYW1lcyIsImFwcGx5RHJhZ0ZvcmNlIiwiYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24iLCJpbnRlZ3JhdGVQaHlzaWNzIiwicG9zaXRpb25TbGlkZXIiLCJzZXR0bGUiLCJ0cmFuc2Zvcm0iLCJ3cmFwQXJvdW5kIiwic2hpZnRXcmFwQ2VsbHMiLCJjdXJzb3JQb3NpdGlvbiIsInJpZ2h0VG9MZWZ0Iiwic2xpZGVyIiwic2xpZGVzIiwic2xpZGVzV2lkdGgiLCJwb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQiLCJzZWxlY3RlZFNsaWRlIiwicGVyY2VudFBvc2l0aW9uIiwiaXNQb2ludGVyRG93biIsImlzRnJlZVNjcm9sbGluZyIsIl9zaGlmdENlbGxzIiwiYmVmb3JlU2hpZnRDZWxscyIsImFmdGVyU2hpZnRDZWxscyIsIl91bnNoaWZ0Q2VsbHMiLCJ2ZWxvY2l0eSIsImdldEZyaWN0aW9uRmFjdG9yIiwiYXBwbHlGb3JjZSIsImdldFJlc3RpbmdQb3NpdGlvbiIsImRyYWdYIiwic2VsZWN0ZWRBdHRyYWN0aW9uIiwiZmxpY2tpdHlHVUlEIiwiX2NyZWF0ZSIsImFjY2Vzc2liaWxpdHkiLCJmcmVlU2Nyb2xsRnJpY3Rpb24iLCJmcmljdGlvbiIsIm5hbWVzcGFjZUpRdWVyeUV2ZW50cyIsInJlc2l6ZSIsInNldEdhbGxlcnlTaXplIiwiY3JlYXRlTWV0aG9kcyIsImd1aWQiLCJzZWxlY3RlZEluZGV4Iiwidmlld3BvcnQiLCJfY3JlYXRlU2xpZGVyIiwid2F0Y2hDU1MiLCJhY3RpdmF0ZSIsIl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzIiwicmVsb2FkQ2VsbHMiLCJ0YWJJbmRleCIsImluaXRpYWxJbmRleCIsImlzSW5pdEFjdGl2YXRlZCIsImNlbGxTZWxlY3RvciIsIl9tYWtlQ2VsbHMiLCJwb3NpdGlvbkNlbGxzIiwiX2dldFdyYXBTaGlmdENlbGxzIiwiZ2V0TGFzdFNsaWRlIiwiX3NpemVDZWxscyIsIl9wb3NpdGlvbkNlbGxzIiwibWF4Q2VsbEhlaWdodCIsInVwZGF0ZVNsaWRlcyIsIl9jb250YWluU2xpZGVzIiwiX2dldENhbkNlbGxGaXQiLCJ1cGRhdGVTZWxlY3RlZFNsaWRlIiwiZ3JvdXBDZWxscyIsInBhcnNlSW50IiwicmVwb3NpdGlvbiIsInNldENlbGxBbGlnbiIsImNlbnRlciIsImFkYXB0aXZlSGVpZ2h0IiwiX2dldEdhcENlbGxzIiwiY29udGFpbiIsIkV2ZW50IiwiX3dyYXBTZWxlY3QiLCJpc0RyYWdTZWxlY3QiLCJ1bnNlbGVjdFNlbGVjdGVkU2xpZGUiLCJzZWxlY3RlZENlbGxzIiwic2VsZWN0ZWRFbGVtZW50cyIsInNlbGVjdGVkQ2VsbCIsInNlbGVjdGVkRWxlbWVudCIsInNlbGVjdENlbGwiLCJnZXRDZWxsIiwiZ2V0Q2VsbHMiLCJnZXRQYXJlbnRDZWxsIiwiZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMiLCJ1aUNoYW5nZSIsImNoaWxkVUlQb2ludGVyRG93biIsIm9ucmVzaXplIiwiY29udGVudCIsImRlYWN0aXZhdGUiLCJvbmtleWRvd24iLCJhY3RpdmVFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwiVW5pcG9pbnRlciIsImJpbmRTdGFydEV2ZW50IiwiX2JpbmRTdGFydEV2ZW50IiwidW5iaW5kU3RhcnRFdmVudCIsInBvaW50ZXJFbmFibGVkIiwibXNQb2ludGVyRW5hYmxlZCIsImdldFRvdWNoIiwiaWRlbnRpZmllciIsInBvaW50ZXJJZGVudGlmaWVyIiwib25tb3VzZWRvd24iLCJidXR0b24iLCJfcG9pbnRlckRvd24iLCJvbnRvdWNoc3RhcnQiLCJvbk1TUG9pbnRlckRvd24iLCJvbnBvaW50ZXJkb3duIiwicG9pbnRlcklkIiwicG9pbnRlckRvd24iLCJfYmluZFBvc3RTdGFydEV2ZW50cyIsIm1vdXNlZG93biIsInBvaW50ZXJkb3duIiwiTVNQb2ludGVyRG93biIsIl9ib3VuZFBvaW50ZXJFdmVudHMiLCJfdW5iaW5kUG9zdFN0YXJ0RXZlbnRzIiwib25tb3VzZW1vdmUiLCJfcG9pbnRlck1vdmUiLCJvbk1TUG9pbnRlck1vdmUiLCJvbnBvaW50ZXJtb3ZlIiwib250b3VjaG1vdmUiLCJwb2ludGVyTW92ZSIsIm9ubW91c2V1cCIsIl9wb2ludGVyVXAiLCJvbk1TUG9pbnRlclVwIiwib25wb2ludGVydXAiLCJvbnRvdWNoZW5kIiwiX3BvaW50ZXJEb25lIiwicG9pbnRlclVwIiwicG9pbnRlckRvbmUiLCJvbk1TUG9pbnRlckNhbmNlbCIsIm9ucG9pbnRlcmNhbmNlbCIsIl9wb2ludGVyQ2FuY2VsIiwib250b3VjaGNhbmNlbCIsInBvaW50ZXJDYW5jZWwiLCJnZXRQb2ludGVyUG9pbnQiLCJVbmlkcmFnZ2VyIiwiYmluZEhhbmRsZXMiLCJfYmluZEhhbmRsZXMiLCJ1bmJpbmRIYW5kbGVzIiwidG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwiaGFuZGxlcyIsIl9kcmFnUG9pbnRlckRvd24iLCJibHVyIiwicG9pbnRlckRvd25Qb2ludCIsImNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biIsIl9kcmFnUG9pbnRlck1vdmUiLCJfZHJhZ01vdmUiLCJpc0RyYWdnaW5nIiwiaGFzRHJhZ1N0YXJ0ZWQiLCJfZHJhZ1N0YXJ0IiwiX2RyYWdQb2ludGVyVXAiLCJfZHJhZ0VuZCIsIl9zdGF0aWNDbGljayIsImRyYWdTdGFydFBvaW50IiwiaXNQcmV2ZW50aW5nQ2xpY2tzIiwiZHJhZ1N0YXJ0IiwiZHJhZ01vdmUiLCJkcmFnRW5kIiwib25jbGljayIsImlzSWdub3JpbmdNb3VzZVVwIiwic3RhdGljQ2xpY2siLCJkcmFnZ2FibGUiLCJkcmFnVGhyZXNob2xkIiwiX2NyZWF0ZURyYWciLCJiaW5kRHJhZyIsIl91aUNoYW5nZURyYWciLCJfY2hpbGRVSVBvaW50ZXJEb3duRHJhZyIsInVuYmluZERyYWciLCJpc0RyYWdCb3VuZCIsInBvaW50ZXJEb3duRm9jdXMiLCJURVhUQVJFQSIsIklOUFVUIiwiT1BUSU9OIiwicmFkaW8iLCJjaGVja2JveCIsInN1Ym1pdCIsImltYWdlIiwiZmlsZSIsInBvaW50ZXJEb3duU2Nyb2xsIiwiU0VMRUNUIiwiaXNUb3VjaFNjcm9sbGluZyIsImRyYWdTdGFydFBvc2l0aW9uIiwicHJldmlvdXNEcmFnWCIsImRyYWdNb3ZlVGltZSIsImZyZWVTY3JvbGwiLCJkcmFnRW5kUmVzdGluZ1NlbGVjdCIsImRyYWdFbmRCb29zdFNlbGVjdCIsImdldFNsaWRlRGlzdGFuY2UiLCJfZ2V0Q2xvc2VzdFJlc3RpbmciLCJkaXN0YW5jZSIsImluZGV4IiwiZmxvb3IiLCJvbnNjcm9sbCIsIlRhcExpc3RlbmVyIiwiYmluZFRhcCIsInVuYmluZFRhcCIsInRhcEVsZW1lbnQiLCJkaXJlY3Rpb24iLCJ4MCIsIngxIiwieTEiLCJ4MiIsInkyIiwieDMiLCJpc0VuYWJsZWQiLCJpc1ByZXZpb3VzIiwiaXNMZWZ0IiwiZGlzYWJsZSIsImNyZWF0ZVNWRyIsIm9uVGFwIiwiY3JlYXRlRWxlbWVudE5TIiwiYXJyb3dTaGFwZSIsImVuYWJsZSIsImRpc2FibGVkIiwicHJldk5leHRCdXR0b25zIiwiX2NyZWF0ZVByZXZOZXh0QnV0dG9ucyIsInByZXZCdXR0b24iLCJuZXh0QnV0dG9uIiwiYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJkZWFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiUHJldk5leHRCdXR0b24iLCJob2xkZXIiLCJkb3RzIiwic2V0RG90cyIsImFkZERvdHMiLCJyZW1vdmVEb3RzIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsInVwZGF0ZVNlbGVjdGVkIiwic2VsZWN0ZWREb3QiLCJQYWdlRG90cyIsInBhZ2VEb3RzIiwiX2NyZWF0ZVBhZ2VEb3RzIiwiYWN0aXZhdGVQYWdlRG90cyIsInVwZGF0ZVNlbGVjdGVkUGFnZURvdHMiLCJ1cGRhdGVQYWdlRG90cyIsImRlYWN0aXZhdGVQYWdlRG90cyIsInN0YXRlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwidmlzaWJpbGl0eUNoYW5nZSIsIm9uVmlzaWJpbGl0eVBsYXkiLCJ2aXNpYmlsaXR5UGxheSIsInBsYXkiLCJ0aWNrIiwiYXV0b1BsYXkiLCJjbGVhciIsInRpbWVvdXQiLCJ1bnBhdXNlIiwicGF1c2VBdXRvUGxheU9uSG92ZXIiLCJfY3JlYXRlUGxheWVyIiwicGxheWVyIiwiYWN0aXZhdGVQbGF5ZXIiLCJzdG9wUGxheWVyIiwiZGVhY3RpdmF0ZVBsYXllciIsInBsYXlQbGF5ZXIiLCJwYXVzZVBsYXllciIsInVucGF1c2VQbGF5ZXIiLCJvbm1vdXNlZW50ZXIiLCJvbm1vdXNlbGVhdmUiLCJQbGF5ZXIiLCJpbnNlcnQiLCJfY2VsbEFkZGVkUmVtb3ZlZCIsInByZXBlbmQiLCJjZWxsQ2hhbmdlIiwiY2VsbFNpemVDaGFuZ2UiLCJpbWciLCJmbGlja2l0eSIsIl9jcmVhdGVMYXp5bG9hZCIsImxhenlMb2FkIiwib25sb2FkIiwib25lcnJvciIsIkxhenlMb2FkZXIiLCJfY3JlYXRlQXNOYXZGb3IiLCJhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVzdHJveUFzTmF2Rm9yIiwiYXNOYXZGb3IiLCJzZXROYXZDb21wYW5pb24iLCJuYXZDb21wYW5pb24iLCJvbk5hdkNvbXBhbmlvblNlbGVjdCIsIm5hdkNvbXBhbmlvblNlbGVjdCIsIm9uTmF2U3RhdGljQ2xpY2siLCJyZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzIiwibmF2U2VsZWN0ZWRFbGVtZW50cyIsImNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MiLCJpbWFnZXNMb2FkZWQiLCJlbGVtZW50cyIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwidXJsIiwiSW1hZ2UiLCJhZGRFbGVtZW50SW1hZ2VzIiwiYWRkSW1hZ2UiLCJiYWNrZ3JvdW5kIiwiYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMiLCJhZGRCYWNrZ3JvdW5kIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc2VkQ291bnQiLCJoYXNBbnlCcm9rZW4iLCJpc0xvYWRlZCIsIm5vdGlmeSIsImRlYnVnIiwibG9nIiwiaXNDb21wbGV0ZSIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwidW5iaW5kRXZlbnRzIiwibWFrZUpRdWVyeVBsdWdpbiIsInByb21pc2UiLCJfY3JlYXRlSW1hZ2VzTG9hZGVkIiwiZmFjdG9yeSIsInV0aWxzIiwicHJvdG8iLCJfY3JlYXRlQmdMYXp5TG9hZCIsImJnTGF6eUxvYWQiLCJhZGpDb3VudCIsImNlbGxFbGVtcyIsImNlbGxFbGVtIiwiYmdMYXp5TG9hZEVsZW0iLCJCZ0xhenlMb2FkZXIiLCJlc2NhcGVSZWdFeENoYXJzIiwiY3JlYXRlTm9kZSIsImNvbnRhaW5lckNsYXNzIiwiZGl2IiwiRVNDIiwiVEFCIiwiUkVUVVJOIiwiTEVGVCIsIlVQIiwiUklHSFQiLCJET1dOIiwiQXV0b2NvbXBsZXRlIiwidGhhdCIsImFqYXhTZXR0aW5ncyIsImF1dG9TZWxlY3RGaXJzdCIsInNlcnZpY2VVcmwiLCJsb29rdXAiLCJvblNlbGVjdCIsIm1pbkNoYXJzIiwibWF4SGVpZ2h0IiwiZGVmZXJSZXF1ZXN0QnkiLCJwYXJhbXMiLCJmb3JtYXRSZXN1bHQiLCJkZWxpbWl0ZXIiLCJ6SW5kZXgiLCJub0NhY2hlIiwib25TZWFyY2hTdGFydCIsIm9uU2VhcmNoQ29tcGxldGUiLCJvblNlYXJjaEVycm9yIiwicHJlc2VydmVJbnB1dCIsInRhYkRpc2FibGVkIiwiZGF0YVR5cGUiLCJjdXJyZW50UmVxdWVzdCIsInRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQiLCJwcmV2ZW50QmFkUXVlcmllcyIsImxvb2t1cEZpbHRlciIsInN1Z2dlc3Rpb24iLCJvcmlnaW5hbFF1ZXJ5IiwicXVlcnlMb3dlckNhc2UiLCJwYXJhbU5hbWUiLCJ0cmFuc2Zvcm1SZXN1bHQiLCJwYXJzZUpTT04iLCJzaG93Tm9TdWdnZXN0aW9uTm90aWNlIiwibm9TdWdnZXN0aW9uTm90aWNlIiwib3JpZW50YXRpb24iLCJmb3JjZUZpeFBvc2l0aW9uIiwic3VnZ2VzdGlvbnMiLCJiYWRRdWVyaWVzIiwiY3VycmVudFZhbHVlIiwiaW50ZXJ2YWxJZCIsImNhY2hlZFJlc3BvbnNlIiwib25DaGFuZ2VJbnRlcnZhbCIsIm9uQ2hhbmdlIiwiaXNMb2NhbCIsInN1Z2dlc3Rpb25zQ29udGFpbmVyIiwibm9TdWdnZXN0aW9uc0NvbnRhaW5lciIsImNsYXNzZXMiLCJzZWxlY3RlZCIsImhpbnQiLCJoaW50VmFsdWUiLCJzZWxlY3Rpb24iLCJpbml0aWFsaXplIiwic2V0T3B0aW9ucyIsInBhdHRlcm4iLCJraWxsZXJGbiIsInN1Z2dlc3Rpb25TZWxlY3RvciIsImtpbGxTdWdnZXN0aW9ucyIsImRpc2FibGVLaWxsZXJGbiIsImZpeFBvc2l0aW9uQ2FwdHVyZSIsInZpc2libGUiLCJmaXhQb3NpdGlvbiIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwib25CbHVyIiwib25Gb2N1cyIsIm9uVmFsdWVDaGFuZ2UiLCJlbmFibGVLaWxsZXJGbiIsImFib3J0QWpheCIsImFib3J0Iiwic3VwcGxpZWRPcHRpb25zIiwidmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQiLCJ2YWxpZGF0ZU9yaWVudGF0aW9uIiwiY2xlYXJDYWNoZSIsImNsZWFySW50ZXJ2YWwiLCIkY29udGFpbmVyIiwiY29udGFpbmVyUGFyZW50Iiwic2l0ZVNlYXJjaERpdiIsImNvbnRhaW5lckhlaWdodCIsInN0eWxlcyIsInZpZXdQb3J0SGVpZ2h0IiwidG9wT3ZlcmZsb3ciLCJib3R0b21PdmVyZmxvdyIsIm9wYWNpdHkiLCJwYXJlbnRPZmZzZXREaWZmIiwic3RvcEtpbGxTdWdnZXN0aW9ucyIsInNldEludGVydmFsIiwiaXNDdXJzb3JBdEVuZCIsInZhbExlbmd0aCIsInNlbGVjdGlvblN0YXJ0IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsIm1vdmVTdGFydCIsInN1Z2dlc3QiLCJvbkhpbnQiLCJzZWxlY3RIaW50IiwibW92ZVVwIiwibW92ZURvd24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJmaW5kQmVzdEhpbnQiLCJnZXRRdWVyeSIsIm9uSW52YWxpZGF0ZVNlbGVjdGlvbiIsImlzRXhhY3RNYXRjaCIsImdldFN1Z2dlc3Rpb25zIiwiZ2V0U3VnZ2VzdGlvbnNMb2NhbCIsImxpbWl0IiwibG9va3VwTGltaXQiLCJncmVwIiwicSIsImNhY2hlS2V5IiwiaWdub3JlUGFyYW1zIiwiaXNGdW5jdGlvbiIsImlzQmFkUXVlcnkiLCJhamF4IiwiZG9uZSIsInJlc3VsdCIsInByb2Nlc3NSZXNwb25zZSIsImZhaWwiLCJqcVhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIm9uSGlkZSIsInNpZ25hbEhpbnQiLCJub1N1Z2dlc3Rpb25zIiwiZ3JvdXBCeSIsImNsYXNzU2VsZWN0ZWQiLCJiZWZvcmVSZW5kZXIiLCJjYXRlZ29yeSIsImZvcm1hdEdyb3VwIiwiY3VycmVudENhdGVnb3J5IiwiYWRqdXN0Q29udGFpbmVyV2lkdGgiLCJkZXRhY2giLCJlbXB0eSIsImJlc3RNYXRjaCIsImZvdW5kTWF0Y2giLCJzdWJzdHIiLCJmYWxsYmFjayIsImluQXJyYXkiLCJhY3RpdmVJdGVtIiwiYWRqdXN0U2Nyb2xsIiwib2Zmc2V0VG9wIiwidXBwZXJCb3VuZCIsImxvd2VyQm91bmQiLCJoZWlnaHREZWx0YSIsImdldFZhbHVlIiwib25TZWxlY3RDYWxsYmFjayIsImRpc3Bvc2UiLCJhdXRvY29tcGxldGUiLCJkZXZicmlkZ2VBdXRvY29tcGxldGUiLCJkYXRhS2V5IiwiaW5wdXRFbGVtZW50IiwiaW5zdGFuY2UiLCJiYXNlcyIsImJhc2VIcmVmIiwiaHJlZiIsIm15TGF6eUxvYWQiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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VztBQUM1QyxLQUFJZzdCLE9BQU9sL0IsRUFBRSxJQUFGLENBQVg7QUFDQSxLQUFJcXBDLFFBQVFuSyxLQUFLNzlCLElBQUwsQ0FBVSxPQUFWLENBQVo7QUFDQSxLQUFJd0ksUUFBUTdKLEVBQUUsS0FBRixFQUFTay9CLElBQVQsRUFBZXIxQixLQUFmLEVBQVo7QUFDQSxLQUFJRCxTQUFTNUosRUFBRSxLQUFGLEVBQVNrL0IsSUFBVCxFQUFldDFCLE1BQWYsRUFBYjtBQUNBczFCLE1BQUtoMkIsTUFBTCxHQUFjOEksUUFBZCxDQUF1QixJQUF2QjtBQUNBa3RCLE1BQUtoMkIsTUFBTCxHQUFjc3hCLE9BQWQsQ0FBc0Isa0ZBQWtGNk8sS0FBbEYsR0FBMEYsNEJBQTFGLEdBQXlIeC9CLEtBQXpILEdBQWlJLFlBQWpJLEdBQWdKRCxNQUFoSixHQUF5Siw0RkFBL0s7QUFDQXMxQixNQUFLN3NCLElBQUw7QUFDQW5PLEdBQUV1SixjQUFGO0FBQ0EsQ0FURDs7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBL1RBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY0LjAuNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFZhcmlhYmxlc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIC8vIGNhY2hlIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXHQgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IHR5cGVcblx0ICB2YXIgY3VycmVudElucHV0ID0gJ2luaXRpYWwnO1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IGludGVudFxuXHQgIHZhciBjdXJyZW50SW50ZW50ID0gbnVsbDtcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFtcblx0ICAgICdpbnB1dCcsXG5cdCAgICAnc2VsZWN0Jyxcblx0ICAgICd0ZXh0YXJlYSdcblx0ICBdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFtcblx0ICAgIDE2LCAvLyBzaGlmdFxuXHQgICAgMTcsIC8vIGNvbnRyb2xcblx0ICAgIDE4LCAvLyBhbHRcblx0ICAgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgICA5MyAgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAgJ2tleXVwJzogJ2tleWJvYXJkJyxcblx0ICAgICdtb3VzZWRvd24nOiAnbW91c2UnLFxuXHQgICAgJ21vdXNlbW92ZSc6ICdtb3VzZScsXG5cdCAgICAnTVNQb2ludGVyRG93bic6ICdwb2ludGVyJyxcblx0ICAgICdNU1BvaW50ZXJNb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJtb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3RvdWNoc3RhcnQnOiAndG91Y2gnXG5cdCAgfTtcblxuXHQgIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIHRpbWVyIGlzIHJ1bm5pbmdcblx0ICB2YXIgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgIC8vIG1hcCBvZiBJRSAxMCBwb2ludGVyIGV2ZW50c1xuXHQgIHZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cdCAgfTtcblxuXHQgIC8vIHRvdWNoIGJ1ZmZlciB0aW1lclxuXHQgIHZhciB0b3VjaFRpbWVyID0gbnVsbDtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgU2V0IHVwXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICAgIHNldElucHV0KCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgRXZlbnRzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBgcG9pbnRlcm1vdmVgLCBgTVNQb2ludGVyTW92ZWAsIGBtb3VzZW1vdmVgIGFuZCBtb3VzZSB3aGVlbCBldmVudCBiaW5kaW5nXG5cdCAgICAvLyBjYW4gb25seSBkZW1vbnN0cmF0ZSBwb3RlbnRpYWwsIGJ1dCBub3QgYWN0dWFsLCBpbnRlcmFjdGlvblxuXHQgICAgLy8gYW5kIGFyZSB0cmVhdGVkIHNlcGFyYXRlbHlcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAgIC8vIHRvdWNoIGV2ZW50c1xuXHQgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG5cdCAgICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hCdWZmZXIpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIG1vdXNlIHdoZWVsXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50KTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlSW5wdXQpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHVwZGF0ZUlucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoXG5cdCAgICAgICAgY3VycmVudElucHV0ICE9PSB2YWx1ZSB8fFxuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlXG5cdCAgICAgICkge1xuXG5cdCAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICAgIHZhciBhY3RpdmVJbnB1dCA9IChcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0gJiZcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiZcblx0ICAgICAgICAgIGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMVxuXHQgICAgICAgICkgPyB0cnVlIDogZmFsc2U7XG5cblx0ICAgICAgICBpZiAoXG5cdCAgICAgICAgICB2YWx1ZSA9PT0gJ3RvdWNoJyB8fFxuXG5cdCAgICAgICAgICAvLyBpZ25vcmUgbW91c2UgbW9kaWZpZXIga2V5c1xuXHQgICAgICAgICAgKHZhbHVlID09PSAnbW91c2UnICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTEpIHx8XG5cblx0ICAgICAgICAgIC8vIGRvbid0IHN3aXRjaCBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIGEgZm9ybSBpbnB1dFxuXHQgICAgICAgICAgKHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGFjdGl2ZUlucHV0KVxuXHQgICAgICAgICkge1xuXG5cdCAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgYW5kIGNhdGNoLWFsbCB2YXJpYWJsZVxuXHQgICAgICAgICAgY3VycmVudElucHV0ID0gY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgICBzZXRJbnB1dCgpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIHRoZSBkb2MgYW5kIGBpbnB1dFR5cGVzYCBhcnJheSB3aXRoIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0JywgY3VycmVudElucHV0KTtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW5wdXQpO1xuXG5cdCAgICBpZiAoaW5wdXRUeXBlcy5pbmRleE9mKGN1cnJlbnRJbnB1dCkgPT09IC0xKSB7XG5cdCAgICAgIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmNsYXNzTmFtZSArPSAnIHdoYXRpbnB1dC10eXBlcy0nICsgY3VycmVudElucHV0O1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIGlucHV0IGludGVudCBmb3IgYG1vdXNlbW92ZWAgYW5kIGBwb2ludGVybW92ZWBcblx0ICB2YXIgc2V0SW50ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBidWZmZXJzIHRvdWNoIGV2ZW50cyBiZWNhdXNlIHRoZXkgZnJlcXVlbnRseSBhbHNvIGZpcmUgbW91c2UgZXZlbnRzXG5cdCAgdmFyIHRvdWNoQnVmZmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gY2xlYXIgdGhlIHRpbWVyIGlmIGl0IGhhcHBlbnMgdG8gYmUgcnVubmluZ1xuXHQgICAgd2luZG93LmNsZWFyVGltZW91dCh0b3VjaFRpbWVyKTtcblxuXHQgICAgLy8gc2V0IHRoZSBjdXJyZW50IGlucHV0XG5cdCAgICB1cGRhdGVJbnB1dChldmVudCk7XG5cblx0ICAgIC8vIHNldCB0aGUgaXNCdWZmZXJpbmcgdG8gYHRydWVgXG5cdCAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG5cblx0ICAgIC8vIHJ1biB0aGUgdGltZXJcblx0ICAgIHRvdWNoVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuXHQgICAgICAvLyBpZiB0aGUgdGltZXIgcnVucyBvdXQsIHNldCBpc0J1ZmZlcmluZyBiYWNrIHRvIGBmYWxzZWBcblx0ICAgICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblx0ICAgIH0sIDIwMCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVXRpbGl0aWVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHBvaW50ZXJUeXBlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0ICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICB9IGVsc2Uge1xuXHQgICAgICByZXR1cm4gKGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJykgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7IC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgIH1cblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy93aGVlbFxuXHQgIHZhciBkZXRlY3RXaGVlbCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgcmV0dXJuICdvbndoZWVsJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSA/XG5cdCAgICAgICd3aGVlbCcgOiAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblxuXHQgICAgICBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/XG5cdCAgICAgICAgJ21vdXNld2hlZWwnIDogLy8gV2Via2l0IGFuZCBJRSBzdXBwb3J0IGF0IGxlYXN0IFwibW91c2V3aGVlbFwiXG5cdCAgICAgICAgJ0RPTU1vdXNlU2Nyb2xsJzsgLy8gbGV0J3MgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgSW5pdFxuXG5cdCAgICBkb24ndCBzdGFydCBzY3JpcHQgdW5sZXNzIGJyb3dzZXIgY3V0cyB0aGUgbXVzdGFyZFxuXHQgICAgKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICBpZiAoXG5cdCAgICAnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmXG5cdCAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuXHQgICkge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEFQSVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHJldHVybiB7XG5cblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdsb29zZSd8J3N0cmljdCdcblx0ICAgIC8vICdzdHJpY3QnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdsb29zZSc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgbW9yZSBjdXJyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbihvcHQpIHsgcmV0dXJuIChvcHQgPT09ICdsb29zZScpID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDsgfSxcblxuXHQgICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuXHQgICAgdHlwZXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaW5wdXRUeXBlczsgfVxuXG5cdCAgfTtcblxuXHR9KCkpO1xuXG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIhZnVuY3Rpb24oJCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIEZPVU5EQVRJT05fVkVSU0lPTiA9ICc2LjMuMSc7XG5cbi8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxudmFyIEZvdW5kYXRpb24gPSB7XG4gIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAvKipcbiAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAqL1xuICBfcGx1Z2luczoge30sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgKi9cbiAgX3V1aWRzOiBbXSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAqL1xuICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gIH0sXG4gIC8qKlxuICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAqL1xuICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICB2YXIgY2xhc3NOYW1lID0gKG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbikpO1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXG4gICAgdmFyIGF0dHJOYW1lICA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cbiAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xuICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gLCBwbHVnaW4udXVpZCk7IH1cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpeyBwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nLCBwbHVnaW4pOyB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAgICAgKi9cbiAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcihgaW5pdC56Zi4ke3BsdWdpbk5hbWV9YCk7XG5cbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG5cbiAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAqL1xuICAgICAgICAgIC50cmlnZ2VyKGBkZXN0cm95ZWQuemYuJHtwbHVnaW5OYW1lfWApO1xuICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgfVxuICAgIHJldHVybjtcbiAgfSxcblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAqL1xuICAgcmVJbml0OiBmdW5jdGlvbihwbHVnaW5zKXtcbiAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgdHJ5e1xuICAgICAgIGlmKGlzSlEpe1xuICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgfSk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uKHApe1xuICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH07XG4gICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgfVxuICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgIH1maW5hbGx5e1xuICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICB9XG4gICB9LFxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICovXG4gIEdldFlvRGlnaXRzOiBmdW5jdGlvbihsZW5ndGgsIG5hbWVzcGFjZSl7XG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyBgLSR7bmFtZXNwYWNlfWAgOiAnJyk7XG4gIH0sXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICovXG4gIHJlZmxvdzogZnVuY3Rpb24oZWxlbSwgcGx1Z2lucykge1xuXG4gICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgIH1cbiAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiK25hbWUrXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XG4gICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbihlLCBpKXtcbiAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uKGVsKXsgcmV0dXJuIGVsLnRyaW0oKTsgfSk7XG4gICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgIH1jYXRjaChlcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG4gIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbigkZWxlbSl7XG4gICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgIH07XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgZW5kO1xuXG4gICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGVuZCl7XG4gICAgICByZXR1cm4gZW5kO1xuICAgIH1lbHNle1xuICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgfSwgMSk7XG4gICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgIH1cbiAgfVxufTtcblxuRm91bmRhdGlvbi51dGlsID0ge1xuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgKi9cbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbi8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4vKipcbiAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAqL1xudmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgJG1ldGEgPSAkKCdtZXRhLmZvdW5kYXRpb24tbXEnKSxcbiAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgaWYoISRtZXRhLmxlbmd0aCl7XG4gICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gIH1cbiAgaWYoJG5vSlMubGVuZ3RoKXtcbiAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgfVxuXG4gIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXsvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpey8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7Ly9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOy8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgIGlmKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpey8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgIGlmKHRoaXMubGVuZ3RoID09PSAxKXsvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWwpey8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgfVxuICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBXZSdyZSBzb3JyeSwgJHt0eXBlfSBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuYCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG53aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4kLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24oKSB7XG4gIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcbiAgfVxuICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbiAgLyoqXG4gICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgKi9cbiAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgIH07XG4gIH1cbn0pKCk7XG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gIH1cbiAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7XG4gIGVsc2UgaWYgKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9IGBTSElGVF8ke2tleX1gO1xuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSBgQ1RSTF8ke2tleX1gO1xuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9IGBBTFRfJHtrZXl9YDtcblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICBpZighJGVsZW1lbnQpIHtyZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfSwgIFxuXG4gIC8qKlxuICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICovXG4gIHRyYXBGb2N1cygkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgKi9cbiAgcmVsZWFzZUZvY3VzKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgaWYobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogYG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAke25hbWVkUXVlcmllc1trZXldfSlgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzKHNpemUpIHtcbiAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBpZihzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZihzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7J2FyaWEtZXhwYW5kZWQnOiBmYWxzZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAkc3ViLmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICBlbHNlIHtcbiAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsgcmV0dXJuIGZhbHNlOyB9XG4gIGxldCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuXHQgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcblx0XHQgIH1cblx0XHQgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcblx0XHQgICB9XG5cdFx0ICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG5cdFx0ICB9XG5cdFx0ICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEFjY29yZGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBhIHBsYWluIG9iamVjdCB3aXRoIHNldHRpbmdzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFjY29yZGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uJywge1xuICAgICAgJ0VOVEVSJzogJ3RvZ2dsZScsXG4gICAgICAnU1BBQ0UnOiAndG9nZ2xlJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBhY2NvcmRpb24gYnkgYW5pbWF0aW5nIHRoZSBwcmVzZXQgYWN0aXZlIHBhbmUocykuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpO1xuICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKTtcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbihpZHgsIGVsKSB7XG4gICAgICB2YXIgJGVsID0gJChlbCksXG4gICAgICAgICAgJGNvbnRlbnQgPSAkZWwuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpLFxuICAgICAgICAgIGlkID0gJGNvbnRlbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjb3JkaW9uJyksXG4gICAgICAgICAgbGlua0lkID0gZWwuaWQgfHwgYCR7aWR9LWxhYmVsYDtcblxuICAgICAgJGVsLmZpbmQoJ2E6Zmlyc3QnKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2lkJzogbGlua0lkLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgJGNvbnRlbnQuYXR0cih7J3JvbGUnOiAndGFicGFuZWwnLCAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLCAnYXJpYS1oaWRkZW4nOiB0cnVlLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICAgIHZhciAkaW5pdEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICB0aGlzLmZpcnN0VGltZUluaXQgPSB0cnVlO1xuICAgIGlmKCRpbml0QWN0aXZlLmxlbmd0aCl7XG4gICAgICB0aGlzLmRvd24oJGluaXRBY3RpdmUsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyksXG4gICAgICAgICRhbmNob3IgPSAkKGFuY2hvcik7XG5cbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCAmJiAkYW5jaG9yKSB7XG4gICAgICAgICAgaWYgKCEkbGluay5wYXJlbnQoJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgdGhpcy5kb3duKCRhbmNob3IsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IF90aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCBfdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkZWVwbGlua1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLmFjY29yZGlvbicsIFskbGluaywgJGFuY2hvcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBhY2NvcmRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xuICAgICAgdmFyICR0YWJDb250ZW50ID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCR0YWJDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAkZWxlbS5jaGlsZHJlbignYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uIGtleWRvd24uemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICB9KS5vbigna2V5ZG93bi56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnQWNjb3JkaW9uJywge1xuICAgICAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ubmV4dCgpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5wcmV2KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgY29udGVudCBwYW5lJ3Mgb3Blbi9jbG9zZSBzdGF0ZS5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KSB7XG4gICAgaWYoJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcbiAgICB9XG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdmFyIGFuY2hvciA9ICR0YXJnZXQucHJldignYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGRhdGVIaXN0b3J5KSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGFjY29yZGlvbiB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3BlbiAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkb3duKCR0YXJnZXQsIGZpcnN0VGltZSkge1xuICAgICR0YXJnZXRcbiAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgICAgLnBhcmVudCgnW2RhdGEtdGFiLWNvbnRlbnRdJylcbiAgICAgIC5hZGRCYWNrKClcbiAgICAgIC5wYXJlbnQoKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCAmJiAhZmlyc3RUaW1lKSB7XG4gICAgICB2YXIgJGN1cnJlbnRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCRjdXJyZW50QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlLm5vdCgkdGFyZ2V0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHRhcmdldC5zbGlkZURvd24odGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgb3BlbmluZy5cbiAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZG93blxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICB9KTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXG4gICAgICAnYXJpYS1zZWxlY3RlZCc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYoKCF0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgJiYgISRhdW50cy5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHx8ICEkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jdXBcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgICR0YXJnZXQuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zdG9wKHRydWUpLnNsaWRlVXAoMCkuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuQWNjb3JkaW9uLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gYW5pbWF0ZSB0aGUgb3BlbmluZyBvZiBhbiBhY2NvcmRpb24gcGFuZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAyNTBcbiAgICovXG4gIHNsaWRlU3BlZWQ6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gaGF2ZSBtdWx0aXBsZSBvcGVuIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBjbG9zZSBhbGwgcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhbGxvd0FsbENsb3NlZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIGFjY29yZGlvbiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIGFjY29yZGlvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEludGVyY2hhbmdlIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5pbnRlcmNoYW5nZVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcbiAqL1xuXG5jbGFzcyBJbnRlcmNoYW5nZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEludGVyY2hhbmdlLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEludGVyY2hhbmdlI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBJbnRlcmNoYW5nZS5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5ydWxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudFBhdGggPSAnJztcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0ludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEludGVyY2hhbmdlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBpbnRlcmNoYW5nZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2FkZEJyZWFrcG9pbnRzKCk7XG4gICAgdGhpcy5fZ2VuZXJhdGVSdWxlcygpO1xuICAgIHRoaXMuX3JlZmxvdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgSW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5pbnRlcmNoYW5nZScsIEZvdW5kYXRpb24udXRpbC50aHJvdHRsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9yZWZsb3coKTtcbiAgICB9LCA1MCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIEludGVyY2hhbmdlIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWZsb3coKSB7XG4gICAgdmFyIG1hdGNoO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSwgYnV0IG9ubHkgc2F2ZSB0aGUgbGFzdCBtYXRjaFxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5ydWxlcykge1xuICAgICAgaWYodGhpcy5ydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHRoaXMucnVsZXNbaV07XG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShydWxlLnF1ZXJ5KS5tYXRjaGVzKSB7XG4gICAgICAgICAgbWF0Y2ggPSBydWxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICB0aGlzLnJlcGxhY2UobWF0Y2gucGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIEZvdW5kYXRpb24gYnJlYWtwb2ludHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTIG9iamVjdC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQnJlYWtwb2ludHMoKSB7XG4gICAgZm9yICh2YXIgaSBpbiBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcykge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzW2ldO1xuICAgICAgICBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnkubmFtZV0gPSBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBJbnRlcmNoYW5nZSBlbGVtZW50IGZvciB0aGUgcHJvdmlkZWQgbWVkaWEgcXVlcnkgKyBjb250ZW50IHBhaXJpbmdzXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdGhhdCBpcyBhbiBJbnRlcmNoYW5nZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7QXJyYXl9IHNjZW5hcmlvcyAtIEFycmF5IG9mIG9iamVjdHMgdGhhdCBoYXZlICdtcScgYW5kICdwYXRoJyBrZXlzIHdpdGggY29ycmVzcG9uZGluZyBrZXlzXG4gICAqL1xuICBfZ2VuZXJhdGVSdWxlcyhlbGVtZW50KSB7XG4gICAgdmFyIHJ1bGVzTGlzdCA9IFtdO1xuICAgIHZhciBydWxlcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucnVsZXMpIHtcbiAgICAgIHJ1bGVzID0gdGhpcy5vcHRpb25zLnJ1bGVzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdpbnRlcmNoYW5nZScpO1xuICAgIH1cbiAgICBcbiAgICBydWxlcyA9ICB0eXBlb2YgcnVsZXMgPT09ICdzdHJpbmcnID8gcnVsZXMubWF0Y2goL1xcWy4qP1xcXS9nKSA6IHJ1bGVzO1xuXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykge1xuICAgICAgaWYocnVsZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zbGljZSgxLCAtMSkuc3BsaXQoJywgJyk7XG4gICAgICAgIHZhciBwYXRoID0gcnVsZS5zbGljZSgwLCAtMSkuam9pbignJyk7XG4gICAgICAgIHZhciBxdWVyeSA9IHJ1bGVbcnVsZS5sZW5ndGggLSAxXTtcblxuICAgICAgICBpZiAoSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XSkge1xuICAgICAgICAgIHF1ZXJ5ID0gSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bGVzTGlzdC5wdXNoKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgIHF1ZXJ5OiBxdWVyeVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJ1bGVzID0gcnVsZXNMaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYHNyY2AgcHJvcGVydHkgb2YgYW4gaW1hZ2UsIG9yIGNoYW5nZSB0aGUgSFRNTCBvZiBhIGNvbnRhaW5lciwgdG8gdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIHRvIHRoZSBpbWFnZSBvciBIVE1MIHBhcnRpYWwuXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgKi9cbiAgcmVwbGFjZShwYXRoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGggPT09IHBhdGgpIHJldHVybjtcblxuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIHRyaWdnZXIgPSAncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnO1xuXG4gICAgLy8gUmVwbGFjaW5nIGltYWdlc1xuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSU1HJykge1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdzcmMnLCBwYXRoKS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KVxuICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBiYWNrZ3JvdW5kIGltYWdlc1xuICAgIGVsc2UgaWYgKHBhdGgubWF0Y2goL1xcLihnaWZ8anBnfGpwZWd8cG5nfHN2Z3x0aWZmKShbPyNdLiopPy9pKSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5jc3MoeyAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJytwYXRoKycpJyB9KVxuICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNpbmcgSFRNTFxuICAgIGVsc2Uge1xuICAgICAgJC5nZXQocGF0aCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuaHRtbChyZXNwb25zZSlcbiAgICAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICAgICAgJChyZXNwb25zZSkuZm91bmRhdGlvbigpO1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIGNvbnRlbnQgaW4gYW4gSW50ZXJjaGFuZ2UgZWxlbWVudCBpcyBkb25lIGJlaW5nIGxvYWRlZC5cbiAgICAgKiBAZXZlbnQgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcbiAgICAgKi9cbiAgICAvLyB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3JlcGxhY2VkLnpmLmludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgaW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICAvL1RPRE8gdGhpcy5cbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5JbnRlcmNoYW5nZS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFJ1bGVzIHRvIGJlIGFwcGxpZWQgdG8gSW50ZXJjaGFuZ2UgZWxlbWVudHMuIFNldCB3aXRoIHRoZSBgZGF0YS1pbnRlcmNoYW5nZWAgYXJyYXkgbm90YXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9hcnJheX1cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcnVsZXM6IG51bGxcbn07XG5cbkludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFUyA9IHtcbiAgJ2xhbmRzY2FwZSc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICdwb3J0cmFpdCc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgJ3JldGluYSc6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oSW50ZXJjaGFuZ2UsICdJbnRlcmNoYW5nZScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBPZmZDYW52YXMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy4kbGFzdFRyaWdnZXIgPSAkKCk7XG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKCk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKVxuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09mZkNhbnZhcycsIHtcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgfSk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyhgaXMtdHJhbnNpdGlvbi0ke3RoaXMub3B0aW9ucy50cmFuc2l0aW9ufWApO1xuXG4gICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoZG9jdW1lbnQpXG4gICAgICAuZmluZCgnW2RhdGEtb3Blbj1cIicraWQrJ1wiXSwgW2RhdGEtY2xvc2U9XCInK2lkKydcIl0sIFtkYXRhLXRvZ2dsZT1cIicraWQrJ1wiXScpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG4gICAgICAuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcblxuICAgIC8vIEFkZCBhbiBvdmVybGF5IG92ZXIgdGhlIGNvbnRlbnQgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHZhciBvdmVybGF5UG9zaXRpb24gPSAkKHRoaXMuJGVsZW1lbnQpLmNzcyhcInBvc2l0aW9uXCIpID09PSAnZml4ZWQnID8gJ2lzLW92ZXJsYXktZml4ZWQnIDogJ2lzLW92ZXJsYXktYWJzb2x1dGUnO1xuICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgICAgaWYob3ZlcmxheVBvc2l0aW9uID09PSAnaXMtb3ZlcmxheS1maXhlZCcpIHtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzXScpWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSxcbiAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAna2V5ZG93bi56Zi5vZmZjYW52YXMnOiB0aGlzLl9oYW5kbGVLZXlib2FyZC5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgdmFyICR0YXJnZXQgPSB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPyB0aGlzLiRvdmVybGF5IDogJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpO1xuICAgICAgJHRhcmdldC5vbih7J2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TVFDaGVja2VyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICB9XG4gICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkgeyAkY2xvc2VyLmhpZGUoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpLm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgc2Nyb2xsaW5nIG9mIHRoZSBib2R5IHdoZW4gb2ZmY2FudmFzIGlzIG9wZW4gb24gbW9iaWxlIFNhZmFyaSBhbmQgb3RoZXIgdHJvdWJsZXNvbWUgYnJvd3NlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cbiAgX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgIGlmIChlbGVtLnNjcm9sbEhlaWdodCAhPT0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IDE7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCAoZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCk7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gIH1cblxuICBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cbiAgICBsZXQgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgbGV0IGRvd24gPSAhdXA7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50LnBhZ2VZO1xuXG4gICAgaWYoKHVwICYmIGVsZW0uYWxsb3dVcCkgfHwgKGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCxkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICovXG4gICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNGb2N1cyA9IF90aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWF1dG9mb2N1c10nKTtcbiAgICAgICAgaWYgKGNhbnZhc0ZvY3VzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FudmFzRm9jdXMuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgKi9cbiAgY2xvc2UoY2IpIHtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIHJlbW92ZSBjbGFzcyBhbmQgcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVsZWFzZUZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBoYW5kbGVkOiAoKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIG92ZXJsYXkgb24gdG9wIG9mIGBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudE92ZXJsYXk6IHRydWUsXG5cbiAgLyoqXG4gICAqIEVuYWJsZS9kaXNhYmxlIHNjcm9sbGluZyBvZiB0aGUgbWFpbiBjb250ZW50IHdoZW4gYW4gb2ZmIGNhbnZhcyBwYW5lbCBpcyBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDBcbiAgICovXG4gIHRyYW5zaXRpb25UaW1lOiAwLFxuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRyYW5zaXRpb24gZm9yIHRoZSBvZmZjYW52YXMgbWVudS4gT3B0aW9ucyBhcmUgJ3B1c2gnLCAnZGV0YWNoZWQnIG9yICdzbGlkZScuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcHVzaFxuICAgKi9cbiAgdHJhbnNpdGlvbjogJ3B1c2gnLFxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgcGFnZSB0byBzY3JvbGwgdG8gdG9wIG9yIGJvdHRvbSBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBmb3JjZVRvOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgaXNSZXZlYWxlZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICByZXZlYWxPbjogbnVsbCxcblxuICAvKipcbiAgICogRm9yY2UgZm9jdXMgdG8gdGhlIG9mZmNhbnZhcyBvbiBvcGVuLiBJZiB0cnVlLCB3aWxsIGZvY3VzIHRoZSBvcGVuaW5nIHRyaWdnZXIgb24gY2xvc2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAvKipcbiAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcmV2ZWFsLWZvci1cbiAgICogQHRvZG8gaW1wcm92ZSB0aGUgcmVnZXggdGVzdGluZyBmb3IgdGhpcy5cbiAgICovXG4gIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB0cmFwRm9jdXM6IGZhbHNlXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J3JvbGUnOiAndGFibGlzdCd9KTtcbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogJGVsZW0ub2Zmc2V0KCkudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSwgKCkgPT4ge1xuICAgICAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XG5cbiAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgICAvL2N1cnJlbnQgY29udGV4dC1ib3VuZCBmdW5jdGlvbiB0byBvcGVuIHRhYnMgb24gcGFnZSBsb2FkIG9yIGhpc3RvcnkgcG9wc3RhdGVcbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyk7XG4gICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdFRhYigkKGFuY2hvciksIHRydWUpO1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLnRhYnMnLCBbJGxpbmssICQoYW5jaG9yKV0pO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpO1xuXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC4gQ29sbGFwc2VzIGFjdGl2ZSB0YWIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgYWN0aXZlIGNsYXNzIG9uIHRhcmdldC4gQ29sbGFwc2UgaWYgZXhpc3RzLlxuICAgICAqL1xuICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCkpIHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmFjdGl2ZUNvbGxhcHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZVRhYigkdGFyZ2V0KTtcblxuICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNvbGxhcHNlZCB0YWJzLlxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNjb2xsYXBzZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY29sbGFwc2UuemYudGFicycsIFskdGFyZ2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciAkb2xkVGFiID0gdGhpcy4kZWxlbWVudC5cbiAgICAgICAgICBmaW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfS4ke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAvL2Nsb3NlIG9sZCB0YWJcbiAgICB0aGlzLl9jb2xsYXBzZVRhYigkb2xkVGFiKTtcblxuICAgIC8vb3BlbiBuZXcgdGFiXG4gICAgdGhpcy5fb3BlblRhYigkdGFyZ2V0KTtcblxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmsgJiYgIWhpc3RvcnlIYW5kbGVkKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGFicy5cbiAgICAgKiBAZXZlbnQgVGFicyNjaGFuZ2VcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS56Zi50YWJzJywgWyR0YXJnZXQsICR0YXJnZXRDb250ZW50XSk7XG5cbiAgICAvL2ZpcmUgdG8gY2hpbGRyZW4gYSBtdXRhdGlvbiBldmVudFxuICAgICR0YXJnZXRDb250ZW50LmZpbmQoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfb3BlblRhYigkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAgICR0YXJnZXQuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKTtcblxuICAgICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICAgJHRhcmdldENvbnRlbnRcbiAgICAgICAgLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2NvbGxhcHNlVGFiKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhcmdldF9hbmNob3IgPSAkdGFyZ2V0XG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKVxuICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldF9hbmNob3IuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzZWxlY3RUYWIoZWxlbSwgaGlzdG9yeUhhbmRsZWQpIHtcbiAgICB2YXIgaWRTdHI7XG5cbiAgICBpZiAodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICBpZFN0ciA9IGVsZW1bMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkU3RyID0gZWxlbTtcbiAgICB9XG5cbiAgICBpZiAoaWRTdHIuaW5kZXhPZignIycpIDwgMCkge1xuICAgICAgaWRTdHIgPSBgIyR7aWRTdHJ9YDtcbiAgICB9XG5cbiAgICB2YXIgJHRhcmdldCA9IHRoaXMuJHRhYlRpdGxlcy5maW5kKGBbaHJlZiQ9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCk7XG4gIH07XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgZWFjaCBwYW5lbCB0byB0aGUgaGVpZ2h0IG9mIHRoZSB0YWxsZXN0IHBhbmVsLlxuICAgKiBJZiBlbmFibGVkIGluIG9wdGlvbnMsIGdldHMgY2FsbGVkIG9uIG1lZGlhIHF1ZXJ5IGNoYW5nZS5cbiAgICogSWYgbG9hZGluZyBjb250ZW50IHZpYSBleHRlcm5hbCBzb3VyY2UsIGNhbiBiZSBjYWxsZWQgZGlyZWN0bHkgb3Igd2l0aCBfcmVmbG93LlxuICAgKiBJZiBlbmFibGVkIHdpdGggYGRhdGEtbWF0Y2gtaGVpZ2h0PVwidHJ1ZVwiYCwgdGFicyBzZXRzIHRvIGVxdWFsIGhlaWdodFxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRIZWlnaHQoKSB7XG4gICAgdmFyIG1heCA9IDAsXG4gICAgICAgIF90aGlzID0gdGhpczsgLy8gTG9jayBkb3duIHRoZSBgdGhpc2AgdmFsdWUgZm9yIHRoZSByb290IHRhYnMgb2JqZWN0XG5cbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHBhbmVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGlzQWN0aXZlID0gcGFuZWwuaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApOyAvLyBnZXQgdGhlIG9wdGlvbnMgZnJvbSB0aGUgcGFyZW50IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGdldCB0aGVtIGZyb20gdGhlIGNoaWxkXG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJywgJ2Rpc3BsYXknOiAnYmxvY2snfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moe1xuICAgICAgICAgICAgJ3Zpc2liaWxpdHknOiAnJyxcbiAgICAgICAgICAgICdkaXNwbGF5JzogJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgfSlcbiAgICAgIC5jc3MoJ2hlaWdodCcsIGAke21heH1weGApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIHRhYnMuXG4gICAqIEBmaXJlcyBUYWJzI2Rlc3Ryb3llZFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKVxuICAgICAgLm9mZignLnpmLnRhYnMnKS5oaWRlKCkuZW5kKClcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmhpZGUoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIGlmICh0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICAgJCh3aW5kb3cpLm9mZignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5UYWJzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSB0YWIgcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiB0YWJcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBhY3RpdmUgcGFuZSBvbiBsb2FkIGlmIHNldCB0byB0cnVlLlxuICAgKiBOb3QgcmVjb21tZW5kZWQgaWYgbW9yZSB0aGFuIG9uZSB0YWIgcGFuZWwgcGVyIHBhZ2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3Mga2V5Ym9hcmQgaW5wdXQgdG8gJ3dyYXAnIGFyb3VuZCB0aGUgdGFiIGxpbmtzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICB3cmFwT25LZXlzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRhYiBjb250ZW50IHBhbmVzIHRvIG1hdGNoIGhlaWdodHMgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtYXRjaEhlaWdodDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBhY3RpdmUgdGFicyB0byBjb2xsYXBzZSB3aGVuIGNsaWNrZWQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhY3RpdmVDb2xsYXBzZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gYGxpYCdzIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtdGl0bGUnXG4gICAqL1xuICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGBsaWAgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgbGlua0FjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGVudCBjb250YWluZXJzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXBhbmVsJ1xuICAgKi9cbiAgcGFuZWxDbGFzczogJ3RhYnMtcGFuZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgY29udGVudCBjb250YWluZXIuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIHBhbmVsQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVGFicywgJ1RhYnMnKTtcblxufShqUXVlcnkpO1xuIiwiIWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxiKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKCk6YS5MYXp5TG9hZD1iKCl9KHdpbmRvdyxmdW5jdGlvbigpe2NvbnN0IGE9XCJvbnNjcm9sbFwiaW4gd2luZG93JiYhL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxiPWZ1bmN0aW9uKGEpe3JldHVybiBhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCt3aW5kb3cucGFnZVlPZmZzZXQtYS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRUb3B9LGM9ZnVuY3Rpb24oYSxjLGQpe3JldHVybihjPT09d2luZG93P3dpbmRvdy5pbm5lckhlaWdodCt3aW5kb3cucGFnZVlPZmZzZXQ6YihjKStjLm9mZnNldEhlaWdodCk8PWIoYSktZH0sZD1mdW5jdGlvbihhKXtyZXR1cm4gYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0K3dpbmRvdy5wYWdlWE9mZnNldC1hLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnR9LGU9ZnVuY3Rpb24oYSxiLGMpe2NvbnN0IGU9d2luZG93LmlubmVyV2lkdGg7cmV0dXJuKGI9PT13aW5kb3c/ZSt3aW5kb3cucGFnZVhPZmZzZXQ6ZChiKStlKTw9ZChhKS1jfSxmPWZ1bmN0aW9uKGEsYyxkKXtyZXR1cm4oYz09PXdpbmRvdz93aW5kb3cucGFnZVlPZmZzZXQ6YihjKSk+PWIoYSkrZCthLm9mZnNldEhlaWdodH0sZz1mdW5jdGlvbihhLGIsYyl7cmV0dXJuKGI9PT13aW5kb3c/d2luZG93LnBhZ2VYT2Zmc2V0OmQoYikpPj1kKGEpK2MrYS5vZmZzZXRXaWR0aH0saD1mdW5jdGlvbihhLGIsZCl7cmV0dXJuIShjKGEsYixkKXx8ZihhLGIsZCl8fGUoYSxiLGQpfHxnKGEsYixkKSl9LGk9ZnVuY3Rpb24oYSxiKXthJiZhKGIpfSxqPXtlbGVtZW50c19zZWxlY3RvcjpcImltZ1wiLGNvbnRhaW5lcjp3aW5kb3csdGhyZXNob2xkOjMwMCx0aHJvdHRsZToxNTAsZGF0YV9zcmM6XCJvcmlnaW5hbFwiLGRhdGFfc3Jjc2V0Olwib3JpZ2luYWwtc2V0XCIsY2xhc3NfbG9hZGluZzpcImxvYWRpbmdcIixjbGFzc19sb2FkZWQ6XCJsb2FkZWRcIixjbGFzc19lcnJvcjpcImVycm9yXCIsc2tpcF9pbnZpc2libGU6ITAsY2FsbGJhY2tfbG9hZDpudWxsLGNhbGxiYWNrX2Vycm9yOm51bGwsY2FsbGJhY2tfc2V0Om51bGwsY2FsbGJhY2tfcHJvY2Vzc2VkOm51bGx9O2NsYXNzIGt7Y29uc3RydWN0b3IoYSl7dGhpcy5fc2V0dGluZ3M9T2JqZWN0LmFzc2lnbih7fSxqLGEpLHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZT10aGlzLl9zZXR0aW5ncy5jb250YWluZXI9PT13aW5kb3c/ZG9jdW1lbnQ6dGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLHRoaXMuX3ByZXZpb3VzTG9vcFRpbWU9MCx0aGlzLl9sb29wVGltZW91dD1udWxsLHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsPXRoaXMuaGFuZGxlU2Nyb2xsLmJpbmQodGhpcyksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCksdGhpcy51cGRhdGUoKX1fc2V0U291cmNlc0ZvclBpY3R1cmUoYSxiKXtjb25zdCBjPWEucGFyZW50RWxlbWVudDtpZihcIlBJQ1RVUkVcIj09PWMudGFnTmFtZSlmb3IobGV0IGE9MDthPGMuY2hpbGRyZW4ubGVuZ3RoO2ErKyl7bGV0IGQ9Yy5jaGlsZHJlblthXTtpZihcIlNPVVJDRVwiPT09ZC50YWdOYW1lKXtsZXQgYT1kLmdldEF0dHJpYnV0ZShcImRhdGEtXCIrYik7YSYmZC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixhKX19fV9zZXRTb3VyY2VzKGEsYixjKXtjb25zdCBkPWEudGFnTmFtZSxlPWEuZ2V0QXR0cmlidXRlKFwiZGF0YS1cIitjKTtpZihcIklNR1wiPT09ZCl7dGhpcy5fc2V0U291cmNlc0ZvclBpY3R1cmUoYSxiKTtjb25zdCBjPWEuZ2V0QXR0cmlidXRlKFwiZGF0YS1cIitiKTtyZXR1cm4gYyYmYS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIixjKSx2b2lkKGUmJmEuc2V0QXR0cmlidXRlKFwic3JjXCIsZSkpfWlmKFwiSUZSQU1FXCI9PT1kKXJldHVybiB2b2lkKGUmJmEuc2V0QXR0cmlidXRlKFwic3JjXCIsZSkpO2UmJihhLnN0eWxlLmJhY2tncm91bmRJbWFnZT1cInVybChcIitlK1wiKVwiKX1fc2hvd09uQXBwZWFyKGEpe2NvbnN0IGI9dGhpcy5fc2V0dGluZ3MsYz1mdW5jdGlvbigpe2ImJihhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsZCksYS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIixjKSxhLmNsYXNzTGlzdC5yZW1vdmUoYi5jbGFzc19sb2FkaW5nKSxhLmNsYXNzTGlzdC5hZGQoYi5jbGFzc19lcnJvciksaShiLmNhbGxiYWNrX2Vycm9yLGEpKX0sZD1mdW5jdGlvbigpe2ImJihhLmNsYXNzTGlzdC5yZW1vdmUoYi5jbGFzc19sb2FkaW5nKSxhLmNsYXNzTGlzdC5hZGQoYi5jbGFzc19sb2FkZWQpLGEucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIixkKSxhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGMpLGkoYi5jYWxsYmFja19sb2FkLGEpKX07XCJJTUdcIiE9PWEudGFnTmFtZSYmXCJJRlJBTUVcIiE9PWEudGFnTmFtZXx8KGEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixkKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLGMpLGEuY2xhc3NMaXN0LmFkZChiLmNsYXNzX2xvYWRpbmcpKSx0aGlzLl9zZXRTb3VyY2VzKGEsYi5kYXRhX3NyY3NldCxiLmRhdGFfc3JjKSxpKGIuY2FsbGJhY2tfc2V0LGEpfV9sb29wVGhyb3VnaEVsZW1lbnRzKCl7Y29uc3QgYj10aGlzLl9zZXR0aW5ncyxjPXRoaXMuX2VsZW1lbnRzLGQ9Yz9jLmxlbmd0aDowO2xldCBlLGY9W107Zm9yKGU9MDtlPGQ7ZSsrKXtsZXQgZD1jW2VdO2Iuc2tpcF9pbnZpc2libGUmJm51bGw9PT1kLm9mZnNldFBhcmVudHx8YSYmaChkLGIuY29udGFpbmVyLGIudGhyZXNob2xkKSYmKHRoaXMuX3Nob3dPbkFwcGVhcihkKSxmLnB1c2goZSksZC53YXNQcm9jZXNzZWQ9ITApfWZvcig7Zi5sZW5ndGg+MDspYy5zcGxpY2UoZi5wb3AoKSwxKSxpKGIuY2FsbGJhY2tfcHJvY2Vzc2VkLGMubGVuZ3RoKTswPT09ZCYmdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKX1fcHVyZ2VFbGVtZW50cygpe2NvbnN0IGE9dGhpcy5fZWxlbWVudHMsYj1hLmxlbmd0aDtsZXQgYyxkPVtdO2ZvcihjPTA7YzxiO2MrKyl7bGV0IGI9YVtjXTtiLndhc1Byb2Nlc3NlZCYmZC5wdXNoKGMpfWZvcig7ZC5sZW5ndGg+MDspYS5zcGxpY2UoZC5wb3AoKSwxKX1fc3RhcnRTY3JvbGxIYW5kbGVyKCl7dGhpcy5faXNIYW5kbGluZ1Njcm9sbHx8KHRoaXMuX2lzSGFuZGxpbmdTY3JvbGw9ITAsdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCkpfV9zdG9wU2Nyb2xsSGFuZGxlcigpe3RoaXMuX2lzSGFuZGxpbmdTY3JvbGwmJih0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsPSExLHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpKX1oYW5kbGVTY3JvbGwoKXtjb25zdCBhPXRoaXMuX3NldHRpbmdzLnRocm90dGxlO2lmKDAhPT1hKXtjb25zdCBiPSgpPT57KG5ldyBEYXRlKS5nZXRUaW1lKCl9O2xldCBjPWIoKSxkPWEtKGMtdGhpcy5fcHJldmlvdXNMb29wVGltZSk7ZDw9MHx8ZD5hPyh0aGlzLl9sb29wVGltZW91dCYmKGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCksdGhpcy5fbG9vcFRpbWVvdXQ9bnVsbCksdGhpcy5fcHJldmlvdXNMb29wVGltZT1jLHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKSk6dGhpcy5fbG9vcFRpbWVvdXR8fCh0aGlzLl9sb29wVGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5fcHJldmlvdXNMb29wVGltZT1iKCksdGhpcy5fbG9vcFRpbWVvdXQ9bnVsbCx0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCl9LmJpbmQodGhpcyksZCkpfWVsc2UgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpfXVwZGF0ZSgpe3RoaXMuX2VsZW1lbnRzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3NldHRpbmdzLmVsZW1lbnRzX3NlbGVjdG9yKSksdGhpcy5fcHVyZ2VFbGVtZW50cygpLHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKSx0aGlzLl9zdGFydFNjcm9sbEhhbmRsZXIoKX1kZXN0cm95KCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCksdGhpcy5fbG9vcFRpbWVvdXQmJihjbGVhclRpbWVvdXQodGhpcy5fbG9vcFRpbWVvdXQpLHRoaXMuX2xvb3BUaW1lb3V0PW51bGwpLHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCksdGhpcy5fZWxlbWVudHM9bnVsbCx0aGlzLl9xdWVyeU9yaWdpbk5vZGU9bnVsbCx0aGlzLl9zZXR0aW5ncz1udWxsfX1yZXR1cm4ga30pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGF6eWxvYWQubWluLmpzLm1hcCIsIi8qIVxuICogRmxpY2tpdHkgUEFDS0FHRUQgdjIuMC41XG4gKiBUb3VjaCwgcmVzcG9uc2l2ZSwgZmxpY2thYmxlIGNhcm91c2Vsc1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEZsaWNraXR5IENvbW1lcmNpYWwgTGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2VcbiAqXG4gKiBodHRwOi8vZmxpY2tpdHkubWV0YWZpenp5LmNvXG4gKiBDb3B5cmlnaHQgMjAxNiBNZXRhZml6enlcbiAqL1xuXG4hZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwianF1ZXJ5LWJyaWRnZXQvanF1ZXJ5LWJyaWRnZXRcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwianF1ZXJ5XCIpKTp0LmpRdWVyeUJyaWRnZXQ9ZSh0LHQualF1ZXJ5KX0od2luZG93LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gaShpLG8sYSl7ZnVuY3Rpb24gbCh0LGUsbil7dmFyIHMsbz1cIiQoKS5cIitpKycoXCInK2UrJ1wiKSc7cmV0dXJuIHQuZWFjaChmdW5jdGlvbih0LGwpe3ZhciBoPWEuZGF0YShsLGkpO2lmKCFoKXJldHVybiB2b2lkIHIoaStcIiBub3QgaW5pdGlhbGl6ZWQuIENhbm5vdCBjYWxsIG1ldGhvZHMsIGkuZS4gXCIrbyk7dmFyIGM9aFtlXTtpZighY3x8XCJfXCI9PWUuY2hhckF0KDApKXJldHVybiB2b2lkIHIobytcIiBpcyBub3QgYSB2YWxpZCBtZXRob2RcIik7dmFyIGQ9Yy5hcHBseShoLG4pO3M9dm9pZCAwPT09cz9kOnN9KSx2b2lkIDAhPT1zP3M6dH1mdW5jdGlvbiBoKHQsZSl7dC5lYWNoKGZ1bmN0aW9uKHQsbil7dmFyIHM9YS5kYXRhKG4saSk7cz8ocy5vcHRpb24oZSkscy5faW5pdCgpKToocz1uZXcgbyhuLGUpLGEuZGF0YShuLGkscykpfSl9YT1hfHxlfHx0LmpRdWVyeSxhJiYoby5wcm90b3R5cGUub3B0aW9ufHwoby5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKHQpe2EuaXNQbGFpbk9iamVjdCh0KSYmKHRoaXMub3B0aW9ucz1hLmV4dGVuZCghMCx0aGlzLm9wdGlvbnMsdCkpfSksYS5mbltpXT1mdW5jdGlvbih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9cy5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gbCh0aGlzLHQsZSl9cmV0dXJuIGgodGhpcyx0KSx0aGlzfSxuKGEpKX1mdW5jdGlvbiBuKHQpeyF0fHx0JiZ0LmJyaWRnZXR8fCh0LmJyaWRnZXQ9aSl9dmFyIHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLG89dC5jb25zb2xlLHI9XCJ1bmRlZmluZWRcIj09dHlwZW9mIG8/ZnVuY3Rpb24oKXt9OmZ1bmN0aW9uKHQpe28uZXJyb3IodCl9O3JldHVybiBuKGV8fHQualF1ZXJ5KSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuRXZFbWl0dGVyPWUoKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUub249ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt2YXIgaT10aGlzLl9ldmVudHM9dGhpcy5fZXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8W107cmV0dXJuIG4uaW5kZXhPZihlKT09LTEmJm4ucHVzaChlKSx0aGlzfX0sZS5vbmNlPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dGhpcy5vbih0LGUpO3ZhciBpPXRoaXMuX29uY2VFdmVudHM9dGhpcy5fb25jZUV2ZW50c3x8e30sbj1pW3RdPWlbdF18fHt9O3JldHVybiBuW2VdPSEwLHRoaXN9fSxlLm9mZj1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj1pLmluZGV4T2YoZSk7cmV0dXJuIG4hPS0xJiZpLnNwbGljZShuLDEpLHRoaXN9fSxlLmVtaXRFdmVudD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj0wLHM9aVtuXTtlPWV8fFtdO2Zvcih2YXIgbz10aGlzLl9vbmNlRXZlbnRzJiZ0aGlzLl9vbmNlRXZlbnRzW3RdO3M7KXt2YXIgcj1vJiZvW3NdO3ImJih0aGlzLm9mZih0LHMpLGRlbGV0ZSBvW3NdKSxzLmFwcGx5KHRoaXMsZSksbis9cj8wOjEscz1pW25dfXJldHVybiB0aGlzfX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImdldC1zaXplL2dldC1zaXplXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gZSgpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuZ2V0U2l6ZT1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dmFyIGU9cGFyc2VGbG9hdCh0KSxpPXQuaW5kZXhPZihcIiVcIik9PS0xJiYhaXNOYU4oZSk7cmV0dXJuIGkmJmV9ZnVuY3Rpb24gZSgpe31mdW5jdGlvbiBpKCl7Zm9yKHZhciB0PXt3aWR0aDowLGhlaWdodDowLGlubmVyV2lkdGg6MCxpbm5lckhlaWdodDowLG91dGVyV2lkdGg6MCxvdXRlckhlaWdodDowfSxlPTA7ZTxoO2UrKyl7dmFyIGk9bFtlXTt0W2ldPTB9cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO3JldHVybiBlfHxhKFwiU3R5bGUgcmV0dXJuZWQgXCIrZStcIi4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gU2VlIGh0dHA6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzFcIiksZX1mdW5jdGlvbiBzKCl7aWYoIWMpe2M9ITA7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLnN0eWxlLndpZHRoPVwiMjAwcHhcIixlLnN0eWxlLnBhZGRpbmc9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJvcmRlclN0eWxlPVwic29saWRcIixlLnN0eWxlLmJvcmRlcldpZHRoPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3hTaXppbmc9XCJib3JkZXItYm94XCI7dmFyIGk9ZG9jdW1lbnQuYm9keXx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O2kuYXBwZW5kQ2hpbGQoZSk7dmFyIHM9bihlKTtvLmlzQm94U2l6ZU91dGVyPXI9MjAwPT10KHMud2lkdGgpLGkucmVtb3ZlQ2hpbGQoZSl9fWZ1bmN0aW9uIG8oZSl7aWYocygpLFwic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGUpKSxlJiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZS5ub2RlVHlwZSl7dmFyIG89bihlKTtpZihcIm5vbmVcIj09by5kaXNwbGF5KXJldHVybiBpKCk7dmFyIGE9e307YS53aWR0aD1lLm9mZnNldFdpZHRoLGEuaGVpZ2h0PWUub2Zmc2V0SGVpZ2h0O2Zvcih2YXIgYz1hLmlzQm9yZGVyQm94PVwiYm9yZGVyLWJveFwiPT1vLmJveFNpemluZyxkPTA7ZDxoO2QrKyl7dmFyIHU9bFtkXSxmPW9bdV0scD1wYXJzZUZsb2F0KGYpO2FbdV09aXNOYU4ocCk/MDpwfXZhciB2PWEucGFkZGluZ0xlZnQrYS5wYWRkaW5nUmlnaHQsZz1hLnBhZGRpbmdUb3ArYS5wYWRkaW5nQm90dG9tLG09YS5tYXJnaW5MZWZ0K2EubWFyZ2luUmlnaHQseT1hLm1hcmdpblRvcCthLm1hcmdpbkJvdHRvbSxTPWEuYm9yZGVyTGVmdFdpZHRoK2EuYm9yZGVyUmlnaHRXaWR0aCxFPWEuYm9yZGVyVG9wV2lkdGgrYS5ib3JkZXJCb3R0b21XaWR0aCxiPWMmJnIseD10KG8ud2lkdGgpO3ghPT0hMSYmKGEud2lkdGg9eCsoYj8wOnYrUykpO3ZhciBDPXQoby5oZWlnaHQpO3JldHVybiBDIT09ITEmJihhLmhlaWdodD1DKyhiPzA6ZytFKSksYS5pbm5lcldpZHRoPWEud2lkdGgtKHYrUyksYS5pbm5lckhlaWdodD1hLmhlaWdodC0oZytFKSxhLm91dGVyV2lkdGg9YS53aWR0aCttLGEub3V0ZXJIZWlnaHQ9YS5oZWlnaHQreSxhfX12YXIgcixhPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBjb25zb2xlP2U6ZnVuY3Rpb24odCl7Y29uc29sZS5lcnJvcih0KX0sbD1bXCJwYWRkaW5nTGVmdFwiLFwicGFkZGluZ1JpZ2h0XCIsXCJwYWRkaW5nVG9wXCIsXCJwYWRkaW5nQm90dG9tXCIsXCJtYXJnaW5MZWZ0XCIsXCJtYXJnaW5SaWdodFwiLFwibWFyZ2luVG9wXCIsXCJtYXJnaW5Cb3R0b21cIixcImJvcmRlckxlZnRXaWR0aFwiLFwiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlckJvdHRvbVdpZHRoXCJdLGg9bC5sZW5ndGgsYz0hMTtyZXR1cm4gb30pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0Lm1hdGNoZXNTZWxlY3Rvcj1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKCl7dmFyIHQ9RWxlbWVudC5wcm90b3R5cGU7aWYodC5tYXRjaGVzKXJldHVyblwibWF0Y2hlc1wiO2lmKHQubWF0Y2hlc1NlbGVjdG9yKXJldHVyblwibWF0Y2hlc1NlbGVjdG9yXCI7Zm9yKHZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXSxpPTA7aTxlLmxlbmd0aDtpKyspe3ZhciBuPWVbaV0scz1uK1wiTWF0Y2hlc1NlbGVjdG9yXCI7aWYodFtzXSlyZXR1cm4gc319KCk7cmV0dXJuIGZ1bmN0aW9uKGUsaSl7cmV0dXJuIGVbdF0oaSl9fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZml6enktdWktdXRpbHMvdXRpbHNcIixbXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3RvclwiKSk6dC5maXp6eVVJVXRpbHM9ZSh0LHQubWF0Y2hlc1NlbGVjdG9yKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9e307aS5leHRlbmQ9ZnVuY3Rpb24odCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9LGkubW9kdWxvPWZ1bmN0aW9uKHQsZSl7cmV0dXJuKHQlZStlKSVlfSxpLm1ha2VBcnJheT1mdW5jdGlvbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKHQmJlwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9LGkucmVtb3ZlRnJvbT1mdW5jdGlvbih0LGUpe3ZhciBpPXQuaW5kZXhPZihlKTtpIT0tMSYmdC5zcGxpY2UoaSwxKX0saS5nZXRQYXJlbnQ9ZnVuY3Rpb24odCxpKXtmb3IoO3QhPWRvY3VtZW50LmJvZHk7KWlmKHQ9dC5wYXJlbnROb2RlLGUodCxpKSlyZXR1cm4gdH0saS5nZXRRdWVyeUVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0KTp0fSxpLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0saS5maWx0ZXJGaW5kRWxlbWVudHM9ZnVuY3Rpb24odCxuKXt0PWkubWFrZUFycmF5KHQpO3ZhciBzPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7aWYodCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtpZighbilyZXR1cm4gdm9pZCBzLnB1c2godCk7ZSh0LG4pJiZzLnB1c2godCk7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChuKSxvPTA7bzxpLmxlbmd0aDtvKyspcy5wdXNoKGlbb10pfX0pLHN9LGkuZGVib3VuY2VNZXRob2Q9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPXQucHJvdG90eXBlW2VdLHM9ZStcIlRpbWVvdXRcIjt0LnByb3RvdHlwZVtlXT1mdW5jdGlvbigpe3ZhciB0PXRoaXNbc107dCYmY2xlYXJUaW1lb3V0KHQpO3ZhciBlPWFyZ3VtZW50cyxvPXRoaXM7dGhpc1tzXT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5hcHBseShvLGUpLGRlbGV0ZSBvW3NdfSxpfHwxMDApfX0saS5kb2NSZWFkeT1mdW5jdGlvbih0KXt2YXIgZT1kb2N1bWVudC5yZWFkeVN0YXRlO1wiY29tcGxldGVcIj09ZXx8XCJpbnRlcmFjdGl2ZVwiPT1lP3NldFRpbWVvdXQodCk6ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIix0KX0saS50b0Rhc2hlZD1mdW5jdGlvbih0KXtyZXR1cm4gdC5yZXBsYWNlKC8oLikoW0EtWl0pL2csZnVuY3Rpb24odCxlLGkpe3JldHVybiBlK1wiLVwiK2l9KS50b0xvd2VyQ2FzZSgpfTt2YXIgbj10LmNvbnNvbGU7cmV0dXJuIGkuaHRtbEluaXQ9ZnVuY3Rpb24oZSxzKXtpLmRvY1JlYWR5KGZ1bmN0aW9uKCl7dmFyIG89aS50b0Rhc2hlZChzKSxyPVwiZGF0YS1cIitvLGE9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltcIityK1wiXVwiKSxsPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtXCIrbyksaD1pLm1ha2VBcnJheShhKS5jb25jYXQoaS5tYWtlQXJyYXkobCkpLGM9citcIi1vcHRpb25zXCIsZD10LmpRdWVyeTtoLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGksbz10LmdldEF0dHJpYnV0ZShyKXx8dC5nZXRBdHRyaWJ1dGUoYyk7dHJ5e2k9byYmSlNPTi5wYXJzZShvKX1jYXRjaChhKXtyZXR1cm4gdm9pZChuJiZuLmVycm9yKFwiRXJyb3IgcGFyc2luZyBcIityK1wiIG9uIFwiK3QuY2xhc3NOYW1lK1wiOiBcIithKSl9dmFyIGw9bmV3IGUodCxpKTtkJiZkLmRhdGEodCxzLGwpfSl9KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2NlbGxcIixbXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5DZWxsPWUodCx0LmdldFNpemUpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe3RoaXMuZWxlbWVudD10LHRoaXMucGFyZW50PWUsdGhpcy5jcmVhdGUoKX12YXIgbj1pLnByb3RvdHlwZTtyZXR1cm4gbi5jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiLHRoaXMueD0wLHRoaXMuc2hpZnQ9MH0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiXCI7dmFyIHQ9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbdF09XCJcIn0sbi5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWUodGhpcy5lbGVtZW50KX0sbi5zZXRQb3NpdGlvbj1mdW5jdGlvbih0KXt0aGlzLng9dCx0aGlzLnVwZGF0ZVRhcmdldCgpLHRoaXMucmVuZGVyUG9zaXRpb24odCl9LG4udXBkYXRlVGFyZ2V0PW4uc2V0RGVmYXVsdFRhcmdldD1mdW5jdGlvbigpe3ZhciB0PVwibGVmdFwiPT10aGlzLnBhcmVudC5vcmlnaW5TaWRlP1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5zaXplW3RdK3RoaXMuc2l6ZS53aWR0aCp0aGlzLnBhcmVudC5jZWxsQWxpZ259LG4ucmVuZGVyUG9zaXRpb249ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbZV09dGhpcy5wYXJlbnQuZ2V0UG9zaXRpb25WYWx1ZSh0KX0sbi53cmFwU2hpZnQ9ZnVuY3Rpb24odCl7dGhpcy5zaGlmdD10LHRoaXMucmVuZGVyUG9zaXRpb24odGhpcy54K3RoaXMucGFyZW50LnNsaWRlYWJsZVdpZHRoKnQpfSxuLnJlbW92ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9zbGlkZVwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LlNsaWRlPWUoKSl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy5wYXJlbnQ9dCx0aGlzLmlzT3JpZ2luTGVmdD1cImxlZnRcIj09dC5vcmlnaW5TaWRlLHRoaXMuY2VsbHM9W10sdGhpcy5vdXRlcldpZHRoPTAsdGhpcy5oZWlnaHQ9MH12YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5hZGRDZWxsPWZ1bmN0aW9uKHQpe2lmKHRoaXMuY2VsbHMucHVzaCh0KSx0aGlzLm91dGVyV2lkdGgrPXQuc2l6ZS5vdXRlcldpZHRoLHRoaXMuaGVpZ2h0PU1hdGgubWF4KHQuc2l6ZS5vdXRlckhlaWdodCx0aGlzLmhlaWdodCksMT09dGhpcy5jZWxscy5sZW5ndGgpe3RoaXMueD10Lng7dmFyIGU9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMuZmlyc3RNYXJnaW49dC5zaXplW2VdfX0sZS51cGRhdGVUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsZT10aGlzLmdldExhc3RDZWxsKCksaT1lP2Uuc2l6ZVt0XTowLG49dGhpcy5vdXRlcldpZHRoLSh0aGlzLmZpcnN0TWFyZ2luK2kpO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLmZpcnN0TWFyZ2luK24qdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxlLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LGUuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwiYWRkXCIpfSxlLnVuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpfSxlLmNoYW5nZVNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuZWxlbWVudC5jbGFzc0xpc3RbdF0oXCJpcy1zZWxlY3RlZFwiKX0pfSxlLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hbmltYXRlXCIsW1wiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZT1lKHQsdC5maXp6eVVJVXRpbHMpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHQud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lLG49MDtpfHwoaT1mdW5jdGlvbih0KXt2YXIgZT0obmV3IERhdGUpLmdldFRpbWUoKSxpPU1hdGgubWF4KDAsMTYtKGUtbikpLHM9c2V0VGltZW91dCh0LGkpO3JldHVybiBuPWUraSxzfSk7dmFyIHM9e307cy5zdGFydEFuaW1hdGlvbj1mdW5jdGlvbigpe3RoaXMuaXNBbmltYXRpbmd8fCh0aGlzLmlzQW5pbWF0aW5nPSEwLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMuYW5pbWF0ZSgpKX0scy5hbmltYXRlPWZ1bmN0aW9uKCl7dGhpcy5hcHBseURyYWdGb3JjZSgpLHRoaXMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24oKTt2YXIgdD10aGlzLng7aWYodGhpcy5pbnRlZ3JhdGVQaHlzaWNzKCksdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuc2V0dGxlKHQpLHRoaXMuaXNBbmltYXRpbmcpe3ZhciBlPXRoaXM7aShmdW5jdGlvbigpe2UuYW5pbWF0ZSgpfSl9fTt2YXIgbz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdC50cmFuc2Zvcm0/XCJ0cmFuc2Zvcm1cIjpcIldlYmtpdFRyYW5zZm9ybVwifSgpO3JldHVybiBzLnBvc2l0aW9uU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy54O3RoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aD4xJiYodD1lLm1vZHVsbyh0LHRoaXMuc2xpZGVhYmxlV2lkdGgpLHQtPXRoaXMuc2xpZGVhYmxlV2lkdGgsdGhpcy5zaGlmdFdyYXBDZWxscyh0KSksdCs9dGhpcy5jdXJzb3JQb3NpdGlvbix0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmbz8tdDp0O3ZhciBpPXRoaXMuZ2V0UG9zaXRpb25WYWx1ZSh0KTt0aGlzLnNsaWRlci5zdHlsZVtvXT10aGlzLmlzQW5pbWF0aW5nP1widHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCI6XCJ0cmFuc2xhdGVYKFwiK2krXCIpXCI7dmFyIG49dGhpcy5zbGlkZXNbMF07aWYobil7dmFyIHM9LXRoaXMueC1uLnRhcmdldCxyPXMvdGhpcy5zbGlkZXNXaWR0aDt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzY3JvbGxcIixudWxsLFtyLHNdKX19LHMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5jZWxscy5sZW5ndGgmJih0aGlzLng9LXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQsdGhpcy5wb3NpdGlvblNsaWRlcigpKX0scy5nZXRQb3NpdGlvblZhbHVlPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLm9wdGlvbnMucGVyY2VudFBvc2l0aW9uPy4wMSpNYXRoLnJvdW5kKHQvdGhpcy5zaXplLmlubmVyV2lkdGgqMWU0KStcIiVcIjpNYXRoLnJvdW5kKHQpK1wicHhcIn0scy5zZXR0bGU9ZnVuY3Rpb24odCl7dGhpcy5pc1BvaW50ZXJEb3dufHxNYXRoLnJvdW5kKDEwMCp0aGlzLngpIT1NYXRoLnJvdW5kKDEwMCp0KXx8dGhpcy5yZXN0aW5nRnJhbWVzKyssdGhpcy5yZXN0aW5nRnJhbWVzPjImJih0aGlzLmlzQW5pbWF0aW5nPSExLGRlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZyx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2V0dGxlXCIpKX0scy5zaGlmdFdyYXBDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmN1cnNvclBvc2l0aW9uK3Q7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMsZSwtMSk7dmFyIGk9dGhpcy5zaXplLmlubmVyV2lkdGgtKHQrdGhpcy5zbGlkZWFibGVXaWR0aCt0aGlzLmN1cnNvclBvc2l0aW9uKTt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzLGksMSl9LHMuX3NoaWZ0Q2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcz10W25dLG89ZT4wP2k6MDtzLndyYXBTaGlmdChvKSxlLT1zLnNpemUub3V0ZXJXaWR0aH19LHMuX3Vuc2hpZnRDZWxscz1mdW5jdGlvbih0KXtpZih0JiZ0Lmxlbmd0aClmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl0W2VdLndyYXBTaGlmdCgwKX0scy5pbnRlZ3JhdGVQaHlzaWNzPWZ1bmN0aW9uKCl7dGhpcy54Kz10aGlzLnZlbG9jaXR5LHRoaXMudmVsb2NpdHkqPXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKX0scy5hcHBseUZvcmNlPWZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkrPXR9LHMuZ2V0RnJpY3Rpb25GYWN0b3I9ZnVuY3Rpb24oKXtyZXR1cm4gMS10aGlzLm9wdGlvbnNbdGhpcy5pc0ZyZWVTY3JvbGxpbmc/XCJmcmVlU2Nyb2xsRnJpY3Rpb25cIjpcImZyaWN0aW9uXCJdfSxzLmdldFJlc3RpbmdQb3NpdGlvbj1mdW5jdGlvbigpe3JldHVybiB0aGlzLngrdGhpcy52ZWxvY2l0eS8oMS10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCkpfSxzLmFwcGx5RHJhZ0ZvcmNlPWZ1bmN0aW9uKCl7aWYodGhpcy5pc1BvaW50ZXJEb3duKXt2YXIgdD10aGlzLmRyYWdYLXRoaXMueCxlPXQtdGhpcy52ZWxvY2l0eTt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNQb2ludGVyRG93biYmIXRoaXMuaXNGcmVlU2Nyb2xsaW5nJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCotMS10aGlzLngsZT10KnRoaXMub3B0aW9ucy5zZWxlY3RlZEF0dHJhY3Rpb247dGhpcy5hcHBseUZvcmNlKGUpfX0sc30pLGZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShcImZsaWNraXR5L2pzL2ZsaWNraXR5XCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vY2VsbFwiLFwiLi9zbGlkZVwiLFwiLi9hbmltYXRlXCJdLGZ1bmN0aW9uKGksbixzLG8scixhKXtyZXR1cm4gZSh0LGksbixzLG8scixhKX0pO2Vsc2UgaWYoXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vY2VsbFwiKSxyZXF1aXJlKFwiLi9zbGlkZVwiKSxyZXF1aXJlKFwiLi9hbmltYXRlXCIpKTtlbHNle3ZhciBpPXQuRmxpY2tpdHk7dC5GbGlja2l0eT1lKHQsdC5FdkVtaXR0ZXIsdC5nZXRTaXplLHQuZml6enlVSVV0aWxzLGkuQ2VsbCxpLlNsaWRlLGkuYW5pbWF0ZVByb3RvdHlwZSl9fSh3aW5kb3csZnVuY3Rpb24odCxlLGksbixzLG8scil7ZnVuY3Rpb24gYSh0LGUpe2Zvcih0PW4ubWFrZUFycmF5KHQpO3QubGVuZ3RoOyllLmFwcGVuZENoaWxkKHQuc2hpZnQoKSl9ZnVuY3Rpb24gbCh0LGUpe3ZhciBpPW4uZ2V0UXVlcnlFbGVtZW50KHQpO2lmKCFpKXJldHVybiB2b2lkKGQmJmQuZXJyb3IoXCJCYWQgZWxlbWVudCBmb3IgRmxpY2tpdHk6IFwiKyhpfHx0KSkpO2lmKHRoaXMuZWxlbWVudD1pLHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQpe3ZhciBzPWZbdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRF07cmV0dXJuIHMub3B0aW9uKGUpLHN9aCYmKHRoaXMuJGVsZW1lbnQ9aCh0aGlzLmVsZW1lbnQpKSx0aGlzLm9wdGlvbnM9bi5leHRlbmQoe30sdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyksdGhpcy5vcHRpb24oZSksdGhpcy5fY3JlYXRlKCl9dmFyIGg9dC5qUXVlcnksYz10LmdldENvbXB1dGVkU3R5bGUsZD10LmNvbnNvbGUsdT0wLGY9e307bC5kZWZhdWx0cz17YWNjZXNzaWJpbGl0eTohMCxjZWxsQWxpZ246XCJjZW50ZXJcIixmcmVlU2Nyb2xsRnJpY3Rpb246LjA3NSxmcmljdGlvbjouMjgsbmFtZXNwYWNlSlF1ZXJ5RXZlbnRzOiEwLHBlcmNlbnRQb3NpdGlvbjohMCxyZXNpemU6ITAsc2VsZWN0ZWRBdHRyYWN0aW9uOi4wMjUsc2V0R2FsbGVyeVNpemU6ITB9LGwuY3JlYXRlTWV0aG9kcz1bXTt2YXIgcD1sLnByb3RvdHlwZTtuLmV4dGVuZChwLGUucHJvdG90eXBlKSxwLl9jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmd1aWQ9Kyt1O3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQ9ZSxmW2VdPXRoaXMsdGhpcy5zZWxlY3RlZEluZGV4PTAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy54PTAsdGhpcy52ZWxvY2l0eT0wLHRoaXMub3JpZ2luU2lkZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJyaWdodFwiOlwibGVmdFwiLHRoaXMudmlld3BvcnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLnZpZXdwb3J0LmNsYXNzTmFtZT1cImZsaWNraXR5LXZpZXdwb3J0XCIsdGhpcy5fY3JlYXRlU2xpZGVyKCksKHRoaXMub3B0aW9ucy5yZXNpemV8fHRoaXMub3B0aW9ucy53YXRjaENTUykmJnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLGwuY3JlYXRlTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXNbdF0oKX0sdGhpcyksdGhpcy5vcHRpb25zLndhdGNoQ1NTP3RoaXMud2F0Y2hDU1MoKTp0aGlzLmFjdGl2YXRlKCl9LHAub3B0aW9uPWZ1bmN0aW9uKHQpe24uZXh0ZW5kKHRoaXMub3B0aW9ucyx0KX0scC5hY3RpdmF0ZT1mdW5jdGlvbigpe2lmKCF0aGlzLmlzQWN0aXZlKXt0aGlzLmlzQWN0aXZlPSEwLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJnRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuZ2V0U2l6ZSgpO3ZhciB0PXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModGhpcy5lbGVtZW50LmNoaWxkcmVuKTthKHQsdGhpcy5zbGlkZXIpLHRoaXMudmlld3BvcnQuYXBwZW5kQ2hpbGQodGhpcy5zbGlkZXIpLHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXdwb3J0KSx0aGlzLnJlbG9hZENlbGxzKCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQudGFiSW5kZXg9MCx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5lbWl0RXZlbnQoXCJhY3RpdmF0ZVwiKTt2YXIgZSxpPXRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7ZT10aGlzLmlzSW5pdEFjdGl2YXRlZD90aGlzLnNlbGVjdGVkSW5kZXg6dm9pZCAwIT09aSYmdGhpcy5jZWxsc1tpXT9pOjAsdGhpcy5zZWxlY3QoZSwhMSwhMCksdGhpcy5pc0luaXRBY3RpdmF0ZWQ9ITB9fSxwLl9jcmVhdGVTbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3QuY2xhc3NOYW1lPVwiZmxpY2tpdHktc2xpZGVyXCIsdC5zdHlsZVt0aGlzLm9yaWdpblNpZGVdPTAsdGhpcy5zbGlkZXI9dH0scC5fZmlsdGVyRmluZENlbGxFbGVtZW50cz1mdW5jdGlvbih0KXtyZXR1cm4gbi5maWx0ZXJGaW5kRWxlbWVudHModCx0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yKX0scC5yZWxvYWRDZWxscz1mdW5jdGlvbigpe3RoaXMuY2VsbHM9dGhpcy5fbWFrZUNlbGxzKHRoaXMuc2xpZGVyLmNoaWxkcmVuKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKX0scC5fbWFrZUNlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModCksaT1lLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gbmV3IHModCx0aGlzKX0sdGhpcyk7cmV0dXJuIGl9LHAuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0scC5nZXRMYXN0U2xpZGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zbGlkZXNbdGhpcy5zbGlkZXMubGVuZ3RoLTFdfSxwLnBvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLl9zaXplQ2VsbHModGhpcy5jZWxscyksdGhpcy5fcG9zaXRpb25DZWxscygwKX0scC5fcG9zaXRpb25DZWxscz1mdW5jdGlvbih0KXt0PXR8fDAsdGhpcy5tYXhDZWxsSGVpZ2h0PXQ/dGhpcy5tYXhDZWxsSGVpZ2h0fHwwOjA7dmFyIGU9MDtpZih0PjApe3ZhciBpPXRoaXMuY2VsbHNbdC0xXTtlPWkueCtpLnNpemUub3V0ZXJXaWR0aH1mb3IodmFyIG49dGhpcy5jZWxscy5sZW5ndGgscz10O3M8bjtzKyspe3ZhciBvPXRoaXMuY2VsbHNbc107by5zZXRQb3NpdGlvbihlKSxlKz1vLnNpemUub3V0ZXJXaWR0aCx0aGlzLm1heENlbGxIZWlnaHQ9TWF0aC5tYXgoby5zaXplLm91dGVySGVpZ2h0LHRoaXMubWF4Q2VsbEhlaWdodCl9dGhpcy5zbGlkZWFibGVXaWR0aD1lLHRoaXMudXBkYXRlU2xpZGVzKCksdGhpcy5fY29udGFpblNsaWRlcygpLHRoaXMuc2xpZGVzV2lkdGg9bj90aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldC10aGlzLnNsaWRlc1swXS50YXJnZXQ6MH0scC5fc2l6ZUNlbGxzPWZ1bmN0aW9uKHQpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt0LmdldFNpemUoKX0pfSxwLnVwZGF0ZVNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMuc2xpZGVzPVtdLHRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD1uZXcgbyh0aGlzKTt0aGlzLnNsaWRlcy5wdXNoKHQpO3ZhciBlPVwibGVmdFwiPT10aGlzLm9yaWdpblNpZGUsaT1lP1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixuPXRoaXMuX2dldENhbkNlbGxGaXQoKTt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSxzKXtpZighdC5jZWxscy5sZW5ndGgpcmV0dXJuIHZvaWQgdC5hZGRDZWxsKGUpO3ZhciByPXQub3V0ZXJXaWR0aC10LmZpcnN0TWFyZ2luKyhlLnNpemUub3V0ZXJXaWR0aC1lLnNpemVbaV0pO24uY2FsbCh0aGlzLHMscik/dC5hZGRDZWxsKGUpOih0LnVwZGF0ZVRhcmdldCgpLHQ9bmV3IG8odGhpcyksdGhpcy5zbGlkZXMucHVzaCh0KSx0LmFkZENlbGwoZSkpfSx0aGlzKSx0LnVwZGF0ZVRhcmdldCgpLHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpfX0scC5fZ2V0Q2FuQ2VsbEZpdD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5ncm91cENlbGxzO2lmKCF0KXJldHVybiBmdW5jdGlvbigpe3JldHVybiExfTtpZihcIm51bWJlclwiPT10eXBlb2YgdCl7dmFyIGU9cGFyc2VJbnQodCwxMCk7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0JWUhPT0wfX12YXIgaT1cInN0cmluZ1wiPT10eXBlb2YgdCYmdC5tYXRjaCgvXihcXGQrKSUkLyksbj1pP3BhcnNlSW50KGlbMV0sMTApLzEwMDoxO3JldHVybiBmdW5jdGlvbih0LGUpe3JldHVybiBlPD0odGhpcy5zaXplLmlubmVyV2lkdGgrMSkqbn19LHAuX2luaXQ9cC5yZXBvc2l0aW9uPWZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX0scC5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWkodGhpcy5lbGVtZW50KSx0aGlzLnNldENlbGxBbGlnbigpLHRoaXMuY3Vyc29yUG9zaXRpb249dGhpcy5zaXplLmlubmVyV2lkdGgqdGhpcy5jZWxsQWxpZ259O3ZhciB2PXtjZW50ZXI6e2xlZnQ6LjUscmlnaHQ6LjV9LGxlZnQ6e2xlZnQ6MCxyaWdodDoxfSxyaWdodDp7cmlnaHQ6MCxsZWZ0OjF9fTtyZXR1cm4gcC5zZXRDZWxsQWxpZ249ZnVuY3Rpb24oKXt2YXIgdD12W3RoaXMub3B0aW9ucy5jZWxsQWxpZ25dO3RoaXMuY2VsbEFsaWduPXQ/dFt0aGlzLm9yaWdpblNpZGVdOnRoaXMub3B0aW9ucy5jZWxsQWxpZ259LHAuc2V0R2FsbGVyeVNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUpe3ZhciB0PXRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZWxlY3RlZFNsaWRlP3RoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQ6dGhpcy5tYXhDZWxsSGVpZ2h0O3RoaXMudmlld3BvcnQuc3R5bGUuaGVpZ2h0PXQrXCJweFwifX0scC5fZ2V0V3JhcFNoaWZ0Q2VsbHM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyksdGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzKTt2YXIgdD10aGlzLmN1cnNvclBvc2l0aW9uLGU9dGhpcy5jZWxscy5sZW5ndGgtMTt0aGlzLmJlZm9yZVNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCxlLC0xKSx0PXRoaXMuc2l6ZS5pbm5lcldpZHRoLXRoaXMuY3Vyc29yUG9zaXRpb24sdGhpcy5hZnRlclNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCwwLDEpfX0scC5fZ2V0R2FwQ2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj1bXTt0PjA7KXt2YXIgcz10aGlzLmNlbGxzW2VdO2lmKCFzKWJyZWFrO24ucHVzaChzKSxlKz1pLHQtPXMuc2l6ZS5vdXRlcldpZHRofXJldHVybiBufSxwLl9jb250YWluU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCxlPXQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGk9dD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCIsbj10aGlzLnNsaWRlYWJsZVdpZHRoLXRoaXMuZ2V0TGFzdENlbGwoKS5zaXplW2ldLHM9bjx0aGlzLnNpemUuaW5uZXJXaWR0aCxvPXRoaXMuY3Vyc29yUG9zaXRpb24rdGhpcy5jZWxsc1swXS5zaXplW2VdLHI9bi10aGlzLnNpemUuaW5uZXJXaWR0aCooMS10aGlzLmNlbGxBbGlnbik7dGhpcy5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbih0KXtzP3QudGFyZ2V0PW4qdGhpcy5jZWxsQWxpZ246KHQudGFyZ2V0PU1hdGgubWF4KHQudGFyZ2V0LG8pLHQudGFyZ2V0PU1hdGgubWluKHQudGFyZ2V0LHIpKX0sdGhpcyl9fSxwLmRpc3BhdGNoRXZlbnQ9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPWU/W2VdLmNvbmNhdChpKTppO2lmKHRoaXMuZW1pdEV2ZW50KHQsbiksaCYmdGhpcy4kZWxlbWVudCl7dCs9dGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cz9cIi5mbGlja2l0eVwiOlwiXCI7dmFyIHM9dDtpZihlKXt2YXIgbz1oLkV2ZW50KGUpO28udHlwZT10LHM9b310aGlzLiRlbGVtZW50LnRyaWdnZXIocyxpKX19LHAuc2VsZWN0PWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzQWN0aXZlJiYodD1wYXJzZUludCh0LDEwKSx0aGlzLl93cmFwU2VsZWN0KHQpLCh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZHx8ZSkmJih0PW4ubW9kdWxvKHQsdGhpcy5zbGlkZXMubGVuZ3RoKSksdGhpcy5zbGlkZXNbdF0mJih0aGlzLnNlbGVjdGVkSW5kZXg9dCx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKSxpP3RoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk6dGhpcy5zdGFydEFuaW1hdGlvbigpLHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNlbGVjdFwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJjZWxsU2VsZWN0XCIpKSl9LHAuX3dyYXBTZWxlY3Q9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5zbGlkZXMubGVuZ3RoLGk9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmU+MTtpZighaSlyZXR1cm4gdDt2YXIgcz1uLm1vZHVsbyh0LGUpLG89TWF0aC5hYnMocy10aGlzLnNlbGVjdGVkSW5kZXgpLHI9TWF0aC5hYnMocytlLXRoaXMuc2VsZWN0ZWRJbmRleCksYT1NYXRoLmFicyhzLWUtdGhpcy5zZWxlY3RlZEluZGV4KTshdGhpcy5pc0RyYWdTZWxlY3QmJnI8bz90Kz1lOiF0aGlzLmlzRHJhZ1NlbGVjdCYmYTxvJiYodC09ZSksdDwwP3RoaXMueC09dGhpcy5zbGlkZWFibGVXaWR0aDp0Pj1lJiYodGhpcy54Kz10aGlzLnNsaWRlYWJsZVdpZHRoKX0scC5wcmV2aW91cz1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleC0xLHQsZSl9LHAubmV4dD1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCsxLHQsZSl9LHAudXBkYXRlU2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuc2xpZGVzW3RoaXMuc2VsZWN0ZWRJbmRleF07dCYmKHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5zZWxlY3RlZFNsaWRlPXQsdC5zZWxlY3QoKSx0aGlzLnNlbGVjdGVkQ2VsbHM9dC5jZWxscyx0aGlzLnNlbGVjdGVkRWxlbWVudHM9dC5nZXRDZWxsRWxlbWVudHMoKSx0aGlzLnNlbGVjdGVkQ2VsbD10LmNlbGxzWzBdLHRoaXMuc2VsZWN0ZWRFbGVtZW50PXRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXSl9LHAudW5zZWxlY3RTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZFNsaWRlJiZ0aGlzLnNlbGVjdGVkU2xpZGUudW5zZWxlY3QoKX0scC5zZWxlY3RDZWxsPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbjtcIm51bWJlclwiPT10eXBlb2YgdD9uPXRoaXMuY2VsbHNbdF06KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD10aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0KSksbj10aGlzLmdldENlbGwodCkpO2Zvcih2YXIgcz0wO24mJnM8dGhpcy5zbGlkZXMubGVuZ3RoO3MrKyl7dmFyIG89dGhpcy5zbGlkZXNbc10scj1vLmNlbGxzLmluZGV4T2Yobik7aWYociE9LTEpcmV0dXJuIHZvaWQgdGhpcy5zZWxlY3QocyxlLGkpfX0scC5nZXRDZWxsPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5jZWxscy5sZW5ndGg7ZSsrKXt2YXIgaT10aGlzLmNlbGxzW2VdO2lmKGkuZWxlbWVudD09dClyZXR1cm4gaX19LHAuZ2V0Q2VsbHM9ZnVuY3Rpb24odCl7dD1uLm1ha2VBcnJheSh0KTt2YXIgZT1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpPXRoaXMuZ2V0Q2VsbCh0KTtpJiZlLnB1c2goaSl9LHRoaXMpLGV9LHAuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0scC5nZXRQYXJlbnRDZWxsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtyZXR1cm4gZT9lOih0PW4uZ2V0UGFyZW50KHQsXCIuZmxpY2tpdHktc2xpZGVyID4gKlwiKSx0aGlzLmdldENlbGwodCkpfSxwLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQsZSl7aWYoIXQpcmV0dXJuIHRoaXMuc2VsZWN0ZWRTbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtlPXZvaWQgMD09PWU/dGhpcy5zZWxlY3RlZEluZGV4OmU7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoO2lmKDErMip0Pj1pKXJldHVybiB0aGlzLmdldENlbGxFbGVtZW50cygpO2Zvcih2YXIgcz1bXSxvPWUtdDtvPD1lK3Q7bysrKXt2YXIgcj10aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9uLm1vZHVsbyhvLGkpOm8sYT10aGlzLnNsaWRlc1tyXTthJiYocz1zLmNvbmNhdChhLmdldENlbGxFbGVtZW50cygpKSl9cmV0dXJuIHN9LHAudWlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLmVtaXRFdmVudChcInVpQ2hhbmdlXCIpfSxwLmNoaWxkVUlQb2ludGVyRG93bj1mdW5jdGlvbih0KXt0aGlzLmVtaXRFdmVudChcImNoaWxkVUlQb2ludGVyRG93blwiLFt0XSl9LHAub25yZXNpemU9ZnVuY3Rpb24oKXt0aGlzLndhdGNoQ1NTKCksdGhpcy5yZXNpemUoKX0sbi5kZWJvdW5jZU1ldGhvZChsLFwib25yZXNpemVcIiwxNTApLHAucmVzaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0FjdGl2ZSl7dGhpcy5nZXRTaXplKCksdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJih0aGlzLng9bi5tb2R1bG8odGhpcy54LHRoaXMuc2xpZGVhYmxlV2lkdGgpKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcInJlc2l6ZVwiKTt2YXIgdD10aGlzLnNlbGVjdGVkRWxlbWVudHMmJnRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXTt0aGlzLnNlbGVjdENlbGwodCwhMSwhMCl9fSxwLndhdGNoQ1NTPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLndhdGNoQ1NTO2lmKHQpe3ZhciBlPWModGhpcy5lbGVtZW50LFwiOmFmdGVyXCIpLmNvbnRlbnQ7ZS5pbmRleE9mKFwiZmxpY2tpdHlcIikhPS0xP3RoaXMuYWN0aXZhdGUoKTp0aGlzLmRlYWN0aXZhdGUoKX19LHAub25rZXlkb3duPWZ1bmN0aW9uKHQpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYoIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnR8fGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PXRoaXMuZWxlbWVudCkpaWYoMzc9PXQua2V5Q29kZSl7dmFyIGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wibmV4dFwiOlwicHJldmlvdXNcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tlXSgpfWVsc2UgaWYoMzk9PXQua2V5Q29kZSl7dmFyIGk9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tpXSgpfX0scC5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0FjdGl2ZSYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24odCl7dC5kZXN0cm95KCl9KSx0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnZpZXdwb3J0KSxhKHRoaXMuc2xpZGVyLmNoaWxkcmVuLHRoaXMuZWxlbWVudCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwidGFiSW5kZXhcIiksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuaXNBY3RpdmU9ITEsdGhpcy5lbWl0RXZlbnQoXCJkZWFjdGl2YXRlXCIpKX0scC5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksdGhpcy5lbWl0RXZlbnQoXCJkZXN0cm95XCIpLGgmJnRoaXMuJGVsZW1lbnQmJmgucmVtb3ZlRGF0YSh0aGlzLmVsZW1lbnQsXCJmbGlja2l0eVwiKSxkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCxkZWxldGUgZlt0aGlzLmd1aWRdfSxuLmV4dGVuZChwLHIpLGwuZGF0YT1mdW5jdGlvbih0KXt0PW4uZ2V0UXVlcnlFbGVtZW50KHQpO3ZhciBlPXQmJnQuZmxpY2tpdHlHVUlEO3JldHVybiBlJiZmW2VdfSxuLmh0bWxJbml0KGwsXCJmbGlja2l0eVwiKSxoJiZoLmJyaWRnZXQmJmguYnJpZGdldChcImZsaWNraXR5XCIsbCksbC5DZWxsPXMsbH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LlVuaXBvaW50ZXI9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCl9LHMudW5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCExKX0scy5fYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24oZSxpKXtpPXZvaWQgMD09PWl8fCEhaTt2YXIgbj1pP1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiO3QubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkP2Vbbl0oXCJwb2ludGVyZG93blwiLHRoaXMpOnQubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQ/ZVtuXShcIk1TUG9pbnRlckRvd25cIix0aGlzKTooZVtuXShcIm1vdXNlZG93blwiLHRoaXMpLGVbbl0oXCJ0b3VjaHN0YXJ0XCIsdGhpcykpfSxzLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0scy5nZXRUb3VjaD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl7dmFyIGk9dFtlXTtpZihpLmlkZW50aWZpZXI9PXRoaXMucG9pbnRlcklkZW50aWZpZXIpcmV0dXJuIGl9fSxzLm9ubW91c2Vkb3duPWZ1bmN0aW9uKHQpe3ZhciBlPXQuYnV0dG9uO2UmJjAhPT1lJiYxIT09ZXx8dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5vbnRvdWNoc3RhcnQ9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0LmNoYW5nZWRUb3VjaGVzWzBdKX0scy5vbk1TUG9pbnRlckRvd249cy5vbnBvaW50ZXJkb3duPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMuX3BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc1BvaW50ZXJEb3dufHwodGhpcy5pc1BvaW50ZXJEb3duPSEwLHRoaXMucG9pbnRlcklkZW50aWZpZXI9dm9pZCAwIT09ZS5wb2ludGVySWQ/ZS5wb2ludGVySWQ6ZS5pZGVudGlmaWVyLHRoaXMucG9pbnRlckRvd24odCxlKSl9LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9O3ZhciBvPXttb3VzZWRvd246W1wibW91c2Vtb3ZlXCIsXCJtb3VzZXVwXCJdLHRvdWNoc3RhcnQ6W1widG91Y2htb3ZlXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hjYW5jZWxcIl0scG9pbnRlcmRvd246W1wicG9pbnRlcm1vdmVcIixcInBvaW50ZXJ1cFwiLFwicG9pbnRlcmNhbmNlbFwiXSxNU1BvaW50ZXJEb3duOltcIk1TUG9pbnRlck1vdmVcIixcIk1TUG9pbnRlclVwXCIsXCJNU1BvaW50ZXJDYW5jZWxcIl19O3JldHVybiBzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKGUpe2lmKGUpe3ZhciBpPW9bZS50eXBlXTtpLmZvckVhY2goZnVuY3Rpb24oZSl7dC5hZGRFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cz1pfX0scy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5fYm91bmRQb2ludGVyRXZlbnRzJiYodGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7dC5yZW1vdmVFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLGRlbGV0ZSB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMpfSxzLm9ubW91c2Vtb3ZlPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub25NU1BvaW50ZXJNb3ZlPXMub25wb2ludGVybW92ZT1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbnRvdWNobW92ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJNb3ZlKHQsZSl9LHMuX3BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5wb2ludGVyTW92ZSh0LGUpfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGVdKX0scy5vbm1vdXNldXA9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub25NU1BvaW50ZXJVcD1zLm9ucG9pbnRlcnVwPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbnRvdWNoZW5kPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlclVwKHQsZSl9LHMuX3BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyVXAodCxlKX0scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKX0scy5fcG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0aGlzLmlzUG9pbnRlckRvd249ITEsZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXIsdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCksdGhpcy5wb2ludGVyRG9uZSgpfSxzLnBvaW50ZXJEb25lPWkscy5vbk1TUG9pbnRlckNhbmNlbD1zLm9ucG9pbnRlcmNhbmNlbD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LHQpfSxzLm9udG91Y2hjYW5jZWw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsZSl9LHMuX3BvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlckNhbmNlbCh0LGUpfSxzLnBvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJDYW5jZWxcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWZ1bmN0aW9uKHQpe3JldHVybnt4OnQucGFnZVgseTp0LnBhZ2VZfX0sbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlVuaWRyYWdnZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITApfSxzLnVuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMSl9O3ZhciBvPXQubmF2aWdhdG9yO3JldHVybiBzLl9iaW5kSGFuZGxlcz1mdW5jdGlvbih0KXt0PXZvaWQgMD09PXR8fCEhdDt2YXIgZTtlPW8ucG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS50b3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Om8ubXNQb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLm1zVG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTppO2Zvcih2YXIgbj10P1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiLHM9MDtzPHRoaXMuaGFuZGxlcy5sZW5ndGg7cysrKXt2YXIgcj10aGlzLmhhbmRsZXNbc107dGhpcy5fYmluZFN0YXJ0RXZlbnQocix0KSxlKHIpLHJbbl0oXCJjbGlja1wiLHRoaXMpfX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe2lmKFwiSU5QVVRcIj09dC50YXJnZXQubm9kZU5hbWUmJlwicmFuZ2VcIj09dC50YXJnZXQudHlwZSlyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKHQsZSk7dmFyIGk9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtpJiZpLmJsdXImJmkuYmx1cigpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX0scy5fZHJhZ1BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsaSl7dGhpcy5wb2ludGVyRG93blBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpO3ZhciBuPXRoaXMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duKHQsaSk7biYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXtyZXR1cm5cIlNFTEVDVFwiIT10LnRhcmdldC5ub2RlTmFtZX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LHMuX2RyYWdQb2ludGVyTW92ZT1mdW5jdGlvbih0LGkpe3ZhciBuPWUuZ2V0UG9pbnRlclBvaW50KGkpLHM9e3g6bi54LXRoaXMucG9pbnRlckRvd25Qb2ludC54LHk6bi55LXRoaXMucG9pbnRlckRvd25Qb2ludC55fTtyZXR1cm4hdGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmhhc0RyYWdTdGFydGVkKHMpJiZ0aGlzLl9kcmFnU3RhcnQodCxpKSxzfSxzLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPjN8fE1hdGguYWJzKHQueSk+M30scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LHMuX2RyYWdQb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc/dGhpcy5fZHJhZ0VuZCh0LGUpOnRoaXMuX3N0YXRpY0NsaWNrKHQsZSl9LHMuX2RyYWdTdGFydD1mdW5jdGlvbih0LGkpe3RoaXMuaXNEcmFnZ2luZz0hMCx0aGlzLmRyYWdTdGFydFBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpLHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzPSEwLHRoaXMuZHJhZ1N0YXJ0KHQsaSl9LHMuZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnU3RhcnRcIixbdCxlXSl9LHMuX2RyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuZHJhZ01vdmUodCxlLGkpfSxzLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5lbWl0RXZlbnQoXCJkcmFnTW92ZVwiLFt0LGUsaV0pfSxzLl9kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nPSExLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3N9LmJpbmQodGhpcykpLHRoaXMuZHJhZ0VuZCh0LGUpfSxzLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdFbmRcIixbdCxlXSl9LHMub25jbGljaz1mdW5jdGlvbih0KXt0aGlzLmlzUHJldmVudGluZ0NsaWNrcyYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLl9zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9dC50eXBlKXt2YXIgaT10LnRhcmdldC5ub2RlTmFtZTtcIklOUFVUXCIhPWkmJlwiVEVYVEFSRUFcIiE9aXx8dC50YXJnZXQuZm9jdXMoKSx0aGlzLnN0YXRpY0NsaWNrKHQsZSksXCJtb3VzZXVwXCIhPXQudHlwZSYmKHRoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITAsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzSWdub3JpbmdNb3VzZVVwfS5iaW5kKHRoaXMpLDQwMCkpfX0scy5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwic3RhdGljQ2xpY2tcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWUuZ2V0UG9pbnRlclBvaW50LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9kcmFnXCIsW1wiLi9mbGlja2l0eVwiLFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInVuaWRyYWdnZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuVW5pZHJhZ2dlcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKCl7cmV0dXJue3g6dC5wYWdlWE9mZnNldCx5OnQucGFnZVlPZmZzZXR9fW4uZXh0ZW5kKGUuZGVmYXVsdHMse2RyYWdnYWJsZTohMCxkcmFnVGhyZXNob2xkOjN9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVEcmFnXCIpO3ZhciBvPWUucHJvdG90eXBlO24uZXh0ZW5kKG8saS5wcm90b3R5cGUpO3ZhciByPVwiY3JlYXRlVG91Y2hcImluIGRvY3VtZW50LGE9ITE7by5fY3JlYXRlRHJhZz1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYmluZERyYWcpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuX3VpQ2hhbmdlRHJhZyksdGhpcy5vbihcImNoaWxkVUlQb2ludGVyRG93blwiLHRoaXMuX2NoaWxkVUlQb2ludGVyRG93bkRyYWcpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy51bmJpbmREcmFnKSxyJiYhYSYmKHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGZ1bmN0aW9uKCl7fSksYT0hMCl9LG8uYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlJiYhdGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMuaGFuZGxlcz1bdGhpcy52aWV3cG9ydF0sdGhpcy5iaW5kSGFuZGxlcygpLHRoaXMuaXNEcmFnQm91bmQ9ITApfSxvLnVuYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy51bmJpbmRIYW5kbGVzKCksZGVsZXRlIHRoaXMuaXNEcmFnQm91bmQpfSxvLl91aUNoYW5nZURyYWc9ZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmd9LG8uX2NoaWxkVUlQb2ludGVyRG93bkRyYWc9ZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucG9pbnRlckRvd25Gb2N1cyh0KX07dmFyIGw9e1RFWFRBUkVBOiEwLElOUFVUOiEwLE9QVElPTjohMH0saD17cmFkaW86ITAsY2hlY2tib3g6ITAsYnV0dG9uOiEwLHN1Ym1pdDohMCxpbWFnZTohMCxmaWxlOiEwfTtvLnBvaW50ZXJEb3duPWZ1bmN0aW9uKGUsaSl7dmFyIG49bFtlLnRhcmdldC5ub2RlTmFtZV0mJiFoW2UudGFyZ2V0LnR5cGVdO2lmKG4pcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bihlLGkpO3ZhciBvPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7byYmby5ibHVyJiZvIT10aGlzLmVsZW1lbnQmJm8hPWRvY3VtZW50LmJvZHkmJm8uYmx1cigpLHRoaXMucG9pbnRlckRvd25Gb2N1cyhlKSx0aGlzLmRyYWdYPXRoaXMueCx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyhlKSx0aGlzLnBvaW50ZXJEb3duU2Nyb2xsPXMoKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyRG93blwiLGUsW2ldKX07dmFyIGM9e3RvdWNoc3RhcnQ6ITAsTVNQb2ludGVyRG93bjohMH0sZD17SU5QVVQ6ITAsU0VMRUNUOiEwfTtyZXR1cm4gby5wb2ludGVyRG93bkZvY3VzPWZ1bmN0aW9uKGUpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYhY1tlLnR5cGVdJiYhZFtlLnRhcmdldC5ub2RlTmFtZV0pe3ZhciBpPXQucGFnZVlPZmZzZXQ7dGhpcy5lbGVtZW50LmZvY3VzKCksdC5wYWdlWU9mZnNldCE9aSYmdC5zY3JvbGxUbyh0LnBhZ2VYT2Zmc2V0LGkpfX0sby5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dmFyIGU9XCJ0b3VjaHN0YXJ0XCI9PXQudHlwZSxpPXQudGFyZ2V0Lm5vZGVOYW1lO3JldHVybiFlJiZcIlNFTEVDVFwiIT1pfSxvLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPnRoaXMub3B0aW9ucy5kcmFnVGhyZXNob2xkfSxvLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe2RlbGV0ZSB0aGlzLmlzVG91Y2hTY3JvbGxpbmcsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJVcFwiLHQsW2VdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LG8ucG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSxkZWxldGUgdGhpcy5wb2ludGVyRG93blNjcm9sbH0sby5kcmFnU3RhcnQ9ZnVuY3Rpb24oZSxpKXt0aGlzLmRyYWdTdGFydFBvc2l0aW9uPXRoaXMueCx0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ1N0YXJ0XCIsZSxbaV0pfSxvLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlck1vdmVcIix0LFtlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LG8uZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnByZXZpb3VzRHJhZ1g9dGhpcy5kcmFnWDt2YXIgbj10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/LTE6MSxzPXRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24raS54Km47aWYoIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLnNsaWRlcy5sZW5ndGgpe3ZhciBvPU1hdGgubWF4KC10aGlzLnNsaWRlc1swXS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPm8/LjUqKHMrbyk6czt2YXIgcj1NYXRoLm1pbigtdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPHI/LjUqKHMrcik6c310aGlzLmRyYWdYPXMsdGhpcy5kcmFnTW92ZVRpbWU9bmV3IERhdGUsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ01vdmVcIix0LFtlLGldKX0sby5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJih0aGlzLmlzRnJlZVNjcm9sbGluZz0hMCk7dmFyIGk9dGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO2lmKHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3ZhciBuPXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCk7dGhpcy5pc0ZyZWVTY3JvbGxpbmc9LW4+dGhpcy5zbGlkZXNbMF0udGFyZ2V0JiYtbjx0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldH1lbHNlIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsfHxpIT10aGlzLnNlbGVjdGVkSW5kZXh8fChpKz10aGlzLmRyYWdFbmRCb29zdFNlbGVjdCgpKTtkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYLHRoaXMuaXNEcmFnU2VsZWN0PXRoaXMub3B0aW9ucy53cmFwQXJvdW5kLHRoaXMuc2VsZWN0KGkpLGRlbGV0ZSB0aGlzLmlzRHJhZ1NlbGVjdCx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnRW5kXCIsdCxbZV0pfSxvLmRyYWdFbmRSZXN0aW5nU2VsZWN0PWZ1bmN0aW9uKCl7XG52YXIgdD10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpLGU9TWF0aC5hYnModGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LHRoaXMuc2VsZWN0ZWRJbmRleCkpLGk9dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLDEpLG49dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLC0xKSxzPWkuZGlzdGFuY2U8bi5kaXN0YW5jZT9pLmluZGV4Om4uaW5kZXg7cmV0dXJuIHN9LG8uX2dldENsb3Nlc3RSZXN0aW5nPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49dGhpcy5zZWxlY3RlZEluZGV4LHM9MS8wLG89dGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9mdW5jdGlvbih0LGUpe3JldHVybiB0PD1lfTpmdW5jdGlvbih0LGUpe3JldHVybiB0PGV9O28oZSxzKSYmKG4rPWkscz1lLGU9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LG4pLG51bGwhPT1lKTspZT1NYXRoLmFicyhlKTtyZXR1cm57ZGlzdGFuY2U6cyxpbmRleDpuLWl9fSxvLmdldFNsaWRlRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGgscz10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmaT4xLG89cz9uLm1vZHVsbyhlLGkpOmUscj10aGlzLnNsaWRlc1tvXTtpZighcilyZXR1cm4gbnVsbDt2YXIgYT1zP3RoaXMuc2xpZGVhYmxlV2lkdGgqTWF0aC5mbG9vcihlL2kpOjA7cmV0dXJuIHQtKHIudGFyZ2V0K2EpfSxvLmRyYWdFbmRCb29zdFNlbGVjdD1mdW5jdGlvbigpe2lmKHZvaWQgMD09PXRoaXMucHJldmlvdXNEcmFnWHx8IXRoaXMuZHJhZ01vdmVUaW1lfHxuZXcgRGF0ZS10aGlzLmRyYWdNb3ZlVGltZT4xMDApcmV0dXJuIDA7dmFyIHQ9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10aGlzLmRyYWdYLHRoaXMuc2VsZWN0ZWRJbmRleCksZT10aGlzLnByZXZpb3VzRHJhZ1gtdGhpcy5kcmFnWDtyZXR1cm4gdD4wJiZlPjA/MTp0PDAmJmU8MD8tMTowfSxvLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5nZXRQYXJlbnRDZWxsKHQudGFyZ2V0KSxuPWkmJmkuZWxlbWVudCxzPWkmJnRoaXMuY2VsbHMuaW5kZXhPZihpKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzdGF0aWNDbGlja1wiLHQsW2UsbixzXSl9LG8ub25zY3JvbGw9ZnVuY3Rpb24oKXt2YXIgdD1zKCksZT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLngtdC54LGk9dGhpcy5wb2ludGVyRG93blNjcm9sbC55LXQueTsoTWF0aC5hYnMoZSk+M3x8TWF0aC5hYnMoaSk+MykmJnRoaXMuX3BvaW50ZXJEb25lKCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVGFwTGlzdGVuZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCl7dGhpcy5iaW5kVGFwKHQpfXZhciBuPWkucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3JldHVybiBuLmJpbmRUYXA9ZnVuY3Rpb24odCl7dCYmKHRoaXMudW5iaW5kVGFwKCksdGhpcy50YXBFbGVtZW50PXQsdGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCkpfSxuLnVuYmluZFRhcD1mdW5jdGlvbigpe3RoaXMudGFwRWxlbWVudCYmKHRoaXMuX2JpbmRTdGFydEV2ZW50KHRoaXMudGFwRWxlbWVudCwhMCksZGVsZXRlIHRoaXMudGFwRWxlbWVudCl9LG4ucG9pbnRlclVwPWZ1bmN0aW9uKGksbil7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT1pLnR5cGUpe3ZhciBzPWUuZ2V0UG9pbnRlclBvaW50KG4pLG89dGhpcy50YXBFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLHI9dC5wYWdlWE9mZnNldCxhPXQucGFnZVlPZmZzZXQsbD1zLng+PW8ubGVmdCtyJiZzLng8PW8ucmlnaHQrciYmcy55Pj1vLnRvcCthJiZzLnk8PW8uYm90dG9tK2E7aWYobCYmdGhpcy5lbWl0RXZlbnQoXCJ0YXBcIixbaSxuXSksXCJtb3VzZXVwXCIhPWkudHlwZSl7dGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMDt2YXIgaD10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgaC5pc0lnbm9yaW5nTW91c2VVcH0sNDAwKX19fSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLnBvaW50ZXJEb25lKCksdGhpcy51bmJpbmRUYXAoKX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3ByZXYtbmV4dC1idXR0b25cIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcyh0LGUpe3RoaXMuZGlyZWN0aW9uPXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLl9jcmVhdGUoKX1mdW5jdGlvbiBvKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P3Q6XCJNIFwiK3QueDArXCIsNTAgTCBcIit0LngxK1wiLFwiKyh0LnkxKzUwKStcIiBMIFwiK3QueDIrXCIsXCIrKHQueTIrNTApK1wiIEwgXCIrdC54MytcIiw1MCAgTCBcIit0LngyK1wiLFwiKyg1MC10LnkyKStcIiBMIFwiK3QueDErXCIsXCIrKDUwLXQueTEpK1wiIFpcIn12YXIgcj1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkPSEwLHRoaXMuaXNQcmV2aW91cz10aGlzLmRpcmVjdGlvbj09LTE7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5yaWdodFRvTGVmdD8xOi0xO3RoaXMuaXNMZWZ0PXRoaXMuZGlyZWN0aW9uPT10O3ZhciBlPXRoaXMuZWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO2UuY2xhc3NOYW1lPVwiZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvblwiLGUuY2xhc3NOYW1lKz10aGlzLmlzUHJldmlvdXM/XCIgcHJldmlvdXNcIjpcIiBuZXh0XCIsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJidXR0b25cIiksdGhpcy5kaXNhYmxlKCksZS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsdGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIik7dmFyIGk9dGhpcy5jcmVhdGVTVkcoKTtlLmFwcGVuZENoaWxkKGkpLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLnBhcmVudC5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlLmJpbmQodGhpcykpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5iaW5kVGFwKHRoaXMuZWxlbWVudCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpfSxzLnByb3RvdHlwZS5jcmVhdGVTVkc9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInN2Z1wiKTt0LnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIixcIjAgMCAxMDAgMTAwXCIpO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwicGF0aFwiKSxpPW8odGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlKTtyZXR1cm4gZS5zZXRBdHRyaWJ1dGUoXCJkXCIsaSksZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLFwiYXJyb3dcIiksdGhpcy5pc0xlZnR8fGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsXCJ0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSgxODApIFwiKSx0LmFwcGVuZENoaWxkKGUpLHR9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0VuYWJsZWQpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIHQ9dGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnBhcmVudFt0XSgpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9bi5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5vbmNsaWNrPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDt0JiZ0PT10aGlzLmVsZW1lbnQmJnRoaXMub25UYXAoKX0scy5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWR8fCh0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITEsdGhpcy5pc0VuYWJsZWQ9ITApfSxzLnByb3RvdHlwZS5kaXNhYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQmJih0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITAsdGhpcy5pc0VuYWJsZWQ9ITEpfSxzLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXM7aWYodGhpcy5wYXJlbnQub3B0aW9ucy53cmFwQXJvdW5kJiZ0Lmxlbmd0aD4xKXJldHVybiB2b2lkIHRoaXMuZW5hYmxlKCk7dmFyIGU9dC5sZW5ndGg/dC5sZW5ndGgtMTowLGk9dGhpcy5pc1ByZXZpb3VzPzA6ZSxuPXRoaXMucGFyZW50LnNlbGVjdGVkSW5kZXg9PWk/XCJkaXNhYmxlXCI6XCJlbmFibGVcIjt0aGlzW25dKCl9LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sbi5leHRlbmQoZS5kZWZhdWx0cyx7cHJldk5leHRCdXR0b25zOiEwLGFycm93U2hhcGU6e3gwOjEwLHgxOjYwLHkxOjUwLHgyOjcwLHkyOjQwLHgzOjMwfX0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVByZXZOZXh0QnV0dG9uc1wiKTt2YXIgYT1lLnByb3RvdHlwZTtyZXR1cm4gYS5fY3JlYXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnByZXZOZXh0QnV0dG9ucyYmKHRoaXMucHJldkJ1dHRvbj1uZXcgcygoLTEpLHRoaXMpLHRoaXMubmV4dEJ1dHRvbj1uZXcgcygxLHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpKX0sYS5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sYS5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMub2ZmKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGUuUHJldk5leHRCdXR0b249cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGFnZS1kb3RzXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHModCl7dGhpcy5wYXJlbnQ9dCx0aGlzLl9jcmVhdGUoKX1zLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5ob2xkZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpLHRoaXMuaG9sZGVyLmNsYXNzTmFtZT1cImZsaWNraXR5LXBhZ2UtZG90c1wiLHRoaXMuZG90cz1bXSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnNldERvdHMoKSx0aGlzLmJpbmRUYXAodGhpcy5ob2xkZXIpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5ob2xkZXIpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmhvbGRlciksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpfSxzLnByb3RvdHlwZS5zZXREb3RzPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzLmxlbmd0aC10aGlzLmRvdHMubGVuZ3RoO3Q+MD90aGlzLmFkZERvdHModCk6dDwwJiZ0aGlzLnJlbW92ZURvdHMoLXQpfSxzLnByb3RvdHlwZS5hZGREb3RzPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksaT1bXTt0Oyl7dmFyIG49ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO24uY2xhc3NOYW1lPVwiZG90XCIsZS5hcHBlbmRDaGlsZChuKSxpLnB1c2gobiksdC0tfXRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKGUpLHRoaXMuZG90cz10aGlzLmRvdHMuY29uY2F0KGkpfSxzLnByb3RvdHlwZS5yZW1vdmVEb3RzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZG90cy5zcGxpY2UodGhpcy5kb3RzLmxlbmd0aC10LHQpO2UuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzLmhvbGRlci5yZW1vdmVDaGlsZCh0KX0sdGhpcyl9LHMucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZERvdCYmKHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90XCIpLHRoaXMuZG90cy5sZW5ndGgmJih0aGlzLnNlbGVjdGVkRG90PXRoaXMuZG90c1t0aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4XSx0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdCBpcy1zZWxlY3RlZFwiKX0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24odCl7dmFyIGU9dC50YXJnZXQ7aWYoXCJMSVwiPT1lLm5vZGVOYW1lKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciBpPXRoaXMuZG90cy5pbmRleE9mKGUpO3RoaXMucGFyZW50LnNlbGVjdChpKX19LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLG4uZXh0ZW5kKGUuZGVmYXVsdHMse3BhZ2VEb3RzOiEwfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGFnZURvdHNcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhZ2VEb3RzJiYodGhpcy5wYWdlRG90cz1uZXcgcyh0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGFnZURvdHMpLHRoaXMub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMpLHRoaXMub24oXCJjZWxsQ2hhbmdlXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcInJlc2l6ZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGFnZURvdHMpKX0sby5hY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5hY3RpdmF0ZSgpfSxvLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnVwZGF0ZVNlbGVjdGVkKCl9LG8udXBkYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnNldERvdHMoKX0sby5kZWFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wbGF5ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2ZsaWNraXR5XCJdLGZ1bmN0aW9uKHQsaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSk6ZSh0LkV2RW1pdHRlcix0LmZpenp5VUlVdGlscyx0LkZsaWNraXR5KX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3RoaXMucGFyZW50PXQsdGhpcy5zdGF0ZT1cInN0b3BwZWRcIixvJiYodGhpcy5vblZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlDaGFuZ2UoKX0uYmluZCh0aGlzKSx0aGlzLm9uVmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlQbGF5KCl9LmJpbmQodGhpcykpfXZhciBzLG87XCJoaWRkZW5cImluIGRvY3VtZW50PyhzPVwiaGlkZGVuXCIsbz1cInZpc2liaWxpdHljaGFuZ2VcIik6XCJ3ZWJraXRIaWRkZW5cImluIGRvY3VtZW50JiYocz1cIndlYmtpdEhpZGRlblwiLG89XCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCIpLG4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodC5wcm90b3R5cGUpLG4ucHJvdG90eXBlLnBsYXk9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIiE9dGhpcy5zdGF0ZSl7dmFyIHQ9ZG9jdW1lbnRbc107aWYobyYmdClyZXR1cm4gdm9pZCBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KTt0aGlzLnN0YXRlPVwicGxheWluZ1wiLG8mJmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSksdGhpcy50aWNrKCl9fSxuLnByb3RvdHlwZS50aWNrPWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUpe3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMuYXV0b1BsYXk7dD1cIm51bWJlclwiPT10eXBlb2YgdD90OjNlMzt2YXIgZT10aGlzO3RoaXMuY2xlYXIoKSx0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe2UucGFyZW50Lm5leHQoITApLGUudGljaygpfSx0KX19LG4ucHJvdG90eXBlLnN0b3A9ZnVuY3Rpb24oKXt0aGlzLnN0YXRlPVwic3RvcHBlZFwiLHRoaXMuY2xlYXIoKSxvJiZkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpfSxuLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpfSxuLnByb3RvdHlwZS5wYXVzZT1mdW5jdGlvbigpe1wicGxheWluZ1wiPT10aGlzLnN0YXRlJiYodGhpcy5zdGF0ZT1cInBhdXNlZFwiLHRoaXMuY2xlYXIoKSl9LG4ucHJvdG90eXBlLnVucGF1c2U9ZnVuY3Rpb24oKXtcInBhdXNlZFwiPT10aGlzLnN0YXRlJiZ0aGlzLnBsYXkoKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50W3NdO3RoaXNbdD9cInBhdXNlXCI6XCJ1bnBhdXNlXCJdKCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy5wbGF5KCksZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSl9LGUuZXh0ZW5kKGkuZGVmYXVsdHMse3BhdXNlQXV0b1BsYXlPbkhvdmVyOiEwfSksaS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGxheWVyXCIpO3ZhciByPWkucHJvdG90eXBlO3JldHVybiByLl9jcmVhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllcj1uZXcgbih0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGxheWVyKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQbGF5ZXIpfSxyLmFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmF1dG9QbGF5JiYodGhpcy5wbGF5ZXIucGxheSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpKX0sci5wbGF5UGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGxheSgpfSxyLnN0b3BQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCl9LHIucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wYXVzZSgpfSxyLnVucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCl9LHIuZGVhY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKX0sci5vbm1vdXNlZW50ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGF1c2VBdXRvUGxheU9uSG92ZXImJih0aGlzLnBsYXllci5wYXVzZSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpKX0sci5vbm1vdXNlbGVhdmU9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcyl9LGkuUGxheWVyPW4saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FkZC1yZW1vdmUtY2VsbFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7ZS5hcHBlbmRDaGlsZCh0LmVsZW1lbnQpfSksZX12YXIgcz1lLnByb3RvdHlwZTtyZXR1cm4gcy5pbnNlcnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9tYWtlQ2VsbHModCk7aWYoaSYmaS5sZW5ndGgpe3ZhciBzPXRoaXMuY2VsbHMubGVuZ3RoO2U9dm9pZCAwPT09ZT9zOmU7dmFyIG89bihpKSxyPWU9PXM7aWYocil0aGlzLnNsaWRlci5hcHBlbmRDaGlsZChvKTtlbHNle3ZhciBhPXRoaXMuY2VsbHNbZV0uZWxlbWVudDt0aGlzLnNsaWRlci5pbnNlcnRCZWZvcmUobyxhKX1pZigwPT09ZSl0aGlzLmNlbGxzPWkuY29uY2F0KHRoaXMuY2VsbHMpO2Vsc2UgaWYocil0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpO2Vsc2V7dmFyIGw9dGhpcy5jZWxscy5zcGxpY2UoZSxzLWUpO3RoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSkuY29uY2F0KGwpfXRoaXMuX3NpemVDZWxscyhpKTt2YXIgaD1lPnRoaXMuc2VsZWN0ZWRJbmRleD8wOmkubGVuZ3RoO3RoaXMuX2NlbGxBZGRlZFJlbW92ZWQoZSxoKX19LHMuYXBwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsdGhpcy5jZWxscy5sZW5ndGgpfSxzLnByZXBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCwwKX0scy5yZW1vdmU9ZnVuY3Rpb24odCl7dmFyIGUsbixzPXRoaXMuZ2V0Q2VsbHModCksbz0wLHI9cy5sZW5ndGg7Zm9yKGU9MDtlPHI7ZSsrKXtuPXNbZV07dmFyIGE9dGhpcy5jZWxscy5pbmRleE9mKG4pPHRoaXMuc2VsZWN0ZWRJbmRleDtvLT1hPzE6MH1mb3IoZT0wO2U8cjtlKyspbj1zW2VdLG4ucmVtb3ZlKCksaS5yZW1vdmVGcm9tKHRoaXMuY2VsbHMsbik7cy5sZW5ndGgmJnRoaXMuX2NlbGxBZGRlZFJlbW92ZWQoMCxvKX0scy5fY2VsbEFkZGVkUmVtb3ZlZD1mdW5jdGlvbih0LGUpe2U9ZXx8MCx0aGlzLnNlbGVjdGVkSW5kZXgrPWUsdGhpcy5zZWxlY3RlZEluZGV4PU1hdGgubWF4KDAsTWF0aC5taW4odGhpcy5zbGlkZXMubGVuZ3RoLTEsdGhpcy5zZWxlY3RlZEluZGV4KSksdGhpcy5jZWxsQ2hhbmdlKHQsITApLHRoaXMuZW1pdEV2ZW50KFwiY2VsbEFkZGVkUmVtb3ZlZFwiLFt0LGVdKX0scy5jZWxsU2l6ZUNoYW5nZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7aWYoZSl7ZS5nZXRTaXplKCk7dmFyIGk9dGhpcy5jZWxscy5pbmRleE9mKGUpO3RoaXMuY2VsbENoYW5nZShpKX19LHMuY2VsbENoYW5nZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVhYmxlV2lkdGg7aWYodGhpcy5fcG9zaXRpb25DZWxscyh0KSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcImNlbGxDaGFuZ2VcIixbdF0pLHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsKXt2YXIgbj1pLXRoaXMuc2xpZGVhYmxlV2lkdGg7dGhpcy54Kz1uKnRoaXMuY2VsbEFsaWduLHRoaXMucG9zaXRpb25TbGlkZXIoKX1lbHNlIGUmJnRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCksdGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2xhenlsb2FkXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtpZihcIklNR1wiPT10Lm5vZGVOYW1lJiZ0LmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIikpcmV0dXJuW3RdO3ZhciBlPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkXVwiKTtyZXR1cm4gaS5tYWtlQXJyYXkoZSl9ZnVuY3Rpb24gcyh0LGUpe3RoaXMuaW1nPXQsdGhpcy5mbGlja2l0eT1lLHRoaXMubG9hZCgpfWUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUxhenlsb2FkXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVMYXp5bG9hZD1mdW5jdGlvbigpe3RoaXMub24oXCJzZWxlY3RcIix0aGlzLmxhenlMb2FkKX0sby5sYXp5TG9hZD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5sYXp5TG9hZDtpZih0KXt2YXIgZT1cIm51bWJlclwiPT10eXBlb2YgdD90OjAsaT10aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKGUpLG89W107aS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBlPW4odCk7bz1vLmNvbmNhdChlKX0pLG8uZm9yRWFjaChmdW5jdGlvbih0KXtuZXcgcyh0LHRoaXMpfSx0aGlzKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PWkuaGFuZGxlRXZlbnQscy5wcm90b3R5cGUubG9hZD1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMuaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIiksdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKX0scy5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenlsb2FkZWRcIil9LHMucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWVycm9yXCIpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbih0LGUpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyk7dmFyIGk9dGhpcy5mbGlja2l0eS5nZXRQYXJlbnRDZWxsKHRoaXMuaW1nKSxuPWkmJmkuZWxlbWVudDt0aGlzLmZsaWNraXR5LmNlbGxTaXplQ2hhbmdlKG4pLHRoaXMuaW1nLmNsYXNzTGlzdC5hZGQoZSksdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KFwibGF6eUxvYWRcIix0LG4pfSxlLkxhenlMb2FkZXI9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvaW5kZXhcIixbXCIuL2ZsaWNraXR5XCIsXCIuL2RyYWdcIixcIi4vcHJldi1uZXh0LWJ1dHRvblwiLFwiLi9wYWdlLWRvdHNcIixcIi4vcGxheWVyXCIsXCIuL2FkZC1yZW1vdmUtY2VsbFwiLFwiLi9sYXp5bG9hZFwiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcIi4vZHJhZ1wiKSxyZXF1aXJlKFwiLi9wcmV2LW5leHQtYnV0dG9uXCIpLHJlcXVpcmUoXCIuL3BhZ2UtZG90c1wiKSxyZXF1aXJlKFwiLi9wbGF5ZXJcIikscmVxdWlyZShcIi4vYWRkLXJlbW92ZS1jZWxsXCIpLHJlcXVpcmUoXCIuL2xhenlsb2FkXCIpKSl9KHdpbmRvdyxmdW5jdGlvbih0KXtyZXR1cm4gdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5LWFzLW5hdi1mb3IvYXMtbmF2LWZvclwiLFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUsaSl7cmV0dXJuKGUtdCkqaSt0fXQuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUFzTmF2Rm9yXCIpO3ZhciBuPXQucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlc3Ryb3lcIix0aGlzLmRlc3Ryb3lBc05hdkZvcik7dmFyIHQ9dGhpcy5vcHRpb25zLmFzTmF2Rm9yO2lmKHQpe3ZhciBlPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2Uuc2V0TmF2Q29tcGFuaW9uKHQpfSl9fSxuLnNldE5hdkNvbXBhbmlvbj1mdW5jdGlvbihpKXtpPWUuZ2V0UXVlcnlFbGVtZW50KGkpO3ZhciBuPXQuZGF0YShpKTtpZihuJiZuIT10aGlzKXt0aGlzLm5hdkNvbXBhbmlvbj1uO3ZhciBzPXRoaXM7dGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbigpe3MubmF2Q29tcGFuaW9uU2VsZWN0KCl9LG4ub24oXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9uKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLHRoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX19LG4ubmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKHQpe2lmKHRoaXMubmF2Q29tcGFuaW9uKXt2YXIgZT10aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzWzBdLG49dGhpcy5uYXZDb21wYW5pb24uY2VsbHMuaW5kZXhPZihlKSxzPW4rdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxscy5sZW5ndGgtMSxvPU1hdGguZmxvb3IoaShuLHMsdGhpcy5uYXZDb21wYW5pb24uY2VsbEFsaWduKSk7aWYodGhpcy5zZWxlY3RDZWxsKG8sITEsdCksdGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCksIShvPj10aGlzLmNlbGxzLmxlbmd0aCkpe3ZhciByPXRoaXMuY2VsbHMuc2xpY2UobixzKzEpO3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cz1yLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSksdGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwiYWRkXCIpfX19LG4uY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmNsYXNzTGlzdFt0XShcImlzLW5hdi1zZWxlY3RlZFwiKX0pfSxuLmFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9LG4ucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cz1mdW5jdGlvbigpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyYmKHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKSxkZWxldGUgdGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzKX0sbi5vbk5hdlN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSxpLG4pe1wibnVtYmVyXCI9PXR5cGVvZiBuJiZ0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RDZWxsKG4pfSxuLmRlYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpfSxuLmRlc3Ryb3lBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uJiYodGhpcy5uYXZDb21wYW5pb24ub2ZmKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vZmYoXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksZGVsZXRlIHRoaXMubmF2Q29tcGFuaW9uKX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5pbWFnZXNMb2FkZWQ9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYoXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX1mdW5jdGlvbiBzKHQsZSxvKXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHM/KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHQpKSx0aGlzLmVsZW1lbnRzPW4odCksdGhpcy5vcHRpb25zPWkoe30sdGhpcy5vcHRpb25zKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlP289ZTppKHRoaXMub3B0aW9ucyxlKSxvJiZ0aGlzLm9uKFwiYWx3YXlzXCIsbyksdGhpcy5nZXRJbWFnZXMoKSxhJiYodGhpcy5qcURlZmVycmVkPW5ldyBhLkRlZmVycmVkKSx2b2lkIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGlzLmNoZWNrKCl9LmJpbmQodGhpcykpKTpuZXcgcyh0LGUsbyl9ZnVuY3Rpb24gbyh0KXt0aGlzLmltZz10fWZ1bmN0aW9uIHIodCxlKXt0aGlzLnVybD10LHRoaXMuZWxlbWVudD1lLHRoaXMuaW1nPW5ldyBJbWFnZX12YXIgYT10LmpRdWVyeSxsPXQuY29uc29sZTtzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxzLnByb3RvdHlwZS5vcHRpb25zPXt9LHMucHJvdG90eXBlLmdldEltYWdlcz1mdW5jdGlvbigpe3RoaXMuaW1hZ2VzPVtdLHRoaXMuZWxlbWVudHMuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnRJbWFnZXMsdGhpcyl9LHMucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXM9ZnVuY3Rpb24odCl7XCJJTUdcIj09dC5ub2RlTmFtZSYmdGhpcy5hZGRJbWFnZSh0KSx0aGlzLm9wdGlvbnMuYmFja2dyb3VuZD09PSEwJiZ0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHQpO3ZhciBlPXQubm9kZVR5cGU7aWYoZSYmaFtlXSl7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1wiKSxuPTA7bjxpLmxlbmd0aDtuKyspe3ZhciBzPWlbbl07dGhpcy5hZGRJbWFnZShzKX1pZihcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQpe3ZhciBvPXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCk7Zm9yKG49MDtuPG8ubGVuZ3RoO24rKyl7dmFyIHI9b1tuXTt0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHIpfX19fTt2YXIgaD17MTohMCw5OiEwLDExOiEwfTtyZXR1cm4gcy5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXM9ZnVuY3Rpb24odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtpZihlKWZvcih2YXIgaT0vdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSk7bnVsbCE9PW47KXt2YXIgcz1uJiZuWzJdO3MmJnRoaXMuYWRkQmFja2dyb3VuZChzLHQpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKX19LHMucHJvdG90eXBlLmFkZEltYWdlPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBvKHQpO3RoaXMuaW1hZ2VzLnB1c2goZSl9LHMucHJvdG90eXBlLmFkZEJhY2tncm91bmQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcih0LGUpO3RoaXMuaW1hZ2VzLnB1c2goaSl9LHMucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGksbil7c2V0VGltZW91dChmdW5jdGlvbigpe2UucHJvZ3Jlc3ModCxpLG4pfSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5wcm9ncmVzc2VkQ291bnQ9MCx0aGlzLmhhc0FueUJyb2tlbj0hMSx0aGlzLmltYWdlcy5sZW5ndGg/dm9pZCB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2Uub25jZShcInByb2dyZXNzXCIsdCksZS5jaGVjaygpfSk6dm9pZCB0aGlzLmNvbXBsZXRlKCl9LHMucHJvdG90eXBlLnByb2dyZXNzPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLnByb2dyZXNzZWRDb3VudCsrLHRoaXMuaGFzQW55QnJva2VuPXRoaXMuaGFzQW55QnJva2VufHwhdC5pc0xvYWRlZCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdCxlXSksdGhpcy5qcURlZmVycmVkJiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5JiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5KHRoaXMsdCksdGhpcy5wcm9ncmVzc2VkQ291bnQ9PXRoaXMuaW1hZ2VzLmxlbmd0aCYmdGhpcy5jb21wbGV0ZSgpLHRoaXMub3B0aW9ucy5kZWJ1ZyYmbCYmbC5sb2coXCJwcm9ncmVzczogXCIraSx0LGUpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaGFzQW55QnJva2VuP1wiZmFpbFwiOlwiZG9uZVwiO2lmKHRoaXMuaXNDb21wbGV0ZT0hMCx0aGlzLmVtaXRFdmVudCh0LFt0aGlzXSksdGhpcy5lbWl0RXZlbnQoXCJhbHdheXNcIixbdGhpc10pLHRoaXMuanFEZWZlcnJlZCl7dmFyIGU9dGhpcy5oYXNBbnlCcm9rZW4/XCJyZWplY3RcIjpcInJlc29sdmVcIjt0aGlzLmpxRGVmZXJyZWRbZV0odGhpcyl9fSxvLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxvLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7cmV0dXJuIHQ/dm9pZCB0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKToodGhpcy5wcm94eUltYWdlPW5ldyBJbWFnZSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx2b2lkKHRoaXMucHJveHlJbWFnZS5zcmM9dGhpcy5pbWcuc3JjKSl9LG8ucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmltZy5jb21wbGV0ZSYmdm9pZCAwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRofSxvLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmltZyxlXSl9LG8ucHJvdG90eXBlLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0sby5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCEwLFwib25sb2FkXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITEsXCJvbmVycm9yXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKG8ucHJvdG90eXBlKSxyLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMudXJsO3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7dCYmKHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpLHRoaXMudW5iaW5kRXZlbnRzKCkpfSxyLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmVsZW1lbnQsZV0pfSxzLm1ha2VKUXVlcnlQbHVnaW49ZnVuY3Rpb24oZSl7ZT1lfHx0LmpRdWVyeSxlJiYoYT1lLGEuZm4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHModGhpcyx0LGUpO3JldHVybiBpLmpxRGVmZXJyZWQucHJvbWlzZShhKHRoaXMpKX0pfSxzLm1ha2VKUXVlcnlQbHVnaW4oKSxzfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiaW1hZ2VzbG9hZGVkXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuaW1hZ2VzTG9hZGVkKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVJbWFnZXNMb2FkZWRcIik7dmFyIG49ZS5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUltYWdlc0xvYWRlZD1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuaW1hZ2VzTG9hZGVkKX0sbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSl7dmFyIG49ZS5nZXRQYXJlbnRDZWxsKGkuaW1nKTtlLmNlbGxTaXplQ2hhbmdlKG4mJm4uZWxlbWVudCksZS5vcHRpb25zLmZyZWVTY3JvbGx8fGUucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9aWYodGhpcy5vcHRpb25zLmltYWdlc0xvYWRlZCl7dmFyIGU9dGhpcztpKHRoaXMuc2xpZGVyKS5vbihcInByb2dyZXNzXCIsdCl9fSxlfSk7IiwiLyoqXG4gKiBGbGlja2l0eSBiYWNrZ3JvdW5kIGxhenlsb2FkIHYxLjAuMFxuICogbGF6eWxvYWQgYmFja2dyb3VuZCBjZWxsIGltYWdlc1xuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZmxpY2tpdHkvanMvaW5kZXgnLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHJlcXVpcmUoJ2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5LCB1dGlscyApIHtcbi8qanNoaW50IHN0cmljdDogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVCZ0xhenlMb2FkJyk7XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZUJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ3NlbGVjdCcsIHRoaXMuYmdMYXp5TG9hZCApO1xufTtcblxucHJvdG8uYmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGF6eUxvYWQgPSB0aGlzLm9wdGlvbnMuYmdMYXp5TG9hZDtcbiAgaWYgKCAhbGF6eUxvYWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICB2YXIgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKCBhZGpDb3VudCApO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBjZWxsRWxlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGNlbGxFbGVtID0gY2VsbEVsZW1zW2ldO1xuICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNlbGxFbGVtICk7XG4gICAgLy8gc2VsZWN0IGxhenkgZWxlbXMgaW4gY2VsbFxuICAgIHZhciBjaGlsZHJlbiA9IGNlbGxFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkXScpO1xuICAgIGZvciAoIHZhciBqPTA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcbiAgICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNoaWxkcmVuW2pdICk7XG4gICAgfVxuICB9XG59O1xuXG5wcm90by5iZ0xhenlMb2FkRWxlbSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG4gIGlmICggYXR0ciApIHtcbiAgICBuZXcgQmdMYXp5TG9hZGVyKCBlbGVtLCBhdHRyLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIExhenlCR0xvYWRlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGNsYXNzIHRvIGhhbmRsZSBsb2FkaW5nIGltYWdlc1xuICovXG5mdW5jdGlvbiBCZ0xhenlMb2FkZXIoIGVsZW0sIHVybCwgZmxpY2tpdHkgKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLmZsaWNraXR5ID0gZmxpY2tpdHk7XG4gIHRoaXMubG9hZCgpO1xufVxuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gdXRpbHMuaGFuZGxlRXZlbnQ7XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBsb2FkIGltYWdlXG4gIHRoaXMuaW1nLnNyYyA9IHRoaXMudXJsO1xuICAvLyByZW1vdmUgYXR0clxuICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIHRoaXMudXJsICsgJyknO1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenlsb2FkZWQnICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWVycm9yJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCBldmVudCwgY2xhc3NOYW1lICkge1xuICAvLyB1bmJpbmQgZXZlbnRzXG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG5cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuICB0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoICdiZ0xhenlMb2FkJywgZXZlbnQsIHRoaXMuZWxlbWVudCApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LkJnTGF6eUxvYWRlciA9IEJnTGF6eUxvYWRlcjtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvKipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gMS4yLjI3XG4qICAoYykgMjAxNSBUb21hcyBLaXJkYVxuKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXG4qICBGb3IgZGV0YWlscywgc2VlIHRoZSB3ZWIgc2l0ZTogaHR0cHM6Ly9naXRodWIuY29tL2RldmJyaWRnZS9qUXVlcnktQXV0b2NvbXBsZXRlXG4qL1xuXG4vKmpzbGludCAgYnJvd3NlcjogdHJ1ZSwgd2hpdGU6IHRydWUsIHNpbmdsZTogdHJ1ZSwgdGhpczogdHJ1ZSwgbXVsdGl2YXI6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gJC5ub29wLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCBvcHRpb25zLndpZHRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3Zlci5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNpdGVTZWFyY2hEaXYgPSAkKCcuc2l0ZS1zZWFyY2gnKTtcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhhdC5vcHRpb25zLm9yaWVudGF0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXRlU2VhcmNoRGl2Lm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gc2l0ZVNlYXJjaERpdi5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICAgICAgICAgIHRvcE92ZXJmbG93ID0gLXNjcm9sbFRvcCArIG9mZnNldC50b3AgLSBjb250YWluZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IChNYXRoLm1heCh0b3BPdmVyZmxvdywgYm90dG9tT3ZlcmZsb3cpID09PSB0b3BPdmVyZmxvdykgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBwb3NpdGlvbmVkIHRvIGJvZHksXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAkY29udGFpbmVyLmNzcygnb3BhY2l0eScpLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sZWZ0IC09IHBhcmVudE9mZnNldERpZmYubGVmdDtcblxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCBvcGFjaXR5KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSBzaXRlU2VhcmNoRGl2Lm91dGVyV2lkdGgoKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIHJlc3RvcmUgdmFsdWUgd2hlbiBcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlc2VydmVJbnB1dCA9PT0gdHJ1ZSwgXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugd2UgZGlkIG5vdCBjaGFuZ2UgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNDdXJzb3JBdEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhhdC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAgICAgICAgIHJhbmdlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsTGVuZ3RoID09PSByYW5nZS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgaWYgKCF0aGF0LmRpc2FibGVkICYmICF0aGF0LnZpc2libGUgJiYgZS53aGljaCA9PT0ga2V5cy5ET1dOICYmIHRoYXQuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCAmJiB0aGF0LmlzQ3Vyc29yQXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy50YWJEaXNhYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVVcCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbmNlbCBldmVudCBpZiBmdW5jdGlvbiBkaWQgbm90IHJldHVybjpcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKSxcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3Rpb24gJiYgdGhhdC5jdXJyZW50VmFsdWUgIT09IHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBleGlzdGluZyBzdWdnZXN0aW9uIGZvciB0aGUgbWF0Y2ggYmVmb3JlIHByb2NlZWRpbmc6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IG9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nZXRTdWdnZXN0aW9ucyhxdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XG5cbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0ocGFydHNbcGFydHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zTG9jYWw6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgcXVlcnlMb3dlckNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxuICAgICAgICAgICAgICAgIGRhdGE7XG5cbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQuZ3JlcChvcHRpb25zLmxvb2t1cCwgZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XG5cbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1zW29wdGlvbnMucGFyYW1OYW1lXSA9IHE7XG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TZWFyY2hTdGFydC5jYWxsKHRoYXQuZWxlbWVudCwgb3B0aW9ucy5wYXJhbXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXNwb25zZS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoYXQuaXNCYWRRdWVyeShxKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG5cbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xuXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9ICQuYWpheChhamF4U2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtUmVzdWx0KGRhdGEsIHEpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkhpZGUuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyLCB0aGF0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgIXJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5iYWRRdWVyaWVzLnB1c2gob3JpZ2luYWxRdWVyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3VsdC5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjb250YWluZXIuZmluZCgnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ICE9PSAtMSAmJiBjaGlsZHJlbi5sZW5ndGggPiB0aGF0LnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwiXG4kKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbnZhciBiYXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XG52YXIgYmFzZUhyZWYgPSBudWxsO1xuXG5pZiAoYmFzZXMubGVuZ3RoID4gMCkge1xuICAgIGJhc2VIcmVmID0gYmFzZXNbMF0uaHJlZjtcbn1cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTGF6eSBMb2FkaW5nIEltYWdlczpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xudmFyIG15TGF6eUxvYWQgPSBuZXcgTGF6eUxvYWQoe1xuICAgIC8vIGV4YW1wbGUgb2Ygb3B0aW9ucyBvYmplY3QgLT4gc2VlIG9wdGlvbnMgc2VjdGlvblxuICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcIi5kcC1sYXp5XCJcbiAgICAvLyB0aHJvdHRsZTogMjAwLFxuICAgIC8vIGRhdGFfc3JjOiBcInNyY1wiLFxuICAgIC8vIGRhdGFfc3Jjc2V0OiBcInNyY3NldFwiLFxuICAgIC8vIGNhbGxiYWNrX3NldDogZnVuY3Rpb24oKSB7IC8qIC4uLiAqLyB9XG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBCaWcgQ2Fyb3VzZWwgKEhvbWUgUGFnZSk6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxudmFyICRjYXJvdXNlbCA9ICQoJy5jYXJvdXNlbCcpLmZsaWNraXR5KHtcblx0aW1hZ2VzTG9hZGVkOiB0cnVlLFxuXHRwZXJjZW50UG9zaXRpb246IGZhbHNlLFxuXHRzZWxlY3RlZEF0dHJhY3Rpb246IDAuMDE1LFxuXHRmcmljdGlvbjogMC4zLFxuXHRwcmV2TmV4dEJ1dHRvbnM6IGZhbHNlLFxuXHRkcmFnZ2FibGU6IHRydWUsXG5cdGF1dG9QbGF5OiB0cnVlLFxuXHRhdXRvUGxheTogODAwMCxcblx0cGF1c2VBdXRvUGxheU9uSG92ZXI6IGZhbHNlLFxuXHRiZ0xhenlMb2FkOiB0cnVlLFxufSk7XG5cbnZhciAkaW1ncyA9ICRjYXJvdXNlbC5maW5kKCcuY2Fyb3VzZWwtY2VsbCAuY2VsbC1iZycpO1xuLy8gZ2V0IHRyYW5zZm9ybSBwcm9wZXJ0eVxudmFyIGRvY1N0eWxlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO1xudmFyIHRyYW5zZm9ybVByb3AgPSB0eXBlb2YgZG9jU3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcbi8vIGdldCBGbGlja2l0eSBpbnN0YW5jZVxudmFyIGZsa3R5ID0gJGNhcm91c2VsLmRhdGEoJ2ZsaWNraXR5Jyk7XG5cbiRjYXJvdXNlbC5vbiggJ3Njcm9sbC5mbGlja2l0eScsIGZ1bmN0aW9uKCkge1xuICBmbGt0eS5zbGlkZXMuZm9yRWFjaCggZnVuY3Rpb24oIHNsaWRlLCBpICkge1xuICAgIHZhciBpbWcgPSAkaW1nc1tpXTtcbiAgICB2YXIgeCA9ICggc2xpZGUudGFyZ2V0ICsgZmxrdHkueCApICogLTEvMztcbiAgICBpbWcuc3R5bGVbIHRyYW5zZm9ybVByb3AgXSA9ICd0cmFuc2xhdGVYKCcgKyB4ICArICdweCknO1xuICB9KTtcbn0pO1xuXG4kKCcuY2Fyb3VzZWwtbmF2LWNlbGwnKS5jbGljayhmdW5jdGlvbigpIHtcblx0ZmxrdHkuc3RvcFBsYXllcigpO1xufSk7XG5cbnZhciAkZ2FsbGVyeSA9ICQoJy5jYXJvdXNlbCcpLmZsaWNraXR5KCk7XG5cbmZ1bmN0aW9uIG9uTG9hZGVkZGF0YSggZXZlbnQgKSB7XG5cdHZhciBjZWxsID0gJGdhbGxlcnkuZmxpY2tpdHkoICdnZXRQYXJlbnRDZWxsJywgZXZlbnQudGFyZ2V0ICk7XG5cdCRnYWxsZXJ5LmZsaWNraXR5KCAnY2VsbFNpemVDaGFuZ2UnLCBjZWxsICYmIGNlbGwuZWxlbWVudCApO1xufVxuXG4kZ2FsbGVyeS5maW5kKCd2aWRlbycpLmVhY2goIGZ1bmN0aW9uKCBpLCB2aWRlbyApIHtcblx0dmlkZW8ucGxheSgpO1xuXHQkKCB2aWRlbyApLm9uKCAnbG9hZGVkZGF0YScsIG9uTG9hZGVkZGF0YSApO1xufSk7XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFNsaWRlc2hvdyBibG9jayAoaW4gY29udGVudCk6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbnZhciAkc2xpZGVzaG93ID0gJCgnLnNsaWRlc2hvdycpLmZsaWNraXR5KHtcblx0Ly9hZGFwdGl2ZUhlaWdodDogdHJ1ZSxcblx0aW1hZ2VzTG9hZGVkOiB0cnVlLFxuXHRsYXp5TG9hZDogdHJ1ZVxufSk7XG5cbnZhciBzbGlkZXNob3dmbGsgPSAkc2xpZGVzaG93LmRhdGEoJ2ZsaWNraXR5Jyk7XG5cbiRzbGlkZXNob3cub24oICdzZWxlY3QuZmxpY2tpdHknLCBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coICdGbGlja2l0eSBzZWxlY3QgJyArIHNsaWRlc2hvd2Zsay5zZWxlY3RlZEluZGV4ICk7XG5cdC8vc2xpZGVzaG93ZmxrLnJlbG9hZENlbGxzKCk7XG5cbn0pXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gU3RhcnQgRm91bmRhdGlvbiBPcmJpdCBTbGlkZXI6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIHZhciBzbGlkZXJPcHRpb25zID0ge1xuLy8gXHRjb250YWluZXJDbGFzczogJ3NsaWRlcl9fc2xpZGVzJyxcbi8vIFx0c2xpZGVDbGFzczogJ3NsaWRlcl9fc2xpZGUnLFxuLy8gXHRuZXh0Q2xhc3M6ICdzbGlkZXJfX25hdi0tbmV4dCcsXG4vLyBcdHByZXZDbGFzczogJ3NsaWRlcl9fbmF2LS1wcmV2aW91cycsXG5cbi8vIH07XG5cblxuLy8gdmFyIHNsaWRlciA9IG5ldyBGb3VuZGF0aW9uLk9yYml0KCQoJy5zbGlkZXInKSwgc2xpZGVyT3B0aW9ucyk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9XcmFwIGV2ZXJ5IGlmcmFtZSBpbiBhIGZsZXggdmlkZW8gY2xhc3MgdG8gcHJldmVudCBsYXlvdXQgYnJlYWthZ2Vcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuJCgnaWZyYW1lJykuZWFjaChmdW5jdGlvbigpe1xuXHQkKHRoaXMpLndyYXAoIFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuJz48L2Rpdj5cIiApO1xuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL0Rpc3Rpbmd1aXNoIGRyb3Bkb3ducyBvbiBtb2JpbGUvZGVza3RvcDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4kKCcubmF2X19pdGVtLS1wYXJlbnQnKS5jbGljayhmdW5jdGlvbihldmVudCkge1xuICBpZiAod2hhdElucHV0LmFzaygpID09PSAndG91Y2gnKSB7XG4gICAgLy8gZG8gdG91Y2ggaW5wdXQgdGhpbmdzXG4gICAgaWYoISQodGhpcykuaGFzQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpKXtcblx0ICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICAkKCcubmF2X19pdGVtLS1wYXJlbnQnKS5yZW1vdmVDbGFzcygnbmF2X19pdGVtLS1pcy1ob3ZlcmVkJyk7XG5cdCAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKVxuICAgIH1cbiAgfSBlbHNlIGlmICh3aGF0SW5wdXQuYXNrKCkgPT09ICdtb3VzZScpIHtcbiAgICAvLyBkbyBtb3VzZSB0aGluZ3NcbiAgfVxufSk7XG5cbi8vSWYgYW55dGhpbmcgaW4gdGhlIG1haW4gY29udGVudCBjb250YWluZXIgaXMgY2xpY2tlZCwgcmVtb3ZlIGZhdXggaG92ZXIgY2xhc3MuXG4kKCcjbWFpbi1jb250ZW50X19jb250YWluZXInKS5jbGljayhmdW5jdGlvbigpe1xuXHQkKCcubmF2X19pdGVtJykucmVtb3ZlQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpO1xuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL1NpdGUgU2VhcmNoOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbmZ1bmN0aW9uIHRvZ2dsZVNlYXJjaENsYXNzZXMoKXtcblx0JChcImJvZHlcIikudG9nZ2xlQ2xhc3MoXCJib2R5LS1zZWFyY2gtYWN0aXZlXCIpO1xuXHQkKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLnRvZ2dsZUNsYXNzKFwic2l0ZS1zZWFyY2hfX2Zvcm0tLWlzLWluYWN0aXZlIHNpdGUtc2VhcmNoX19mb3JtLS1pcy1hY3RpdmVcIik7XG5cdCQoXCIjc2l0ZS1zZWFyY2hcIikudG9nZ2xlQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtaW5hY3RpdmUgc2l0ZS1zZWFyY2gtLWlzLWFjdGl2ZVwiKTtcblx0JChcIi5oZWFkZXJfX3NjcmVlblwiKS50b2dnbGVDbGFzcyhcImhlYWRlcl9fc2NyZWVuLS1ncmF5c2NhbGVcIik7XG5cdCQoXCIubWFpbi1jb250ZW50X19jb250YWluZXJcIikudG9nZ2xlQ2xhc3MoXCJtYWluLWNvbnRlbnRfX2NvbnRhaW5lci0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm5hdl9fd3JhcHBlclwiKS50b2dnbGVDbGFzcyhcIm5hdl9fd3JhcHBlci0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm5hdl9fbGluay0tc2VhcmNoXCIpLnRvZ2dsZUNsYXNzKFwibmF2X19saW5rLS1zZWFyY2gtaXMtYWN0aXZlXCIpO1xuXG5cdC8vSEFDSzogd2FpdCBmb3IgNW1zIGJlZm9yZSBjaGFuZ2luZyBmb2N1cy4gSSBkb24ndCB0aGluayBJIG5lZWQgdGhpcyBhbnltb3JlIGFjdHVhbGx5Li5cblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQgICQoXCIubmF2X193cmFwcGVyXCIpLnRvZ2dsZUNsYXNzKFwibmF2X193cmFwcGVyLS1zZWFyY2gtaXMtYWN0aXZlXCIpO1xuXHR9LCA1KTtcblxuXHQkKFwiLm5hdlwiKS50b2dnbGVDbGFzcyhcIm5hdi0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblxufVxuXG4kKFwiLm5hdl9fbGluay0tc2VhcmNoXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gIFx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuICBcdGlmKCQoXCIjbW9iaWxlLW5hdl9fd3JhcHBlclwiKS5oYXNDbGFzcyhcIm1vYmlsZS1uYXZfX3dyYXBwZXItLW1vYmlsZS1tZW51LWlzLWFjdGl2ZVwiKSl7XG4gIFx0XHR0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcygpO1xuICBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbygnI2hlYWRlcicpLmFkZENsYXNzKCdzaXRlLXNlYXJjaC0tbW9iaWxlJyk7XG4gIFx0fVxuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l0ZS1zZWFyY2hfX2lucHV0XCIpLmZvY3VzKCk7XG59KTtcblxuJChcIi5uYXZfX2xpbmstLXNlYXJjaC1jYW5jZWxcIikuY2xpY2soZnVuY3Rpb24oKXtcblx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5ibHVyKCk7XG59KTtcblxuLy9XaGVuIHNlYXJjaCBmb3JtIGlzIG91dCBvZiBmb2N1cywgZGVhY3RpdmF0ZSBpdC5cbiQoXCIjc2l0ZS1zZWFyY2hfX2Zvcm1cIikuZm9jdXNvdXQoZnVuY3Rpb24oKXtcbiAgXHRpZigkKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLmhhc0NsYXNzKFwic2l0ZS1zZWFyY2hfX2Zvcm0tLWlzLWFjdGl2ZVwiKSl7XG4gIFx0XHQvL0NvbW1lbnQgb3V0IHRoZSBmb2xsb3dpbmcgbGluZSBpZiB5b3UgbmVlZCB0byB1c2UgV2ViS2l0L0JsaW5rIGluc3BlY3RvciB0b29sIG9uIHRoZSBzZWFyY2ggKHNvIGl0IGRvZXNuJ3QgbG9zZSBmb2N1cyk6XG4gIFx0XHQvL3RvZ2dsZVNlYXJjaENsYXNzZXMoKTtcbiAgXHR9XG59KTtcblxuJCgnaW5wdXRbbmFtZT1cIlNlYXJjaFwiXScpLmF1dG9jb21wbGV0ZSh7XG4gICAgc2VydmljZVVybDogYmFzZUhyZWYrJy9ob21lL2F1dG9Db21wbGV0ZScsXG4gICAgZGVmZXJSZXF1ZXN0Qnk6IDEwMCxcbiAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiBmYWxzZSxcbiAgICBtaW5DaGFyczogMixcbiAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG4gICAgdHlwZTogJ3Bvc3QnLFxuICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAkKCcjc2l0ZS1zZWFyY2hfX2Zvcm0nKS5zdWJtaXQoKTtcbiAgICB9XG59KTtcblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vTW9iaWxlIFNlYXJjaDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5pZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ21lZGl1bScpKSB7XG4gIC8vIFRydWUgaWYgbWVkaXVtIG9yIGxhcmdlXG4gIC8vIEZhbHNlIGlmIHNtYWxsXG4gICQoXCIjc2l0ZS1zZWFyY2hcIikuYWRkQ2xhc3MoXCJzaXRlLXNlYXJjaC0tZGVza3RvcFwiKTtcbn1lbHNle1xuXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcbn1cblxuXG4kKFwiLm5hdl9fdG9nZ2xlLS1zZWFyY2hcIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgXHR0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cblxuXG4gIFx0Ly9hcHBlbmQgb3VyIHNpdGUgc2VhcmNoIGRpdiB0byB0aGUgaGVhZGVyLlxuICBcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKS5hZGRDbGFzcygnc2l0ZS1zZWFyY2gtLW1vYmlsZScpO1xuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l0ZS1zZWFyY2hfX2lucHV0XCIpLmZvY3VzKCk7XG59KTtcblxuLy9JZiB3ZSdyZSByZXNpemluZyBmcm9tIG1vYmlsZSB0byBhbnl0aGluZyBlbHNlLCB0b2dnbGUgdGhlIG1vYmlsZSBzZWFyY2ggaWYgaXQncyBhY3RpdmUuXG4kKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKGV2ZW50LCBuZXdTaXplLCBvbGRTaXplKSB7XG5cblx0IGlmIChuZXdTaXplID09IFwibWVkaXVtXCIpIHtcblx0IFx0Ly9hbGVydCgnaGV5Jyk7XG5cdCBcdCQoXCIjc2l0ZS1zZWFyY2hcIikucmVtb3ZlQ2xhc3MoXCJzaXRlLXNlYXJjaC0tbW9iaWxlXCIpO1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLWRlc2t0b3BcIik7XG5cblx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKFwiI25hdlwiKTtcblxuXG5cdCBcdGlmKCQoXCIjc2l0ZS1zZWFyY2hcIikuaGFzQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtYWN0aXZlXCIpKXtcblx0IFx0XHQvLyB0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cdCBcdH1cblx0IH1lbHNlIGlmKG5ld1NpemUgPT0gXCJtb2JpbGVcIil7XG5cdCBcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKTtcbiBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5yZW1vdmVDbGFzcyhcInNpdGUtc2VhcmNoLS1kZXNrdG9wXCIpO1xuIFx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcblx0IFx0aWYoJChcIiNzaXRlLXNlYXJjaFwiKS5oYXNDbGFzcyhcInNpdGUtc2VhcmNoLS1pcy1hY3RpdmVcIikpe1xuXHQgXHRcdC8vIHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblx0IFx0fVxuXHQgfVxuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL01vYmlsZSBOYXY6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLyogbmV3IHN0dWZmIGFkZGVkIG15IEJyYW5kb24gLSBsYXp5IGNvZGluZyAqL1xuJCgnLm5hdl9fdG9nZ2xlLS1tZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0JCgnLm5hdl9fbWVudS1pY29uJykudG9nZ2xlQ2xhc3MoJ2lzLWNsaWNrZWQnKTtcblx0JChcIiNuYXZfX21lbnUtaWNvblwiKS50b2dnbGVDbGFzcyhcIm5hdl9fbWVudS1pY29uLS1tZW51LWlzLWFjdGl2ZVwiKTtcblx0JCh0aGlzKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnb3BlbicpO1xufSk7XG5cbiQoJy5zZWNvbmQtbGV2ZWwtLW9wZW4nKS5jbGljayhmdW5jdGlvbigpe1xuXHQkKHRoaXMpLnBhcmVudCgpLnRvZ2dsZUNsYXNzKCduYXZfX2l0ZW0tLW9wZW5lZCcpO1xuXHRpZiAoJCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nKSA9PSAndHJ1ZScpIHtcblx0XHQkKHRoaXMpLm5leHQoKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG5cdH0gZWxzZSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG5cdH1cblxuXHRpZiAoJCh0aGlzKS5hdHRyKCdhcmlhLWV4cGFuZGVkJykgPT0gJ2ZhbHNlJykge1xuXHRcdCQodGhpcykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJylcblx0fSBlbHNlIHtcblx0XHQkKHRoaXMpLm5leHQoKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcblx0fVxufSk7XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBCYWNrZ3JvdW5kIFZpZGVvXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiQoJy5iYWNrZ3JvdW5kdmlkZW9fX2xpbmsnKS5jbGljayhmdW5jdGlvbihlKXtcblx0dmFyIHRoYXQgPSAkKHRoaXMpO1xuXHR2YXIgdmlkZW8gPSB0aGF0LmRhdGEoJ3ZpZGVvJyk7XG5cdHZhciB3aWR0aCA9ICQoJ2ltZycsIHRoYXQpLndpZHRoKCk7XG5cdHZhciBoZWlnaHQgPSAkKCdpbWcnLCB0aGF0KS5oZWlnaHQoKTtcblx0dGhhdC5wYXJlbnQoKS5hZGRDbGFzcygnb24nKTtcblx0dGhhdC5wYXJlbnQoKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZmxleC12aWRlbyB3aWRlc2NyZWVuXCI+PGlmcmFtZSBzcmM9XCJodHRwOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycgKyB2aWRlbyArICc/cmVsPTAmYXV0b3BsYXk9MVwiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2Via2l0QWxsb3dGdWxsU2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd0Z1bGxTY3JlZW4+PC9pZnJhbWU+PC9kaXY+Jyk7XG5cdHRoYXQuaGlkZSgpO1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9BdXRvbWF0aWMgZnVsbCBoZWlnaHQgc2lsZGVyLCBub3Qgd29ya2luZyB5ZXQuLlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8vIGZ1bmN0aW9uIHNldERpbWVuc2lvbnMoKXtcbi8vICAgIHZhciB3aW5kb3dzSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4vLyAgICAkKCcub3JiaXQtY29udGFpbmVyJykuY3NzKCdoZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyAgIC8vICQoJy5vcmJpdC1jb250YWluZXInKS5jc3MoJ21heC1oZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG5cbi8vICAgICQoJy5vcmJpdC1zbGlkZScpLmNzcygnaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuLy8gICAgJCgnLm9yYml0LXNsaWRlJykuY3NzKCdtYXgtaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuLy8gfVxuXG4vLyAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuLy8gICAgIHNldERpbWVuc2lvbnMoKTtcbi8vIH0pO1xuXG4vLyBzZXREaW1lbnNpb25zKCk7Il19
