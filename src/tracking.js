;window.onload = (function($) {
 var parent = $.get('#np-tracking').item(false);
 var input = $.get('#np-user-input').item(false);
 var clearButton = $.get('#np-clear-input').item(false);
 var button = $.get('#np-submit-tracking').item(false);
 var returnButton = $.get('#np-return-button').item(false);
 var errorContainer = $.get('#np-warning-message').item(false);
 var more = $.get('#np-more').item(false);

var xhr = (function () {
    if ( window.XDomainRequest ) {
      return new XDomainRequest()
    } else {
      return new XMLHttpRequest()
    }
})();

 if ( !input.value ) {
   disable(button);
 }

$.on(input, 'input', function() {
   var value = this.value;
   var validateState = validate(value, input);

   if ( validateState ) {
     enable(button);
     hideErrorMessage();
   }
   if ( !validateState ) {
     disable(button);
     showErrorMessage();
   }

   if ( value.length == 0 ) {
     disable(button);
     hideErrorMessage();
   }

   if ( input.value.length > 0 ) {
     $.setStyle(clearButton, { 'display' : 'block' });
   } else {
     $.setStyle(clearButton, { 'display' : '' });
   }

   checkFirstChar(value);
 });

$.on(button, 'click', function() {
   xhr.onloadstart = function() {
     $.setStyle($.get('#np-text-button-tracking').item(false), { 'display': 'none' });
     $.setStyle($.get('#np-load-image-tracking').item(false), { 'visibility': 'visible', 'transform': 'rotate(-360deg)' });
   };
   xhr.onloadend = function() {
     $.setStyle($.get('#np-load-image-tracking').item(false), { 'visibility': 'hidden', 'transform': '' });
     $.setStyle($.get('#np-first-state').item(false), { 'display' : 'none' });
     $.setStyle($.get('#np-second-state').item(false), { 'display' : 'block' });
     $.setStyle($.get('#np-text-button-tracking').item(false), { 'display': 'block' });
     button.disabled = true;
   };
   sendXHR(input.value, function(res) {
     var data = res.data[0];
     var number = data.Number;
     var status = data.Status;
     var statusCode = +(data.StatusCode);

     createStatusMessage(statusCode, status, number);
       $.setAttrs(more, 'href', "https://novaposhta.ua/tracking/?cargo_number=" + number + "&yt0=?utm_source=tracking&utm_medium=widget&utm_term=tracking&utm_content=tracking&utm_campaign=NP");
       $.setAttrs(more, 'target', "_blank");
   });
 });

 $.on(button, 'mouseenter', function() {
   $.setStyle(this, { cursor: "pointer" });
 });

 $.on(returnButton, 'click', function() {
   input.value = null;
   disable(button);
   $.setStyle($.get('#np-second-state').item(false), { 'display' : 'none' });
   $.setStyle($.get('#np-first-state').item(false), { 'display' : 'block' });
   $.setStyle(clearButton, { 'display': 'none' });
   $.setStyle(button, { cursor: "not-allowed" });
 });

 $.on(clearButton, 'click', function() {
  $.setStyle(this, { 'display': 'none' });
   input.value = null;
   hideErrorMessage();
   disable(button);
 });

 $.on(input, 'keydown', function(e) {
   var code = e.keyCode;

   if ( code == 13 && button.disabled == false ) {
     xhr.onloadstart = function() {
       $.setStyle($.get('#np-text-button-tracking').item(false), { 'display': 'none' });
       $.setStyle($.get('#np-load-image-tracking').item(false), { 'visibility': 'visible', 'transform': 'rotate(-360deg)' });
     };
     xhr.onloadend = function() {
       $.setStyle($.get('#np-load-image-tracking').item(false), { 'visibility': 'hidden', 'transform': '' });
       $.setStyle($.get('#np-first-state').item(false), { 'display' : 'none' });
       $.setStyle($.get('#np-second-state').item(false), { 'display' : 'block' });
       $.setStyle($.get('#np-text-button-tracking').item(false), { 'display': 'block' });
       button.disabled = true;
     };
     sendXHR(input.value, function(res) {
       var data = res.data[0];
       var number = data.Number;
       var status = data.Status;
       var statusCode = +(data.StatusCode);

       createStatusMessage(statusCode, status, number);
         $.setAttrs(more, 'href', "https://novaposhta.ua/tracking/?cargo_number=" + number + "&yt0=?utm_source=tracking&utm_medium=widget&utm_term=tracking&utm_content=tracking&utm_campaign=NP");
         $.setAttrs(more, 'target', "_blank");
     });
   }
 });
 function checkFirstChar(value) {
   if ( value ) {
     if ( value[0].match(/[A-Za-zа-яА-Я]/i) ) {
       disable(button);
       showErrorMessage();
     }
     if ( !value[0].match(/[A-Za-zа-яА-Я]/i) ) {
       checkLength(20, value);
     }
   }
 }

 function checkLength(pattern, target) {
   if ( target.length > pattern ) {
     disable(button);
     showErrorMessage();
   } else {
     enable(button);
     hideErrorMessage();
   }
 }

 function createStatusMessage(statusCode, statusMessage, number) {
   var parent = $.get('#np-second-state').item(false);
   var childs = $.children(parent);

   switch ( statusCode ) {
     case 1:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/processing.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nзнаходиться в обробці');
     break;
     case 2:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/delete.svg" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Експресс накладну\n№' + number + '\nбуло видалено');
     break;
     case 3:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/not-found.svg" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Посилку\n№' + number + '\nне знайдено');
     break;
     case 4:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/processing.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nготується до відправлення');
     break;
     case 5:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/success.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nвідправлено');
     break;
     case 6:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ready.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nготується до видачі');
     break;
     case 7:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/house.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nприбуло на відділення');
     break;
     case 8:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/house.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Замовлення\n№' + number + '\nприбуло на відділення');
     break;
     case 9:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ok.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Відправлення\n№' + number + '\nотримано');
     break;
     case 10:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ok.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Відправлення\n№' + number + '\nотримано');
     break;
     case 106:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ok.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Відправлення\n№' + number + '\nотримано');
     break;
     case 101:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/success.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Відправлення\n№' + number + '\nна шляху до одержувача');
     break;
     case 102:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ok.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Одержувач відмовився отримувати відправлення\n№' + number);
     break;
     case 103:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/delete.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Одержувач відмовився отримувати відправлення\n№' + number);
     break;
     case 104:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/change.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Для відправлення\n№' + number + '\nзмінено адресу доставки');
     break;
     case 105:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/delete.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Для відправлення\n№' + number + '\nприпинено зберігання посилки');
     break;
     case 106:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/ok.png" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Відправлення\n№' + number + '\nотримано');
     break;
     case 107:
      $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/pay-for-save.svg" alt="error icon" />');
      $.text($.get('#np-status-message').item(false), 'Для відправлення\n№' + number + '\nнараховується плата за зберігання');
     break;
     default:
       $.html($.get('#np-status-icon').item(false), '<img src="https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/not-found.svg" alt="error icon" />');
       $.text($.get('#np-status-message').item(false), 'Вибачте! З технічних причин ми не змогли відстежити вашу посилку');
   }
 }
 /*
  Disable component
 */
 function disable(component) {
   component.disabled = true;
     $.setStyle(component,  {'background-color': '#d1d5da', 'border': '1px solid #c4c4c4'});
 }
 /*
  Enable component
 */
 function enable(component) {
   component.disabled = false;
     $.setStyle(component, { 'background-color': '', 'border': '' });
 }
 /*
  Validate user input
 */
 function validate(value, target) {
  var pattern = (/[^\d][A-Za-z]+/i);

  if ( value.match(pattern) ) {
    return true;
  } else {
    return false;
  }

  //if ( !value.match(pattern) ) {
  // return false;
  //}
 }
 /*
  Show error message
 */
 function showErrorMessage() {
   var container = $.get('#np-warning-message').item(false);
   var error = 'Номер посилки невірний';

   $.setStyle(container, { 'background': 'url()' });
   $.text(container, error);
 }
 /*
  Hide error message
 */
 function hideErrorMessage() {
   var container = $.get('#np-warning-message').item(false);

   $.setStyle(container, { 'background': 'url("https://apimgmtstorelinmtekiynqw.blob.core.windows.net/content/MediaLibrary/Widget/img/line.png") repeat-x center' });
   $.empty(container);
 }

 function sendXHR(number, cb) {
  var url = 'https://api.novaposhta.ua/v2.0/json/';

  var body = {
    modelName: "TrackingDocument",
    calledMethod: "getStatusDocuments",
    methodProperties: {
    Documents: [
      {
        MarketplacePartnerToken: "005056887b8d-a9f2-11e6-735b-be254fe6",
        DocumentNumber: number,
        Phone: ""
      }
    ],
    Language: "UA"
    }
  };

     $.send(xhr, 'POST', url, JSON.stringify(body), true, cb);
 }

})(NPWUtils);
