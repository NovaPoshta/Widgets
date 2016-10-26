var NPWUtils = (function () {

    function createElement(object) {
        var element = document.createElement(object.tag);

        element.className = object.class || '';
        object.type ? element.type = object.type : null;
        object.ref ? element.ref = object.ref : null;
        element.id = object.id || '';
        element.textContent = object.text || '';

        return element;
    }

    function get(selector) {
        return document.querySelectorAll(selector)
    }

    function find(element, selector) {
        return element.querySelectorAll(selector)
    }

    function html(element, string) {
        if (string) {
            return element.innerHTML = string;
        }

        return element.innerHTML;
    }

    function clone(element) {
        return element.cloneNode(true);
    }

    function empty(element) {
        return element.innerHTML = '';
    }

    function text(element, string) {
        if (string) {
            return element.textContent = string
        }

        return element.textContent;
    }

    function remove(element, child) {
        return element.removeChild(child);
    }

    function getStyle(element, rule) {
        return getComputedStyle(element)[rule];
    }

    function setStyle(element, rules) {
        for (var key in rules) {
            element.style[key] = rules[key];
        }
    }

    function getAttrs(element, attr) {
        return element.getAttribute(attr);
    }

    function setAttrs(element, attr, value) {
        return element.setAttribute(attr, value);
    }

    function removeClass(element, className) {
        return element.classList.remove(className);
    }

    function next(element) {
        return element.nextElementSibling;
    }

    function parent(element) {
        return element.parentNode;
    }

    function children(element) {
        var arr = [];

        for (var i = 0; i < element.children.length; i++) {
            arr.push(element.children[i]);
        }

        return arr;
    }

    function before(element, string) {
        return element.insertBefore(string, element.children[0]);
    }

    function append(parent, child) {
        return parent.appendChild(child);
    }

    function offset(element) {
        var rect = element.getBoundingClientRect();

        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    function on(element, event, handler) {
        element.addEventListener(event, handler, false);
    }

    function off(element, event, handler) {
        element.removeEventListener(event, handler, false);
    }

    function send(xhr, method, url, body, sync, callback) {
        xhr.open(method, url, sync);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    var result = JSON.parse(this.responseText);

                    return callback(result);
                } else {
                    console.log(new Error('Response returned with non-OK status'));
                }
            }
        };

        xhr.send(body);
    }

    return {
        createElement: createElement,
        get: get,
        find: find,
        html: html,
        clone: clone,
        empty: empty,
        text: text,
        remove: remove,
        getStyle: getStyle,
        setStyle: setStyle,
        getAttrs: getAttrs,
        setAttrs: setAttrs,
        removeClass: removeClass,
        next: next,
        parent: parent,
        children: children,
        before: before,
        append: append,
        offset: offset,
        on: on,
        off: off,
        send: send
    }

})();
