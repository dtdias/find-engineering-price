module.exports = (aditions, source, mutable = {}) => {
    const reference = mutable;
    for (const adition of aditions) if (source[adition]) reference[adition] = source[adition];
    return reference;
}