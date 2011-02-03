(function($) {    
    var items = [], widget,
    
        // CSS styles injected into head
        // TODO: need to clean this up or externalize it
        cssBlock = "#microdata-container { " +
                   "position: fixed; bottom: 10px; left: 10px; background: white; padding: 5px; color: #444; " +
                   "-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; border: 1px solid black; " +
                   "-webkit-box-shadow: 0 0 5px black; -moz-box-shadow: 0 0 5px black; box-shadow: 0 0 5px; " +
                   "font: normal 11px Droid Sans Mono, Inconsolata, Consolas, monospace; letter-spacing: -1px; " +
                   "}\n" +
                   "#microdata-container li { list-style: none; padding: 0; margin: 0; cursor: pointer; }\n" +
                   "#microdata-container>li.expanded ul { display: block; }\n" +
                   "#microdata-container li:hover { background: #ff9 }\n" +
                   "#microdata-container ul { display: none; padding: 0; margin-left: 10px; color: #999 }\n" +
                   ".microdata-highlighted { outline: 5px dashed red !important; background: yellow !important };";
    
    /**
     * Updates the list of microdata elements on the page
     */
    var refreshList = function() {
        items = $('[itemscope]', $.microdata.defaults.scope);
    };
    
    /**
     * Removes all microdata objects from widget
     */
    var clearObjects = function() {
        widget.children().remove();
    };
    
    
    /**
     * Adds a microdata object to the widget and adds a hover
     * handler to highlight the relevant element
     */
    var addObject = function(element, mdata) {
        var type = mdata.type,
            t = $('<li title="' + type + '">' + (isUrl(type)? '<a href="' + type + '">' + type.replace(/^.*\//, '') + '</a>': "[no vocabulary]") + '</li>').appendTo(widget),
            u = $('<ul/>').appendTo(t);
        
        if(mdata.properties.length > 0) {
            for(var i = 0; i < mdata.properties.length; i++) {
                u.append('<li>' + mdata.properties[i].name + ' = ' + mdata.properties[i].value + '</li>');
            }
        } else {
            u.append('[no properties]');
        }
        
        t.hover(
            function() { $(element).addClass('microdata-highlighted'); },
            function() { $(element).removeClass('microdata-highlighted'); }
        ).click(function() { t.toggleClass('expanded'); return false; });
        
    };
    
    /**
     * Test a string for valid URL
     * @return bool
     */
    var isUrl = function(str) {
        return /^https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/.test(str);
    };
    
    
    /**
     * Updates the list of microdata objects in the widget
     */
    var updateList = function() {
        
        clearObjects();
        refreshList();
        
        if(items.length == 0) {
            $('<li>No microdata objects detected!</li>').appendTo(widget);
            return;
        }
        
        items.each(function() { addObject(this, parseElement(this)); });
    };
    
    
    // this function fires on DOMready
    var init = function() {
        $('<style type="text/css">' + cssBlock + '</style>').appendTo('head');
        widget = $('<ul id="microdata-container"/>').appendTo('body');
        
        updateList();
    };
    
    var parseElement = function(el) {
        if(!el.jquery) el = $(el);
        if(!el.is('[itemscope]')) return null;
        
        var propElements = el.find('[itemprop]'), props = [];
        propElements.each(function() {
            var $p = $(this), propname = $p.attr('itemprop').toLowerCase().split(' ');
            
            for (var i = 0; i < propname.length; i++) {
                var v = $p.text();

                if ($p.is('a,area,link'))
                    v = $p.attr('href');
                else if ($p.is('audio,embed,iframe,img,source,video'))
                    v = $p.attr('src');
                else if ($p.is('object'))
                    v = $p.attr('data');
                else if ($p.is('time')) v = $p.attr('datetime') || $p.text();
                
                props.push({
                    name : propname[i],
                    value : v
                });
            }
        });
        
        return { type: el.attr('itemtype') || null, properties: props };
    };
    
    
    // expose functions for use by outside scripts via plugin
    $.extend({
        microdata: {
            getItems: function() { return items; },
            updateList: updateList,
            parseElement: parseElement,
            defaults: {
                scope: 'body'
            }
        }
    });
    
    
    // init the drop-in script
    $(function() { init(); });
})(jQuery);