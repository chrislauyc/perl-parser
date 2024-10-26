export const variableMatcher = String.raw`([\$@%]?\w+(::\w+)?)`;
export class Tokenizer {
    _matches = null;
    /**
     * @param {string}
     */
    tokenize(code) {
        const matcher = this.createMatcher();
        this._matches = code.matchAll(matcher);
    }
    /**
     * @returns {string | null}
     */
    next() {
        const match = this._matches.next().value;
        if (typeof match?.[0] === "string") {
            return match[0];
        }
        return null;
    }
    createMatcher() {
        const operatorMatcher =
            "(" +
            [
                "<=>",
                "=>",
                String.raw`\+=`,
                "-=",
                "==",
                "&&",
                "=~",
                "=!",
                String.raw`\|\|`,
                "!=",
                "<=",
                ">=",
                "->"
            ].join("|") +
            ")";

        const spaceMatcher = String.raw`\s+`;
        const newlineMatcher = String.raw`\n`;
        const fullMatcher = [
            variableMatcher,
            operatorMatcher,
            newlineMatcher,
            spaceMatcher,
            "."
        ].join("|");
        return fullMatcher;
    }
}
