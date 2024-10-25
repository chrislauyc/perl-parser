import { Lexer } from "./lexer.js";
import { variableMatcher } from "./tokenizer.js";
const states = {
    String: "String",
    Code: "Code",
    Comment: "Comment",
    Block: "Block",
    Regex: "Regex",
    Parentheses: "Parentheses",
    Function: "Function",
    Package: "Package",
    Constant: "Constant",
    Identifier: "Identifier",
    VariableDeclaration: "VariableDeclaration",
    HashMemberExpression: "HashMemberExpression",
    PackageMemberExpression: "PackageMemberExpression",
    CallExpression: "CallExpression"
};
function astNodeFactory(type) {
    return {
        type,
        children: []
    };
}
export class Parser {
    astStack = [];
    lexicalStack = [];
    currentNode = null;
    /**
     * @param {string}
     */
    parse(code) {
        const lexer = new Lexer();
        const root = lexer.parse(code);
        this.lexicalStack = [root];
    }
    goToState(lexicalNode) {
        const currentState = this.currentNode.type;
        switch (currentState) {
            case states.Code:
                break;
            case states.Function:
                break;
            case states.Package:
                break;
            case states.Constant:
                break;
            case states.Variable:
                break;
            case states.HashMemberExpression:
                break;
            case states.PackageMemberExpression:
                break;
            default:
                break;
        }
    }
    expressionContext(lexicalNode) {
        if (typeof lexicalNode === "string") {
            switch (lexicalNode) {
                case "sub":
                    break;
                case "package":
                    break;
                case "my":
                    break;
                default: {
                    if (new RegExp(variableMatcher).test(lexicalNode)) {
                        //
                        this.pushNode();
                        this.currentNode = {
                            ...astNodeFactory(states.Identifier),
                            value: lexicalNode
                        };
                    }
                    break;
                }
            }
        } else {
            const lexicalType = lexicalNode.type;
            //push to lexicalStack
        }
    }
    pushNode() {}
    popNode() {}
}
