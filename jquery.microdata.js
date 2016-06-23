/*globals jQuery */
(function($) {    
    var items = [], widget,
    
    
        // validators for values in microdata
        validators = {
            text:      function(value, el) { return $.trim(value).length > 0; },
            
            url:       function(value, el) { return (/^https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?$/).test(value); },
            
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
        
        
        // would love it if I could externalize this via cached web service
        validationRules = {
            "http://data-vocabulary.org/Event" :
            [
            { name: "summary",     required: true,  type: "text",     validator: validators.text     },
            { name: "url",         required: false, type: "url",      validator: validators.url      },
                     { name: "location",    required: false, type: "complex",  validator: validators.complex  }, // optionally represented by data-vocabulary.org/Organization or data-vocabulary.org/Address
                     { name: "description", required: false, type: "text",     validator: validators.text     },
                     { name: "startdate",   required: true,  type: "datetime", validator: validators.datetime },
                     { name: "enddate",     required: false, type: "datetime", validator: validators.datetime },
                     { name: "duration",    required: false, type: "duration", validator: validators.duration },
                     { name: "eventtype",   required: false, type: "text",     validator: validators.text     },
                     { name: "geo",         required: false, type: "complex",  validator: validators.complex  }, // represented by itemscope with two properties: latitude and longitude
                     { name: "photo",       required: false, type: "url",      validator: validators.url      } 
                     ],
                     
                     "http://data-vocabulary.org/Person" :
                     [
                     { name: "name",         required: false, type: "text",    validator: validators.text    },
                     { name: "fn",           required: false, type: "text",    validator: validators.text    }, // alias for "name"
                     { name: "nickname",     required: false, type: "text",    validator: validators.text    },
                     { name: "photo",        required: false, type: "url",     validator: validators.url     },
                     { name: "title",        required: false, type: "text",    validator: validators.text    },
                     { name: "role",         required: false, type: "text",    validator: validators.text    },
                     { name: "url",          required: false, type: "url",     validator: validators.url     },
                     { name: "affiliation",  required: false, type: "text",    validator: validators.text    },
                     { name: "org",          required: false, type: "text",    validator: validators.text    }, // alias for "affiliation"
                     { name: "address",      required: false, type: "complex", validator: validators.complex }, // can have subproperties street-address, city, region, postal-code, country-name
                     { name: "adr",          required: false, type: "complex", validator: validators.complex }, // alias for "address"
                     { name: "friend",       required: false, type: "url",     validator: validators.url     },
                     { name: "contact",      required: false, type: "url",     validator: validators.url     },
                     { name: "acquaintance", required: false, type: "url",     validator: validators.url     }
                     // NOTE: to define "friend", "contact" or "acquaintance", you can also use XFN rel="..."
                     ],
                     
                     "http://data-vocabulary.org/Organization" :
                     [
                     { name: "name",    required: false, type: "text",    validator: validators.text    },
                     { name: "fn",      required: false, type: "text",    validator: validators.text    }, // alias for "name"
                     { name: "org",     required: false, type: "text",    validator: validators.text    }, // alias for "name"
                     { name: "url",     required: false, type: "url",     validator: validators.url     },
                     { name: "address", required: false, type: "complex", validator: validators.complex },
                     { name: "adr",     required: false, type: "complex", validator: validators.complex }, // alias for "address"
                     { name: "tel",     required: false, type: "text",    validator: validators.text    },
                     { name: "geo",     required: false, type: "complex", validator: validators.complex }
                     ],
                     
                     "http://data-vocabulary.org/Offer" :
                     [
                     { name: "price",           required: false, type: "float",    validator: validators.float    },
                     { name: "currency",        required: false, type: "text",     validator: validators.currency },
                     { name: "pricevaliduntil", required: false, type: "datetime", validator: validators.datetime },
                     { name: "seller",          required: false, type: "complex",  validator: validators.complex  }, // can contain a Person or Organization
                     {
                       name: "condition",     required: false, type: "complex",
                       validator: function(value, el) {
                           return $(el).hasAttr('content') && $.inArray($(el).attr('content').toLowerCase(), ["new", "used", "refurbished"]);
                       }
                   }, 
                   {
                       name: "availability",  required: false, type: "complex",
                       validator: function(value, el) { 
                           return $(el).hasAttr('content') && $.inArray($(el).attr('content').toLowerCase(), ["out_of_stock", "in_stock", "instore_only", "preorder"]);
                       }
                   },
                     { name: "offerurl",        required: false, type: "url",      validator: validators.url      }, // points to a product web page that includes the offer
                     { name: "identifier",      required: false, type: "text",     validator: validators.text     }, // recognizes ASIN, ISBN, MPN, UPC, SKU; suggests including product prand and at least one of the identifiers
                     { name: "itemoffered",     required: false, type: "complex",  validator: validators.complex  }  // can contain free text, a Product or other item types
                     ]
                 };
                 
                 
    /**
     * Auxiliary function to replace all whitespace with a single space
     */
     var normalizeWhitespace = function(value) {
        return $.trim(value.replace(/\s+/g, ' '));
    };
    
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

                if ($p.is('a,area,link')) {
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
        rules = [],
        required = [],
        rule,
        prop,
        validationExists = false,
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
    
    
    // this function fires on DOMready
    var init = function() {
        // $('<style type="text/css">' + cssBlock + '</style>').appendTo('head');
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
        }
    };
    
    $.fn.hasAttr = function(name) {
        return typeof this.attr(name) !== 'undefined' || this.attr(name) !== false;
    };
    
    
    // init the drop-in script
    $(init);
})(jQuery);