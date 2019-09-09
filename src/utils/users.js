
const users = []

const addUser = ({ id, username, room}) => {

    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data

    if(!username || !room)
    {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user
                                // any var
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username  // return true if the following condition is satisfied.
    })

    // validate username

    if(existingUser)
    {
        return {
            error: 'The username is already taken!'
        }
    }

    // store user

    const user = { id, username, room}
    users.push(user)

    return { user }

}


const removeUser = (id) => {
    // filter can be used here but findIndex is much faster since it stops as soon as a match is found
    const index = users.findIndex((user)=>{ // returns index -1 if not present else returns a positive value, which is the index.
        return user.id === id
    })

    if(index !==-1)
    {
        return users.splice(index,1)[0] // remove the item -> we get an array of size 1 consisting the user removed so [0].
    }
}

const getUser = (id) => {
   return users.find((user)=>{
        return user.id === id
   })
}


const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user)=>{
        return user.room === room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
