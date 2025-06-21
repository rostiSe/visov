export const mockProfile = [
    {
        id: "1",
        username: "Fire-Serpent",
        email: "fire-serpent@gmail.com",
        password: "123456",
        profilePicture: "https://via.placeholder.com/150",
        bio: "I am a fire serpent",
        location: "Fire-Serpent-Land",
        friends: ["2", "3", "4", "5"],
        matches: ["6", "7", "8", "9"],
        groups: ["10", "11", "12", "13"]
    },
    {
        id: "2",
        username: "Water-Dragon",
        email: "water-dragon@gmail.com",
        password: "123456",
        profilePicture: "https://via.placeholder.com/150",
        bio: "I am a water dragon",
        location: "Water-Dragon-Land",
        groups: ["12", "13"],
    },
    {
        id: "3",
        username: "Earth-Turtle",
        email: "earth-turtle@gmail.com",
        password: "123456",
        profilePicture: "https://via.placeholder.com/150",
        bio: "I am a earth turtle",
        location: "Earth-Turtle-Land",
        groups: ["10", "11"],
    },
]

export const mockGroups = [
    {
        id: "1",
        name: "Group 1",
        description: "Group 1 description",
        members: ["1", "3"],
    },
    {
        id: "2",
        name: "Group 2",
        description: "Group 2 description",
        members: ["1"],
    },
    {
        id: "3",
        name: "Group 3",
        description: "Group 3 description",
        members: ["1", "2", "3"],
    }
]

export const mockMessages = [
    {
        id: "1",
        content: "Hello, how are you?",
        sender: "1",
        receiver: "2",
        group: "2",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "2",
        content: "I am fine, thank you!",
        sender: "2",
        receiver: "1",
        group: "1",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "3",
        content: "What are you doing?",
        sender: "1",
        receiver: "2",
        group: "1",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "4",
        content: "I am doing nothing, you?",
        sender: "2",
        receiver: "1",
        group: "1",
        createdAt: new Date(),
        updatedAt: new Date()
    },
]

export const mockQuestions = [
    {
        id: "1",
        question: "What is your name?",
        answer: "John Doe",
        createdAt: new Date(),
        startAt: "20.6.2025, 17:25:01",
        endAt: "21.6.2025, 17:25:01",
    },
    {
        id: "2",
        question: "What is your age?",
        answer: "John Doe",
        createdAt: new Date(),
        startAt: "20.6.2025, 17:25:01",
        endAt: "21.6.2025, 17:25:01",
    }
]

export type Group = {
    id: string;
    name: string;
    description: string;
    members: string[];
}
export type Message = {
    id: string;
    content: string;
    sender: string;
    receiver: string;
    group: string;
    createdAt: Date;
    updatedAt: Date;
}
export type Profile = {
    id: string;
    username: string;
    email: string;
    password: string;
    profilePicture: string;
    bio: string;
    location: string;
    friends: string[];
}