var users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (! username || ! room) {
        return {
            error: 'Username and room required'
        }
    }

    let checkExistingUser = users.find(user => {
        return ( ( user.username === username ) || ( users.room === room ) );
    })

    if (checkExistingUser) {
        return {
            error: 'Username exist'
        }
    }

    let user = {id, username, room};;

    users.push(user);

    return {user};
}


const removeUser = (id) => {
    let index = users.findIndex( user => user.id === id );

    if (index !== -1) return users.splice(index, 1)[0];
}


const getUser = (id) => {
    return users.find( user => {
        if (( user.id === id )) {
            return user;
        }
     });
}


const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter( user => user.room === room );
}


module.exports = {
    addUser, 
    removeUser, 
    getUsersInRoom, 
    getUser
}