const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const numbers = rawInput.split(/ /).map(n => parseInt(n));

function parseNode(numbers, nodeStartIndex) {
  const childrenCount = numbers[nodeStartIndex];
  const metadataEntryCount = numbers[nodeStartIndex + 1];

  const childNodes = [];
  const metadataEntries = [];

  // if there are NO children, this leaves us on the index of
  // the first metadata entry (of which there is always at least 1)
  let lastIndex = nodeStartIndex + 2;

  // if there ARE children, recursively parse each child node starting here,
  // and ultimately end with the last parsed index of the last child node + 1
  for (let i = 0; i < childrenCount; i++) {
    const resp = parseNode(numbers, lastIndex);
    childNodes.push(resp.node);
    lastIndex = resp.lastIndex + 1;
  }

  // parse metadata, but only increment last index if there's more to parse.
  // otherwise leave it, so we can return the final index of this node.
  for (let i = 0; i < metadataEntryCount; i++) {
    const meta = numbers[lastIndex];
    metadataEntries.push(meta);

    if (i < metadataEntryCount - 1) {
      lastIndex++;
    }
  }

  // return both the node and the lastIndex we ended on (the last index end of this parsed node)
  return {
    node: {
      childNodes,
      metadataEntries
    },
    lastIndex
  }
}

function buildTree(numbers) {
  return parseNode(numbers, 0).node;
}

function sumTreeMetadata(node) {
  const nodeMetaSum = node.metadataEntries.reduce((sum, metadataEntry) => sum + metadataEntry, 0);
  const childMetaSum = node.childNodes.reduce((sum, childNode) => sum + sumTreeMetadata(childNode), 0);
  return nodeMetaSum + childMetaSum;
}

function nodeValue(node) {
  if (node.childNodes.length === 0) {
    return node.metadataEntries.reduce((sum, metadataEntry) => sum + metadataEntry, 0);
  } else {
    return node.metadataEntries.reduce((value, metadataEntry) => {
      const childIndex = metadataEntry - 1;

      if (childIndex >= 0 && childIndex < node.childNodes.length) {
        return value + nodeValue(node.childNodes[childIndex]);
      } else {
        return value;
      }
    }, 0);
  }
}

const root = buildTree(numbers);
const sum = sumTreeMetadata(root);
console.log(`Star 1 - Sum of tree metadata: ${sum}`);

const rootValue = nodeValue(root);
console.log(`Star 2 - Root node's value: ${rootValue}`);
