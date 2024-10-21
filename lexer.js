import { Tokenizer } from "./tokenizer.js";
const states = {
    String: "String",
    Code: "Code",
    Comment: "Comment",
    Block: "Block",
    Regex: "Regex",
    Parentheses: "Parentheses"
};

function nodeFactory(type) {
    return {
        children: [],
        whiteSpaces: {},
        type
    };
}
export class Lexer {
    _currentNode = nodeFactory(states.Code);
    get currentNode() {
        if (!this._currentNode) {
            throw new Error(
                `currentNode is ${value}. token at ${this.tokenCount}`
            );
        }
        return this._currentNode;
    }
    set currentNode(value) {
        this._currentNode = value;
    }
    nodeStack = [];
    tokenCount = 0;
    init() {
        this.currentNode = nodeFactory(states.Code);
        this.nodeStack = [];
        this.tokenCount = 0;
    }
    /**
     * @param {string}
     */
    parse(code) {
        const tokenizer = new Tokenizer();
        tokenizer.tokenize(code);
        let token = tokenizer.next();

        while (token !== null) {
            this.tokenCount++;
            this.goToState(token);
            token = tokenizer.next();
        }
        while (this.nodeStack.length > 0) {
            const childNode = this.currentNode;
            this.popNode();
            this.currentNode.children.push(childNode);
        }
        return this.currentNode;
    }
    goToState(token) {
        const currentState = this.currentNode.type;
        switch (currentState) {
            case states.String: {
                this.stringState(token);
                break;
            }
            case states.Code: {
                this.codeState(token);
                break;
            }
            case states.Comment: {
                this.commentState(token);
                break;
            }
            case states.Block: {
                this.blockState(token);
                break;
            }
            case states.Regex: {
                this.regexState(token);
                break;
            }
            case states.Parentheses: {
                this.parenthesesState(token);
                break;
            }
            default:
                throw new Error(`State not implemented: ${currentState}`);
        }
    }
    pushNode() {
        this.nodeStack.push(this.currentNode);
        this.currentNode = null;
    }
    popNode() {
        this.currentNode = this.nodeStack.pop();
    }
    codeState(token) {
        this.expressionContext(token);
    }
    stringState(token) {
        const self = this.currentNode;
        const { delimiter, escaped } = self;
        switch (token) {
            case delimiter: {
                if (!escaped) {
                    this.popNode();
                    this.currentNode.children.push(self);
                }
                self.escaped = false;
                break;
            }
            case "\\": {
                self.escaped = !self.escaped;
                break;
            }
            default: {
                self.escaped = false;
            }
        }
        this.currentNode.children.push(token);
    }
    commentState(token) {
        const self = this.currentNode;
        if (token === "\n") {
            this.popNode();
            this.currentNode.children.push(self);
        }
        this.currentNode.children.push(token);
    }
    blockState(token) {
        const self = this.currentNode;
        switch (token) {
            case "}": {
                this.popNode();
                this.currentNode.children.push(self);
                break;
            }
            default: {
                this.expressionContext(token);
            }
        }
    }

    regexState(token) {
        // TODO: fix this horrible mess
        const self = this.currentNode;
        const { regexState, pattern, escaped, replacement } = self;
        if (token === "\\") {
            self.escaped = !escaped;
        }

        if (regexState === "Pattern") {
            if (/\n/.test(token)) {
                // Not actually inside a regex
                pattern.push(token);
                self.pattern = null;
                this.popNode();
                this.currentNode.children.push("/");
                for (let token of pattern) {
                    this.goToState(token);
                }
            } else {
                if (token === "/" && !escaped) {
                    if (self.prefix === "s") {
                        self.regexState = "Replacement";
                        self.replacement = [];
                    } else {
                        this.popNode();
                        this.currentNode.children.push(self);
                    }
                } else {
                    self.pattern.push(token);
                }
            }
        } else if (regexState === "Replacement") {
            if (/\n/.test(token)) {
                // Not actually inside a regex
                replacement.push(token);
                self.replacement = null;
                this.popNode();
                this.currentNode.children.push(self);
                for (let token of replacement) {
                    this.goToState(token);
                }
            } else {
                if (token === "/" && !escaped) {
                    this.popNode();
                    this.currentNode.children.push(self);
                } else {
                    replacement.push(token);
                }
            }
        } else if (regexState === "Prefix") {
            if (token === "/") {
                self.regexState = "Pattern";
            } else {
                this.goToState("s");
                this.goToState(token);
            }
        } else {
            throw new Error("regexState not handled");
        }
    }

    parenthesesState(token) {
        const self = this.currentNode;
        if (token === ")") {
            this.popNode();
            this.currentNode.children.push(self);
        } else {
            this.expressionContext(token);
        }
    }
    expressionContext(token) {
        let stateChanged = true;
        switch (token) {
            case "'":
            case '"':
                this.pushNode();
                this.currentNode = {
                    ...nodeFactory(states.String),
                    delimiter: token,
                    escaped: false
                };
                break;
            case "#":
                this.pushNode();
                this.currentNode = nodeFactory(states.Comment);
                break;
            case "{":
                this.pushNode();
                this.currentNode = nodeFactory(states.Block);
                break;
            case "(":
                this.pushNode();
                this.currentNode = nodeFactory(states.Parentheses);
                break;
            case "/":
                this.pushNode();
                this.currentNode = {
                    ...nodeFactory(states.Regex),
                    regexState: "Pattern",
                    pattern: [],
                    replacement: null,
                    escaped: false
                };
                break;
            case "s":
                this.pushNode();
                this.currentNode = {
                    ...nodeFactory(states.Regex),
                    regexState: "Prefix",
                    pattern: [],
                    replacement: null,
                    escaped: false,
                    prefix: token
                };
                break;
            default:
                stateChanged = false;
                this.pushTokenToChildren(token);
                break;
        }
        return stateChanged;
    }
    pushTokenToChildren(token) {
        if (/^\s*$/.test(token)) {
            const length =
                this.currentNode.children.length +
                Object.keys(this.currentNode.whiteSpaces).length;
            this.currentNode.whiteSpaces[length] = token;
            return;
        }
        this.currentNode.children.push(token);
    }
}
