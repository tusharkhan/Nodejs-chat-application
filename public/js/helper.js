let createMessage = (user, text) => {
    return {
        username: user.username,
        id: user.id,
        room: user.room,
        text: text,
        createdAt: new Date().getTime()
    }
}

module.exports = {createMessage};