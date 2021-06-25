const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const { Translator }			= require('../../src/index.js');

const Interpreter			= new Translator(["AppError"]);
const { AppError }			= Interpreter.error_classes;

const response_id			= "QmV1NgkXFwromLvyAmASN7MbgLtgUaEYkozHPGUxcHAbSL";
const success_msg			= JSON.stringify({
    "type": "success",
    "metadata": {
	response_id,
    },
    "payload": true,
});
const success_no_metadata_msg		= JSON.stringify({
    "type": "success",
    "payload": true,
});
const app_error_input			= {
    "kind": "AppError",
    "error": "InstanceNotRunningError",
    "message": "App instance is not active yet",
};
const app_error_pack			= {
    "type": "failure",
    "payload": Object.assign({}, {
	"stack": [],
    }, app_error_input ),
};
const app_error_pack_msg		= JSON.stringify( app_error_pack );


class InstanceNotRunningError extends Error {}


function create_tests () {
    it("should create success package", async () => {
	const pack			= Interpreter.create( true, null, {
	    response_id,
	});

	expect( pack.value()		).to.be.true;
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_msg) );
    });

    it("should create success package and set metadata", async () => {
	const pack			= Interpreter.create( true );
	pack.metadata("response_id", response_id );

	expect( pack.value()		).to.be.true;
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_msg) );

	const resp_id			= pack.metadata("response_id", undefined );

	expect( pack.value()		).to.be.true;
	expect( resp_id			).to.equal( response_id );
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_no_metadata_msg) );
    });

    it("should create error package", async () => {
	const pack			= Interpreter.create(app_error_input, {
	    "type": "failure"
	});

	let error			= pack.value(1);
	expect( error			).to.be.an("error");
	expect( pack.toJSON()		).to.deep.equal( app_error_pack );
	expect( error.kind		).to.equal("AppError");
	expect( error			).to.be.instanceof( AppError );
	expect( error.toJSON().stack[0]	).to.have.string("InstanceNotRunningError: App instance is not active yet");
	expect( error.toJSON().stack[1]	).to.have.string(`tests/unit/${path.basename(__filename)}`);

	const err			= new InstanceNotRunningError("App instance is not active yet");
	const from			= Interpreter.createFromError( "AppError", err );

	expect( from.value()		).to.be.an("error");

	const json			= from.toJSON();
	json.payload.stack		= [];
	expect( json			).to.deep.equal( app_error_pack );

	const crafted			= Interpreter.createFromError( "AppError", {
	    "name": "InstanceNotRunningError",
	    "message": "App instance is not active yet",
	});
	expect( crafted.value()		).to.be.an("error");
	expect( crafted.toJSON()	).to.deep.equal( app_error_pack );
    });

    it("should fail to create success package", async () => {
	expect(() => {
	    Interpreter.create( true, { "type": null });
	}				).to.throw( TypeError, "Value must be a string" );
	expect(() => {
	    Interpreter.create( true, { "type": "invalid_string" });
	}				).to.throw( TypeError, "Invalid 'type' value: invalid_string" );
    });

    it("should fail to create error package", async () => {
	const valid_error		= new InstanceNotRunningError("App instance is not active yet") ;

	expect(() => {
	    Interpreter.createFromError( null, valid_error );
	}				).to.throw( TypeError, "Value must be a string" );
	expect(() => {
	    Interpreter.createFromError( "Blablabla", valid_error );
	}				).to.throw( TypeError, "Invalid 'kind' value (Blablabla)" );
	expect(() => {
	    Interpreter.createFromError( "AppError", "not an error" );
	}				).to.throw( TypeError, "Value is required" );
    });
}

function parse_tests () {
    it("should parse JSON into success package", async () => {
	const pack			= Interpreter.parse( success_msg );

	expect( pack.value()		).to.be.true;

	const preparsed			= Interpreter.parse( JSON.parse(success_msg) );

	expect( preparsed.value()			).to.be.true;
	expect( preparsed.metadata("response_id")	).to.equal( response_id );
    });

    it("should parse JSON into error package", async () => {
	const pack			= Interpreter.parse( app_error_pack_msg );
	const error			= pack.value();

	expect( error			).to.be.an("error");
	expect(() => {
	    throw error;
	}				).to.throw( AppError, "instance is not active" );
    });

    it("should fail to parse invalid message", async () => {
	expect(() => {
	    Interpreter.parse( null );
	}				).to.throw( TypeError, "Value cannot be null or undefined" );
	expect(() => {
	    Interpreter.parse( "" );
	}				).to.throw( Error, "Invalid message format: expected JSON, not ''" );
	expect(() => {
	    Interpreter.parse({
		"payload": true,
	    });
	}				).to.throw( TypeError, "Invalid content: missing 'type'" );
	expect(() => {
	    Interpreter.parse({
		"type": "failure",
		"payload": true,
	    });
	}				).to.throw( TypeError, "Invalid error format: Value is required" );
    });

    it("should fail to parse JSON into error package", async () => {
	const invalid_error_msg		= JSON.stringify({
	    "type": "failure",
	    "payload": null,
	});
	expect(() => {
	    Interpreter.parse( invalid_error_msg );
	}				).to.throw( TypeError, "Value cannot be null or undefined" );
    });
}

describe("Essence", () => {

    describe("create", create_tests );
    describe("parse", parse_tests );

});
