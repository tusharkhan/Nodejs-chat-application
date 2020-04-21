let createMessage = (text) => {
    return {
        text: text,
        createdAt: new Date().getTime()
    }
}

module.exports = {createMessage};