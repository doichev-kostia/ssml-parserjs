import * as util from "node:util";
import * as fs from "node:fs";
import * as stream from "node:stream"
import { newLexer, nextToken, TOKENS } from "./lexer";

async function main() {
	const { positionals } = util.parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true
	});

	let stream: stream.Readable = process.stdin;
	if (positionals[0]) {
		const filename = positionals[0];
		const exists = await fs.promises.access(filename).then(() => true, () => false);

		if (!exists) {
			throw new Error(util.format("File %s doesn't exist", filename));
		}

		stream = fs.createReadStream(filename, {
			encoding: "utf8"
		});
	}

	const chunks = [];
	for await (const chunk of stream) {
		if (stream.readableObjectMode) {
			chunks.push(chunk);
		} else {
			chunks.push(Buffer.from(chunk));
		}
	}

	// ssml text
	const buff = new Uint8Array(Buffer.concat(chunks));

	const lexer = newLexer(new TextDecoder().decode(buff));
	let token = nextToken(lexer);
	while (token.type !== TOKENS.EOF) {
		console.log(token);
		token = nextToken(lexer)
	}
}

void main();
