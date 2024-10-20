export function displayNode(node, type) {
  if (typeof node === "string") {
    return displayToken(node, type);
  } else {
    const children = [];
    node.children
    .forEach(child => {
      for (let el of displayNode(child, node.type)) {
        children.push(el);
      }
    });
    return children;
  }
}

function displayToken(token, className) {
  const segments = token.split("\n");
  return segments.map((segment, i) => {
    const span = document.createElement("span");
    span.textContent = segment;
    span.classList.add(className?.toLowerCase() || "");
    if (i !== segments.length - 1) {
      span.appendChild(document.createElement("br"));
    }
    return span;
  });
};