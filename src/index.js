
const { assert_type }			= require('./assert.js');
const { DynamicError }			= require('./dynamic_error.js');


const MIN_RM_STACK_LINES		= 1;


function create_dynammic_class ( kind ) {
    // Since 'eval' is not very safe, we must be very strict on the value of 'kind'
    if ( /^[a-zA-Z_]+$/.test( kind ) === false )
	throw new Error(`Error kind contains invalid characters for class name: ${kind}`);

    let cls;
    eval(`cls = class ${kind} extends DynamicError {}`);

    return cls;
}

class Translator {
    constructor ( expected_kinds = [], opts = {} ) {
	this.expected_kinds		= expected_kinds;
	this.error_classes		= {};
	this.options			= Object.assign({
	    "rm_stack_lines": 0,
	}, opts );

	for (let kind of expected_kinds ) {
	    this.error_classes[kind]	= create_dynammic_class( kind );
	}
    }

    createFromError ( kind, err ) {
	assert_type( "string",		kind );
	assert_type( "has_prototype",	err );
	assert_type( "has_prototype",	err.constructor );
	assert_type( "string",		err.constructor.name );
	assert_type( "string",		err.stack,	false );

	let name			= err.constructor.name;
	if ( name === "Object" ) {
	    assert_type( "string",	err.name );
	    name			= err.name;
	}

	return new Package( this,{
	    "kind": kind,
	    "error": name,
	    "message": err.message,
	    "stack": err.stack ? err.stack.split("\n") : [],
	}, {
	    "type": "failure",
	});
    }

    parse ( msg ) {
	let data;

	try {
	    data			= typeof msg === "string"
		? JSON.parse(msg)
		: msg;
	} catch (err) {
	    throw new Error(`Invalid message format: expected JSON, not '${msg}'`);
	}

	assert_type( "has_prototype",	data );

	if ( data.type === "success" ) {
	    return new Package( this, data.payload, null, data.metadata );
	}
	else if ( data.type === "failure" ) {
	    try {
		return new Package( this, data.payload, {
		    "type": data.type,
		}, data.metadata );
	    } catch ( err ) {
		if ( err instanceof TypeError )
		    throw new TypeError(`Invalid error format: ${err.message}`);
	    }
	}
	else if ( data.type === undefined )
	    throw new TypeError(`Invalid content: missing 'type'`);
	else
	    throw new TypeError(`Unknown package type '${data.type}'`);
    }

    create ( ...args ) {
	return new Package( this, ...args );
    }
}


class Package {
    constructor (parent, payload, opts = {}, metadata ) {
	this.parent			= parent;

	if ( opts === null )
	    opts			= {};
	else
	    assert_type( "has_prototype",	opts );

	assert_type( "string",			opts.type,	false );
	assert_type( "has_prototype",		metadata,	false );

	if ( ![undefined, "success", "failure"].includes( opts.type ) )
	    throw new TypeError(`Invalid 'type' value: ${opts.type}`);

	this.type			= opts.type || "success";
	this._metadata			= metadata !== undefined
	    ? Object.assign({}, metadata)
	    : {};

	if ( this.type === "failure" ) {
	    assert_type( "has_prototype",	payload );
	    assert_type( "string",		payload.kind );

	    if ( this.parent.expected_kinds.length ) {
		if ( !this.parent.expected_kinds.includes( payload.kind ) )
		    throw new TypeError(`Invalid 'kind' value (${payload.kind}); expected kinds are: ${this.parent.expected_kinds}`);
	    }
	    else if ( !Object.keys( this.parent.error_classes ).includes( payload.kind ) ) {
		console.log("Defining new DynamicError: ", payload.kind );
		this.parent.error_classes[payload.kind] = create_dynammic_class( payload.kind );
	    }

	    assert_type( "string",		payload.error );
	    assert_type( "string",		payload.message );
	    assert_type( "array",		payload.stack,	false );

	    if ( payload.stack === undefined )
		payload.stack		= [];
	}

	this.payload			= payload
    }

    metadata ( key, value ) {
	if ( arguments.length === 2 ) {
	    if ( value === undefined ) {
		const previous_value	= this._metadata[key];
		delete this._metadata[key];
		return previous_value;
	    }

	    this._metadata[key]		= value;
	}

	return this._metadata[key];
    }

    value () {
	if ( this.type === "success" )
	    return this.payload;
	else if ( this.type === "failure" ) {
	    let { kind,
		  error,
		  message,
		  stack }		= this.payload;
	    return new this.parent.error_classes[kind](
		kind, error, message,
		stack.length === 0
		    ? undefined
		    : stack,
		this.parent.options.rm_stack_lines + MIN_RM_STACK_LINES
	    );
	}
    }

    toJSON () {
	let value;

	if ( this.type === "success" ) {
	    value			= this.value();
	    if ( ![null, undefined].includes( value ) && typeof value.toJSON === "function" )
		value			= value.toJSON();
	}
	else if ( this.type === "failure" ) {
	    value			= this.payload;
	}

	const pack			= {
	    "type": this.type,
	    "payload": value,
	};

	if ( Object.keys(this._metadata).length > 0 )
	    pack.metadata		= this._metadata;

	return pack;
    }

    toString () {
	return JSON.stringify( this.toJSON() );
    }
}


module.exports				= {
    Translator,
    Package,
};
