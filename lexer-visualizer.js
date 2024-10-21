export function displayNode(node, type) {
    if (typeof node === "string") {
        return displayToken(node, type);
    } else {
        const children = [];
        node.children.forEach(child => {
            for (let el of displayNode(child, node.type)) {
                children.push(el);
            }
        });
        return displayNodeWithType(node, children);
    }
}

function displayNodeWithType(node, children) {
    switch (node.type) {
        case "String": {
            const { delimiter } = node;
            return [delimiter, ...children, delimiter];
        }
        case "Comment": {
            return ["#", ...children, "\n"];
        }
        case "Block": {
            return ["{", ...children, "}"];
        }
        case "Regex": {
            const { pattern, replacement } = node;
            const ret = ["/", ...displayToken(pattern.join(""), "regex"), "/"];
            if (replacement !== null) {
                ret.push(...displayToken(replacement.join(""), "regex"), "/");
            }
            return ret;
        }

        case "Parentheses": {
            return ["(", ...children, ")"];
        }
        default: {
            return children;
        }
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
}
