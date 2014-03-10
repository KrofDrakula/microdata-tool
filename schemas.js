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
	
    //Thing Updated to official Schema Version 1.0f
var schemaOrg = [
	{
		url: "http://schema.org/Thing",
			fields: [
			
			{ name: "name",					required: false,		type: "text",		validator: validators.text	},
			{ name: "alternateName",	required: false,		type: "text",		validator: validators.text	},
			{ name: "description",			required: false,		type: "text",		validator: validators.text	},
			{ name: "image",					required: false,		type: "url",		validator: validators.url		},
			{ name: "url",						required: false,		type: "url",		validator: validators.url		},
			{ name: "additionalType",		required: false,		type: "url",		validator: validators.url		},
			{ name: "sameAs",				required: false,		type: "url",		validator: validators.url		}
			
		]
	}
];

	//Event Updated to official Schema Version 1.0f
    schemaOrg.push({
        url: "http://schema.org/Event",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
		{name: "attendee",		required: false,	type: "complex",		validator: validators.complex		}, // new, child elements of type Person or Organization
	 	{name: "doorTime",		required: false,	type: "datetime",		validator: validators.datetime	},  // new, 
            { name: "attendees",   		required: false,  type: "complex",   	validator: validators.complex  	}, // child elements of type Person or Organization
	 	{name: "doorTime",		required: false,	type: "datetime",		validator: validators.datetime	}, 
            { name: "duration",    		required: false,  type: "duration",  	validator: validators.duration 	},
            { name: "endDate",     		required: false,  type: "datetime",  	validator: validators.datetime 	},
	 	{name: "eventStatus",		required: false,	type: "complex",		validator: validators.complex		},
            { name: "location",    		required: false,  type: "complex",   	validator: validators.complex  	}, // child elements of type Place or PostalAddress
            { name: "offers",      		required: false,  type: "complex",   	validator: validators.complex  	}, // child elements of type Offer
	 	{name: "performer",		required: false,	type: "complex",		validator: validators.complex		},
            { name: "performers",  		required: false,  type: "complex",   	validator: validators.complex  	}, // child elements of type Person or Organization
	 	{name: "previousStartDate",	required: false,	type: "date",				validator: validators.date			}, 
            { name: "startDate",  		required: false,  type: "datetime",  	validator: validators.datetime 	},
	 	{name: "subEvent",		required: false,	type: "complex",		validator: validators.complex		}, // new, child elements of type Event
            { name: "subEvents",   		required: false,  type: "complex",   	validator: validators.complex  	}, // child elements of type Event
            { name: "superEvent",  		required: false,  type: "complex",   	validator: validators.complex  	},  // a child element of type Event
	 	{name: "typicalAgeRange",	required: false,	type: "text",				validator: validators.text			}
			
        ])
    });
   
	//Organization Updated to official Schema Version 1.0f
   schemaOrg.push({
        url: "http://schema.org/Organization",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
            { name: "address",           					required: false,  type: "complex",   validator: validators.complex  		}, // a child element of PostalAddress
            { name: "aggregatRating",    				required: false,  type: "complex",   validator: validators.complex  		}, // a child element of AggregateRating
			 	{name: "brand",								required: false,	type: "complex",		validator: validators.complex		},  //new, a child element of  Brand or Organization
			 	{name: "contactPoint",						required: false,	type: "complex",		validator: validators.complex		}, //new, child elements of ContactPoint
            { name: "contactPoints",     					required: false,  type: "complex",   validator: validators.complex  		}, // child elements of ContactPoint
			 	{name: "department",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Organization
			 	{name: "duns",								required: false,	type: "text",				validator: validators.text			},  //new
            { name: "email",             						required: false,  type: "text",      validator: validators.email    			}, //new
			 	{name: "employee",							required: false,	type: "complex",		validator: validators.complex		}, //new, child elements of Person
            { name: "employees",         					required: false,  type: "complex",   validator: validators.complex  		}, // child elements of Person
			 	{name: "event",								required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Event 
            { name: "events",            					required: false,  type: "complex",   validator: validators.complex  		}, // a child element of Event 
            { name: "faxNumber",         					required: false,  type: "text",      validator: validators.text     				},
			 	{name: "founder",							required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Person
            { name: "founders",          					required: false,  type: "complex",   validator: validators.complex  		}, // child elements of type Person
            { name: "foundingDate",      					required: false,  type: "datetime",  validator: validators.datetime 		},
			 	{name: "globalLocationNumber",		required: false,	type: "text",				validator: validators.text			},  //new
			 	{name: "hasPOS",							required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Place
            { name: "interactionCount",  				required: false,  type: "text",      validator: validators.text     				}, // should be one of the types of UserInteraction
			 	{name: "isicV4",								required: false,	type: "text",				validator: validators.text			},  //new
			 	{name: "legalName",						required: false,	type: "text",				validator: validators.text			},  //new
            { name: "location",          						required: false,  type: "complex",   validator: validators.complex  		}, // a child element of Place or PostalAddress
			 	{name: "logo",									required: false,	type: "complex",		validator: validators.complex		},  //new, a child element of ImageObject or URL 
			 	{name: "makesOffer",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Offer
			 	{name: "member",							required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Person or Organization
            { name: "members",           					required: false,  type: "complex",   validator: validators.complex  		}, // a child element of Person or Organization
			 	{name: "naics",								required: false,	type: "text",				validator: validators.text			},  //new
			 	{name: "owns",								required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of OwnershipInfo or Product
			 	{name: "review",								required: false,	type: "complex",		validator: validators.complex		}, //new, child elements of Review
            { name: "reviews",           					required: false,  type: "complex",   validator: validators.complex  		}, // child elements of Review
			 	{name: "seeks",								required: false,	type: "text",				validator: validators.text			}, //new,  a child element of Demand
			 	{name: "subOrganization",				required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Organization
			 	{name: "taxID",								required: false,	type: "text",				validator: validators.text			},  //new
            { name: "telephone",         					required: false,  type: "text",      validator: validators.text     				},
			 	{name: "vatID",								required: false,	type: "text",				validator: validators.text			}
			
        ])
    });

    schemaOrg.push({
        url: "http://schema.org/Intangible",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [])
    });

	//Product Updated to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Product",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
			{ name: "aggregateRating",  required: false,  type: "complex",  	validator: validators.complex 	}, // a child element of AggregateRating
		 	{name: "audience",				required: false,	type: "complex",		validator: validators.complex		}, // new, a child element of Audience
			{ name: "brand",            		required: false,  type: "complex",  	validator: validators.complex 	}, // a child element of Organization
		 	{name: "color",					required: false,	type: "text",				validator: validators.text			},  // new, 
		 	{name: "depth",					required: false,	type: "complex",		validator: validators.complex		}, // new, Distance or QuantitativeValue
		 	{name: "gtin13",					required: false,	type: "text",				validator: validators.text			},  // new, 
		 	{name: "gtin14",					required: false,	type: "text",				validator: validators.text			},  // new, 
			{name: "gtin8",					required: false,	type: "text",				validator: validators.text			},  // new, 
			{name: "height",					required: false,	type: "complex",		validator: validators.complex		}, // new, Distance or QuantitativeValue
		 	{name: "isAccessoryOrSparePartFor",		required: false,	type: "complex",		validator: validators.complex		}, // new, 
		 	{name: "isConsumableFor",						required: false,	type: "complex",		validator: validators.complex		}, // new, 
		 	{name: "isRelatedTo",								required: false,	type: "complex",		validator: validators.complex		}, // new, 
		 	{name: "itemCondition",							required: false,	type: "complex",		validator: validators.complex		}, // new, 
			{name: "logo",											required: false,	type: "complex",		validator: validators.complex		},  // new, 
			{ name: "manufacturer",     						required: false,  type: "complex",  validator: validators.complex 		}, // a child element of Organization
			{ name: "model",           							required: false,  type: "text",     validator: validators.text    				},
		 	{name: "mpn",											required: false,	type: "text",				validator: validators.text			},  // new, 
			{ name: "offers",           							required: false,  type: "complex",  validator: validators.complex 		}, // child elements of Offer
			{ name: "productId",        						required: false,  type: "text",     validator: validators.text    				},
		 	{name: "releaseDate",								required: false,	type: "date",		validator: validators.date					},  // new, 
		 	{name: "review",										required: false,	type: "complex",		validator: validators.complex		}, // new, 
			{ name: "reviews",          							required: false,  type: "complex",  validator: validators.complex 		},  // child elements of Review
		 	{name: "sku",											required: false,	type: "text",				validator: validators.text			},  // new, 
		 	{name: "weight",										required: false,	type: "complex",		validator: validators.complex		}, // new, QuantitativeValue
		 	{name: "width",										required: false,	type: "complex",		validator: validators.complex		}
			
	])
});

	    //CreativeWork Updated to official Schema Version 1.0f
	schemaOrg.push({
        url: "http://schema.org/CreativeWork",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
            {name: "about",                required: false, type: "complex",  validator: validators.text				},
			{name: "accessibilityAPI",				required: false, type: "text",			validator: validators.text	},  // new
			{name: "accessibilityControl",		required: false, type: "text",			validator: validators.text	}, // new
			{name: "accessibilityFeature",		required: false, type: "text",			validator: validators.text	}, // new
			{name: "accessibilityHazard",		required: false, type: "text",			validator: validators.text	}, // new
            {name: "accountablePerson",    required: false, type: "complex",  validator: validators.text		},
            {name: "aggregateRating",      required: false, type: "complex",  validator: validators.text			},
            {name: "alternativeHeadline",  required: false, type: "text",     validator: validators.text				},
            {name: "associatedMedia",      required: false, type: "complex",  validator: validators.text			},
            {name: "audience",             required: false, type: "complex",  validator: validators.text				},
            {name: "audio",                required: false, type: "complex",  validator: validators.complex			},
            {name: "author",               required: false, type: "complex",  validator: validators.complex		},
            {name: "award",                required: false, type: "text",     validator: validators.text					},
            {name: "awards",               required: false, type: "text",     validator: validators.text					},
            {name: "comment",              required: false, type: "complex",  validator: validators.complex		},
            {name: "contentLocation",      required: false, type: "complex",  validator: validators.complex	},
            {name: "contentRating",        required: false, type: "text",     validator: validators.text				},
            {name: "contributor",          required: false, type: "complex",  validator: validators.complex		},
            {name: "copyrightHolder",      required: false, type: "complex",  validator: validators.complex	},
            {name: "copyrightYear",        required: false, type: "number",validator: validators.number			},
            {name: "creator",              required: false, type: "complex",  validator: validators.complex		},
            {name: "dateCreated",          required: false, type: "date", validator: validators.date					}, // Changed from datetime to date, accordingly to official Schema Version 1.0f
            {name: "dateModified",         required: false, type: "date", validator: validators.date					}, // Changed from datetime to date, accordingly to official Schema Version 1.0f
            {name: "datePublished",        required: false, type: "date", validator: validators.date					}, // Changed from datetime to date, accordingly to official Schema Version 1.0f
            {name: "discussionUrl",        required: false, type: "url",      validator: validators.url					},
            {name: "editor",               required: false, type: "complex",  validator: validators.complex			},
            {name: "educationalAlignment", required: false, type: "complex",  validator: validators.complex	},
            {name: "educationalUse",       required: false, type: "text",     validator: validators.text				},
            {name: "encoding",             required: false, type: "complex",  validator: validators.complex		},
            {name: "encodings",            required: false, type: "complex",  validator: validators.complex		},
            {name: "genre",                required: false, type: "text",     validator: validators.text					},
            {name: "headline",             required: false, type: "text",     validator: validators.text					},
            {name: "inLanguage",           required: false, type: "text",     validator: validators.text				},
            {name: "interactionCount",     required: false, type: "text",     validator: validators.text				},
            {name: "interactivityType",    required: false, type: "text",     validator: validators.text				},
            {name: "isBasedOnUrl",         required: false, type: "url",      validator: validators.url					},
            {name: "isFamilyFriendly",     required: false, type: "boolean",  validator: validators.boolean		},
            {name: "keywords",             required: false, type: "text",     validator: validators.text				},
            {name: "learningResourceType", required: false, type: "text",     validator: validators.text			},
            {name: "mentions",             required: false, type: "complex",  validator: validators.complex		},
            {name: "offers",               required: false, type: "complex",  validator: validators.complex			},
            {name: "provider",             required: false, type: "complex",  validator: validators.complex		},
            {name: "publisher",            required: false, type: "complex",  validator: validators.complex		},
            {name: "publishingPrinciples", required: false, type: "url",      validator: validators.url					},
            {name: "review",               required: false, type: "complex",  validator: validators.complex		},
            {name: "reviews",              required: false, type: "complex",  validator: validators.complex		},
            {name: "sourceOrganization",   required: false, type: "complex",  validator: validators.complex	},
            {name: "text",                 required: false, type: "text",     validator: validators.text					},
            {name: "thumbnailUrl",         required: false, type: "url",      validator: validators.url					},
            {name: "timeRequired",         required: false, type: "duration", validator: validators.duration		},
            {name: "typicalAgeRange",      required: false, type: "text",     validator: validators.text				},
            {name: "version",              required: false,	type: "number",		validator: validators.number	},
            {name: "video" ,               required: false, type: "complex",  validator: validators.complex			}
			
        ])
    });

    schemaOrg.push({
        url: "http://schema.org/Book",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [
		
            { name: "bookEdition",						required: false, type: "text",    validator: validators.text				},
            { name: "bookFormat",					required: false, type: "complex", validator: validators.complex	},
            { name: "illustrator",							required: false, type: "complex", validator: validators.complex	},
            { name: "isbn",									required: false, type: "text",    validator: validators.text				},
            { name: "numberOfPages",				required: false, type: "int",     validator: validators.int				}
			
        ])
    });
	
		    //Person Updated to official Schema Version 1.0f
    schemaOrg.push({
        url: "http://schema.org/Person",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
            { name: "additionalName",   required: false, type: "text",      validator: validators.text							},
            { name: "address",          required: false, type: "complex",   validator: validators.complex						}, // a child element of PostalAddress
            { name: "affiliation",      required: false, type: "complex",   validator: validators.complex						}, // a child element of Organization
            { name: "alumniOf",         required: false, type: "complex",   validator: validators.complex						}, // a child element of EducationalOrganization
			 	{name: "award",		required: false,	type: "text",				validator: validators.text							}, //new, 
            { name: "awards",           required: false, type: "text",      validator: validators.text								},
            { name: "birthDate",        required: false, type: "datetime",  validator: validators.datetime						},
			 	{name: "brand",		required: false,	type: "complex",		validator: validators.complex						}, //new, 
            { name: "children",         required: false, type: "complex",   validator: validators.complex						}, // child elements of Person
			 	{name: "colleague",		required: false,	type: "complex",		validator: validators.complex					}, //new, 
            { name: "colleagues",       required: false, type: "complex",   validator: validators.complex						}, // child elements of Person
			 	{name: "contactPoints",		required: false,	type: "complex",		validator: validators.complex			}, //new, child elements of ContactPoint
            { name: "contactPoints",    required: false, type: "complex",   validator: validators.complex					}, // child elements of ContactPoint
            { name: "deathDate",        required: false, type: "datetime",  validator: validators.datetime					}, // hopefully null
			 	{name: "duns",		required: false,	type: "text",				validator: validators.text							},  //new, 
            { name: "email",            required: false, type: "email",     validator: validators.email								},
            { name: "familyName",       required: false, type: "text",      validator: validators.text								},
            { name: "faxNumber",        required: false, type: "text",      validator: validators.text								},
            { name: "follows",          required: false, type: "complex",   validator: validators.complex						}, // child elements of Person
            { name: "gender",           required: false, type: "text",      validator: validators.text								}, // oddly enough, does not enumerate valid values
            { name: "givenName",        required: false, type: "text",      validator: validators.text								},
			 	{name: "globalLocationNumber",		required: false,	type: "text",				validator: validators.text	},  //new, 
			 	{name: "hasPOS",		required: false,	type: "complex",		validator: validators.complex					}, //new, a child element of Place
            { name: "homeLocation",     required: false, type: "complex",   validator: validators.complex					}, // a child element of Place or ContactPoint
            { name: "honorificPrefix",  required: false, type: "text",      validator: validators.text								}, // something along the lines of Mr., Mrs., etc.
            { name: "honorificSuffix",  required: false, type: "text",      validator: validators.text								}, // similarly, M.D., PhD., etc.
            { name: "interactionCount", required: false, type: "text",      validator: validators.text							}, // example: "20 UserLikes, 5 UserComments"
			 	{name: "isicV4",		required: false,	type: "text",				validator: validators.text							},  //new, 
            { name: "jobTitle",         required: false, type: "text",      validator: validators.text									}, // example: "Lion tamer"
            { name: "knows",            required: false, type: "complex",   validator: validators.complex						}, // child elements of Person
			 	{name: "makesOffer",		required: false,	type: "complex",		validator: validators.complex				}, //new, a child element of Offer
            { name: "memberOf",         required: false, type: "complex",   validator: validators.complex 					}, // child elements of Organization
			 	{name: "naics",		required: false,	type: "text",				validator: validators.text							},  //new, 
            { name: "nationality",      required: false, type: "complex",   validator: validators.complex  					}, // a child element of Country
			 	{name: "owns",		required: false,	type: "complex",		validator: validators.complex						}, //new, 
			 	{name: "parent",		required: false,	type: "complex",		validator: validators.complex						}, //new, a child element of Person
            { name: "parents",          required: false, type: "complex",   validator: validators.complex  					}, // child elements of Person
            { name: "performerIn",      required: false, type: "complex",   validator: validators.complex 					}, // child elements of Event
            { name: "relatedTo",        required: false, type: "complex",   validator: validators.complex						}, // child elements of Person
			 	{name: "seeks",		required: false,	type: "text",				validator: validators.text							}, //new, 
            { name: "siblings",         required: false, type: "complex",   validator: validators.complex  						}, // child elements of Person
            { name: "spouse",           required: false, type: "complex",   validator: validators.complex  					}, // a child element of Person (as wrong as that sounds)
			 	{name: "taxID",		required: false,	type: "text",				validator: validators.text							},  //new, 
            { name: "telephone",        required: false, type: "text",      validator: validators.text     							},
			 	{name: "vatID",		required: false,	type: "text",				validator: validators.text							},  //new, 
            { name: "workLocation",     required: false, type: "complex",   validator: validators.complex  				}, // a child element of Location or ContactPoint
            { name: "worksFor",         required: false, type: "complex",   validator: validators.complex  					}  // a child element of Organization
			
        ])
    });

			    //Offer Updated to official Schema Version 1.0f
    schemaOrg.push({
        url: "http://schema.org/Offer",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [
		
				{name: "acceptedPaymentMethod",		required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of PaymentMethod
				{name: "addOn",									required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Offer
				{name: "advanceBookingRequirement",required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of QuantitativeValue
				{ name: "aggregateRating",					required: false,  type: "complex",		validator: validators.complex		}, // AggregateRating schema child element
				{ name: "availability",							required: false,  type: "complex",		validator: validators.complex		}, // ItemAvailability schema child element
			 	{name: "availabilityEnds",						required: false,	type: "datetime",		validator: validators.datetime	},  //new, 
			 	{name: "availabilityStarts",					required: false,	type: "datetime",		validator: validators.datetime	},  //new, 
			 	{name: "availableAtOrFrom",				required: false,	type: "complex",		validator: validators.complex		}, //new, 
			 	{name: "availableDeliveryMethod",		required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of DeliveryMethod
			 	{name: "businessFunction",					required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of BusinessFunction
			 	{name: "category",								required: false,	type: "complex",		validator: validators.complex		}, 
			 	{name: "deliveryLeadTime",					required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of QuantitativeValue
			 	{name: "eligibleCustomerType",			required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of BusinessEntityType
			 	{name: "eligibleDuration",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of QuantitativeValue
			 	{name: "eligibleQuantity",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of QuantitativeValue
			 	{name: "eligibleRegion",						required: false,	type: "text",				validator: validators.text			}, //new, 
			 	{name: "eligibleTransactionVolume",		required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of PriceSpecification
			 	{name: "gtin8",									required: false,	type: "text",				validator: validators.text			},  //new, 
			 	{name: "gtin13",									required: false,	type: "text",				validator: validators.text			},  //new, 
			 	{name: "gtin14",									required: false,	type: "text",				validator: validators.text			},  //new, 
			 	{name: "includesObject",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of TypeAndQuantityNode
			 	{name: "inventoryLevel",						required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of QuantitativeValue
				{ name: "itemCondition",						required: false,  type: "complex",		validator: validators.complex		}, // OfferItemCondition schema child element
				{ name: "itemOffered",							required: false,  type: "complex",		validator: validators.complex		}, // Product schema child element
			 	{name: "mpn",										required: false,	type: "text",				validator: validators.text			},  //new, 
				{ name: "price",									required: false,  type: "text",			validator: validators.text    		},
				{ name: "priceCurrency",						required: false,  type: "currency",		validator: validators.currency    	},
			 	{name: "priceSpecification",					required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of PriceSpecification
				{ name: "priceValidUntil",						required: false,  type: "text",			validator: validators.text    		},
			 	{name: "review",									required: false,	type: "complex",		validator: validators.complex		}, //new, a child element of Review
				{ name: "reviews",								required: false,  type: "complex",		validator: validators.complex		}, // a child element of Review
				{ name: "seller",									required: false,  type: "complex",		validator: validators.complex		},  // Organization schema child element
			 	{name: "serialNumber",						required: false,	type: "text",				validator: validators.text			},  //new, 
			 	{name: "sku",										required: false,	type: "text",				validator: validators.text			},  //new, 
			 	{name: "validFrom",								required: false,	type: "datetime",		validator: validators.datetime	},  //new, 
			 	{name: "validThrough",							required: false,	type: "datetime",		validator: validators.datetime	},  //new, 
			 	{name: "warranty",								required: false,	type: "complex",		validator: validators.complex		}
			
        ])
    });

    schemaOrg.push({
        url: "http://schema.org/AggregateOffer",
        fields: extend(findByUrl(schemaOrg, "http://schema.org/Offer"), [
		
            { name: "highPrice",        required: false,  type: "text",		validator: validators.text	},
            { name: "lowPrice",         required: false,  type: "text",		validator: validators.text	},
            { name: "offerCount",       required: false,  type: "text",	validator: validators.text	}
			
        ])
    });

//WebPage, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/WebPage",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [
		
 	{name: "breadcrumb",						required: false,	type: "text",				validator: validators.text			}, 
 	{name: "isPartOf",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "lastReviewed",					required: false,	type: "date",				validator: validators.date			}, 
 	{name: "mainContentOfPage",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "primaryImageOfPage",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedLink",						required: false,	type: "url",				validator: validators.url				}, 
	{name: "reviewedBy",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "significantLink",					required: false,	type: "url",				validator: validators.url				}, 
 	{name: "significantLinks",					required: false,	type: "url",				validator: validators.url				}, 
 	{name: "specialty",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MediaObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MediaObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [
		
 	{name: "associatedArticle",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "bitrate",							required: false,	type: "text",				validator: validators.text			}, 
 	{name: "contentSize",					required: false,	type: "text",				validator: validators.text			}, 
 	{name: "contentUrl",					required: false,	type: "url",				validator: validators.url				},
 	{ name: "duration",						required: false,	type: "duration",		validator: validators.duration		},
 	{name: "embedUrl",						required: false,	type: "url",				validator: validators.url				},
 	{name: "encodesCreativeWork",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "encodingFormat",			required: false,	type: "text",				validator: validators.text			}, 
 	{name: "expires",							required: false,	type: "date",				validator: validators.date			},
 	{name: "height",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "playerType",					required: false,	type: "text",				validator: validators.text			}, 
 	{name: "productionCompany",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "publication",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "regionsAllowed",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "requiresSubscription",		required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "uploadDate",					required: false,	type: "date",				validator: validators.date			},
 	{name: "width",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});
	
//VideoObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/VideoObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MediaObject"), [
		
	{name: "caption",					required: false,	type: "text",				validator: validators.text		},
 	{name: "thumbnail",				required: false,	type: "complex",		validator: validators.complex	},
 	{name: "transcript",				required: false,	type: "text",				validator: validators.text		},
 	{name: "videoFrameSize",	required: false,	type: "text",				validator: validators.text		},
 	{name: "videoQuality",			required: false,	type: "text",				validator: validators.text		}
	
		])
});
	
//Article, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Article",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [
		
	 {name: "articleBody",		required: false,	type: "text",				validator: validators.text	},
 	{name: "articleSection",	required: false,	type: "text",				validator: validators.text	},
 	{ name: "wordCount",		required: false,	type: "int",				validator: validators.int		}
	
		])
});

//BlogPosting, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/BlogPosting",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Article"), [
		
	 {name: "articleBody",		required: false,	type: "text",				validator: validators.text	},
 	{name: "articleSection",	required: false,	type: "text",				validator: validators.text	},
 	{ name: "wordCount",		required: false,	type: "int",				validator: validators.int		}
	
		])
});

//ScholarlyArticle, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ScholarlyArticle",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Article"), [
		
	 {name: "articleBody",		required: false,	type: "text",				validator: validators.text	},
 	{name: "articleSection",	required: false,	type: "text",				validator: validators.text	},
 	{ name: "wordCount",		required: false,	type: "int",				validator: validators.int		}
	
		])
});

//ScholarlyArticle, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalScholarlyArticle",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/ScholarlyArticle"), [
		
 	{name: "publicationType",		required: false,	type: "text",			validator: validators.text	}
	
		])
});
 
//ScholarlyArticle, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TechArticle",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Article"), [
		
  	{name: "dependencies",		required: false,	type: "text",			validator: validators.text	},
 	{name: "proficiencyLevel",	required: false,	type: "text",			validator: validators.text	}
	
		])
});
 
//NewsArticle, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/NewsArticle",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Article"), [
		
 	{name: "dateline",			required: false,	type: "text",				validator: validators.text	},
 	{name: "printColumn",		required: false,	type: "text",				validator: validators.text	},
 	{name: "printEdition",		required: false,	type: "text",				validator: validators.text	},
 	{name: "printPage",			required: false,	type: "text",				validator: validators.text	},
	{name: "printSection",		required: false,	type: "text",				validator: validators.text	}
	
	])
});

//ContactPoint, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ContactPoint",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
 	{name: "areaServed",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "availableLanguage",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "contactOption",			required: false,	type: "complex",		validator: validators.complex		},
	{name: "contactType",				required: false,	type: "text",				validator: validators.text			},
 	{ name: "email",						required: false, type: "email",			validator: validators.email			},
 	{name: "faxNumber",				required: false,	type: "text",				validator: validators.text			},
 	{name: "hoursAvailable",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "productSupported",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "telephone",					required: false,	type: "text",				validator: validators.text			}
	
		])
});

//PostalAddress, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PostalAddress",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/ContactPoint"), [
		
 	{name: "addressCountry",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "addressLocality",				required: false,	type: "text",				validator: validators.text			},
 	{name: "addressRegion",				required: false,	type: "text",				validator: validators.text			},
 	{name: "postalCode",					required: false,	type: "text",				validator: validators.text			},
 	{name: "postOfficeBoxNumber",	required: false,	type: "text",				validator: validators.text			},
 	{name: "streetAddress",				required: false,	type: "text",				validator: validators.text			}
	
		])
});

//MusicRecording, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MusicRecording",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [
		
			{name: "byArtist",		required: false,	type: "complex",		validator: validators.complex		},
			{ name: "duration",		required: false,	type: "duration",		validator: validators.duration		},
			{name: "inAlbum",		required: false,	type: "complex",		validator: validators.complex		},
			{name: "inPlaylist",		required: false,	type: "complex",		validator: validators.complex		}
			
		])
});

//Place, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Place",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [
		
 	{name: "address",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "aggregateRating",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "containedIn",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "event",									required: false,	type: "complex",		validator: validators.complex		},
 	{name: "events",									required: false,	type: "complex",		validator: validators.complex		},
 	{name: "faxNumber",							required: false,	type: "text",				validator: validators.text			},
 	{name: "geo",										required: false,	type: "complex",		validator: validators.complex		},
 	{name: "globalLocationNumber",			required: false,	type: "text",				validator: validators.text			},
 	{name: "interactionCount",					required: false,	type: "text",				validator: validators.text			},
 	{name: "isicV4",									required: false,	type: "text",				validator: validators.text			},
 {name: "logo",										required: false,	type: "complex",		validator: validators.complex		},
 	{name: "map",										required: false,	type: "url",				validator: validators.url				},
 	{name: "maps",									required: false,	type: "url",				validator: validators.url				},
 	{name: "openingHoursSpecification",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "photo",									required: false,	type: "complex",		validator: validators.complex		},
 {name: "photos",									required: false,	type: "complex",		validator: validators.complex		},
 	{name: "review",									required: false,	type: "complex",		validator: validators.complex		},
 	{name: "reviews",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "telephone",								required: false,	type: "text",				validator: validators.text			}
	
		])
});

//LocalBusiness, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/LocalBusiness",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Organization"), [
		
 	{name: "branchOf",								required: false,	type: "complex",		validator: validators.complex		},
	{ name: "currenciesAccepted",				required: false,	type: "currency",		validator: validators.currency		},
 	{ name: "openingHours",						required: false,	type: "duration",		validator: validators.duration		},
 	{name: "paymentAccepted",					required: false,	type: "text",				validator: validators.text			},
 	{name: "priceRange",							required: false,	type: "text",				validator: validators.text			}
	
		])
});

//Rating, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Rating",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [
		
 	{name: "bestRating",		required: false,	type: "text",				validator: validators.text			},
 	{name: "ratingValue",		required: false,	type: "text",				validator: validators.text			},
 	{name: "worstRating",		required: false,	type: "text",				validator: validators.text			}
	
		])
});

//AggregateRating, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/AggregateRating",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Rating"), [
		
 	{name: "itemReviewed",	required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "ratingCount",		required: false,	type: "number",		validator: validators.number		},
 	{ name: "reviewCount",	required: false,	type: "number",		validator: validators.number		}
	
		])
});

//UserComments, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/UserComments",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Event"), [

 	{name: "commentText",		required: false,	type: "text",				validator: validators.text			},
 	{name: "commentTime",		required: false,	type: "date",				validator: validators.date			},
 	{name: "creator",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "discusses",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "replyToUrl",			required: false,	type: "url",				validator: validators.url				}
	
		])
});

//Review, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Review",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "itemReviewed",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "reviewBody",		required: false,	type: "text",				validator: validators.text			},
 	{name: "reviewRating",	required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MusicGroup, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MusicGroup",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Organization"), [

 	{name: "album",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "albums",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "musicGroupMember",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "track",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "tracks",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//JobPosting, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/JobPosting",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{ name: "baseSalary",						required: false,	type: "number",		validator: validators.number		},
 	{name: "benefits",							required: false,	type: "text",				validator: validators.text			},
 	{name: "datePosted",						required: false,	type: "date",				validator: validators.date			},
 	{name: "educationRequirements",		required: false,	type: "text",				validator: validators.text			},
 	{name: "employmentType",				required: false,	type: "text",				validator: validators.text			},
 	{name: "experienceRequirements",	required: false,	type: "text",				validator: validators.text			},
 	{name: "hiringOrganization",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "incentives",							required: false,	type: "text",				validator: validators.text			},
 	{name: "industry",							required: false,	type: "text",				validator: validators.text			},
 	{name: "jobLocation",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "occupationalCategory",		required: false,	type: "text",				validator: validators.text			},
 	{name: "qualifications",						required: false,	type: "text",				validator: validators.text			},
 	{name: "responsibilities",					required: false,	type: "text",				validator: validators.text			},
 	{ name: "salaryCurrency",				required: false,	type: "currency",		validator: validators.currency		},
 	{name: "skills",									required: false,	type: "text",				validator: validators.text			},
 	{name: "specialCommitments",		required: false,	type: "text",				validator: validators.text			},
 	{name: "title",									required: false,	type: "text",				validator: validators.text			},
 	{name: "workHours",						required: false,	type: "text",				validator: validators.text			}
	
		])
});

//MusicPlaylist, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MusicPlaylist",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{ name: "numTracks",		required: false,	type: "int",				validator: validators.int				},
 	{name: "track",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "tracks",				required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MusicAlbum, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MusicAlbum",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MusicPlaylist"), [

 	{name: "byArtist",			required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Blog, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Blog",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "blogPost",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "blogPosts",		required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//GeoCoordinates, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/GeoCoordinates",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [

 	{name: "elevation",		required: false,	type: "text",				validator: validators.text			},
 	{name: "latitude",			required: false,	type: "text",				validator: validators.text			},
 	{name: "longitude",		required: false,	type: "text",				validator: validators.text			}
	
		])
});

//SoftwareApplication, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SoftwareApplication",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "applicationCategory",			required: false,	type: "text",				validator: validators.text			},
 	{name: "applicationSubCategory",	required: false,	type: "text",				validator: validators.text			},
 	{name: "applicationSuite",				required: false,	type: "text",				validator: validators.text			},
 	{name: "countriesNotSupported",		required: false,	type: "text",				validator: validators.text			},
 	{name: "countriesSupported",			required: false,	type: "text",				validator: validators.text			},
 	{name: "device",								required: false,	type: "text",				validator: validators.text			},
 	{name: "downloadUrl",						required: false,	type: "url",				validator: validators.url				},
 	{name: "featureList",						required: false,	type: "text",				validator: validators.text			},
 	{name: "fileFormat",						required: false,	type: "text",				validator: validators.text			},
 	{ name: "fileSize",							required: false,	type: "int",				validator: validators.int				},
 	{name: "installUrl",							required: false,	type: "url",				validator: validators.url				},
 	{name: "memoryRequirements",		required: false,	type: "text",				validator: validators.text			},
 	{name: "operatingSystem",				required: false,	type: "text",				validator: validators.text			},
 	{name: "permissions",						required: false,	type: "text",				validator: validators.text			},
 	{name: "processorRequirements",	required: false,	type: "text",				validator: validators.text			},
 	{name: "releaseNotes",					required: false,	type: "text",				validator: validators.text			},
 	{name: "requirements",					required: false,	type: "text",				validator: validators.text			},
 	{name: "screenshot",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "softwareVersion",				required: false,	type: "text",				validator: validators.text			},
 	{name: "storageRequirements",		required: false,	type: "text",				validator: validators.text			}
	
		])
});

//MobileApplication, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MobileApplication",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/SoftwareApplication"), [

 	{name: "carrierRequirements",			required: false,	type: "text",				validator: validators.text			}
	
		])
});

//WebApplication, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/WebApplication",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/SoftwareApplication"), [

 	{name: "browserRequirements",		required: false,	type: "text",				validator: validators.text			}
	
		])
});

//ItemList, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ItemList",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "itemListElement",	required: false,	type: "text",		validator: validators.text	},
 	{name: "itemListOrder",		required: false,	type: "text",		validator: validators.text	}
	
		])
});

//Movie, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Movie",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "actor",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "actors",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "director",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "directors",						required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "duration",						required: false,	type: "duration",		validator: validators.duration		},
 	{name: "musicBy",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "producer",						required: false,	type: "complex",		validator: validators.complex		},
	{name: "productionCompany",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "trailer",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Recipe, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Recipe",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "cookingMethod",			required: false,	type: "text",				validator: validators.text			},
 	{ name: "cookTime",				required: false,	type: "duration",		validator: validators.duration		},
 	{name: "ingredients",				required: false,	type: "text",				validator: validators.text			},
 	{name: "nutrition",					required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "prepTime",					required: false,	type: "duration",		validator: validators.duration		},
 	{name: "recipeCategory",			required: false,	type: "text",				validator: validators.text			},
 	{name: "recipeCuisine",			required: false,	type: "text",				validator: validators.text			},
 	{name: "recipeInstructions",		required: false,	type: "text",				validator: validators.text			},
 	{name: "recipeYield",				required: false,	type: "text",				validator: validators.text			},
 	{ name: "totalTime",				required: false,	type: "duration",		validator: validators.duration		}
	
		])
});

//AggregateOffer, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/AggregateOffer",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Offer"), [

 	{name: "highPrice",		required: false,	type: "text",				validator: validators.text			},
 	{name: "lowPrice",		required: false,	type: "text",				validator: validators.text			},
 	{name: "offerCount",	required: false,	type: "int",				validator: validators.int				}
	
		])
});

//Series, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Series",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "actor",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "actors",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "director",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "directors",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "endDate",						required: false,	type: "date",				validator: validators.date			},
 	{name: "episode",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "episodes",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "musicBy",						required: false,	type: "complex",		validator: validators.complex		},
	{name: "numberOfEpisodes",		required: false,	type: "text",				validator: validators.text			},
 	{name: "numberOfSeasons",		required: false,	type: "text",				validator: validators.text			},
 	{name: "producer",						required: false,	type: "complex",		validator: validators.complex		},
	{name: "productionCompany",		required: false,	type: "complex",		validator: validators.complex		},
	{name: "season",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "seasons",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "startDate",						required: false,	type: "date",				validator: validators.date			}, 
 	{name: "trailer",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Action, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Action",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [

 	{name: "agent",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "endTime",		required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "instrument",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "location",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "object",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "participant",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "result",			required: false,	type: "complex",		validator: validators.complex		},
	{name: "startTime",		required: false,	type: "datetime",		validator: validators.datetime	}
		])
});

//Clip, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Clip",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{ name: "clipNumber",		required: false,	type: "int",				validator: validators.int				},
 	{name: "partOfEpisode",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "partOfSeason",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "partOfSeries",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "position",			required: false,	type: "text",				validator: validators.text			},
 	{name: "publication",		required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//TVClip, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TVClip",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Clip"), [

 	{name: "partOfTVSeries",		required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Dataset, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Dataset",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "catalog",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "distribution",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "spatial",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "temporal",		required: false,	type: "datetime",		validator: validators.datetime	}
	
		])
});

//Diet, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Diet",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "dietFeatures",					required: false,	type: "text",				validator: validators.text			},
 	{name: "endorsers",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "expertConsiderations",	required: false,	type: "text",				validator: validators.text			},
 	{name: "overview",						required: false,	type: "text",				validator: validators.text			},
	{name: "physiologicalBenefits",		required: false,	type: "text",				validator: validators.text			},
 	{name: "proprietaryName",			required: false,	type: "text",				validator: validators.text			},
 	{name: "risks",								required: false,	type: "text",				validator: validators.text			}
	
		])
});

//MedicalEntity, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalEntity",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [

 	{name: "code",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "guideline",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "medicineSystem",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "recognizingAuthority",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relevantSpecialty",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "study",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MedicalTherapy, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalTherapy",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "adverseOutcome",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "contraindication",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "duplicateTherapy",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "indication",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "seriousAdverseOutcome",	required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Episode, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Episode",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "actor",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "actors",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "director",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "directors",						required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "episodeNumber",			required: false,	type: "int",				validator: validators.int				},
 	{name: "musicBy",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "partOfSeason",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "partOfSeries",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "position",						required: false,	type: "text",				validator: validators.text			},
 	{name: "producer",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "productionCompany",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "publication",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "trailer",							required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//TVEpisode, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TVEpisode",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Episode"), [

 	{name: "partOfTVSeries",		required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//ExercisePlan, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ExercisePlan",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{ name: "activityDuration",	required: false,	type: "duration",		validator: validators.duration		},
 	{name: "activityFrequency",	required: false,	type: "text",				validator: validators.text			},
 	{name: "additionalVariable",	required: false,	type: "text",				validator: validators.text			},
 	{name: "exerciseType",		required: false,	type: "text",				validator: validators.text			},
 	{name: "intensity",				required: false,	type: "text",				validator: validators.text			},
 	{ name: "repetitions",			required: false,	type: "number",		validator: validators.number		},
 	{name: "restPeriods",			required: false,	type: "text",				validator: validators.text			},
 	{name: "workload",				required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Season, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Season",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/CreativeWork"), [

 	{name: "endDate",					required: false,	type: "date",				validator: validators.date			},
 	{name: "episode",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "episodes",					required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "numberOfEpisodes",	required: false,	type: "number",		validator: validators.number		},
	{name: "partOfSeries",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "position",					required: false,	type: "text",				validator: validators.text			},
 	{name: "producer",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "productionCompany",	required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "seasonNumber",		required: false,	type: "int",				validator: validators.int				},
 	{name: "startDate",					required: false,	type: "date",				validator: validators.date			},
 	{name: "trailer",						required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//TVSeason, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TVSeason",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Season"), [

 	{name: "partOfTVSeries",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//DeliveryEvent, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/DeliveryEvent",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Event"), [

 	{name: "accessCode",				required: false,	type: "text",				validator: validators.text			},
 	{name: "availableFrom",			required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "availableThrough",		required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "hasDeliveryMethod",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//Demand, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Demand",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "acceptedPaymentMethod",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "advanceBookingRequirement",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "availability",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "availabilityEnds",							required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "availabilityStarts",						required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "availableAtOrFrom",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "availableDeliveryMethod",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "businessFunction",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "deliveryLeadTime",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "eligibleCustomerType",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "eligibleDuration",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "eligibleQuantity",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "eligibleRegion",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "eligibleTransactionVolume",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "gtin13",										required: false,	type: "text",				validator: validators.text			},
 	{name: "gtin14",										required: false,	type: "text",				validator: validators.text			},
 	{name: "gtin8",										required: false,	type: "text",				validator: validators.text			},
 	{name: "includesObject",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "inventoryLevel",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "itemCondition",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "itemOffered",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "mpn",											required: false,	type: "text",				validator: validators.text			},
 	{name: "priceSpecification",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "seller",										required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serialNumber",							required: false,	type: "text",				validator: validators.text			},
 	{name: "sku",											required: false,	type: "text",				validator: validators.text			},
 	{name: "validFrom",									required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "validThrough",								required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "warranty",									required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//Order, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Order",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "acceptedOffer",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "billingAddress",			required: false,	type: "complex",		validator: validators.complex		},
	{name: "confirmationNumber",	required: false,	type: "text",				validator: validators.text			},
 	{name: "customer",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "discount",					required: false,	type: "text",				validator: validators.text			},
 	{name: "discountCode",			required: false,	type: "text",				validator: validators.text			},
 	{ name: "discountCurrency",		required: false,	type: "currency",		validator: validators.currency		},
 	{name: "isGift",						required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "merchant",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "orderDate",				required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "orderedItem",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "orderNumber",			required: false,	type: "text",				validator: validators.text			},
 	{name: "orderStatus",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "paymentDue",			required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "paymentMethod",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "paymentMethodId",	required: false,	type: "text",				validator: validators.text			},
 	{name: "paymentUrl",				required: false,	type: "url",				validator: validators.url				}
	
		])
});

//ParcelDelivery, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ParcelDelivery",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "carrier",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "deliveryAddress",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "deliveryStatus",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "expectedArrivalFrom",		required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "expectedArrivalUntil",		required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "hasDeliveryMethod",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "itemShipped",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "originAddress",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "partOfOrder",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "trackingNumber",			required: false,	type: "text",				validator: validators.text			},
 	{name: "trackingUrl",					required: false,	type: "url",				validator: validators.url				}
	
		])
});

//Permit, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Permit",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "issuedBy",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "issuedThrough",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "permitAudience",		required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "validFor",				required: false,	type: "duration",		validator: validators.duration		},
 	{name: "validFrom",				required: false,	type: "datetime",		validator: validators.datetime	},
 	{name: "validIn",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "validUntil",				required: false,	type: "date",				validator: validators.date			}
	
		])
});

//Service, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Service",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "availableChannel",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "produces",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "provider",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceArea",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceAudience",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceType",			required: false,	type: "text",				validator: validators.text			}
	
		])
});

//GovernmentService, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/GovernmentService",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Service"), [

 	{name: "serviceOperator",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//ServiceChannel, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ServiceChannel",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "availableLanguage",			required: false,	type: "complex",		validator: validators.complex		},
 	{ name: "processingTime",			required: false,	type: "duration",		validator: validators.duration		},
 	{name: "providesService",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceLocation",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "servicePhone",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "servicePostalAddress",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceSmsNumber",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "serviceUrl",						required: false,	type: "url",				validator: validators.url				}
	
		])
});

//AnatomicalStructure, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/AnatomicalStructure",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "associatedPathophysiology",	required: false,	type: "text",				validator: validators.text			},
 	{name: "bodyLocation",						required: false,	type: "text",				validator: validators.text			},
 	{name: "connectedTo",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "diagram",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "function",								required: false,	type: "text",				validator: validators.text			},
 	{name: "partOfSystem",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedCondition",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedTherapy",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "subStructure",						required: false,	type: "complex",		validator: validators.complex		}

		])
});

//IndividualProduct, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/IndividualProduct",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Product"), [

 	{name: "serialNumber",	required: false,	type: "text",		validator: validators.text	}
	
		])
});

//ProductModel, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ProductModel",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Product"), [

 	{name: "isVariantOf",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "predecessorOf",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "successorOf",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//SomeProducts, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SomeProducts",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Product"), [

 	{name: "inventoryLevel",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//Property, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Property",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [

 	{name: "domainIncludes",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "rangeIncludes",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//SuperficialAnatomy, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SuperficialAnatomy",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "associatedPathophysiology",	required: false,	type: "text",				validator: validators.text			},
 	{name: "relatedAnatomy",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedCondition",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedTherapy",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "significance",							required: false,	type: "text",				validator: validators.text			}

		])
});

//Drug, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Drug",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalTherapy"), [

 	{name: "activeIngredient",			required: false,	type: "text",				validator: validators.text			},
 	{name: "administrationRoute",		required: false,	type: "text",				validator: validators.text			},
	{name: "alcoholWarning",				required: false,	type: "text",				validator: validators.text			},
 	{name: "availableStrength",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "breastfeedingWarning",	required: false,	type: "text",				validator: validators.text			},
 	{name: "clincalPharmacology",		required: false,	type: "text",				validator: validators.text			},
 	{name: "cost",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "dosageForm",					required: false,	type: "text",				validator: validators.text			},
 	{name: "doseSchedule",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "drugClass",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "foodWarning",					required: false,	type: "text",				validator: validators.text			},
 	{name: "interactingDrug",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "isAvailableGenerically",	required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "isProprietary",					required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "labelDetails",					required: false,	type: "url",				validator: validators.url				},
 	{name: "legalStatus",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "manufacturer",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "mechanismOfAction",		required: false,	type: "text",				validator: validators.text			},
 	{name: "nonProprietaryName",		required: false,	type: "text",				validator: validators.text			},
 	{name: "overdosage",					required: false,	type: "text",				validator: validators.text			},
 	{name: "pregnancyCategory",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "pregnancyWarning",		required: false,	type: "text",				validator: validators.text			},
 	{name: "prescribingInfo",				required: false,	type: "url",				validator: validators.url				},
 	{name: "prescriptionStatus",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "relatedDrug",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "warning",						required: false,	type: "text",				validator: validators.text			}

		])
});

//DietarySupplement, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/DietarySupplement",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalTherapy"), [

 	{name: "activeIngredient",			required: false,	type: "text",				validator: validators.text			},
 	{name: "background",					required: false,	type: "text",				validator: validators.text			},
 	{name: "dosageForm",					required: false,	type: "text",				validator: validators.text			},
 	{name: "isProprietary",					required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "legalStatus",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "manufacturer",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "maximumIntake",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "mechanismOfAction",		required: false,	type: "text",				validator: validators.text			},
 	{name: "nonProprietaryName",		required: false,	type: "text",				validator: validators.text			},
 	{name: "recommendedIntake",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "safetyConsideration",		required: false,	type: "text",				validator: validators.text			},
 	{name: "targetPopulation",			required: false,	type: "text",				validator: validators.text			}

		])
});

//Joint, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Joint",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/AnatomicalStructure"), [

 	{name: "biomechnicalClass",		required: false,	type: "text",		validator: validators.text	},
 	{name: "functionalClass",			required: false,	type: "text",		validator: validators.text	},
 	{name: "structuralClass",			required: false,	type: "text",		validator: validators.text	}

		])
});

//Muscle, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Muscle",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/AnatomicalStructure"), [

 	{name: "action",				required: false,	type: "text",				validator: validators.text			},
 	{name: "antagonist",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "bloodSupply",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "insertion",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "nerve",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "origin",				required: false,	type: "complex",		validator: validators.complex		}

		])
});

//Nerve, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Nerve",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/AnatomicalStructure"), [

 	{name: "branch",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "nerveMotor",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sensoryUnit",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sourcedFrom",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//MedicalCondition, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalCondition",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "associatedAnatomy",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "cause",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "differentialDiagnosis",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "epidemiology",				required: false,	type: "text",				validator: validators.text			},
 	{name: "expectedPrognosis",		required: false,	type: "text",				validator: validators.text			},
 	{name: "naturalProgression",		required: false,	type: "text",				validator: validators.text			},
 	{name: "pathophysiology",			required: false,	type: "text",				validator: validators.text			},
 	{name: "possibleComplication",	required: false,	type: "text",				validator: validators.text			},
 	{name: "possibleTreatment",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "primaryPrevention",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "riskFactor",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "secondaryPrevention",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "signOrSymptom",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "stage",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "subtype",						required: false,	type: "text",				validator: validators.text			},
 	{name: "typicalTest",					required: false,	type: "complex",		validator: validators.complex		}

		])
});

//InfectiousDisease, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/InfectiousDisease",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalCondition"), [

 	{name: "infectiousAgent",				required: false,	type: "text",				validator: validators.text			},
	{name: "infectiousAgentClass",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "transmissionMethod",		required: false,	type: "text",				validator: validators.text			}

		])
});

//MedicalDevice, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalDevice",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "adverseOutcome",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "contraindication",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "indication",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "postOp",								required: false,	type: "text",				validator: validators.text			},
 	{name: "preOp",								required: false,	type: "text",				validator: validators.text			},
 	{name: "procedure",						required: false,	type: "text",				validator: validators.text			},
 	{name: "purpose",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "seriousAdverseOutcome",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//MedicalGuideline, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalGuideline",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "evidenceLevel",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "evidenceOrigin",		required: false,	type: "text",				validator: validators.text			},
 	{name: "guidelineDate",		required: false,	type: "date",				validator: validators.date			},
 	{name: "guidelineSubject",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//MedicalProcedure, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalProcedure",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "followup",				required: false,	type: "text",				validator: validators.text			},
 	{name: "howPerformed",		required: false,	type: "text",				validator: validators.text			},
 	{name: "preparation",			required: false,	type: "text",				validator: validators.text			},
 	{name: "procedureType",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//MedicalRiskEstimator, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalRiskEstimator",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "estimatesRiskOf",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "includedRiskFactor",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//MedicalSignOrSymptom, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalSignOrSymptom",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "cause",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "possibleTreatment",	required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MedicalStudy, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalStudy",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "outcome",			required: false,	type: "text",				validator: validators.text			},
 	{name: "population",		required: false,	type: "text",				validator: validators.text			},
 	{name: "sponsor",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "status",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "studyLocation",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "studySubject",	required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//MedicalTest, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalTest",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MedicalEntity"), [

 	{name: "affectedBy",			required: false,	type: "complex",		validator: validators.complex		},
 	{name: "normalRange",		required: false,	type: "text",				validator: validators.text			},
 	{name: "signDetected",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "usedToDiagnose",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "usesDevice",			required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//PlayAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PlayAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "audience",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "event",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//ExerciseAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ExerciseAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "course",							required: false,	type: "complex",		validator: validators.complex		},
 	{name: "diet",								required: false,	type: "complex",		validator: validators.complex		},
 	{name: "distance",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "exercisePlan",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "exerciseType",				required: false,	type: "text",				validator: validators.text			},
 	{name: "fromLocation",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "oponent",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sportsActivityLocation",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sportsEvent",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sportsTeam",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "toLocation",					required: false,	type: "complex",		validator: validators.complex		}
	
		])
});

//PerformAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PerformAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/PlayAction"), [

 	{name: "entertainmentBusiness",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//SearchAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SearchAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "query",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//TradeAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TradeAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "price",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//BuyAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/BuyAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "vendor",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "warrantyPromise",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//DonateAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/DonateAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "recipient",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//PayAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PayAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "purpose",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "recipient",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//RentAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/RentAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "landlord",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "realEstateAgent",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//SellAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SellAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "buyer",						required: false,	type: "complex",		validator: validators.complex		},
 	{name: "warrantyPromise",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//TipAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TipAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TradeAction"), [

 	{name: "recipient",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//TransferAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/TransferAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "fromLocation",	required: false,	type: "complex",		validator: validators.complex		},
 	{name: "toLocation",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//BorrowAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/BorrowAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "lender",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//GiveAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/GiveAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "recipient",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//LendAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/LendAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "borrower",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//ReceiveAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ReceiveAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "deliveryMethod",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "sender",					required: false,	type: "complex",		validator: validators.complex		}

		])
});

//ReturnAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ReturnAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "recipient",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//SendAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/SendAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/TransferAction"), [

 	{name: "deliveryMethod",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "recipient",				required: false,	type: "complex",		validator: validators.complex		}

		])
});

//UpdateAction, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/UpdateAction",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Action"), [

 	{name: "collection",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//BroadcastService, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/BroadcastService",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Thing"), [

 	{name: "area",					required: false,	type: "complex",		validator: validators.complex		},
 	{name: "broadcaster",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "parentService",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//AudioObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/AudioObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MediaObject"), [

 	{name: "transcript",		required: false,	type: "text",		validator: validators.text	}

		])
});

//ImageObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ImageObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MediaObject"), [

 	{name: "caption",							required: false,	type: "text",				validator: validators.text			},
 	{name: "exifData",						required: false,	type: "text",				validator: validators.text			},
 	{name: "representativeOfPage",	required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "thumbnail",						required: false,	type: "complex",		validator: validators.complex		}

		])
});

//VideoObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/VideoObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/MediaObject"), [

 	{name: "caption",					required: false,	type: "text",				validator: validators.text			},
 	{name: "thumbnail",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "transcript",				required: false,	type: "text",				validator: validators.text			},
 	{name: "videoFrameSize",	required: false,	type: "text",				validator: validators.text			},
 	{name: "videoQuality",			required: false,	type: "text",				validator: validators.text			}

		])
});

//MedicalWebPage, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/MedicalWebPage",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/WebPage"), [

 	{name: "aspect",		required: false,	type: "text",				validator: validators.text			}

		])
});

//PublicationEvent, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PublicationEvent",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Event"), [

 	{name: "free",				required: false,	type: "boolean",		validator: validators.boolean		},
 	{name: "publishedOn",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//Brand, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Brand",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "logo",		required: false,	type: "complex",		validator: validators.complex		}

		])
});

//Audience, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/Audience",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "audienceType",		required: false,	type: "text",				validator: validators.text			},
 	{name: "geographicArea",	required: false,	type: "complex",		validator: validators.complex		}

		])
});

//BusinessAudience, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/BusinessAudience",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Audience"), [

Properties from BusinessAudience
 	{name: "numberofEmployees",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "yearlyRevenue",				required: false,	type: "complex",		validator: validators.complex		},
 	{name: "yearsInOperation",			required: false,	type: "complex",		validator: validators.complex		}

		])
});

//EducationalAudience, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/EducationalAudience",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Audience"), [

 	{name: "educationalRole",	required: false,	type: "text",		validator: validators.text	} 

		])
});

//PeopleAudience, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/PeopleAudience",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Audience"), [

 	{name: "healthCondition",		required: false,	type: "complex",		validator: validators.complex		},
 	{name: "requiredGender",			required: false,	type: "text",				validator: validators.text			},
 	{ name: "requiredMaxAge",		required: false,	type: "int",				validator: validators.int				},
 	{ name: "requiredMinAge",		required: false,	type: "int",				validator: validators.int				},
 	{name: "suggestedGender",		required: false,	type: "text",				validator: validators.text			},
 	{ name: "suggestedMaxAge",	required: false,	type: "number",		validator: validators.number		},
 	{ name: "suggestedMinAge",		required: false,	type: "number",		validator: validators.number		}

		])
});

//ParentAudience, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/ParentAudience",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Audience"), [

 	{ name: "childMaxAge",	required: false,	type: "number",		validator: validators.number		},
 	{ name: "childMinAge",		required: false,	type: "number",		validator: validators.number		} 

		])
});

//AlignmentObject, added accordingly to official Schema Version 1.0f
schemaOrg.push({
	url: "http://schema.org/AlignmentObject",
		fields: extend(findByUrl(schemaOrg, "http://schema.org/Intangible"), [

 	{name: "alignmentType",					required: false,	type: "text",				validator: validators.text			},
 	{name: "educationalFramework",		required: false,	type: "text",				validator: validators.text			},
 	{name: "targetDescription",				required: false,	type: "text",				validator: validators.text			},
 	{name: "targetName",						required: false,	type: "text",				validator: validators.text			},
 	{name: "targetUrl",							required: false,	type: "url",				validator: validators.url				}

		])
});







    // add schema.org to the roster
    for (var i = 0; i < schemaOrg.length; i++) {
        $.microdata.addDefinition(schemaOrg[i].url, schemaOrg[i].fields);
    }
})(jQuery);
