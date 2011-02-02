$(function() {
    test('Single item with no vocabulary and one property', function() {
        var res = $.microdata.parseElement($('#single-item-no-vocabulary'));
        
        same(res, {
            type: null,
            properties: [
                { name: "description", value: "This is a description" }
            ]
        }, 'Should return null type, one property');
        
    });
    
    test('Single item with vocabulary and no properties', function() {
        
        same($.microdata.parseElement($('#vocab-no-properties')), {
            type: "http://example.org/Type",
            properties: []
        }, 'Should have type set to example.org');
    });
    
    
    test('Multiple values for single property', function() {
        
        same($.microdata.parseElement($('#multi-value-single-prop')), {
            type: "http://example.org/Multivalue",
            properties: [
                { name: "attending", value: "Peter Bishop" },
                { name: "attending", value: "Walter Bishop" }
            ]
        }, 'Should return an array of values');
        
    });
    
    test('Multiple properties for single value', function() {
        same($.microdata.parseElement($('#multi-prop-single-value')), {
            type: "http://example.org/Multiprop",
            properties: [
                { name: "admin", value: "true" },
                { name: "user", value: "true" }
            ]
        }, 'Should return multiple properties with same value');
    });
});