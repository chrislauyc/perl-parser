import { Lexer } from "./lexer.js";
export class Parser {
    nodeStack = [];
    currentNode = null;
    /**
     * @param {string}
     */
    parse(code) {
        const lexer = new Lexer();
        const root = lexer.parse(code);
        
    }
}
