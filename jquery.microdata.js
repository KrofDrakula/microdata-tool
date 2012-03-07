/*globals jQuery */
(function($) {    
    var items = [], widget = null,
    
        // CSS styles injected into head
        // TODO: need to clean this up or externalize it
        cssBlock = [
           "#microdata-container {",
           "    position: fixed; bottom: 10px; left: 10px; background: white; padding: 5px; color: #444; ",
           "    -webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; border: 1px solid black; ",
           "    -webkit-box-shadow: 0 0 5px black; -moz-box-shadow: 0 0 5px black; box-shadow: 0 0 5px; ",
           "    font: normal 11px Droid Sans Mono, Consolas, Inconsolata, monospace; letter-spacing: -1px; ",
           "}",
           "#microdata-container a { color: #009 !important }",
           "#microdata-container li { list-style: none; padding: 0; margin: 0; cursor: pointer; }",
           "#microdata-container>li.expanded ul { display: block; }",
           "#microdata-container li:hover { background: #ff9 }",
           "#microdata-container ul { display: none; padding: 0; margin-left: 10px; color: #999 }",
           ".microdata-highlighted { outline: 2px dashed red !important; background: rgba(255,0,0,0.3) !important; color: black !important }",
           "#microdata-container .invalid { color: red !important }"
        ].join('\n');
        
        // validators for values in microdata
        validators = {
            text:      function(value, el) { return $.trim(value).length > 0; },
            
            url:       function(value, el) { return (/^https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?$/).test(value); },
            
            email:     function(value, el) { return (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/).text(value); },
            
            int:       function(value, el) { return (/^\d+$/).test(value); },
            
            float:     function(value, el) { return (/^\d+([.,]\d*)?$/).test(value); },
            
            // TODO: need a proper datetime validator
            datetime:  function(value, el) { return (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/).test(value); },
            
            // TODO: check the duration per http://en.wikipedia.org/wiki/ISO_8601#Durations
            duration:  function(value, el) { return (/^P(([0-9.,]+[YMD])*(T[0-9.,]+[HMS])*|[0-9.,]W)$/).test(value); },
            
            // TODO: complex types require other nested entities or special treatment
            complex:   function(value, el) { return true; },
            
            // TODO: check three-letter ISO code for currency: http://www.iso.org/iso/support/faqs/faqs_widely_used_standards/widely_used_standards_other/currency_codes.htm
            currency:  function(value, el) { return (/^[a-zA-Z]{3}$/).test(value); },
            
            any: function(value, el) { return true; }
        },
        
        
        // this is filled up using schemas.js
        validationRules = {};
    
    
    /**
     * Takes the result of parseElement and attaches the "valid" and "missing" properties,
     * then returns the augmented object
     */
    var validateData = function(mdata) {
        var i, rules, required, rule;
        
        if(!validationRules.hasOwnProperty(mdata.type)) {
            for(i = 0; i < mdata.properties.length; i++) {
                mdata.properties[i].valid = true;
            }
            mdata.valid = true;
            mdata.missing = [];
            return mdata;
        }
        
        // check type validation
        mdata.missing = [];
        mdata.valid = true;
        
        rules = validationRules[mdata.type];
        required = $.grep(rules, function(item) { return item.required; });
        
        for(i = 0; i < mdata.properties.length; i++) {
            rule = $.grep(rules, function(item) { return item.name === mdata.properties[i].name.toLowerCase(); });
            
            // pop the field from the required list
            required = $.grep(required, function(item) { return item.name === mdata.properties[i].name.toLowerCase(); }, true);
            
            if(rule.length > 0 && !rule[0].validator(mdata.properties[i].value)) {
                mdata.properties[i].valid = false;
                mdata.valid = false;
            } else {
                mdata.properties[i].valid = true;
            }
        }
        
        // any required properties not defined are appended to the list
        if(required.length > 0) {
            for(i = 0; i < required.length; i++) {
                mdata.missing.push(required[i].name);
            }
            mdata.valid = false;
        }
        
        return mdata;
    };
    
    /**
     * Utility functions that extracts the relevant data
     */
    var parseElement = function(el) {
        if(!el.jquery) { el = $(el); }
        // if the element in question isn't an itemscope, return null
        if(!el.hasAttr('itemscope')) { return null; }
        
        var propElements = el.find('[itemprop]'), props = [], i;
        propElements.each(function() {
            var $p = $(this), propname = $p.attr('itemprop').toLowerCase().split(' '), v;
            
            for (i = 0; i < propname.length; i++) {
                v = $p.text();

                if ($p.is('meta')) {
                    v = $p.attr('content');
                } else if ($p.is('a,area,link')) {
                    v = $p.attr('href');
                } else if ($p.is('audio,embed,iframe,img,source,video')) {
                    v = $p.attr('src');
                } else if ($p.is('object')) {
                    v = $p.attr('data');
                } else if ($p.is('time')) {
                    v = $p.attr('datetime') || $p.text();
                }
                
                props.push({
                    name : propname[i],
                    value : $.trim(v)
                });
            }
        });
        
        return validateData({ type: el.attr('itemtype') || null, properties: props });
    };
    
    
    
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
            t = $('<li title="' + type + '">' + (validators.url(type)? '<a href="' + type + '">' + type.replace(/^.*\//, '') + '</a>': "[no vocabulary]") + '</li>').appendTo(widget),
            u = $('<ul/>').appendTo(t),
            prop,
            i;
        
        mdata = (typeof mdata.valid === 'undefined')? mdata = validateData(mdata): mdata;
        
        if(mdata.properties.length > 0) {
            
            for(i = 0; i < mdata.properties.length; i++) {
                prop = $('<li>' + mdata.properties[i].name + ' = ' + mdata.properties[i].value + '</li>').appendTo(u);
                
                if(!mdata.properties[i].valid) {
                    prop.addClass('invalid');
                }
            }
            
            // any required properties not defined are appended to the list
            if(mdata.missing.length > 0) {
                for(i = 0; i < mdata.missing.length; i++) {
                    $('<li class="invalid">missing property: ' + mdata.missing[i] + '</li>').appendTo(u);
                }
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
     * Updates the list of microdata objects in the widget
     */
    var updateList = function() {
        
        clearObjects();
        refreshList();
        
        if(items.length === 0) {
            $('<li class="invalid">No microdata objects detected!</li>').appendTo(widget);
            return;
        }
        
        items.each(function() { addObject(this, parseElement(this)); });
        
    };
    
    var addDefinition = function(url, fields) {
        validationRules[url] = fields;
    };
    
    
    // this function fires on DOMready
    var init = function() {
        $('<style type="text/css">' + cssBlock + '</style>').appendTo('head');
        widget = $('<ul id="microdata-container"/>').appendTo('body');
        
        updateList();
    };
    
    
    // expose functions for use by outside scripts via plugin
    $.microdata = {
        getItems: function() { return items; },
        updateList: updateList,
        parseElement: parseElement,
        defaults: {
            scope: 'body'
        },
        validators: validators,
        addDefinition: addDefinition
    };
    
    /**
     * Adds the `hasAttr()` method to jQuery element wrapper
     */
    $.fn.hasAttr = function(name) {
        return typeof this.attr(name) !== 'undefined' || this.attr(name) !== false;
    };
    
    
    // init the drop-in script
    $(init);
})(jQuery);