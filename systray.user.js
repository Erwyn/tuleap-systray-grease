// ==UserScript==
// @name        systray
// @namespace   tuleap
// @include     http://tuleap.net/*
// @include     https://tuleap.net/*
// @version     3
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
    margin: 0 1em; \
    border-top-left-radius: 4px; \
    border-top-right-radius: 4px; \
    background: #2D323A; \
    border: 1px solid #252525; \
    color: #999999; \
    borderBottom: none; \
    padding: 0.5em 1em; \
    text-align: right; \
    box-shadow: 0 0 5px #888; \
} \
.systray_content a:link, \
.systray_content a:visited { \
  color: #999999; \
} \
.systray_icon {\
    float: left;\
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
  //nothing
}

init();

(function($) {
    display_systray = function(info) {
        var systray         = build_systray();
        var systray_content = build_systray_content();
        var sprint          = build_sprint(info);
        var tuleap_icon     = build_tuleap_icon();

        systray_content.append(sprint);
        systray_content.append(tuleap_icon);
        systray.append(systray_content);

        $('body').append(systray);
    };

    build_systray_content = function() {
        var systray_content       = $(document.createElement('div'));
        systray_content.addClass('systray_content');

        return systray_content;
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

    hide_systray = function() {
        var systray = $('.systray');
        systray.detach();
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
          var label = current_sprint.textContent.trim()
            , a     = current_sprint.down('.ad_index_planning_icons > a:last')
	    , info  = {label: label, href: a.href}
	  AZHU.storage.save('systray_' + href, info, cache_duration)
	  display_systray(info)
	}
      }
    })
  }
}
