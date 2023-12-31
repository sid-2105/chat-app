const users=[]

const addUser =({id,username,room})=>{

    //clean the data
    username=username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error:'Username and room are required'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username ===username
    })

    //validate username
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //store user
    
    const user = {id, username, room}
    users.push(user)
    return {user}

}

const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id===id)

    if(index!== -1){
        return users.splice(index,1)[0]
    }
}

//console.log(users)

const getUser = (id) =>{
    return users.find((user)=>user.id === id)
    // const index = users.findIndex((user) => user.id===id)

    // if(index!== -1){
    //     return users[index]
    // }
}

const getUserInRoom = (room) =>{
    return users.filter((user)=>user.room === room)
}

module.exports = {
    getUser,
    getUserInRoom,
    removeUser,
    addUser
}
