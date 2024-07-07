import { test, expect } from "vitest"
import { newLexer, newToken, nextToken, TOKENS } from "./lexer";

test("sentence", () => {
	const ssml = "<s>text</s>";
	const lexer = newLexer(ssml);

	const expected = [
		newToken(TOKENS.START_TAG, "s"),
		newToken(TOKENS.TEXT, "text"),
		newToken(TOKENS.END_TAG, "s"),
		newToken(TOKENS.EOF, ""),
	];

	for (const t of expected) {
		const actual = nextToken(lexer);
		expect(t.type).toEqual(actual.type);
		expect(t.literal).toEqual(actual.literal);
	}
})

test("paragraph", () => {
	const ssml = "<p><s>text</s></p>";
	const lexer = newLexer(ssml);

	const expected = [
		newToken(TOKENS.START_TAG, "p"),
		newToken(TOKENS.START_TAG, "s"),
		newToken(TOKENS.TEXT, "text"),
		newToken(TOKENS.END_TAG, "s"),
		newToken(TOKENS.END_TAG, "p"),
		newToken(TOKENS.EOF, ""),
	];

	for (const t of expected) {
		const actual = nextToken(lexer);
		expect(t.type).toEqual(actual.type);
		expect(t.literal).toEqual(actual.literal);
	}
})

test("empty", () => {
	const ssml = "<empty/>";
	const lexer = newLexer(ssml);

	const expected = [
		newToken(TOKENS.EMPTY_TAG, "empty"),
		newToken(TOKENS.EOF, ""),
	];

	for (const t of expected) {
		const actual = nextToken(lexer);
		expect(t.type).toEqual(actual.type);
		expect(t.literal).toEqual(actual.literal);
	}
})

test("empty with attributes", () => {
	const ssml = "<empty attr='value'/>";
	const lexer = newLexer(ssml);

	const expected = [
		newToken(TOKENS.EMPTY_TAG, "empty"),
		newToken(TOKENS.EOF, ""),
	];

	for (const t of expected) {
		const actual = nextToken(lexer);
		expect(t.type).toEqual(actual.type);
		expect(t.literal).toEqual(actual.literal);
	}
});

test("multiple tags", () => {
	const ssml = `<speak>
  Here are <say-as interpret-as="characters">SSML</say-as> samples.
  I can pause <break time="3s"/>.
  I can play a sound
  <audio src="https://www.example.com/MY_MP3_FILE.mp3">didn't get your MP3 audio file</audio>.
  I can also substitute phrases, like the <sub alias="World Wide Web Consortium">W3C</sub>.
  Finally, I can speak a paragraph with two sentences.
  <p><s>This is sentence one.</s><s>This is sentence two.</s></p>
</speak>`

	const lexer = newLexer(ssml);

	const expected = [
		newToken(TOKENS.START_TAG, "speak"),
		newToken(TOKENS.TEXT, "\n  Here are "),
		newToken(TOKENS.START_TAG, "say-as"),
		newToken(TOKENS.TEXT, "SSML"),
		newToken(TOKENS.END_TAG, "say-as"),
		newToken(TOKENS.TEXT, " samples.\n  I can pause "),
		newToken(TOKENS.EMPTY_TAG, "break"),
		newToken(TOKENS.TEXT, ".\n  I can play a sound\n  "),
		newToken(TOKENS.START_TAG, "audio"),
		newToken(TOKENS.TEXT, "didn't get your MP3 audio file"),
		newToken(TOKENS.END_TAG, "audio"),
		newToken(TOKENS.TEXT, ".\n  I can also substitute phrases, like the "),
		newToken(TOKENS.START_TAG, "sub"),
		newToken(TOKENS.TEXT, "W3C"),
		newToken(TOKENS.END_TAG, "sub"),
		newToken(TOKENS.TEXT, ".\n  Finally, I can speak a paragraph with two sentences.\n  "),
		newToken(TOKENS.START_TAG, "p"),
		newToken(TOKENS.START_TAG, "s"),
		newToken(TOKENS.TEXT, "This is sentence one."),
		newToken(TOKENS.END_TAG, "s"),
		newToken(TOKENS.START_TAG, "s"),
		newToken(TOKENS.TEXT, "This is sentence two."),
		newToken(TOKENS.END_TAG, "s"),
		newToken(TOKENS.END_TAG, "p"),
		newToken(TOKENS.TEXT, "\n"),
		newToken(TOKENS.END_TAG, "speak"),
		newToken(TOKENS.EOF, ""),
	];

	for (const t of expected) {
		const actual = nextToken(lexer);
		expect(t.type).toEqual(actual.type);
		expect(t.literal).toEqual(actual.literal);
	}
})
