;window.onload = (function ($) {

    var request = {Cost: '200'};
    var cityNames = {};
    var inputs = $.find($.get('#np-calc-body').item(false), '.np-calc-field');
    var widgetWrapper = $.get('#np-calc-body').item(false);
    var citySender = inputs[0];
    var cityRecipient = inputs[1];
    var weight = $.get('.np-option-search-item-weight').item(false);
    var checkCurrentValueButton = $.get('#np-calc-submit').item(false);
    var returnButton = $.get('#np-cost-return-button').item(false);
    var errorButton = $.get('#np-error-return-button').item(false);

    var xhr = (function () {
        if (window.XDomainRequest) {
            return new XDomainRequest();
        } else {
            return new XMLHttpRequest();
        }
    })();

    function setPlaceholderOnWeightInput() {
        if (widgetWrapper.classList.contains('np-widget-hz')) {
            $.setAttrs(weight, 'placeholder', 'Вага');
        }
    }

    setPlaceholderOnWeightInput();

    disable(checkCurrentValueButton);

    sendXHR('Address', 'getCities', null, true, function (res) {
        var data = res.data;

        for (var key in inputs) {
            if (typeof inputs[key] === 'function' || typeof inputs[key] === 'number') {
                continue;
            }

            var name = getName(inputs[key]);

            if (name == 'dispatch' || name == 'catch') {
                var enter = $.find(inputs[key], '.np-options-enter-point')[0];

                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var city = item.Description;
                    var ref = item.Ref;

                    var element = $.createElement({
                        tag: 'li',
                        ref: ref,
                        class: 'np-options-list-item',
                        text: city
                    });

                    $.append(enter, element);
                }
            }
        }

        $.on(citySender, 'click', function () {
            var self = this;
            var input = $.find(this, '.np-option-search-item')[0];
            var enterPoint = $.find(this, '.np-options-enter-point')[0];
            var items = $.children(enterPoint);
            var role = this.attributes.role.value;

            $.setStyle(enterPoint, {'display': 'block'});

            $.on(input, 'input', function () {
                var value = this.value;
                $.setStyle(enterPoint, {'display': 'block'});
                validate();
                filterResults(getSearchValue(this), items);

                getRef(this.value, items, role, cityNames);
            });

            for (var item in items) {
                if (items.hasOwnProperty([item])) {
                    if (!items[item]) {
                        continue;
                    }
                    $.on(items[item], 'mousedown', function () {

                        cityNames[role] = $.text(this);
                        request[role] = this.ref;
                        input.value = $.text(this);

                        $.setStyle(enterPoint, {'display': 'none'});
                        validate();
                    });
                }
            }
        });

        $.on(citySender, 'mouseleave', function () {
            var enterPoint = $.find(this, '.np-options-enter-point')[0];
            $.setStyle(enterPoint, {'display': 'none'});
        });

        $.on(cityRecipient, 'click', function () {
            var self = this;
            var input = $.find(this, '.np-option-search-item')[0];
            var enterPoint = $.find(this, '.np-options-enter-point')[0];
            var items = $.children(enterPoint);
            var role = this.attributes.role.value;

            $.setStyle(enterPoint, {'display': 'block'});

            $.on(input, 'input', function () {
                var value = this.value;
                $.setStyle(enterPoint, {'display': 'block'});
                validate();
                filterResults(getSearchValue(this), items);

                getRef(this.value, items, role, cityNames);
            });

            for (var item in items) {
                if (items.hasOwnProperty([item])) {
                    if (!items[item]) {
                        continue;
                    }

                    $.on(items[item], 'mousedown', function () {
                        cityNames[role] = $.text(this);
                        request[role] = this.ref;
                        input.value = $.text(this);

                        $.setStyle(enterPoint, {'display': 'none'});
                        validate();
                    });
                }
            }
        });
        $.on(cityRecipient, 'mouseleave', function () {
            var enterPoint = $.find(this, '.np-options-enter-point')[0];
            $.setStyle(enterPoint, {'display': 'none'});
        });


        $.on(weight, 'input', function (e) {
            var role = $.parent(this).attributes.role.value;
            request[role] = parseInt(this.value);
            // removing character if not number
            !/^\d+$/.test(e.target.value) ? e.target.value = e.target.value.substring(0, e.target.value.length - 1) : false;
            validate();
        });

        $.on(checkCurrentValueButton, 'click', function () {
            xhr.onloadstart = function () {
                $.setStyle($.get('#np-text-button').item(false), {'display': 'none'});
                $.setStyle($.get('#np-load-image').item(false), {
                    'visibility': 'visible',
                    'transform': 'rotate(-360deg)'
                });
            };
            xhr.onloadend = function () {
                $.setStyle($.get('#np-load-image').item(false), {'visibility': 'hidden', 'transform': ''});
                $.setStyle($.get('#np-text-button').item(false), {'display': 'block'});
            };

            sendXHR('InternetDocument', 'getDocumentPrice', request, true, function (res) {
                    var success = res.success;
                    var calcWrap = $.get('.np-calc-wrapper').item(false);
                    var errorWrap = $.get('#np-error-field').item(false);
                    var costField = $.get('#np-cost-field').item(false);
                    var currentCity = $.get('#np-current-city').item(false);
                    var currentWeight = $.get('#np-current-weight').item(false);
                    var deliveryMethod = 'CostWarehouseWarehouse';
                    var data = res.data[0];

                    $.setStyle(calcWrap, {'display': 'none'});
                    $.setStyle(costField, {'display': 'flex'});

                    if (success) {
                        $.text($.get('#np-cost-number').item(false), data[deliveryMethod]);
                        $.html(currentCity, '<span>' + cityNames['CitySender'] + '</span class="np-arrow">' + '<span>&rarr;</span>' + '<span>' + cityNames['CityRecipient'] + '</span>');
                        $.text(currentWeight, request['Weight']);
                    } else {
                        $.setStyle(costField, {'display': 'none'});
                        $.setStyle(errorWrap, {'display': 'flex'});
                    }
                }
            );
        });

        $.on(weight, 'keydown', function (e) {
            if (e.keyCode == 13 && checkCurrentValueButton.disabled == false) {
                xhr.onloadstart = function () {
                    $.setStyle($.get('#np-text-button').item(false), {'display': 'none'});
                    $.setStyle($.get('#np-load-image').item(false), {
                        'visibility': 'visible',
                        'transform': 'rotate(-360deg)'
                    });
                };
                xhr.onloadend = function () {
                    $.setStyle($.get('#np-load-image').item(false), {'visibility': 'hidden', 'transform': ''});
                    $.setStyle($.get('#np-text-button').item(false), {'display': 'block'});
                };

                sendXHR('InternetDocument', 'getDocumentPrice', request, true, function (res) {
                        var success = res.success;
                        var calcWrap = $.get('.np-calc-wrapper').item(false);
                        var errorWrap = $.get('#np-error-field').item(false);
                        var costField = $.get('#np-cost-field').item(false);
                        var currentCity = $.get('#np-current-city').item(false);
                        var currentWeight = $.get('#np-current-weight').item(false);
                        var deliveryMethod = 'CostWarehouseWarehouse';
                        var data = res.data[0];

                        $.setStyle(calcWrap, {'display': 'none'});
                        $.setStyle(costField, {'display': 'flex'});

                        if (success) {
                            $.text($.get('#np-cost-number').item(false), data[deliveryMethod]);
                            $.html(currentCity, '<span>' + cityNames['CitySender'] + '</span class="np-arrow">' + '<span>&rarr;</span>' + '<span>' + cityNames['CityRecipient'] + '</span>');
                            $.text(currentWeight, request['Weight']);
                        } else {
                            $.setStyle(costField, {'display': 'none'});
                            $.setStyle(errorWrap, {'display': 'flex'});
                        }
                    }
                );
            }
        });
    });

    $.on(returnButton, 'click', function () {
        for (var key in inputs) {
            if (typeof inputs[key] === 'function' || typeof inputs[key] === 'number') {
                continue;
            }
            var input = $.children(inputs[key])[0];

            input.value = null;
            disable(checkCurrentValueButton);
        }

        $.setStyle($.get('.np-calc-wrapper').item(false), {'display': 'flex'});
        $.setStyle($.get('#np-cost-field').item(false), {'display': 'none'});

        request = {Cost: "200"};
        resetSearchResult();
    });

    if (errorButton) {
        $.on(errorButton, 'click', function () {
            for (var key in inputs) {
                if (typeof inputs[key] === 'function' || typeof inputs[key] === 'number') {
                    continue;
                }
                var input = $.children(inputs[key])[0];

                input.value = null;
                disable(checkCurrentValueButton);
            }

            $.setStyle($.get('.np-calc-wrapper').item(false), {'display': 'flex'});
            $.setStyle($.get('#np-error-field').item(false), {'display': 'none'});

            request = {Cost: "200"};
            resetSearchResult();
        });
    }

    function sendXHR(modelName, calledMethod, props, async, cb) {
        var url = 'https://api.novaposhta.ua/v2.0/json/';

        var body = {
            modelName: modelName,
            calledMethod: calledMethod,
            methodProperties: props,
            MarketplacePartnerToken: "005056887b8d-a9f2-11e6-735b-be254fe6"
        };

        $.send(xhr, 'POST', url, JSON.stringify(body), async, cb);
    }

    function getName(target) {
        return target.attributes.name.value;
    }

    function getSearchValue(search) {
        return search.value;
    }

    /*
     Disable component
     */
    function disable(component) {
        component.disabled = true;
        $.setStyle(component, {'background-color': '#d1d5da', 'border': '1px solid #c4c4c4'});
    }

    /*
     Enable component
     */
    function enable(component) {
        component.disabled = false;
        $.setStyle(component, {'background-color': '', 'border': '1px solid transparent'});
    }

    function resetSearchResult() {
        var enterPoint = $.get('.np-options-enter-point');

        for (var i = 0; i < enterPoint.length; i++) {
            var items = enterPoint[i];

            $.children(items).forEach(function (value) {
                if (value.style.display == "none") {
                    value.style.display = "";
                }
            });
        }
    }

    function getRef(input, arr, role, names) {
        var r = new RegExp(input, "i");

        for (var item in arr) {
            if (arr.hasOwnProperty([item])) {
                if (!arr[item]) {
                    continue;
                }

                var res = $.text(arr[item]).match(r);

                if (res) {
                    if (res.index == 0 && input == res.input) {
                        var ref = arr[item].ref;

                        request[role] = ref;
                        names[role] = $.text(arr[item]);
                    }
                }
            }
        }
    }

    function filterResults(pattern, results) {
        var reg = new RegExp(pattern, "i");

        results.forEach(function (value, key) {
            if ($.text(value).match(reg) || $.text(value) == '') {
                $.setStyle(value, {'display': 'block'});

                return false;
            }

            if ($.children(value).length == 0) {
                $.setStyle(value, {'display': 'none'});

                return false;
            }
        });
    }

    function validate() {
        var inputs = $.find(document.body, '.np-option-search-item');
        var arr = [];

        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];

            if (input.value.length > 0) {
                arr.push(input);
            }
        }

        if (weight.value.length > 0) {
            arr.push(weight);
        }

        if (arr.length == 3) {
            enable(checkCurrentValueButton);
        } else {
            disable(checkCurrentValueButton);
        }
    }

})(NPWUtils);
