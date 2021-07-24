
class DynamicError extends Error {
    constructor( kind, name, message, stack, stack_rm_lines ) {
	super( message );

	Object.defineProperty( this, "kind", {
	    "value": kind,
	    writable: false,
	});
	Object.defineProperty( this, "name", {
	    "value": name,
	    writable: false,
	});

	if ( Array.isArray( stack ) ) {
	    this.stack                  = stack.join("\n");
	}
	else if ( typeof stack === "string" ) {
	    this.stack			= stack;
	}
	else if ( stack === undefined ) {
	    let stack_lines;
	    if (typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, this.constructor);
		stack_lines		= this.stack.split("\n");
	    } else {
		this.stack              = (new Error(message)).stack;
		stack_lines		= this.stack.split("\n");
		stack_lines.splice( 1, 2 );
	    }

	    stack_lines.splice( 1, stack_rm_lines );
	    this.stack              = stack_lines.join("\n");
	}
	else if ( stack === null ) {
	    this.stack			= "";
	}
	else {
	    throw new TypeError(`Invalid 'stack' value: ${stack}`);
	}
    }

    toString () {
	return this.name + ": " + this.message;
    }

    [Symbol.toPrimitive] ( hint ) {
	return this.toString();
    }

    toJSON () {
	return {
	    "kind": this.kind,
	    "name": this.name,
	    "message": this.message,
	    "stack": this.stack === "" ? [] : this.stack.split("\n"),
	};
    }

    valueOf () {
	return this.stack;
    }
}

module.exports = {
    DynamicError,
};
