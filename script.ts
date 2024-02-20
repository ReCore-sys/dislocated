import $ from "jquery";
import type { ScaleDrone } from "scaledrone-node";
import {
    getCookie,
    Message,
    MessageType,
    cookieExists,
    Member,
    InfoType,
    genRandomString,
    lsSet,
    lsGet,
    isUrl,
    isImgUrl,
} from "./utils.mts";
import log from "loglevel";

log.enableAll();
// PS! Replace this with your own channel ID
// If you use this channel ID your app will stop working in the future
const CLIENT_ID = "pa0nx7j9A5pvcC3f";

if (!(cookieExists("username") && cookieExists("uuid"))) {
    window.location.href = "./index.html";
}

// @ts-ignore
const drone = new ScaleDrone(CLIENT_ID, {
    data: {
        // Will be sent out as clientData via events
        name: getCookie("username")!,
        color: getRandomColor(),
    },
});

if (lsGet("pfp")) {
    $("#pfp_link").val(lsGet("pfp") as string);
}

var self_user: Member = {
    name: getCookie("username")!,
    color: getRandomColor(),
    uuid: getCookie("uuid")!,
    pfp: lsGet("pfp") || "",
};

let user_pfp: { [key: string]: string } = {};

let members: Member[] = [];

let messageList: Message[] = [];

$("#username_display")
    .text(getCookie("username")!)
    .css("color", self_user.color);

drone.on("open", (error: any) => {
    if (error) {
        return log.error(error);
    }
    const past_chats = JSON.parse(lsGet("past_chats") || "[]");
    for (let i = 0; i < past_chats.length; i++) {
        const message = past_chats[i];
        createMessageElement(message);
        messageList.push(message);
    }
    log.info("Successfully connected to Scaledrone");
    const room = drone.subscribe("observable-room");
    room.on("open", (error: any) => {
        if (error) {
            return log.error(error);
        }
        log.info("Successfully joined room");
        if (members.some((member) => member.uuid === getCookie("uuid")!)) {
            return;
        }
    });

    $("#change_pfp").on("click", () => {
        const link = $("#pfp_link").val();
        if (link === "") {
            return;
        }
        const self_clone = JSON.parse(JSON.stringify(self_user)) as Member;
        self_user.pfp = link as string;
        lsSet("pfp", link as string);
        const message: Message = {
            member: self_user,
            message: JSON.stringify(self_clone),
            message_type: MessageType.INFO,
            infoType: InfoType.UPDATE_MEMBER,
            msg_id: genRandomString(),
        };
        sendMessage(message);
    });

    room.on("member_leave", ({ id }) => {});

    room.on("data", (text: string, member: any) => {
        const data: Message = JSON.parse(text);
        log.info("Received message", data);
        switch (data.message_type) {
            case MessageType.JOIN: {
                user_pfp[member.id] = data.member.pfp;
            }
            case MessageType.INFO: {
                switch (data.infoType) {
                    case InfoType.MEMBER_LIST: {
                        members = JSON.parse(data.message);
                        break;
                    }
                    case InfoType.UPDATE_MEMBER: {
                        const old = JSON.parse(data.message);
                        const new_member = data.member;
                        members = members.map((member) => {
                            if (member.uuid === old.uuid) {
                                return new_member;
                            }
                            return member;
                        });
                        for (let i = 0; i < messageList.length; i++) {
                            if (messageList[i].member.uuid === old.uuid) {
                                messageList[i].member = new_member;
                            }
                        }
                        const old_past_chats = JSON.parse(
                            lsGet("past_chats") || "[]"
                        );
                        const new_past_chats = old_past_chats.map(
                            (message: Message) => {
                                if (message.member.uuid === old.uuid) {
                                    message.member = new_member;
                                }
                                return message;
                            }
                        );
                        lsSet("past_chats", JSON.stringify(new_past_chats));
                        $("#messages").empty();
                        messageList.forEach((message) => {
                            createMessageElement(message);
                        });
                    }
                }

                break;
            }
            case MessageType.CHAT: {
                if (member) {
                    var past_chats = lsGet("past_chats") || "[]";
                    var parsed = JSON.parse(past_chats);
                    parsed.push(data);
                    lsSet("past_chats", JSON.stringify(parsed));
                    createMessageElement(data);
                    break;
                } else {
                    // Message is from server
                }
            }
            case MessageType.IMAGE: {
                var past_chats = lsGet("past_chats") || "[]";
                var parsed = JSON.parse(past_chats);
                parsed.push(data);
                lsSet("past_chats", JSON.stringify(parsed));
                createMessageElement(data);
                break;
            }
        }
    });

    $("#message_input").on("keyup", (e) => {
        if (e.key === "Enter") {
            sendMessageFromInput();
        }
    });
    $("#send_message").on("click", sendMessageFromInput);
});

drone.on("close", (event: any) => {
    log.info("Connection was closed", event);
});

drone.on("error", (error: any) => {
    console.error(error);
});

function getRandomColor() {
    return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}
//------------- DOM STUFF

function sendMessage(message: Message) {
    log.info("Sending message", message);
    drone.publish({
        room: "observable-room",
        message: JSON.stringify(message),
    });
}

function sendMessageFromInput() {
    const value = $("#message_input").val() as string;
    if (value === "") {
        return;
    }
    $("#message_input").val("");

    if (isUrl(value)) {
        isImgUrl(value).then((is_img) => {
            if (is_img) {
                const message: Message = {
                    member: self_user,
                    message: value,
                    message_type: MessageType.IMAGE,
                    msg_id: genRandomString(),
                };
                sendMessage(message);
            } else {
                const message: Message = {
                    member: self_user,
                    message: value,
                    message_type: MessageType.CHAT,
                    msg_id: genRandomString(),
                };
                sendMessage(message);
            }
        });
        return;
    } else {
        var message: Message = {
            member: self_user,
            message: value,
            message_type: MessageType.CHAT,
            msg_id: genRandomString(),
        };
        sendMessage(message);
    }
}

function createMessageElement(message: Message) {
    if (messageList.some((msg) => msg.msg_id === message.msg_id)) {
        return;
    }
    var img = "";
    if (message.member.pfp !== "") {
        img = `<img src="${message.member.pfp}" alt="pfp" class="pfp_msg">`;
    }
    var content = "";

    if (message.message_type === MessageType.IMAGE) {
        content = `<img src="${message.message}" alt="img" class="message_img">`;
    } else {
        content = `<div class="message_text">${message.message}</div>`;
    }
    const html = `<div class="message">
		${img}
		<div class="message_container">
		<div class="message_member" style="color: ${message.member.color}">${message.member.name}</div>
		${content}
		</div>
	</div>`;
    $("#messages").prepend(html);
}
