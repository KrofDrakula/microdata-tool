(function($) {
    if (!jQuery.microdata) {
        console.error('jQuery Microdata plugin has not been loaded prior to loading this script!');
        return;
    }
    
    var validators = $.microdata.validators;
    
    function extend(base, additions) {
        var ret = base.fields.slice();
        for (var i = 0; i < additions.length; i++) {
            if (!findField(additions[i].name))
                ret.push(additions[i]);
        }
        
        return ret;
        
        function findField(name) {
            for (var i = 0; i < ret.length; i++) {
                if (ret[i].name.toLowerCase() == name.toLowerCase()) return ret[i];
            }
            return false;
        }
    }
    
    function findByUrl(source, url) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].url == url) return source[i];
        }
        return null;
    }
    
    
    // A partial implementation of data-vocabulary.org schemas
    var dataVocabulary = [
        {
            url: "http://data-vocabulary.org/Event",
            fields: [
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
            ]
        },
        {
            url: "http://data-vocabulary.org/Person",
            fields: [
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
            ]
        },
        {
            url: "http://data-vocabulary.org/Organization",
            fields: [
                 { name: "name",    required: false, type: "text",    validator: validators.text    },
                 { name: "fn",      required: false, type: "text",    validator: validators.text    }, // alias for "name"
                 { name: "org",     required: false, type: "text",    validator: validators.text    }, // alias for "name"
                 { name: "url",     required: false, type: "url",     validator: validators.url     },
                 { name: "address", required: false, type: "complex", validator: validators.complex },
                 { name: "adr",     required: false, type: "complex", validator: validators.complex }, // alias for "address"
                 { name: "tel",     required: false, type: "text",    validator: validators.text    },
                 { name: "geo",     required: false, type: "complex", validator: validators.complex }
            ]
        },
        {
            url: "http://data-vocabulary.org/Offer",
            fields: [
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
        }
    ];
    
    
    // add the data-vocabulary.org validators to the plugin
    for (var i = 0; i < dataVocabulary.length; i++) {
        $.microdata.addDefinition(dataVocabulary[i].url, dataVocabulary[i].fields);
    }
    
    // This section pertains to the schema.org definitions
    
    var schemaOrg = [
        {
            url: "http://schema.org/Thing",
            fields: [
                { name: "description",  required: false,  type: "text",  validator: validators.text },
                { name: "image",        required: false,  type: "url",   validator: validators.url  },
                { name: "name",         required: false,  type: "text",  validator: validators.text },
                { name: "url",          required: false,  type: "url",   validator: validators.url  }
            ]
        }
    ];
    schemaOrg.push({
        url: "http://schema.org/Event",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
            { name: "attendees",   required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Person or Organization
            { name: "duration",    required: false,  type: "duration",  validator: validators.duration },
            { name: "endDate",     required: false,  type: "datetime",  validator: validators.datetime },
            { name: "location",    required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Place or PostalAddress
            { name: "offers",      required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Offer
            { name: "performers",  required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Person or Organization
            { name: "startDate",   required: false,  type: "datetime",  validator: validators.datetime },
            { name: "subEvents",   required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Event
            { name: "superEvent",  required: false,  type: "complex",   validator: validators.complex  }  // a child element of type Event
        ])
    });
    schemaOrg.push({
        url: "http://schema.org/Organization",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
            { name: "address",           required: false,  type: "complex",   validator: validators.complex  }, // a child element of PostalAddress
            { name: "aggregatRating",    required: false,  type: "complex",   validator: validators.complex  }, // a child element of AggregateRating
            { name: "contactPoints",     required: false,  type: "complex",   validator: validators.complex  }, // child elements of ContactPoint
            { name: "email",             required: false,  type: "text",      validator: validators.email    },
            { name: "employees",         required: false,  type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "events",            required: false,  type: "complex",   validator: validators.complex  }, // a child element of Event 
            { name: "faxNumber",         required: false,  type: "text",      validator: validators.text     },
            { name: "founders",          required: false,  type: "complex",   validator: validators.complex  }, // child elements of type Person
            { name: "foundingDate",      required: false,  type: "datetime",  validator: validators.datetime },
            { name: "interactionCount",  required: false,  type: "text",      validator: validators.text     }, // should be one of the types of UserInteraction
            { name: "location",          required: false,  type: "complex",   validator: validators.complex  }, // a child element of Place or PostalAddress
            { name: "members",           required: false,  type: "complex",   validator: validators.complex  }, // child elements of Person or Organization
            { name: "reviews",           required: false,  type: "complex",   validator: validators.complex  }, // child elements of Review
            { name: "telephone",         required: false,  type: "text",      validator: validators.text     }
        ])
    });
    schemaOrg.push({
        url: "http://schema.org/Intangible",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [])
    });
    schemaOrg.push({
        url: "http://schema.org/Product",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
            { name: "aggregateRating",  required: false,  type: "complex",  validator: validators.complex }, // a child element of AggregateRating
            { name: "brand",            required: false,  type: "complex",  validator: validators.complex }, // a child element of Organization
            { name: "manufacturer",     required: false,  type: "complex",  validator: validators.complex }, // a child element of Organization
            { name: "model",            required: false,  type: "text",     validator: validators.text    },
            { name: "offers",           required: false,  type: "complex",  validator: validators.complex }, // child elements of Offer
            { name: "productId",        required: false,  type: "text",     validator: validators.text    },
            { name: "reviews",          required: false,  type: "complex",  validator: validators.complex }  // child elements of Review
        ])
    });
    schemaOrg.push({
        url: "http://schema.org/Person",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
            { name: "additionalName",   required: false, type: "text",      validator: validators.text     },
            { name: "address",          required: false, type: "complex",   validator: validators.complex  }, // a child element of PostalAddress
            { name: "affiliation",      required: false, type: "complex",   validator: validators.complex  }, // a child element of Organization
            { name: "alumniOf",         required: false, type: "complex",   validator: validators.complex  }, // a child element of EducationalOrganization
            { name: "awards",           required: false, type: "text",      validator: validators.text     },
            { name: "birthDate",        required: false, type: "datetime",  validator: validators.datetime },
            { name: "children",         required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "colleagues",       required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "contactPoints",    required: false, type: "complex",   validator: validators.complex  }, // child elements of ContactPoint
            { name: "deathDate",        required: false, type: "datetime",  validator: validators.datetime }, // hopefully null
            { name: "email",            required: false, type: "email",     validator: validators.email    },
            { name: "familyName",       required: false, type: "text",      validator: validators.text     },
            { name: "faxNumber",        required: false, type: "text",      validator: validators.text     },
            { name: "follows",          required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "gender",           required: false, type: "text",      validator: validators.text     }, // oddly enough, does not enumerate valid values
            { name: "givenName",        required: false, type: "text",      validator: validators.text     },
            { name: "homeLocation",     required: false, type: "complex",   validator: validators.complex  }, // a child element of Place or ContactPoint
            { name: "honorificPrefix",  required: false, type: "text",      validator: validators.text     }, // something along the lines of Mr., Mrs., etc.
            { name: "honorificSuffix",  required: false, type: "text",      validator: validators.text     }, // similarly, M.D., PhD., etc.
            { name: "interactionCount", required: false, type: "text",      validator: validators.text     }, // example: "20 UserLikes, 5 UserComments"
            { name: "jobTitle",         required: false, type: "text",      validator: validators.text     }, // example: "Lion tamer"
            { name: "knows",            required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "memberOf",         required: false, type: "complex",   validator: validators.complex  }, // child elements of Organization
            { name: "nationality",      required: false, type: "complex",   validator: validators.complex  }, // a child element of Country
            { name: "parents",          required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "performerIn",      required: false, type: "complex",   validator: validators.complex  }, // child elements of Event
            { name: "relatedTo",        required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "siblings",         required: false, type: "complex",   validator: validators.complex  }, // child elements of Person
            { name: "spouse",           required: false, type: "complex",   validator: validators.complex  }, // a child element of Person (as wrong as that sounds)
            { name: "telephone",        required: false, type: "text",      validator: validators.text     },
            { name: "workLocation",     required: false, type: "complex",   validator: validators.complex  }, // a child element of Location or ContactPoint
            { name: "worksFor",         required: false, type: "complex",   validator: validators.complex  }  // a child element of Organization
        ])
    });

    schemaOrg.push({
        url: "http://schema.org/Offer",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [
            { name: "aggregateRating",  required: false,  type: "complex",  validator: validators.complex }, // AggregateRating schema child element
            { name: "availability",     required: false,  type: "complex",  validator: validators.complex }, // ItemAvailability schema child element
            { name: "itemCondition",    required: false,  type: "complex",  validator: validators.complex }, // OfferItemCondition schema child element
            { name: "itemOffered",      required: false,  type: "complex",  validator: validators.complex }, // Product schema child element
            { name: "price",            required: false,  type: "text",     validator: validators.text    },
            { name: "priceCurrency",    required: false,  type: "text",     validator: validators.text    },
            { name: "priceValidUntil",  required: false,  type: "text",     validator: validators.text    },
            { name: "reviews",          required: false,  type: "complex",  validator: validators.complex }, // Review schema child element
            { name: "seller",           required: false,  type: "complex",  validator: validators.complex }  // Organization schema child element
        ])
    });
    schemaOrg.push({
        url: "http://schema.org/AggregateOffer",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Offer"), [
            { name: "highPrice",        required: false,  type: "text",	validator: validators.text	},
            { name: "lowPrice",         required: false,  type: "text",	validator: validators.text	},
            { name: "offerCount",       required: false,  type: "text",	validator: validators.text	}
        ])
    });
    
    // add schema.org to the roster
    for (var i = 0; i < schemaOrg.length; i++) {
        $.microdata.addDefinition(schemaOrg[i].url, schemaOrg[i].fields);
    }
})(jQuery);