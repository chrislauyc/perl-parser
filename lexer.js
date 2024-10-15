const states = {
      "String": "String",
      Code: "Code",
      Comment: "Comment",
      Block: "Block",
      Regex: "Regex",
      Parentheses: "Parentheses",
    };
function getBaseNode(){
  return {
    children: [],
    whiteSpaces: {},
  };
}
export class Lexer {
  currentNode = {
      children: [],
      type: states.Code,
    };
  nodeStack = [];
  /**
   * @param {string}
  */
  parse(code){
    
  }
  goToState(token){
    switch (this.currentState) {
        case states.String: {
          stringState(token);
          break;
        }
        case states.Code: {
            codeState(token);
            break;
          }
        case states.Comment: {
            commentState(token);
            break;
          }
        case states.Block: {
            blockState(token);
            break;
          }
        case states.Regex: {
            blockState(token);
            break;
          }
        
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
    switch (token) {
    case "\n": {
        this.popNode();
        this.currentNode.children.push(self);
        break;
      }
    }
    currentNode.children.push(token);
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
  //TODO: implement regexState
  regexState(token){
    const self = this.currentNode;
    const { regexType, escaped } = self;
    if(regexType === "s"){
      const {replacement} = self;
      switch(token){
        case "/":{
          if(!escaped){
            if(replacement === null){
              self.replacement = "";
            }
            else {
              this.popNode();
              this.currentNode.children.push(self);
            }
          }
          else{
            if(replacement === null){
              self.pattern += token;
            }
            else{
              self.replacement += token;
            }
          }
          break;
        }
        default:{
          
        }
      }
    }
    switch(token){
      case "/":{
        if(!escaped){
          
          else {
            this.popNode();
            
          }
        }
        break;
      }
    }
  }
  expressionContext(token) {
    let stateChanged = true;
    switch (token) {
    case "'":
    case '"':
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.String,
        delimiter: token,
        escaped: false,
      };
      break;
    case "#":
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.Comment,
      };
      break;
    case "{":
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.Block,
      };
      break;
    case "(":
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.Parentheses,
      };
      break;
    case String.raw`s\/`:
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.Regex,
        regexType: "s",
        pattern: "",
        replacement: null,
        escaped: false,
      };
      break;
    case String.raw`m\/`:
      this.pushNode();
      this.currentNode = {
        ...getBaseNode(),
        type: states.Regex,
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
      Object.keys(currentNode.whiteSpaces).length;
      this.currentNode.whiteSpaces[length] = token;
      return;
    }
    this.currentNode.children.push(token);
  } 
  
}