(function($) {    
    var items = [], widget,
    
        // CSS styles injected into head
        // TODO: need to clean this up or externalize it
        cssBlock = "#microdata-container { " +
                   "position: absolute; bottom: 10px; left: 10px; background: white; padding: 5px; color: #444; " +
                   "-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; border: 1px solid black; " +
                   "-webkit-box-shadow: 0 0 5px black; -moz-box-shadow: 0 0 5px black; box-shadow: 0 0 5px; " +
                   "font: normal 11px Droid Sans Mono, Inconsolata, Consolas, monospace; letter-spacing: -1px; max-height: 300px; " +
                   "}\n" +
                   "#microdata-container li { list-style: none; padding: 0; margin: 0; }\n" +
                   "#microdata-container ul { padding: 0; margin-left: 10px; color: #999 }\n" +
                   ".microdata-highlighted { outline: 5px dashed red !important; background: yellow !important };";
    
    /**
     * Updates the list of microdata elements on the page
     */
    var refreshList = function() {
        items = $('[itemscope]');
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
        var t = $('<li>' + $(element).attr('itemtype') + '</li>').appendTo(widget),
            u = $('<ul/>').appendTo(t);
        
        for(var i = 0; i < mdata.length; i++) {
            u.append('<li>' + mdata[i].property + ' = ' + mdata[i].value + '</li>');
        }
        t.hover(
            function() { $(element).addClass('microdata-highlighted'); },
            function() { $(element).removeClass('microdata-highlighted'); }
        );
    };
    
    
    /**
     * Updates the list of microdata objects in the widget
     */
    var updateList = function() {
        
        clearObjects();
        refreshList();
        
        items.each(function() {
            var $t = $(this), propElements = $t.find('[itemprop]'), props = [];
            propElements.each(function() {
                var propname = $(this).attr('itemprop').toLowerCase().split(' '), $p = $(this);
                
                for (var i = 0; i < propname.length; i++) {
                    var v = $p.text();

                    // special cases for 'url' itemprop; takes attribute values
                    // for certain tags
                    if (propname[i] == 'url') {
                        if ($p.is('a,area,link'))
                            v = $p.attr('href');
                        else if ($p.is('audio,embed,iframe,img,source,video'))
                            v = $p.attr('src');
                        else if ($p.is('object'))
                            v = $p.attr('data');
                    }
                    
                    if ($p.is('time')) v = $p.attr('datetime') || $p.text();
                    
                    props.push({
                        property : propname[i],
                        value : v
                    });
                }
            });
            
            addObject(this, props);
        });
    };
    
    
    // this function fires on DOMready
    var init = function() {
        $('<style type="text/css">' + cssBlock + '</style>').appendTo('head');
        widget = $('<ul id="microdata-container"/>').appendTo('body');
        
        updateList();
    };
    
    
    // expose functions for use by outside scripts via plugin
    $.extend({
        microdata: {
            getItems: function() { return items; },
            updateList: updateList
        }
    });
    
    
    // init the drop-in script
    $(function() { init(); });
})(jQuery);