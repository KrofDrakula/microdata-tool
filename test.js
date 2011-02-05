$(function() {
    test('Single item with no vocabulary and one property', function() {
        var res = $.microdata.parseElement($('#single-item-no-vocabulary'));
        
        same(res, {
            type: null,
            properties: [
                { name: "description", value: "This is a description", valid: true }
            ],
            valid: true, missing: []
        }, 'Should return null type, one property');
        
    });
    
    test('Single item with vocabulary and no properties', function() {
        
        same($.microdata.parseElement($('#vocab-no-properties')), {
            type: "http://example.org/Type",
            properties: [],
            valid: true, missing: []
        }, 'Should have type set to example.org');
    });
    
    
    test('Multiple values for single property', function() {
        
        same($.microdata.parseElement($('#multi-value-single-prop')), {
            type: "http://example.org/Multivalue",
            properties: [
                { name: "attending", value: "Peter Bishop", valid: true },
                { name: "attending", value: "Walter Bishop", valid: true }
            ],
            valid: true, missing: []
        }, 'Should return an array of values');
        
    });
    
    test('Multiple properties for single value', function() {
        same($.microdata.parseElement($('#multi-prop-single-value')), {
            type: "http://example.org/Multiprop",
            properties: [
                { name: "admin", value: "true", valid: true },
                { name: "user", value: "true", valid: true }
            ],
            valid: true, missing: []
        }, 'Should return multiple properties with same value');
    });
    
    
    test('Single item with 1 missing property per vocabulary rules', function() {
        
        same($.microdata.parseElement($('#single-item-missing-property')), {
            type: "http://data-vocabulary.org/Event",
            properties: [
                { name: "summary", value: "This is the event summary", valid: true }
            ],
            missing: [ "startdate" ],
            valid: false
        }, 'Should return 1 good property and one missing');;
        
    });
});