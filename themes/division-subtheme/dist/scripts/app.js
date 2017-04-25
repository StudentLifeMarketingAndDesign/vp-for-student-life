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

var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }return target;
};

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(undefined, function () {
    'use strict';

    var defaultSettings = {
        elements_selector: "img",
        container: window,
        threshold: 300,
        throttle: 150,
        data_src: "original",
        data_srcset: "original-set",
        class_loading: "loading",
        class_loaded: "loaded",
        class_error: "error",
        class_initial: "initial",
        skip_invisible: true,
        callback_load: null,
        callback_error: null,
        callback_set: null,
        callback_processed: null
    };

    var isBot = !("onscroll" in window) || /glebot/.test(navigator.userAgent);

    var callCallback = function callCallback(callback, argument) {
        if (callback) {
            callback(argument);
        }
    };

    var getTopOffset = function getTopOffset(element) {
        return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
    };

    var isBelowViewport = function isBelowViewport(element, container, threshold) {
        var fold = container === window ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
        return fold <= getTopOffset(element) - threshold;
    };

    var getLeftOffset = function getLeftOffset(element) {
        return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
    };

    var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
        var documentWidth = window.innerWidth;
        var fold = container === window ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
        return fold <= getLeftOffset(element) - threshold;
    };

    var isAboveViewport = function isAboveViewport(element, container, threshold) {
        var fold = container === window ? window.pageYOffset : getTopOffset(container);
        return fold >= getTopOffset(element) + threshold + element.offsetHeight;
    };

    var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
        var fold = container === window ? window.pageXOffset : getLeftOffset(container);
        return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
    };

    var isInsideViewport = function isInsideViewport(element, container, threshold) {
        return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
    };

    /* Creates instance and notifies it through the window element */
    var createInstance = function createInstance(classObj, options) {
        var instance = new classObj(options);
        var event = new CustomEvent("LazyLoad::Initialized", { detail: { instance: instance } });
        window.dispatchEvent(event);
    };

    /* Auto initialization of one or more instances of lazyload, depending on the 
        options passed in (plain object or an array) */
    var autoInitialize = function autoInitialize(classObj, options) {
        var optsLength = options.length;
        if (!optsLength) {
            // Plain object
            createInstance(classObj, options);
        } else {
            // Array of objects
            for (var i = 0; i < optsLength; i++) {
                createInstance(classObj, options[i]);
            }
        }
    };

    var setSourcesForPicture = function setSourcesForPicture(element, srcsetDataAttribute) {
        var parent = element.parentElement;
        if (parent.tagName !== "PICTURE") {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            var pictureChild = parent.children[i];
            if (pictureChild.tagName === "SOURCE") {
                var sourceSrcset = pictureChild.dataset[srcsetDataAttribute];
                if (sourceSrcset) {
                    pictureChild.setAttribute("srcset", sourceSrcset);
                }
            }
        }
    };

    var setSources = function setSources(element, srcsetDataAttribute, srcDataAttribute) {
        var tagName = element.tagName;
        var elementSrc = element.dataset[srcDataAttribute];
        if (tagName === "IMG") {
            setSourcesForPicture(element, srcsetDataAttribute);
            var imgSrcset = element.dataset[srcsetDataAttribute];
            if (imgSrcset) {
                element.setAttribute("srcset", imgSrcset);
            }
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (tagName === "IFRAME") {
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (elementSrc) {
            element.style.backgroundImage = "url(" + elementSrc + ")";
        }
    };

    /*
     * Constructor
     */

    var LazyLoad = function LazyLoad(instanceSettings) {
        this._settings = _extends({}, defaultSettings, instanceSettings);
        this._queryOriginNode = this._settings.container === window ? document : this._settings.container;

        this._previousLoopTime = 0;
        this._loopTimeout = null;
        this._boundHandleScroll = this.handleScroll.bind(this);

        this._isFirstLoop = true;
        window.addEventListener("resize", this._boundHandleScroll);
        this.update();
    };

    LazyLoad.prototype = {

        /*
         * Private methods
         */

        _reveal: function _reveal(element) {
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
                callCallback(settings.callback_error, element);
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
                callCallback(settings.callback_load, element);
            };

            if (element.tagName === "IMG" || element.tagName === "IFRAME") {
                element.addEventListener("load", loadCallback);
                element.addEventListener("error", errorCallback);
                element.classList.add(settings.class_loading);
            }

            setSources(element, settings.data_srcset, settings.data_src);
            /* Calling SET callback */
            callCallback(settings.callback_set, element);
        },

        _loopThroughElements: function _loopThroughElements() {
            var settings = this._settings,
                elements = this._elements,
                elementsLength = !elements ? 0 : elements.length;
            var i = void 0,
                processedIndexes = [],
                firstLoop = this._isFirstLoop;

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If must skip_invisible and element is invisible, skip it */
                if (settings.skip_invisible && element.offsetParent === null) {
                    continue;
                }

                if (isBot || isInsideViewport(element, settings.container, settings.threshold)) {
                    if (firstLoop) {
                        element.classList.add(settings.class_initial);
                    }
                    /* Start loading the image */
                    this._reveal(element);
                    /* Marking the element as processed. */
                    processedIndexes.push(i);
                    element.dataset.wasProcessed = true;
                }
            }
            /* Removing processed elements from this._elements. */
            while (processedIndexes.length > 0) {
                elements.splice(processedIndexes.pop(), 1);
                /* Calling the end loop callback */
                callCallback(settings.callback_processed, elements.length);
            }
            /* Stop listening to scroll event when 0 elements remains */
            if (elementsLength === 0) {
                this._stopScrollHandler();
            }
            /* Sets isFirstLoop to false */
            if (firstLoop) {
                this._isFirstLoop = false;
            }
        },

        _purgeElements: function _purgeElements() {
            var elements = this._elements,
                elementsLength = elements.length;
            var i = void 0,
                elementsToPurge = [];

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If the element has already been processed, skip it */
                if (element.dataset.wasProcessed) {
                    elementsToPurge.push(i);
                }
            }
            /* Removing elements to purge from this._elements. */
            while (elementsToPurge.length > 0) {
                elements.splice(elementsToPurge.pop(), 1);
            }
        },

        _startScrollHandler: function _startScrollHandler() {
            if (!this._isHandlingScroll) {
                this._isHandlingScroll = true;
                this._settings.container.addEventListener("scroll", this._boundHandleScroll);
            }
        },

        _stopScrollHandler: function _stopScrollHandler() {
            if (this._isHandlingScroll) {
                this._isHandlingScroll = false;
                this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
            }
        },

        /* 
         * Public methods
         */

        handleScroll: function handleScroll() {
            var _this = this;

            var throttle = this._settings.throttle;

            if (throttle !== 0) {
                (function () {
                    var getTime = function getTime() {
                        new Date().getTime();
                    };
                    var now = getTime();
                    var remainingTime = throttle - (now - _this._previousLoopTime);
                    if (remainingTime <= 0 || remainingTime > throttle) {
                        if (_this._loopTimeout) {
                            clearTimeout(_this._loopTimeout);
                            _this._loopTimeout = null;
                        }
                        _this._previousLoopTime = now;
                        _this._loopThroughElements();
                    } else if (!_this._loopTimeout) {
                        _this._loopTimeout = setTimeout(function () {
                            this._previousLoopTime = getTime();
                            this._loopTimeout = null;
                            this._loopThroughElements();
                        }.bind(_this), remainingTime);
                    }
                })();
            } else {
                this._loopThroughElements();
            }
        },

        update: function update() {
            // Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
            this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector));
            this._purgeElements();
            this._loopThroughElements();
            this._startScrollHandler();
        },

        destroy: function destroy() {
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
    };

    /* Automatic instances creation if required (useful for async script loading!) */
    var autoInitOptions = window.lazyLoadOptions;
    if (autoInitOptions) {
        autoInitialize(LazyLoad, autoInitOptions);
    }

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
// var myLazyLoad = new LazyLoad({
//     // example of options object -> see options section
//     elements_selector: ".dp-lazy"
//     // throttle: 200,
//     // data_src: "src",
//     // data_srcset: "srcset",
//     // callback_set: function() { /* ... */ }
// });

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi50YWJzLmpzIiwibGF6eWxvYWQudHJhbnNwaWxlZC5qcyIsImZsaWNraXR5LnBrZ2QubWluLmpzIiwiZmxpY2tpdHliZy1sYXp5bG9hZC5qcyIsImpxdWVyeS1hdXRvY29tcGxldGUuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJydGwiLCJhdHRyIiwicGx1Z2luIiwibmFtZSIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ0b0xvd2VyQ2FzZSIsInV1aWQiLCJHZXRZb0RpZ2l0cyIsIiRlbGVtZW50IiwiZGF0YSIsInRyaWdnZXIiLCJwdXNoIiwidW5yZWdpc3RlclBsdWdpbiIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVBdHRyIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsImVhY2giLCJfaW5pdCIsInR5cGUiLCJfdGhpcyIsImZucyIsInBsZ3MiLCJmb3JFYWNoIiwicCIsImZvdW5kYXRpb24iLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibGVuZ3RoIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJ0Iiwic3R5bGUiLCJzZXRUaW1lb3V0IiwidHJpZ2dlckhhbmRsZXIiLCJ1dGlsIiwidGhyb3R0bGUiLCJmdW5jIiwiZGVsYXkiLCJ0aW1lciIsImNvbnRleHQiLCJhcmdzIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJNZWRpYVF1ZXJ5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwicGx1Z0NsYXNzIiwidW5kZWZpbmVkIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJ3aW5kb3ciLCJmbiIsIkRhdGUiLCJub3ciLCJnZXRUaW1lIiwidmVuZG9ycyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJjYWxsYmFjayIsIm5leHRUaW1lIiwibWF4IiwiY2xlYXJUaW1lb3V0IiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInJlcGxhY2UiLCJqUXVlcnkiLCJCb3giLCJJbU5vdFRvdWNoaW5nWW91IiwiR2V0RGltZW5zaW9ucyIsIkdldE9mZnNldHMiLCJlbGVtZW50IiwicGFyZW50IiwibHJPbmx5IiwidGJPbmx5IiwiZWxlRGltcyIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsInBhckRpbXMiLCJvZmZzZXQiLCJoZWlnaHQiLCJ3aWR0aCIsIndpbmRvd0RpbXMiLCJhbGxEaXJzIiwiRXJyb3IiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFyUmVjdCIsInBhcmVudE5vZGUiLCJ3aW5SZWN0IiwiYm9keSIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJwb3NpdGlvbiIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJrZXlDb2RlcyIsImNvbW1hbmRzIiwiS2V5Ym9hcmQiLCJnZXRLZXlDb2RlcyIsInBhcnNlS2V5IiwiZXZlbnQiLCJrZXkiLCJ3aGljaCIsImtleUNvZGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ0b1VwcGVyQ2FzZSIsInNoaWZ0S2V5IiwiY3RybEtleSIsImFsdEtleSIsImhhbmRsZUtleSIsImNvbXBvbmVudCIsImZ1bmN0aW9ucyIsImNvbW1hbmRMaXN0IiwiY21kcyIsImNvbW1hbmQiLCJsdHIiLCJleHRlbmQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZWQiLCJ1bmhhbmRsZWQiLCJmaW5kRm9jdXNhYmxlIiwiZmlsdGVyIiwiaXMiLCJyZWdpc3RlciIsImNvbXBvbmVudE5hbWUiLCJ0cmFwRm9jdXMiLCIkZm9jdXNhYmxlIiwiJGZpcnN0Rm9jdXNhYmxlIiwiZXEiLCIkbGFzdEZvY3VzYWJsZSIsIm9uIiwidGFyZ2V0IiwicHJldmVudERlZmF1bHQiLCJmb2N1cyIsInJlbGVhc2VGb2N1cyIsIm9mZiIsImtjcyIsImsiLCJrYyIsImRlZmF1bHRRdWVyaWVzIiwibGFuZHNjYXBlIiwicG9ydHJhaXQiLCJyZXRpbmEiLCJxdWVyaWVzIiwiY3VycmVudCIsInNlbGYiLCJleHRyYWN0ZWRTdHlsZXMiLCJjc3MiLCJuYW1lZFF1ZXJpZXMiLCJwYXJzZVN0eWxlVG9PYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInZhbHVlIiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwiZ2V0IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpbmZvIiwiaWQiLCJpbnNlcnRCZWZvcmUiLCJnZXRDb21wdXRlZFN0eWxlIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJ0ZXh0Iiwic3R5bGVTaGVldCIsImNzc1RleHQiLCJ0ZXh0Q29udGVudCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImlzQXJyYXkiLCJpbml0Q2xhc3NlcyIsImFjdGl2ZUNsYXNzZXMiLCJNb3Rpb24iLCJhbmltYXRlSW4iLCJhbmltYXRpb24iLCJjYiIsImFuaW1hdGUiLCJhbmltYXRlT3V0IiwiTW92ZSIsImR1cmF0aW9uIiwiYW5pbSIsInByb2ciLCJtb3ZlIiwidHMiLCJpc0luIiwiaW5pdENsYXNzIiwiYWN0aXZlQ2xhc3MiLCJyZXNldCIsImFkZENsYXNzIiwic2hvdyIsIm9mZnNldFdpZHRoIiwib25lIiwiZmluaXNoIiwiaGlkZSIsInRyYW5zaXRpb25EdXJhdGlvbiIsIk5lc3QiLCJGZWF0aGVyIiwibWVudSIsIml0ZW1zIiwic3ViTWVudUNsYXNzIiwic3ViSXRlbUNsYXNzIiwiaGFzU3ViQ2xhc3MiLCIkaXRlbSIsIiRzdWIiLCJjaGlsZHJlbiIsIkJ1cm4iLCJUaW1lciIsIm9wdGlvbnMiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJpbmZpbml0ZSIsInBhdXNlIiwib25JbWFnZXNMb2FkZWQiLCJpbWFnZXMiLCJ1bmxvYWRlZCIsImNvbXBsZXRlIiwicmVhZHlTdGF0ZSIsInNpbmdsZUltYWdlTG9hZGVkIiwic3JjIiwic3BvdFN3aXBlIiwiZW5hYmxlZCIsImRvY3VtZW50RWxlbWVudCIsIm1vdmVUaHJlc2hvbGQiLCJ0aW1lVGhyZXNob2xkIiwic3RhcnRQb3NYIiwic3RhcnRQb3NZIiwic3RhcnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJpc01vdmluZyIsIm9uVG91Y2hFbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25Ub3VjaE1vdmUiLCJ4IiwidG91Y2hlcyIsInBhZ2VYIiwieSIsInBhZ2VZIiwiZHgiLCJkeSIsImRpciIsImFicyIsIm9uVG91Y2hTdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0IiwidGVhcmRvd24iLCJzcGVjaWFsIiwic3dpcGUiLCJzZXR1cCIsIm5vb3AiLCJhZGRUb3VjaCIsImhhbmRsZVRvdWNoIiwiY2hhbmdlZFRvdWNoZXMiLCJmaXJzdCIsImV2ZW50VHlwZXMiLCJ0b3VjaHN0YXJ0IiwidG91Y2htb3ZlIiwidG91Y2hlbmQiLCJzaW11bGF0ZWRFdmVudCIsIk1vdXNlRXZlbnQiLCJzY3JlZW5YIiwic2NyZWVuWSIsImNsaWVudFgiLCJjbGllbnRZIiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJNdXRhdGlvbk9ic2VydmVyIiwicHJlZml4ZXMiLCJ0cmlnZ2VycyIsInN0b3BQcm9wYWdhdGlvbiIsImZhZGVPdXQiLCJjaGVja0xpc3RlbmVycyIsImV2ZW50c0xpc3RlbmVyIiwicmVzaXplTGlzdGVuZXIiLCJzY3JvbGxMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsIm5vdCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCIkdGFyZ2V0IiwiYXR0cmlidXRlTmFtZSIsImNsb3Nlc3QiLCJlbGVtZW50T2JzZXJ2ZXIiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsImNoaWxkTGlzdCIsImNoYXJhY3RlckRhdGEiLCJzdWJ0cmVlIiwiYXR0cmlidXRlRmlsdGVyIiwiSUhlYXJZb3UiLCJBY2NvcmRpb24iLCJkZWZhdWx0cyIsIiR0YWJzIiwiaWR4IiwiJGNvbnRlbnQiLCJsaW5rSWQiLCIkaW5pdEFjdGl2ZSIsImZpcnN0VGltZUluaXQiLCJkb3duIiwiX2NoZWNrRGVlcExpbmsiLCJsb2NhdGlvbiIsImhhc2giLCIkbGluayIsIiRhbmNob3IiLCJoYXNDbGFzcyIsImRlZXBMaW5rU211ZGdlIiwibG9hZCIsInNjcm9sbFRvcCIsImRlZXBMaW5rU211ZGdlRGVsYXkiLCJkZWVwTGluayIsIl9ldmVudHMiLCIkdGFiQ29udGVudCIsInRvZ2dsZSIsIm5leHQiLCIkYSIsIm11bHRpRXhwYW5kIiwicHJldmlvdXMiLCJwcmV2IiwidXAiLCJ1cGRhdGVIaXN0b3J5IiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsImZpcnN0VGltZSIsIiRjdXJyZW50QWN0aXZlIiwic2xpZGVEb3duIiwic2xpZGVTcGVlZCIsIiRhdW50cyIsInNpYmxpbmdzIiwiYWxsb3dBbGxDbG9zZWQiLCJzbGlkZVVwIiwic3RvcCIsIkludGVyY2hhbmdlIiwicnVsZXMiLCJjdXJyZW50UGF0aCIsIl9hZGRCcmVha3BvaW50cyIsIl9nZW5lcmF0ZVJ1bGVzIiwiX3JlZmxvdyIsIm1hdGNoIiwicnVsZSIsInBhdGgiLCJTUEVDSUFMX1FVRVJJRVMiLCJydWxlc0xpc3QiLCJub2RlTmFtZSIsInJlc3BvbnNlIiwiaHRtbCIsIk9mZkNhbnZhcyIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsInRyYW5zaXRpb24iLCJjb250ZW50T3ZlcmxheSIsIm92ZXJsYXkiLCJvdmVybGF5UG9zaXRpb24iLCJzZXRBdHRyaWJ1dGUiLCIkb3ZlcmxheSIsImFwcGVuZCIsImlzUmV2ZWFsZWQiLCJSZWdFeHAiLCJyZXZlYWxDbGFzcyIsInJldmVhbE9uIiwiX3NldE1RQ2hlY2tlciIsInRyYW5zaXRpb25UaW1lIiwib3BlbiIsImNsb3NlIiwiX2hhbmRsZUtleWJvYXJkIiwiY2xvc2VPbkNsaWNrIiwicmV2ZWFsIiwiJGNsb3NlciIsInNjcm9sbEhlaWdodCIsImNsaWVudEhlaWdodCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIm9yaWdpbmFsRXZlbnQiLCJmb3JjZVRvIiwic2Nyb2xsVG8iLCJjb250ZW50U2Nyb2xsIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsIl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24iLCJhdXRvRm9jdXMiLCJjYW52YXNGb2N1cyIsIlRhYnMiLCIkdGFiVGl0bGVzIiwibGlua0NsYXNzIiwiaXNBY3RpdmUiLCJsaW5rQWN0aXZlQ2xhc3MiLCJtYXRjaEhlaWdodCIsIiRpbWFnZXMiLCJfc2V0SGVpZ2h0Iiwic2VsZWN0VGFiIiwiX2FkZEtleUhhbmRsZXIiLCJfYWRkQ2xpY2tIYW5kbGVyIiwiX3NldEhlaWdodE1xSGFuZGxlciIsIl9oYW5kbGVUYWJDaGFuZ2UiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJ3cmFwT25LZXlzIiwibGFzdCIsIm1pbiIsImhpc3RvcnlIYW5kbGVkIiwiYWN0aXZlQ29sbGFwc2UiLCJfY29sbGFwc2VUYWIiLCIkb2xkVGFiIiwiJHRhYkxpbmsiLCIkdGFyZ2V0Q29udGVudCIsIl9vcGVuVGFiIiwicGFuZWxBY3RpdmVDbGFzcyIsIiR0YXJnZXRfYW5jaG9yIiwiaWRTdHIiLCJwYW5lbENsYXNzIiwicGFuZWwiLCJ0ZW1wIiwiX2V4dGVuZHMiLCJhc3NpZ24iLCJzb3VyY2UiLCJfdHlwZW9mIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJvYmoiLCJnbG9iYWwiLCJmYWN0b3J5IiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsIkxhenlMb2FkIiwiZGVmYXVsdFNldHRpbmdzIiwiZWxlbWVudHNfc2VsZWN0b3IiLCJjb250YWluZXIiLCJ0aHJlc2hvbGQiLCJkYXRhX3NyYyIsImRhdGFfc3Jjc2V0IiwiY2xhc3NfbG9hZGluZyIsImNsYXNzX2xvYWRlZCIsImNsYXNzX2Vycm9yIiwiY2xhc3NfaW5pdGlhbCIsInNraXBfaW52aXNpYmxlIiwiY2FsbGJhY2tfbG9hZCIsImNhbGxiYWNrX2Vycm9yIiwiY2FsbGJhY2tfc2V0IiwiY2FsbGJhY2tfcHJvY2Vzc2VkIiwiaXNCb3QiLCJjYWxsQ2FsbGJhY2siLCJhcmd1bWVudCIsImdldFRvcE9mZnNldCIsIm93bmVyRG9jdW1lbnQiLCJjbGllbnRUb3AiLCJpc0JlbG93Vmlld3BvcnQiLCJmb2xkIiwiaW5uZXJIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJnZXRMZWZ0T2Zmc2V0IiwiY2xpZW50TGVmdCIsImlzQXRSaWdodE9mVmlld3BvcnQiLCJkb2N1bWVudFdpZHRoIiwiaW5uZXJXaWR0aCIsImlzQWJvdmVWaWV3cG9ydCIsImlzQXRMZWZ0T2ZWaWV3cG9ydCIsImlzSW5zaWRlVmlld3BvcnQiLCJjcmVhdGVJbnN0YW5jZSIsImNsYXNzT2JqIiwiaW5zdGFuY2UiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImF1dG9Jbml0aWFsaXplIiwib3B0c0xlbmd0aCIsInNldFNvdXJjZXNGb3JQaWN0dXJlIiwic3Jjc2V0RGF0YUF0dHJpYnV0ZSIsInBhcmVudEVsZW1lbnQiLCJ0YWdOYW1lIiwicGljdHVyZUNoaWxkIiwic291cmNlU3Jjc2V0IiwiZGF0YXNldCIsInNldFNvdXJjZXMiLCJzcmNEYXRhQXR0cmlidXRlIiwiZWxlbWVudFNyYyIsImltZ1NyY3NldCIsImJhY2tncm91bmRJbWFnZSIsImluc3RhbmNlU2V0dGluZ3MiLCJfc2V0dGluZ3MiLCJfcXVlcnlPcmlnaW5Ob2RlIiwiX3ByZXZpb3VzTG9vcFRpbWUiLCJfbG9vcFRpbWVvdXQiLCJfYm91bmRIYW5kbGVTY3JvbGwiLCJoYW5kbGVTY3JvbGwiLCJfaXNGaXJzdExvb3AiLCJ1cGRhdGUiLCJfcmV2ZWFsIiwic2V0dGluZ3MiLCJlcnJvckNhbGxiYWNrIiwibG9hZENhbGxiYWNrIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWRkIiwiX2xvb3BUaHJvdWdoRWxlbWVudHMiLCJlbGVtZW50cyIsIl9lbGVtZW50cyIsImVsZW1lbnRzTGVuZ3RoIiwicHJvY2Vzc2VkSW5kZXhlcyIsImZpcnN0TG9vcCIsIm9mZnNldFBhcmVudCIsIndhc1Byb2Nlc3NlZCIsInBvcCIsIl9zdG9wU2Nyb2xsSGFuZGxlciIsIl9wdXJnZUVsZW1lbnRzIiwiZWxlbWVudHNUb1B1cmdlIiwiX3N0YXJ0U2Nyb2xsSGFuZGxlciIsIl9pc0hhbmRsaW5nU2Nyb2xsIiwicmVtYWluaW5nVGltZSIsImRlc3Ryb3kiLCJhdXRvSW5pdE9wdGlvbnMiLCJsYXp5TG9hZE9wdGlvbnMiLCJyZXF1aXJlIiwialF1ZXJ5QnJpZGdldCIsIm8iLCJhIiwibCIsIm4iLCJzIiwiaCIsInIiLCJjIiwiY2hhckF0IiwiZCIsIm9wdGlvbiIsImlzUGxhaW5PYmplY3QiLCJicmlkZ2V0IiwiRXZFbWl0dGVyIiwib25jZSIsIl9vbmNlRXZlbnRzIiwiZW1pdEV2ZW50IiwiZ2V0U2l6ZSIsIm91dGVyV2lkdGgiLCJvdXRlckhlaWdodCIsInBhZGRpbmciLCJib3JkZXJTdHlsZSIsImJvcmRlcldpZHRoIiwiYm94U2l6aW5nIiwiYXBwZW5kQ2hpbGQiLCJpc0JveFNpemVPdXRlciIsInJlbW92ZUNoaWxkIiwicXVlcnlTZWxlY3RvciIsIm5vZGVUeXBlIiwiZGlzcGxheSIsImlzQm9yZGVyQm94IiwidSIsImYiLCJ2IiwicGFkZGluZ0xlZnQiLCJwYWRkaW5nUmlnaHQiLCJnIiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJtIiwibWFyZ2luTGVmdCIsIm1hcmdpblJpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiUyIsImJvcmRlckxlZnRXaWR0aCIsImJvcmRlclJpZ2h0V2lkdGgiLCJFIiwiYm9yZGVyVG9wV2lkdGgiLCJib3JkZXJCb3R0b21XaWR0aCIsImIiLCJDIiwibWF0Y2hlc1NlbGVjdG9yIiwiRWxlbWVudCIsImZpenp5VUlVdGlscyIsIm1vZHVsbyIsIm1ha2VBcnJheSIsInJlbW92ZUZyb20iLCJnZXRQYXJlbnQiLCJnZXRRdWVyeUVsZW1lbnQiLCJoYW5kbGVFdmVudCIsImZpbHRlckZpbmRFbGVtZW50cyIsIkhUTUxFbGVtZW50IiwiZGVib3VuY2VNZXRob2QiLCJkb2NSZWFkeSIsInRvRGFzaGVkIiwiaHRtbEluaXQiLCJnZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJGbGlja2l0eSIsIkNlbGwiLCJjcmVhdGUiLCJzaGlmdCIsIm9yaWdpblNpZGUiLCJzZXRQb3NpdGlvbiIsInVwZGF0ZVRhcmdldCIsInJlbmRlclBvc2l0aW9uIiwic2V0RGVmYXVsdFRhcmdldCIsImNlbGxBbGlnbiIsImdldFBvc2l0aW9uVmFsdWUiLCJ3cmFwU2hpZnQiLCJzbGlkZWFibGVXaWR0aCIsIlNsaWRlIiwiaXNPcmlnaW5MZWZ0IiwiY2VsbHMiLCJhZGRDZWxsIiwiZmlyc3RNYXJnaW4iLCJnZXRMYXN0Q2VsbCIsInNlbGVjdCIsImNoYW5nZVNlbGVjdGVkQ2xhc3MiLCJ1bnNlbGVjdCIsImdldENlbGxFbGVtZW50cyIsImFuaW1hdGVQcm90b3R5cGUiLCJ3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzdGFydEFuaW1hdGlvbiIsImlzQW5pbWF0aW5nIiwicmVzdGluZ0ZyYW1lcyIsImFwcGx5RHJhZ0ZvcmNlIiwiYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24iLCJpbnRlZ3JhdGVQaHlzaWNzIiwicG9zaXRpb25TbGlkZXIiLCJzZXR0bGUiLCJ0cmFuc2Zvcm0iLCJ3cmFwQXJvdW5kIiwic2hpZnRXcmFwQ2VsbHMiLCJjdXJzb3JQb3NpdGlvbiIsInJpZ2h0VG9MZWZ0Iiwic2xpZGVyIiwic2xpZGVzIiwic2xpZGVzV2lkdGgiLCJwb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQiLCJzZWxlY3RlZFNsaWRlIiwicGVyY2VudFBvc2l0aW9uIiwiaXNQb2ludGVyRG93biIsImlzRnJlZVNjcm9sbGluZyIsIl9zaGlmdENlbGxzIiwiYmVmb3JlU2hpZnRDZWxscyIsImFmdGVyU2hpZnRDZWxscyIsIl91bnNoaWZ0Q2VsbHMiLCJ2ZWxvY2l0eSIsImdldEZyaWN0aW9uRmFjdG9yIiwiYXBwbHlGb3JjZSIsImdldFJlc3RpbmdQb3NpdGlvbiIsImRyYWdYIiwic2VsZWN0ZWRBdHRyYWN0aW9uIiwiZmxpY2tpdHlHVUlEIiwiX2NyZWF0ZSIsImFjY2Vzc2liaWxpdHkiLCJmcmVlU2Nyb2xsRnJpY3Rpb24iLCJmcmljdGlvbiIsIm5hbWVzcGFjZUpRdWVyeUV2ZW50cyIsInJlc2l6ZSIsInNldEdhbGxlcnlTaXplIiwiY3JlYXRlTWV0aG9kcyIsImd1aWQiLCJzZWxlY3RlZEluZGV4Iiwidmlld3BvcnQiLCJfY3JlYXRlU2xpZGVyIiwid2F0Y2hDU1MiLCJhY3RpdmF0ZSIsIl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzIiwicmVsb2FkQ2VsbHMiLCJ0YWJJbmRleCIsImluaXRpYWxJbmRleCIsImlzSW5pdEFjdGl2YXRlZCIsImNlbGxTZWxlY3RvciIsIl9tYWtlQ2VsbHMiLCJwb3NpdGlvbkNlbGxzIiwiX2dldFdyYXBTaGlmdENlbGxzIiwiZ2V0TGFzdFNsaWRlIiwiX3NpemVDZWxscyIsIl9wb3NpdGlvbkNlbGxzIiwibWF4Q2VsbEhlaWdodCIsInVwZGF0ZVNsaWRlcyIsIl9jb250YWluU2xpZGVzIiwiX2dldENhbkNlbGxGaXQiLCJ1cGRhdGVTZWxlY3RlZFNsaWRlIiwiZ3JvdXBDZWxscyIsInBhcnNlSW50IiwicmVwb3NpdGlvbiIsInNldENlbGxBbGlnbiIsImNlbnRlciIsImFkYXB0aXZlSGVpZ2h0IiwiX2dldEdhcENlbGxzIiwiY29udGFpbiIsIkV2ZW50IiwiX3dyYXBTZWxlY3QiLCJpc0RyYWdTZWxlY3QiLCJ1bnNlbGVjdFNlbGVjdGVkU2xpZGUiLCJzZWxlY3RlZENlbGxzIiwic2VsZWN0ZWRFbGVtZW50cyIsInNlbGVjdGVkQ2VsbCIsInNlbGVjdGVkRWxlbWVudCIsInNlbGVjdENlbGwiLCJnZXRDZWxsIiwiZ2V0Q2VsbHMiLCJnZXRQYXJlbnRDZWxsIiwiZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMiLCJ1aUNoYW5nZSIsImNoaWxkVUlQb2ludGVyRG93biIsIm9ucmVzaXplIiwiY29udGVudCIsImRlYWN0aXZhdGUiLCJvbmtleWRvd24iLCJhY3RpdmVFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwiVW5pcG9pbnRlciIsImJpbmRTdGFydEV2ZW50IiwiX2JpbmRTdGFydEV2ZW50IiwidW5iaW5kU3RhcnRFdmVudCIsInBvaW50ZXJFbmFibGVkIiwibXNQb2ludGVyRW5hYmxlZCIsImdldFRvdWNoIiwiaWRlbnRpZmllciIsInBvaW50ZXJJZGVudGlmaWVyIiwib25tb3VzZWRvd24iLCJidXR0b24iLCJfcG9pbnRlckRvd24iLCJvbnRvdWNoc3RhcnQiLCJvbk1TUG9pbnRlckRvd24iLCJvbnBvaW50ZXJkb3duIiwicG9pbnRlcklkIiwicG9pbnRlckRvd24iLCJfYmluZFBvc3RTdGFydEV2ZW50cyIsIm1vdXNlZG93biIsInBvaW50ZXJkb3duIiwiTVNQb2ludGVyRG93biIsIl9ib3VuZFBvaW50ZXJFdmVudHMiLCJfdW5iaW5kUG9zdFN0YXJ0RXZlbnRzIiwib25tb3VzZW1vdmUiLCJfcG9pbnRlck1vdmUiLCJvbk1TUG9pbnRlck1vdmUiLCJvbnBvaW50ZXJtb3ZlIiwib250b3VjaG1vdmUiLCJwb2ludGVyTW92ZSIsIm9ubW91c2V1cCIsIl9wb2ludGVyVXAiLCJvbk1TUG9pbnRlclVwIiwib25wb2ludGVydXAiLCJvbnRvdWNoZW5kIiwiX3BvaW50ZXJEb25lIiwicG9pbnRlclVwIiwicG9pbnRlckRvbmUiLCJvbk1TUG9pbnRlckNhbmNlbCIsIm9ucG9pbnRlcmNhbmNlbCIsIl9wb2ludGVyQ2FuY2VsIiwib250b3VjaGNhbmNlbCIsInBvaW50ZXJDYW5jZWwiLCJnZXRQb2ludGVyUG9pbnQiLCJVbmlkcmFnZ2VyIiwiYmluZEhhbmRsZXMiLCJfYmluZEhhbmRsZXMiLCJ1bmJpbmRIYW5kbGVzIiwidG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwiaGFuZGxlcyIsIl9kcmFnUG9pbnRlckRvd24iLCJibHVyIiwicG9pbnRlckRvd25Qb2ludCIsImNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biIsIl9kcmFnUG9pbnRlck1vdmUiLCJfZHJhZ01vdmUiLCJpc0RyYWdnaW5nIiwiaGFzRHJhZ1N0YXJ0ZWQiLCJfZHJhZ1N0YXJ0IiwiX2RyYWdQb2ludGVyVXAiLCJfZHJhZ0VuZCIsIl9zdGF0aWNDbGljayIsImRyYWdTdGFydFBvaW50IiwiaXNQcmV2ZW50aW5nQ2xpY2tzIiwiZHJhZ1N0YXJ0IiwiZHJhZ01vdmUiLCJkcmFnRW5kIiwib25jbGljayIsImlzSWdub3JpbmdNb3VzZVVwIiwic3RhdGljQ2xpY2siLCJkcmFnZ2FibGUiLCJkcmFnVGhyZXNob2xkIiwiX2NyZWF0ZURyYWciLCJiaW5kRHJhZyIsIl91aUNoYW5nZURyYWciLCJfY2hpbGRVSVBvaW50ZXJEb3duRHJhZyIsInVuYmluZERyYWciLCJpc0RyYWdCb3VuZCIsInBvaW50ZXJEb3duRm9jdXMiLCJURVhUQVJFQSIsIklOUFVUIiwiT1BUSU9OIiwicmFkaW8iLCJjaGVja2JveCIsInN1Ym1pdCIsImltYWdlIiwiZmlsZSIsInBvaW50ZXJEb3duU2Nyb2xsIiwiU0VMRUNUIiwiaXNUb3VjaFNjcm9sbGluZyIsImRyYWdTdGFydFBvc2l0aW9uIiwicHJldmlvdXNEcmFnWCIsImRyYWdNb3ZlVGltZSIsImZyZWVTY3JvbGwiLCJkcmFnRW5kUmVzdGluZ1NlbGVjdCIsImRyYWdFbmRCb29zdFNlbGVjdCIsImdldFNsaWRlRGlzdGFuY2UiLCJfZ2V0Q2xvc2VzdFJlc3RpbmciLCJkaXN0YW5jZSIsImluZGV4IiwiZmxvb3IiLCJvbnNjcm9sbCIsIlRhcExpc3RlbmVyIiwiYmluZFRhcCIsInVuYmluZFRhcCIsInRhcEVsZW1lbnQiLCJkaXJlY3Rpb24iLCJ4MCIsIngxIiwieTEiLCJ4MiIsInkyIiwieDMiLCJpc0VuYWJsZWQiLCJpc1ByZXZpb3VzIiwiaXNMZWZ0IiwiZGlzYWJsZSIsImNyZWF0ZVNWRyIsIm9uVGFwIiwiY3JlYXRlRWxlbWVudE5TIiwiYXJyb3dTaGFwZSIsImVuYWJsZSIsImRpc2FibGVkIiwicHJldk5leHRCdXR0b25zIiwiX2NyZWF0ZVByZXZOZXh0QnV0dG9ucyIsInByZXZCdXR0b24iLCJuZXh0QnV0dG9uIiwiYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJkZWFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiUHJldk5leHRCdXR0b24iLCJob2xkZXIiLCJkb3RzIiwic2V0RG90cyIsImFkZERvdHMiLCJyZW1vdmVEb3RzIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsInVwZGF0ZVNlbGVjdGVkIiwic2VsZWN0ZWREb3QiLCJQYWdlRG90cyIsInBhZ2VEb3RzIiwiX2NyZWF0ZVBhZ2VEb3RzIiwiYWN0aXZhdGVQYWdlRG90cyIsInVwZGF0ZVNlbGVjdGVkUGFnZURvdHMiLCJ1cGRhdGVQYWdlRG90cyIsImRlYWN0aXZhdGVQYWdlRG90cyIsInN0YXRlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwidmlzaWJpbGl0eUNoYW5nZSIsIm9uVmlzaWJpbGl0eVBsYXkiLCJ2aXNpYmlsaXR5UGxheSIsInBsYXkiLCJ0aWNrIiwiYXV0b1BsYXkiLCJjbGVhciIsInRpbWVvdXQiLCJ1bnBhdXNlIiwicGF1c2VBdXRvUGxheU9uSG92ZXIiLCJfY3JlYXRlUGxheWVyIiwicGxheWVyIiwiYWN0aXZhdGVQbGF5ZXIiLCJzdG9wUGxheWVyIiwiZGVhY3RpdmF0ZVBsYXllciIsInBsYXlQbGF5ZXIiLCJwYXVzZVBsYXllciIsInVucGF1c2VQbGF5ZXIiLCJvbm1vdXNlZW50ZXIiLCJvbm1vdXNlbGVhdmUiLCJQbGF5ZXIiLCJpbnNlcnQiLCJfY2VsbEFkZGVkUmVtb3ZlZCIsInByZXBlbmQiLCJjZWxsQ2hhbmdlIiwiY2VsbFNpemVDaGFuZ2UiLCJpbWciLCJmbGlja2l0eSIsIl9jcmVhdGVMYXp5bG9hZCIsImxhenlMb2FkIiwib25sb2FkIiwib25lcnJvciIsIkxhenlMb2FkZXIiLCJfY3JlYXRlQXNOYXZGb3IiLCJhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVhY3RpdmF0ZUFzTmF2Rm9yIiwiZGVzdHJveUFzTmF2Rm9yIiwiYXNOYXZGb3IiLCJzZXROYXZDb21wYW5pb24iLCJuYXZDb21wYW5pb24iLCJvbk5hdkNvbXBhbmlvblNlbGVjdCIsIm5hdkNvbXBhbmlvblNlbGVjdCIsIm9uTmF2U3RhdGljQ2xpY2siLCJyZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzIiwibmF2U2VsZWN0ZWRFbGVtZW50cyIsImNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MiLCJpbWFnZXNMb2FkZWQiLCJnZXRJbWFnZXMiLCJqcURlZmVycmVkIiwiRGVmZXJyZWQiLCJjaGVjayIsInVybCIsIkltYWdlIiwiYWRkRWxlbWVudEltYWdlcyIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiYWRkQmFja2dyb3VuZCIsInByb2dyZXNzIiwicHJvZ3Jlc3NlZENvdW50IiwiaGFzQW55QnJva2VuIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJnZXRJc0ltYWdlQ29tcGxldGUiLCJjb25maXJtIiwibmF0dXJhbFdpZHRoIiwicHJveHlJbWFnZSIsInVuYmluZEV2ZW50cyIsIm1ha2VKUXVlcnlQbHVnaW4iLCJwcm9taXNlIiwiX2NyZWF0ZUltYWdlc0xvYWRlZCIsInV0aWxzIiwicHJvdG8iLCJfY3JlYXRlQmdMYXp5TG9hZCIsImJnTGF6eUxvYWQiLCJhZGpDb3VudCIsImNlbGxFbGVtcyIsImNlbGxFbGVtIiwiYmdMYXp5TG9hZEVsZW0iLCJqIiwiQmdMYXp5TG9hZGVyIiwiZXNjYXBlUmVnRXhDaGFycyIsImNyZWF0ZU5vZGUiLCJjb250YWluZXJDbGFzcyIsImRpdiIsIkVTQyIsIlRBQiIsIlJFVFVSTiIsIkxFRlQiLCJVUCIsIlJJR0hUIiwiRE9XTiIsIkF1dG9jb21wbGV0ZSIsInRoYXQiLCJhamF4U2V0dGluZ3MiLCJhdXRvU2VsZWN0Rmlyc3QiLCJzZXJ2aWNlVXJsIiwibG9va3VwIiwib25TZWxlY3QiLCJtaW5DaGFycyIsIm1heEhlaWdodCIsImRlZmVyUmVxdWVzdEJ5IiwicGFyYW1zIiwiZm9ybWF0UmVzdWx0IiwiZGVsaW1pdGVyIiwiekluZGV4Iiwibm9DYWNoZSIsIm9uU2VhcmNoU3RhcnQiLCJvblNlYXJjaENvbXBsZXRlIiwib25TZWFyY2hFcnJvciIsInByZXNlcnZlSW5wdXQiLCJ0YWJEaXNhYmxlZCIsImRhdGFUeXBlIiwiY3VycmVudFJlcXVlc3QiLCJ0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0IiwicHJldmVudEJhZFF1ZXJpZXMiLCJsb29rdXBGaWx0ZXIiLCJzdWdnZXN0aW9uIiwib3JpZ2luYWxRdWVyeSIsInF1ZXJ5TG93ZXJDYXNlIiwicGFyYW1OYW1lIiwidHJhbnNmb3JtUmVzdWx0IiwicGFyc2VKU09OIiwic2hvd05vU3VnZ2VzdGlvbk5vdGljZSIsIm5vU3VnZ2VzdGlvbk5vdGljZSIsIm9yaWVudGF0aW9uIiwiZm9yY2VGaXhQb3NpdGlvbiIsInN1Z2dlc3Rpb25zIiwiYmFkUXVlcmllcyIsImN1cnJlbnRWYWx1ZSIsImludGVydmFsSWQiLCJjYWNoZWRSZXNwb25zZSIsIm9uQ2hhbmdlSW50ZXJ2YWwiLCJvbkNoYW5nZSIsImlzTG9jYWwiLCJzdWdnZXN0aW9uc0NvbnRhaW5lciIsIm5vU3VnZ2VzdGlvbnNDb250YWluZXIiLCJjbGFzc2VzIiwic2VsZWN0ZWQiLCJoaW50IiwiaGludFZhbHVlIiwic2VsZWN0aW9uIiwiaW5pdGlhbGl6ZSIsInNldE9wdGlvbnMiLCJwYXR0ZXJuIiwia2lsbGVyRm4iLCJzdWdnZXN0aW9uU2VsZWN0b3IiLCJraWxsU3VnZ2VzdGlvbnMiLCJkaXNhYmxlS2lsbGVyRm4iLCJmaXhQb3NpdGlvbkNhcHR1cmUiLCJ2aXNpYmxlIiwiZml4UG9zaXRpb24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uQmx1ciIsIm9uRm9jdXMiLCJvblZhbHVlQ2hhbmdlIiwiZW5hYmxlS2lsbGVyRm4iLCJhYm9ydEFqYXgiLCJhYm9ydCIsInN1cHBsaWVkT3B0aW9ucyIsInZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0IiwidmFsaWRhdGVPcmllbnRhdGlvbiIsImNsZWFyQ2FjaGUiLCJjbGVhckludGVydmFsIiwiJGNvbnRhaW5lciIsImNvbnRhaW5lclBhcmVudCIsInNpdGVTZWFyY2hEaXYiLCJjb250YWluZXJIZWlnaHQiLCJzdHlsZXMiLCJ2aWV3UG9ydEhlaWdodCIsInRvcE92ZXJmbG93IiwiYm90dG9tT3ZlcmZsb3ciLCJvcGFjaXR5IiwicGFyZW50T2Zmc2V0RGlmZiIsInN0b3BLaWxsU3VnZ2VzdGlvbnMiLCJzZXRJbnRlcnZhbCIsImlzQ3Vyc29yQXRFbmQiLCJ2YWxMZW5ndGgiLCJzZWxlY3Rpb25TdGFydCIsInJhbmdlIiwiY3JlYXRlUmFuZ2UiLCJtb3ZlU3RhcnQiLCJzdWdnZXN0Iiwib25IaW50Iiwic2VsZWN0SGludCIsIm1vdmVVcCIsIm1vdmVEb3duIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwiZmluZEJlc3RIaW50IiwiZ2V0UXVlcnkiLCJvbkludmFsaWRhdGVTZWxlY3Rpb24iLCJpc0V4YWN0TWF0Y2giLCJnZXRTdWdnZXN0aW9ucyIsImdldFN1Z2dlc3Rpb25zTG9jYWwiLCJsaW1pdCIsImxvb2t1cExpbWl0IiwiZ3JlcCIsInEiLCJjYWNoZUtleSIsImlnbm9yZVBhcmFtcyIsImlzRnVuY3Rpb24iLCJpc0JhZFF1ZXJ5IiwiYWpheCIsImRvbmUiLCJyZXN1bHQiLCJwcm9jZXNzUmVzcG9uc2UiLCJmYWlsIiwianFYSFIiLCJ0ZXh0U3RhdHVzIiwiZXJyb3JUaHJvd24iLCJvbkhpZGUiLCJzaWduYWxIaW50Iiwibm9TdWdnZXN0aW9ucyIsImdyb3VwQnkiLCJjbGFzc1NlbGVjdGVkIiwiYmVmb3JlUmVuZGVyIiwiY2F0ZWdvcnkiLCJmb3JtYXRHcm91cCIsImN1cnJlbnRDYXRlZ29yeSIsImFkanVzdENvbnRhaW5lcldpZHRoIiwiZGV0YWNoIiwiZW1wdHkiLCJiZXN0TWF0Y2giLCJmb3VuZE1hdGNoIiwic3Vic3RyIiwiZmFsbGJhY2siLCJpbkFycmF5IiwiYWN0aXZlSXRlbSIsImFkanVzdFNjcm9sbCIsIm9mZnNldFRvcCIsInVwcGVyQm91bmQiLCJsb3dlckJvdW5kIiwiaGVpZ2h0RGVsdGEiLCJnZXRWYWx1ZSIsIm9uU2VsZWN0Q2FsbGJhY2siLCJkaXNwb3NlIiwiYXV0b2NvbXBsZXRlIiwiZGV2YnJpZGdlQXV0b2NvbXBsZXRlIiwiZGF0YUtleSIsImlucHV0RWxlbWVudCIsImJhc2VzIiwiYmFzZUhyZWYiLCJocmVmIiwiJGNhcm91c2VsIiwiJGltZ3MiLCJkb2NTdHlsZSIsInRyYW5zZm9ybVByb3AiLCJmbGt0eSIsInNsaWRlIiwiY2xpY2siLCIkZ2FsbGVyeSIsIm9uTG9hZGVkZGF0YSIsImNlbGwiLCJ2aWRlbyIsIiRzbGlkZXNob3ciLCJzbGlkZXNob3dmbGsiLCJ3cmFwIiwid2hhdElucHV0IiwiYXNrIiwidG9nZ2xlQ2xhc3MiLCJ0b2dnbGVTZWFyY2hDbGFzc2VzIiwidG9nZ2xlTW9iaWxlTWVudUNsYXNzZXMiLCJnZXRFbGVtZW50QnlJZCIsImZvY3Vzb3V0Iiwib2xkU2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaFZBLENBQUMsVUFBU0EsQ0FBVCxFQUFZOztBQUViOztBQUVBLE1BQUlDLHFCQUFxQixPQUF6Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsYUFBYTtBQUNmQyxhQUFTRixrQkFETTs7QUFHZjs7O0FBR0FHLGNBQVUsRUFOSzs7QUFRZjs7O0FBR0FDLFlBQVEsRUFYTzs7QUFhZjs7O0FBR0FDLFNBQUss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QixDQUFrQyxVQUFTNW5DLENBQVQsRUFBVztBQUM1QyxLQUFJKzlCLE9BQU9qaUMsRUFBRSxJQUFGLENBQVg7QUFDQSxLQUFJa3NDLFFBQVFqSyxLQUFLNWdDLElBQUwsQ0FBVSxPQUFWLENBQVo7QUFDQSxLQUFJd0ksUUFBUTdKLEVBQUUsS0FBRixFQUFTaWlDLElBQVQsRUFBZXA0QixLQUFmLEVBQVo7QUFDQSxLQUFJRCxTQUFTNUosRUFBRSxLQUFGLEVBQVNpaUMsSUFBVCxFQUFlcjRCLE1BQWYsRUFBYjtBQUNBcTRCLE1BQUsvNEIsTUFBTCxHQUFjOEksUUFBZCxDQUF1QixJQUF2QjtBQUNBaXdCLE1BQUsvNEIsTUFBTCxHQUFjczBCLE9BQWQsQ0FBc0Isa0ZBQWtGME8sS0FBbEYsR0FBMEYsNEJBQTFGLEdBQXlIcmlDLEtBQXpILEdBQWlJLFlBQWpJLEdBQWdKRCxNQUFoSixHQUF5Siw0RkFBL0s7QUFDQXE0QixNQUFLNXZCLElBQUw7QUFDQW5PLEdBQUV1SixjQUFGO0FBQ0EsQ0FURDs7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBL1RBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY0LjAuNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFZhcmlhYmxlc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIC8vIGNhY2hlIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXHQgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IHR5cGVcblx0ICB2YXIgY3VycmVudElucHV0ID0gJ2luaXRpYWwnO1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IGludGVudFxuXHQgIHZhciBjdXJyZW50SW50ZW50ID0gbnVsbDtcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFtcblx0ICAgICdpbnB1dCcsXG5cdCAgICAnc2VsZWN0Jyxcblx0ICAgICd0ZXh0YXJlYSdcblx0ICBdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFtcblx0ICAgIDE2LCAvLyBzaGlmdFxuXHQgICAgMTcsIC8vIGNvbnRyb2xcblx0ICAgIDE4LCAvLyBhbHRcblx0ICAgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgICA5MyAgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAgJ2tleXVwJzogJ2tleWJvYXJkJyxcblx0ICAgICdtb3VzZWRvd24nOiAnbW91c2UnLFxuXHQgICAgJ21vdXNlbW92ZSc6ICdtb3VzZScsXG5cdCAgICAnTVNQb2ludGVyRG93bic6ICdwb2ludGVyJyxcblx0ICAgICdNU1BvaW50ZXJNb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJtb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3RvdWNoc3RhcnQnOiAndG91Y2gnXG5cdCAgfTtcblxuXHQgIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIHRpbWVyIGlzIHJ1bm5pbmdcblx0ICB2YXIgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgIC8vIG1hcCBvZiBJRSAxMCBwb2ludGVyIGV2ZW50c1xuXHQgIHZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cdCAgfTtcblxuXHQgIC8vIHRvdWNoIGJ1ZmZlciB0aW1lclxuXHQgIHZhciB0b3VjaFRpbWVyID0gbnVsbDtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgU2V0IHVwXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICAgIHNldElucHV0KCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgRXZlbnRzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBgcG9pbnRlcm1vdmVgLCBgTVNQb2ludGVyTW92ZWAsIGBtb3VzZW1vdmVgIGFuZCBtb3VzZSB3aGVlbCBldmVudCBiaW5kaW5nXG5cdCAgICAvLyBjYW4gb25seSBkZW1vbnN0cmF0ZSBwb3RlbnRpYWwsIGJ1dCBub3QgYWN0dWFsLCBpbnRlcmFjdGlvblxuXHQgICAgLy8gYW5kIGFyZSB0cmVhdGVkIHNlcGFyYXRlbHlcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAgIC8vIHRvdWNoIGV2ZW50c1xuXHQgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG5cdCAgICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hCdWZmZXIpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIG1vdXNlIHdoZWVsXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50KTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlSW5wdXQpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHVwZGF0ZUlucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoXG5cdCAgICAgICAgY3VycmVudElucHV0ICE9PSB2YWx1ZSB8fFxuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlXG5cdCAgICAgICkge1xuXG5cdCAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICAgIHZhciBhY3RpdmVJbnB1dCA9IChcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0gJiZcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiZcblx0ICAgICAgICAgIGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMVxuXHQgICAgICAgICkgPyB0cnVlIDogZmFsc2U7XG5cblx0ICAgICAgICBpZiAoXG5cdCAgICAgICAgICB2YWx1ZSA9PT0gJ3RvdWNoJyB8fFxuXG5cdCAgICAgICAgICAvLyBpZ25vcmUgbW91c2UgbW9kaWZpZXIga2V5c1xuXHQgICAgICAgICAgKHZhbHVlID09PSAnbW91c2UnICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTEpIHx8XG5cblx0ICAgICAgICAgIC8vIGRvbid0IHN3aXRjaCBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIGEgZm9ybSBpbnB1dFxuXHQgICAgICAgICAgKHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGFjdGl2ZUlucHV0KVxuXHQgICAgICAgICkge1xuXG5cdCAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgYW5kIGNhdGNoLWFsbCB2YXJpYWJsZVxuXHQgICAgICAgICAgY3VycmVudElucHV0ID0gY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgICBzZXRJbnB1dCgpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIHRoZSBkb2MgYW5kIGBpbnB1dFR5cGVzYCBhcnJheSB3aXRoIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0JywgY3VycmVudElucHV0KTtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW5wdXQpO1xuXG5cdCAgICBpZiAoaW5wdXRUeXBlcy5pbmRleE9mKGN1cnJlbnRJbnB1dCkgPT09IC0xKSB7XG5cdCAgICAgIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmNsYXNzTmFtZSArPSAnIHdoYXRpbnB1dC10eXBlcy0nICsgY3VycmVudElucHV0O1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIGlucHV0IGludGVudCBmb3IgYG1vdXNlbW92ZWAgYW5kIGBwb2ludGVybW92ZWBcblx0ICB2YXIgc2V0SW50ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBidWZmZXJzIHRvdWNoIGV2ZW50cyBiZWNhdXNlIHRoZXkgZnJlcXVlbnRseSBhbHNvIGZpcmUgbW91c2UgZXZlbnRzXG5cdCAgdmFyIHRvdWNoQnVmZmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gY2xlYXIgdGhlIHRpbWVyIGlmIGl0IGhhcHBlbnMgdG8gYmUgcnVubmluZ1xuXHQgICAgd2luZG93LmNsZWFyVGltZW91dCh0b3VjaFRpbWVyKTtcblxuXHQgICAgLy8gc2V0IHRoZSBjdXJyZW50IGlucHV0XG5cdCAgICB1cGRhdGVJbnB1dChldmVudCk7XG5cblx0ICAgIC8vIHNldCB0aGUgaXNCdWZmZXJpbmcgdG8gYHRydWVgXG5cdCAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG5cblx0ICAgIC8vIHJ1biB0aGUgdGltZXJcblx0ICAgIHRvdWNoVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuXHQgICAgICAvLyBpZiB0aGUgdGltZXIgcnVucyBvdXQsIHNldCBpc0J1ZmZlcmluZyBiYWNrIHRvIGBmYWxzZWBcblx0ICAgICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblx0ICAgIH0sIDIwMCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVXRpbGl0aWVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHBvaW50ZXJUeXBlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0ICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICB9IGVsc2Uge1xuXHQgICAgICByZXR1cm4gKGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJykgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7IC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgIH1cblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy93aGVlbFxuXHQgIHZhciBkZXRlY3RXaGVlbCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgcmV0dXJuICdvbndoZWVsJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSA/XG5cdCAgICAgICd3aGVlbCcgOiAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblxuXHQgICAgICBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/XG5cdCAgICAgICAgJ21vdXNld2hlZWwnIDogLy8gV2Via2l0IGFuZCBJRSBzdXBwb3J0IGF0IGxlYXN0IFwibW91c2V3aGVlbFwiXG5cdCAgICAgICAgJ0RPTU1vdXNlU2Nyb2xsJzsgLy8gbGV0J3MgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgSW5pdFxuXG5cdCAgICBkb24ndCBzdGFydCBzY3JpcHQgdW5sZXNzIGJyb3dzZXIgY3V0cyB0aGUgbXVzdGFyZFxuXHQgICAgKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICBpZiAoXG5cdCAgICAnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmXG5cdCAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuXHQgICkge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEFQSVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHJldHVybiB7XG5cblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdsb29zZSd8J3N0cmljdCdcblx0ICAgIC8vICdzdHJpY3QnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdsb29zZSc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgbW9yZSBjdXJyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbihvcHQpIHsgcmV0dXJuIChvcHQgPT09ICdsb29zZScpID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDsgfSxcblxuXHQgICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuXHQgICAgdHlwZXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaW5wdXRUeXBlczsgfVxuXG5cdCAgfTtcblxuXHR9KCkpO1xuXG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIhZnVuY3Rpb24oJCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIEZPVU5EQVRJT05fVkVSU0lPTiA9ICc2LjMuMSc7XG5cbi8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxudmFyIEZvdW5kYXRpb24gPSB7XG4gIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAvKipcbiAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAqL1xuICBfcGx1Z2luczoge30sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgKi9cbiAgX3V1aWRzOiBbXSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAqL1xuICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gIH0sXG4gIC8qKlxuICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAqL1xuICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICB2YXIgY2xhc3NOYW1lID0gKG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbikpO1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXG4gICAgdmFyIGF0dHJOYW1lICA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cbiAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xuICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gLCBwbHVnaW4udXVpZCk7IH1cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpeyBwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nLCBwbHVnaW4pOyB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAgICAgKi9cbiAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcihgaW5pdC56Zi4ke3BsdWdpbk5hbWV9YCk7XG5cbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG5cbiAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAqL1xuICAgICAgICAgIC50cmlnZ2VyKGBkZXN0cm95ZWQuemYuJHtwbHVnaW5OYW1lfWApO1xuICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgfVxuICAgIHJldHVybjtcbiAgfSxcblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAqL1xuICAgcmVJbml0OiBmdW5jdGlvbihwbHVnaW5zKXtcbiAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgdHJ5e1xuICAgICAgIGlmKGlzSlEpe1xuICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgfSk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uKHApe1xuICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH07XG4gICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgfVxuICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgIH1maW5hbGx5e1xuICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICB9XG4gICB9LFxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICovXG4gIEdldFlvRGlnaXRzOiBmdW5jdGlvbihsZW5ndGgsIG5hbWVzcGFjZSl7XG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyBgLSR7bmFtZXNwYWNlfWAgOiAnJyk7XG4gIH0sXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICovXG4gIHJlZmxvdzogZnVuY3Rpb24oZWxlbSwgcGx1Z2lucykge1xuXG4gICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgIH1cbiAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiK25hbWUrXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XG4gICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbihlLCBpKXtcbiAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uKGVsKXsgcmV0dXJuIGVsLnRyaW0oKTsgfSk7XG4gICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgIH1jYXRjaChlcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG4gIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbigkZWxlbSl7XG4gICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgIH07XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgZW5kO1xuXG4gICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGVuZCl7XG4gICAgICByZXR1cm4gZW5kO1xuICAgIH1lbHNle1xuICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgfSwgMSk7XG4gICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgIH1cbiAgfVxufTtcblxuRm91bmRhdGlvbi51dGlsID0ge1xuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgKi9cbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbi8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4vKipcbiAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAqL1xudmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgJG1ldGEgPSAkKCdtZXRhLmZvdW5kYXRpb24tbXEnKSxcbiAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgaWYoISRtZXRhLmxlbmd0aCl7XG4gICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gIH1cbiAgaWYoJG5vSlMubGVuZ3RoKXtcbiAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgfVxuXG4gIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXsvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpey8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7Ly9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOy8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgIGlmKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpey8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgIGlmKHRoaXMubGVuZ3RoID09PSAxKXsvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWwpey8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgfVxuICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBXZSdyZSBzb3JyeSwgJHt0eXBlfSBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuYCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG53aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4kLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24oKSB7XG4gIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcbiAgfVxuICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbiAgLyoqXG4gICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgKi9cbiAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgIH07XG4gIH1cbn0pKCk7XG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gIH1cbiAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7XG4gIGVsc2UgaWYgKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9IGBTSElGVF8ke2tleX1gO1xuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSBgQ1RSTF8ke2tleX1gO1xuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9IGBBTFRfJHtrZXl9YDtcblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICBpZighJGVsZW1lbnQpIHtyZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfSwgIFxuXG4gIC8qKlxuICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICovXG4gIHRyYXBGb2N1cygkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgKi9cbiAgcmVsZWFzZUZvY3VzKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgaWYobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogYG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAke25hbWVkUXVlcmllc1trZXldfSlgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzKHNpemUpIHtcbiAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBpZihzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZihzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7J2FyaWEtZXhwYW5kZWQnOiBmYWxzZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAkc3ViLmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICBlbHNlIHtcbiAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsgcmV0dXJuIGZhbHNlOyB9XG4gIGxldCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuXHQgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcblx0XHQgIH1cblx0XHQgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcblx0XHQgICB9XG5cdFx0ICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG5cdFx0ICB9XG5cdFx0ICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEFjY29yZGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBhIHBsYWluIG9iamVjdCB3aXRoIHNldHRpbmdzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFjY29yZGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uJywge1xuICAgICAgJ0VOVEVSJzogJ3RvZ2dsZScsXG4gICAgICAnU1BBQ0UnOiAndG9nZ2xlJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBhY2NvcmRpb24gYnkgYW5pbWF0aW5nIHRoZSBwcmVzZXQgYWN0aXZlIHBhbmUocykuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpO1xuICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKTtcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbihpZHgsIGVsKSB7XG4gICAgICB2YXIgJGVsID0gJChlbCksXG4gICAgICAgICAgJGNvbnRlbnQgPSAkZWwuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpLFxuICAgICAgICAgIGlkID0gJGNvbnRlbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjb3JkaW9uJyksXG4gICAgICAgICAgbGlua0lkID0gZWwuaWQgfHwgYCR7aWR9LWxhYmVsYDtcblxuICAgICAgJGVsLmZpbmQoJ2E6Zmlyc3QnKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2lkJzogbGlua0lkLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgJGNvbnRlbnQuYXR0cih7J3JvbGUnOiAndGFicGFuZWwnLCAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLCAnYXJpYS1oaWRkZW4nOiB0cnVlLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICAgIHZhciAkaW5pdEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICB0aGlzLmZpcnN0VGltZUluaXQgPSB0cnVlO1xuICAgIGlmKCRpbml0QWN0aXZlLmxlbmd0aCl7XG4gICAgICB0aGlzLmRvd24oJGluaXRBY3RpdmUsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyksXG4gICAgICAgICRhbmNob3IgPSAkKGFuY2hvcik7XG5cbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCAmJiAkYW5jaG9yKSB7XG4gICAgICAgICAgaWYgKCEkbGluay5wYXJlbnQoJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgdGhpcy5kb3duKCRhbmNob3IsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IF90aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCBfdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkZWVwbGlua1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLmFjY29yZGlvbicsIFskbGluaywgJGFuY2hvcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBhY2NvcmRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xuICAgICAgdmFyICR0YWJDb250ZW50ID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCR0YWJDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAkZWxlbS5jaGlsZHJlbignYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uIGtleWRvd24uemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICB9KS5vbigna2V5ZG93bi56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnQWNjb3JkaW9uJywge1xuICAgICAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ubmV4dCgpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5wcmV2KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgY29udGVudCBwYW5lJ3Mgb3Blbi9jbG9zZSBzdGF0ZS5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KSB7XG4gICAgaWYoJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcbiAgICB9XG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdmFyIGFuY2hvciA9ICR0YXJnZXQucHJldignYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGRhdGVIaXN0b3J5KSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGFjY29yZGlvbiB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3BlbiAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkb3duKCR0YXJnZXQsIGZpcnN0VGltZSkge1xuICAgICR0YXJnZXRcbiAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgICAgLnBhcmVudCgnW2RhdGEtdGFiLWNvbnRlbnRdJylcbiAgICAgIC5hZGRCYWNrKClcbiAgICAgIC5wYXJlbnQoKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCAmJiAhZmlyc3RUaW1lKSB7XG4gICAgICB2YXIgJGN1cnJlbnRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCRjdXJyZW50QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlLm5vdCgkdGFyZ2V0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHRhcmdldC5zbGlkZURvd24odGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgb3BlbmluZy5cbiAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZG93blxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICB9KTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXG4gICAgICAnYXJpYS1zZWxlY3RlZCc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYoKCF0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgJiYgISRhdW50cy5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHx8ICEkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jdXBcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgICR0YXJnZXQuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zdG9wKHRydWUpLnNsaWRlVXAoMCkuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuQWNjb3JkaW9uLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gYW5pbWF0ZSB0aGUgb3BlbmluZyBvZiBhbiBhY2NvcmRpb24gcGFuZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAyNTBcbiAgICovXG4gIHNsaWRlU3BlZWQ6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gaGF2ZSBtdWx0aXBsZSBvcGVuIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBjbG9zZSBhbGwgcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhbGxvd0FsbENsb3NlZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIGFjY29yZGlvbiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIGFjY29yZGlvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEludGVyY2hhbmdlIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5pbnRlcmNoYW5nZVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcbiAqL1xuXG5jbGFzcyBJbnRlcmNoYW5nZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEludGVyY2hhbmdlLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEludGVyY2hhbmdlI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBJbnRlcmNoYW5nZS5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5ydWxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudFBhdGggPSAnJztcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0ludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEludGVyY2hhbmdlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBpbnRlcmNoYW5nZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2FkZEJyZWFrcG9pbnRzKCk7XG4gICAgdGhpcy5fZ2VuZXJhdGVSdWxlcygpO1xuICAgIHRoaXMuX3JlZmxvdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgSW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5pbnRlcmNoYW5nZScsIEZvdW5kYXRpb24udXRpbC50aHJvdHRsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9yZWZsb3coKTtcbiAgICB9LCA1MCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIEludGVyY2hhbmdlIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWZsb3coKSB7XG4gICAgdmFyIG1hdGNoO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSwgYnV0IG9ubHkgc2F2ZSB0aGUgbGFzdCBtYXRjaFxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5ydWxlcykge1xuICAgICAgaWYodGhpcy5ydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHRoaXMucnVsZXNbaV07XG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShydWxlLnF1ZXJ5KS5tYXRjaGVzKSB7XG4gICAgICAgICAgbWF0Y2ggPSBydWxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICB0aGlzLnJlcGxhY2UobWF0Y2gucGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIEZvdW5kYXRpb24gYnJlYWtwb2ludHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTIG9iamVjdC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQnJlYWtwb2ludHMoKSB7XG4gICAgZm9yICh2YXIgaSBpbiBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcykge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzW2ldO1xuICAgICAgICBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnkubmFtZV0gPSBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBJbnRlcmNoYW5nZSBlbGVtZW50IGZvciB0aGUgcHJvdmlkZWQgbWVkaWEgcXVlcnkgKyBjb250ZW50IHBhaXJpbmdzXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdGhhdCBpcyBhbiBJbnRlcmNoYW5nZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7QXJyYXl9IHNjZW5hcmlvcyAtIEFycmF5IG9mIG9iamVjdHMgdGhhdCBoYXZlICdtcScgYW5kICdwYXRoJyBrZXlzIHdpdGggY29ycmVzcG9uZGluZyBrZXlzXG4gICAqL1xuICBfZ2VuZXJhdGVSdWxlcyhlbGVtZW50KSB7XG4gICAgdmFyIHJ1bGVzTGlzdCA9IFtdO1xuICAgIHZhciBydWxlcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucnVsZXMpIHtcbiAgICAgIHJ1bGVzID0gdGhpcy5vcHRpb25zLnJ1bGVzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdpbnRlcmNoYW5nZScpO1xuICAgIH1cbiAgICBcbiAgICBydWxlcyA9ICB0eXBlb2YgcnVsZXMgPT09ICdzdHJpbmcnID8gcnVsZXMubWF0Y2goL1xcWy4qP1xcXS9nKSA6IHJ1bGVzO1xuXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykge1xuICAgICAgaWYocnVsZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zbGljZSgxLCAtMSkuc3BsaXQoJywgJyk7XG4gICAgICAgIHZhciBwYXRoID0gcnVsZS5zbGljZSgwLCAtMSkuam9pbignJyk7XG4gICAgICAgIHZhciBxdWVyeSA9IHJ1bGVbcnVsZS5sZW5ndGggLSAxXTtcblxuICAgICAgICBpZiAoSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XSkge1xuICAgICAgICAgIHF1ZXJ5ID0gSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bGVzTGlzdC5wdXNoKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgIHF1ZXJ5OiBxdWVyeVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJ1bGVzID0gcnVsZXNMaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYHNyY2AgcHJvcGVydHkgb2YgYW4gaW1hZ2UsIG9yIGNoYW5nZSB0aGUgSFRNTCBvZiBhIGNvbnRhaW5lciwgdG8gdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIHRvIHRoZSBpbWFnZSBvciBIVE1MIHBhcnRpYWwuXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgKi9cbiAgcmVwbGFjZShwYXRoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGggPT09IHBhdGgpIHJldHVybjtcblxuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIHRyaWdnZXIgPSAncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnO1xuXG4gICAgLy8gUmVwbGFjaW5nIGltYWdlc1xuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSU1HJykge1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdzcmMnLCBwYXRoKS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KVxuICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBiYWNrZ3JvdW5kIGltYWdlc1xuICAgIGVsc2UgaWYgKHBhdGgubWF0Y2goL1xcLihnaWZ8anBnfGpwZWd8cG5nfHN2Z3x0aWZmKShbPyNdLiopPy9pKSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5jc3MoeyAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJytwYXRoKycpJyB9KVxuICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNpbmcgSFRNTFxuICAgIGVsc2Uge1xuICAgICAgJC5nZXQocGF0aCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuaHRtbChyZXNwb25zZSlcbiAgICAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICAgICAgJChyZXNwb25zZSkuZm91bmRhdGlvbigpO1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIGNvbnRlbnQgaW4gYW4gSW50ZXJjaGFuZ2UgZWxlbWVudCBpcyBkb25lIGJlaW5nIGxvYWRlZC5cbiAgICAgKiBAZXZlbnQgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcbiAgICAgKi9cbiAgICAvLyB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3JlcGxhY2VkLnpmLmludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgaW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICAvL1RPRE8gdGhpcy5cbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5JbnRlcmNoYW5nZS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFJ1bGVzIHRvIGJlIGFwcGxpZWQgdG8gSW50ZXJjaGFuZ2UgZWxlbWVudHMuIFNldCB3aXRoIHRoZSBgZGF0YS1pbnRlcmNoYW5nZWAgYXJyYXkgbm90YXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9hcnJheX1cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcnVsZXM6IG51bGxcbn07XG5cbkludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFUyA9IHtcbiAgJ2xhbmRzY2FwZSc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICdwb3J0cmFpdCc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgJ3JldGluYSc6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oSW50ZXJjaGFuZ2UsICdJbnRlcmNoYW5nZScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBPZmZDYW52YXMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy4kbGFzdFRyaWdnZXIgPSAkKCk7XG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKCk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKVxuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09mZkNhbnZhcycsIHtcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgfSk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyhgaXMtdHJhbnNpdGlvbi0ke3RoaXMub3B0aW9ucy50cmFuc2l0aW9ufWApO1xuXG4gICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoZG9jdW1lbnQpXG4gICAgICAuZmluZCgnW2RhdGEtb3Blbj1cIicraWQrJ1wiXSwgW2RhdGEtY2xvc2U9XCInK2lkKydcIl0sIFtkYXRhLXRvZ2dsZT1cIicraWQrJ1wiXScpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG4gICAgICAuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcblxuICAgIC8vIEFkZCBhbiBvdmVybGF5IG92ZXIgdGhlIGNvbnRlbnQgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHZhciBvdmVybGF5UG9zaXRpb24gPSAkKHRoaXMuJGVsZW1lbnQpLmNzcyhcInBvc2l0aW9uXCIpID09PSAnZml4ZWQnID8gJ2lzLW92ZXJsYXktZml4ZWQnIDogJ2lzLW92ZXJsYXktYWJzb2x1dGUnO1xuICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgICAgaWYob3ZlcmxheVBvc2l0aW9uID09PSAnaXMtb3ZlcmxheS1maXhlZCcpIHtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzXScpWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSxcbiAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAna2V5ZG93bi56Zi5vZmZjYW52YXMnOiB0aGlzLl9oYW5kbGVLZXlib2FyZC5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgdmFyICR0YXJnZXQgPSB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPyB0aGlzLiRvdmVybGF5IDogJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpO1xuICAgICAgJHRhcmdldC5vbih7J2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TVFDaGVja2VyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICB9XG4gICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkgeyAkY2xvc2VyLmhpZGUoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpLm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgc2Nyb2xsaW5nIG9mIHRoZSBib2R5IHdoZW4gb2ZmY2FudmFzIGlzIG9wZW4gb24gbW9iaWxlIFNhZmFyaSBhbmQgb3RoZXIgdHJvdWJsZXNvbWUgYnJvd3NlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cbiAgX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgIGlmIChlbGVtLnNjcm9sbEhlaWdodCAhPT0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IDE7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCAoZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCk7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gIH1cblxuICBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cbiAgICBsZXQgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgbGV0IGRvd24gPSAhdXA7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50LnBhZ2VZO1xuXG4gICAgaWYoKHVwICYmIGVsZW0uYWxsb3dVcCkgfHwgKGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCxkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICovXG4gICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNGb2N1cyA9IF90aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWF1dG9mb2N1c10nKTtcbiAgICAgICAgaWYgKGNhbnZhc0ZvY3VzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FudmFzRm9jdXMuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgKi9cbiAgY2xvc2UoY2IpIHtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIHJlbW92ZSBjbGFzcyBhbmQgcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVsZWFzZUZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBoYW5kbGVkOiAoKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIG92ZXJsYXkgb24gdG9wIG9mIGBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudE92ZXJsYXk6IHRydWUsXG5cbiAgLyoqXG4gICAqIEVuYWJsZS9kaXNhYmxlIHNjcm9sbGluZyBvZiB0aGUgbWFpbiBjb250ZW50IHdoZW4gYW4gb2ZmIGNhbnZhcyBwYW5lbCBpcyBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDBcbiAgICovXG4gIHRyYW5zaXRpb25UaW1lOiAwLFxuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRyYW5zaXRpb24gZm9yIHRoZSBvZmZjYW52YXMgbWVudS4gT3B0aW9ucyBhcmUgJ3B1c2gnLCAnZGV0YWNoZWQnIG9yICdzbGlkZScuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcHVzaFxuICAgKi9cbiAgdHJhbnNpdGlvbjogJ3B1c2gnLFxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgcGFnZSB0byBzY3JvbGwgdG8gdG9wIG9yIGJvdHRvbSBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBmb3JjZVRvOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgaXNSZXZlYWxlZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICByZXZlYWxPbjogbnVsbCxcblxuICAvKipcbiAgICogRm9yY2UgZm9jdXMgdG8gdGhlIG9mZmNhbnZhcyBvbiBvcGVuLiBJZiB0cnVlLCB3aWxsIGZvY3VzIHRoZSBvcGVuaW5nIHRyaWdnZXIgb24gY2xvc2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAvKipcbiAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcmV2ZWFsLWZvci1cbiAgICogQHRvZG8gaW1wcm92ZSB0aGUgcmVnZXggdGVzdGluZyBmb3IgdGhpcy5cbiAgICovXG4gIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB0cmFwRm9jdXM6IGZhbHNlXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J3JvbGUnOiAndGFibGlzdCd9KTtcbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogJGVsZW0ub2Zmc2V0KCkudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSwgKCkgPT4ge1xuICAgICAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XG5cbiAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgICAvL2N1cnJlbnQgY29udGV4dC1ib3VuZCBmdW5jdGlvbiB0byBvcGVuIHRhYnMgb24gcGFnZSBsb2FkIG9yIGhpc3RvcnkgcG9wc3RhdGVcbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyk7XG4gICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdFRhYigkKGFuY2hvciksIHRydWUpO1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLnRhYnMnLCBbJGxpbmssICQoYW5jaG9yKV0pO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpO1xuXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC4gQ29sbGFwc2VzIGFjdGl2ZSB0YWIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgYWN0aXZlIGNsYXNzIG9uIHRhcmdldC4gQ29sbGFwc2UgaWYgZXhpc3RzLlxuICAgICAqL1xuICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCkpIHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmFjdGl2ZUNvbGxhcHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZVRhYigkdGFyZ2V0KTtcblxuICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNvbGxhcHNlZCB0YWJzLlxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNjb2xsYXBzZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY29sbGFwc2UuemYudGFicycsIFskdGFyZ2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciAkb2xkVGFiID0gdGhpcy4kZWxlbWVudC5cbiAgICAgICAgICBmaW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfS4ke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAvL2Nsb3NlIG9sZCB0YWJcbiAgICB0aGlzLl9jb2xsYXBzZVRhYigkb2xkVGFiKTtcblxuICAgIC8vb3BlbiBuZXcgdGFiXG4gICAgdGhpcy5fb3BlblRhYigkdGFyZ2V0KTtcblxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmsgJiYgIWhpc3RvcnlIYW5kbGVkKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGFicy5cbiAgICAgKiBAZXZlbnQgVGFicyNjaGFuZ2VcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS56Zi50YWJzJywgWyR0YXJnZXQsICR0YXJnZXRDb250ZW50XSk7XG5cbiAgICAvL2ZpcmUgdG8gY2hpbGRyZW4gYSBtdXRhdGlvbiBldmVudFxuICAgICR0YXJnZXRDb250ZW50LmZpbmQoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfb3BlblRhYigkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAgICR0YXJnZXQuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKTtcblxuICAgICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICAgJHRhcmdldENvbnRlbnRcbiAgICAgICAgLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2NvbGxhcHNlVGFiKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhcmdldF9hbmNob3IgPSAkdGFyZ2V0XG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKVxuICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldF9hbmNob3IuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzZWxlY3RUYWIoZWxlbSwgaGlzdG9yeUhhbmRsZWQpIHtcbiAgICB2YXIgaWRTdHI7XG5cbiAgICBpZiAodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICBpZFN0ciA9IGVsZW1bMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkU3RyID0gZWxlbTtcbiAgICB9XG5cbiAgICBpZiAoaWRTdHIuaW5kZXhPZignIycpIDwgMCkge1xuICAgICAgaWRTdHIgPSBgIyR7aWRTdHJ9YDtcbiAgICB9XG5cbiAgICB2YXIgJHRhcmdldCA9IHRoaXMuJHRhYlRpdGxlcy5maW5kKGBbaHJlZiQ9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCk7XG4gIH07XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgZWFjaCBwYW5lbCB0byB0aGUgaGVpZ2h0IG9mIHRoZSB0YWxsZXN0IHBhbmVsLlxuICAgKiBJZiBlbmFibGVkIGluIG9wdGlvbnMsIGdldHMgY2FsbGVkIG9uIG1lZGlhIHF1ZXJ5IGNoYW5nZS5cbiAgICogSWYgbG9hZGluZyBjb250ZW50IHZpYSBleHRlcm5hbCBzb3VyY2UsIGNhbiBiZSBjYWxsZWQgZGlyZWN0bHkgb3Igd2l0aCBfcmVmbG93LlxuICAgKiBJZiBlbmFibGVkIHdpdGggYGRhdGEtbWF0Y2gtaGVpZ2h0PVwidHJ1ZVwiYCwgdGFicyBzZXRzIHRvIGVxdWFsIGhlaWdodFxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRIZWlnaHQoKSB7XG4gICAgdmFyIG1heCA9IDAsXG4gICAgICAgIF90aGlzID0gdGhpczsgLy8gTG9jayBkb3duIHRoZSBgdGhpc2AgdmFsdWUgZm9yIHRoZSByb290IHRhYnMgb2JqZWN0XG5cbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHBhbmVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGlzQWN0aXZlID0gcGFuZWwuaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApOyAvLyBnZXQgdGhlIG9wdGlvbnMgZnJvbSB0aGUgcGFyZW50IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGdldCB0aGVtIGZyb20gdGhlIGNoaWxkXG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJywgJ2Rpc3BsYXknOiAnYmxvY2snfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moe1xuICAgICAgICAgICAgJ3Zpc2liaWxpdHknOiAnJyxcbiAgICAgICAgICAgICdkaXNwbGF5JzogJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgfSlcbiAgICAgIC5jc3MoJ2hlaWdodCcsIGAke21heH1weGApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIHRhYnMuXG4gICAqIEBmaXJlcyBUYWJzI2Rlc3Ryb3llZFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKVxuICAgICAgLm9mZignLnpmLnRhYnMnKS5oaWRlKCkuZW5kKClcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmhpZGUoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIGlmICh0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICAgJCh3aW5kb3cpLm9mZignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5UYWJzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSB0YWIgcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiB0YWJcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBhY3RpdmUgcGFuZSBvbiBsb2FkIGlmIHNldCB0byB0cnVlLlxuICAgKiBOb3QgcmVjb21tZW5kZWQgaWYgbW9yZSB0aGFuIG9uZSB0YWIgcGFuZWwgcGVyIHBhZ2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3Mga2V5Ym9hcmQgaW5wdXQgdG8gJ3dyYXAnIGFyb3VuZCB0aGUgdGFiIGxpbmtzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICB3cmFwT25LZXlzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRhYiBjb250ZW50IHBhbmVzIHRvIG1hdGNoIGhlaWdodHMgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtYXRjaEhlaWdodDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBhY3RpdmUgdGFicyB0byBjb2xsYXBzZSB3aGVuIGNsaWNrZWQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhY3RpdmVDb2xsYXBzZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gYGxpYCdzIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtdGl0bGUnXG4gICAqL1xuICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGBsaWAgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgbGlua0FjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGVudCBjb250YWluZXJzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXBhbmVsJ1xuICAgKi9cbiAgcGFuZWxDbGFzczogJ3RhYnMtcGFuZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgY29udGVudCBjb250YWluZXIuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIHBhbmVsQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVGFicywgJ1RhYnMnKTtcblxufShqUXVlcnkpO1xuIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXhwb3J0cykpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDogZ2xvYmFsLkxhenlMb2FkID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcImltZ1wiLFxuICAgICAgICBjb250YWluZXI6IHdpbmRvdyxcbiAgICAgICAgdGhyZXNob2xkOiAzMDAsXG4gICAgICAgIHRocm90dGxlOiAxNTAsXG4gICAgICAgIGRhdGFfc3JjOiBcIm9yaWdpbmFsXCIsXG4gICAgICAgIGRhdGFfc3Jjc2V0OiBcIm9yaWdpbmFsLXNldFwiLFxuICAgICAgICBjbGFzc19sb2FkaW5nOiBcImxvYWRpbmdcIixcbiAgICAgICAgY2xhc3NfbG9hZGVkOiBcImxvYWRlZFwiLFxuICAgICAgICBjbGFzc19lcnJvcjogXCJlcnJvclwiLFxuICAgICAgICBjbGFzc19pbml0aWFsOiBcImluaXRpYWxcIixcbiAgICAgICAgc2tpcF9pbnZpc2libGU6IHRydWUsXG4gICAgICAgIGNhbGxiYWNrX2xvYWQ6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX2Vycm9yOiBudWxsLFxuICAgICAgICBjYWxsYmFja19zZXQ6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX3Byb2Nlc3NlZDogbnVsbFxuICAgIH07XG5cbiAgICB2YXIgaXNCb3QgPSAhKFwib25zY3JvbGxcIiBpbiB3aW5kb3cpIHx8IC9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICB2YXIgY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gY2FsbENhbGxiYWNrKGNhbGxiYWNrLCBhcmd1bWVudCkge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGFyZ3VtZW50KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0VG9wT2Zmc2V0ID0gZnVuY3Rpb24gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0IC0gZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRUb3A7XG4gICAgfTtcblxuICAgIHZhciBpc0JlbG93Vmlld3BvcnQgPSBmdW5jdGlvbiBpc0JlbG93Vmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5pbm5lckhlaWdodCArIHdpbmRvdy5wYWdlWU9mZnNldCA6IGdldFRvcE9mZnNldChjb250YWluZXIpICsgY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgcmV0dXJuIGZvbGQgPD0gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TGVmdE9mZnNldCA9IGZ1bmN0aW9uIGdldExlZnRPZmZzZXQoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0IC0gZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRMZWZ0O1xuICAgIH07XG5cbiAgICB2YXIgaXNBdFJpZ2h0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQXRSaWdodE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGRvY3VtZW50V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IGRvY3VtZW50V2lkdGggKyB3aW5kb3cucGFnZVhPZmZzZXQgOiBnZXRMZWZ0T2Zmc2V0KGNvbnRhaW5lcikgKyBkb2N1bWVudFdpZHRoO1xuICAgICAgICByZXR1cm4gZm9sZCA8PSBnZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgaXNBYm92ZVZpZXdwb3J0ID0gZnVuY3Rpb24gaXNBYm92ZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBnZXRUb3BPZmZzZXQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpICsgdGhyZXNob2xkICsgZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfTtcblxuICAgIHZhciBpc0F0TGVmdE9mVmlld3BvcnQgPSBmdW5jdGlvbiBpc0F0TGVmdE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWE9mZnNldCA6IGdldExlZnRPZmZzZXQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gZ2V0TGVmdE9mZnNldChlbGVtZW50KSArIHRocmVzaG9sZCArIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgfTtcblxuICAgIHZhciBpc0luc2lkZVZpZXdwb3J0ID0gZnVuY3Rpb24gaXNJbnNpZGVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICByZXR1cm4gIWlzQmVsb3dWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQWJvdmVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQXRSaWdodE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpICYmICFpc0F0TGVmdE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpO1xuICAgIH07XG5cbiAgICAvKiBDcmVhdGVzIGluc3RhbmNlIGFuZCBub3RpZmllcyBpdCB0aHJvdWdoIHRoZSB3aW5kb3cgZWxlbWVudCAqL1xuICAgIHZhciBjcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBjbGFzc09iaihvcHRpb25zKTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwiTGF6eUxvYWQ6OkluaXRpYWxpemVkXCIsIHsgZGV0YWlsOiB7IGluc3RhbmNlOiBpbnN0YW5jZSB9IH0pO1xuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfTtcblxuICAgIC8qIEF1dG8gaW5pdGlhbGl6YXRpb24gb2Ygb25lIG9yIG1vcmUgaW5zdGFuY2VzIG9mIGxhenlsb2FkLCBkZXBlbmRpbmcgb24gdGhlIFxuICAgICAgICBvcHRpb25zIHBhc3NlZCBpbiAocGxhaW4gb2JqZWN0IG9yIGFuIGFycmF5KSAqL1xuICAgIHZhciBhdXRvSW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGF1dG9Jbml0aWFsaXplKGNsYXNzT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcHRzTGVuZ3RoID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgICAgIGlmICghb3B0c0xlbmd0aCkge1xuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0XG4gICAgICAgICAgICBjcmVhdGVJbnN0YW5jZShjbGFzc09iaiwgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBcnJheSBvZiBvYmplY3RzXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wdHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0U291cmNlc0ZvclBpY3R1cmUgPSBmdW5jdGlvbiBzZXRTb3VyY2VzRm9yUGljdHVyZShlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSAhPT0gXCJQSUNUVVJFXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBpY3R1cmVDaGlsZCA9IHBhcmVudC5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChwaWN0dXJlQ2hpbGQudGFnTmFtZSA9PT0gXCJTT1VSQ0VcIikge1xuICAgICAgICAgICAgICAgIHZhciBzb3VyY2VTcmNzZXQgPSBwaWN0dXJlQ2hpbGQuZGF0YXNldFtzcmNzZXREYXRhQXR0cmlidXRlXTtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlU3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmVDaGlsZC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgc291cmNlU3Jjc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldFNvdXJjZXMgPSBmdW5jdGlvbiBzZXRTb3VyY2VzKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUsIHNyY0RhdGFBdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWU7XG4gICAgICAgIHZhciBlbGVtZW50U3JjID0gZWxlbWVudC5kYXRhc2V0W3NyY0RhdGFBdHRyaWJ1dGVdO1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgc2V0U291cmNlc0ZvclBpY3R1cmUoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB2YXIgaW1nU3Jjc2V0ID0gZWxlbWVudC5kYXRhc2V0W3NyY3NldERhdGFBdHRyaWJ1dGVdO1xuICAgICAgICAgICAgaWYgKGltZ1NyY3NldCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsIGltZ1NyY3NldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNyYykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRTcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcIklGUkFNRVwiKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNyYykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRTcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgZWxlbWVudFNyYyArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKi9cblxuICAgIHZhciBMYXp5TG9hZCA9IGZ1bmN0aW9uIExhenlMb2FkKGluc3RhbmNlU2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdFNldHRpbmdzLCBpbnN0YW5jZVNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5fcXVlcnlPcmlnaW5Ob2RlID0gdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cgPyBkb2N1bWVudCA6IHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lcjtcblxuICAgICAgICB0aGlzLl9wcmV2aW91c0xvb3BUaW1lID0gMDtcbiAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCA9IHRoaXMuaGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5faXNGaXJzdExvb3AgPSB0cnVlO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfTtcblxuICAgIExhenlMb2FkLnByb3RvdHlwZSA9IHtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBQcml2YXRlIG1ldGhvZHNcbiAgICAgICAgICovXG5cbiAgICAgICAgX3JldmVhbDogZnVuY3Rpb24gX3JldmVhbChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLl9zZXR0aW5ncztcblxuICAgICAgICAgICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBmdW5jdGlvbiBlcnJvckNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19lcnJvciwgZWxlbWVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgbG9hZENhbGxiYWNrID0gZnVuY3Rpb24gbG9hZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzX2xvYWRpbmcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19sb2FkZWQpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvKiBDYWxsaW5nIExPQUQgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfbG9hZCwgZWxlbWVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSBcIklNR1wiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJRlJBTUVcIikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFNvdXJjZXMoZWxlbWVudCwgc2V0dGluZ3MuZGF0YV9zcmNzZXQsIHNldHRpbmdzLmRhdGFfc3JjKTtcbiAgICAgICAgICAgIC8qIENhbGxpbmcgU0VUIGNhbGxiYWNrICovXG4gICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfc2V0LCBlbGVtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfbG9vcFRocm91Z2hFbGVtZW50czogZnVuY3Rpb24gX2xvb3BUaHJvdWdoRWxlbWVudHMoKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLl9zZXR0aW5ncyxcbiAgICAgICAgICAgICAgICBlbGVtZW50cyA9IHRoaXMuX2VsZW1lbnRzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzTGVuZ3RoID0gIWVsZW1lbnRzID8gMCA6IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZEluZGV4ZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBmaXJzdExvb3AgPSB0aGlzLl9pc0ZpcnN0TG9vcDtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8qIElmIG11c3Qgc2tpcF9pbnZpc2libGUgYW5kIGVsZW1lbnQgaXMgaW52aXNpYmxlLCBza2lwIGl0ICovXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNraXBfaW52aXNpYmxlICYmIGVsZW1lbnQub2Zmc2V0UGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc0JvdCB8fCBpc0luc2lkZVZpZXdwb3J0KGVsZW1lbnQsIHNldHRpbmdzLmNvbnRhaW5lciwgc2V0dGluZ3MudGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RMb29wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogU3RhcnQgbG9hZGluZyB0aGUgaW1hZ2UgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmV2ZWFsKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAvKiBNYXJraW5nIHRoZSBlbGVtZW50IGFzIHByb2Nlc3NlZC4gKi9cbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRhdGFzZXQud2FzUHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBSZW1vdmluZyBwcm9jZXNzZWQgZWxlbWVudHMgZnJvbSB0aGlzLl9lbGVtZW50cy4gKi9cbiAgICAgICAgICAgIHdoaWxlIChwcm9jZXNzZWRJbmRleGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zcGxpY2UocHJvY2Vzc2VkSW5kZXhlcy5wb3AoKSwgMSk7XG4gICAgICAgICAgICAgICAgLyogQ2FsbGluZyB0aGUgZW5kIGxvb3AgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfcHJvY2Vzc2VkLCBlbGVtZW50cy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogU3RvcCBsaXN0ZW5pbmcgdG8gc2Nyb2xsIGV2ZW50IHdoZW4gMCBlbGVtZW50cyByZW1haW5zICovXG4gICAgICAgICAgICBpZiAoZWxlbWVudHNMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogU2V0cyBpc0ZpcnN0TG9vcCB0byBmYWxzZSAqL1xuICAgICAgICAgICAgaWYgKGZpcnN0TG9vcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzRmlyc3RMb29wID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3B1cmdlRWxlbWVudHM6IGZ1bmN0aW9uIF9wdXJnZUVsZW1lbnRzKCkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgZWxlbWVudHNMZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBlbGVtZW50c1RvUHVyZ2UgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8qIElmIHRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkLCBza2lwIGl0ICovXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGF0YXNldC53YXNQcm9jZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNUb1B1cmdlLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogUmVtb3ZpbmcgZWxlbWVudHMgdG8gcHVyZ2UgZnJvbSB0aGlzLl9lbGVtZW50cy4gKi9cbiAgICAgICAgICAgIHdoaWxlIChlbGVtZW50c1RvUHVyZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNwbGljZShlbGVtZW50c1RvUHVyZ2UucG9wKCksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zdGFydFNjcm9sbEhhbmRsZXI6IGZ1bmN0aW9uIF9zdGFydFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzSGFuZGxpbmdTY3JvbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N0b3BTY3JvbGxIYW5kbGVyOiBmdW5jdGlvbiBfc3RvcFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogXG4gICAgICAgICAqIFB1YmxpYyBtZXRob2RzXG4gICAgICAgICAqL1xuXG4gICAgICAgIGhhbmRsZVNjcm9sbDogZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHRocm90dGxlID0gdGhpcy5fc2V0dGluZ3MudGhyb3R0bGU7XG5cbiAgICAgICAgICAgIGlmICh0aHJvdHRsZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnZXRUaW1lID0gZnVuY3Rpb24gZ2V0VGltZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm93ID0gZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVtYWluaW5nVGltZSA9IHRocm90dGxlIC0gKG5vdyAtIF90aGlzLl9wcmV2aW91c0xvb3BUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ1RpbWUgPD0gMCB8fCByZW1haW5pbmdUaW1lID4gdGhyb3R0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMuX2xvb3BUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSBub3c7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFfdGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9sb29wVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSBnZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZChfdGhpcyksIHJlbWFpbmluZ1RpbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgLy8gQ29udmVydHMgdG8gYXJyYXkgdGhlIG5vZGVzZXQgb2J0YWluZWQgcXVlcnlpbmcgdGhlIERPTSBmcm9tIF9xdWVyeU9yaWdpbk5vZGUgd2l0aCBlbGVtZW50c19zZWxlY3RvclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9xdWVyeU9yaWdpbk5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9zZXR0aW5ncy5lbGVtZW50c19zZWxlY3RvcikpO1xuICAgICAgICAgICAgdGhpcy5fcHVyZ2VFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXV0b21hdGljIGluc3RhbmNlcyBjcmVhdGlvbiBpZiByZXF1aXJlZCAodXNlZnVsIGZvciBhc3luYyBzY3JpcHQgbG9hZGluZyEpICovXG4gICAgdmFyIGF1dG9Jbml0T3B0aW9ucyA9IHdpbmRvdy5sYXp5TG9hZE9wdGlvbnM7XG4gICAgaWYgKGF1dG9Jbml0T3B0aW9ucykge1xuICAgICAgICBhdXRvSW5pdGlhbGl6ZShMYXp5TG9hZCwgYXV0b0luaXRPcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTGF6eUxvYWQ7XG59KTtcbiIsIi8qIVxuICogRmxpY2tpdHkgUEFDS0FHRUQgdjIuMC41XG4gKiBUb3VjaCwgcmVzcG9uc2l2ZSwgZmxpY2thYmxlIGNhcm91c2Vsc1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEZsaWNraXR5IENvbW1lcmNpYWwgTGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2VcbiAqXG4gKiBodHRwOi8vZmxpY2tpdHkubWV0YWZpenp5LmNvXG4gKiBDb3B5cmlnaHQgMjAxNiBNZXRhZml6enlcbiAqL1xuXG4hZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwianF1ZXJ5LWJyaWRnZXQvanF1ZXJ5LWJyaWRnZXRcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwianF1ZXJ5XCIpKTp0LmpRdWVyeUJyaWRnZXQ9ZSh0LHQualF1ZXJ5KX0od2luZG93LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gaShpLG8sYSl7ZnVuY3Rpb24gbCh0LGUsbil7dmFyIHMsbz1cIiQoKS5cIitpKycoXCInK2UrJ1wiKSc7cmV0dXJuIHQuZWFjaChmdW5jdGlvbih0LGwpe3ZhciBoPWEuZGF0YShsLGkpO2lmKCFoKXJldHVybiB2b2lkIHIoaStcIiBub3QgaW5pdGlhbGl6ZWQuIENhbm5vdCBjYWxsIG1ldGhvZHMsIGkuZS4gXCIrbyk7dmFyIGM9aFtlXTtpZighY3x8XCJfXCI9PWUuY2hhckF0KDApKXJldHVybiB2b2lkIHIobytcIiBpcyBub3QgYSB2YWxpZCBtZXRob2RcIik7dmFyIGQ9Yy5hcHBseShoLG4pO3M9dm9pZCAwPT09cz9kOnN9KSx2b2lkIDAhPT1zP3M6dH1mdW5jdGlvbiBoKHQsZSl7dC5lYWNoKGZ1bmN0aW9uKHQsbil7dmFyIHM9YS5kYXRhKG4saSk7cz8ocy5vcHRpb24oZSkscy5faW5pdCgpKToocz1uZXcgbyhuLGUpLGEuZGF0YShuLGkscykpfSl9YT1hfHxlfHx0LmpRdWVyeSxhJiYoby5wcm90b3R5cGUub3B0aW9ufHwoby5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKHQpe2EuaXNQbGFpbk9iamVjdCh0KSYmKHRoaXMub3B0aW9ucz1hLmV4dGVuZCghMCx0aGlzLm9wdGlvbnMsdCkpfSksYS5mbltpXT1mdW5jdGlvbih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9cy5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gbCh0aGlzLHQsZSl9cmV0dXJuIGgodGhpcyx0KSx0aGlzfSxuKGEpKX1mdW5jdGlvbiBuKHQpeyF0fHx0JiZ0LmJyaWRnZXR8fCh0LmJyaWRnZXQ9aSl9dmFyIHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLG89dC5jb25zb2xlLHI9XCJ1bmRlZmluZWRcIj09dHlwZW9mIG8/ZnVuY3Rpb24oKXt9OmZ1bmN0aW9uKHQpe28uZXJyb3IodCl9O3JldHVybiBuKGV8fHQualF1ZXJ5KSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuRXZFbWl0dGVyPWUoKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUub249ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt2YXIgaT10aGlzLl9ldmVudHM9dGhpcy5fZXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8W107cmV0dXJuIG4uaW5kZXhPZihlKT09LTEmJm4ucHVzaChlKSx0aGlzfX0sZS5vbmNlPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dGhpcy5vbih0LGUpO3ZhciBpPXRoaXMuX29uY2VFdmVudHM9dGhpcy5fb25jZUV2ZW50c3x8e30sbj1pW3RdPWlbdF18fHt9O3JldHVybiBuW2VdPSEwLHRoaXN9fSxlLm9mZj1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj1pLmluZGV4T2YoZSk7cmV0dXJuIG4hPS0xJiZpLnNwbGljZShuLDEpLHRoaXN9fSxlLmVtaXRFdmVudD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj0wLHM9aVtuXTtlPWV8fFtdO2Zvcih2YXIgbz10aGlzLl9vbmNlRXZlbnRzJiZ0aGlzLl9vbmNlRXZlbnRzW3RdO3M7KXt2YXIgcj1vJiZvW3NdO3ImJih0aGlzLm9mZih0LHMpLGRlbGV0ZSBvW3NdKSxzLmFwcGx5KHRoaXMsZSksbis9cj8wOjEscz1pW25dfXJldHVybiB0aGlzfX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImdldC1zaXplL2dldC1zaXplXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gZSgpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuZ2V0U2l6ZT1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dmFyIGU9cGFyc2VGbG9hdCh0KSxpPXQuaW5kZXhPZihcIiVcIik9PS0xJiYhaXNOYU4oZSk7cmV0dXJuIGkmJmV9ZnVuY3Rpb24gZSgpe31mdW5jdGlvbiBpKCl7Zm9yKHZhciB0PXt3aWR0aDowLGhlaWdodDowLGlubmVyV2lkdGg6MCxpbm5lckhlaWdodDowLG91dGVyV2lkdGg6MCxvdXRlckhlaWdodDowfSxlPTA7ZTxoO2UrKyl7dmFyIGk9bFtlXTt0W2ldPTB9cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO3JldHVybiBlfHxhKFwiU3R5bGUgcmV0dXJuZWQgXCIrZStcIi4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gU2VlIGh0dHA6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzFcIiksZX1mdW5jdGlvbiBzKCl7aWYoIWMpe2M9ITA7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLnN0eWxlLndpZHRoPVwiMjAwcHhcIixlLnN0eWxlLnBhZGRpbmc9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJvcmRlclN0eWxlPVwic29saWRcIixlLnN0eWxlLmJvcmRlcldpZHRoPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3hTaXppbmc9XCJib3JkZXItYm94XCI7dmFyIGk9ZG9jdW1lbnQuYm9keXx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O2kuYXBwZW5kQ2hpbGQoZSk7dmFyIHM9bihlKTtvLmlzQm94U2l6ZU91dGVyPXI9MjAwPT10KHMud2lkdGgpLGkucmVtb3ZlQ2hpbGQoZSl9fWZ1bmN0aW9uIG8oZSl7aWYocygpLFwic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGUpKSxlJiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZS5ub2RlVHlwZSl7dmFyIG89bihlKTtpZihcIm5vbmVcIj09by5kaXNwbGF5KXJldHVybiBpKCk7dmFyIGE9e307YS53aWR0aD1lLm9mZnNldFdpZHRoLGEuaGVpZ2h0PWUub2Zmc2V0SGVpZ2h0O2Zvcih2YXIgYz1hLmlzQm9yZGVyQm94PVwiYm9yZGVyLWJveFwiPT1vLmJveFNpemluZyxkPTA7ZDxoO2QrKyl7dmFyIHU9bFtkXSxmPW9bdV0scD1wYXJzZUZsb2F0KGYpO2FbdV09aXNOYU4ocCk/MDpwfXZhciB2PWEucGFkZGluZ0xlZnQrYS5wYWRkaW5nUmlnaHQsZz1hLnBhZGRpbmdUb3ArYS5wYWRkaW5nQm90dG9tLG09YS5tYXJnaW5MZWZ0K2EubWFyZ2luUmlnaHQseT1hLm1hcmdpblRvcCthLm1hcmdpbkJvdHRvbSxTPWEuYm9yZGVyTGVmdFdpZHRoK2EuYm9yZGVyUmlnaHRXaWR0aCxFPWEuYm9yZGVyVG9wV2lkdGgrYS5ib3JkZXJCb3R0b21XaWR0aCxiPWMmJnIseD10KG8ud2lkdGgpO3ghPT0hMSYmKGEud2lkdGg9eCsoYj8wOnYrUykpO3ZhciBDPXQoby5oZWlnaHQpO3JldHVybiBDIT09ITEmJihhLmhlaWdodD1DKyhiPzA6ZytFKSksYS5pbm5lcldpZHRoPWEud2lkdGgtKHYrUyksYS5pbm5lckhlaWdodD1hLmhlaWdodC0oZytFKSxhLm91dGVyV2lkdGg9YS53aWR0aCttLGEub3V0ZXJIZWlnaHQ9YS5oZWlnaHQreSxhfX12YXIgcixhPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBjb25zb2xlP2U6ZnVuY3Rpb24odCl7Y29uc29sZS5lcnJvcih0KX0sbD1bXCJwYWRkaW5nTGVmdFwiLFwicGFkZGluZ1JpZ2h0XCIsXCJwYWRkaW5nVG9wXCIsXCJwYWRkaW5nQm90dG9tXCIsXCJtYXJnaW5MZWZ0XCIsXCJtYXJnaW5SaWdodFwiLFwibWFyZ2luVG9wXCIsXCJtYXJnaW5Cb3R0b21cIixcImJvcmRlckxlZnRXaWR0aFwiLFwiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlckJvdHRvbVdpZHRoXCJdLGg9bC5sZW5ndGgsYz0hMTtyZXR1cm4gb30pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0Lm1hdGNoZXNTZWxlY3Rvcj1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKCl7dmFyIHQ9RWxlbWVudC5wcm90b3R5cGU7aWYodC5tYXRjaGVzKXJldHVyblwibWF0Y2hlc1wiO2lmKHQubWF0Y2hlc1NlbGVjdG9yKXJldHVyblwibWF0Y2hlc1NlbGVjdG9yXCI7Zm9yKHZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXSxpPTA7aTxlLmxlbmd0aDtpKyspe3ZhciBuPWVbaV0scz1uK1wiTWF0Y2hlc1NlbGVjdG9yXCI7aWYodFtzXSlyZXR1cm4gc319KCk7cmV0dXJuIGZ1bmN0aW9uKGUsaSl7cmV0dXJuIGVbdF0oaSl9fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZml6enktdWktdXRpbHMvdXRpbHNcIixbXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3RvclwiKSk6dC5maXp6eVVJVXRpbHM9ZSh0LHQubWF0Y2hlc1NlbGVjdG9yKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9e307aS5leHRlbmQ9ZnVuY3Rpb24odCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9LGkubW9kdWxvPWZ1bmN0aW9uKHQsZSl7cmV0dXJuKHQlZStlKSVlfSxpLm1ha2VBcnJheT1mdW5jdGlvbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKHQmJlwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9LGkucmVtb3ZlRnJvbT1mdW5jdGlvbih0LGUpe3ZhciBpPXQuaW5kZXhPZihlKTtpIT0tMSYmdC5zcGxpY2UoaSwxKX0saS5nZXRQYXJlbnQ9ZnVuY3Rpb24odCxpKXtmb3IoO3QhPWRvY3VtZW50LmJvZHk7KWlmKHQ9dC5wYXJlbnROb2RlLGUodCxpKSlyZXR1cm4gdH0saS5nZXRRdWVyeUVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0KTp0fSxpLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0saS5maWx0ZXJGaW5kRWxlbWVudHM9ZnVuY3Rpb24odCxuKXt0PWkubWFrZUFycmF5KHQpO3ZhciBzPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7aWYodCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtpZighbilyZXR1cm4gdm9pZCBzLnB1c2godCk7ZSh0LG4pJiZzLnB1c2godCk7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChuKSxvPTA7bzxpLmxlbmd0aDtvKyspcy5wdXNoKGlbb10pfX0pLHN9LGkuZGVib3VuY2VNZXRob2Q9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPXQucHJvdG90eXBlW2VdLHM9ZStcIlRpbWVvdXRcIjt0LnByb3RvdHlwZVtlXT1mdW5jdGlvbigpe3ZhciB0PXRoaXNbc107dCYmY2xlYXJUaW1lb3V0KHQpO3ZhciBlPWFyZ3VtZW50cyxvPXRoaXM7dGhpc1tzXT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5hcHBseShvLGUpLGRlbGV0ZSBvW3NdfSxpfHwxMDApfX0saS5kb2NSZWFkeT1mdW5jdGlvbih0KXt2YXIgZT1kb2N1bWVudC5yZWFkeVN0YXRlO1wiY29tcGxldGVcIj09ZXx8XCJpbnRlcmFjdGl2ZVwiPT1lP3NldFRpbWVvdXQodCk6ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIix0KX0saS50b0Rhc2hlZD1mdW5jdGlvbih0KXtyZXR1cm4gdC5yZXBsYWNlKC8oLikoW0EtWl0pL2csZnVuY3Rpb24odCxlLGkpe3JldHVybiBlK1wiLVwiK2l9KS50b0xvd2VyQ2FzZSgpfTt2YXIgbj10LmNvbnNvbGU7cmV0dXJuIGkuaHRtbEluaXQ9ZnVuY3Rpb24oZSxzKXtpLmRvY1JlYWR5KGZ1bmN0aW9uKCl7dmFyIG89aS50b0Rhc2hlZChzKSxyPVwiZGF0YS1cIitvLGE9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltcIityK1wiXVwiKSxsPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtXCIrbyksaD1pLm1ha2VBcnJheShhKS5jb25jYXQoaS5tYWtlQXJyYXkobCkpLGM9citcIi1vcHRpb25zXCIsZD10LmpRdWVyeTtoLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGksbz10LmdldEF0dHJpYnV0ZShyKXx8dC5nZXRBdHRyaWJ1dGUoYyk7dHJ5e2k9byYmSlNPTi5wYXJzZShvKX1jYXRjaChhKXtyZXR1cm4gdm9pZChuJiZuLmVycm9yKFwiRXJyb3IgcGFyc2luZyBcIityK1wiIG9uIFwiK3QuY2xhc3NOYW1lK1wiOiBcIithKSl9dmFyIGw9bmV3IGUodCxpKTtkJiZkLmRhdGEodCxzLGwpfSl9KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2NlbGxcIixbXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5DZWxsPWUodCx0LmdldFNpemUpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe3RoaXMuZWxlbWVudD10LHRoaXMucGFyZW50PWUsdGhpcy5jcmVhdGUoKX12YXIgbj1pLnByb3RvdHlwZTtyZXR1cm4gbi5jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiLHRoaXMueD0wLHRoaXMuc2hpZnQ9MH0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiXCI7dmFyIHQ9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbdF09XCJcIn0sbi5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWUodGhpcy5lbGVtZW50KX0sbi5zZXRQb3NpdGlvbj1mdW5jdGlvbih0KXt0aGlzLng9dCx0aGlzLnVwZGF0ZVRhcmdldCgpLHRoaXMucmVuZGVyUG9zaXRpb24odCl9LG4udXBkYXRlVGFyZ2V0PW4uc2V0RGVmYXVsdFRhcmdldD1mdW5jdGlvbigpe3ZhciB0PVwibGVmdFwiPT10aGlzLnBhcmVudC5vcmlnaW5TaWRlP1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5zaXplW3RdK3RoaXMuc2l6ZS53aWR0aCp0aGlzLnBhcmVudC5jZWxsQWxpZ259LG4ucmVuZGVyUG9zaXRpb249ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbZV09dGhpcy5wYXJlbnQuZ2V0UG9zaXRpb25WYWx1ZSh0KX0sbi53cmFwU2hpZnQ9ZnVuY3Rpb24odCl7dGhpcy5zaGlmdD10LHRoaXMucmVuZGVyUG9zaXRpb24odGhpcy54K3RoaXMucGFyZW50LnNsaWRlYWJsZVdpZHRoKnQpfSxuLnJlbW92ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9zbGlkZVwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LlNsaWRlPWUoKSl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy5wYXJlbnQ9dCx0aGlzLmlzT3JpZ2luTGVmdD1cImxlZnRcIj09dC5vcmlnaW5TaWRlLHRoaXMuY2VsbHM9W10sdGhpcy5vdXRlcldpZHRoPTAsdGhpcy5oZWlnaHQ9MH12YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5hZGRDZWxsPWZ1bmN0aW9uKHQpe2lmKHRoaXMuY2VsbHMucHVzaCh0KSx0aGlzLm91dGVyV2lkdGgrPXQuc2l6ZS5vdXRlcldpZHRoLHRoaXMuaGVpZ2h0PU1hdGgubWF4KHQuc2l6ZS5vdXRlckhlaWdodCx0aGlzLmhlaWdodCksMT09dGhpcy5jZWxscy5sZW5ndGgpe3RoaXMueD10Lng7dmFyIGU9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMuZmlyc3RNYXJnaW49dC5zaXplW2VdfX0sZS51cGRhdGVUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsZT10aGlzLmdldExhc3RDZWxsKCksaT1lP2Uuc2l6ZVt0XTowLG49dGhpcy5vdXRlcldpZHRoLSh0aGlzLmZpcnN0TWFyZ2luK2kpO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLmZpcnN0TWFyZ2luK24qdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxlLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LGUuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwiYWRkXCIpfSxlLnVuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpfSxlLmNoYW5nZVNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuZWxlbWVudC5jbGFzc0xpc3RbdF0oXCJpcy1zZWxlY3RlZFwiKX0pfSxlLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hbmltYXRlXCIsW1wiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZT1lKHQsdC5maXp6eVVJVXRpbHMpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHQud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lLG49MDtpfHwoaT1mdW5jdGlvbih0KXt2YXIgZT0obmV3IERhdGUpLmdldFRpbWUoKSxpPU1hdGgubWF4KDAsMTYtKGUtbikpLHM9c2V0VGltZW91dCh0LGkpO3JldHVybiBuPWUraSxzfSk7dmFyIHM9e307cy5zdGFydEFuaW1hdGlvbj1mdW5jdGlvbigpe3RoaXMuaXNBbmltYXRpbmd8fCh0aGlzLmlzQW5pbWF0aW5nPSEwLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMuYW5pbWF0ZSgpKX0scy5hbmltYXRlPWZ1bmN0aW9uKCl7dGhpcy5hcHBseURyYWdGb3JjZSgpLHRoaXMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24oKTt2YXIgdD10aGlzLng7aWYodGhpcy5pbnRlZ3JhdGVQaHlzaWNzKCksdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuc2V0dGxlKHQpLHRoaXMuaXNBbmltYXRpbmcpe3ZhciBlPXRoaXM7aShmdW5jdGlvbigpe2UuYW5pbWF0ZSgpfSl9fTt2YXIgbz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdC50cmFuc2Zvcm0/XCJ0cmFuc2Zvcm1cIjpcIldlYmtpdFRyYW5zZm9ybVwifSgpO3JldHVybiBzLnBvc2l0aW9uU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy54O3RoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aD4xJiYodD1lLm1vZHVsbyh0LHRoaXMuc2xpZGVhYmxlV2lkdGgpLHQtPXRoaXMuc2xpZGVhYmxlV2lkdGgsdGhpcy5zaGlmdFdyYXBDZWxscyh0KSksdCs9dGhpcy5jdXJzb3JQb3NpdGlvbix0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmbz8tdDp0O3ZhciBpPXRoaXMuZ2V0UG9zaXRpb25WYWx1ZSh0KTt0aGlzLnNsaWRlci5zdHlsZVtvXT10aGlzLmlzQW5pbWF0aW5nP1widHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCI6XCJ0cmFuc2xhdGVYKFwiK2krXCIpXCI7dmFyIG49dGhpcy5zbGlkZXNbMF07aWYobil7dmFyIHM9LXRoaXMueC1uLnRhcmdldCxyPXMvdGhpcy5zbGlkZXNXaWR0aDt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzY3JvbGxcIixudWxsLFtyLHNdKX19LHMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5jZWxscy5sZW5ndGgmJih0aGlzLng9LXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQsdGhpcy5wb3NpdGlvblNsaWRlcigpKX0scy5nZXRQb3NpdGlvblZhbHVlPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLm9wdGlvbnMucGVyY2VudFBvc2l0aW9uPy4wMSpNYXRoLnJvdW5kKHQvdGhpcy5zaXplLmlubmVyV2lkdGgqMWU0KStcIiVcIjpNYXRoLnJvdW5kKHQpK1wicHhcIn0scy5zZXR0bGU9ZnVuY3Rpb24odCl7dGhpcy5pc1BvaW50ZXJEb3dufHxNYXRoLnJvdW5kKDEwMCp0aGlzLngpIT1NYXRoLnJvdW5kKDEwMCp0KXx8dGhpcy5yZXN0aW5nRnJhbWVzKyssdGhpcy5yZXN0aW5nRnJhbWVzPjImJih0aGlzLmlzQW5pbWF0aW5nPSExLGRlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZyx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2V0dGxlXCIpKX0scy5zaGlmdFdyYXBDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmN1cnNvclBvc2l0aW9uK3Q7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMsZSwtMSk7dmFyIGk9dGhpcy5zaXplLmlubmVyV2lkdGgtKHQrdGhpcy5zbGlkZWFibGVXaWR0aCt0aGlzLmN1cnNvclBvc2l0aW9uKTt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzLGksMSl9LHMuX3NoaWZ0Q2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcz10W25dLG89ZT4wP2k6MDtzLndyYXBTaGlmdChvKSxlLT1zLnNpemUub3V0ZXJXaWR0aH19LHMuX3Vuc2hpZnRDZWxscz1mdW5jdGlvbih0KXtpZih0JiZ0Lmxlbmd0aClmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl0W2VdLndyYXBTaGlmdCgwKX0scy5pbnRlZ3JhdGVQaHlzaWNzPWZ1bmN0aW9uKCl7dGhpcy54Kz10aGlzLnZlbG9jaXR5LHRoaXMudmVsb2NpdHkqPXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKX0scy5hcHBseUZvcmNlPWZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkrPXR9LHMuZ2V0RnJpY3Rpb25GYWN0b3I9ZnVuY3Rpb24oKXtyZXR1cm4gMS10aGlzLm9wdGlvbnNbdGhpcy5pc0ZyZWVTY3JvbGxpbmc/XCJmcmVlU2Nyb2xsRnJpY3Rpb25cIjpcImZyaWN0aW9uXCJdfSxzLmdldFJlc3RpbmdQb3NpdGlvbj1mdW5jdGlvbigpe3JldHVybiB0aGlzLngrdGhpcy52ZWxvY2l0eS8oMS10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCkpfSxzLmFwcGx5RHJhZ0ZvcmNlPWZ1bmN0aW9uKCl7aWYodGhpcy5pc1BvaW50ZXJEb3duKXt2YXIgdD10aGlzLmRyYWdYLXRoaXMueCxlPXQtdGhpcy52ZWxvY2l0eTt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNQb2ludGVyRG93biYmIXRoaXMuaXNGcmVlU2Nyb2xsaW5nJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCotMS10aGlzLngsZT10KnRoaXMub3B0aW9ucy5zZWxlY3RlZEF0dHJhY3Rpb247dGhpcy5hcHBseUZvcmNlKGUpfX0sc30pLGZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShcImZsaWNraXR5L2pzL2ZsaWNraXR5XCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vY2VsbFwiLFwiLi9zbGlkZVwiLFwiLi9hbmltYXRlXCJdLGZ1bmN0aW9uKGksbixzLG8scixhKXtyZXR1cm4gZSh0LGksbixzLG8scixhKX0pO2Vsc2UgaWYoXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vY2VsbFwiKSxyZXF1aXJlKFwiLi9zbGlkZVwiKSxyZXF1aXJlKFwiLi9hbmltYXRlXCIpKTtlbHNle3ZhciBpPXQuRmxpY2tpdHk7dC5GbGlja2l0eT1lKHQsdC5FdkVtaXR0ZXIsdC5nZXRTaXplLHQuZml6enlVSVV0aWxzLGkuQ2VsbCxpLlNsaWRlLGkuYW5pbWF0ZVByb3RvdHlwZSl9fSh3aW5kb3csZnVuY3Rpb24odCxlLGksbixzLG8scil7ZnVuY3Rpb24gYSh0LGUpe2Zvcih0PW4ubWFrZUFycmF5KHQpO3QubGVuZ3RoOyllLmFwcGVuZENoaWxkKHQuc2hpZnQoKSl9ZnVuY3Rpb24gbCh0LGUpe3ZhciBpPW4uZ2V0UXVlcnlFbGVtZW50KHQpO2lmKCFpKXJldHVybiB2b2lkKGQmJmQuZXJyb3IoXCJCYWQgZWxlbWVudCBmb3IgRmxpY2tpdHk6IFwiKyhpfHx0KSkpO2lmKHRoaXMuZWxlbWVudD1pLHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQpe3ZhciBzPWZbdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRF07cmV0dXJuIHMub3B0aW9uKGUpLHN9aCYmKHRoaXMuJGVsZW1lbnQ9aCh0aGlzLmVsZW1lbnQpKSx0aGlzLm9wdGlvbnM9bi5leHRlbmQoe30sdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyksdGhpcy5vcHRpb24oZSksdGhpcy5fY3JlYXRlKCl9dmFyIGg9dC5qUXVlcnksYz10LmdldENvbXB1dGVkU3R5bGUsZD10LmNvbnNvbGUsdT0wLGY9e307bC5kZWZhdWx0cz17YWNjZXNzaWJpbGl0eTohMCxjZWxsQWxpZ246XCJjZW50ZXJcIixmcmVlU2Nyb2xsRnJpY3Rpb246LjA3NSxmcmljdGlvbjouMjgsbmFtZXNwYWNlSlF1ZXJ5RXZlbnRzOiEwLHBlcmNlbnRQb3NpdGlvbjohMCxyZXNpemU6ITAsc2VsZWN0ZWRBdHRyYWN0aW9uOi4wMjUsc2V0R2FsbGVyeVNpemU6ITB9LGwuY3JlYXRlTWV0aG9kcz1bXTt2YXIgcD1sLnByb3RvdHlwZTtuLmV4dGVuZChwLGUucHJvdG90eXBlKSxwLl9jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmd1aWQ9Kyt1O3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQ9ZSxmW2VdPXRoaXMsdGhpcy5zZWxlY3RlZEluZGV4PTAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy54PTAsdGhpcy52ZWxvY2l0eT0wLHRoaXMub3JpZ2luU2lkZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJyaWdodFwiOlwibGVmdFwiLHRoaXMudmlld3BvcnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLnZpZXdwb3J0LmNsYXNzTmFtZT1cImZsaWNraXR5LXZpZXdwb3J0XCIsdGhpcy5fY3JlYXRlU2xpZGVyKCksKHRoaXMub3B0aW9ucy5yZXNpemV8fHRoaXMub3B0aW9ucy53YXRjaENTUykmJnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLGwuY3JlYXRlTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXNbdF0oKX0sdGhpcyksdGhpcy5vcHRpb25zLndhdGNoQ1NTP3RoaXMud2F0Y2hDU1MoKTp0aGlzLmFjdGl2YXRlKCl9LHAub3B0aW9uPWZ1bmN0aW9uKHQpe24uZXh0ZW5kKHRoaXMub3B0aW9ucyx0KX0scC5hY3RpdmF0ZT1mdW5jdGlvbigpe2lmKCF0aGlzLmlzQWN0aXZlKXt0aGlzLmlzQWN0aXZlPSEwLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJnRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuZ2V0U2l6ZSgpO3ZhciB0PXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModGhpcy5lbGVtZW50LmNoaWxkcmVuKTthKHQsdGhpcy5zbGlkZXIpLHRoaXMudmlld3BvcnQuYXBwZW5kQ2hpbGQodGhpcy5zbGlkZXIpLHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXdwb3J0KSx0aGlzLnJlbG9hZENlbGxzKCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQudGFiSW5kZXg9MCx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5lbWl0RXZlbnQoXCJhY3RpdmF0ZVwiKTt2YXIgZSxpPXRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7ZT10aGlzLmlzSW5pdEFjdGl2YXRlZD90aGlzLnNlbGVjdGVkSW5kZXg6dm9pZCAwIT09aSYmdGhpcy5jZWxsc1tpXT9pOjAsdGhpcy5zZWxlY3QoZSwhMSwhMCksdGhpcy5pc0luaXRBY3RpdmF0ZWQ9ITB9fSxwLl9jcmVhdGVTbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3QuY2xhc3NOYW1lPVwiZmxpY2tpdHktc2xpZGVyXCIsdC5zdHlsZVt0aGlzLm9yaWdpblNpZGVdPTAsdGhpcy5zbGlkZXI9dH0scC5fZmlsdGVyRmluZENlbGxFbGVtZW50cz1mdW5jdGlvbih0KXtyZXR1cm4gbi5maWx0ZXJGaW5kRWxlbWVudHModCx0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yKX0scC5yZWxvYWRDZWxscz1mdW5jdGlvbigpe3RoaXMuY2VsbHM9dGhpcy5fbWFrZUNlbGxzKHRoaXMuc2xpZGVyLmNoaWxkcmVuKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKX0scC5fbWFrZUNlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModCksaT1lLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gbmV3IHModCx0aGlzKX0sdGhpcyk7cmV0dXJuIGl9LHAuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0scC5nZXRMYXN0U2xpZGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zbGlkZXNbdGhpcy5zbGlkZXMubGVuZ3RoLTFdfSxwLnBvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLl9zaXplQ2VsbHModGhpcy5jZWxscyksdGhpcy5fcG9zaXRpb25DZWxscygwKX0scC5fcG9zaXRpb25DZWxscz1mdW5jdGlvbih0KXt0PXR8fDAsdGhpcy5tYXhDZWxsSGVpZ2h0PXQ/dGhpcy5tYXhDZWxsSGVpZ2h0fHwwOjA7dmFyIGU9MDtpZih0PjApe3ZhciBpPXRoaXMuY2VsbHNbdC0xXTtlPWkueCtpLnNpemUub3V0ZXJXaWR0aH1mb3IodmFyIG49dGhpcy5jZWxscy5sZW5ndGgscz10O3M8bjtzKyspe3ZhciBvPXRoaXMuY2VsbHNbc107by5zZXRQb3NpdGlvbihlKSxlKz1vLnNpemUub3V0ZXJXaWR0aCx0aGlzLm1heENlbGxIZWlnaHQ9TWF0aC5tYXgoby5zaXplLm91dGVySGVpZ2h0LHRoaXMubWF4Q2VsbEhlaWdodCl9dGhpcy5zbGlkZWFibGVXaWR0aD1lLHRoaXMudXBkYXRlU2xpZGVzKCksdGhpcy5fY29udGFpblNsaWRlcygpLHRoaXMuc2xpZGVzV2lkdGg9bj90aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldC10aGlzLnNsaWRlc1swXS50YXJnZXQ6MH0scC5fc2l6ZUNlbGxzPWZ1bmN0aW9uKHQpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt0LmdldFNpemUoKX0pfSxwLnVwZGF0ZVNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMuc2xpZGVzPVtdLHRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD1uZXcgbyh0aGlzKTt0aGlzLnNsaWRlcy5wdXNoKHQpO3ZhciBlPVwibGVmdFwiPT10aGlzLm9yaWdpblNpZGUsaT1lP1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixuPXRoaXMuX2dldENhbkNlbGxGaXQoKTt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSxzKXtpZighdC5jZWxscy5sZW5ndGgpcmV0dXJuIHZvaWQgdC5hZGRDZWxsKGUpO3ZhciByPXQub3V0ZXJXaWR0aC10LmZpcnN0TWFyZ2luKyhlLnNpemUub3V0ZXJXaWR0aC1lLnNpemVbaV0pO24uY2FsbCh0aGlzLHMscik/dC5hZGRDZWxsKGUpOih0LnVwZGF0ZVRhcmdldCgpLHQ9bmV3IG8odGhpcyksdGhpcy5zbGlkZXMucHVzaCh0KSx0LmFkZENlbGwoZSkpfSx0aGlzKSx0LnVwZGF0ZVRhcmdldCgpLHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpfX0scC5fZ2V0Q2FuQ2VsbEZpdD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5ncm91cENlbGxzO2lmKCF0KXJldHVybiBmdW5jdGlvbigpe3JldHVybiExfTtpZihcIm51bWJlclwiPT10eXBlb2YgdCl7dmFyIGU9cGFyc2VJbnQodCwxMCk7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0JWUhPT0wfX12YXIgaT1cInN0cmluZ1wiPT10eXBlb2YgdCYmdC5tYXRjaCgvXihcXGQrKSUkLyksbj1pP3BhcnNlSW50KGlbMV0sMTApLzEwMDoxO3JldHVybiBmdW5jdGlvbih0LGUpe3JldHVybiBlPD0odGhpcy5zaXplLmlubmVyV2lkdGgrMSkqbn19LHAuX2luaXQ9cC5yZXBvc2l0aW9uPWZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX0scC5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWkodGhpcy5lbGVtZW50KSx0aGlzLnNldENlbGxBbGlnbigpLHRoaXMuY3Vyc29yUG9zaXRpb249dGhpcy5zaXplLmlubmVyV2lkdGgqdGhpcy5jZWxsQWxpZ259O3ZhciB2PXtjZW50ZXI6e2xlZnQ6LjUscmlnaHQ6LjV9LGxlZnQ6e2xlZnQ6MCxyaWdodDoxfSxyaWdodDp7cmlnaHQ6MCxsZWZ0OjF9fTtyZXR1cm4gcC5zZXRDZWxsQWxpZ249ZnVuY3Rpb24oKXt2YXIgdD12W3RoaXMub3B0aW9ucy5jZWxsQWxpZ25dO3RoaXMuY2VsbEFsaWduPXQ/dFt0aGlzLm9yaWdpblNpZGVdOnRoaXMub3B0aW9ucy5jZWxsQWxpZ259LHAuc2V0R2FsbGVyeVNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUpe3ZhciB0PXRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZWxlY3RlZFNsaWRlP3RoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQ6dGhpcy5tYXhDZWxsSGVpZ2h0O3RoaXMudmlld3BvcnQuc3R5bGUuaGVpZ2h0PXQrXCJweFwifX0scC5fZ2V0V3JhcFNoaWZ0Q2VsbHM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyksdGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzKTt2YXIgdD10aGlzLmN1cnNvclBvc2l0aW9uLGU9dGhpcy5jZWxscy5sZW5ndGgtMTt0aGlzLmJlZm9yZVNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCxlLC0xKSx0PXRoaXMuc2l6ZS5pbm5lcldpZHRoLXRoaXMuY3Vyc29yUG9zaXRpb24sdGhpcy5hZnRlclNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCwwLDEpfX0scC5fZ2V0R2FwQ2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj1bXTt0PjA7KXt2YXIgcz10aGlzLmNlbGxzW2VdO2lmKCFzKWJyZWFrO24ucHVzaChzKSxlKz1pLHQtPXMuc2l6ZS5vdXRlcldpZHRofXJldHVybiBufSxwLl9jb250YWluU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCxlPXQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGk9dD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCIsbj10aGlzLnNsaWRlYWJsZVdpZHRoLXRoaXMuZ2V0TGFzdENlbGwoKS5zaXplW2ldLHM9bjx0aGlzLnNpemUuaW5uZXJXaWR0aCxvPXRoaXMuY3Vyc29yUG9zaXRpb24rdGhpcy5jZWxsc1swXS5zaXplW2VdLHI9bi10aGlzLnNpemUuaW5uZXJXaWR0aCooMS10aGlzLmNlbGxBbGlnbik7dGhpcy5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbih0KXtzP3QudGFyZ2V0PW4qdGhpcy5jZWxsQWxpZ246KHQudGFyZ2V0PU1hdGgubWF4KHQudGFyZ2V0LG8pLHQudGFyZ2V0PU1hdGgubWluKHQudGFyZ2V0LHIpKX0sdGhpcyl9fSxwLmRpc3BhdGNoRXZlbnQ9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPWU/W2VdLmNvbmNhdChpKTppO2lmKHRoaXMuZW1pdEV2ZW50KHQsbiksaCYmdGhpcy4kZWxlbWVudCl7dCs9dGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cz9cIi5mbGlja2l0eVwiOlwiXCI7dmFyIHM9dDtpZihlKXt2YXIgbz1oLkV2ZW50KGUpO28udHlwZT10LHM9b310aGlzLiRlbGVtZW50LnRyaWdnZXIocyxpKX19LHAuc2VsZWN0PWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzQWN0aXZlJiYodD1wYXJzZUludCh0LDEwKSx0aGlzLl93cmFwU2VsZWN0KHQpLCh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZHx8ZSkmJih0PW4ubW9kdWxvKHQsdGhpcy5zbGlkZXMubGVuZ3RoKSksdGhpcy5zbGlkZXNbdF0mJih0aGlzLnNlbGVjdGVkSW5kZXg9dCx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKSxpP3RoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk6dGhpcy5zdGFydEFuaW1hdGlvbigpLHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNlbGVjdFwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJjZWxsU2VsZWN0XCIpKSl9LHAuX3dyYXBTZWxlY3Q9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5zbGlkZXMubGVuZ3RoLGk9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmU+MTtpZighaSlyZXR1cm4gdDt2YXIgcz1uLm1vZHVsbyh0LGUpLG89TWF0aC5hYnMocy10aGlzLnNlbGVjdGVkSW5kZXgpLHI9TWF0aC5hYnMocytlLXRoaXMuc2VsZWN0ZWRJbmRleCksYT1NYXRoLmFicyhzLWUtdGhpcy5zZWxlY3RlZEluZGV4KTshdGhpcy5pc0RyYWdTZWxlY3QmJnI8bz90Kz1lOiF0aGlzLmlzRHJhZ1NlbGVjdCYmYTxvJiYodC09ZSksdDwwP3RoaXMueC09dGhpcy5zbGlkZWFibGVXaWR0aDp0Pj1lJiYodGhpcy54Kz10aGlzLnNsaWRlYWJsZVdpZHRoKX0scC5wcmV2aW91cz1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleC0xLHQsZSl9LHAubmV4dD1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCsxLHQsZSl9LHAudXBkYXRlU2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuc2xpZGVzW3RoaXMuc2VsZWN0ZWRJbmRleF07dCYmKHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5zZWxlY3RlZFNsaWRlPXQsdC5zZWxlY3QoKSx0aGlzLnNlbGVjdGVkQ2VsbHM9dC5jZWxscyx0aGlzLnNlbGVjdGVkRWxlbWVudHM9dC5nZXRDZWxsRWxlbWVudHMoKSx0aGlzLnNlbGVjdGVkQ2VsbD10LmNlbGxzWzBdLHRoaXMuc2VsZWN0ZWRFbGVtZW50PXRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXSl9LHAudW5zZWxlY3RTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZFNsaWRlJiZ0aGlzLnNlbGVjdGVkU2xpZGUudW5zZWxlY3QoKX0scC5zZWxlY3RDZWxsPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbjtcIm51bWJlclwiPT10eXBlb2YgdD9uPXRoaXMuY2VsbHNbdF06KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD10aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0KSksbj10aGlzLmdldENlbGwodCkpO2Zvcih2YXIgcz0wO24mJnM8dGhpcy5zbGlkZXMubGVuZ3RoO3MrKyl7dmFyIG89dGhpcy5zbGlkZXNbc10scj1vLmNlbGxzLmluZGV4T2Yobik7aWYociE9LTEpcmV0dXJuIHZvaWQgdGhpcy5zZWxlY3QocyxlLGkpfX0scC5nZXRDZWxsPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5jZWxscy5sZW5ndGg7ZSsrKXt2YXIgaT10aGlzLmNlbGxzW2VdO2lmKGkuZWxlbWVudD09dClyZXR1cm4gaX19LHAuZ2V0Q2VsbHM9ZnVuY3Rpb24odCl7dD1uLm1ha2VBcnJheSh0KTt2YXIgZT1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpPXRoaXMuZ2V0Q2VsbCh0KTtpJiZlLnB1c2goaSl9LHRoaXMpLGV9LHAuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0scC5nZXRQYXJlbnRDZWxsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtyZXR1cm4gZT9lOih0PW4uZ2V0UGFyZW50KHQsXCIuZmxpY2tpdHktc2xpZGVyID4gKlwiKSx0aGlzLmdldENlbGwodCkpfSxwLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQsZSl7aWYoIXQpcmV0dXJuIHRoaXMuc2VsZWN0ZWRTbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtlPXZvaWQgMD09PWU/dGhpcy5zZWxlY3RlZEluZGV4OmU7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoO2lmKDErMip0Pj1pKXJldHVybiB0aGlzLmdldENlbGxFbGVtZW50cygpO2Zvcih2YXIgcz1bXSxvPWUtdDtvPD1lK3Q7bysrKXt2YXIgcj10aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9uLm1vZHVsbyhvLGkpOm8sYT10aGlzLnNsaWRlc1tyXTthJiYocz1zLmNvbmNhdChhLmdldENlbGxFbGVtZW50cygpKSl9cmV0dXJuIHN9LHAudWlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLmVtaXRFdmVudChcInVpQ2hhbmdlXCIpfSxwLmNoaWxkVUlQb2ludGVyRG93bj1mdW5jdGlvbih0KXt0aGlzLmVtaXRFdmVudChcImNoaWxkVUlQb2ludGVyRG93blwiLFt0XSl9LHAub25yZXNpemU9ZnVuY3Rpb24oKXt0aGlzLndhdGNoQ1NTKCksdGhpcy5yZXNpemUoKX0sbi5kZWJvdW5jZU1ldGhvZChsLFwib25yZXNpemVcIiwxNTApLHAucmVzaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0FjdGl2ZSl7dGhpcy5nZXRTaXplKCksdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJih0aGlzLng9bi5tb2R1bG8odGhpcy54LHRoaXMuc2xpZGVhYmxlV2lkdGgpKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcInJlc2l6ZVwiKTt2YXIgdD10aGlzLnNlbGVjdGVkRWxlbWVudHMmJnRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXTt0aGlzLnNlbGVjdENlbGwodCwhMSwhMCl9fSxwLndhdGNoQ1NTPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLndhdGNoQ1NTO2lmKHQpe3ZhciBlPWModGhpcy5lbGVtZW50LFwiOmFmdGVyXCIpLmNvbnRlbnQ7ZS5pbmRleE9mKFwiZmxpY2tpdHlcIikhPS0xP3RoaXMuYWN0aXZhdGUoKTp0aGlzLmRlYWN0aXZhdGUoKX19LHAub25rZXlkb3duPWZ1bmN0aW9uKHQpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYoIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnR8fGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PXRoaXMuZWxlbWVudCkpaWYoMzc9PXQua2V5Q29kZSl7dmFyIGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wibmV4dFwiOlwicHJldmlvdXNcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tlXSgpfWVsc2UgaWYoMzk9PXQua2V5Q29kZSl7dmFyIGk9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tpXSgpfX0scC5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0FjdGl2ZSYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24odCl7dC5kZXN0cm95KCl9KSx0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnZpZXdwb3J0KSxhKHRoaXMuc2xpZGVyLmNoaWxkcmVuLHRoaXMuZWxlbWVudCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwidGFiSW5kZXhcIiksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuaXNBY3RpdmU9ITEsdGhpcy5lbWl0RXZlbnQoXCJkZWFjdGl2YXRlXCIpKX0scC5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksdGhpcy5lbWl0RXZlbnQoXCJkZXN0cm95XCIpLGgmJnRoaXMuJGVsZW1lbnQmJmgucmVtb3ZlRGF0YSh0aGlzLmVsZW1lbnQsXCJmbGlja2l0eVwiKSxkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCxkZWxldGUgZlt0aGlzLmd1aWRdfSxuLmV4dGVuZChwLHIpLGwuZGF0YT1mdW5jdGlvbih0KXt0PW4uZ2V0UXVlcnlFbGVtZW50KHQpO3ZhciBlPXQmJnQuZmxpY2tpdHlHVUlEO3JldHVybiBlJiZmW2VdfSxuLmh0bWxJbml0KGwsXCJmbGlja2l0eVwiKSxoJiZoLmJyaWRnZXQmJmguYnJpZGdldChcImZsaWNraXR5XCIsbCksbC5DZWxsPXMsbH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LlVuaXBvaW50ZXI9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCl9LHMudW5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCExKX0scy5fYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24oZSxpKXtpPXZvaWQgMD09PWl8fCEhaTt2YXIgbj1pP1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiO3QubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkP2Vbbl0oXCJwb2ludGVyZG93blwiLHRoaXMpOnQubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQ/ZVtuXShcIk1TUG9pbnRlckRvd25cIix0aGlzKTooZVtuXShcIm1vdXNlZG93blwiLHRoaXMpLGVbbl0oXCJ0b3VjaHN0YXJ0XCIsdGhpcykpfSxzLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0scy5nZXRUb3VjaD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl7dmFyIGk9dFtlXTtpZihpLmlkZW50aWZpZXI9PXRoaXMucG9pbnRlcklkZW50aWZpZXIpcmV0dXJuIGl9fSxzLm9ubW91c2Vkb3duPWZ1bmN0aW9uKHQpe3ZhciBlPXQuYnV0dG9uO2UmJjAhPT1lJiYxIT09ZXx8dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5vbnRvdWNoc3RhcnQ9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0LmNoYW5nZWRUb3VjaGVzWzBdKX0scy5vbk1TUG9pbnRlckRvd249cy5vbnBvaW50ZXJkb3duPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMuX3BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc1BvaW50ZXJEb3dufHwodGhpcy5pc1BvaW50ZXJEb3duPSEwLHRoaXMucG9pbnRlcklkZW50aWZpZXI9dm9pZCAwIT09ZS5wb2ludGVySWQ/ZS5wb2ludGVySWQ6ZS5pZGVudGlmaWVyLHRoaXMucG9pbnRlckRvd24odCxlKSl9LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9O3ZhciBvPXttb3VzZWRvd246W1wibW91c2Vtb3ZlXCIsXCJtb3VzZXVwXCJdLHRvdWNoc3RhcnQ6W1widG91Y2htb3ZlXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hjYW5jZWxcIl0scG9pbnRlcmRvd246W1wicG9pbnRlcm1vdmVcIixcInBvaW50ZXJ1cFwiLFwicG9pbnRlcmNhbmNlbFwiXSxNU1BvaW50ZXJEb3duOltcIk1TUG9pbnRlck1vdmVcIixcIk1TUG9pbnRlclVwXCIsXCJNU1BvaW50ZXJDYW5jZWxcIl19O3JldHVybiBzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKGUpe2lmKGUpe3ZhciBpPW9bZS50eXBlXTtpLmZvckVhY2goZnVuY3Rpb24oZSl7dC5hZGRFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cz1pfX0scy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5fYm91bmRQb2ludGVyRXZlbnRzJiYodGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7dC5yZW1vdmVFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLGRlbGV0ZSB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMpfSxzLm9ubW91c2Vtb3ZlPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub25NU1BvaW50ZXJNb3ZlPXMub25wb2ludGVybW92ZT1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbnRvdWNobW92ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJNb3ZlKHQsZSl9LHMuX3BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5wb2ludGVyTW92ZSh0LGUpfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGVdKX0scy5vbm1vdXNldXA9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub25NU1BvaW50ZXJVcD1zLm9ucG9pbnRlcnVwPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbnRvdWNoZW5kPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlclVwKHQsZSl9LHMuX3BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyVXAodCxlKX0scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKX0scy5fcG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0aGlzLmlzUG9pbnRlckRvd249ITEsZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXIsdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCksdGhpcy5wb2ludGVyRG9uZSgpfSxzLnBvaW50ZXJEb25lPWkscy5vbk1TUG9pbnRlckNhbmNlbD1zLm9ucG9pbnRlcmNhbmNlbD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LHQpfSxzLm9udG91Y2hjYW5jZWw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsZSl9LHMuX3BvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlckNhbmNlbCh0LGUpfSxzLnBvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJDYW5jZWxcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWZ1bmN0aW9uKHQpe3JldHVybnt4OnQucGFnZVgseTp0LnBhZ2VZfX0sbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlVuaWRyYWdnZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITApfSxzLnVuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMSl9O3ZhciBvPXQubmF2aWdhdG9yO3JldHVybiBzLl9iaW5kSGFuZGxlcz1mdW5jdGlvbih0KXt0PXZvaWQgMD09PXR8fCEhdDt2YXIgZTtlPW8ucG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS50b3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Om8ubXNQb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLm1zVG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTppO2Zvcih2YXIgbj10P1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiLHM9MDtzPHRoaXMuaGFuZGxlcy5sZW5ndGg7cysrKXt2YXIgcj10aGlzLmhhbmRsZXNbc107dGhpcy5fYmluZFN0YXJ0RXZlbnQocix0KSxlKHIpLHJbbl0oXCJjbGlja1wiLHRoaXMpfX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe2lmKFwiSU5QVVRcIj09dC50YXJnZXQubm9kZU5hbWUmJlwicmFuZ2VcIj09dC50YXJnZXQudHlwZSlyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKHQsZSk7dmFyIGk9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtpJiZpLmJsdXImJmkuYmx1cigpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX0scy5fZHJhZ1BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsaSl7dGhpcy5wb2ludGVyRG93blBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpO3ZhciBuPXRoaXMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duKHQsaSk7biYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXtyZXR1cm5cIlNFTEVDVFwiIT10LnRhcmdldC5ub2RlTmFtZX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LHMuX2RyYWdQb2ludGVyTW92ZT1mdW5jdGlvbih0LGkpe3ZhciBuPWUuZ2V0UG9pbnRlclBvaW50KGkpLHM9e3g6bi54LXRoaXMucG9pbnRlckRvd25Qb2ludC54LHk6bi55LXRoaXMucG9pbnRlckRvd25Qb2ludC55fTtyZXR1cm4hdGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmhhc0RyYWdTdGFydGVkKHMpJiZ0aGlzLl9kcmFnU3RhcnQodCxpKSxzfSxzLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPjN8fE1hdGguYWJzKHQueSk+M30scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LHMuX2RyYWdQb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc/dGhpcy5fZHJhZ0VuZCh0LGUpOnRoaXMuX3N0YXRpY0NsaWNrKHQsZSl9LHMuX2RyYWdTdGFydD1mdW5jdGlvbih0LGkpe3RoaXMuaXNEcmFnZ2luZz0hMCx0aGlzLmRyYWdTdGFydFBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpLHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzPSEwLHRoaXMuZHJhZ1N0YXJ0KHQsaSl9LHMuZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnU3RhcnRcIixbdCxlXSl9LHMuX2RyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuZHJhZ01vdmUodCxlLGkpfSxzLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5lbWl0RXZlbnQoXCJkcmFnTW92ZVwiLFt0LGUsaV0pfSxzLl9kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nPSExLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3N9LmJpbmQodGhpcykpLHRoaXMuZHJhZ0VuZCh0LGUpfSxzLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdFbmRcIixbdCxlXSl9LHMub25jbGljaz1mdW5jdGlvbih0KXt0aGlzLmlzUHJldmVudGluZ0NsaWNrcyYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLl9zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9dC50eXBlKXt2YXIgaT10LnRhcmdldC5ub2RlTmFtZTtcIklOUFVUXCIhPWkmJlwiVEVYVEFSRUFcIiE9aXx8dC50YXJnZXQuZm9jdXMoKSx0aGlzLnN0YXRpY0NsaWNrKHQsZSksXCJtb3VzZXVwXCIhPXQudHlwZSYmKHRoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITAsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzSWdub3JpbmdNb3VzZVVwfS5iaW5kKHRoaXMpLDQwMCkpfX0scy5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwic3RhdGljQ2xpY2tcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWUuZ2V0UG9pbnRlclBvaW50LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9kcmFnXCIsW1wiLi9mbGlja2l0eVwiLFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInVuaWRyYWdnZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuVW5pZHJhZ2dlcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKCl7cmV0dXJue3g6dC5wYWdlWE9mZnNldCx5OnQucGFnZVlPZmZzZXR9fW4uZXh0ZW5kKGUuZGVmYXVsdHMse2RyYWdnYWJsZTohMCxkcmFnVGhyZXNob2xkOjN9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVEcmFnXCIpO3ZhciBvPWUucHJvdG90eXBlO24uZXh0ZW5kKG8saS5wcm90b3R5cGUpO3ZhciByPVwiY3JlYXRlVG91Y2hcImluIGRvY3VtZW50LGE9ITE7by5fY3JlYXRlRHJhZz1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYmluZERyYWcpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuX3VpQ2hhbmdlRHJhZyksdGhpcy5vbihcImNoaWxkVUlQb2ludGVyRG93blwiLHRoaXMuX2NoaWxkVUlQb2ludGVyRG93bkRyYWcpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy51bmJpbmREcmFnKSxyJiYhYSYmKHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGZ1bmN0aW9uKCl7fSksYT0hMCl9LG8uYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlJiYhdGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMuaGFuZGxlcz1bdGhpcy52aWV3cG9ydF0sdGhpcy5iaW5kSGFuZGxlcygpLHRoaXMuaXNEcmFnQm91bmQ9ITApfSxvLnVuYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy51bmJpbmRIYW5kbGVzKCksZGVsZXRlIHRoaXMuaXNEcmFnQm91bmQpfSxvLl91aUNoYW5nZURyYWc9ZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmd9LG8uX2NoaWxkVUlQb2ludGVyRG93bkRyYWc9ZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucG9pbnRlckRvd25Gb2N1cyh0KX07dmFyIGw9e1RFWFRBUkVBOiEwLElOUFVUOiEwLE9QVElPTjohMH0saD17cmFkaW86ITAsY2hlY2tib3g6ITAsYnV0dG9uOiEwLHN1Ym1pdDohMCxpbWFnZTohMCxmaWxlOiEwfTtvLnBvaW50ZXJEb3duPWZ1bmN0aW9uKGUsaSl7dmFyIG49bFtlLnRhcmdldC5ub2RlTmFtZV0mJiFoW2UudGFyZ2V0LnR5cGVdO2lmKG4pcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bihlLGkpO3ZhciBvPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7byYmby5ibHVyJiZvIT10aGlzLmVsZW1lbnQmJm8hPWRvY3VtZW50LmJvZHkmJm8uYmx1cigpLHRoaXMucG9pbnRlckRvd25Gb2N1cyhlKSx0aGlzLmRyYWdYPXRoaXMueCx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyhlKSx0aGlzLnBvaW50ZXJEb3duU2Nyb2xsPXMoKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyRG93blwiLGUsW2ldKX07dmFyIGM9e3RvdWNoc3RhcnQ6ITAsTVNQb2ludGVyRG93bjohMH0sZD17SU5QVVQ6ITAsU0VMRUNUOiEwfTtyZXR1cm4gby5wb2ludGVyRG93bkZvY3VzPWZ1bmN0aW9uKGUpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYhY1tlLnR5cGVdJiYhZFtlLnRhcmdldC5ub2RlTmFtZV0pe3ZhciBpPXQucGFnZVlPZmZzZXQ7dGhpcy5lbGVtZW50LmZvY3VzKCksdC5wYWdlWU9mZnNldCE9aSYmdC5zY3JvbGxUbyh0LnBhZ2VYT2Zmc2V0LGkpfX0sby5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dmFyIGU9XCJ0b3VjaHN0YXJ0XCI9PXQudHlwZSxpPXQudGFyZ2V0Lm5vZGVOYW1lO3JldHVybiFlJiZcIlNFTEVDVFwiIT1pfSxvLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPnRoaXMub3B0aW9ucy5kcmFnVGhyZXNob2xkfSxvLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe2RlbGV0ZSB0aGlzLmlzVG91Y2hTY3JvbGxpbmcsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJVcFwiLHQsW2VdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LG8ucG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSxkZWxldGUgdGhpcy5wb2ludGVyRG93blNjcm9sbH0sby5kcmFnU3RhcnQ9ZnVuY3Rpb24oZSxpKXt0aGlzLmRyYWdTdGFydFBvc2l0aW9uPXRoaXMueCx0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ1N0YXJ0XCIsZSxbaV0pfSxvLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlck1vdmVcIix0LFtlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LG8uZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnByZXZpb3VzRHJhZ1g9dGhpcy5kcmFnWDt2YXIgbj10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/LTE6MSxzPXRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24raS54Km47aWYoIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLnNsaWRlcy5sZW5ndGgpe3ZhciBvPU1hdGgubWF4KC10aGlzLnNsaWRlc1swXS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPm8/LjUqKHMrbyk6czt2YXIgcj1NYXRoLm1pbigtdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPHI/LjUqKHMrcik6c310aGlzLmRyYWdYPXMsdGhpcy5kcmFnTW92ZVRpbWU9bmV3IERhdGUsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ01vdmVcIix0LFtlLGldKX0sby5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJih0aGlzLmlzRnJlZVNjcm9sbGluZz0hMCk7dmFyIGk9dGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO2lmKHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3ZhciBuPXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCk7dGhpcy5pc0ZyZWVTY3JvbGxpbmc9LW4+dGhpcy5zbGlkZXNbMF0udGFyZ2V0JiYtbjx0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldH1lbHNlIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsfHxpIT10aGlzLnNlbGVjdGVkSW5kZXh8fChpKz10aGlzLmRyYWdFbmRCb29zdFNlbGVjdCgpKTtkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYLHRoaXMuaXNEcmFnU2VsZWN0PXRoaXMub3B0aW9ucy53cmFwQXJvdW5kLHRoaXMuc2VsZWN0KGkpLGRlbGV0ZSB0aGlzLmlzRHJhZ1NlbGVjdCx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnRW5kXCIsdCxbZV0pfSxvLmRyYWdFbmRSZXN0aW5nU2VsZWN0PWZ1bmN0aW9uKCl7XG52YXIgdD10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpLGU9TWF0aC5hYnModGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LHRoaXMuc2VsZWN0ZWRJbmRleCkpLGk9dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLDEpLG49dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLC0xKSxzPWkuZGlzdGFuY2U8bi5kaXN0YW5jZT9pLmluZGV4Om4uaW5kZXg7cmV0dXJuIHN9LG8uX2dldENsb3Nlc3RSZXN0aW5nPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49dGhpcy5zZWxlY3RlZEluZGV4LHM9MS8wLG89dGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9mdW5jdGlvbih0LGUpe3JldHVybiB0PD1lfTpmdW5jdGlvbih0LGUpe3JldHVybiB0PGV9O28oZSxzKSYmKG4rPWkscz1lLGU9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LG4pLG51bGwhPT1lKTspZT1NYXRoLmFicyhlKTtyZXR1cm57ZGlzdGFuY2U6cyxpbmRleDpuLWl9fSxvLmdldFNsaWRlRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGgscz10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmaT4xLG89cz9uLm1vZHVsbyhlLGkpOmUscj10aGlzLnNsaWRlc1tvXTtpZighcilyZXR1cm4gbnVsbDt2YXIgYT1zP3RoaXMuc2xpZGVhYmxlV2lkdGgqTWF0aC5mbG9vcihlL2kpOjA7cmV0dXJuIHQtKHIudGFyZ2V0K2EpfSxvLmRyYWdFbmRCb29zdFNlbGVjdD1mdW5jdGlvbigpe2lmKHZvaWQgMD09PXRoaXMucHJldmlvdXNEcmFnWHx8IXRoaXMuZHJhZ01vdmVUaW1lfHxuZXcgRGF0ZS10aGlzLmRyYWdNb3ZlVGltZT4xMDApcmV0dXJuIDA7dmFyIHQ9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10aGlzLmRyYWdYLHRoaXMuc2VsZWN0ZWRJbmRleCksZT10aGlzLnByZXZpb3VzRHJhZ1gtdGhpcy5kcmFnWDtyZXR1cm4gdD4wJiZlPjA/MTp0PDAmJmU8MD8tMTowfSxvLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5nZXRQYXJlbnRDZWxsKHQudGFyZ2V0KSxuPWkmJmkuZWxlbWVudCxzPWkmJnRoaXMuY2VsbHMuaW5kZXhPZihpKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzdGF0aWNDbGlja1wiLHQsW2UsbixzXSl9LG8ub25zY3JvbGw9ZnVuY3Rpb24oKXt2YXIgdD1zKCksZT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLngtdC54LGk9dGhpcy5wb2ludGVyRG93blNjcm9sbC55LXQueTsoTWF0aC5hYnMoZSk+M3x8TWF0aC5hYnMoaSk+MykmJnRoaXMuX3BvaW50ZXJEb25lKCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVGFwTGlzdGVuZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCl7dGhpcy5iaW5kVGFwKHQpfXZhciBuPWkucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3JldHVybiBuLmJpbmRUYXA9ZnVuY3Rpb24odCl7dCYmKHRoaXMudW5iaW5kVGFwKCksdGhpcy50YXBFbGVtZW50PXQsdGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCkpfSxuLnVuYmluZFRhcD1mdW5jdGlvbigpe3RoaXMudGFwRWxlbWVudCYmKHRoaXMuX2JpbmRTdGFydEV2ZW50KHRoaXMudGFwRWxlbWVudCwhMCksZGVsZXRlIHRoaXMudGFwRWxlbWVudCl9LG4ucG9pbnRlclVwPWZ1bmN0aW9uKGksbil7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT1pLnR5cGUpe3ZhciBzPWUuZ2V0UG9pbnRlclBvaW50KG4pLG89dGhpcy50YXBFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLHI9dC5wYWdlWE9mZnNldCxhPXQucGFnZVlPZmZzZXQsbD1zLng+PW8ubGVmdCtyJiZzLng8PW8ucmlnaHQrciYmcy55Pj1vLnRvcCthJiZzLnk8PW8uYm90dG9tK2E7aWYobCYmdGhpcy5lbWl0RXZlbnQoXCJ0YXBcIixbaSxuXSksXCJtb3VzZXVwXCIhPWkudHlwZSl7dGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMDt2YXIgaD10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgaC5pc0lnbm9yaW5nTW91c2VVcH0sNDAwKX19fSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLnBvaW50ZXJEb25lKCksdGhpcy51bmJpbmRUYXAoKX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3ByZXYtbmV4dC1idXR0b25cIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcyh0LGUpe3RoaXMuZGlyZWN0aW9uPXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLl9jcmVhdGUoKX1mdW5jdGlvbiBvKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P3Q6XCJNIFwiK3QueDArXCIsNTAgTCBcIit0LngxK1wiLFwiKyh0LnkxKzUwKStcIiBMIFwiK3QueDIrXCIsXCIrKHQueTIrNTApK1wiIEwgXCIrdC54MytcIiw1MCAgTCBcIit0LngyK1wiLFwiKyg1MC10LnkyKStcIiBMIFwiK3QueDErXCIsXCIrKDUwLXQueTEpK1wiIFpcIn12YXIgcj1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkPSEwLHRoaXMuaXNQcmV2aW91cz10aGlzLmRpcmVjdGlvbj09LTE7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5yaWdodFRvTGVmdD8xOi0xO3RoaXMuaXNMZWZ0PXRoaXMuZGlyZWN0aW9uPT10O3ZhciBlPXRoaXMuZWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO2UuY2xhc3NOYW1lPVwiZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvblwiLGUuY2xhc3NOYW1lKz10aGlzLmlzUHJldmlvdXM/XCIgcHJldmlvdXNcIjpcIiBuZXh0XCIsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJidXR0b25cIiksdGhpcy5kaXNhYmxlKCksZS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsdGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIik7dmFyIGk9dGhpcy5jcmVhdGVTVkcoKTtlLmFwcGVuZENoaWxkKGkpLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLnBhcmVudC5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlLmJpbmQodGhpcykpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5iaW5kVGFwKHRoaXMuZWxlbWVudCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpfSxzLnByb3RvdHlwZS5jcmVhdGVTVkc9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInN2Z1wiKTt0LnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIixcIjAgMCAxMDAgMTAwXCIpO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwicGF0aFwiKSxpPW8odGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlKTtyZXR1cm4gZS5zZXRBdHRyaWJ1dGUoXCJkXCIsaSksZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLFwiYXJyb3dcIiksdGhpcy5pc0xlZnR8fGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsXCJ0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSgxODApIFwiKSx0LmFwcGVuZENoaWxkKGUpLHR9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0VuYWJsZWQpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIHQ9dGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnBhcmVudFt0XSgpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9bi5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5vbmNsaWNrPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDt0JiZ0PT10aGlzLmVsZW1lbnQmJnRoaXMub25UYXAoKX0scy5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWR8fCh0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITEsdGhpcy5pc0VuYWJsZWQ9ITApfSxzLnByb3RvdHlwZS5kaXNhYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQmJih0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITAsdGhpcy5pc0VuYWJsZWQ9ITEpfSxzLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXM7aWYodGhpcy5wYXJlbnQub3B0aW9ucy53cmFwQXJvdW5kJiZ0Lmxlbmd0aD4xKXJldHVybiB2b2lkIHRoaXMuZW5hYmxlKCk7dmFyIGU9dC5sZW5ndGg/dC5sZW5ndGgtMTowLGk9dGhpcy5pc1ByZXZpb3VzPzA6ZSxuPXRoaXMucGFyZW50LnNlbGVjdGVkSW5kZXg9PWk/XCJkaXNhYmxlXCI6XCJlbmFibGVcIjt0aGlzW25dKCl9LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sbi5leHRlbmQoZS5kZWZhdWx0cyx7cHJldk5leHRCdXR0b25zOiEwLGFycm93U2hhcGU6e3gwOjEwLHgxOjYwLHkxOjUwLHgyOjcwLHkyOjQwLHgzOjMwfX0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVByZXZOZXh0QnV0dG9uc1wiKTt2YXIgYT1lLnByb3RvdHlwZTtyZXR1cm4gYS5fY3JlYXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnByZXZOZXh0QnV0dG9ucyYmKHRoaXMucHJldkJ1dHRvbj1uZXcgcygoLTEpLHRoaXMpLHRoaXMubmV4dEJ1dHRvbj1uZXcgcygxLHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpKX0sYS5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sYS5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMub2ZmKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGUuUHJldk5leHRCdXR0b249cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGFnZS1kb3RzXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHModCl7dGhpcy5wYXJlbnQ9dCx0aGlzLl9jcmVhdGUoKX1zLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5ob2xkZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpLHRoaXMuaG9sZGVyLmNsYXNzTmFtZT1cImZsaWNraXR5LXBhZ2UtZG90c1wiLHRoaXMuZG90cz1bXSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnNldERvdHMoKSx0aGlzLmJpbmRUYXAodGhpcy5ob2xkZXIpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5ob2xkZXIpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmhvbGRlciksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpfSxzLnByb3RvdHlwZS5zZXREb3RzPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzLmxlbmd0aC10aGlzLmRvdHMubGVuZ3RoO3Q+MD90aGlzLmFkZERvdHModCk6dDwwJiZ0aGlzLnJlbW92ZURvdHMoLXQpfSxzLnByb3RvdHlwZS5hZGREb3RzPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksaT1bXTt0Oyl7dmFyIG49ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO24uY2xhc3NOYW1lPVwiZG90XCIsZS5hcHBlbmRDaGlsZChuKSxpLnB1c2gobiksdC0tfXRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKGUpLHRoaXMuZG90cz10aGlzLmRvdHMuY29uY2F0KGkpfSxzLnByb3RvdHlwZS5yZW1vdmVEb3RzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZG90cy5zcGxpY2UodGhpcy5kb3RzLmxlbmd0aC10LHQpO2UuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzLmhvbGRlci5yZW1vdmVDaGlsZCh0KX0sdGhpcyl9LHMucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZERvdCYmKHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90XCIpLHRoaXMuZG90cy5sZW5ndGgmJih0aGlzLnNlbGVjdGVkRG90PXRoaXMuZG90c1t0aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4XSx0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdCBpcy1zZWxlY3RlZFwiKX0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24odCl7dmFyIGU9dC50YXJnZXQ7aWYoXCJMSVwiPT1lLm5vZGVOYW1lKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciBpPXRoaXMuZG90cy5pbmRleE9mKGUpO3RoaXMucGFyZW50LnNlbGVjdChpKX19LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLG4uZXh0ZW5kKGUuZGVmYXVsdHMse3BhZ2VEb3RzOiEwfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGFnZURvdHNcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhZ2VEb3RzJiYodGhpcy5wYWdlRG90cz1uZXcgcyh0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGFnZURvdHMpLHRoaXMub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMpLHRoaXMub24oXCJjZWxsQ2hhbmdlXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcInJlc2l6ZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGFnZURvdHMpKX0sby5hY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5hY3RpdmF0ZSgpfSxvLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnVwZGF0ZVNlbGVjdGVkKCl9LG8udXBkYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnNldERvdHMoKX0sby5kZWFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wbGF5ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2ZsaWNraXR5XCJdLGZ1bmN0aW9uKHQsaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSk6ZSh0LkV2RW1pdHRlcix0LmZpenp5VUlVdGlscyx0LkZsaWNraXR5KX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3RoaXMucGFyZW50PXQsdGhpcy5zdGF0ZT1cInN0b3BwZWRcIixvJiYodGhpcy5vblZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlDaGFuZ2UoKX0uYmluZCh0aGlzKSx0aGlzLm9uVmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlQbGF5KCl9LmJpbmQodGhpcykpfXZhciBzLG87XCJoaWRkZW5cImluIGRvY3VtZW50PyhzPVwiaGlkZGVuXCIsbz1cInZpc2liaWxpdHljaGFuZ2VcIik6XCJ3ZWJraXRIaWRkZW5cImluIGRvY3VtZW50JiYocz1cIndlYmtpdEhpZGRlblwiLG89XCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCIpLG4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodC5wcm90b3R5cGUpLG4ucHJvdG90eXBlLnBsYXk9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIiE9dGhpcy5zdGF0ZSl7dmFyIHQ9ZG9jdW1lbnRbc107aWYobyYmdClyZXR1cm4gdm9pZCBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KTt0aGlzLnN0YXRlPVwicGxheWluZ1wiLG8mJmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSksdGhpcy50aWNrKCl9fSxuLnByb3RvdHlwZS50aWNrPWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUpe3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMuYXV0b1BsYXk7dD1cIm51bWJlclwiPT10eXBlb2YgdD90OjNlMzt2YXIgZT10aGlzO3RoaXMuY2xlYXIoKSx0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe2UucGFyZW50Lm5leHQoITApLGUudGljaygpfSx0KX19LG4ucHJvdG90eXBlLnN0b3A9ZnVuY3Rpb24oKXt0aGlzLnN0YXRlPVwic3RvcHBlZFwiLHRoaXMuY2xlYXIoKSxvJiZkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpfSxuLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpfSxuLnByb3RvdHlwZS5wYXVzZT1mdW5jdGlvbigpe1wicGxheWluZ1wiPT10aGlzLnN0YXRlJiYodGhpcy5zdGF0ZT1cInBhdXNlZFwiLHRoaXMuY2xlYXIoKSl9LG4ucHJvdG90eXBlLnVucGF1c2U9ZnVuY3Rpb24oKXtcInBhdXNlZFwiPT10aGlzLnN0YXRlJiZ0aGlzLnBsYXkoKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50W3NdO3RoaXNbdD9cInBhdXNlXCI6XCJ1bnBhdXNlXCJdKCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy5wbGF5KCksZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSl9LGUuZXh0ZW5kKGkuZGVmYXVsdHMse3BhdXNlQXV0b1BsYXlPbkhvdmVyOiEwfSksaS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGxheWVyXCIpO3ZhciByPWkucHJvdG90eXBlO3JldHVybiByLl9jcmVhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllcj1uZXcgbih0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGxheWVyKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQbGF5ZXIpfSxyLmFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmF1dG9QbGF5JiYodGhpcy5wbGF5ZXIucGxheSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpKX0sci5wbGF5UGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGxheSgpfSxyLnN0b3BQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCl9LHIucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wYXVzZSgpfSxyLnVucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCl9LHIuZGVhY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKX0sci5vbm1vdXNlZW50ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGF1c2VBdXRvUGxheU9uSG92ZXImJih0aGlzLnBsYXllci5wYXVzZSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpKX0sci5vbm1vdXNlbGVhdmU9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcyl9LGkuUGxheWVyPW4saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FkZC1yZW1vdmUtY2VsbFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7ZS5hcHBlbmRDaGlsZCh0LmVsZW1lbnQpfSksZX12YXIgcz1lLnByb3RvdHlwZTtyZXR1cm4gcy5pbnNlcnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9tYWtlQ2VsbHModCk7aWYoaSYmaS5sZW5ndGgpe3ZhciBzPXRoaXMuY2VsbHMubGVuZ3RoO2U9dm9pZCAwPT09ZT9zOmU7dmFyIG89bihpKSxyPWU9PXM7aWYocil0aGlzLnNsaWRlci5hcHBlbmRDaGlsZChvKTtlbHNle3ZhciBhPXRoaXMuY2VsbHNbZV0uZWxlbWVudDt0aGlzLnNsaWRlci5pbnNlcnRCZWZvcmUobyxhKX1pZigwPT09ZSl0aGlzLmNlbGxzPWkuY29uY2F0KHRoaXMuY2VsbHMpO2Vsc2UgaWYocil0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpO2Vsc2V7dmFyIGw9dGhpcy5jZWxscy5zcGxpY2UoZSxzLWUpO3RoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSkuY29uY2F0KGwpfXRoaXMuX3NpemVDZWxscyhpKTt2YXIgaD1lPnRoaXMuc2VsZWN0ZWRJbmRleD8wOmkubGVuZ3RoO3RoaXMuX2NlbGxBZGRlZFJlbW92ZWQoZSxoKX19LHMuYXBwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsdGhpcy5jZWxscy5sZW5ndGgpfSxzLnByZXBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCwwKX0scy5yZW1vdmU9ZnVuY3Rpb24odCl7dmFyIGUsbixzPXRoaXMuZ2V0Q2VsbHModCksbz0wLHI9cy5sZW5ndGg7Zm9yKGU9MDtlPHI7ZSsrKXtuPXNbZV07dmFyIGE9dGhpcy5jZWxscy5pbmRleE9mKG4pPHRoaXMuc2VsZWN0ZWRJbmRleDtvLT1hPzE6MH1mb3IoZT0wO2U8cjtlKyspbj1zW2VdLG4ucmVtb3ZlKCksaS5yZW1vdmVGcm9tKHRoaXMuY2VsbHMsbik7cy5sZW5ndGgmJnRoaXMuX2NlbGxBZGRlZFJlbW92ZWQoMCxvKX0scy5fY2VsbEFkZGVkUmVtb3ZlZD1mdW5jdGlvbih0LGUpe2U9ZXx8MCx0aGlzLnNlbGVjdGVkSW5kZXgrPWUsdGhpcy5zZWxlY3RlZEluZGV4PU1hdGgubWF4KDAsTWF0aC5taW4odGhpcy5zbGlkZXMubGVuZ3RoLTEsdGhpcy5zZWxlY3RlZEluZGV4KSksdGhpcy5jZWxsQ2hhbmdlKHQsITApLHRoaXMuZW1pdEV2ZW50KFwiY2VsbEFkZGVkUmVtb3ZlZFwiLFt0LGVdKX0scy5jZWxsU2l6ZUNoYW5nZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7aWYoZSl7ZS5nZXRTaXplKCk7dmFyIGk9dGhpcy5jZWxscy5pbmRleE9mKGUpO3RoaXMuY2VsbENoYW5nZShpKX19LHMuY2VsbENoYW5nZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVhYmxlV2lkdGg7aWYodGhpcy5fcG9zaXRpb25DZWxscyh0KSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcImNlbGxDaGFuZ2VcIixbdF0pLHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsKXt2YXIgbj1pLXRoaXMuc2xpZGVhYmxlV2lkdGg7dGhpcy54Kz1uKnRoaXMuY2VsbEFsaWduLHRoaXMucG9zaXRpb25TbGlkZXIoKX1lbHNlIGUmJnRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCksdGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2xhenlsb2FkXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtpZihcIklNR1wiPT10Lm5vZGVOYW1lJiZ0LmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIikpcmV0dXJuW3RdO3ZhciBlPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkXVwiKTtyZXR1cm4gaS5tYWtlQXJyYXkoZSl9ZnVuY3Rpb24gcyh0LGUpe3RoaXMuaW1nPXQsdGhpcy5mbGlja2l0eT1lLHRoaXMubG9hZCgpfWUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUxhenlsb2FkXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVMYXp5bG9hZD1mdW5jdGlvbigpe3RoaXMub24oXCJzZWxlY3RcIix0aGlzLmxhenlMb2FkKX0sby5sYXp5TG9hZD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5sYXp5TG9hZDtpZih0KXt2YXIgZT1cIm51bWJlclwiPT10eXBlb2YgdD90OjAsaT10aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKGUpLG89W107aS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBlPW4odCk7bz1vLmNvbmNhdChlKX0pLG8uZm9yRWFjaChmdW5jdGlvbih0KXtuZXcgcyh0LHRoaXMpfSx0aGlzKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PWkuaGFuZGxlRXZlbnQscy5wcm90b3R5cGUubG9hZD1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMuaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIiksdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKX0scy5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenlsb2FkZWRcIil9LHMucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWVycm9yXCIpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbih0LGUpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyk7dmFyIGk9dGhpcy5mbGlja2l0eS5nZXRQYXJlbnRDZWxsKHRoaXMuaW1nKSxuPWkmJmkuZWxlbWVudDt0aGlzLmZsaWNraXR5LmNlbGxTaXplQ2hhbmdlKG4pLHRoaXMuaW1nLmNsYXNzTGlzdC5hZGQoZSksdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KFwibGF6eUxvYWRcIix0LG4pfSxlLkxhenlMb2FkZXI9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvaW5kZXhcIixbXCIuL2ZsaWNraXR5XCIsXCIuL2RyYWdcIixcIi4vcHJldi1uZXh0LWJ1dHRvblwiLFwiLi9wYWdlLWRvdHNcIixcIi4vcGxheWVyXCIsXCIuL2FkZC1yZW1vdmUtY2VsbFwiLFwiLi9sYXp5bG9hZFwiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcIi4vZHJhZ1wiKSxyZXF1aXJlKFwiLi9wcmV2LW5leHQtYnV0dG9uXCIpLHJlcXVpcmUoXCIuL3BhZ2UtZG90c1wiKSxyZXF1aXJlKFwiLi9wbGF5ZXJcIikscmVxdWlyZShcIi4vYWRkLXJlbW92ZS1jZWxsXCIpLHJlcXVpcmUoXCIuL2xhenlsb2FkXCIpKSl9KHdpbmRvdyxmdW5jdGlvbih0KXtyZXR1cm4gdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5LWFzLW5hdi1mb3IvYXMtbmF2LWZvclwiLFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUsaSl7cmV0dXJuKGUtdCkqaSt0fXQuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUFzTmF2Rm9yXCIpO3ZhciBuPXQucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlc3Ryb3lcIix0aGlzLmRlc3Ryb3lBc05hdkZvcik7dmFyIHQ9dGhpcy5vcHRpb25zLmFzTmF2Rm9yO2lmKHQpe3ZhciBlPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2Uuc2V0TmF2Q29tcGFuaW9uKHQpfSl9fSxuLnNldE5hdkNvbXBhbmlvbj1mdW5jdGlvbihpKXtpPWUuZ2V0UXVlcnlFbGVtZW50KGkpO3ZhciBuPXQuZGF0YShpKTtpZihuJiZuIT10aGlzKXt0aGlzLm5hdkNvbXBhbmlvbj1uO3ZhciBzPXRoaXM7dGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbigpe3MubmF2Q29tcGFuaW9uU2VsZWN0KCl9LG4ub24oXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9uKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLHRoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX19LG4ubmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKHQpe2lmKHRoaXMubmF2Q29tcGFuaW9uKXt2YXIgZT10aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzWzBdLG49dGhpcy5uYXZDb21wYW5pb24uY2VsbHMuaW5kZXhPZihlKSxzPW4rdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxscy5sZW5ndGgtMSxvPU1hdGguZmxvb3IoaShuLHMsdGhpcy5uYXZDb21wYW5pb24uY2VsbEFsaWduKSk7aWYodGhpcy5zZWxlY3RDZWxsKG8sITEsdCksdGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCksIShvPj10aGlzLmNlbGxzLmxlbmd0aCkpe3ZhciByPXRoaXMuY2VsbHMuc2xpY2UobixzKzEpO3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cz1yLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSksdGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwiYWRkXCIpfX19LG4uY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmNsYXNzTGlzdFt0XShcImlzLW5hdi1zZWxlY3RlZFwiKX0pfSxuLmFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9LG4ucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cz1mdW5jdGlvbigpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyYmKHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKSxkZWxldGUgdGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzKX0sbi5vbk5hdlN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSxpLG4pe1wibnVtYmVyXCI9PXR5cGVvZiBuJiZ0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RDZWxsKG4pfSxuLmRlYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpfSxuLmRlc3Ryb3lBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uJiYodGhpcy5uYXZDb21wYW5pb24ub2ZmKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vZmYoXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksZGVsZXRlIHRoaXMubmF2Q29tcGFuaW9uKX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5pbWFnZXNMb2FkZWQ9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYoXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX1mdW5jdGlvbiBzKHQsZSxvKXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHM/KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHQpKSx0aGlzLmVsZW1lbnRzPW4odCksdGhpcy5vcHRpb25zPWkoe30sdGhpcy5vcHRpb25zKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlP289ZTppKHRoaXMub3B0aW9ucyxlKSxvJiZ0aGlzLm9uKFwiYWx3YXlzXCIsbyksdGhpcy5nZXRJbWFnZXMoKSxhJiYodGhpcy5qcURlZmVycmVkPW5ldyBhLkRlZmVycmVkKSx2b2lkIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGlzLmNoZWNrKCl9LmJpbmQodGhpcykpKTpuZXcgcyh0LGUsbyl9ZnVuY3Rpb24gbyh0KXt0aGlzLmltZz10fWZ1bmN0aW9uIHIodCxlKXt0aGlzLnVybD10LHRoaXMuZWxlbWVudD1lLHRoaXMuaW1nPW5ldyBJbWFnZX12YXIgYT10LmpRdWVyeSxsPXQuY29uc29sZTtzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxzLnByb3RvdHlwZS5vcHRpb25zPXt9LHMucHJvdG90eXBlLmdldEltYWdlcz1mdW5jdGlvbigpe3RoaXMuaW1hZ2VzPVtdLHRoaXMuZWxlbWVudHMuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnRJbWFnZXMsdGhpcyl9LHMucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXM9ZnVuY3Rpb24odCl7XCJJTUdcIj09dC5ub2RlTmFtZSYmdGhpcy5hZGRJbWFnZSh0KSx0aGlzLm9wdGlvbnMuYmFja2dyb3VuZD09PSEwJiZ0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHQpO3ZhciBlPXQubm9kZVR5cGU7aWYoZSYmaFtlXSl7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1wiKSxuPTA7bjxpLmxlbmd0aDtuKyspe3ZhciBzPWlbbl07dGhpcy5hZGRJbWFnZShzKX1pZihcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQpe3ZhciBvPXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCk7Zm9yKG49MDtuPG8ubGVuZ3RoO24rKyl7dmFyIHI9b1tuXTt0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHIpfX19fTt2YXIgaD17MTohMCw5OiEwLDExOiEwfTtyZXR1cm4gcy5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXM9ZnVuY3Rpb24odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtpZihlKWZvcih2YXIgaT0vdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSk7bnVsbCE9PW47KXt2YXIgcz1uJiZuWzJdO3MmJnRoaXMuYWRkQmFja2dyb3VuZChzLHQpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKX19LHMucHJvdG90eXBlLmFkZEltYWdlPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBvKHQpO3RoaXMuaW1hZ2VzLnB1c2goZSl9LHMucHJvdG90eXBlLmFkZEJhY2tncm91bmQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcih0LGUpO3RoaXMuaW1hZ2VzLnB1c2goaSl9LHMucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGksbil7c2V0VGltZW91dChmdW5jdGlvbigpe2UucHJvZ3Jlc3ModCxpLG4pfSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5wcm9ncmVzc2VkQ291bnQ9MCx0aGlzLmhhc0FueUJyb2tlbj0hMSx0aGlzLmltYWdlcy5sZW5ndGg/dm9pZCB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2Uub25jZShcInByb2dyZXNzXCIsdCksZS5jaGVjaygpfSk6dm9pZCB0aGlzLmNvbXBsZXRlKCl9LHMucHJvdG90eXBlLnByb2dyZXNzPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLnByb2dyZXNzZWRDb3VudCsrLHRoaXMuaGFzQW55QnJva2VuPXRoaXMuaGFzQW55QnJva2VufHwhdC5pc0xvYWRlZCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdCxlXSksdGhpcy5qcURlZmVycmVkJiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5JiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5KHRoaXMsdCksdGhpcy5wcm9ncmVzc2VkQ291bnQ9PXRoaXMuaW1hZ2VzLmxlbmd0aCYmdGhpcy5jb21wbGV0ZSgpLHRoaXMub3B0aW9ucy5kZWJ1ZyYmbCYmbC5sb2coXCJwcm9ncmVzczogXCIraSx0LGUpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaGFzQW55QnJva2VuP1wiZmFpbFwiOlwiZG9uZVwiO2lmKHRoaXMuaXNDb21wbGV0ZT0hMCx0aGlzLmVtaXRFdmVudCh0LFt0aGlzXSksdGhpcy5lbWl0RXZlbnQoXCJhbHdheXNcIixbdGhpc10pLHRoaXMuanFEZWZlcnJlZCl7dmFyIGU9dGhpcy5oYXNBbnlCcm9rZW4/XCJyZWplY3RcIjpcInJlc29sdmVcIjt0aGlzLmpxRGVmZXJyZWRbZV0odGhpcyl9fSxvLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxvLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7cmV0dXJuIHQ/dm9pZCB0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKToodGhpcy5wcm94eUltYWdlPW5ldyBJbWFnZSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx2b2lkKHRoaXMucHJveHlJbWFnZS5zcmM9dGhpcy5pbWcuc3JjKSl9LG8ucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmltZy5jb21wbGV0ZSYmdm9pZCAwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRofSxvLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmltZyxlXSl9LG8ucHJvdG90eXBlLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0sby5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCEwLFwib25sb2FkXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITEsXCJvbmVycm9yXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKG8ucHJvdG90eXBlKSxyLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMudXJsO3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7dCYmKHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpLHRoaXMudW5iaW5kRXZlbnRzKCkpfSxyLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmVsZW1lbnQsZV0pfSxzLm1ha2VKUXVlcnlQbHVnaW49ZnVuY3Rpb24oZSl7ZT1lfHx0LmpRdWVyeSxlJiYoYT1lLGEuZm4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHModGhpcyx0LGUpO3JldHVybiBpLmpxRGVmZXJyZWQucHJvbWlzZShhKHRoaXMpKX0pfSxzLm1ha2VKUXVlcnlQbHVnaW4oKSxzfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiaW1hZ2VzbG9hZGVkXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuaW1hZ2VzTG9hZGVkKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVJbWFnZXNMb2FkZWRcIik7dmFyIG49ZS5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUltYWdlc0xvYWRlZD1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuaW1hZ2VzTG9hZGVkKX0sbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSl7dmFyIG49ZS5nZXRQYXJlbnRDZWxsKGkuaW1nKTtlLmNlbGxTaXplQ2hhbmdlKG4mJm4uZWxlbWVudCksZS5vcHRpb25zLmZyZWVTY3JvbGx8fGUucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9aWYodGhpcy5vcHRpb25zLmltYWdlc0xvYWRlZCl7dmFyIGU9dGhpcztpKHRoaXMuc2xpZGVyKS5vbihcInByb2dyZXNzXCIsdCl9fSxlfSk7IiwiLyoqXG4gKiBGbGlja2l0eSBiYWNrZ3JvdW5kIGxhenlsb2FkIHYxLjAuMFxuICogbGF6eWxvYWQgYmFja2dyb3VuZCBjZWxsIGltYWdlc1xuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZmxpY2tpdHkvanMvaW5kZXgnLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHJlcXVpcmUoJ2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5LCB1dGlscyApIHtcbi8qanNoaW50IHN0cmljdDogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVCZ0xhenlMb2FkJyk7XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZUJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ3NlbGVjdCcsIHRoaXMuYmdMYXp5TG9hZCApO1xufTtcblxucHJvdG8uYmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGF6eUxvYWQgPSB0aGlzLm9wdGlvbnMuYmdMYXp5TG9hZDtcbiAgaWYgKCAhbGF6eUxvYWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICB2YXIgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKCBhZGpDb3VudCApO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBjZWxsRWxlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGNlbGxFbGVtID0gY2VsbEVsZW1zW2ldO1xuICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNlbGxFbGVtICk7XG4gICAgLy8gc2VsZWN0IGxhenkgZWxlbXMgaW4gY2VsbFxuICAgIHZhciBjaGlsZHJlbiA9IGNlbGxFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkXScpO1xuICAgIGZvciAoIHZhciBqPTA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcbiAgICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNoaWxkcmVuW2pdICk7XG4gICAgfVxuICB9XG59O1xuXG5wcm90by5iZ0xhenlMb2FkRWxlbSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG4gIGlmICggYXR0ciApIHtcbiAgICBuZXcgQmdMYXp5TG9hZGVyKCBlbGVtLCBhdHRyLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIExhenlCR0xvYWRlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGNsYXNzIHRvIGhhbmRsZSBsb2FkaW5nIGltYWdlc1xuICovXG5mdW5jdGlvbiBCZ0xhenlMb2FkZXIoIGVsZW0sIHVybCwgZmxpY2tpdHkgKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLmZsaWNraXR5ID0gZmxpY2tpdHk7XG4gIHRoaXMubG9hZCgpO1xufVxuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gdXRpbHMuaGFuZGxlRXZlbnQ7XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBsb2FkIGltYWdlXG4gIHRoaXMuaW1nLnNyYyA9IHRoaXMudXJsO1xuICAvLyByZW1vdmUgYXR0clxuICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIHRoaXMudXJsICsgJyknO1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenlsb2FkZWQnICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWVycm9yJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCBldmVudCwgY2xhc3NOYW1lICkge1xuICAvLyB1bmJpbmQgZXZlbnRzXG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG5cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuICB0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoICdiZ0xhenlMb2FkJywgZXZlbnQsIHRoaXMuZWxlbWVudCApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LkJnTGF6eUxvYWRlciA9IEJnTGF6eUxvYWRlcjtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvKipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gMS4yLjI3XG4qICAoYykgMjAxNSBUb21hcyBLaXJkYVxuKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXG4qICBGb3IgZGV0YWlscywgc2VlIHRoZSB3ZWIgc2l0ZTogaHR0cHM6Ly9naXRodWIuY29tL2RldmJyaWRnZS9qUXVlcnktQXV0b2NvbXBsZXRlXG4qL1xuXG4vKmpzbGludCAgYnJvd3NlcjogdHJ1ZSwgd2hpdGU6IHRydWUsIHNpbmdsZTogdHJ1ZSwgdGhpczogdHJ1ZSwgbXVsdGl2YXI6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gJC5ub29wLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCBvcHRpb25zLndpZHRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3Zlci5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNpdGVTZWFyY2hEaXYgPSAkKCcuc2l0ZS1zZWFyY2gnKTtcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhhdC5vcHRpb25zLm9yaWVudGF0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXRlU2VhcmNoRGl2Lm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gc2l0ZVNlYXJjaERpdi5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICAgICAgICAgIHRvcE92ZXJmbG93ID0gLXNjcm9sbFRvcCArIG9mZnNldC50b3AgLSBjb250YWluZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IChNYXRoLm1heCh0b3BPdmVyZmxvdywgYm90dG9tT3ZlcmZsb3cpID09PSB0b3BPdmVyZmxvdykgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBwb3NpdGlvbmVkIHRvIGJvZHksXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAkY29udGFpbmVyLmNzcygnb3BhY2l0eScpLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sZWZ0IC09IHBhcmVudE9mZnNldERpZmYubGVmdDtcblxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCBvcGFjaXR5KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSBzaXRlU2VhcmNoRGl2Lm91dGVyV2lkdGgoKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIHJlc3RvcmUgdmFsdWUgd2hlbiBcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlc2VydmVJbnB1dCA9PT0gdHJ1ZSwgXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugd2UgZGlkIG5vdCBjaGFuZ2UgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNDdXJzb3JBdEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhhdC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAgICAgICAgIHJhbmdlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsTGVuZ3RoID09PSByYW5nZS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgaWYgKCF0aGF0LmRpc2FibGVkICYmICF0aGF0LnZpc2libGUgJiYgZS53aGljaCA9PT0ga2V5cy5ET1dOICYmIHRoYXQuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCAmJiB0aGF0LmlzQ3Vyc29yQXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy50YWJEaXNhYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVVcCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbmNlbCBldmVudCBpZiBmdW5jdGlvbiBkaWQgbm90IHJldHVybjpcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKSxcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3Rpb24gJiYgdGhhdC5jdXJyZW50VmFsdWUgIT09IHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBleGlzdGluZyBzdWdnZXN0aW9uIGZvciB0aGUgbWF0Y2ggYmVmb3JlIHByb2NlZWRpbmc6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IG9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nZXRTdWdnZXN0aW9ucyhxdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XG5cbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0ocGFydHNbcGFydHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zTG9jYWw6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgcXVlcnlMb3dlckNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxuICAgICAgICAgICAgICAgIGRhdGE7XG5cbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQuZ3JlcChvcHRpb25zLmxvb2t1cCwgZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XG5cbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1zW29wdGlvbnMucGFyYW1OYW1lXSA9IHE7XG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TZWFyY2hTdGFydC5jYWxsKHRoYXQuZWxlbWVudCwgb3B0aW9ucy5wYXJhbXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXNwb25zZS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoYXQuaXNCYWRRdWVyeShxKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG5cbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xuXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9ICQuYWpheChhamF4U2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtUmVzdWx0KGRhdGEsIHEpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkhpZGUuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyLCB0aGF0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgIXJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5iYWRRdWVyaWVzLnB1c2gob3JpZ2luYWxRdWVyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3VsdC5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjb250YWluZXIuZmluZCgnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ICE9PSAtMSAmJiBjaGlsZHJlbi5sZW5ndGggPiB0aGF0LnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwiXG4kKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbnZhciBiYXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdiYXNlJyk7XG52YXIgYmFzZUhyZWYgPSBudWxsO1xuXG5pZiAoYmFzZXMubGVuZ3RoID4gMCkge1xuICAgIGJhc2VIcmVmID0gYmFzZXNbMF0uaHJlZjtcbn1cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gTGF6eSBMb2FkaW5nIEltYWdlczpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gdmFyIG15TGF6eUxvYWQgPSBuZXcgTGF6eUxvYWQoe1xuLy8gICAgIC8vIGV4YW1wbGUgb2Ygb3B0aW9ucyBvYmplY3QgLT4gc2VlIG9wdGlvbnMgc2VjdGlvblxuLy8gICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcIi5kcC1sYXp5XCJcbi8vICAgICAvLyB0aHJvdHRsZTogMjAwLFxuLy8gICAgIC8vIGRhdGFfc3JjOiBcInNyY1wiLFxuLy8gICAgIC8vIGRhdGFfc3Jjc2V0OiBcInNyY3NldFwiLFxuLy8gICAgIC8vIGNhbGxiYWNrX3NldDogZnVuY3Rpb24oKSB7IC8qIC4uLiAqLyB9XG4vLyB9KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBCaWcgQ2Fyb3VzZWwgKEhvbWUgUGFnZSk6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxudmFyICRjYXJvdXNlbCA9ICQoJy5jYXJvdXNlbCcpLmZsaWNraXR5KHtcblx0aW1hZ2VzTG9hZGVkOiB0cnVlLFxuXHRwZXJjZW50UG9zaXRpb246IGZhbHNlLFxuXHRzZWxlY3RlZEF0dHJhY3Rpb246IDAuMDE1LFxuXHRmcmljdGlvbjogMC4zLFxuXHRwcmV2TmV4dEJ1dHRvbnM6IGZhbHNlLFxuXHRkcmFnZ2FibGU6IHRydWUsXG5cdGF1dG9QbGF5OiB0cnVlLFxuXHRhdXRvUGxheTogODAwMCxcblx0cGF1c2VBdXRvUGxheU9uSG92ZXI6IGZhbHNlLFxuXHRiZ0xhenlMb2FkOiB0cnVlLFxufSk7XG5cbnZhciAkaW1ncyA9ICRjYXJvdXNlbC5maW5kKCcuY2Fyb3VzZWwtY2VsbCAuY2VsbC1iZycpO1xuLy8gZ2V0IHRyYW5zZm9ybSBwcm9wZXJ0eVxudmFyIGRvY1N0eWxlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO1xudmFyIHRyYW5zZm9ybVByb3AgPSB0eXBlb2YgZG9jU3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcbi8vIGdldCBGbGlja2l0eSBpbnN0YW5jZVxudmFyIGZsa3R5ID0gJGNhcm91c2VsLmRhdGEoJ2ZsaWNraXR5Jyk7XG5cbiRjYXJvdXNlbC5vbiggJ3Njcm9sbC5mbGlja2l0eScsIGZ1bmN0aW9uKCkge1xuICBmbGt0eS5zbGlkZXMuZm9yRWFjaCggZnVuY3Rpb24oIHNsaWRlLCBpICkge1xuICAgIHZhciBpbWcgPSAkaW1nc1tpXTtcbiAgICB2YXIgeCA9ICggc2xpZGUudGFyZ2V0ICsgZmxrdHkueCApICogLTEvMztcbiAgICBpbWcuc3R5bGVbIHRyYW5zZm9ybVByb3AgXSA9ICd0cmFuc2xhdGVYKCcgKyB4ICArICdweCknO1xuICB9KTtcbn0pO1xuXG4kKCcuY2Fyb3VzZWwtbmF2LWNlbGwnKS5jbGljayhmdW5jdGlvbigpIHtcblx0ZmxrdHkuc3RvcFBsYXllcigpO1xufSk7XG5cbnZhciAkZ2FsbGVyeSA9ICQoJy5jYXJvdXNlbCcpLmZsaWNraXR5KCk7XG5cbmZ1bmN0aW9uIG9uTG9hZGVkZGF0YSggZXZlbnQgKSB7XG5cdHZhciBjZWxsID0gJGdhbGxlcnkuZmxpY2tpdHkoICdnZXRQYXJlbnRDZWxsJywgZXZlbnQudGFyZ2V0ICk7XG5cdCRnYWxsZXJ5LmZsaWNraXR5KCAnY2VsbFNpemVDaGFuZ2UnLCBjZWxsICYmIGNlbGwuZWxlbWVudCApO1xufVxuXG4kZ2FsbGVyeS5maW5kKCd2aWRlbycpLmVhY2goIGZ1bmN0aW9uKCBpLCB2aWRlbyApIHtcblx0dmlkZW8ucGxheSgpO1xuXHQkKCB2aWRlbyApLm9uKCAnbG9hZGVkZGF0YScsIG9uTG9hZGVkZGF0YSApO1xufSk7XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFNsaWRlc2hvdyBibG9jayAoaW4gY29udGVudCk6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbnZhciAkc2xpZGVzaG93ID0gJCgnLnNsaWRlc2hvdycpLmZsaWNraXR5KHtcblx0Ly9hZGFwdGl2ZUhlaWdodDogdHJ1ZSxcblx0aW1hZ2VzTG9hZGVkOiB0cnVlLFxuXHRsYXp5TG9hZDogdHJ1ZVxufSk7XG5cbnZhciBzbGlkZXNob3dmbGsgPSAkc2xpZGVzaG93LmRhdGEoJ2ZsaWNraXR5Jyk7XG5cbiRzbGlkZXNob3cub24oICdzZWxlY3QuZmxpY2tpdHknLCBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coICdGbGlja2l0eSBzZWxlY3QgJyArIHNsaWRlc2hvd2Zsay5zZWxlY3RlZEluZGV4ICk7XG5cdC8vc2xpZGVzaG93ZmxrLnJlbG9hZENlbGxzKCk7XG5cbn0pXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gU3RhcnQgRm91bmRhdGlvbiBPcmJpdCBTbGlkZXI6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIHZhciBzbGlkZXJPcHRpb25zID0ge1xuLy8gXHRjb250YWluZXJDbGFzczogJ3NsaWRlcl9fc2xpZGVzJyxcbi8vIFx0c2xpZGVDbGFzczogJ3NsaWRlcl9fc2xpZGUnLFxuLy8gXHRuZXh0Q2xhc3M6ICdzbGlkZXJfX25hdi0tbmV4dCcsXG4vLyBcdHByZXZDbGFzczogJ3NsaWRlcl9fbmF2LS1wcmV2aW91cycsXG5cbi8vIH07XG5cblxuLy8gdmFyIHNsaWRlciA9IG5ldyBGb3VuZGF0aW9uLk9yYml0KCQoJy5zbGlkZXInKSwgc2xpZGVyT3B0aW9ucyk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9XcmFwIGV2ZXJ5IGlmcmFtZSBpbiBhIGZsZXggdmlkZW8gY2xhc3MgdG8gcHJldmVudCBsYXlvdXQgYnJlYWthZ2Vcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuJCgnaWZyYW1lJykuZWFjaChmdW5jdGlvbigpe1xuXHQkKHRoaXMpLndyYXAoIFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuJz48L2Rpdj5cIiApO1xuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL0Rpc3Rpbmd1aXNoIGRyb3Bkb3ducyBvbiBtb2JpbGUvZGVza3RvcDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4kKCcubmF2X19pdGVtLS1wYXJlbnQnKS5jbGljayhmdW5jdGlvbihldmVudCkge1xuICBpZiAod2hhdElucHV0LmFzaygpID09PSAndG91Y2gnKSB7XG4gICAgLy8gZG8gdG91Y2ggaW5wdXQgdGhpbmdzXG4gICAgaWYoISQodGhpcykuaGFzQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpKXtcblx0ICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICAkKCcubmF2X19pdGVtLS1wYXJlbnQnKS5yZW1vdmVDbGFzcygnbmF2X19pdGVtLS1pcy1ob3ZlcmVkJyk7XG5cdCAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKVxuICAgIH1cbiAgfSBlbHNlIGlmICh3aGF0SW5wdXQuYXNrKCkgPT09ICdtb3VzZScpIHtcbiAgICAvLyBkbyBtb3VzZSB0aGluZ3NcbiAgfVxufSk7XG5cbi8vSWYgYW55dGhpbmcgaW4gdGhlIG1haW4gY29udGVudCBjb250YWluZXIgaXMgY2xpY2tlZCwgcmVtb3ZlIGZhdXggaG92ZXIgY2xhc3MuXG4kKCcjbWFpbi1jb250ZW50X19jb250YWluZXInKS5jbGljayhmdW5jdGlvbigpe1xuXHQkKCcubmF2X19pdGVtJykucmVtb3ZlQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpO1xuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL1NpdGUgU2VhcmNoOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbmZ1bmN0aW9uIHRvZ2dsZVNlYXJjaENsYXNzZXMoKXtcblx0JChcImJvZHlcIikudG9nZ2xlQ2xhc3MoXCJib2R5LS1zZWFyY2gtYWN0aXZlXCIpO1xuXHQkKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLnRvZ2dsZUNsYXNzKFwic2l0ZS1zZWFyY2hfX2Zvcm0tLWlzLWluYWN0aXZlIHNpdGUtc2VhcmNoX19mb3JtLS1pcy1hY3RpdmVcIik7XG5cdCQoXCIjc2l0ZS1zZWFyY2hcIikudG9nZ2xlQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtaW5hY3RpdmUgc2l0ZS1zZWFyY2gtLWlzLWFjdGl2ZVwiKTtcblx0JChcIi5oZWFkZXJfX3NjcmVlblwiKS50b2dnbGVDbGFzcyhcImhlYWRlcl9fc2NyZWVuLS1ncmF5c2NhbGVcIik7XG5cdCQoXCIubWFpbi1jb250ZW50X19jb250YWluZXJcIikudG9nZ2xlQ2xhc3MoXCJtYWluLWNvbnRlbnRfX2NvbnRhaW5lci0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm5hdl9fd3JhcHBlclwiKS50b2dnbGVDbGFzcyhcIm5hdl9fd3JhcHBlci0tZ3JheXNjYWxlXCIpO1xuXHQkKFwiLm5hdl9fbGluay0tc2VhcmNoXCIpLnRvZ2dsZUNsYXNzKFwibmF2X19saW5rLS1zZWFyY2gtaXMtYWN0aXZlXCIpO1xuXG5cdC8vSEFDSzogd2FpdCBmb3IgNW1zIGJlZm9yZSBjaGFuZ2luZyBmb2N1cy4gSSBkb24ndCB0aGluayBJIG5lZWQgdGhpcyBhbnltb3JlIGFjdHVhbGx5Li5cblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQgICQoXCIubmF2X193cmFwcGVyXCIpLnRvZ2dsZUNsYXNzKFwibmF2X193cmFwcGVyLS1zZWFyY2gtaXMtYWN0aXZlXCIpO1xuXHR9LCA1KTtcblxuXHQkKFwiLm5hdlwiKS50b2dnbGVDbGFzcyhcIm5hdi0tc2VhcmNoLWlzLWFjdGl2ZVwiKTtcblxufVxuXG4kKFwiLm5hdl9fbGluay0tc2VhcmNoXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gIFx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuICBcdGlmKCQoXCIjbW9iaWxlLW5hdl9fd3JhcHBlclwiKS5oYXNDbGFzcyhcIm1vYmlsZS1uYXZfX3dyYXBwZXItLW1vYmlsZS1tZW51LWlzLWFjdGl2ZVwiKSl7XG4gIFx0XHR0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcygpO1xuICBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbygnI2hlYWRlcicpLmFkZENsYXNzKCdzaXRlLXNlYXJjaC0tbW9iaWxlJyk7XG4gIFx0fVxuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l0ZS1zZWFyY2hfX2lucHV0XCIpLmZvY3VzKCk7XG59KTtcblxuJChcIi5uYXZfX2xpbmstLXNlYXJjaC1jYW5jZWxcIikuY2xpY2soZnVuY3Rpb24oKXtcblx0dG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpdGUtc2VhcmNoX19pbnB1dFwiKS5ibHVyKCk7XG59KTtcblxuLy9XaGVuIHNlYXJjaCBmb3JtIGlzIG91dCBvZiBmb2N1cywgZGVhY3RpdmF0ZSBpdC5cbiQoXCIjc2l0ZS1zZWFyY2hfX2Zvcm1cIikuZm9jdXNvdXQoZnVuY3Rpb24oKXtcbiAgXHRpZigkKFwiI3NpdGUtc2VhcmNoX19mb3JtXCIpLmhhc0NsYXNzKFwic2l0ZS1zZWFyY2hfX2Zvcm0tLWlzLWFjdGl2ZVwiKSl7XG4gIFx0XHQvL0NvbW1lbnQgb3V0IHRoZSBmb2xsb3dpbmcgbGluZSBpZiB5b3UgbmVlZCB0byB1c2UgV2ViS2l0L0JsaW5rIGluc3BlY3RvciB0b29sIG9uIHRoZSBzZWFyY2ggKHNvIGl0IGRvZXNuJ3QgbG9zZSBmb2N1cyk6XG4gIFx0XHQvL3RvZ2dsZVNlYXJjaENsYXNzZXMoKTtcbiAgXHR9XG59KTtcblxuJCgnaW5wdXRbbmFtZT1cIlNlYXJjaFwiXScpLmF1dG9jb21wbGV0ZSh7XG4gICAgc2VydmljZVVybDogYmFzZUhyZWYrJy9ob21lL2F1dG9Db21wbGV0ZScsXG4gICAgZGVmZXJSZXF1ZXN0Qnk6IDEwMCxcbiAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiBmYWxzZSxcbiAgICBtaW5DaGFyczogMixcbiAgICBhdXRvU2VsZWN0Rmlyc3Q6IHRydWUsXG4gICAgdHlwZTogJ3Bvc3QnLFxuICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAkKCcjc2l0ZS1zZWFyY2hfX2Zvcm0nKS5zdWJtaXQoKTtcbiAgICB9XG59KTtcblxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vTW9iaWxlIFNlYXJjaDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5pZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ21lZGl1bScpKSB7XG4gIC8vIFRydWUgaWYgbWVkaXVtIG9yIGxhcmdlXG4gIC8vIEZhbHNlIGlmIHNtYWxsXG4gICQoXCIjc2l0ZS1zZWFyY2hcIikuYWRkQ2xhc3MoXCJzaXRlLXNlYXJjaC0tZGVza3RvcFwiKTtcbn1lbHNle1xuXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcbn1cblxuXG4kKFwiLm5hdl9fdG9nZ2xlLS1zZWFyY2hcIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgXHR0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cblxuXG4gIFx0Ly9hcHBlbmQgb3VyIHNpdGUgc2VhcmNoIGRpdiB0byB0aGUgaGVhZGVyLlxuICBcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKS5hZGRDbGFzcygnc2l0ZS1zZWFyY2gtLW1vYmlsZScpO1xuICBcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l0ZS1zZWFyY2hfX2lucHV0XCIpLmZvY3VzKCk7XG59KTtcblxuLy9JZiB3ZSdyZSByZXNpemluZyBmcm9tIG1vYmlsZSB0byBhbnl0aGluZyBlbHNlLCB0b2dnbGUgdGhlIG1vYmlsZSBzZWFyY2ggaWYgaXQncyBhY3RpdmUuXG4kKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKGV2ZW50LCBuZXdTaXplLCBvbGRTaXplKSB7XG5cblx0IGlmIChuZXdTaXplID09IFwibWVkaXVtXCIpIHtcblx0IFx0Ly9hbGVydCgnaGV5Jyk7XG5cdCBcdCQoXCIjc2l0ZS1zZWFyY2hcIikucmVtb3ZlQ2xhc3MoXCJzaXRlLXNlYXJjaC0tbW9iaWxlXCIpO1xuXHQgXHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLWRlc2t0b3BcIik7XG5cblx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKFwiI25hdlwiKTtcblxuXG5cdCBcdGlmKCQoXCIjc2l0ZS1zZWFyY2hcIikuaGFzQ2xhc3MoXCJzaXRlLXNlYXJjaC0taXMtYWN0aXZlXCIpKXtcblx0IFx0XHQvLyB0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cdCBcdH1cblx0IH1lbHNlIGlmKG5ld1NpemUgPT0gXCJtb2JpbGVcIil7XG5cdCBcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oJyNoZWFkZXInKTtcbiBcdFx0JChcIiNzaXRlLXNlYXJjaFwiKS5yZW1vdmVDbGFzcyhcInNpdGUtc2VhcmNoLS1kZXNrdG9wXCIpO1xuIFx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFkZENsYXNzKFwic2l0ZS1zZWFyY2gtLW1vYmlsZVwiKTtcblx0IFx0aWYoJChcIiNzaXRlLXNlYXJjaFwiKS5oYXNDbGFzcyhcInNpdGUtc2VhcmNoLS1pcy1hY3RpdmVcIikpe1xuXHQgXHRcdC8vIHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblx0IFx0fVxuXHQgfVxuXG59KTtcblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL01vYmlsZSBOYXY6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLyogbmV3IHN0dWZmIGFkZGVkIG15IEJyYW5kb24gLSBsYXp5IGNvZGluZyAqL1xuJCgnLm5hdl9fdG9nZ2xlLS1tZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcblx0JCgnLm5hdl9fbWVudS1pY29uJykudG9nZ2xlQ2xhc3MoJ2lzLWNsaWNrZWQnKTtcblx0JChcIiNuYXZfX21lbnUtaWNvblwiKS50b2dnbGVDbGFzcyhcIm5hdl9fbWVudS1pY29uLS1tZW51LWlzLWFjdGl2ZVwiKTtcblx0JCh0aGlzKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnb3BlbicpO1xufSk7XG5cbiQoJy5zZWNvbmQtbGV2ZWwtLW9wZW4nKS5jbGljayhmdW5jdGlvbigpe1xuXHQkKHRoaXMpLnBhcmVudCgpLnRvZ2dsZUNsYXNzKCduYXZfX2l0ZW0tLW9wZW5lZCcpO1xuXHRpZiAoJCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nKSA9PSAndHJ1ZScpIHtcblx0XHQkKHRoaXMpLm5leHQoKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG5cdH0gZWxzZSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG5cdH1cblxuXHRpZiAoJCh0aGlzKS5hdHRyKCdhcmlhLWV4cGFuZGVkJykgPT0gJ2ZhbHNlJykge1xuXHRcdCQodGhpcykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJylcblx0fSBlbHNlIHtcblx0XHQkKHRoaXMpLm5leHQoKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcblx0fVxufSk7XG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBCYWNrZ3JvdW5kIFZpZGVvXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiQoJy5iYWNrZ3JvdW5kdmlkZW9fX2xpbmsnKS5jbGljayhmdW5jdGlvbihlKXtcblx0dmFyIHRoYXQgPSAkKHRoaXMpO1xuXHR2YXIgdmlkZW8gPSB0aGF0LmRhdGEoJ3ZpZGVvJyk7XG5cdHZhciB3aWR0aCA9ICQoJ2ltZycsIHRoYXQpLndpZHRoKCk7XG5cdHZhciBoZWlnaHQgPSAkKCdpbWcnLCB0aGF0KS5oZWlnaHQoKTtcblx0dGhhdC5wYXJlbnQoKS5hZGRDbGFzcygnb24nKTtcblx0dGhhdC5wYXJlbnQoKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiZmxleC12aWRlbyB3aWRlc2NyZWVuXCI+PGlmcmFtZSBzcmM9XCJodHRwOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycgKyB2aWRlbyArICc/cmVsPTAmYXV0b3BsYXk9MVwiIHdpZHRoPVwiJyArIHdpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBoZWlnaHQgKyAnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2Via2l0QWxsb3dGdWxsU2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd0Z1bGxTY3JlZW4+PC9pZnJhbWU+PC9kaXY+Jyk7XG5cdHRoYXQuaGlkZSgpO1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9BdXRvbWF0aWMgZnVsbCBoZWlnaHQgc2lsZGVyLCBub3Qgd29ya2luZyB5ZXQuLlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbi8vIGZ1bmN0aW9uIHNldERpbWVuc2lvbnMoKXtcbi8vICAgIHZhciB3aW5kb3dzSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG4vLyAgICAkKCcub3JiaXQtY29udGFpbmVyJykuY3NzKCdoZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyAgIC8vICQoJy5vcmJpdC1jb250YWluZXInKS5jc3MoJ21heC1oZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG5cbi8vICAgICQoJy5vcmJpdC1zbGlkZScpLmNzcygnaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuLy8gICAgJCgnLm9yYml0LXNsaWRlJykuY3NzKCdtYXgtaGVpZ2h0Jywgd2luZG93c0hlaWdodCArICdweCcpO1xuLy8gfVxuXG4vLyAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuLy8gICAgIHNldERpbWVuc2lvbnMoKTtcbi8vIH0pO1xuXG4vLyBzZXREaW1lbnNpb25zKCk7Il19
