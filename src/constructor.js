;window.onload = (function($) {
/*
  List of Widgets
*/
  function DropDownList () {
      var root = $.get('.np-vidget-choise').item(false);
      var placeholder = $.get('#np-choise-placeholder').item(false);
      var list = $.find(root, '#np-choise-list').item(false);
      var self = this;

      var resetPlaceholder = function() {
        $.text(self.model.placeholder, self.model.text);
      };

      this.model = {
        selector: root,
        placeholder: placeholder,
        text: $.text(placeholder),
        items: $.children(list),
        active: "tracking"
      }

      this.init = (function () {
        updateModel('text', $.text(self.model.items[0]), self.model);
      })()

      this.update = (function () {
        var model = self.model;

        resetPlaceholder();

        $.on(model.selector, 'mousedown', function () {
          $.setStyle(this, { 'height': 'auto' });
        });

        $.on(model.selector, 'mouseleave', function() {
          $.setStyle(this, { 'height': '' });
        });

        forEach(model.items, function(item, key) {
          $.on(item, 'click', function () {
            updateModel("text", $.text(this), model);
            resetPlaceholder();

            switch ( model.text ) {
              case "Розрахування вартості":
                updateModel('active', 'calculator', model);
                updateModel('active', true, Preview.model.items.calculator);
                updateModel('active', false, Preview.model.items.tracking);
                update({
                  activeComponent: Preview.model.items[model.active]
                }, Settings.model);
                pushValues(Settings.model.width, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].width);
                pushValues(Settings.model.minHeight, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].minHeight);
                pushValues(Settings.model.borderRadius, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].borderRadius);
                Settings.model.activeComponent.node.removeAttribute("style");
                $.text($.get('#np-source-container').item(false), Settings.model.activeComponent.node.outerHTML);
                getLink('css', '#np-link-to-css', 'Calc/styles/calc.css');
                getLink('js', '#np-link-to-js', 'Calc/dist/calc.min.js');
                $.setStyle($.get('.np-if-disabled').item(false), { display: "" });
              break;
              case "Трекінг посилки":
                updateModel('active', 'tracking', model);
                updateModel('active', true, Preview.model.items.tracking);
                updateModel('active', false, Preview.model.items.calculator);
                update({
                  activeComponent: Preview.model.items[model.active]
                }, Settings.model);
                pushValues(Settings.model.width, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].width);
                pushValues(Settings.model.minHeight, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].minHeight);
                pushValues(Settings.model.borderRadius, Settings.model.activeComponent.sizes[Settings.model.activeComponent.state].borderRadius);
                Settings.model.activeComponent.node.removeAttribute("style");
                $.text($.get('#np-source-container').item(false), Settings.model.activeComponent.node.outerHTML);
                getLink('css', '#np-link-to-css', 'Tracking/styles/tracking.css');
                getLink('js', '#np-link-to-js', 'Tracking/dist/track.min.js');
                $.setStyle($.get('.np-if-disabled').item(false), { display: "" });
              break;
              case "Пошук відділення":
                updateModel('active', 'map', model);
                updateModel('active', true, Preview.model.items.map);
                updateModel('active', false, Preview.model.items.tracking);
                updateModel('active', false, Preview.model.items.calculator);
                update({activeComponent: Preview.model.items[model.active]}, Settings.model);
                getLink('css', '#np-link-to-css', 'Map/styles/map.css');
                getLink('js', '#np-link-to-js', 'Map/dist/map.min.js');
                Settings.model.activeComponent.node.removeAttribute("style");
                $.text($.get('#np-source-container').item(false), Settings.model.activeComponent.node.outerHTML);
                $.setStyle($.get('.np-if-disabled').item(false), { display: "block" });
              break;
            }

            switch ( model.active ) {
              case "tracking":
                var track = Preview.model.items[model.active];
                var checked = StateToggle.model.items;
                if ( this === this ) {
                  update({ state: "vertical" }, StateToggle.model);
                  pushValues(Settings.model.width, Settings.model.activeComponent.sizes[StateToggle.model.state].width);
                  pushValues(Settings.model.minHeight, Settings.model.activeComponent.sizes[StateToggle.model.state].minHeight);
                  pushValues(Settings.model.borderRadius, Settings.model.activeComponent.sizes[StateToggle.model.state].borderRadius);
                }
                checked[0].checked = false;
                checked[1].checked = true;

                $.setStyle(Preview.model.items['map'].node, {"display" : "none"});
                $.setStyle(Preview.model.items['calculator'].node, {"display" : "none"});
                $.setStyle(Preview.model.items['tracking'].node, {"display" : ""});

                Preview.model.items['tracking'].node.classList.remove('np-widget-hz');
              break;
              case "calculator":
                var calc = Preview.model.items[model.active];
                var checked = StateToggle.model.items;
                if ( this === this ) {
                  update({ state: "vertical" }, StateToggle.model);
                  pushValues(Settings.model.width, Settings.model.activeComponent.sizes[StateToggle.model.state].width);
                  pushValues(Settings.model.minHeight, Settings.model.activeComponent.sizes[StateToggle.model.state].minHeight);
                  pushValues(Settings.model.borderRadius, Settings.model.activeComponent.sizes[StateToggle.model.state].borderRadius);
                }
                checked[0].checked = false;
                checked[1].checked = true;

                $.setStyle(Preview.model.items['map'].node, {"display" : "none"});
                $.setStyle(Preview.model.items['tracking'].node, {"display" : "none"});
                $.setStyle(Preview.model.items['calculator'].node, {"display" : ""});

                Preview.model.items['calculator'].node.classList.remove('np-widget-hz');
              break;
              case "map":
                var calc = Preview.model.items[model.active];
                var checked = StateToggle.model.items;

                checked[0].checked = false;
                checked[1].checked = true;

                $.setStyle(Preview.model.items['map'].node, {"display" : ""});
                $.setStyle(Preview.model.items['tracking'].node, {"display" : "none"});
                $.setStyle(Preview.model.items['calculator'].node, {"display" : "none"});

                Preview.model.items['map'].node.classList.remove('np-widget-hz');
              break;
            }
          });
        });
      })()
    }
  /*
    State Radio Buttons
  */
var StateChangeBlock = function () {
    var root = $.get('#np-checkbox-state').item(false);
    var self = this;

    this.model = {
      selector: root,
      items: $.children(root),
      state: null
    }

    this.init = (function () {
      renderCheckedComponent();
      updateModel("state", getProp(self.model.items[1], "value"), self.model);
    })()

    this.update = (function () {
      var model = self.model;

      forEach(model.items, function (item) {
        $.on(item, "change", function () {
          if ( List.model.active !== "map" ) {
            renderCheckedComponent();
            updateModel("state", getProp(item, "value"), model);
            pushValues(Settings.model.width, Settings.model.activeComponent.sizes[model.state].width);
            pushValues(Settings.model.minHeight, Settings.model.activeComponent.sizes[model.state].minHeight);
            pushValues(Settings.model.borderRadius, Settings.model.activeComponent.sizes[model.state].borderRadius);
            $.text($.get('#np-source-container').item(false), Settings.model.activeComponent.node.outerHTML);
            Settings.model.activeComponent.node.removeAttribute("style");
            if ( !Settings.model.activeComponent.node.classList.contains("np-widget-hz") ) {
              Settings.model.activeComponent.node.classList.value = "";
              Settings.model.activeComponent.node.classList.add("np-w-br-0");
            } else {
              Settings.model.activeComponent.node.classList.add("np-widget-hz");
              Settings.model.activeComponent.node.classList.add("np-w-br-0");
            }
          }
        });
      });
    })()

    function getProp(target, value) {
      if ( !target[value] ) {
        return target.attributes[value];
      } else {
        return target[value];
      }
    }

    function renderCheckedComponent() {
      if ( Preview ) {
        var target = Preview.model.items[List.model.active];
        var state = target.state;

        forEach(self.model.items, function (item) {
          if (item.checked == false) {
            return false;
          }

          updateModel("state", getProp(item, "value"), target);

          if ( target.state == 'vertical' ) {
            target.node.classList.remove('np-widget-hz');
          }

          if ( target.state == 'horizontal' ) {
            target.node.classList.add('np-widget-hz');
          }
          if ( List.model.active !== "map" ) {
            pushValues(Settings.model.width, target.sizes[state].width);
            pushValues(Settings.model.minHeight, target.sizes[state].minHeight);
            pushValues(Settings.model.borderRadius, target.sizes[state].borderRadius);
          }

          $.text($.get('#np-source-container').item(false), Settings.model.activeComponent.node.outerHTML);
        });
      }
    };
  }
  /*
    Preview
  */
  function PreviewComponent () {
    var self = this;
    var root = $.get('#np-preview').item(false);
    var tracking = $.get('#np-tracking').item(false);
    var calc = $.get('#np-calc-body').item(false);
    var map = $.get('#np-map').item(false);

    var patterns = {
      tracking: {
        vertical:
          {
            width: { min: 200, max: 250 }, minHeight: { min: 322, max: 370 }, borderRadius: { min: 0, max: 12 }
          },
        horizontal:
          {
            width: { min: 434, max: 534 }, minHeight: { min: 76, max: 100 }, borderRadius: { min: 0, max: 12 }
          }
      },
      calculator: {
        vertical: {
          width: { min: 200, max: 250 }, minHeight: { min: 322, max: 370 }, borderRadius: { min: 0, max: 12 }
        },
        horizontal: {
          width: { min: 575, max: 950 }, minHeight: { min: 76, max: 100 }, borderRadius: { min: 0, max: 12 }
        }
      }
    }

    var showCurrentWidget = function(model) {
      var current = model.items;
      var element = current[List.model.active];
      var state = element.state;

      update({
        activeComponent: element
      }, Settings.model);

      pushValues(Settings.model.width, element.sizes[state].width);
      pushValues(Settings.model.minHeight, element.sizes[state].minHeight);
      pushValues(Settings.model.borderRadius, element.sizes[state].borderRadius);

      switch (List.model.active) {
        case "tracking":
          $.setStyle(current["calculator"].node, {"display" : "none"});
          $.setStyle(current['map'].node, {"display" : "none"});
          $.text($.get('#np-source-container').item(false), current["tracking"].node.outerHTML);
          getLink('css', '#np-link-to-css', 'Tracking/styles/tracking.css');
          getLink('js', '#np-link-to-js', 'Tracking/dist/track.min.js');
        break;
        case "calculator":
          $.setStyle(current["tracking"].node, {"display" : "none"});
          $.setStyle(current['map'].node, {"display" : "none"});
        break;
        case "map":
          $.setStyle(current["tracking"].node, {"display" : "none"});
          $.setStyle(current["calculator"].node, {"display" : "none"});
        break;
      }
    };

    this.model = {
      selector: root,
      items: {
        tracking: {
          node: tracking,
          sizes: {
            vertical: patterns.tracking.vertical,
            horizontal: patterns.tracking.horizontal
          },
          state: StateToggle.model.state,
          active: true
        },
        calculator: {
          node: calc,
          sizes: {
            vertical: patterns.calculator.vertical,
            horizontal: patterns.calculator.horizontal
          },
          state: StateToggle.model.state,
          active: false
        },
        map: {
          node: map,
          active: false
        }
      }
    }

    this.init = (function () {
      showCurrentWidget(self.model);
    })()
  }

  var pushValues = function(target, values) {
    var textInput = target.text;
    var range = target.range;

    changeAttrs(textInput, range, values);
  };

  var changeAttrs = function(text, target, values) {
    var targetAttrs = target.attributes;
    var props = Object.keys(values);

    for ( var i = 0; i < props.length; i++ ) {
      var attr = props[i];

      if ( targetAttrs.hasOwnProperty(attr) ) {
        target[attr] = values[attr];
        target.value = target.min;
        text.value = target.value;
      }
    }
  };

  var updateAttr = function(target, attr, value) {
    if ( target.attributes.hasOwnProperty(attr) ) {
      target[attr] = value;
    }

    return false;
  };

  var update = function(values, model) {
    for ( var key in values ) {
      model[key] = values[key];
    }
  };

  var SettingsComponent = function() {
    var self = this;
    var textProps = $.get('.np-custom-prop');
    var ranges = $.get('.np-range');
    var colors = $.get('.np-color');

    this.model = {
      width: {
        text: textProps[0],
        range: ranges[0]
      },
      minHeight: {
        text: textProps[1],
        range: ranges[1]
      },
      borderRadius: {
        text: textProps[2],
        range: ranges[2]
      },
      activeComponent: null
    };

    function updateRanges(target, model, cb) {
      $.on(target, 'mousemove', function() {
        updateAttr(model.text, "value", this.value);
        cb(this);
      });
    }

    this.update = (function () {
      forEach(ranges, function(value, key) {
        $.on(value, "mousedown", function () {
          var styles = {};
          var current = self.model[value.name];

          updateRanges(this, current, function (target) {
            var component = self.model.activeComponent.node;
            var name = target.name;

            if ( value.name == "borderRadius" ) {
              var className = "np-w-br-" + target.value;

              if ( self.model.activeComponent.state == "horizontal" ) {
                component.classList.value = "np-widget-hz " + className;
              } else {
                component.classList.value = className;
              }
            }

            if ( component.id !== "np-map" && value.name !== "borderRadius" ) {
              styles[name] = target.value + 'px';
              $.setStyle(component, styles);
            }

            $.text($.get('#np-source-container').item(false), component.outerHTML);
          });
        });
        $.on(textProps[key], "input", function(e) {
          var styles = {};
          var component = self.model.activeComponent.node;
          var range = ranges[key];

          updateAttr(range, "value", this.value);

          if ( component.id !== "np-map" && value.name !== "borderRadius" ) {
            styles[name] = target.value + 'px';
            $.setStyle(component, styles);
          }

          $.text($.get('#np-source-container').item(false), component.outerHTML);
        });
      });

      forEach(colors, function(v) {
        $.on(v, "click", function (e) {
          if ( self.model.activeComponent.node.id !== "np-map" ) {
            var rgb = $.getStyle(this, "background-color");

            $.setStyle(self.model.activeComponent.node, { backgroundColor: rgb });
            $.text($.get('#np-source-container').item(false), self.model.activeComponent.node.outerHTML);
          }
        });
      });

      $.on($.get('#np-copy-button').item(false), "click", function () {
        selectElementText($.get('#np-source-container').item(false));
        copyTextNode();
      });

      $.on($.get('#np-button-css').item(false), "click", function () {
        selectElementText($.get('#np-link-to-css').item(false));
        copyTextNode();
      });

      $.on($.get('#np-button-js').item(false), "click", function () {
        selectElementText($.get('#np-link-to-js').item(false));
        copyTextNode();
      });
    })();
  };


  var Settings = new SettingsComponent();
  var List = new DropDownList();
  var StateToggle = new StateChangeBlock();
  var Preview = new PreviewComponent();

  function getLink(state, target, link) {
    switch (state) {
      case "css":
        $.text($.get(target).item(false), "<link rel='stylesheet' href='" + "https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/" + link + "' />");
      break;
      case "js":
        $.text($.get(target).item(false), "<script type='text/javascript' src='" + "https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/" + link + "'></script>");
      break;
    }
  }

  function selectElementText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }


  function copyTextNode() {
    var success;

    try {
      success = document.execCommand('copy');
    } catch(err) {
      success = false;
    }

    return success;
  }

  function updateModel (key, value, tar) {
    var target = tar;

    return target[key] = value;
  }

   function forEach (object, callBack) {
      var i;
      var l;
      var tObject = Object.prototype.toString.call(object);

      if (tObject !== "[object Array]" && tObject !== "[object Object]" && tObject !== "[object NodeList]") {
        throw new TypeError("'object' must be an array or object");
      }

      if (Object.prototype.toString.call(callBack) !== "[object Function]") {
        throw new TypeError("'callBack' must be a function");
      }

      if (tObject === "[object Array]" || tObject === "[object NodeList]") {
        i = 0;
        l = object.length;

        while (i < l) {
          callBack(object[i], i);

          i += 1;
        }

        return;
      }

      for (i in object) {
        if (object.hasOwnProperty(i)) {
          callBack(object[i], i);
        }
      }

    return;
  };

})(NPWUtils);
