const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;
const puppeteer				= require('puppeteer');
const http				= require('@whi/http');

const HTTP_PORT				= 2222;

let browser;

async function create_page ( url ) {
    const page				= await browser.newPage();

    page.on("console", async ( msg ) => {
	let args			= await Promise.all( msg.args().map( async (jshandle) => await jshandle.jsonValue() ) );
	if ( args.length === 0 )
	    log.error("\033[90mPuppeteer console.log( \033[31m%s \033[90m)\033[0m", msg.text() );
	else {
	    log.silly("\033[90mPuppeteer console.log( \033[37m"+ args.shift() +" \033[90m)\033[0m", ...args );
	}
    });

    log.info("Go to: %s", url );
    await page.goto( url, { "waitUntil": "networkidle0" } );

    return page;
}

function basic_tests ( page_url ) {
    let page, server;

    before("Start page", async function () {
	this.timeout( 5000 );
	server				= new http.server();
	server.serve_local_assets( path.resolve( __dirname, "../../" ) );
	server.listen( HTTP_PORT )
	page				= await create_page( page_url );
    });

    after("Close page", async () => {
	await page.close();
	server.close();
    });


    it("should parse JSON into success package", async function () {
	let result			= await page.evaluate(async function () {
	    const Interpreter		= new Essence.Translator();
	    const msg		= JSON.stringify({
		"response_id": "QmV1NgkXFwromLvyAmASN7MbgLtgUaEYkozHPGUxcHAbSL",
		"type": "success",
		"payload": true,
	    });
	    const pack		= Interpreter.parse( msg );
	    return pack.value();
	});

	expect( result		).to.equal( true );
    });

    it("should parse JSON into error package", async function () {
	let result			= await page.evaluate(async function () {
	    const Interpreter		= new Essence.Translator();
	    const msg		= JSON.stringify({
		"type": "failure",
		"payload": {
		    "kind": "ServerError",
		    "error": "InstanceNotRunningError",
		    "message": "Holochain instance is not active yet",
		    "stack": [],
		},
	    });

	    let pack;
	    try {
		pack			= Interpreter.parse( msg );
	    } catch (err) {
		return String(err);
	    }

	    try {
		throw pack.value();
	    } catch (err) {
		return [ err.constructor.name, err.name, err.message, err instanceof Interpreter.error_classes.ServerError ];
	    }
	});

	expect( result		).to.deep.equal([
	    "ServerError",
	    "InstanceNotRunningError",
	    "Holochain instance is not active yet",
	    true,
	]);
    });
}

describe("Testing in browser", function() {

    let http_url			= `http://localhost:${HTTP_PORT}`;

    before("Start servers and browser", async function () {
	this.timeout( 5000 );
	browser				= await puppeteer.launch();
    });

    after("Close servers and browser", async () => {
	log.debug("Shutdown cleanly...");
	await browser.close();
    });

    describe("/tests/html/index.html", basic_tests.bind(this, `${http_url}/tests/html/index.html`) );

});
