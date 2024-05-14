const elementMaker = (type, text = "", id) => {
    const element = document.createElement(type);
    element.textContent = text;
    element.id = id;
    return element;
};