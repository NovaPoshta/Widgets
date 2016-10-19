;window.onload = (function () {

    "use strict";

    var root = document.createElement("div");
    root.id = "npw-map-wrapper";

    var sidebar = document.createElement("div");
    sidebar.id = "npw-map-sidebar";

    var header = document.createElement("div");
    header.id = "npw-map-sidebar-header";

    var logo = document.createElement("div");
    logo.id = "npw-map-logo";

    var back = document.createElement("div");
    back.id = "npw-map-back";

    var input = document.createElement("input");
    input.id = "npw-map-sidebar-search";
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Введіть номер відділення");

    header.appendChild(logo);
    header.appendChild(back);
    header.appendChild(input);

    var stateList = document.createElement("div");
    stateList.id = "npw-map-state-list";

    var citiesSelect = document.createElement("select");
    citiesSelect.id = "npw-cities";
    citiesSelect.setAttribute("name", "npw-cities");
    citiesSelect.setAttribute("onchange", "NPWidgetMap.onCityChange(this.value)");

    var ul = document.createElement("ul");
    ul.id = "npw-map-sidebar-ul";

    stateList.appendChild(citiesSelect);
    stateList.appendChild(ul);

    var detailsList = document.createElement("div");
    detailsList.id = "npw-map-state-details";

    sidebar.appendChild(header);
    sidebar.appendChild(stateList);
    sidebar.appendChild(detailsList);

    var map = document.createElement("div");
    map.id = "npw-map";

    var closeButton = document.createElement("div");
    closeButton.id = "npw-map-close-button";

    root.appendChild(sidebar);
    root.appendChild(map);
    root.appendChild(closeButton);

    document.body.appendChild(root);
})();

var NPWidgetMap = (function () {

    "use strict";

    var map,
        userLocationCityName,
        mapWrapper = document.getElementById('npw-map-wrapper'),
        mapOpenButton = document.getElementById('npw-map-open-button'),
        mapSidebarUl = document.getElementById('npw-map-sidebar-ul'),
        citiesList = document.getElementById('npw-cities'),
        stateList = document.getElementById('npw-map-state-list'),
        stateDetails = document.getElementById('npw-map-state-details'),
        mapLogo = document.getElementById('npw-map-logo'),
        mapBack = document.getElementById('npw-map-back'),
        inputFilter = document.getElementById('npw-map-sidebar-search'),
        closeButton = document.getElementById('npw-map-close-button'),
        mapInitialized = false,
        kiev = {lat: 50.4501, lng: 30.5234, coords: {latitude: 50.4501, longitude: 30.5234}, name: "Київ"},
        zeroLocalWarehousesFound = false,
        markers = [],
        firstMarker = {};

    function send(method, url, body, sync, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, sync);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var result = JSON.parse(this.responseText);
                    return callback(result);
                }
            }
        };
        xhr.send(body);
    }

    function onMapToggle () {
        !mapWrapper.classList.contains('npw-display-block') ?
            mapWrapper.classList.add('npw-display-block') :
            mapWrapper.classList.remove('npw-display-block');

        !mapOpenButton.classList.contains('npw-map-open-button-opened') ?
            mapOpenButton.classList.add('npw-map-open-button-opened') :
            mapOpenButton.classList.remove('npw-map-open-button-opened');

        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        var clientWidth = document.body.clientWidth || window.innerWidth;

        mapWrapper.style.top = (scrollTop + 15) + "px";
        mapWrapper.style.left = (clientWidth - mapWrapper.offsetWidth) / 2 + "px";
    }

    mapOpenButton.addEventListener("click", function () {

        onMapToggle();

        if (!mapInitialized) {
            initMap();
        }

    }, false);

    mapBack.addEventListener("click", function () {
        changeSidebarState('stateList');
    });

    inputFilter.addEventListener("input", function (e) {
        filterWarehouses(e.target.value);
    });

    closeButton.addEventListener("click", function () {
        onMapToggle();
    });

    function setMapCenter(event, changeState) {

        var loc;

        if ('loc' in event.target.attributes) {
            loc = event.target.attributes.loc.value.replace('(', '').replace(')', '').split(',');
        } else {
            loc = event.target.parentNode.getAttribute("loc").replace('(', '').replace(')', '').split(',');
        }

        var locObj = {
            lat: loc[0] * 1,
            lng: loc[1] * 1
        };

        map.setCenter(new google.maps.LatLng(locObj));

        if (changeState) {

            var idx = 0;

            if ('data-idx' in event.target.attributes) {
                idx = event.target.attributes['data-idx'].value;
            } else {
                idx = event.target.parentNode.getAttribute("data-idx");
            }

            changeSidebarState('stateDetails', idx);
            markers[idx].setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function () {
                markers[idx].setAnimation(null);
            }, 2120)
        }
    }

    function changeSidebarState (type, idx) {

        var url = '';

        switch (type) {
            case 'stateDetails':

                stateList.style.display = "none";
                stateDetails.style.display = "block";

                mapLogo.style.display = "none";
                mapBack.style.display = "block";

                url = encodeURI("https://novaposhta.ua/ru/office/view/id/" + markers[idx].number + "/city/" + markers[idx].name);

                stateDetails.innerHTML = "<div class='npw-details-title'>" + "Відділення №" + markers[idx].number + "</div>"
                    + "<div>" + "Адреса: " + markers[idx].vicinity + "</div>"
                    + "<div>" + "Телефон: " + markers[idx].phone + "</div>"
                    + "<div>" + "Тип: " + markers[idx].type + "</div>"
                    + "<div>" + "Обмеження ваги: " + markers[idx].maxWeight + "</div>"
                    + "<div>" + "<a href=" + url + " target='_blank'>Більше інформації на сайті</a></div>";

                break;

            case 'stateList':

                stateList.style.display = "block";
                stateDetails.style.display = "none";

                mapLogo.style.display = "block";
                mapBack.style.display = "none";

                stateDetails.innerHTML = "";

                break;
        }

    }

    function createMarker(place) {

        var marker = new google.maps.Marker({
            map: map,
            position: place
        });

    }

    function getCities(city) {

        send('POST', 'https://api.novaposhta.ua/v2.0/json/', JSON.stringify({
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {
                MarketplacePartnerToken: "005056887b8d-856b-11e6-9121-25f3f736"
            }
        }), true, function (res) {

            var data = res.data;

            //console.log('cities ', data);
            //console.log();

            for (var i = 0; i < data.length; i++) {

                var el = document.createElement("option");
                el.setAttribute("value", data[i]['Description']);
                el.appendChild(document.createTextNode(data[i]['Description']));
                citiesList.appendChild(el);

            }

            citiesList.value = city || kiev.name;
        });
    }

    function onCityChange(cityName) {
        //console.log(cityName);

        document.getElementById('npw-map-sidebar-search').value = '';

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        markers.length = 0;

        renderWarehouses(cityName, true, true);
        changeSidebarState('stateList');
    }

    function filterWarehouses(searchString) {

        var searchInput = searchString.toLowerCase();
        var list = mapSidebarUl.children;

        for (var i = 0; i < list.length; i++) {
            if (list[i].innerHTML.toLowerCase().indexOf(searchInput) > -1 || searchInput == '') {
                list[i].style.display = "block";
            } else {
                list[i].style.display = "none";
            }
        }
    }

    function initMap() {

        mapInitialized = true;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function successCallback(loc) {
                    //console.log(loc);
                    setCurrentLocation(loc);
                }, function errorCallback(err) {
                    //console.log(err);
                    setCurrentLocation(kiev);
                });
        } else {
            setCurrentLocation(kiev);
        }

        map = new google.maps.Map(document.getElementById('npw-map'), {
            center: new google.maps.LatLng(kiev.lat, kiev.lng),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true
        });

        function setCurrentLocation(loc) {

            //console.log(loc);

            map.setCenter(new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude));

            createMarker({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude
            });

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reverseGeocodingReady);
            oReq.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + loc.coords.latitude + "," + loc.coords.longitude + "&language=uk&result_type=locality&key=AIzaSyAPhm7Q29X5ldwjLtA7IMYHU_0xATiWK3A");
            oReq.send();

            function reverseGeocodingReady() {

                var r = JSON.parse(this.responseText);
                var localities = r['results'];

                //console.log(localities);

                if (localities.length === 0) {
                    userLocationCityName = kiev.name;
                    getCities(userLocationCityName, true);
                } else {
                    for (var i = 0; i < localities.length; i++) {
                        if (localities[i].types.indexOf('locality') !== -1) {
                            userLocationCityName = localities[i]['address_components'][0]['long_name'];
                            getCities(userLocationCityName);
                            //console.log('found locality is : ' + userLocationCityName);
                            break;
                        }
                    }
                }

                renderWarehouses(userLocationCityName);
            }
        }

    }

    function renderWarehouses(city, isSetCenter, isFromCityChange) {
        send('POST', 'https://api.novaposhta.ua/v2.0/json/', JSON.stringify({
            modelName: "AddressGeneral",
            calledMethod: "getWarehouses",
            methodProperties: {
                MarketplacePartnerToken: "005056887b8d-856b-11e6-9121-25f3f736",
                CityName: city
            }
        }), true, function (response) {
            //console.log('userLocationCityName ' + city);

            var warehouses = response.data;
            //console.log('warehouses ', warehouses);

            if (warehouses.length === 0) {
                //console.log('warehouses.length === 0');
                userLocationCityName = kiev.name;
                renderWarehouses(kiev.name);
                zeroLocalWarehousesFound = true;
            }

            while (mapSidebarUl.firstChild) {
                mapSidebarUl.removeChild(mapSidebarUl.firstChild);
            }

            var sp = [];

            for (var i = 0; i < warehouses.length; i++) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(warehouses[i].Latitude, warehouses[i].Longitude),
                    map: map,
                    name: warehouses[i].CityDescription,
                    vicinity: warehouses[i].Description,
                    number: warehouses[i].Number,
                    phone: warehouses[i].Phone,
                    type: convertWarehouseHash(warehouses[i].TypeOfWarehouse),
                    maxWeight: warehouses[i].TotalMaxWeightAllowed,
                    icon: 'https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/np-marker.png',
                    index: i
                });

                markers.push(marker);

                google.maps.event.addListener(marker, 'click', function () {
                    changeSidebarState('stateDetails', this.index);
                });

                sp = warehouses[i]['Description'].split(":");

                if (sp.length < 2) {
                    sp[1] = sp[0];
                }

                var node = document.createElement("li");
                node.addEventListener("click", function (event) {
                    NPWidgetMap.setMapCenter(event, true);
                });
                node.setAttribute("loc", "(" + warehouses[i].Latitude + "," + warehouses[i].Longitude + ")");
                node.setAttribute("data-idx", i);
                node.innerHTML = "<div class='npw-list-city'>" + warehouses[i]['CityDescription'] + "</div>" +
                    "<div class='npw-list-warehouse' >" + sp[0] + "</div>" +
                    "<div class='npw-list-address'>" + sp[1] +  "</div>";

                mapSidebarUl.appendChild(node);

            }

            if (zeroLocalWarehousesFound && warehouses.length > 0 || isSetCenter === true) {

                firstMarker = {
                    target: {
                        attributes: {
                            loc: {
                                value: "(" + warehouses[0]['Latitude'] + "," + warehouses[0]['Longitude'] + ")"
                            }
                        }
                    }
                };

                setMapCenter(firstMarker);

                if (!isFromCityChange) {
                    citiesList.value = kiev.name;
                }

            }

        });
    }

    function convertWarehouseHash(hash) {

        switch (hash) {
            case "6f8c7162-4b72-4b0a-88e5-906948c6a92f":
                return "Міні-відділення";
                break;
            case "841339c7-591a-42e2-8233-7a0a00f0ed6f":
                return "Поштове відділення";
                break;
            case "95dc212d-479c-4ffb-a8ab-8c1b9073d0bc":
                return "Поштомат приват банку";
                break;
            case "9a68df70-0267-42a8-bb5c-37f427e36ee4":
                return "Вантажне відділення";
                break;
            case "cab18137-df1b-472d-8737-22dd1d18b51d":
                return "Поштомат InPost";
                break;
            case "f9316480-5f2d-425d-bc2c-ac7cd29decf0":
                return "Поштомат";
                break;
            default:
                return "";
        }

    }

    return {
        setMapCenter: setMapCenter,
        onCityChange: onCityChange,
        state: changeSidebarState
    }

})();
