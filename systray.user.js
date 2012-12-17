// ==UserScript==
// @name        systray
// @namespace   tuleap
// @include     http://tuleap.net/*
// @include     https://tuleap.net/*
// @version     4
// @grant       none
// @require     http://tuleap.net/scripts/prototype/prototype.js
// @require     http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js
// ==/UserScript==
jQuery.noConflict();
function addCss(cssString) {
  var head = document.getElementsByTagName('head')[0];
  var newCss = document.createElement('style');
  newCss.type = "text/css";
  newCss.innerHTML = cssString;
  head.appendChild(newCss);
}
addCss (' \
.systray { \
    position: fixed; \
    bottom: 0; \
    width: 100%; \
} \
.systray_content { \
    margin: 0 5em; \
    border-top-left-radius: 4px; \
    border-top-right-radius: 4px; \
    background: #2D323A; \
    border: 1px solid #252525; \
    color: #999999; \
    borderBottom: none; \
    padding: 0.5em 1em; \
    box-shadow: 0 0 5px #888; \
    text-align: right; \
} \
.overlay {\
   background-color: #000;\
   opacity: .7;\
   filter: alpha(opacity=70);\
   position: fixed; top: 0; left: 0;\
   width: 100%; height: 100%;\
   z-index: 100;\
}\
.cardwall_icon {\
    margin: 0 10px;\
    vertical-align: middle;\
}\
.systray_content a:link, \
.systray_content a:visited { \
  color: #999999; \
} \
.systray_icon {\
    float: left;\
}\
.systray_info {\
}\
.systray_content a:hover { \
  color: white; \
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25); \
  text-decoration: none; \
}'); 

var cache_duration = 2 * 3600; // Two hours

// http://blog.anhangzhu.com/2011/07/20/html-5-local-storage-with-expiration/
var AZHU = { }
AZHU.storage = {
  save: function(key, jsonData, expirationSec){
    var expirationMS = expirationSec * 1000;
    var record = {value: JSON.stringify(jsonData), timestamp: new Date().getTime() + expirationMS}
    localStorage.setItem(key, JSON.stringify(record));
    return jsonData;
  },
  load: function(key){
    var record = JSON.parse(localStorage.getItem(key));
    if (!record){return false;}
    return (new Date().getTime() < record.timestamp && JSON.parse(record.value));
  }
}

// This function doesn't do anything
// but fixing a weird bug with
// initialization.
function init(){
  // nothing
}

init();

(function($) {
    display_systray = function(info) {
        var systray         = build_systray();
        var systray_content = build_systray_content(info);

        systray.append(systray_content);

        $('body').css('padding','0 0 3em 0');
        $('body').append(systray);
        console.log(info);
        console.log(info.cardwall);
    };

    build_systray_content = function(info) {
        var systray_content       = $(document.createElement('div'));
        systray_content.addClass('systray_content');

        var tuleap_icon     = build_tuleap_icon();
        var systray_info    = build_systray_info(info);

        systray_content.append(tuleap_icon);
        systray_content.append(systray_info);

        return systray_content;
    };

    build_systray_info = function(info) {
        var sprint          = build_sprint(info);
        var cardwall_icon   = build_cardwall_icon();

        var systray_info    = $(document.createElement('div'));
        systray_info.addClass('systray_info');

        systray_info.append(cardwall_icon);
        systray_info.append(sprint);

        return systray_info
    };

    build_systray = function() {
        var systray               = $(document.createElement('div'));
        systray.addClass('systray');

        return systray;
    };

    build_sprint = function(info) {
        var sprint = $(document.createElement('a'));
        sprint.attr('href',info.href);
        sprint.html(info.label);

        return sprint;
    };

    build_tuleap_icon = function() {
        var tuleap_icon = $(document.createElement('img'));
        tuleap_icon.addClass('systray_icon');
        tuleap_icon.attr('src','/themes/Tuleap/images/favicon.ico');

        tuleap_icon.bind('click',hide_systray);

        return tuleap_icon;
    };

    build_cardwall_icon = function() {
        var cardwall_icon = $(document.createElement('img'));
        cardwall_icon.addClass('cardwall_icon');
        cardwall_icon.attr('src','http://p.yusukekamiyamane.com/icons/search/fugue/icons/cards-stack.png');

        cardwall_icon.bind('click', show_cardwall);

        return cardwall_icon;
    };

    show_cardwall = function() {
        set_overlay();
//        var cardwall = $(document.createElement('div'));
//        cardwall.html();

        
    };

    set_overlay = function() {
        var overlay = $(document.createElement('div'));
        overlay.addClass('overlay');
        overlay.bind('click', remove_overlay);

        $('body').append(overlay);
    };

    remove_overlay = function() {
        var overlay = $('.overlay');
        overlay.unbind('click', remove_overlay);
        overlay.detach();
    };

    hide_systray = function() {
        var tuleap_icon = $('.systray_icon');
        tuleap_icon.unbind('click', hide_systray);
        tuleap_icon.bind('click', show_systray);

        var systray_info = $('.systray_info');
        systray_info.hide();

        var systray_content = $('.systray_content');
        systray_content.css('display','inline-block');

        $('body').css('padding','0');
    };

    show_systray = function() {
        var tuleap_icon = $('.systray_icon');
        tuleap_icon.unbind('click', show_systray);
        tuleap_icon.bind('click', hide_systray);

        var systray_info = $('.systray_info');
        systray_info.show();

        var systray_content = $('.systray_content');
        systray_content.css('display','');

        $('body').css('padding','0 0 3em 0');
    };
})(jQuery);

var agile_dashboard_link = $('navigation').down('a[href^="/plugins/agiledashboard/?group_id="]')
  , href
  , systray
if (agile_dashboard_link) {
  href = agile_dashboard_link.href
  systray = AZHU.storage.load('systray_' + href)
  if (systray) {
    display_systray(systray)
  } else {
    new Ajax.Request(href, {
      onSuccess: function (transport) {
        var div = new Element('div').update(transport.responseText)
          , current_sprint = div.down('.ad_index_planning:last > ul > li:first')
        if (current_sprint) {
          var label         = current_sprint.textContent.trim()
            , a             = current_sprint.down('.ad_index_planning_icons > a:last')
            , cardwall_elem = jQuery('.cardwall_board table')[0].outerHTML
	    , info          = {label: label, href: a.href, cardwall: cardwall_elem}
	  AZHU.storage.save('systray_' + href, info, cache_duration)
	  display_systray(info)
	}
      }
    })
  }
}
