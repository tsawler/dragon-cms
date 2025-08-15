// Simple test version of snippets
console.log('Loading simple snippets...');

const SIMPLE_SNIPPETS = {
    blocks: [
        {
            id: 'container-block',
            name: 'Container Block',
            type: 'block',
            preview: 'text',
            html: '<div class="content-container"></div>'
        }
    ],
    snippets: [
        {
            id: 'heading-snippet',
            name: 'Heading',
            type: 'snippet',
            snippetType: 'text',
            preview: 'text',
            html: '<h2>Your Heading Here</h2>'
        }
    ]
};

window.getBlocks = function() {
    console.log('getBlocks called, returning:', SIMPLE_SNIPPETS.blocks);
    return SIMPLE_SNIPPETS.blocks;
};

window.getSnippets = function() {
    console.log('getSnippets called, returning:', SIMPLE_SNIPPETS.snippets);
    return SIMPLE_SNIPPETS.snippets;
};

console.log('Simple snippets loaded successfully');