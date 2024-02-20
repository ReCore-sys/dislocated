// PS! Replace this with your own channel ID
// If you use this channel ID your app will stop working in the future
const CLIENT_ID = "pa0nx7j9A5pvcC3f";

if (!window.location.href.includes("?")) {
    window.location.href = "./index.html";
}
function encrypt(text, key) {
    return [...text]
        .map((x, i) =>
            (x.codePointAt() ^ key.charCodeAt(i % key.length) % 255)
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}
function decrypt(text, key) {
    return String.fromCharCode(
        ...text
            .match(/.{1,2}/g)
            .map(
                (e, i) => parseInt(e, 16) ^ key.charCodeAt(i % key.length) % 255
            )
    );
}

const parent_path = window.location.pathname.split("/").slice(0, -1).join("/");

const data_chunk = decrypt(window.location.href.split("?")[1], parent_path);

const username = data_chunk.split("&")[0];
const uuid = data_chunk.split("&")[1];

const drone = new ScaleDrone(CLIENT_ID, {
    data: {
        // Will be sent out as clientData via events
        name: username,
        color: getRandomColor(),
    },
});

let members = [];

drone.on("open", (error) => {
    if (error) {
        return console.error(error);
    }
    console.log("Successfully connected to Scaledrone");
    const room = drone.subscribe("observable-room");
    room.on("open", (error) => {
        if (error) {
            return console.error(error);
        }
        console.log("Successfully joined room");
    });
    room.on("members", (m) => {
        members = m;
        updateMembersDOM();
    });
    room.on("member_join", (member) => {
        members.push(member);
        updateMembersDOM();
    });

    room.on("member_leave", ({ id }) => {
        const index = members.findIndex((member) => member.id === id);
        members.splice(index, 1);
        updateMembersDOM();
    });

    room.on("data", (text, member) => {
        if (member) {
            addMessageToListDOM(text, member);
        } else {
            // Message is from server
        }
    });
});

drone.on("close", (event) => {
    console.log("Connection was closed", event);
});

drone.on("error", (error) => {
    console.error(error);
});

function getRandomName() {
    var person = prompt("Please enter your name");
    if (person == null || person == "") {
        txt = "Prompt cancelled. Please refresh.";
    } else {
        return person;
    }
}

function getRandomColor() {
    return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

// Code for switching between stylesheets- while a version that uses inputs would be more efficient, this is easier to code
function tamper() {
    document.getElementById("pagestyle").setAttribute("href", "tamper.css");
    document.getElementById("image").setAttribute("src", "tamper.png");
    document.getElementById("icon").setAttribute("href", "tamper.png");
    document.getElementsByTagName("h1")[0].innerHTML = "DISLOCATED";
    document.getElementById("client").innerHTML = "PowerCarapace v1.3.2 ";
}

function knockoffDark() {
    document
        .getElementById("pagestyle")
        .setAttribute("href", "knockoff-dark.css");
    document.getElementById("image").setAttribute("src", "knockoff.png");
    document.getElementById("icon").setAttribute("href", "knockoff.png");
    document.getElementsByTagName("h1")[0].innerHTML = "DISLOCATED";
    document.getElementById("client").innerHTML = "Default 1.7.2 (Dark)";
}

function worse() {
    document.getElementById("pagestyle").setAttribute("href", "worse.css");
    document.getElementById("image").setAttribute("src", "knockoff.png");
    document.getElementById("icon").setAttribute("href", "knockoff.png");
    document.getElementsByTagName("h1")[0].innerHTML = "DISLOCATED";
    document.getElementById("client").innerHTML = "Default 1.7.2 (Worse)";
}

function knockoffLight() {
    document
        .getElementById("pagestyle")
        .setAttribute("href", "knockoff-light.css");
    document.getElementById("image").setAttribute("src", "knockoff.png");
    document.getElementById("icon").setAttribute("href", "knockoff.png");
    document.getElementsByTagName("h1")[0].innerHTML = "DISLOCATED";
    document.getElementById("client").innerHTML = "Default 1.7.2 (Light)";
}

function classic() {
    document.getElementById("pagestyle").setAttribute("href", "classic.css");
    document.getElementById("image").setAttribute("src", "null.png");
    document.getElementById("icon").setAttribute("href", "null.png");
    document.getElementsByTagName("h1")[0].innerHTML = "DISLOCATED";
    document.getElementById("client").innerHTML = "Classic v1.5";
}

function communism() {
    document.getElementById("pagestyle").setAttribute("href", "communism.css");
    document.getElementById("image").setAttribute("src", "communism.png");
    document.getElementById("icon").setAttribute("href", "communism.png");
    document.getElementsByTagName("h1")[0].innerHTML = "потерявших";
    document.getElementById("client").innerHTML = "За Родину";
}

//------------- DOM STUFF

const DOM = {
    membersCount: document.querySelector(".members-count"),
    membersList: document.querySelector(".members-list"),
    messages: document.querySelector(".messages"),
    input: document.querySelector(".message-form__input"),
    form: document.querySelector(".message-form"),
};

DOM.form.addEventListener("submit", sendMessage);

function sendMessage() {
    const value = DOM.input.value;
    if (value === "") {
        return;
    }

    DOM.input.value = "";

    drone.publish({
        room: "observable-room",
        message: value,
    });
}

function createMemberElement(member) {
    const { name, color } = member.clientData;
    const el = document.createElement("div");
    el.appendChild(document.createTextNode(name));
    el.className = "member";
    el.style.color = color;
    return el;
}

function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length} currently online. Click here for alternate clients, credits and more!`;
    DOM.membersList.innerHTML = "";
    members.forEach((member) =>
        DOM.membersList.appendChild(createMemberElement(member))
    );
}

function createMessageElement(text, member) {
    const el = document.createElement("p");
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = "message";
    return el;
}

function addMessageToListDOM(text, member) {
    const el = DOM.messages;
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
    el.appendChild(createMessageElement(text, member));
    if (wasTop) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
    }
}
