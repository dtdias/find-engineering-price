module.exports = (response, fields) => {
    const unexistenceReference = ['null', 'undefined'];
    const isValidField = (field) => !!field || !unexistenceReference.includes(field)
    for (const field of fields) {
        const isNotValid = !isValidField(field)
        if (isNotValid) {
            response.status(400).json({ message: 'Missing required fields' });
        }
        return !isNotValid
    }
}