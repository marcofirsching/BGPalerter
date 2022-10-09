"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _axiosEnrich = _interopRequireDefault(require("../utils/axiosEnrich"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Monitor = /*#__PURE__*/_createClass(function Monitor(name, channel, params, env, input) {
  var _this = this;

  _classCallCheck(this, Monitor);

  _defineProperty(this, "updateMonitoredResources", function () {
    throw new Error('The method updateMonitoredResources must be implemented in ' + _this.name);
  });

  _defineProperty(this, "monitor", function (message) {
    return new Promise(function (resolve, reject) {
      reject("You must implement a monitor method");
    });
  });

  _defineProperty(this, "filter", function (message) {
    throw new Error('The method filter must be implemented in ' + _this.name);
  });

  _defineProperty(this, "squashAlerts", function (alerts) {
    throw new Error('The method squashAlerts must be implemented in ' + _this.name);
  });

  _defineProperty(this, "_squash", function (id) {
    var alerts = _this.alerts[id] || [];

    if (alerts && alerts.length) {
      var message = _this.squashAlerts(alerts);

      if (message) {
        var firstAlert = alerts[0];
        var earliest = Infinity;
        var latest = -Infinity;

        var _iterator = _createForOfIteratorHelper(alerts),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _alert$matchedMessage, _alert$matchedMessage2, _alert$matchedMessage3, _alert$matchedMessage4;

            var alert = _step.value;
            earliest = Math.min((_alert$matchedMessage = (_alert$matchedMessage2 = alert.matchedMessage) === null || _alert$matchedMessage2 === void 0 ? void 0 : _alert$matchedMessage2.timestamp) !== null && _alert$matchedMessage !== void 0 ? _alert$matchedMessage : alert.timestamp, earliest);
            latest = Math.max((_alert$matchedMessage3 = (_alert$matchedMessage4 = alert.matchedMessage) === null || _alert$matchedMessage4 === void 0 ? void 0 : _alert$matchedMessage4.timestamp) !== null && _alert$matchedMessage3 !== void 0 ? _alert$matchedMessage3 : alert.timestamp, latest);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return {
          id: id,
          truncated: _this.truncated[id] || false,
          origin: _this.name,
          earliest: earliest,
          latest: latest,
          affected: firstAlert.affected,
          message: message,
          data: alerts
        };
      }
    }
  });

  _defineProperty(this, "publishAlert", function (id, affected, matchedRule, matchedMessage, extra) {
    var now = new Date().getTime();
    var context = {
      timestamp: now,
      affected: affected,
      matchedRule: matchedRule,
      matchedMessage: matchedMessage,
      extra: extra
    };

    if (!_this.sent[id] || !_this.config.alertOnlyOnce && now > _this.sent[id] + _this.internalConfig.notificationInterval) {
      _this.alerts[id] = _this.alerts[id] || [];

      _this.alerts[id].push(context); // Check if for each alert group the maxDataSamples parameter is respected


      if (_this.alerts[id].length > _this.maxDataSamples) {
        if (!_this.truncated[id]) {
          _this.truncated[id] = _this.alerts[id][0].timestamp; // Mark as truncated
        }

        _this.alerts[id] = _this.alerts[id].slice(-_this.maxDataSamples); // Truncate
      }

      _this._publishGroupId(id, now);

      return true;
    }

    return false;
  });

  _defineProperty(this, "_publishFadeOffGroups", function () {
    var now = new Date().getTime();

    for (var id in _this.fadeOff) {
      _this._publishGroupId(id, now);
    }

    if (!_this.config.alertOnlyOnce) {
      for (var _id in _this.alerts) {
        if (now > _this.sent[_id] + _this.internalConfig.notificationInterval) {
          delete _this.sent[_id];
        }
      }
    }
  });

  _defineProperty(this, "_retrieveStatus", function () {
    if (_this.config.persistStatus && _this.storage) {
      _this.storage.get("status-".concat(_this.name)).then(function (_ref) {
        var _ref$sent = _ref.sent,
            sent = _ref$sent === void 0 ? {} : _ref$sent,
            _ref$truncated = _ref.truncated,
            truncated = _ref$truncated === void 0 ? {} : _ref$truncated,
            _ref$fadeOff = _ref.fadeOff,
            fadeOff = _ref$fadeOff === void 0 ? {} : _ref$fadeOff;
        _this.sent = sent;
        _this.truncated = truncated;
        _this.fadeOff = fadeOff;
      })["catch"](function (error) {
        _this.logger.log({
          level: 'error',
          message: error
        });
      });
    }
  });

  _defineProperty(this, "_persistStatus", function () {
    if (_this._persistStatusTimer) {
      clearTimeout(_this._persistStatusTimer);
    }

    _this._persistStatusTimer = setTimeout(_this._persistStatusHelper, 5000);
  });

  _defineProperty(this, "_persistStatusHelper", function () {
    if (_this.config.persistStatus && _this.storage) {
      var status = {
        sent: _this.sent,
        truncated: _this.truncated,
        fadeOff: _this.fadeOff
      };

      if (Object.values(status).some(function (i) {
        return Object.keys(i).length > 0;
      })) {
        // If there is anything in the cache
        _this.storage.set("status-".concat(_this.name), status)["catch"](function (error) {
          _this.logger.log({
            level: 'error',
            message: error
          });
        });
      }
    }
  });

  _defineProperty(this, "_publishGroupId", function (id, now) {
    var group = _this._squash(id);

    if (group) {
      _this._publishOnChannel(group);

      _this.sent[id] = now;
      delete _this.alerts[id];
      delete _this.fadeOff[id];
      delete _this.truncated[id];
    } else if (_this.fadeOff[id]) {
      if (now > _this.fadeOff[id] + _this.internalConfig.fadeOff) {
        delete _this.fadeOff[id];
        delete _this.alerts[id];
        delete _this.truncated[id];
      }
    } else {
      _this.fadeOff[id] = _this.fadeOff[id] || now;
    }
  });

  _defineProperty(this, "_publishOnChannel", function (alert) {
    _this.pubSub.publish(_this.channel, alert);

    _this._persistStatus();

    return alert;
  });

  _defineProperty(this, "getMonitoredAsMatch", function (originAS) {
    var monitored = _this.input.getMonitoredASns();

    var _iterator2 = _createForOfIteratorHelper(monitored),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var m = _step2.value;

        if (originAS.includes(m.asn)) {
          return m;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return null;
  });

  _defineProperty(this, "_included", function (matched) {
    if (matched.includeMonitors.length > 0) {
      return matched.includeMonitors.includes(_this.name);
    } else {
      return !matched.excludeMonitors.includes(_this.name);
    }
  });

  _defineProperty(this, "getMoreSpecificMatch", function (prefix, includeIgnoredMorespecifics) {
    var verbose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var matched = _this.input.getMoreSpecificMatch(prefix, includeIgnoredMorespecifics);

    if (matched) {
      var included = _this._included(matched);

      if (verbose) {
        return {
          matched: matched,
          included: included
        };
      } else if (included) {
        return matched;
      }
    }

    return null;
  });

  this.config = env.config;
  this.pubSub = env.pubSub;
  this.logger = env.logger;
  this.rpki = env.rpki;
  this.input = input;
  this.storage = env.storage;
  this.params = params || {};
  this.maxDataSamples = this.params.maxDataSamples || 1000;
  this.name = name;
  this.channel = channel;
  this.monitored = [];
  this.axios = (0, _axiosEnrich["default"])(_axios["default"], !this.params.noProxy && env.agent ? env.agent : null, "".concat(env.clientId, "/").concat(env.version));
  this.alerts = {}; // Dictionary containing the alerts <id, Array>. The id is the "group" key of the alert.

  this.sent = {}; // Dictionary containing the last sent unix timestamp of each group <id, int>

  this.truncated = {}; // Dictionary containing <id, boolean> if the alerts Array for "id" is truncated according to maxDataSamples

  this.fadeOff = {}; // Dictionary containing the last alert unix timestamp of each group  <id, int> which contains alerts that have been triggered but are not ready yet to be sent (e.g., thresholdMinPeers not yet reached)

  this._retrieveStatus();

  this.internalConfig = {
    notificationInterval: (this.config.notificationIntervalSeconds || 14400) * 1000,
    checkFadeOffGroups: (this.config.checkFadeOffGroupsSeconds || 30) * 1000,
    fadeOff: this.config.fadeOffSeconds * 1000 || 60 * 6 * 1000
  };
  setInterval(this._publishFadeOffGroups, this.internalConfig.checkFadeOffGroups);
  this.input.onChange(function () {
    _this.updateMonitoredResources();
  });
});

exports["default"] = Monitor;