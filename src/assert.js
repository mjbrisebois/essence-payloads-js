
function assert_type( type, value, required = true ) {
    if ( required === false && value === undefined )
	return;
    if ( required === true && value === undefined )
	throw new TypeError(`Value is required`);

    switch (type) {
    case "string":
	if ( typeof value !== "string" )
	    throw new TypeError(`Value must be a string`);
	break;
    case "has_prototype":
	if ( value === null || value === undefined )
	    throw new TypeError(`Value cannot be null or undefined`);
	break;
    case "array":
	if ( !Array.isArray( value ) )
	    throw new TypeError(`Value must be an array`);
	break;
    default:
	throw new Error(`Unknown type '${type}'`);
	break;
    }
}

module.exports = {
    assert_type,
};
