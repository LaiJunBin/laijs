function getParentNo(node) {
    if (node.dataset === undefined)
        return -1;

    if (node.dataset.no)
        return +node.dataset.no;

    return getParentNo(node.parentNode);
}

function getNodeVariable(instance, index, key) {
    if (index == -1 || index === undefined)
        return null;

    if (instance.nodes[index].variables[key] !== undefined)
        return instance.nodes[index].variables[key]

    return getNodeVariable(instance, instance.nodes[index].parentIndex, key);
}

Directive.create('for', ({
    parent,
    node,
    instance,
    value,
    deleteNodes
}) => {
    let params = value.split(' of ').map(x => x.trim()).filter(x => x != "");
    let regExp = new RegExp('\{\{(.*)\}\}', 'g');

    let index = +node.dataset.no || -1;
    let items = getNodeVariable(instance, index, params[1]) || instance[params[1]];
    if (items === undefined)
        throw new Error(`*for="${value}" ${params[1]} is undefined.`)

    for (let item of items) {
        let cloneNode = node.cloneNode(true);
        cloneNode.dataset.no = instance.nodes.length;
        instance.nodes[instance.nodes.length] = {
            variables: {},
            parentIndex: getParentNo(parent)
        };
        let index = +cloneNode.dataset.no;
        instance.nodes[index].variables[params[0]] = item;
        let matches = Array.from(cloneNode.textContent.matchAll(regExp));
        for (let i = 0; i < matches.length; i++) {
            if (instance.nodes[index].variables[matches[i][1].trim()] !== undefined)
                cloneNode.innerHTML = cloneNode.innerHTML.replace(matches[i][0], item);
        }
        parent.appendChild(cloneNode);
    }

    deleteNodes.push(node);
});