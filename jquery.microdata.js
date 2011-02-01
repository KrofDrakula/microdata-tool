(function($) {
    /*
    var log = function() {
        if (console && console.debug)
            console.debug(arguments);
        else if (console && console.log) {
            console.log(Array.prototype.slice.call(arguments).join(', '));
        }
    };
    
    $(function() {
        $('[itemscope]').each(
            function() {
                var $t = $(this), propElements = $t.find('[itemprop]'), props = [];
                propElements.each(function() {
                    var propname = $(this).attr('itemprop').toLowerCase()
                        .split(' '), $p = $(this);
                    for ( var i = 0; i < propname.length; i++) {
                        var v = $p.text();
                        if (propname[i] == 'url') {
                            // elements with href
                            if ($p.is('a,area,link'))
                                v = $p.attr('href');
                            // elements with src
                            else if ($p
                                .is('audio,embed,iframe,img,source,video'))
                                v = $p.attr('src');
                            // elements with data
                            else if ($p.is('object'))
                                v = $p.attr('data');
                        }
                        if ($p.is('time'))
                            v = $p.attr('datetime') || $p.text();
                        props.push({
                            property : propname[i],
                            value : v
                        });
                    }
                });
                log('Microdata item', $(this).attr('itemtype'), $.map(props, function(el, idx) {
                    return el.property + '=' + el.value;
                }).join(', '));
            });
        });
    */
    
    var items = [], widget,
        cssBlock = "#microdata-container { " +
                   "position: absolute; bottom: 10px; left: 10px; background: white; padding: 5px; color: #444; " +
                   "-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; " +
                   "-webkit-box-shadow: 0 0 5px black; -moz-box-shadow: 0 0 5px black; box-shadow: 0 0 5px; " +
                   "font: normal 11px Droid Sans Mono; letter-spacing: -1px; max-height: 300px; " +
                   "}\n" +
                   "#microdata-container li { list-style: none; padding: 0; margin: 0; }\n" +
                   "#microdata-container ul { padding: 0; margin-left: 10px; color: #999 }\n" +
                   ".microdata-highlighted { outline: 5px dashed red !important };";
    
    
    var refreshItems = function() {
        items = $('[itemscope]');
    };
    
    var getItems = function() {
        if(items.length == 0) return [];
    };
    
    var clearObjects = function() {
        widget.children().remove();
    };
    
    var addObject = function(element, mdata) {
        var t = $('<li>' + $(element).attr('itemtype') + '</li>').appendTo(widget), u = $('<ul/>').appendTo(t);
        for(var i = 0; i < mdata.length; i++) {
            u.append('<li>' + mdata[i].property + ' = ' + mdata[i].value + '</li>');
        }
        t.hover(function() { $(element).addClass('microdata-highlighted'); }, function() { $(element).removeClass('microdata-highlighted'); });
    };
    
    var updateList = function() {
        clearObjects();
        
        items.each(function() {
            var $t = $(this), propElements = $t.find('[itemprop]'), props = [];
            propElements.each(function() {
                var propname = $(this).attr('itemprop').toLowerCase()
                    .split(' '), $p = $(this);
                for ( var i = 0; i < propname.length; i++) {
                    var v = $p.text();
                    if (propname[i] == 'url') {
                        // elements with href
                        if ($p.is('a,area,link'))
                            v = $p.attr('href');
                        // elements with src
                        else if ($p
                            .is('audio,embed,iframe,img,source,video'))
                            v = $p.attr('src');
                        // elements with data
                        else if ($p.is('object'))
                            v = $p.attr('data');
                    }
                    if ($p.is('time'))
                        v = $p.attr('datetime') || $p.text();
                    props.push({
                        property : propname[i],
                        value : v
                    });
                }
            });
            
            addObject(this, props);
            /*
            log('Microdata item', $(this).attr('itemtype'), $.map(props, function(el, idx) {
                return el.property + '=' + el.value;
            }).join(', '));
            */
        });
    };
    
    $.extend({
        microdata: {
            getItems: getItems,
            updateList: updateList
        }
    });
    
    $(function() {
        refreshItems();
        $('<style/>').html(cssBlock).attr('type', 'text/css').appendTo('head');
        widget = $('<ul id="microdata-container"/>').appendTo('body');
        
        updateList();
    });
})(jQuery);