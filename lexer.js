import {Tokenizer} from "./tokenizer.js";
const states = {
      "String": "String",
      Code: "Code",
      Comment: "Comment",
      Block: "Block",
      Regex: "Regex",
      Parentheses: "Parentheses",
    };

function nodeFactory(type){
  return {
    children: [],
    whiteSpaces: {},
    type,
  };
}
export class Lexer {
  _currentNode = nodeFactory(states.Code);
  get currentNode(){
    if(!this._currentNode){
      throw new Error(`currentNode is ${value}. token at ${this.tokenCount}`)
    }
    return this._currentNode;
  }
  set currentNode(value){
    this._currentNode = value;
  }
  nodeStack = [];
  tokenCount = 0;
  init(){
   this.currentNode = nodeFactory(states.Code); 
    this.nodeStack = [];
    this.tokenCount = 0;
  }
  /**
   * @param {string}
  */
  parse(code){
    const tokenizer = new Tokenizer();
    tokenizer.tokenize(code);
    let token = tokenizer.next();
    
    while(token !== null){
      this.tokenCount++;
      this.goToState(token);
      token = tokenizer.next();
    }
    while(this.nodeStack.length > 0){
      const childNode = this.currentNode;
      this.popNode();
      this.currentNode.children.push(childNode);
    }
    console.log(this.tokenCount,this.currentNode)
  }
  goToState(token){
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
        default:
          throw new Error(`State not implemented: ${currentState}`);
      }

  }
  pushNode(){
    this.nodeStack.push(this.currentNode);
    this.currentNode = null;
  }
  popNode(){
    this.currentNode = this.nodeStack.pop();
  }
  codeState(token) {
    this.expressionContext(token);
  }
  stringState(token) {
    const self = this.currentNode;
    const {
      delimiter,
      escaped
    } = self;
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
    currentNode.children.push(token);
  }
  commentState(token) {
    const self = this.currentNode;
    if(token === "\n"){
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
  
  regexState(token){
    const self = this.currentNode;
    const { regexType, escaped } = self;
    if(token === "\\"){
      self.escaped = !escaped;
    }
    if(regexType === "s"){
      const {replacement} = self;
      if(token === "/" && !escaped){
        if(replacement === null){
          self.replacement = "";
        }
        else {
          this.popNode();
          this.currentNode.children.push(self);
        }
        return;
      }
      if(self.replacement === null){
        self.pattern += token;
      }
      else{
        self.replacement += token;
      }
    }
    else {
      if(token === "/" && !escaped){
        this.popNode();
        this.currentNode.children.push(self);
        return;
      }
      self.pattern += token;
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
        escaped: false,
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
    case String.raw`s\/`:
      this.pushNode();
      this.currentNode = {
        ...nodeFactory(states.Regex),
        regexType: "s",
        pattern: "",
        replacement: null,
        escaped: false,
      };
      break;
    case String.raw`m\/`:
      this.pushNode();
      this.currentNode = {
        ...nodeFactory(states.Regex),
        pattern: "",
        regexType: "m",
        escaped: false,
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
      const length = this.currentNode.children.length +
      Object.keys(this.currentNode.whiteSpaces).length;
      this.currentNode.whiteSpaces[length] = token;
      return;
    }
    this.currentNode.children.push(token);
  } 
  
}