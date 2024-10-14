export class Tokenizer{
  _matches = null;
  /**
   * @param {string}
  */
  tokenize(code){
    const matcher = this.createMatcher();
    this._matches = code.matchAll(matcher);
  }
  /**
   * @returns {string | null}
  */
  next(){
    return this._matches?.next()?.[0] || null;
  }
  createMatcher(){
    const variableMatcher = String.raw`([\$@%]?\w+(::\w+)?)`;
    const operatorMatcher = "(" + ["<=>", "=>", String.raw`\+=`, "-=", "==", "&&", "=~", "=!",
      String.raw`\|\|`,
      "!=", "<=", ">=", "->"].join("|") + ")";

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