Directive.create('href', ({
    node,
    value
}) => {
    if (node.nodeName !== 'A') {
        throw new Error(`Directive Error! ${node.nodeName} can't set *href, only <a> can set *href directive.`);
    }

    let href = url(`/#/${uriTrimSlash(value)}`);
    node.href = href;
    node.addEventListener('click', function (e) {
        location.href = this.href;
        e.preventDefault();
    });
});