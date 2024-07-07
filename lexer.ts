
type ValueOf<O extends object> = O[keyof O];

export const NULL_CHAR = String.fromCharCode(0);

export const TOKENS = {
	START_TAG: "START_TAG", // '<' tag attrs '>'
	END_TAG: "END_TAG", // '</' tag '>'
	EMPTY_TAG: "EMPTY_TAG", // '<' tag attrs '/>'
	TEXT: "TEXT",
	EOF: "EOF",
} as const;

export type Lexer = {
	input: string;
	position: number; // current position in input (points to current char)
	readPosition: number;// current reading position in input (after current char)
	ch: string;
};

export function newLexer(input: string): Lexer {
	const lexer = {
		input: input,
		position: 0,
		readPosition: 0,
		ch: "",
	};

	readChar(lexer);
	return lexer;
}
export type Token = {
	type: ValueOf<typeof TOKENS>
	literal: string;
}

export function newToken(type: ValueOf<typeof TOKENS>, lit: string): Token {
	return {
		type,
		literal: lit
	}
}

export function nextToken(lexer: Lexer) {
	let token: Token;

	if (lexer.position === 0) {
		skipWhitespace(lexer);
	}

	if (lexer.ch === "<") {
		let isEndTag = false;
		if (peekChar(lexer) === "/") {
			readChar(lexer);
			isEndTag = true;
		}
		const name = readTagName(lexer);
		skipTillClosingTag(lexer);

		if (isEndTag) {
			token = newToken(TOKENS.END_TAG, name);
		} else {
			const prev = lexer.input[lexer.position - 1];

			if (prev === "/") {
				token = newToken(TOKENS.EMPTY_TAG, name);
			} else {
				token = newToken(TOKENS.START_TAG, name)
			}
		}
	} else if (lexer.ch === NULL_CHAR) {
		token = newToken(TOKENS.EOF, "");
	} else {
		const txt = readText(lexer);
		token = newToken(TOKENS.TEXT, txt);
	}

	readChar(lexer);
	return token;
}

function readChar(lexer: Lexer) {
	if (lexer.readPosition >= lexer.input.length) {
		lexer.ch = NULL_CHAR;
	} else {
		lexer.ch = lexer.input[lexer.readPosition];
	}

	lexer.position = lexer.readPosition;
	lexer.readPosition += 1;
}

function peekChar(lexer: Lexer): string {
	if (lexer.readPosition >= lexer.input.length) {
		return NULL_CHAR;
	} else {
		return lexer.input[lexer.readPosition];
	}
}

function skipWhitespace(lexer: Lexer) {
	while (lexer.ch === " " || lexer.ch === "\t" || lexer.ch === "\n" || lexer.ch === "\r") {
		readChar(lexer);
	}
}

function isTagName(ch: string) {
	return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch === "-";
}

function readTagName(lexer: Lexer): string {
	const start = lexer.position + 1; // we are still on the old char
	while(isTagName(peekChar(lexer))) {
		readChar(lexer);
	}

	return lexer.input.slice(start, lexer.readPosition);
}

function skipTillClosingTag(lexer: Lexer) {
	skipWhitespace(lexer);

	while (lexer.ch !== ">") {
		if (peekChar(lexer) === NULL_CHAR) {
			throw new Error("No closing tag!");
		}

		readChar(lexer);
	}
}

function readText(lexer: Lexer) {
	let start = lexer.position;
	while(peekChar(lexer) !== "<" && peekChar(lexer) !== NULL_CHAR) {
		readChar(lexer)
	}

	return lexer.input.slice(start, lexer.readPosition);
}
